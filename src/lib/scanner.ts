import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * The free pre-purchase scan.
 *
 * Every check here is an objective property of the fetched HTML — nothing is
 * inferred, guessed, or produced by a model. AI engines are not consulted at
 * all; whether they actually mention the business is exactly what the paid
 * engagement answers, and the results page says so.
 */

export type CheckStatus = "pass" | "warn" | "fail";

export interface ScanCheck {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** contribution to the 0-100 score */
  weight: number;
  why: string;
}

export interface ScanResult {
  url: string;
  domain: string;
  score: number;
  checks: ScanCheck[];
  fetchedAt: string;
}

export class ScanError extends Error {}

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 12_000;

/**
 * Guard against SSRF: the URL is attacker-controlled, so refuse anything that
 * resolves into private, loopback or link-local address space before we
 * connect to it.
 */
async function assertPublicHost(hostname: string) {
  const blockedNames = ["localhost", "metadata.google.internal"];
  if (blockedNames.includes(hostname.toLowerCase()) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new ScanError("That address can't be scanned.");
  }

  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new ScanError("We couldn't resolve that domain. Check the spelling and try again.");

  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new ScanError("That address can't be scanned.");
  }
}

function isPrivateAddress(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

async function fetchText(url: string, signal: AbortSignal): Promise<{ ok: boolean; body: string; status: number }> {
  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: {
      // Identify honestly; some sites vary output by agent.
      "user-agent": "RankVyzeScanner/1.0 (+https://rankvyze.com/docs)",
      accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
    },
  });
  const reader = res.body?.getReader();
  if (!reader) return { ok: res.ok, body: "", status: res.status };

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  return { ok: res.ok, body: new TextDecoder().decode(Buffer.concat(chunks)), status: res.status };
}

/** All JSON-LD blocks on the page, flattened (handles @graph). */
function jsonLdNodes(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const push = (n: unknown) => {
        if (!n || typeof n !== "object") return;
        const node = n as Record<string, unknown>;
        out.push(node);
        const graph = node["@graph"];
        if (Array.isArray(graph)) graph.forEach(push);
      };
      if (Array.isArray(parsed)) parsed.forEach(push);
      else push(parsed);
    } catch {
      // A malformed block is itself a finding, but we don't fail the scan.
    }
  }
  return out;
}

function hasType(nodes: Record<string, unknown>[], ...types: string[]) {
  return nodes.some((n) => {
    const t = n["@type"];
    const list = Array.isArray(t) ? t.map(String) : [String(t ?? "")];
    return list.some((v) => types.some((want) => v.toLowerCase() === want.toLowerCase()));
  });
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", times: "×", middot: "·",
};

/**
 * Decode HTML entities. Without this the extracted text keeps raw entities,
 * which both shows up in the report ("Gemini &amp; Claude") and skews the
 * character count used by the server-rendered-content check.
 */
function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function tag(html: string, name: string) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(html);
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() : null;
}

function metaContent(html: string, nameOrProp: string) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProp}["'][^>]*>`, "i");
  const el = re.exec(html)?.[0];
  if (!el) return null;
  const raw = /content=["']([^"']*)["']/i.exec(el)?.[1];
  return raw ? decodeEntities(raw).trim() : null;
}

/** Visible text in the server-delivered HTML, before any JavaScript runs. */
function serverRenderedText(html: string) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  // Decode rather than strip: "&amp;" is one character of real content, and
  // blanking entities understated the character count on entity-heavy pages.
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

const GENERIC_DESCRIPTIONS = [
  "welcome to our website",
  "welcome to my website",
  "just another wordpress site",
  "home page",
  "untitled",
  "coming soon",
];

/** Words that tell a model what kind of business this is. */
const CATEGORY_HINTS =
  /\b(agency|studio|consultancy|consulting|software|platform|app|saas|shop|store|clinic|dentist|dental|law|legal|lawyer|attorney|accountant|accounting|marketing|design|development|developer|builder|manufacturer|supplier|restaurant|cafe|hotel|salon|gym|fitness|school|academy|training|insurance|bank|finance|realty|real estate|property|logistics|freight|repair|service|services|solutions|company|firm|practice|contractor|plumber|electrician|photographer|therapist|coach)\b/i;

