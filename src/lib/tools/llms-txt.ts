import "server-only";
import { ToolError, decodeEntities, fetchChecked, fetchPage, jsonLdNodes, metaContent, tagText } from "./http";

/**
 * llms.txt generator.
 *
 * Reads a site and drafts the file rather than handing over a blank template.
 * The draft is assembled entirely from what the site already publishes — its
 * own title, description, Organization schema and sitemap — so nothing in the
 * output is invented about the business.
 *
 * Pages are chosen by path shape, not by guessing importance: a sitemap gives
 * us every URL but no ranking, and llms.txt is meant to be the handful of pages
 * you would hand a journalist, not a second sitemap.
 */

export interface LlmsTxtSection {
  title: string;
  items: { label: string; url: string; note: string }[];
}

export interface LlmsTxtReport {
  url: string;
  origin: string;
  siteName: string;
  summary: string;
  /** Whether the site already publishes one. */
  existing: { found: boolean; status: number; url: string };
  sitemapUrl: string | null;
  urlsFound: number;
  sections: LlmsTxtSection[];
  /** The file itself, ready to copy. */
  content: string;
  /** Honest notes about what we could and couldn't determine. */
  notes: string[];
}

/**
 * Path patterns worth surfacing, in priority order.
 *
 * Deliberately conservative: a page is included because its path says what it
 * is, not because it appeared early in the sitemap.
 */
const BUCKETS: { title: string; test: RegExp; note: string; limit: number }[] = [
  { title: "Start here", test: /^\/(about|about-us|company)\/?$/i, note: "Who the company is.", limit: 2 },
  { title: "Start here", test: /^\/(pricing|plans|cost)\/?$/i, note: "What it costs.", limit: 2 },
  { title: "Start here", test: /^\/(products?|services?|solutions?|features?)\/?$/i, note: "What is offered.", limit: 3 },
  { title: "Guides", test: /^\/(docs?|documentation|guides?|help|support|learn|resources?)(\/|$)/i, note: "Reference material.", limit: 6 },
  { title: "Guides", test: /^\/(faq|frequently-asked)/i, note: "Common questions, answered.", limit: 2 },
  { title: "Articles", test: /^\/(blog|articles?|news|insights)\//i, note: "Published writing.", limit: 8 },
  { title: "Company", test: /^\/(contact|careers|jobs|team)\/?$/i, note: "How to get in touch.", limit: 3 },
];

const SKIP = /\/(tag|tags|category|categories|author|page|search|cart|checkout|account|login|signup|admin|api|wp-|feed|amp)(\/|$)|\.(xml|json|pdf|jpg|png|gif|webp|css|js)$/i;

function titleFromPath(path: string) {
  const last = path.replace(/\/$/, "").split("/").pop() ?? path;
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 70);
}

