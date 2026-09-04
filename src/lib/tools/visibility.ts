import "server-only";
import { ToolError, decodeEntities, fetchChecked, jsonLdNodes, metaContent, serverRenderedText, tagText } from "./http";
import { isAllowed, parseRobots } from "./robots-parser";
import { fetchPage } from "./http";

/**
 * AI Visibility Checker.
 *
 * IMPORTANT — what this does and does not do.
 *
 * It does NOT ask ChatGPT, Perplexity, Gemini or Claude anything. Doing that
 * needs paid API keys, costs real money per check, and could not be given away
 * free. Every engine-facing number in this product comes from a real recorded
 * answer; inventing one here would be the exact failure the whole product
 * argues against, and it would be invisible to the person reading it.
 *
 * What it does instead is the half that can be computed honestly:
 *
 *   1. Work out what the business actually is, from its own page — the same
 *      inference an engine has to make. If we can't tell, neither can they, and
 *      that is itself the most useful finding.
 *   2. Generate the specific buyer questions worth testing, built from that
 *      entity rather than a generic list.
 *   3. Score readiness across the five signals that decide whether an engine
 *      *can* recommend you: identity, reachability, readability, structured
 *      facts, corroboration.
 *
 * The visitor then runs the prompts themselves, in a signed-out session, and
 * records what they see. That is exactly the manual research the paid
 * engagement automates with analysts.
 *
 * When an engine API is wired, `askEngines()` below is the single seam to
 * replace — the report shape already carries a slot for real answers.
 */

export interface DetectedEntity {
  name: string | null;
  /** "a Shopify agency", "an analytics platform" — how an engine would file it. */
  category: string | null;
  audience: string | null;
  location: string | null;
  /** How confident the extraction is. Drives the copy, not a fake number. */
  clarity: "clear" | "partial" | "unclear";
  /** The sentence a machine could form. Null when it genuinely can't. */
  statement: string | null;
}

export interface VisibilityPrompt {
  shape: "discovery" | "comparison" | "cost" | "local";
  text: string;
  why: string;
}

export interface ReadinessCheck {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  /** Share of the readiness score this check carries. */
  weight: number;
}

export interface VisibilityReport {
  url: string;
  finalUrl: string;
  entity: DetectedEntity;
  prompts: VisibilityPrompt[];
  checks: ReadinessCheck[];
  /** 0–100 readiness, NOT a measured visibility score. Named accordingly in UI. */
  readiness: number;
  engines: { key: string; name: string; url: string }[];
  /**
   * Always null today. Present so the UI already renders the "measured" path,
   * and so wiring an engine API is a change of one function rather than a
   * redesign.
   */
  measured: null;
}

