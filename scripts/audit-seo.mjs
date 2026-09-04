/**
 * SEO + AEO audit of our own site.
 *
 * Fetches raw HTML — no JavaScript — because that is what most AI crawlers see.
 * Anything only visible after hydration is invisible to them, so checking the
 * rendered DOM would flatter us.
 *
 * Run: node scripts/audit-seo.mjs [baseUrl]
 */

const BASE = (process.argv[2] ?? "https://rankvyze.com").replace(/\/$/, "");

const PAGES = [
  "/",
  "/pricing",
  "/answer-engine-optimization",
  "/blog/what-answer-engine-optimization-costs",
  "/guarantee",
  "/blog",
  "/blog/how-to-rank-on-chatgpt",
  "/blog/ai-crawlers-robots-txt",
  "/blog/how-to-choose-an-aeo-tool",
  "/blog/what-is-answer-engine-optimization",
  "/resources",
  "/aeo-guide",
  "/docs",
  "/faq",
  "/about",
  "/contact",
];

const fail = [];
const warn = [];
const pass = [];

const note = (bucket, page, message) => bucket.push(`${page.padEnd(42)} ${message}`);

function tag(html, re) {
  const m = re.exec(html);
  return m ? m[1].trim() : null;
}

function decode(s) {
  return s
    ?.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Strip tags and script/style bodies — an approximation of what a crawler reads. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonLdTypes(html) {
  const types = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      const nodes = parsed["@graph"] ?? [parsed];
      for (const n of [].concat(nodes)) if (n && n["@type"]) types.push(n["@type"]);
    } catch {
      types.push("UNPARSEABLE");
    }
  }
  return types;
}

console.log(`SEO + AEO audit — ${BASE}\nRaw HTML, no JavaScript (what AI crawlers see)\n${"=".repeat(72)}`);

for (const path of PAGES) {
  const url = BASE + path;
  let html;
  try {
    const res = await fetch(url, { headers: { "user-agent": "RankVyze-SelfAudit/1.0" } });
    if (!res.ok) {
      note(fail, path, `HTTP ${res.status}`);
      continue;
    }
    html = await res.text();
  } catch (error) {
    note(fail, path, `fetch failed — ${String(error).slice(0, 60)}`);
    continue;
  }

  const title = decode(tag(html, /<title>([^<]*)<\/title>/i));
  const desc = decode(tag(html, /<meta name="description" content="([^"]*)"/i));
  const canonical = tag(html, /<link rel="canonical" href="([^"]*)"/i);
  const ogImage = tag(html, /<meta property="og:image" content="([^"]*)"/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decode(visibleText(m[1])));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].length;
  const types = jsonLdTypes(html);
  const text = visibleText(html);
  const words = text.split(/\s+/).length;
  const internalLinks = new Set([...html.matchAll(/href="(\/[a-z0-9/-]*)"/gi)].map((m) => m[1])).size;
  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  const imgsNoAlt = imgs.filter((m) => !/\salt="[^"]+"/i.test(m[0])).length;

  // --- title ---
  if (!title) note(fail, path, "no <title>");
  else if (title.length > 62) note(warn, path, `title ${title.length} chars — truncates in Google (~60)`);
  else if (title.length < 20) note(warn, path, `title only ${title.length} chars`);
  else note(pass, path, `title ${title.length} chars`);

  // --- description ---
  if (!desc) note(fail, path, "no meta description");
  else if (desc.length > 165) note(warn, path, `description ${desc.length} chars — truncates (~155)`);
  else if (desc.length < 70) note(warn, path, `description only ${desc.length} chars — thin`);

  // --- canonical ---
  if (!canonical) note(fail, path, "no canonical");

  // --- headings ---
  if (h1s.length === 0) note(fail, path, "no <h1>");
  else if (h1s.length > 1) note(warn, path, `${h1s.length} <h1> tags`);
  if (h2s === 0 && words > 400) note(warn, path, "no <h2> on a long page — nothing for a passage extractor to grab");

  // --- server rendering ---
  if (words < 250) note(fail, path, `only ${words} words in raw HTML — thin to a non-JS crawler`);

  // --- structured data ---
  if (types.includes("UNPARSEABLE")) note(fail, path, "malformed JSON-LD");
  if (types.length === 0) note(fail, path, "no structured data");

  // --- images ---
  if (imgsNoAlt > 0) note(warn, path, `${imgsNoAlt}/${imgs.length} <img> without alt`);

  // --- internal linking ---
  if (internalLinks < 8) note(warn, path, `only ${internalLinks} distinct internal links`);

  // --- social ---
  if (!ogImage) note(warn, path, "no og:image");

  console.log(
    `${path.padEnd(42)} ${String(words).padStart(5)}w  h1:${h1s.length} h2:${String(h2s).padStart(2)}  links:${String(internalLinks).padStart(2)}  ld:[${types.join(",") || "none"}]`,
  );
}

// --- site-wide files ---
console.log(`\n${"=".repeat(72)}\nSite-wide`);
for (const [file, must] of [
  ["/robots.txt", ["Sitemap:", "GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "Google-Extended"]],
  ["/sitemap.xml", ["<urlset", "rankvyze.com"]],
  ["/llms.txt", ["#", "http"]],
  ["/blog/rss.xml", ["<rss", "<item>"]],
]) {
  try {
    const res = await fetch(BASE + file);
    const body = await res.text();
    const missing = must.filter((m) => !body.includes(m));
    if (!res.ok) note(fail, file, `HTTP ${res.status}`);
    else if (missing.length) note(warn, file, `missing: ${missing.join(", ")}`);
    console.log(`${file.padEnd(42)} ${res.status}  ${body.length} bytes  ${missing.length ? "missing " + missing.join(",") : "ok"}`);
  } catch {
    note(fail, file, "unreachable");
  }
}

// --- the Organization node, which is what an engine reads to identify us ---
console.log(`\n${"=".repeat(72)}\nOrganization entity`);
try {
  const html = await (await fetch(BASE + "/")).text();
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let org = null;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const n of [].concat(parsed["@graph"] ?? [parsed])) if (n?.["@type"] === "Organization") org = n;
    } catch {}
  }
  if (!org) note(fail, "/", "no Organization node on the homepage");
  else {
    const wanted = ["name", "url", "logo", "description", "sameAs", "foundingDate", "areaServed", "contactPoint"];
    for (const key of wanted) {
      const has = org[key] !== undefined && (!Array.isArray(org[key]) || org[key].length > 0);
      console.log(`  ${has ? "present" : "MISSING"}  ${key}`);
      if (!has && key === "sameAs") note(fail, "/", "Organization.sameAs is empty — no corroboration for engines to follow");
      else if (!has) note(warn, "/", `Organization.${key} missing`);
    }
  }
} catch (error) {
  note(fail, "/", `could not read Organization — ${String(error).slice(0, 50)}`);
}

console.log(`\n${"=".repeat(72)}`);
for (const [label, list] of [["FAIL", fail], ["WARN", warn]]) {
  if (!list.length) continue;
  console.log(`\n${label} (${list.length})`);
  for (const line of list) console.log("  " + line);
}
console.log(`\n${fail.length} failures, ${warn.length} warnings, ${pass.length} titles ok`);
