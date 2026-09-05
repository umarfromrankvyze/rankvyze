"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { changeAwaitingReviewEmail, sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import {
  auditSchema,
  codeChangeSchema,
  contentOpportunitySchema,
  flattenErrors,
  issueSchema,
  optimizationSchema,
  researchResultSchema,
} from "@/lib/validation";
import { fail, succeed, type ActionResult } from "@/server/types";
import type { CodeChangeStatus, Plan } from "@/lib/enums";

function revalidateAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

// --------------------------------------------------------------- research

export async function createResearchSession(input: { websiteId: string; title: string; notes?: string }): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!input.websiteId) return fail("Choose a website.", { websiteId: "Required" });
  if (!input.title?.trim()) return fail("Give the session a title.", { title: "Required" });

  const session = await db.researchSession.create({
    data: { websiteId: input.websiteId, ownerId: admin.id, title: input.title.trim(), notes: input.notes?.trim() || null },
  });

  // The first session for a running engagement is its baseline: it fixes the
  // prompt set the guarantee will be judged on, so it can't be gamed later.
  const engagement = await db.engagement.findFirst({
    where: { websiteId: input.websiteId, status: { in: ['ACTIVE', 'MET'] }, baselineSessionId: null },
  });
  if (engagement) {
    const prompts = await db.prompt.findMany({ where: { websiteId: input.websiteId, isActive: true }, select: { id: true } });
    await db.engagement.update({
      where: { id: engagement.id },
      data: { baselineSessionId: session.id, lockedPromptsJson: JSON.stringify(prompts.map((p) => p.id)) },
    });
  }

  revalidateAll();
  return succeed({ id: session.id }, "Research session created.");
}

export async function completeResearchSession(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.researchSession.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date() } });
  revalidateAll();
  return succeed(undefined, "Session marked complete.");
}

export async function reopenResearchSession(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.researchSession.update({ where: { id }, data: { status: "IN_PROGRESS", completedAt: null } });
  revalidateAll();
  return succeed(undefined, "Session reopened.");
}

/**
 * Save one manually-observed result. Also derives Citation and
 * CompetitorMention rows so the customer dashboard updates immediately.
 */
export async function saveResearchResult(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = researchResultSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;

  if (d.mentioned && !d.position) return fail("Enter the position when the brand is mentioned.", { position: "Required when mentioned" });
  if (d.cited && !d.citationUrl) return fail("Enter the cited URL.", { citationUrl: "Required when cited" });

  const [website, competitors] = await Promise.all([
    db.website.findUnique({ where: { id: d.websiteId }, select: { domain: true } }),
    db.competitor.findMany({ where: { websiteId: d.websiteId } }),
  ]);
  if (!website) return fail("Website not found.");

  const checkedAt = new Date();
  const result = await db.$transaction(async (tx) => {
    const created = await tx.aIResearchResult.create({
      data: {
        websiteId: d.websiteId,
        promptId: d.promptId,
        engineId: d.engineId,
        sessionId: d.sessionId || null,
        mentioned: d.mentioned,
        position: d.mentioned ? d.position : null,
        cited: d.cited,
        citationUrl: d.cited ? d.citationUrl : null,
        citedPagePath: d.cited && d.citationUrl ? safePath(d.citationUrl) : null,
        sentiment: d.mentioned ? d.sentiment : null,
        answerSummary: d.answerSummary || null,
        notes: d.notes || null,
        screenshotUrl: d.screenshotUrl || null,
        source: "MANUAL",
        checkedAt,
        enteredById: admin.id,
      },
    });

    if (d.cited && d.citationUrl) {
      await tx.citation.create({
        data: {
          websiteId: d.websiteId,
          engineId: d.engineId,
          promptId: d.promptId,
          resultId: created.id,
          url: d.citationUrl,
          pagePath: safePath(d.citationUrl),
          isOwnDomain: true,
          occurredAt: checkedAt,
        },
      });
    }

    for (const rival of d.competitors) {
      const match = competitors.find(
        (c) => c.name.toLowerCase() === rival.name.toLowerCase() || rival.name.toLowerCase().includes(c.domain.split(".")[0]),
      );
      await tx.competitorMention.create({
        data: { resultId: created.id, competitorId: match?.id ?? null, name: match?.name ?? rival.name, position: rival.position },
      });
    }
    return created;
  });

  revalidateAll();
  return succeed({ id: result.id }, "Result saved.");
}

