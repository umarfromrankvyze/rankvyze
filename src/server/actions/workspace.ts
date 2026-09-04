"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, verifyPassword, hashPassword } from "@/lib/auth";
import { extractDomain } from "@/lib/utils";
import {
  changePasswordSchema,
  competitorSchema,
  flattenErrors,
  profileSchema,
  promptSchema,
  websiteSettingsSchema,
} from "@/lib/validation";
import { assertWebsiteAccess, buildReportSnapshot, WEBSITE_COOKIE } from "@/server/queries";
import { applyChange } from "@/lib/delivery";
import { fail, succeed, type ActionResult } from "@/server/types";
import type { CodeChangeStatus, ContentStatus, IssueStatus, OptimizationStatus } from "@/lib/enums";

async function ctx(websiteId: string) {
  const user = await requireUser();
  const website = await assertWebsiteAccess(user.id, websiteId);
  return { user, website };
}

function revalidateDashboard() {
  revalidatePath("/dashboard", "layout");
}

// ------------------------------------------------------------------ website

export async function switchWebsite(websiteId: string) {
  const user = await requireUser();
  await assertWebsiteAccess(user.id, websiteId);
  const jar = await cookies();
  jar.set(WEBSITE_COOKIE, websiteId, { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  revalidateDashboard();
}

// ------------------------------------------------------------------ prompts

export async function createPrompt(websiteId: string, input: Record<string, string>): Promise<ActionResult> {
  const parsed = promptSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  await ctx(websiteId);

  const count = await db.prompt.count({ where: { websiteId, isActive: true } });
  if (count >= 100) return fail("You've reached the 100 tracked prompt limit for this plan.");

  await db.prompt.create({
    data: { websiteId, text: parsed.data.text, category: parsed.data.category || null, intent: parsed.data.intent, priority: parsed.data.priority },
  });
  revalidateDashboard();
  return succeed(undefined, "Prompt added. It will be included in the next research run.");
}

export async function updatePrompt(websiteId: string, promptId: string, input: Record<string, string>): Promise<ActionResult> {
  const parsed = promptSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  await ctx(websiteId);
  await db.prompt.update({
    where: { id: promptId, websiteId },
    data: { text: parsed.data.text, category: parsed.data.category || null, intent: parsed.data.intent, priority: parsed.data.priority },
  });
  revalidateDashboard();
  return succeed(undefined, "Prompt updated.");
}

export async function togglePrompt(websiteId: string, promptId: string, isActive: boolean): Promise<ActionResult> {
  await ctx(websiteId);
  await db.prompt.update({ where: { id: promptId, websiteId }, data: { isActive } });
  revalidateDashboard();
  return succeed(undefined, isActive ? "Prompt tracking resumed." : "Prompt paused.");
}

export async function deletePrompt(websiteId: string, promptId: string): Promise<ActionResult> {
  await ctx(websiteId);
  await db.prompt.delete({ where: { id: promptId, websiteId } });
  revalidateDashboard();
  return succeed(undefined, "Prompt removed.");
}

// -------------------------------------------------------------- competitors

export async function addCompetitor(websiteId: string, input: Record<string, string>): Promise<ActionResult> {
  const parsed = competitorSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  await ctx(websiteId);

  const domain = extractDomain(parsed.data.domain);
  const existing = await db.competitor.findUnique({ where: { websiteId_domain: { websiteId, domain } } });
  if (existing) return fail("That competitor is already tracked.", { domain: "Already tracked" });

  const count = await db.competitor.count({ where: { websiteId } });
  if (count >= 10) return fail("You can track up to 10 competitors on this plan.");

  await db.competitor.create({ data: { websiteId, name: parsed.data.name, domain, url: `https://${domain}` } });
  revalidateDashboard();
  return succeed(undefined, `${parsed.data.name} is now tracked.`);
}

export async function removeCompetitor(websiteId: string, competitorId: string): Promise<ActionResult> {
  await ctx(websiteId);
  await db.competitor.delete({ where: { id: competitorId, websiteId } });
  revalidateDashboard();
  return succeed(undefined, "Competitor removed.");
}

// ------------------------------------------------------------------- issues

export async function setIssueStatus(websiteId: string, issueId: string, status: IssueStatus): Promise<ActionResult> {
  await ctx(websiteId);
  await db.aEOIssue.update({
    where: { id: issueId, websiteId },
    data: { status, resolvedAt: status === "FIXED" ? new Date() : null },
  });
  revalidateDashboard();
  return succeed(undefined, `Issue marked ${status.toLowerCase().replace("_", " ")}.`);
}

// ------------------------------------------------------------ optimizations

export async function setOptimizationStatus(websiteId: string, id: string, status: OptimizationStatus): Promise<ActionResult> {
  await ctx(websiteId);
  await db.optimization.update({
    where: { id, websiteId },
    data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
  });
  revalidateDashboard();
  return succeed(undefined, `Optimization ${status.toLowerCase().replace("_", " ")}.`);
}

/**
 * "Fix with AI": creates (or reuses) a code change job for the optimization
 * and queues it for the implementation workflow. V1 stops at READY_FOR_CLAUDE —
 * the job is picked up by RankVyze staff, who author the diff. The status
 * pipeline is identical to what an automated agent run will use.
 */
export async function requestFix(websiteId: string, optimizationId: string): Promise<ActionResult<{ codeChangeId: string }>> {
  await ctx(websiteId);
  const optimization = await db.optimization.findFirst({
    where: { id: optimizationId, websiteId },
    include: { issue: true, codeChanges: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!optimization) return fail("Optimization not found.");

  const existing = optimization.codeChanges[0];
  if (existing && !["REJECTED", "MERGED"].includes(existing.status)) {
    return succeed({ codeChangeId: existing.id }, "A fix for this optimization is already in progress.");
  }

  const website = await db.website.findUnique({ where: { id: websiteId }, include: { integrations: { where: { provider: "GITHUB" } } } });
  const last = await db.codeChange.findFirst({ where: { websiteId }, orderBy: { number: "desc" }, select: { number: true } });

  const change = await db.$transaction(async (tx) => {
    const created = await tx.codeChange.create({
      data: {
        websiteId,
        optimizationId,
        number: (last?.number ?? 100) + 1,
        title: optimization.title,
        summary: optimization.description,
        repository: website?.integrations[0]?.label ?? null,
        status: "READY_FOR_CLAUDE",
        instructions: [
          optimization.description,
          optimization.issue?.recommendedImplementation ? `\nRecommended implementation:\n${optimization.issue.recommendedImplementation}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        contextJson: JSON.stringify({
          websiteUrl: website?.url,
          issueId: optimization.issueId,
          issueTitle: optimization.issue?.title,
          pages: optimization.issue?.affectedPages ? JSON.parse(optimization.issue.affectedPages) : [],
        }),
      },
    });
    await tx.optimization.update({ where: { id: optimizationId }, data: { status: "IN_PROGRESS" } });
    if (optimization.issueId) {
      await tx.aEOIssue.update({ where: { id: optimization.issueId }, data: { status: "IN_PROGRESS" } });
    }
    return created;
  });

  revalidateDashboard();
  return succeed({ codeChangeId: change.id }, "Fix requested. It's queued for implementation.");
}

// ------------------------------------------------------------- code changes

export async function reviewCodeChange(websiteId: string, id: string, decision: "APPROVED" | "REJECTED"): Promise<ActionResult> {
  const { user } = await ctx(websiteId);
  const change = await db.codeChange.findFirst({ where: { id, websiteId } });
  if (!change) return fail("Code change not found.");
  if (change.status !== "AWAITING_REVIEW") return fail("Only changes awaiting review can be approved or rejected.");

  await db.$transaction(async (tx) => {
    await tx.codeChange.update({
      where: { id },
      data: { status: decision, reviewedAt: new Date(), reviewedById: user.id },
    });
    if (change.optimizationId) {
      await tx.optimization.update({
        where: { id: change.optimizationId },
        data: { status: decision === "APPROVED" ? "APPROVED" : "SUGGESTED" },
      });
    }
  });
  revalidateDashboard();
  return succeed(undefined, decision === "APPROVED" ? "Change approved." : "Change rejected.");
}

/**
 * Ship an approved change through whichever API route the site has connected.
 *
 * This used to synthesise a plausible-looking pull request URL from the change
 * number and mark the job merged, which meant the dashboard showed a link that
 * went nowhere. It now calls the provider's API for real and reports exactly
 * what came back — including the failures.
 */
export async function deliverChange(websiteId: string, id: string): Promise<ActionResult<{ reviewUrl: string | null }>> {
  await ctx(websiteId);
  const change = await db.codeChange.findFirst({ where: { id, websiteId }, include: { files: true } });
  if (!change) return fail("Code change not found.");
  if (change.status !== "APPROVED") return fail("Approve the change before delivering it.");

  const files = change.files.filter((f) => f.content !== null && f.content !== "");
  if (change.files.length > 0 && files.length === 0) {
    // Better an honest refusal than writing a diff to someone's repository as
    // though it were the file.
    return fail("This change has no final file content yet, so there is nothing to write. It needs to be generated first.");
  }

  const result = await applyChange(websiteId, {
    title: change.title,
    summary: change.summary ?? "",
    files: files.map((f) => ({ path: f.path, content: f.content! })),
  });

  if (!result.ok) return fail(result.error ?? result.detail);

  await db.codeChange.update({
    where: { id },
    data: {
      prUrl: result.reviewUrl ?? null,
      // "MERGED" would be a claim about the customer's repository that we are
      // in no position to make — we open the pull request, they merge it.
      status: result.live ? "MERGED" : "APPROVED",
    },
  });
  if (change.optimizationId && result.live) {
    await db.optimization.update({
      where: { id: change.optimizationId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  revalidateDashboard();
  return succeed({ reviewUrl: result.reviewUrl ?? null }, result.detail);
}

export async function setCodeChangeStatus(websiteId: string, id: string, status: CodeChangeStatus): Promise<ActionResult> {
  await ctx(websiteId);
  await db.codeChange.update({ where: { id, websiteId }, data: { status } });
  revalidateDashboard();
  return succeed();
}

// ------------------------------------------------------------------ content

export async function setContentStatus(websiteId: string, id: string, status: ContentStatus): Promise<ActionResult> {
  await ctx(websiteId);
  await db.contentOpportunity.update({
    where: { id, websiteId },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
  });
  revalidateDashboard();
  return succeed(undefined, `Marked as ${status.toLowerCase().replace("_", " ")}.`);
}

/**
 * "Generate content" produces a structured brief from the opportunity and the
 * website profile. It is deterministic (no model call) and is honest about
 * that in the UI — the brief is a starting point for a writer or a later LLM
 * integration.
 */
export async function generateContentBrief(websiteId: string, id: string): Promise<ActionResult<{ brief: string }>> {
  const { website } = await ctx(websiteId);
  const opp = await db.contentOpportunity.findFirst({ where: { id, websiteId } });
  if (!opp) return fail("Opportunity not found.");

  const brief = [
    `# ${opp.title}`,
    ``,
    `**Target prompt:** ${opp.targetPrompt ?? "—"}`,
    `**Format:** ${opp.contentType.replace("_", " ").toLowerCase()} · **Intent:** ${opp.intent.toLowerCase()} · **Potential:** ${opp.potential.toLowerCase()}`,
    ``,
    `## Why this matters`,
    `AI engines answer “${opp.targetPrompt ?? opp.title}” by citing pages that already frame the answer. ${website.name} currently has no page that does.`,
    ``,
    `## Positioning`,
    website.description ?? `${website.name} — describe the business in one sentence.`,
    ``,
    `## Audience`,
    website.targetAudience ?? "Describe the buyer this page is for.",
    ``,
    `## Outline`,
    `1. Direct answer in the first 60 words (the sentence an engine can quote).`,
    `2. Comparison or checklist table with 5–8 rows.`,
    `3. When ${website.name} is the right choice — and when it isn't.`,
    `4. Proof: case studies with outcomes, third-party mentions.`,
    `5. FAQ (5 questions) with FAQPage schema.`,
    ``,
    `## Notes`,
    opp.briefing ?? "",
  ].join("\n");

  await db.contentOpportunity.update({
    where: { id },
    data: { briefing: brief, status: opp.status === "IDEA" ? "PLANNED" : opp.status },
  });
  revalidateDashboard();
  return succeed({ brief }, "Content brief generated.");
}

// ------------------------------------------------------------------ reports

export async function generateReport(websiteId: string): Promise<ActionResult<{ reportId: string }>> {
  const { website } = await ctx(websiteId);
  const snapshot = await buildReportSnapshot(websiteId);
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);

  const report = await db.report.create({
    data: {
      organizationId: website.organizationId,
      websiteId,
      title: `${now.toLocaleString("en-US", { month: "long", year: "numeric" })} — AI Visibility Report`,
      periodStart: start,
      periodEnd: now,
      status: "READY",
      dataJson: JSON.stringify(snapshot),
    },
  });
  revalidateDashboard();
  return succeed({ reportId: report.id }, "Report generated.");
}

export async function deleteReport(websiteId: string, reportId: string): Promise<ActionResult> {
  await ctx(websiteId);
  await db.report.delete({ where: { id: reportId, websiteId } });
  revalidateDashboard();
  return succeed(undefined, "Report deleted.");
}

// ----------------------------------------------------------------- settings

export async function updateProfile(input: Record<string, string>): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidateDashboard();
  return succeed(undefined, "Profile updated.");
}

export async function changePassword(input: Record<string, string>): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record?.passwordHash) return fail("This account signs in with Google and has no password.");
  if (!(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return fail("Current password is incorrect.", { currentPassword: "Incorrect password" });
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return succeed(undefined, "Password changed.");
}

export async function updateWebsiteSettings(websiteId: string, input: Record<string, string>): Promise<ActionResult> {
  const parsed = websiteSettingsSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  await ctx(websiteId);

  const locations = parsed.data.targetLocations
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await db.website.update({
    where: { id: websiteId },
    data: {
      name: parsed.data.name,
      url: parsed.data.url,
      domain: extractDomain(parsed.data.url),
      industry: parsed.data.industry || null,
      description: parsed.data.description || null,
      targetAudience: parsed.data.targetAudience || null,
      productsService: parsed.data.productsServices || null,
      targetLocations: JSON.stringify(locations),
    },
  });
  revalidateDashboard();
  return succeed(undefined, "Website profile saved.");
}

/**
 * "Fix with AI" from an issue that has no optimization yet: create one from
 * the issue's recommendation, then queue it exactly like requestFix.
 */
export async function requestIssueFix(websiteId: string, issueId: string): Promise<ActionResult<{ codeChangeId: string }>> {
  await ctx(websiteId);
  const issue = await db.aEOIssue.findFirst({ where: { id: issueId, websiteId }, include: { optimizations: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!issue) return fail("Issue not found.");

  let optimization = issue.optimizations[0];
  if (!optimization) {
    const typeByCategory: Record<string, string> = {
      STRUCTURED_DATA: "SCHEMA",
      CONTENT: "CONTENT",
      TECHNICAL: "TECHNICAL",
      ENTITY: "ENTITY",
      AI_UNDERSTANDING: "ENTITY",
      AUTHORITY: "CONTENT",
    };
    optimization = await db.optimization.create({
      data: {
        websiteId,
        issueId,
        title: issue.title.replace(/^(No|Missing|Weak|Poor|Thin)\s+/i, (m) => (m.trim() === "No" || m.trim() === "Missing" ? "Add " : "Improve ")),
        description: issue.recommendedImplementation ?? issue.description,
        type: typeByCategory[issue.category] ?? "CONTENT",
        impactScore: issue.impactScore,
        effort: issue.severity === "LOW" ? "LOW" : "MEDIUM",
      },
    });
  }
  return requestFix(websiteId, optimization.id);
}
