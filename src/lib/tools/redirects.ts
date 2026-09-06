import "server-only";
import { TIMEOUT_MS, ToolError, USER_AGENT, assertPublicHost, normalizeUrl } from "./http";

/**
 * Redirect chain checker.
 *
 * Follows hops one at a time with `redirect: "manual"` so each step is visible,
 * rather than letting fetch collapse the chain and report only the destination.
 *
 * Security note that matters more here than anywhere else in this codebase:
 * the SSRF guard runs on EVERY hop, not just the URL the visitor typed. A
 * public URL is allowed to redirect anywhere, including 169.254.169.254 or
 * 127.0.0.1 — so validating only the first address would leave the exact hole
 * the guard exists to close, with the attacker supplying a perfectly innocent
 * starting point.
 */

const MAX_HOPS = 12;

export interface RedirectHop {
  url: string;
  status: number;
  statusText: string;
  /** Where this hop pointed, before resolution. */
  location: string | null;
  /** Permanent redirects pass ranking signals; temporary ones do not. */
  permanent: boolean;
  elapsedMs: number;
  /** Set when the hop was refused rather than followed. */
  blocked?: string;
}

export interface RedirectIssue {
  severity: "warn" | "fail";
  label: string;
  detail: string;
}

export interface RedirectReport {
  start: string;
  final: string | null;
  hops: RedirectHop[];
  hopCount: number;
  totalMs: number;
  /** True when the chain ended somewhere that isn't a redirect. */
  resolved: boolean;
  finalStatus: number | null;
  issues: RedirectIssue[];
}

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);
const PERMANENT = new Set([301, 308]);

export async function checkRedirects(rawUrl: string): Promise<RedirectReport> {
  const start = normalizeUrl(rawUrl);
  await assertPublicHost(start.hostname);

  const hops: RedirectHop[] = [];
  const seen = new Set<string>();
  let current: URL = start;
  let resolved = false;
  let finalStatus: number | null = null;
  let loopedAt: string | null = null;
  const began = Date.now();

  for (let i = 0; i < MAX_HOPS; i++) {
    const key = current.toString();
    if (seen.has(key)) {
      loopedAt = key;
      break;
    }
    seen.add(key);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const hopStarted = Date.now();

    let res: Response;
    try {
      res = await fetch(key, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": USER_AGENT, accept: "text/html,*/*;q=0.8" },
      });
    } catch (error) {
      clearTimeout(timer);
      if (hops.length === 0) {
        throw new ToolError(
          error instanceof Error && error.name === "AbortError"
            ? "That site took too long to respond. Try again in a moment."
            : "We couldn't reach that address. Check it and try again.",
        );
      }
      hops.push({
        url: key,
        status: 0,
        statusText: "no response",
        location: null,
        permanent: false,
        elapsedMs: Date.now() - hopStarted,
        blocked: "The server did not respond to this hop.",
      });
      break;
    }
    clearTimeout(timer);

    const location = res.headers.get("location");
    const isRedirect = REDIRECT_CODES.has(res.status) && Boolean(location);

    const hop: RedirectHop = {
      url: key,
      status: res.status,
      statusText: res.statusText || "",
      location,
      permanent: PERMANENT.has(res.status),
      elapsedMs: Date.now() - hopStarted,
    };

    if (!isRedirect) {
      hops.push(hop);
      resolved = true;
      finalStatus = res.status;
      break;
    }

    // Resolve relative Location headers against the current URL.
    let next: URL;
    try {
      next = new URL(location!, current);
    } catch {
      hop.blocked = `Location header could not be parsed: ${location}`;
      hops.push(hop);
      break;
    }

    if (next.protocol !== "http:" && next.protocol !== "https:") {
      hop.blocked = `Redirects to a non-web scheme (${next.protocol}), which we won't follow.`;
      hops.push(hop);
      break;
    }

    // The guard, on every hop. See the note at the top of this file.
    try {
      await assertPublicHost(next.hostname);
    } catch {
      hop.blocked = `Redirects to ${next.hostname}, which resolves to a private or internal address. Not followed.`;
      hops.push(hop);
      break;
    }

    hops.push(hop);
    current = next;
  }

  const totalMs = Date.now() - began;
  const final = resolved ? hops[hops.length - 1].url : null;
  const redirectCount = hops.filter((h) => REDIRECT_CODES.has(h.status)).length;

  // --- findings -----------------------------------------------------------
  const issues: RedirectIssue[] = [];

  if (loopedAt) {
    issues.push({
      severity: "fail",
      label: "Redirect loop",
      detail: `The chain returns to ${loopedAt}. Browsers and crawlers give up on a loop, so this URL is unreachable.`,
    });
  }

  if (!resolved && !loopedAt && hops.length >= MAX_HOPS) {
    issues.push({
      severity: "fail",
      label: "Chain too long",
      detail: `Still redirecting after ${MAX_HOPS} hops. Search engines stop following well before this.`,
    });
  }

  if (redirectCount > 2) {
    issues.push({
      severity: "warn",
      label: `${redirectCount} redirects before the destination`,
      detail:
        "Each hop costs latency and a little of the ranking signal being passed. Point the first URL at the final destination directly.",
    });
  }

  const temporary = hops.filter((h) => REDIRECT_CODES.has(h.status) && !h.permanent);
  if (temporary.length > 0) {
    issues.push({
      severity: "warn",
      label: `${temporary.length} temporary redirect${temporary.length === 1 ? "" : "s"}`,
      detail:
        "302, 303 and 307 tell engines the move is temporary, so the destination may not inherit ranking signals. Use 301 or 308 for a permanent move.",
    });
  }

  const mixedScheme = hops.some((h) => h.url.startsWith("http://"));
  if (mixedScheme) {
    issues.push({
      severity: "warn",
      label: "Chain starts on HTTP",
      detail: "At least one hop is plain HTTP. Redirect to HTTPS in a single step rather than hopping through it.",
    });
  }

  if (resolved && finalStatus !== null && finalStatus >= 400) {
    issues.push({
      severity: "fail",
      label: `Destination returns ${finalStatus}`,
      detail: "The chain resolves, but the page at the end is an error. Anything linking here is losing the visitor.",
    });
  }

  const blocked = hops.find((h) => h.blocked);
  if (blocked) {
    issues.push({ severity: "fail", label: "Chain could not be completed", detail: blocked.blocked! });
  }

  return {
    start: start.toString(),
    final,
    hops,
    hopCount: redirectCount,
    totalMs,
    resolved,
    finalStatus,
    issues,
  };
}
