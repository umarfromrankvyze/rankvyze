import type { IntegrationProvider } from "@/lib/enums";

/**
 * The contract every API-mode integration implements.
 *
 * Two operations, deliberately: `verify` proves the credential works *before*
 * we tell a customer they're connected, and `apply` makes one change. A
 * connection that is only "saved" and never exercised is how you find out on
 * day 40 of a 45-day guarantee that the token was read-only.
 */

export interface ConnectField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  required: boolean;
}

export interface DeliveryTarget {
  /** The customer's public site URL, used for the post-change verification. */
  websiteUrl: string;
  /** Non-secret settings: repo, branch, shop domain, site id. */
  config: Record<string, string>;
  /** Decrypted credential. Never logged, never returned to a client. */
  secret: string;
}

export interface VerifyResult {
  ok: boolean;
  /** Who/what we authenticated as, shown back to the customer. */
  account?: string;
  /** Capabilities confirmed live, not claimed by us. */
  confirmed: string[];
  /** Present when ok is false. Written for the customer, not the log. */
  error?: string;
}

/** One file's worth of change, for providers that take file content. */
export interface ChangeFile {
  path: string;
  content: string;
}

export interface ChangeRequest {
  title: string;
  /** Longer description for the PR body / commit message / audit note. */
  summary: string;
  files?: ChangeFile[];
  /** Field-level edits for CMS-shaped providers. */
  fields?: {
    /** Provider-specific resource id — a WordPress post id, a Webflow page id. */
    resourceId: string;
    title?: string;
    metaDescription?: string;
    /** Raw HTML or JSON-LD to place in the page head, where supported. */
    headHtml?: string;
  }[];
}

export interface ApplyResult {
  ok: boolean;
  /** Where the customer sees it: a PR, a staging URL, an admin link. */
  reviewUrl?: string;
  /** Whether this is already visible to the public. */
  live: boolean;
  /** Enough to undo it, stored on the CodeChange for a one-click revert. */
  rollback?: Record<string, unknown>;
  detail: string;
  error?: string;
}

export interface DeliveryClient {
  provider: IntegrationProvider;
  /** Shown above the credential input. */
  secretLabel: string;
  secretHint: string;
  /** Non-secret settings the connect form collects. */
  fields: ConnectField[];
  verify(target: DeliveryTarget): Promise<VerifyResult>;
  apply(target: DeliveryTarget, change: ChangeRequest): Promise<ApplyResult>;
}

/** Anything thrown out of a client is normalised through this. */
export function failure(error: string): VerifyResult {
  return { ok: false, confirmed: [], error };
}

export function applyFailure(error: string): ApplyResult {
  return { ok: false, live: false, detail: "No change was made.", error };
}

/**
 * Provider APIs return errors in wildly different shapes and some of them echo
 * the credential back. Everything the customer sees goes through here so a
 * token can never end up rendered in the UI or written to a log line.
 */
export function scrub(message: string, secret: string): string {
  if (!secret) return message;
  return message.split(secret).join("[redacted]");
}
