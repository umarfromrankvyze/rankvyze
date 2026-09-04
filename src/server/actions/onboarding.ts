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
  platformSchema,
} from "@/lib/validation";
import { detectPlatform } from "@/lib/platform";
import { hasPaid } from "@/server/engagement";
import { fail, succeed, type ActionResult } from "@/server/types";
import type { PlatformKey } from "@/lib/enums";

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

  // Work out what the site is built on now, while the customer waits a moment
  // on step 1, so step 4 can open on the right delivery route instead of
  // asking them to pick from a list of platforms they'd have to translate.
  // A detection failure is not an onboarding failure: an unreachable site is
  // still a site we can work on, so we record nothing and let them tell us.
  try {
    const detection = await detectPlatform(parsed.data.url);
    await db.website.update({
      where: { id: saved.id },
      data: {
        platform: detection.platform,
        platformConfidence: detection.confidence,
        platformSignals: JSON.stringify(detection.signals.map((sig) => sig.label)),
      },
    });
  } catch {
    // Left null. Step 4 asks instead of guessing.
  }

  return succeed({ websiteId: saved.id });
}

/**
 * The customer overrides detection. Their answer always wins — they own the
 * site and we do not, and a wrong platform means a delivery route that cannot
 * work.
 */
export async function confirmPlatform(input: { platform: PlatformKey }): Promise<ActionResult> {
  const parsed = platformSchema.safeParse(input);
  if (!parsed.success) return fail("Choose the platform your site is built on.", flattenErrors(parsed.error));

  const { website } = await ownerContext();
  if (!website) return fail("Add your website first.");

  await db.website.update({
    where: { id: website.id },
    data: { platform: parsed.data.platform, platformConfirmedAt: new Date() },
  });
  return succeed();
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

export async function saveIntegrationStep(input: {
  provider: string | null;
  mode: string | null;
  repoUrl?: string;
  accessNote?: string;
}): Promise<ActionResult> {
  const parsed = onboardingIntegrationSchema.safeParse(input);
  if (!parsed.success) return fail("Choose how we should deliver fixes.", flattenErrors(parsed.error));

  const { organization, website } = await ownerContext();
  if (!website) return fail("Add your website first.");

  const { provider, mode, repoUrl, accessNote } = parsed.data;

  // One row for the route actually chosen. The previous version wrote a row
  // for every provider in the enum, which made "not connected" and "never
  // offered" indistinguishable in the admin.
  if (provider && mode) {
    const existing = await db.integration.findUnique({
      where: { websiteId_provider: { websiteId: website.id, provider } },
      select: { status: true },
    });
    // An API route may already have been connected and live-verified by the
    // connect form on this very screen. Writing PENDING over that would throw
    // away a working credential's status and show "awaiting setup" for a
    // connection we have literally just proved works.
    const keepConnected = existing?.status === "CONNECTED";

    await db.integration.upsert({
      where: { websiteId_provider: { websiteId: website.id, provider } },
      create: {
        websiteId: website.id,
        provider,
        mode,
        status: "PENDING",
        repoUrl: repoUrl || null,
        accessNote: accessNote || null,
        label: repoUrl ? repoUrl.replace(/^https?:\/\/(www\.)?(github|gitlab)\.com\//, "") : null,
      },
      update: {
        mode,
        ...(keepConnected ? {} : { status: "PENDING" }),
        ...(repoUrl ? { repoUrl } : {}),
        accessNote: accessNote || null,
      },
    });
    // Only one route is live at a time; anything previously chosen goes back
    // to not-connected rather than lingering as a second pending promise.
    await db.integration.updateMany({
      where: { websiteId: website.id, provider: { not: provider }, status: "PENDING" },
      data: { status: "NOT_CONNECTED" },
    });
  }

  await db.organization.update({
    where: { id: organization.id },
    data: { onboardingStep: 4, onboardingCompletedAt: new Date() },
  });

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
  // Setup first, payment second. The sprint clock starts at purchase, and it
  // should not start while we still don't know what the site is or who it
  // competes with.
  redirect((await hasPaid(organization.id)) ? "/dashboard" : "/checkout");
}
