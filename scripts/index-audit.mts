/**
 * Checks every URL in the live sitemap for the things that stop Google
 * indexing a page: redirects, canonical mismatches, noindex, and non-200s.
 *
 * Written because Search Console reported "Page with redirect" as a reason
 * pages weren't indexed, and guessing which pages redirect is slower than
 * asking all of them.
 *
 * A canonical that doesn't exactly match the URL in the sitemap is the quiet
 * one. Google follows the canonical and drops the sitemap URL, so the page
 * looks submitted-but-ignored with no error anywhere.
 *
 * Run: npx tsx scripts/index-audit.mts
 */
const SITE = process.env.SITE ?? "https://rankvyze.com";
const CONCURRENCY = 8;

interface Problem {
  url: string;
  kind: "redirect" | "canonical" | "noindex" | "status";
  detail: string;
}

const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
// The sitemap emits absolute URLs built from APP_URL, which differs from the
// origin being audited when checking a local build. Rewrite the origin so one
// script works against localhost and production alike.
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => `${SITE}${new URL(m[1]).pathname}`);
console.log(`Auditing ${urls.length} sitemap URLs against ${SITE}\n`);

const problems: Problem[] = [];
let ok = 0;

async function check(url: string) {
  // manual redirect so a 3xx is visible rather than silently followed
  const head = await fetch(url, { redirect: "manual", headers: { "user-agent": "RankVyzeIndexAudit/1.0" } });

  if (head.status >= 300 && head.status < 400) {
    problems.push({ url, kind: "redirect", detail: `${head.status} → ${head.headers.get("location")}` });
    return;
  }
  if (head.status !== 200) {
    problems.push({ url, kind: "status", detail: `HTTP ${head.status}` });
    return;
  }

  const robotsHeader = head.headers.get("x-robots-tag") ?? "";
  const html = await head.text();

  if (/noindex/i.test(robotsHeader)) {
    problems.push({ url, kind: "noindex", detail: `x-robots-tag: ${robotsHeader}` });
    return;
  }
  const metaRobots = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1] ?? "";
  if (/noindex/i.test(metaRobots)) {
    problems.push({ url, kind: "noindex", detail: `meta robots: ${metaRobots}` });
    return;
  }

  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html)?.[1];
  if (!canonical) {
    problems.push({ url, kind: "canonical", detail: "no canonical tag" });
    return;
  }
  // Compare exactly as a crawler would, ignoring only a trailing slash.
  const norm = (u: string) => u.replace(/\/$/, "");
  if (norm(canonical) !== norm(url)) {
    problems.push({ url, kind: "canonical", detail: `points to ${canonical}` });
    return;
  }
  ok++;
}

for (let i = 0; i < urls.length; i += CONCURRENCY) {
  await Promise.all(
    urls.slice(i, i + CONCURRENCY).map((u) =>
      check(u).catch((e) => problems.push({ url: u, kind: "status", detail: e instanceof Error ? e.message : "failed" })),
    ),
  );
}

const byKind = (k: Problem["kind"]) => problems.filter((p) => p.kind === k);

console.log(`${ok} clean · ${problems.length} with problems\n`);
for (const kind of ["status", "redirect", "noindex", "canonical"] as const) {
  const group = byKind(kind);
  if (group.length === 0) continue;
  console.log(`${kind.toUpperCase()} (${group.length})`);
  for (const p of group) console.log(`  ${p.url}\n    ${p.detail}`);
  console.log("");
}

if (problems.length === 0) console.log("Every sitemap URL returns 200, is indexable, and self-canonicalises.");
process.exit(problems.length === 0 ? 0 : 1);