export async function scanUrl(rawUrl: string): Promise<ScanResult> {
  let target: URL;
  try {
    target = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw new ScanError("That doesn't look like a valid URL.");
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new ScanError("Only http and https addresses can be scanned.");
  }
  await assertPublicHost(target.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let html = "";
  let robots = "";
  let llms = false;
  try {
    const page = await fetchText(target.toString(), controller.signal).catch(() => null);
    if (!page || !page.ok) {
      throw new ScanError(
        page ? `The site returned ${page.status}. Check the URL is publicly reachable.` : "We couldn't reach that site.",
      );
    }
    html = page.body;

    const origin = target.origin;
    const [r, l] = await Promise.all([
      fetchText(`${origin}/robots.txt`, controller.signal).catch(() => null),
      fetchText(`${origin}/llms.txt`, controller.signal).catch(() => null),
    ]);
    robots = r?.ok ? r.body : "";
    llms = Boolean(l?.ok && l.body.trim().length > 20);
  } finally {
    clearTimeout(timer);
  }

  const nodes = jsonLdNodes(html);
  const h1 = tag(html, "h1");
  const title = tag(html, "title");
  const description = metaContent(html, "description");
  const text = serverRenderedText(html);
  const domain = target.hostname.replace(/^www\./, "");

  const checks: ScanCheck[] = [];
  const add = (c: ScanCheck) => checks.push(c);

  // 1 — Organization schema
  const hasOrg = hasType(nodes, "Organization", "LocalBusiness", "Corporation", "ProfessionalService");
  add({
    key: "organization_schema",
    label: "Organization schema",
    weight: 16,
    status: hasOrg ? "pass" : "fail",
    detail: hasOrg ? "Found structured data identifying the business." : "No Organization or LocalBusiness JSON-LD found.",
    why: "This is the cheapest way to make your identity unambiguous — it links your name to your domain and your profiles elsewhere.",
  });

  // 2 — sameAs corroboration
  const sameAs = nodes.some((n) => Array.isArray(n.sameAs) && (n.sameAs as unknown[]).length > 0);
  add({
    key: "same_as",
    label: "Third-party profiles (sameAs)",
    weight: 8,
    status: sameAs ? "pass" : hasOrg ? "warn" : "fail",
    detail: sameAs ? "Your schema links out to external profiles." : "No sameAs links to directories, socials or review sites.",
    why: "Engines weigh corroboration. A claim repeated on five domains beats the same claim on yours alone.",
  });

  // 3 — Descriptive H1
  const h1Descriptive = Boolean(h1 && h1.length >= 12 && CATEGORY_HINTS.test(h1));
  add({
    key: "h1",
    label: "Category-bearing H1",
    weight: 14,
    status: !h1 ? "fail" : h1Descriptive ? "pass" : "warn",
    detail: !h1
      ? "No H1 found on the homepage."
      : h1Descriptive
        ? `“${h1.slice(0, 80)}”`
        : `“${h1.slice(0, 80)}” — reads as a slogan rather than a description.`,
    why: "H1 text is weighted heavily when engines summarise a page. A slogan tells a model nothing about what you sell.",
  });

  // 4 — Meta description
  const genericDesc = description ? GENERIC_DESCRIPTIONS.some((g) => description.toLowerCase().includes(g)) : false;
  add({
    key: "meta_description",
    label: "Meta description",
    weight: 10,
    status: !description ? "fail" : genericDesc || description.length < 50 ? "warn" : "pass",
    detail: !description
      ? "No meta description."
      : genericDesc
        ? "Present but generic placeholder text."
        : `${description.length} characters.`,
    why: "Often the single sentence an engine quotes back when describing your business.",
  });

  // 5 — Server-rendered content
  const chars = text.length;
  add({
    key: "server_rendered",
    label: "Content without JavaScript",
    weight: 16,
    status: chars > 1200 ? "pass" : chars > 350 ? "warn" : "fail",
    detail: `${chars.toLocaleString()} characters of text in the raw HTML.`,
    why: "Most AI crawlers don't execute JavaScript. If your content renders client-side, it doesn't exist to them.",
  });

  // 6 — FAQ schema
  const hasFaq = hasType(nodes, "FAQPage", "QAPage");
  add({
    key: "faq_schema",
    label: "FAQ structure",
    weight: 8,
    status: hasFaq ? "pass" : "warn",
    detail: hasFaq ? "FAQPage schema found." : "No FAQPage schema on the homepage.",
    why: "Question-and-answer pairs are the most directly reusable format for answer engines.",
  });

  // 7 — Service / product schema
  const hasService = hasType(nodes, "Service", "Product", "Offer", "OfferCatalog");
  add({
    key: "service_schema",
    label: "Service or product schema",
    weight: 10,
    status: hasService ? "pass" : "fail",
    detail: hasService ? "Found Service/Product structured data." : "Nothing machine-readable describes what you offer.",
    why: "“Best X for Y” prompts are answered from exactly this — what you offer, and where.",
  });

  // 8 — AI crawler policy
  const bots = ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "anthropic-ai", "CCBot"];
  const named = bots.filter((b) => new RegExp(`user-agent:\\s*${b}`, "i").test(robots));
  const blocksAll = /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*$/im.test(robots);
  add({
    key: "ai_crawlers",
    label: "AI crawler policy",
    weight: 10,
    status: blocksAll ? "fail" : named.length > 0 ? "pass" : "warn",
    detail: blocksAll
      ? "robots.txt appears to disallow all crawlers."
      : named.length > 0
        ? `robots.txt names ${named.join(", ")}.`
        : robots
          ? "robots.txt exists but says nothing about AI crawlers."
          : "No robots.txt found.",
    why: "Explicitly allowing the major AI crawlers removes any doubt about whether your content may be used.",
  });

  // 9 — llms.txt
  add({
    key: "llms_txt",
    label: "llms.txt",
    weight: 4,
    status: llms ? "pass" : "warn",
    detail: llms ? "Found /llms.txt." : "No /llms.txt published.",
    why: "An emerging convention for telling models what your business is and which pages to prefer.",
  });

  // 10 — Title
  add({
    key: "title",
    label: "Page title",
    weight: 4,
    status: !title ? "fail" : title.length < 15 || GENERIC_DESCRIPTIONS.some((g) => title.toLowerCase().includes(g)) ? "warn" : "pass",
    detail: title ? `“${title.slice(0, 70)}”` : "No title tag.",
    why: "The title is the label engines carry alongside every citation of your site.",
  });

  const earned = checks.reduce((n, c) => n + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  const possible = checks.reduce((n, c) => n + c.weight, 0);

  return {
    url: target.toString(),
    domain,
    score: Math.round((earned / possible) * 100),
    checks,
    fetchedAt: new Date().toISOString(),
  };
}
