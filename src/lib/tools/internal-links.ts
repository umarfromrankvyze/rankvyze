import "server-only";
import { ToolError, assertPublicHost, decodeEntities, fetchPage, normalizeUrl, tagText } from "./http";
import { isAllowed, parseRobots } from "./robots-parser";

/**
 * Internal link checker.
 *
 * Ranks a site's own pages by the internal links pointing at them, and reports
 * what that ranking exposes: pages nothing links to, pages buried three or more
 * clicks from the entry point, and internal links that are broken.
 *
 * Why internal rather than backlinks: backlink counts and Domain Rating only
 * exist inside commercial crawls (Ahrefs, Majestic, Moz, Semrush), and there is
 * no honest free source for either — see the note in src/content/tools.ts.
 * Internal link structure needs no proprietary index at all, because the site
 * being measured serves every input. It is also the half of link equity a site
 * owner can actually change this afternoon.
 *
 * The distinction that makes this worth running is sitewide vs contextual. A
 * page linked only from the nav and footer looks well-linked to a naive counter
 * while having no editorial support whatsoever — every page has those links, so
 * they carry no signal about which pages matter. Separating the two is the
 * finding most crawlers bury.
 *
 * Bounded on purpose: this fetches a stranger's pages from our servers, so it
 * crawls a fixed budget, obeys their robots.txt, and says plainly that its
 * conclusions cover the pages it reached rather than the whole site.
 */

/** Pages fetched per run. Enough to characterise structure, small enough to be polite. */
const MAX_PAGES = 25;
/** Links followed from a single page. Guards against a runaway sitemap-as-page. */
const MAX_LINKS_PER_PAGE = 300;
/** Sitemap URLs compared against the crawl when looking for orphans. */
const MAX_SITEMAP_URLS = 500;
/** A target on this share of crawled pages is template furniture, not a recommendation. */
const SITEWIDE_RATIO = 0.8;

export interface LinkedPage {
  url: string;
  path: string;
  /** Distinct crawled pages linking here. */
  inbound: number;
  /** Inbound links that are not part of the nav/footer template. */
  contextual: number;
  /** Present on nearly every page, so it says nothing about importance. */
  sitewide: boolean;
  /** Clicks from the entry URL. null when discovered but not reached inside the budget. */
  depth: number | null;
  /** null when the page was discovered but never fetched. */
  status: number | null;
  title: string | null;
  crawled: boolean;
}

export interface BrokenLink {
  url: string;
  status: number | null;
  /** A page that links to it. */
  from: string;
}

export interface InternalLinkIssue {
  severity: "warn" | "fail";
  label: string;
  detail: string;
}

export interface InternalLinkReport {
  origin: string;
  startUrl: string;
  pagesCrawled: number;
  crawlLimit: number;
  /** True when robots.txt parsed and was applied. */
  robotsApplied: boolean;
  robotsBlocked: string[];
  totalLinks: number;
  uniqueTargets: number;
  /** Ranked by contextual links, then total. */
  pages: LinkedPage[];
  /** In the sitemap, linked from nothing we crawled. */
  orphans: string[];
  /**
   * True when the crawl reached every URL in the sitemap, so inbound counts are
   * complete. When false, an "orphan" only means nothing among the pages we
   * reached links to it — a claim the UI has to weaken accordingly.
   */
  crawlComplete: boolean;
  sitemapUrls: number | null;
  broken: BrokenLink[];
  depthHistogram: { depth: number; count: number }[];
  nofollow: number;
  issues: InternalLinkIssue[];
}

/** Anchors with their rel, so nofollow can be counted rather than silently included. */
function extractLinks(html: string, base: URL, host: string) {
  const out: { url: string; nofollow: boolean }[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    if (out.length >= MAX_LINKS_PER_PAGE) break;

    const attrs = match[1];
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))/i.exec(attrs);
    if (!href) continue;

    const raw = decodeEntities((href[1] ?? href[2] ?? href[3] ?? "").trim());
    if (!raw || /^(mailto:|tel:|javascript:|data:|#)/i.test(raw)) continue;

    let resolved: URL;
    try {
      resolved = new URL(raw, base);
    } catch {
      continue;
    }
    if (resolved.host !== host) continue;
    if (!/^https?:$/.test(resolved.protocol)) continue;

    // A fragment is the same page; a query string usually is not, so it stays.
    resolved.hash = "";
    const url = resolved.toString().replace(/\/$/, "") || resolved.origin;
    if (seen.has(url)) continue;
    seen.add(url);

    const rel = /\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))/i.exec(attrs);
    const relValue = (rel?.[1] ?? rel?.[2] ?? rel?.[3] ?? "").toLowerCase();

    out.push({ url, nofollow: /\bnofollow\b/.test(relValue) });
  }

  return out;
}

