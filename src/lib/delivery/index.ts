import "server-only";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";
import type { IntegrationProvider } from "@/lib/enums";
import { githubClient } from "./github";
import { shopifyClient } from "./shopify";
import { webflowClient } from "./webflow";
import { wordpressClient } from "./wordpress";
import { applyFailure, failure, type ApplyResult, type ChangeRequest, type DeliveryClient, type VerifyResult } from "./types";

export * from "./types";

/**
 * The providers we can write to directly. Anything not in here is an EDITOR or
 * GUIDED route — a deliberate absence, not a gap waiting to be filled: Framer,
 * Wix and Squarespace publish no write API for site content.
 */
const CLIENTS: Partial<Record<IntegrationProvider, DeliveryClient>> = {
  GITHUB: githubClient,
  WORDPRESS: wordpressClient,
  SHOPIFY: shopifyClient,
  WEBFLOW: webflowClient,
};

export function getClient(provider: string): DeliveryClient | undefined {
  return CLIENTS[provider as IntegrationProvider];
}

export function hasApiClient(provider: string): boolean {
  return Boolean(getClient(provider));
}

/** The connect form's shape for a provider, safe to send to the browser. */
export function connectSpec(provider: string) {
  const client = getClient(provider);
  if (!client) return null;
  return { secretLabel: client.secretLabel, secretHint: client.secretHint, fields: client.fields };
}

function parseConfig(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]),
    );
  } catch {
    return {};
  }
}

/**
 * Verify a credential that is already stored. Used by the connect flow and by
 * a periodic re-check, because a token that was valid in week one is not
 * necessarily valid in week six — and finding that out at the end of a
 * guarantee window is finding out too late.
 */
export async function verifyStored(integrationId: string): Promise<VerifyResult> {
  const row = await db.integration.findUnique({
    where: { id: integrationId },
    include: { website: { select: { url: true } } },
  });
  if (!row) return failure("That connection no longer exists.");
  const client = getClient(row.provider);
  if (!client) return failure("This connection isn't an API route, so there is no credential to check.");
  if (!row.secretCiphertext) return failure("No credential is stored for this connection.");

  let secret: string;
  try {
    secret = decryptSecret(row.secretCiphertext);
  } catch {
    return failure("The stored credential could not be read. Reconnect to replace it.");
  }

  const result = await client.verify({ websiteUrl: row.website.url, config: parseConfig(row.config), secret });

  await db.integration.update({
    where: { id: row.id },
    data: {
      status: result.ok ? "CONNECTED" : "ERROR",
      verifiedAt: result.ok ? new Date() : row.verifiedAt,
      connectedAt: result.ok ? (row.connectedAt ?? new Date()) : row.connectedAt,
      lastError: result.ok ? null : (result.error ?? "Verification failed."),
    },
  });

  return result;
}

/**
 * Push one change through whichever API route the website has connected.
 * Returns a failure rather than throwing so a caller in a server action can
 * report it to the customer as-is.
 */
export async function applyChange(websiteId: string, change: ChangeRequest): Promise<ApplyResult> {
  const row = await db.integration.findFirst({
    where: { websiteId, mode: "API", status: "CONNECTED" },
    include: { website: { select: { url: true } } },
  });
  if (!row) return applyFailure("This site has no connected API route, so changes are delivered another way.");

  const client = getClient(row.provider);
  if (!client || !row.secretCiphertext) return applyFailure("This connection is missing its credential. Reconnect in Settings.");

  let secret: string;
  try {
    secret = decryptSecret(row.secretCiphertext);
  } catch {
    return applyFailure("The stored credential could not be read. Reconnect to replace it.");
  }

  const result = await client.apply({ websiteUrl: row.website.url, config: parseConfig(row.config), secret }, change);

  // A failed write usually means the credential died. Reflect that in the
  // connection state so it shows up as a red badge rather than only inside one
  // change's error text.
  if (!result.ok) {
    await db.integration.update({
      where: { id: row.id },
      data: { status: "ERROR", lastError: result.error ?? result.detail },
    });
  }

  return result;
}
