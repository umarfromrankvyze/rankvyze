"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { credentialsCanBeStored, encryptSecret, secretHint } from "@/lib/crypto";
import { getClient, verifyStored } from "@/lib/delivery";
import { fail, succeed, type ActionResult } from "@/server/types";

/**
 * Connecting an API route.
 *
 * The order here is the whole point: the credential is verified against the
 * provider's live API *before* anything is written to our database. A
 * connection that shows "connected" without ever having been exercised is the
 * failure mode this flow exists to prevent — you find out the token was
 * read-only on day 40 of a 45-day guarantee.
 */

const MAX_SECRET = 500;
const MAX_CONFIG_VALUE = 300;

async function ownerWebsite() {
  const user = await requireUser("/dashboard/settings");
  const membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: { organization: { include: { websites: { orderBy: [{ isPrimary: "desc" }], take: 1 } } } },
  });
  const website = membership?.organization.websites[0];
  if (!website) throw new Error("No website");
  return website;
}

export async function connectApiRoute(input: {
  provider: string;
  config: Record<string, string>;
  secret: string;
}): Promise<ActionResult<{ account?: string; confirmed: string[] }>> {
  const client = getClient(input.provider);
  if (!client) return fail("That provider has no direct API connection.");

  if (!credentialsCanBeStored()) {
    // Better a clear refusal than storing a customer's write credential in
    // plaintext because an environment variable was forgotten.
    return fail("Credential storage isn't configured on this deployment. We can't accept a token safely right now.");
  }

  const secret = input.secret.trim();
  if (!secret) return fail(`Enter your ${client.secretLabel.toLowerCase()}.`);
  if (secret.length > MAX_SECRET) return fail("That doesn't look like a credential — it's too long.");

  const config: Record<string, string> = {};
  for (const field of client.fields) {
    const value = (input.config[field.key] ?? "").trim();
    if (field.required && !value) return fail(`${field.label} is required.`);
    if (value.length > MAX_CONFIG_VALUE) return fail(`${field.label} is too long.`);
    if (value) config[field.key] = value;
  }

  const website = await ownerWebsite();

  // Live check first. Nothing is stored if this fails.
  const result = await client.verify({ websiteUrl: website.url, config, secret });
  if (!result.ok) return fail(result.error ?? "We couldn't confirm that credential works.");

  await db.integration.upsert({
    where: { websiteId_provider: { websiteId: website.id, provider: input.provider } },
    create: {
      websiteId: website.id,
      provider: input.provider,
      mode: "API",
      status: "CONNECTED",
      config: JSON.stringify(config),
      secretCiphertext: encryptSecret(secret),
      secretHint: secretHint(secret),
      label: result.account ?? null,
      repoUrl: config.repo ? `https://github.com/${config.repo}` : null,
      connectedAt: new Date(),
      verifiedAt: new Date(),
      lastError: null,
    },
    update: {
      mode: "API",
      status: "CONNECTED",
      config: JSON.stringify(config),
      secretCiphertext: encryptSecret(secret),
      secretHint: secretHint(secret),
      label: result.account ?? null,
      repoUrl: config.repo ? `https://github.com/${config.repo}` : null,
      connectedAt: new Date(),
      verifiedAt: new Date(),
      lastError: null,
    },
  });

  // One live route at a time, so the admin never sees two competing promises.
  await db.integration.updateMany({
    where: { websiteId: website.id, provider: { not: input.provider }, status: { in: ["PENDING", "CONNECTED"] } },
    data: { status: "NOT_CONNECTED" },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/onboarding");
  return succeed({ account: result.account, confirmed: result.confirmed }, `Connected to ${result.account ?? "your site"}.`);
}

/** Re-run the live check against a credential we already hold. */
export async function recheckApiRoute(integrationId: string): Promise<ActionResult<{ confirmed: string[] }>> {
  const website = await ownerWebsite();
  const row = await db.integration.findFirst({ where: { id: integrationId, websiteId: website.id } });
  if (!row) return fail("That connection no longer exists.");

  const result = await verifyStored(integrationId);
  revalidatePath("/dashboard/settings");
  return result.ok
    ? succeed({ confirmed: result.confirmed }, "Still working.")
    : fail(result.error ?? "That credential no longer works.");
}

/**
 * Disconnecting deletes the credential rather than flagging the row inactive.
 * A revoked connection that still holds a usable token is not disconnected.
 */
export async function disconnectApiRoute(integrationId: string): Promise<ActionResult> {
  const website = await ownerWebsite();
  const row = await db.integration.findFirst({ where: { id: integrationId, websiteId: website.id } });
  if (!row) return fail("That connection no longer exists.");

  await db.integration.update({
    where: { id: row.id },
    data: { status: "NOT_CONNECTED", secretCiphertext: null, secretHint: null, connectedAt: null, verifiedAt: null, lastError: null },
  });
  revalidatePath("/dashboard/settings");
  return succeed(undefined, "Disconnected. The stored credential has been deleted — revoke it on their side too.");
}