/** Pull <loc> values out of a sitemap, following one level of sitemap index. */
async function collectSitemapUrls(origin: string): Promise<{ sitemapUrl: string | null; urls: string[] }> {
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap-index.xml`];

  for (const candidate of candidates) {
    const res = await fetchPage(candidate, { accept: "application/xml,text/xml,*/*;q=0.8" }).catch(() => null);
    if (!res?.ok || !/<(urlset|sitemapindex)/i.test(res.body)) continue;

    const locs = [...res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);

    // A sitemap index points at more sitemaps. Follow the first few only —
    // a large site can list hundreds, and llms.txt needs a shortlist anyway.
    if (/<sitemapindex/i.test(res.body)) {
      const nested: string[] = [];
      for (const child of locs.slice(0, 3)) {
        const sub = await fetchPage(child, { accept: "application/xml,text/xml,*/*;q=0.8" }).catch(() => null);
        if (sub?.ok) nested.push(...[...sub.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]));
        if (nested.length > 800) break;
      }
      return { sitemapUrl: candidate, urls: nested };
    }
    return { sitemapUrl: candidate, urls: locs };
  }
  return { sitemapUrl: null, urls: [] };
}

export async function generateLlmsTxt(rawUrl: string): Promise<LlmsTxtReport> {
  const { url, page } = await fetchChecked(rawUrl);
  if (!page.ok) throw new ToolError(`That page returned HTTP ${page.status}. Check the address and try again.`);

  const origin = `${url.protocol}//${url.host}`;
  const html = page.body;
  const { nodes } = jsonLdNodes(html);
  const notes: string[] = [];

  const org = nodes.find((n) => {
    const t = n["@type"];
    const type = Array.isArray(t) ? t[0] : t;
    return typeof type === "string" && /Organization|LocalBusiness|Corporation/i.test(type);
  });

  const siteName =
    (typeof org?.name === "string" ? org.name : null) ??
    metaContent(html, "og:site_name") ??
    tagText(html, "title")?.split(/[|—–·]/)[0].trim() ??
    url.hostname.replace(/^www\./, "");

  const summary =
    (typeof org?.description === "string" ? org.description : null) ??
    metaContent(html, "description") ??
    metaContent(html, "og:description") ??
    "";

  if (!summary) {
    notes.push(
      "This site has no meta description and no Organization schema, so we couldn't find a one-line summary. The blockquote below is a placeholder — replace it, because it's the single most important line in the file.",
    );
  }
  if (!org) notes.push("No Organization schema found, so the company name was taken from the page title.");

  // Does one already exist?
  const existingRes = await fetchPage(`${origin}/llms.txt`, { accept: "text/plain,*/*;q=0.8" }).catch(() => null);
  const existingIsReal =
    Boolean(existingRes?.ok) && Boolean(existingRes && !/^\s*<(!doctype|html)/i.test(existingRes.body) && existingRes.body.trim().length > 0);

  const { sitemapUrl, urls } = await collectSitemapUrls(origin);
  if (!sitemapUrl) {
    notes.push("No sitemap.xml found, so the page list below is minimal. Adding a sitemap would let this tool suggest far more.");
  }

  // Bucket the sitemap URLs by path shape.
  const seen = new Set<string>();
  const grouped = new Map<string, { label: string; url: string; note: string }[]>();

  for (const raw of urls) {
    let path: string;
    try {
      const parsed = new URL(raw);
      if (parsed.host !== url.host) continue;
      path = parsed.pathname;
    } catch {
      continue;
    }
    if (path === "/" || SKIP.test(path) || seen.has(path)) continue;

    for (const bucket of BUCKETS) {
      if (!bucket.test.test(path)) continue;
      const list = grouped.get(bucket.title) ?? [];
      if (list.length >= bucket.limit) break;
      list.push({ label: titleFromPath(path), url: `${origin}${path}`, note: bucket.note });
      grouped.set(bucket.title, list);
      seen.add(path);
      break;
    }
  }

  const sections: LlmsTxtSection[] = [];
  const startHere = grouped.get("Start here") ?? [];
  sections.push({
    title: "Start here",
    items: [{ label: "Home", url: `${origin}/`, note: "What this site is." }, ...startHere],
  });
  for (const title of ["Guides", "Articles", "Company"]) {
    const items = grouped.get(title);
    if (items?.length) sections.push({ title, items });
  }

  const content = [
    `# ${siteName}`,
    "",
    `> ${summary || "One sentence describing what this business does, for whom. Replace this line."}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      ...section.items.map((item) => `- [${item.label}](${item.url}): ${item.note}`),
      "",
    ]),
    "## Notes for AI systems",
    `- Crawler policy is published at ${origin}/robots.txt.`,
    "- Pages requiring authentication hold no public content.",
    "",
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");

  notes.push(
    "This is a draft, not a finished file. The descriptions after each link are generic — rewrite them in your own words, because that text is the whole point of llms.txt.",
  );

  return {
    url: url.toString(),
    origin,
    siteName: decodeEntities(siteName),
    summary: decodeEntities(summary),
    existing: { found: existingIsReal, status: existingRes?.status ?? 0, url: `${origin}/llms.txt` },
    sitemapUrl,
    urlsFound: urls.length,
    sections,
    content,
    notes,
  };
}

