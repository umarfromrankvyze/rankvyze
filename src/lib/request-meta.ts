/**
 * Turning a request into the few facts analytics needs.
 *
 * Two rules shape everything here:
 *
 *  1. No PII. We never read or store an IP address. Country/region/city come
 *     from headers Vercel's edge has already resolved, so the raw IP never
 *     reaches application code.
 *  2. Never guess. Outside Vercel those headers don't exist, so the fields come
 *     back `null` and the admin UI shows an explicit "Unknown" bucket. A
 *     plausible-looking default would quietly corrupt the country breakdown,
 *     which is the one number the console has to be right about.
 */

export interface RequestMeta {
  country: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
}

/** Vercel sets these at the edge; they are absent locally and self-hosted. */
export function geoFromHeaders(headers: Headers) {
  const pick = (name: string) => {
    const raw = headers.get(name);
    if (!raw) return null;
    const value = decodeURIComponent(raw).trim();
    // "XX" is Vercel's placeholder when it could not resolve a location.
    return value && value !== "XX" ? value : null;
  };
  return {
    country: pick("x-vercel-ip-country"),
    region: pick("x-vercel-ip-country-region"),
    city: pick("x-vercel-ip-city"),
  };
}

/**
 * Minimal user-agent classification.
 *
 * Deliberately coarse — enough to answer "mobile or desktop, which browser",
 * not a device-detection library. Order matters: Edge and Chrome both claim
 * "Chrome", so the more specific brands are tested first.
 */
export function uaFromHeaders(headers: Headers) {
  const ua = headers.get("user-agent") ?? "";
  if (!ua) return { device: null, browser: null, os: null };

  const isTablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
  const isMobile = !isTablet && /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung Internet"
        : /Firefox\//i.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/i.test(ua)
            ? "Chrome"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "Other";

  const os = /Windows NT/i.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/i.test(ua)
      ? "iOS"
      : /Mac OS X/i.test(ua)
        ? "macOS"
        : /Android/i.test(ua)
          ? "Android"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Other";

  return { device, browser, os };
}

export function requestMeta(headers: Headers): RequestMeta {
  return { ...geoFromHeaders(headers), ...uaFromHeaders(headers) };
}

/**
 * Where a visit came from.
 *
 * `utm_source` wins when present because it's an explicit declaration. Failing
 * that we use the referrer's host, with the handful of hosts that matter
 * normalised so "google.co.uk", "www.google.com" and "news.google.com" don't
 * fragment the report into three rows. An empty referrer on our own origin is
 * "direct" — someone typed the URL or opened a bookmark.
 */
const REFERRER_GROUPS: [RegExp, string][] = [
  [/(^|\.)google\./i, "Google"],
  [/(^|\.)bing\./i, "Bing"],
  [/(^|\.)duckduckgo\./i, "DuckDuckGo"],
  [/(^|\.)(x|twitter)\.com$/i, "X"],
  [/(^|\.)t\.co$/i, "X"],
  [/(^|\.)linkedin\./i, "LinkedIn"],
  [/(^|\.)lnkd\.in$/i, "LinkedIn"],
  [/(^|\.)reddit\.com$/i, "Reddit"],
  [/(^|\.)news\.ycombinator\.com$/i, "Hacker News"],
  [/(^|\.)facebook\.com$/i, "Facebook"],
  [/(^|\.)instagram\.com$/i, "Instagram"],
  [/(^|\.)youtube\.com$/i, "YouTube"],
  [/(^|\.)github\.com$/i, "GitHub"],
  [/(^|\.)producthunt\.com$/i, "Product Hunt"],
  // AI answer surfaces — the traffic this whole product exists to create, so
  // it gets its own rows rather than being lumped in with "other referral".
  [/(^|\.)chatgpt\.com$/i, "ChatGPT"],
  [/(^|\.)openai\.com$/i, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/i, "Perplexity"],
  [/(^|\.)claude\.ai$/i, "Claude"],
  [/(^|\.)gemini\.google\.com$/i, "Gemini"],
  [/(^|\.)copilot\.microsoft\.com$/i, "Copilot"],
];

export function normalizeReferrer(referrer: string | null | undefined, selfHost?: string | null) {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (selfHost && (host === selfHost.toLowerCase() || host === `www.${selfHost.toLowerCase()}`)) return null;
  for (const [pattern, label] of REFERRER_GROUPS) if (pattern.test(host)) return label;
  return host.replace(/^www\./, "");
}

export function deriveSource(utmSource: string | null | undefined, referrer: string | null | undefined, selfHost?: string | null) {
  const utm = utmSource?.trim();
  if (utm) return utm.slice(0, 60);
  return normalizeReferrer(referrer, selfHost) ?? "direct";
}

/** UTC calendar day, the bucket every daily figure is grouped by. */
export function utcDay(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** The last `count` UTC days, oldest first, as YYYY-MM-DD. */
export function recentDays(count: number, from: Date = new Date()) {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    days.push(utcDay(new Date(from.getTime() - i * 86_400_000)));
  }
  return days;
}