export async function deleteResearchResult(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.aIResearchResult.delete({ where: { id } });
  revalidateAll();
  return succeed(undefined, "Result deleted.");
}

function safePath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ audits

export async function createAudit(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = auditSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;
  const audit = await db.aEOAudit.create({
    data: { ...d, summary: d.summary || null, status: "PUBLISHED", publishedAt: new Date(), createdById: admin.id },
  });
  revalidateAll();
  return succeed({ id: audit.id }, "Audit published.");
}

export async function deleteAudit(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.aEOAudit.delete({ where: { id } });
  revalidateAll();
  return succeed(undefined, "Audit deleted.");
}

// ------------------------------------------------------------------ issues

export async function createIssue(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;
  const pages = d.affectedPages
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const issue = await db.aEOIssue.create({
    data: {
      websiteId: d.websiteId,
      auditId: d.auditId || null,
      title: d.title,
      category: d.category,
      severity: d.severity,
      impactScore: d.impactScore,
      description: d.description,
      whyItMatters: d.whyItMatters || null,
      currentImplementation: d.currentImplementation || null,
      recommendedImplementation: d.recommendedImplementation || null,
      affectedPages: JSON.stringify(pages),
    },
  });
  revalidateAll();
  return succeed({ id: issue.id }, "Issue created.");
}

export async function deleteIssue(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.aEOIssue.delete({ where: { id } });
  revalidateAll();
  return succeed(undefined, "Issue deleted.");
}

// ------------------------------------------------------------ optimizations

export async function createOptimization(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = optimizationSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;
  const opt = await db.optimization.create({
    data: { websiteId: d.websiteId, issueId: d.issueId || null, title: d.title, description: d.description || null, type: d.type, impactScore: d.impactScore, effort: d.effort },
  });
  revalidateAll();
  return succeed({ id: opt.id }, "Optimization added.");
}

// ------------------------------------------------------------ code changes

export async function createCodeChange(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = codeChangeSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;
  const last = await db.codeChange.findFirst({ where: { websiteId: d.websiteId }, orderBy: { number: "desc" }, select: { number: true } });
  const change = await db.codeChange.create({
    data: {
      websiteId: d.websiteId,
      optimizationId: d.optimizationId || null,
      number: (last?.number ?? 100) + 1,
      title: d.title,
      summary: d.summary || null,
      repository: d.repository || null,
      branch: d.branch || null,
      instructions: d.instructions || null,
      status: "DRAFT",
    },
  });
  revalidateAll();
  return succeed({ id: change.id }, "Job created.");
}

export async function updateCodeChangeStatus(id: string, status: CodeChangeStatus): Promise<ActionResult> {
  await requireAdmin();
  await db.codeChange.update({ where: { id }, data: { status } });
  revalidateAll();
  return succeed(undefined, `Status set to ${status.toLowerCase().replace(/_/g, " ")}.`);
}

/**
 * "Send to Claude" — the hand-off point for the future agent integration.
 * V1 has no agent connected: the job is marked READY_FOR_CLAUDE and stays
 * there until a human authors the diff. The status transition and the
 * context payload are exactly what the automated path will consume.
 */
export async function sendToClaude(id: string): Promise<ActionResult> {
  await requireAdmin();
  const change = await db.codeChange.findUnique({ where: { id } });
  if (!change) return fail("Job not found.");
  if (!change.instructions?.trim()) return fail("Add task instructions before sending.");
  await db.codeChange.update({ where: { id }, data: { status: "READY_FOR_CLAUDE" } });
  revalidateAll();
  return succeed(undefined, "Queued for Claude. No agent is connected in this version — the job will wait here for a human to author the change.");
}