/** Where the visitor goes to run each prompt themselves. */
const ENGINES = [
  { key: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/" },
  { key: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai/" },
  { key: "gemini", name: "Gemini", url: "https://gemini.google.com/" },
  { key: "claude", name: "Claude", url: "https://claude.ai/" },
];

const CATEGORY_HEADS =
  "agency|studio|consultancy|consulting|platform|software|app|tool|saas|marketplace|firm|practice|clinic|dentist|dental|lawyer|law|attorney|accountant|bookkeeping|marketing|seo|design|development|engineering|recruitment|staffing|logistics|manufacturer|supplier|distributor|wholesaler|retailer|store|shop|restaurant|cafe|hotel|gym|salon|spa|school|academy|training|insurance|mortgage|realtor|estate|builder|plumber|electrician|roofer|landscaper|cleaner|photographer|videographer|architect|therapist|coach|nutritionist|veterinarian";

/**
 * Capture up to two modifier words before the category head.
 *
 * The head alone is close to useless: "Shopify is a software" is both wrong and
 * unusable in a prompt. "ecommerce platform" is what an engine would actually
 * file it under, and it makes the generated questions read like something a
 * buyer would type.
 */
const CATEGORY_PHRASE = new RegExp(String.raw`\b((?:[a-z][a-z-]{2,14}\s+){0,2})(${CATEGORY_HEADS})\b`, "i");

/** Words that are grammatically adjacent but carry no category meaning. */
const MODIFIER_STOPWORDS = new Set([
  "the", "a", "an", "our", "your", "their", "its", "this", "that", "these", "those",
  "is", "are", "was", "were", "be", "been", "and", "or", "but", "for", "with", "from",
  "best", "top", "leading", "trusted", "premier", "award", "winning", "great", "good",
  "new", "free", "own", "more", "most", "very", "all", "any", "one", "we", "you", "they",
  "of", "in", "on", "at", "to", "by", "as", "it", "us", "get", "make", "help", "helps",
  // Engine and vendor names. Almost every site in this category lists them
  // ("ChatGPT, Gemini & Claude"), and picking one up as a modifier produces
  // nonsense like "a claude app" — found by running this tool on our own site.
  "chatgpt", "gemini", "claude", "perplexity", "openai", "anthropic", "google",
  "copilot", "bing", "meta", "microsoft", "apple", "amazon",
]);

/**
 * Values that describe reach rather than a place. "in Worldwide" is wrong, and
 * a "best X in Worldwide" prompt is worse.
 */
const NON_PLACES = new Set(["worldwide", "global", "globally", "international", "everywhere", "online", "remote"]);

/**
 * Mass nouns take no article: "a software" is wrong, "software" is right.
 * Getting this wrong is small but immediately visible in every generated prompt.
 */
const MASS_NOUNS = new Set([
  "software", "consulting", "marketing", "seo", "design", "development",
  "engineering", "recruitment", "staffing", "logistics", "insurance",
  "bookkeeping", "training", "law",
]);

const AUDIENCE_PATTERNS = [
  /\bfor ([a-z][a-z\s,&-]{4,45}?)(?:\.|,|—|–|\||$)/i,
  /\bhelps? ([a-z][a-z\s,&-]{4,45}?)(?:\.|,| to | with |—|–|\||$)/i,
  /\bbuilt for ([a-z][a-z\s,&-]{4,45}?)(?:\.|,|—|–|\||$)/i,
];

const LOCATION_PATTERNS = [
  /\bin ((?:[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/,
  /\b(?:serving|based in|located in)\s+([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*)/,
];

function extractEntity(html: string, nodes: Record<string, unknown>[]): DetectedEntity {
  const org = nodes.find((n) => {
    const t = n["@type"];
    const type = Array.isArray(t) ? t[0] : t;
    return typeof type === "string" && /Organization|LocalBusiness|Corporation/i.test(type);
  });

  const name =
    (typeof org?.name === "string" ? org.name : null) ??
    metaContent(html, "og:site_name") ??
    tagText(html, "title")?.split(/[|—–·-]/)[0].trim() ??
    null;

  const h1 = tagText(html, "h1");
  const description =
    (typeof org?.description === "string" ? org.description : null) ??
    metaContent(html, "description") ??
    "";

  // The first stretch of body copy is where a homepage usually says what it is.
  const opening = serverRenderedText(html).slice(0, 700);

  // Strip URLs, hostnames and emails first. A dot is a word boundary, so
  // "app.rankvyze.com" matched the category head "app" and reported our own
  // site as "an app" — a category read out of a subdomain, not out of prose.
  const haystack = decodeEntities([h1, description, opening].filter(Boolean).join(". "))
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b[\w-]+@[\w.-]+\b/g, " ")
    .replace(/\b[\w-]+(?:\.[\w-]+)+\b/g, " ");

  // Score every candidate rather than taking the first.
  //
  // The first match is usually the worst one: a bare head word appearing early
  // in nav or boilerplate. Running this on our own site produced "RankVyze is
  // an app" when the page plainly says "answer engine optimization platform"
  // further down. A qualified phrase is always the better answer, so candidates
  // carrying a surviving modifier win, and longer phrases break the tie.
  let category: string | null = null;
  let bestScore = -1;
  for (const match of haystack.matchAll(new RegExp(CATEGORY_PHRASE.source, "gi"))) {
    const head = match[2].toLowerCase();
    const modifier = (match[1] ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w && !MODIFIER_STOPWORDS.has(w))
      // Only the word immediately before the head; two stacked adjectives
      // usually drag in unrelated copy.
      .slice(-1);
    const phrase = [...modifier, head].join(" ");
    const score = (modifier.length > 0 ? 100 : 0) + phrase.length;
    if (score > bestScore) {
      bestScore = score;
      category = phrase;
    }
  }

  let audience: string | null = null;
  for (const pattern of AUDIENCE_PATTERNS) {
    const m = pattern.exec(haystack);
    if (m?.[1]) {
      audience = m[1].trim().replace(/\s+/g, " ");
      break;
    }
  }

  let location: string | null = null;
  const areaServed = org?.areaServed;
  if (typeof areaServed === "string" && !NON_PLACES.has(areaServed.trim().toLowerCase())) location = areaServed;
  else {
    for (const pattern of LOCATION_PATTERNS) {
      const m = pattern.exec(haystack);
      if (m?.[1] && !NON_PLACES.has(m[1].trim().toLowerCase())) {
        location = m[1].trim();
        break;
      }
    }
  }

  const known = [name, category, audience].filter(Boolean).length;
  const clarity = known >= 3 ? "clear" : known === 2 ? "partial" : "unclear";

  const statement =
    name && category
      ? `${name} is ${withArticle(category)}${audience ? ` for ${audience}` : ""}${location ? ` in ${location}` : ""}.`
      : null;

  return { name, category, audience, location, clarity, statement };
}

/** "a agency" and "a software" are both wrong, for different reasons. */
function withArticle(phrase: string) {
  const head = phrase.split(/\s+/).pop() ?? phrase;
  if (MASS_NOUNS.has(head)) return phrase;
  return `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
}

function buildPrompts(entity: DetectedEntity): VisibilityPrompt[] {
  const category = entity.category ?? "provider";
  const audience = entity.audience;
  const prompts: VisibilityPrompt[] = [];

  prompts.push({
    shape: "discovery",
    text: audience ? `What's the best ${category} for ${audience}?` : `What's the best ${category} available right now?`,
    why: "Category discovery — whether you're in the consideration set at all.",
  });

  prompts.push({
    shape: "discovery",
    text: audience ? `Recommend a few ${category} options for ${audience}` : `Recommend a few ${category} options`,
    why: "The same question phrased as a request. Engines answer these differently.",
  });

  prompts.push({
    shape: "comparison",
    text: `How do I choose between ${category} options? What should I compare?`,
    why: "Criteria questions. Engines often answer these without naming anyone — an unclaimed answer.",
  });

  prompts.push({
    shape: "cost",
    text: `How much does ${withArticle(category)} cost?`,
    why: "Commercial intent. Usually won by whoever published a real number.",
  });

  if (entity.location) {
    prompts.push({
      shape: "local",
      text: `Best ${category} in ${entity.location}`,
      why: "Location qualifier — tests whether your area is attached to the entity.",
    });
  }

  if (entity.name) {
    prompts.push({
      shape: "discovery",
      text: `What is ${entity.name}?`,
      why: "Recall check. Run it last — it tests memory of a name you supplied, not discovery.",
    });
  }

  return prompts;
}

/**
 * The seam for real engine queries.
 *
 * Returns null, deliberately and always, until an engine API is configured.
 * Kept as a named function so the intent is legible in the codebase rather than
 * an absence someone later mistakes for an oversight.
 */
function askEngines(): null {
  return null;
}

export async function checkVisibility(rawUrl: string): Promise<VisibilityReport> {
  const { url, page } = await fetchChecked(rawUrl);
  if (!page.ok) throw new ToolError(`That page returned HTTP ${page.status}. Check the address and try again.`);

  const html = page.body;
  const { nodes } = jsonLdNodes(html);
  const entity = extractEntity(html, nodes);
  const text = serverRenderedText(html);
  const words = text.split(/\s+/).filter(Boolean).length;

  // Crawler reachability, from the site's own robots.txt.
  const robots = await fetchPage(`${url.protocol}//${url.host}/robots.txt`, { accept: "text/plain,*/*;q=0.8" }).catch(
    () => null,
  );
  const robotsUsable = robots?.ok && !/^\s*<(!doctype|html)/i.test(robots.body);
  const groups = parseRobots(robotsUsable ? robots.body : "");
  const searchBots = ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "Googlebot"];
  const blockedBots = searchBots.filter((bot) => !isAllowed(groups, bot, "/").allowed);

  const hasOrg = nodes.some((n) => {
    const t = n["@type"];
    const type = Array.isArray(t) ? t[0] : t;
    return typeof type === "string" && /Organization|LocalBusiness/i.test(type);
  });
  const sameAs = nodes.find((n) => Array.isArray(n.sameAs) && (n.sameAs as unknown[]).length > 0);

  const checks: ReadinessCheck[] = [
    {
      key: "identity",
      label: "An engine can tell what you are",
      weight: 35,
      status: entity.clarity === "clear" ? "pass" : entity.clarity === "partial" ? "warn" : "fail",
      detail:
        entity.statement !== null
          ? `Readable as: “${entity.statement}”`
          : "We couldn't form the sentence “X is a Y for Z” from this page. An engine has to make the same inference, and it has less patience than we do.",
    },
    {
      key: "reachable",
      label: "Search crawlers can reach you",
      weight: 25,
      status: blockedBots.length === 0 ? "pass" : "fail",
      detail:
        blockedBots.length === 0
          ? "No search crawler is blocked in robots.txt."
          : `Blocked in robots.txt: ${blockedBots.join(", ")}. No content or schema work will help while this is true.`,
    },
    {
      key: "readable",
      label: "Your content exists without JavaScript",
      weight: 20,
      status: words >= 300 ? "pass" : words >= 120 ? "warn" : "fail",
      detail: `${words.toLocaleString()} words in the raw HTML. Most AI crawlers don't run JavaScript, so this is roughly all they get.`,
    },
    {
      key: "structured",
      label: "Machine-readable facts about you",
      weight: 12,
      status: hasOrg ? "pass" : "fail",
      detail: hasOrg
        ? "Organization markup found — your identity is stated rather than inferred."
        : "No Organization schema. Everything about you has to be guessed from prose.",
    },
    {
      key: "corroborated",
      label: "Independent sources agree",
      weight: 8,
      status: sameAs ? "pass" : "warn",
      detail: sameAs
        ? `${(sameAs.sameAs as unknown[]).length} sameAs profiles linked — engines follow these to corroborate you.`
        : "No sameAs profiles. Only your own domain vouches for you, which engines weight lightly.",
    },
  ];

  const readiness = Math.round(
    checks.reduce((sum, c) => sum + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0),
  );

  return {
    url: url.toString(),
    finalUrl: page.finalUrl,
    entity,
    prompts: buildPrompts(entity),
    checks,
    readiness,
    engines: ENGINES,
    measured: askEngines(),
  };
}
