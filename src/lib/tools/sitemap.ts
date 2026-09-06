import "server-only";
import { ToolError, assertPublicHost, fetchPage, normalizeUrl } from "./http";

/**
 * Sitemap checker.
 *
 * Finds the sitemap, parses it, follows a sitemap index one level, and reports
 * what is actually in it — including the problems that quietly stop a sitemap
 * being useful: URLs on a different host, non-canonical protocols, missing
 * lastmod, and a robots.txt that never declares it.
 *
 * It does not fetch every URL to check for 404s. A large sitemap would mean
 * tens of thousands of requests from our servers to someone else's, which is
 * not a reasonable thing for a free tool to do to a stranger's site. A small
 * random sample is checked instead, and the page says that is what it is.
 */

const MAX_CHILD_SITEMAPS = 10;
const SAMPLE_SIZE = 5;

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

export interface SitemapIssue {
  severity: "warn" | "fail";
  label: string;
  detail: string;
}

export interface SampleResult {
  url: string;
  status: number | null;
}

export interface SitemapReport {
  origin: string;
  sitemapUrl: string;
  /** True when it was a <sitemapindex> pointing at more sitemaps. */
  isIndex: boolean;
  childSitemaps: string[];
  totalUrls: number;
  entries: SitemapEntry[];
  withLastmod: number;
  newestLastmod: string | null;
  oldestLastmod: string | null;
  declaredInRobots: boolean;
  robotsSitemaps: string[];
  sample: SampleResult[];
  issues: SitemapIssue[];
}

function parseEntries(xml: string): SitemapEntry[] {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((m) => {
    const block = m[1];
    const pick = (tag: string) => {
      const hit = new RegExp(`<${tag}>\\s*([^<]+?)\\s*</${tag}>`, "i").exec(block);
      return hit ? hit[1].trim() : null;
    };
    return {
      loc: pick("loc") ?? "",
      lastmod: pick("lastmod"),
      changefreq: pick("changefreq"),
      priority: pick("priority"),
    };
  }).filter((e) => e.loc);
}

function locsOf(xml: string) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}