export async function upsertCodeChangeFile(input: {
  codeChangeId: string;
  fileId?: string;
  path: string;
  language: string;
  /** What the customer reads during review. Optional — see below. */
  diff: string;
  /** The complete file after the change. This is what actually gets written. */
  content: string;
}): Promise<ActionResult> {
  await requireAdmin();
  if (!input.path.trim()) return fail("File path is required.", { path: "Required" });
  // Content is the required half, not the diff. A diff is a description of a
  // change; only the finished file can be committed to someone's repository,
  // and delivery refuses without it — so refuse here instead, where the person
  // who can fix it is looking.
  if (!input.content.trim()) return fail("Final file content is required — it's what gets written to the site.", { content: "Required" });

  const content = input.content;
  const hasDiff = input.diff.trim().length > 0;
  // With no hand-written diff, show the customer the whole resulting file as
  // an addition. That is exactly right for a new file and still truthful for a
  // replacement: it is what the file will contain.
  const diff = hasDiff
    ? input.diff
    : content
        .split("\n")
        .map((l) => `+${l}`)
        .join("\n");

  const additions = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const deletions = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

  await db.$transaction(async (tx) => {
    const data = { path: input.path, language: input.language, diff, content, additions, deletions };
    if (input.fileId) {
      await tx.codeChangeFile.update({ where: { id: input.fileId }, data });
    } else {
      await tx.codeChangeFile.create({ data: { codeChangeId: input.codeChangeId, ...data } });
    }
    const files = await tx.codeChangeFile.findMany({ where: { codeChangeId: input.codeChangeId } });
    await tx.codeChange.update({
      where: { id: input.codeChangeId },
      data: {
        additions: files.reduce((n, f) => n + f.additions, 0),
        deletions: files.reduce((n, f) => n + f.deletions, 0),
        status: "AWAITING_REVIEW",
      },
    });
  });
  // Tell the customer there is something waiting. The sprint moves at the
  // speed of these reviews, and a review nobody knows about is a stalled one.
  const job = await db.codeChange.findUnique({
    where: { id: input.codeChangeId },
    include: {
      website: {
        select: {
          domain: true,
          organization: { select: { members: { orderBy: { createdAt: "asc" }, take: 1, select: { user: { select: { email: true } } } } } },
        },
      },
    },
  });
  const owner = job?.website.organization.members[0]?.user.email;
  if (job && owner) {
    await sendEmail(
      changeAwaitingReviewEmail(owner, {
        title: job.title,
        number: job.number,
        changeId: job.id,
        domain: job.website.domain,
      }),
    );
  }

  revalidateAll();
  return succeed(undefined, "File saved and job moved to review.");
}

export async function deleteCodeChangeFile(fileId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.codeChangeFile.delete({ where: { id: fileId } });
  revalidateAll();
  return succeed(undefined, "File removed.");
}

// ------------------------------------------------------------------ content

export async function createContentOpportunity(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = contentOpportunitySchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));
  const d = parsed.data;
  const opp = await db.contentOpportunity.create({
    data: { websiteId: d.websiteId, title: d.title, targetPrompt: d.targetPrompt || null, potential: d.potential, intent: d.intent, contentType: d.contentType, briefing: d.briefing || null },
  });
  revalidateAll();
  return succeed({ id: opp.id }, "Opportunity added.");
}

// ---------------------------------------------------------------- customers

export async function setCustomerPlan(orgId: string, plan: Plan): Promise<ActionResult> {
  await requireAdmin();
  await db.$transaction([
    db.organization.update({ where: { id: orgId }, data: { plan } }),
    db.subscription.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, plan, status: plan === "TRIAL" ? "TRIALING" : "ACTIVE" },
      update: { plan, status: plan === "TRIAL" ? "TRIALING" : "ACTIVE" },
    }),
  ]);
  revalidateAll();
  return succeed(undefined, `Plan set to ${plan.toLowerCase()}.`);
}

export async function setIntegrationStatus(integrationId: string, status: "CONNECTED" | "NOT_CONNECTED" | "ERROR"): Promise<ActionResult> {
  await requireAdmin();
  await db.integration.update({
    where: { id: integrationId },
    data: { status, connectedAt: status === "CONNECTED" ? new Date() : null },
  });
  revalidateAll();
  return succeed(undefined, "Integration updated.");
}

export async function adminGoToCustomer(orgId: string) {
  await requireAdmin();
  redirect(`/admin/customers/${orgId}`);
}

export async function updateCodeChange(
  id: string,
  input: { title: string; summary: string; instructions: string; repository: string; branch: string },
): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) return fail("Title is required.", { title: "Required" });
  await db.codeChange.update({
    where: { id },
    data: {
      title: input.title.trim(),
      summary: input.summary.trim() || null,
      instructions: input.instructions.trim() || null,
      repository: input.repository.trim() || null,
      branch: input.branch.trim() || null,
    },
  });
  revalidateAll();
  return succeed(undefined, "Job updated.");
}
