"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { extractDomain } from "@/lib/utils";
import {
  flattenErrors,
  onboardingBusinessSchema,
  onboardingCompetitorsSchema,
  onboardingIntegrationSchema,
  onboardingWebsiteSchema,
} from "@/lib/validation";
import { fail, succeed, type ActionResult } from "@/server/types";
import { INTEGRATION_PROVIDERS } from "@/lib/enums";

async function ownerContext() {
  const user = await requireUser("/onboarding");
  const membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: { organization: { include: { websites: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } } } },
  });
  if (!membership) throw new Error("No organization");
  return { user, organization: membership.organization, website: membership.organization.websites[0] ?? null };
}

export async function saveWebsiteStep(input: { url: string }): Promise<ActionResult<{ websiteId: string }>> {
  const parsed = onboardingWebsiteSchema.safeParse(input);
  if (!parsed.success) return fail("Enter a valid website URL.", flattenErrors(parsed.error));

  const { organization, website } = await ownerContext();
  const domain = extractDomain(parsed.data.url);

  const saved = website
    ? await db.website.update({ where: { id: website.id }, data: { url: parsed.data.url, domain, name: website.name || domain } })
    : await db.website.create({
        data: {
          organizationId: organization.id,
          url: parsed.data.url,
          domain,
          name: domain.split(".")[0].replace(/^\w/, (c) => c.toUpperCase()),
          isPrimary: true,
        },
      });

  await db.organization.update({ where: { id: organization.id }, data: { onboardingStep: Math.max(organization.onboardingStep, 1) } });
  return succeed({ websiteId: saved.id });
}

export async function saveBusinessStep(input: Record<string, string>): Promise<ActionResult> {
  const parsed = onboardingBusinessSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const { organization, website } = await ownerContext();
  if (!website) return fail("Add your website first.");

  const locations = parsed.data.targetLocations
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await db.$transaction([
    db.website.update({
      where: { id: website.id },
      data: {
        name: parsed.data.companyName,
        industry: parsed.data.industry,
        description: parsed.data.description,
        targetAudience: parsed.data.targetAudience,
        productsService: parsed.data.productsServices,
        targetLocations: JSON.stringify(locations),
      },
    }),
    db.organization.update({
      where: { id: organization.id },
      data: { name: parsed.data.companyName, onboardingStep: Math.max(organization.onboardingStep, 2) },
    }),
  ]);
  return succeed();
}

export async function saveCompetitorsStep(input: { competitors: { name: string; domain: string }[] }): Promise<ActionResult> {
  const parsed = onboardingCompetitorsSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const { organization, website } = await ownerContext();
  if (!website) return fail("Add your website first.");

  const rows = parsed.data.competitors.map((c) => ({ name: c.name, domain: extractDomain(c.domain) }));
  const unique = Array.from(new Map(rows.map((r) => [r.domain, r])).values());

  await db.$transaction([
    db.competitor.deleteMany({ where: { websiteId: website.id } }),
    ...unique.map((c) =>
      db.competitor.create({ data: { websiteId: website.id, name: c.name, domain: c.domain, url: `https://${c.domain}` } }),
    ),
    db.organization.update({ where: { id: organization.id }, data: { onboardingStep: Math.max(organization.onboardingStep, 3) } }),
  ]);
  return succeed();
}

export async function saveIntegrationStep(input: { provider: string | null; repoUrl?: string }): Promise<ActionResult> {
  const parsed = onboardingIntegrationSchema.safeParse(input);
  if (!parsed.success) return fail("Choose a connection option.", flattenErrors(parsed.error));

  const { organization, website } = await ownerContext();
  if (!website) return fail("Add your website first.");

  // Create a row for every provider so the settings page can show all
  // options; mark the chosen one as pending. Real OAuth/API handshakes are
  // not wired in V1, which the UI states plainly.
  await db.$transaction([
    ...INTEGRATION_PROVIDERS.map((provider) =>
      db.integration.upsert({
        where: { websiteId_provider: { websiteId: website.id, provider } },
        create: {
          websiteId: website.id,
          provider,
          status: provider === parsed.data.provider ? "PENDING" : "NOT_CONNECTED",
          repoUrl: provider === parsed.data.provider && parsed.data.repoUrl ? parsed.data.repoUrl : null,
          label: provider === parsed.data.provider && parsed.data.repoUrl ? parsed.data.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "") : null,
        },
        update:
          provider === parsed.data.provider
            ? { status: "PENDING", repoUrl: parsed.data.repoUrl || null }
            : {},
      }),
    ),
    db.organization.update({
      where: { id: organization.id },
      data: { onboardingStep: 4, onboardingCompletedAt: new Date() },
    }),
  ]);

  revalidatePath("/dashboard");
  return succeed();
}

export async function finishOnboarding() {
  const { organization } = await ownerContext();
  if (!organization.onboardingCompletedAt) {
    await db.organization.update({
      where: { id: organization.id },
      data: { onboardingStep: 4, onboardingCompletedAt: new Date() },
    });
  }
  redirect("/dashboard");
}