export async function checkSitemap(rawUrl: string): Promise<SitemapReport> {
  const input = normalizeUrl(rawUrl);
  await assertPublicHost(input.hostname);
  const origin = `${input.protocol}//${input.host}`;

  // Accept either a bare domain or a direct link to the file.
  const candidates = /sitemap|\.xml$/i.test(input.pathname)
    ? [input.toString()]
    : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap-index.xml`, `${origin}/sitemap`];

  let sitemapUrl = "";
  let xml = "";
  for (const candidate of candidates) {
    const res = await fetchPage(candidate, { accept: "application/xml,text/xml,*/*;q=0.8" }).catch(() => null);
    if (res?.ok && /<(urlset|sitemapindex)/i.test(res.body)) {
      sitemapUrl = res.finalUrl || candidate;
      xml = res.body;
      break;
    }
  }

  if (!xml) {
    throw new ToolError(
      `No sitemap found at ${origin}/sitemap.xml. If yours lives elsewhere, paste the full URL to it.`,
    );
  }

  const issues: SitemapIssue[] = [];
  const isIndex = /<sitemapindex/i.test(xml);
  let entries: SitemapEntry[] = [];
  let childSitemaps: string[] = [];

  if (isIndex) {
    childSitemaps = locsOf(xml);
    const followed = childSitemaps.slice(0, MAX_CHILD_SITEMAPS);
    for (const child of followed) {
      const res = await fetchPage(child, { accept: "application/xml,text/xml,*/*;q=0.8" }).catch(() => null);
      if (res?.ok) entries.push(...parseEntries(res.body));
    }
    if (childSitemaps.length > MAX_CHILD_SITEMAPS) {
      issues.push({
        severity: "warn",
        label: `Only the first ${MAX_CHILD_SITEMAPS} of ${childSitemaps.length} child sitemaps were read`,
        detail: "The counts below cover that sample, not the whole index.",
      });
    }
  } else {
    entries = parseEntries(xml);
  }

  // --- robots.txt declaration --------------------------------------------
  const robots = await fetchPage(`${origin}/robots.txt`, { accept: "text/plain,*/*;q=0.8" }).catch(() => null);
  const robotsUsable = Boolean(robots?.ok) && !/^\s*<(!doctype|html)/i.test(robots?.body ?? "");
  const robotsSitemaps = robotsUsable
    ? [...(robots?.body ?? "").matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1])
    : [];
  const declaredInRobots = robotsSitemaps.some((s) => s.replace(/\/$/, "") === sitemapUrl.replace(/\/$/, ""));

  // --- checks -------------------------------------------------------------
  if (entries.length === 0) {
    issues.push({ severity: "fail", label: "No URLs found", detail: "The file parsed but contains no <url> entries." });
  }

  if (!declaredInRobots) {
    issues.push({
      severity: "warn",
      label: "Not declared in robots.txt",
      detail: `Add "Sitemap: ${sitemapUrl}" to ${origin}/robots.txt. It's how a crawler finds the file without being told.`,
    });
  }

  const offHost = entries.filter((e) => {
    try {
      return new URL(e.loc).host !== input.host;
    } catch {
      return true;
    }
  });
  if (offHost.length > 0) {
    issues.push({
      severity: "fail",
      label: `${offHost.length} URL${offHost.length === 1 ? "" : "s"} on a different host`,
      detail: `A sitemap may only list URLs on its own host. Example: ${offHost[0].loc}`,
    });
  }

  const insecure = entries.filter((e) => e.loc.startsWith("http://"));
  if (insecure.length > 0 && input.protocol === "https:") {
    issues.push({
      severity: "warn",
      label: `${insecure.length} HTTP URL${insecure.length === 1 ? "" : "s"} on an HTTPS site`,
      detail: "These will redirect, wasting crawl budget. List the canonical HTTPS URL directly.",
    });
  }

  const withLastmod = entries.filter((e) => e.lastmod).length;
  if (entries.length > 0 && withLastmod / entries.length < 0.5) {
    issues.push({
      severity: "warn",
      label: `Only ${withLastmod} of ${entries.length} URLs have a lastmod`,
      detail: "lastmod is the freshness signal crawlers use to decide what to re-fetch. Without it every URL looks equally stale.",
    });
  }

  if (entries.length > 50_000) {
    issues.push({
      severity: "fail",
      label: "Over the 50,000 URL limit",
      detail: "A single sitemap may hold at most 50,000 URLs. Split it and use a sitemap index.",
    });
  }

  const duplicates = entries.length - new Set(entries.map((e) => e.loc)).size;
  if (duplicates > 0) {
    issues.push({
      severity: "warn",
      label: `${duplicates} duplicate URL${duplicates === 1 ? "" : "s"}`,
      detail: "The same URL appears more than once. Harmless, but it usually means two generators are both writing this file.",
    });
  }

  // --- a small sample, so we can say something about reachability ---------
  const pool = entries.map((e) => e.loc);
  const picked: string[] = [];
  for (let i = 0; i < SAMPLE_SIZE && pool.length > 0; i++) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  const sample: SampleResult[] = [];
  for (const url of picked) {
    const res = await fetchPage(url, { accept: "text/html,*/*;q=0.8" }).catch(() => null);
    sample.push({ url, status: res?.status ?? null });
  }

  const broken = sample.filter((s) => s.status === null || s.status >= 400);
  if (broken.length > 0) {
    issues.push({
      severity: "fail",
      label: `${broken.length} of ${sample.length} sampled URLs failed`,
      detail: `Example: ${broken[0].url} returned ${broken[0].status ?? "no response"}. A sitemap listing dead URLs wastes crawl budget.`,
    });
  }

  const dates = entries.map((e) => e.lastmod).filter((d): d is string => Boolean(d)).sort();

  return {
    origin,
    sitemapUrl,
    isIndex,
    childSitemaps,
    totalUrls: entries.length,
    entries: entries.slice(0, 100),
    withLastmod,
    newestLastmod: dates.length ? dates[dates.length - 1] : null,
    oldestLastmod: dates.length ? dates[0] : null,
    declaredInRobots,
    robotsSitemaps,
    sample,
    issues,
  };
}
