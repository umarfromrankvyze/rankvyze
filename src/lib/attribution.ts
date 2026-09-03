import { cookies } from "next/headers";

/**
 * First-touch attribution, carried from landing page to signup in a cookie.
 *
 * First-touch, not last-touch: the question the console has to answer is "what
 * brought this person to us", and the last thing before signup is usually our
 * own pricing page. The cookie is written once and never overwritten while it
 * lives, so a visitor who arrives from Perplexity, leaves, and returns via a
 * bookmark two days later is still credited to Perplexity.
 *
 * Not httpOnly-sensitive and holds nothing personal — a source label, a
 * referrer host and a landing path.
 */

export const ATTRIBUTION_COOKIE = "rv_attr";
const TTL_DAYS = 90;

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  landingPath?: string;
  /** ISO timestamp of the first touch. */
  at?: string;
}

export function serializeAttribution(value: Attribution) {
  return JSON.stringify(value).slice(0, 900);
}

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const v = parsed as Record<string, unknown>;
    const str = (key: string) => (typeof v[key] === "string" ? (v[key] as string).slice(0, 200) : undefined);
    return {
      source: str("source"),
      medium: str("medium"),
      campaign: str("campaign"),
      referrer: str("referrer"),
      landingPath: str("landingPath"),
      at: str("at"),
    };
  } catch {
    return null;
  }
}

export const attributionCookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL_DAYS * 24 * 60 * 60,
};

/** Read the first-touch cookie from a server context. Never throws. */
export async function readAttribution(): Promise<Attribution | null> {
  try {
    const jar = await cookies();
    return parseAttribution(jar.get(ATTRIBUTION_COOKIE)?.value);
  } catch {
    return null;
  }
}