function canonicalise(url: string) {
  return url.replace(/\/$/, "");
}

export async function checkInternalLinks(rawUrl: string): Promise<InternalLinkReport> {
  const input = normalizeUrl(rawUrl);
  await assertPublicHost(input.hostname);

  const origin = `${input.protocol}//${input.host}`;
  const startUrl = canonicalise(input.toString());
  const host = input.host;

  // --- robots.txt, applied rather than merely reported ---------------------
  const robotsRes = await fetchPage(`${origin}/robots.txt`, { accept: "text/plain,*/*;q=0.8" }).catch(() => null);
  const robotsUsable = Boolean(robotsRes?.ok) && !/^\s*<(!doctype|html)/i.test(robotsRes?.body ?? "");
  const groups = robotsUsable ? parseRobots(robotsRes?.body ?? "") : [];
  const robotsBlocked: string[] = [];

  const permitted = (url: string) => {
    if (!robotsUsable) return true;
    try {
      return isAllowed(groups, "RankVyzeTools", new URL(url).pathname).allowed;
    } catch {
      return true;
    }
  };

  // --- breadth-first crawl -------------------------------------------------
  // Breadth-first specifically so `depth` means clicks-from-entry. A depth-first
  // walk would reach the same pages and record meaningless distances.
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  const depthOf = new Map<string, number>([[startUrl, 0]]);
  const statusOf = new Map<string, number | null>();
  const titleOf = new Map<string, string | null>();
  const inboundFrom = new Map<string, Set<string>>();
  const crawled = new Set<string>();

  let totalLinks = 0;
  let nofollow = 0;

  while (queue.length > 0 && crawled.size < MAX_PAGES) {
    const { url, depth } = queue.shift()!;
    if (crawled.has(url)) continue;

    if (!permitted(url)) {
      robotsBlocked.push(url);
      continue;
    }

    const res = await fetchPage(url, { accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8" }).catch(() => null);
    crawled.add(url);
    statusOf.set(url, res?.status ?? null);

    if (!res?.ok) continue;

    // Only walk HTML. A PDF or an image would parse to nothing useful.
    const type = res.headers.get("content-type") ?? "";
    if (type && !/html/i.test(type)) continue;

    const title = tagText(res.body, "title");
    titleOf.set(url, title ? decodeEntities(title).trim().slice(0, 120) : null);

    for (const link of extractLinks(res.body, new URL(url), host)) {
      totalLinks++;
      if (link.nofollow) nofollow++;

      if (!inboundFrom.has(link.url)) inboundFrom.set(link.url, new Set());
      inboundFrom.get(link.url)!.add(url);

      if (!depthOf.has(link.url)) {
        depthOf.set(link.url, depth + 1);
        queue.push({ url: link.url, depth: depth + 1 });
      }
    }
  }

  if (crawled.size === 0) {
    throw new ToolError(`We couldn't fetch any pages from ${origin}. Check the address and try again.`);
  }

  if (crawled.size === 1 && totalLinks === 0) {
    throw new ToolError(
      "That page has no internal links we could follow. If the navigation is rendered by JavaScript, a crawler sees the same empty page — which is itself the finding.",
    );
  }

  // --- sitewide vs contextual ---------------------------------------------
  const sitewideThreshold = Math.max(2, Math.ceil(crawled.size * SITEWIDE_RATIO));

  const pages: LinkedPage[] = [...new Set([...inboundFrom.keys(), ...crawled])].map((url) => {
    const inbound = inboundFrom.get(url)?.size ?? 0;
    const sitewide = inbound >= sitewideThreshold;
    let path = url;
    try {
      path = new URL(url).pathname || "/";
    } catch {
      /* keep the full string */
    }
    return {
      url,
      path,
      inbound,
      // A sitewide target's links are template furniture, so none of them count
      // as editorial support. Anything below the threshold is all contextual.
      contextual: sitewide ? 0 : inbound,
      sitewide,
      depth: depthOf.get(url) ?? null,
      status: statusOf.get(url) ?? null,
      title: titleOf.get(url) ?? null,
      crawled: crawled.has(url),
    };
  });

  pages.sort((a, b) => b.contextual - a.contextual || b.inbound - a.inbound || a.path.localeCompare(b.path));

  // --- broken internal links ----------------------------------------------
  // Only pages actually fetched can be judged. Anything beyond the budget is
  // left out rather than guessed at.
  const broken: BrokenLink[] = [];
  for (const [url, status] of statusOf) {
    if (status !== null && status < 400) continue;
    const from = inboundFrom.get(url);
    if (!from || from.size === 0) continue;
    broken.push({ url, status, from: [...from][0] });
  }

  // --- orphans, measured against the sitemap ------------------------------
  let sitemapUrls: number | null = null;
  const orphans: string[] = [];
  const sitemapRes = await fetchPage(`${origin}/sitemap.xml`, { accept: "application/xml,text/xml,*/*;q=0.8" }).catch(
    () => null,
  );
  if (sitemapRes?.ok && /<(urlset|sitemapindex)/i.test(sitemapRes.body)) {
    const locs = [...sitemapRes.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)]
      .map((m) => canonicalise(decodeEntities(m[1])))
      .slice(0, MAX_SITEMAP_URLS);
    sitemapUrls = locs.length;
    for (const loc of locs) {
      if (!inboundFrom.has(loc) && loc !== startUrl) orphans.push(loc);
    }
  }

  // Complete only when the crawl budget covered the whole sitemap. Everything
  // that depends on an inbound count being final is gated on this.
  const crawlComplete = sitemapUrls !== null && crawled.size >= sitemapUrls;

  // --- depth histogram -----------------------------------------------------
  const byDepth = new Map<number, number>();
  for (const page of pages) {
    if (page.depth === null) continue;
    byDepth.set(page.depth, (byDepth.get(page.depth) ?? 0) + 1);
  }
  const depthHistogram = [...byDepth.entries()].sort((a, b) => a[0] - b[0]).map(([depth, count]) => ({ depth, count }));

  // --- issues --------------------------------------------------------------
  const issues: InternalLinkIssue[] = [];

  if (broken.length > 0) {
    issues.push({
      severity: "fail",
      label: `${broken.length} broken internal link${broken.length === 1 ? "" : "s"}`,
      detail: `${broken[0].url} returned ${broken[0].status ?? "no response"}, linked from ${broken[0].from}. Every one of these spends crawl budget on nothing.`,
    });
  }

  if (orphans.length > 0) {
    issues.push({
      severity: "warn",
      label: crawlComplete
        ? `${orphans.length} sitemap URL${orphans.length === 1 ? "" : "s"} with no inbound link`
        : `${orphans.length} sitemap URL${orphans.length === 1 ? "" : "s"} not linked from the pages we reached`,
      detail: `Nothing among the ${crawled.size} pages we crawled links to ${orphans[0]}. A page reachable only from the sitemap is one an engine has little reason to treat as important — and none to reach a second time.`,
    });
  }

  const deep = pages.filter((p) => p.depth !== null && p.depth >= 3);
  if (deep.length > 0) {
    issues.push({
      severity: "warn",
      label: `${deep.length} page${deep.length === 1 ? "" : "s"} three or more clicks deep`,
      detail: `${deep[0].path} sits at depth ${deep[0].depth}. Crawl frequency falls off sharply with depth, so anything commercially important belongs within two clicks of the homepage.`,
    });
  }

  // Only meaningful when every page was reached. On a partial crawl a page can
  // look singly-linked purely because the pages linking to it were never
  // fetched, which would be a fabricated finding rather than a cautious one.
  if (crawlComplete) {
    const thinlyLinked = pages.filter((p) => !p.sitewide && p.contextual === 1);
    if (thinlyLinked.length > 0) {
      issues.push({
        severity: "warn",
        label: `${thinlyLinked.length} page${thinlyLinked.length === 1 ? "" : "s"} with a single inbound link`,
        detail: `${thinlyLinked[0].path} is linked from exactly one other page. One link is one edit away from being an orphan.`,
      });
    }
  }

  if (nofollow > 0) {
    issues.push({
      severity: "warn",
      label: `${nofollow} internal link${nofollow === 1 ? "" : "s"} marked nofollow`,
      detail:
        "nofollow on an internal link tells engines not to follow it. On your own site that is almost always unintentional — it usually arrives with a plugin default.",
    });
  }

  if (robotsBlocked.length > 0) {
    issues.push({
      severity: "warn",
      label: `${robotsBlocked.length} URL${robotsBlocked.length === 1 ? "" : "s"} blocked by robots.txt`,
      detail: `We obeyed your robots.txt and skipped ${robotsBlocked[0]}. If that path should be indexed, the rule blocking it needs removing.`,
    });
  }

  if (!robotsUsable) {
    issues.push({
      severity: "warn",
      label: "No robots.txt found",
      detail: `Nothing usable at ${origin}/robots.txt. Not fatal, but it's where a sitemap gets declared and where AI crawler access is decided.`,
    });
  }

  return {
    origin,
    startUrl,
    pagesCrawled: crawled.size,
    crawlLimit: MAX_PAGES,
    robotsApplied: robotsUsable,
    robotsBlocked: robotsBlocked.slice(0, 10),
    totalLinks,
    uniqueTargets: inboundFrom.size,
    pages: pages.slice(0, 60),
    orphans: orphans.slice(0, 25),
    crawlComplete,
    sitemapUrls,
    broken: broken.slice(0, 15),
    depthHistogram,
    nofollow,
    issues,
  };
}
