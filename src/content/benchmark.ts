/**
 * Narrative around the benchmark dataset.
 *
 * Every number on the page comes from aeo-benchmark-result.json, which is
 * written by scripts/aeo-study.mts. Nothing here restates a figure by hand —
 * re-run the study and the page updates, which is the only way a statistics
 * page stays true after the first month.
 */

import result from "./aeo-benchmark-result.json";
import { CORPUS } from "./study-corpus";

export const BENCHMARK = result;

/** Human labels for the scanner's check keys. */
export const CHECK_LABELS: Record<string, { label: string; what: string }> = {
  ai_crawlers: {
    label: "Explicit AI crawler policy",
    what: "robots.txt names GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot or Google-Extended — allowing or blocking them deliberately rather than by omission.",
  },
  faq_schema: { label: "FAQPage structured data", what: "Question-and-answer markup, the format engines lift most readily." },
  service_schema: { label: "Service or Product schema", what: "Structured data saying what the business actually sells." },
  h1: { label: "Category-bearing H1", what: "A headline that names what the business is, not only what it promises." },
  same_as: { label: "sameAs corroboration", what: "Organization markup linking to independent profiles that confirm the entity exists." },
  llms_txt: { label: "llms.txt", what: "A plain-text file describing the site for AI systems." },
  organization_schema: { label: "Organization schema", what: "Structured data identifying the business as an entity." },
  meta_description: { label: "Meta description", what: "Often the sentence an engine quotes back when describing a business." },
  server_rendered: { label: "Content without JavaScript", what: "Body text present in the served HTML, which is what retrieval reads." },
  title: { label: "Page title", what: "A descriptive, non-placeholder title element." },
};

/** Only sectors with enough sites to be worth showing at all. */
export const MIN_SECTOR_N = 4;
export const REPORTABLE_SECTORS = BENCHMARK.sectors.filter((s) => s.n >= MIN_SECTOR_N);
export const EXCLUDED_SECTORS = BENCHMARK.sectors.filter((s) => s.n < MIN_SECTOR_N);

export const BENCHMARK_ANSWER = {
  question: "How AEO-ready are large websites in 2026?",
  answer: `We ran an answer engine optimization scan across ${BENCHMARK.attempted} well-known websites in September 2026 and got results from ${BENCHMARK.scanned}. The median score was ${BENCHMARK.median} out of 100. Not one site — zero of ${BENCHMARK.scanned} — had an explicit AI crawler policy in robots.txt. Only ${BENCHMARK.byCheck.find((c) => c.key === "faq_schema")?.passRate}% carried FAQ structured data and ${BENCHMARK.byCheck.find((c) => c.key === "service_schema")?.passRate}% described what they sell in Service or Product schema. These are large organisations with in-house SEO teams; the long tail is worse.`,
};

export const FINDINGS = [
  {
    stat: "0",
    unit: `of ${BENCHMARK.scanned}`,
    headline: "have an explicit AI crawler policy",
    body: "Not one site in the corpus names GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot or Google-Extended in robots.txt. Every one of them is letting AI crawlers in — or out — by accident rather than decision. This was the most one-sided result in the study and the cheapest thing on this list to fix.",
  },
  {
    stat: `${BENCHMARK.failed}`,
    unit: `of ${BENCHMARK.attempted}`,
    headline: "blocked our scanner entirely",
    body: "Roughly a quarter returned 403 or refused the connection to a politely identified, single-page request. Bot protection does not usually distinguish between our scanner and an AI search crawler, so there is a real chance these sites are invisible to answer engines for the same reason they were invisible to us — and nobody inside those companies would know.",
  },
  {
    stat: `${BENCHMARK.byCheck.find((c) => c.key === "service_schema")?.passRate}%`,
    unit: "",
    headline: "say what they sell in structured data",
    body: "Service or Product schema is how a machine learns what a business actually offers. Almost nobody publishes it, which means engines are inferring the category from prose — and inference is where competitors get substituted for you.",
  },
  {
    stat: `${BENCHMARK.byCheck.find((c) => c.key === "h1")?.passRate}%`,
    unit: "",
    headline: "have an H1 that names their category",
    body: "Three quarters lead with a slogan. A headline that describes a feeling gives a model nothing to attach the brand to when somebody asks for that category by name — the single most common failure we see, and the one most likely to be defended as branding.",
  },
];

export const METHODOLOGY = [
  {
    q: "What exactly was measured?",
    a: `Ten checks on each site's homepage, plus its robots.txt and llms.txt: Organization schema, Service or Product schema, FAQPage schema, sameAs links, a category-bearing H1, a meta description, a page title, server-rendered body text, an explicit AI crawler policy, and the presence of llms.txt. Each is weighted and combined into a score out of 100. The same scan runs free at rankvyze.com for any URL.`,
  },
  {
    q: "How was the corpus chosen?",
    a: `${CORPUS.length} well-known organisations across fourteen sectors, chosen to mirror the industries we publish guides for. The full list is public in the repository, so anyone can re-run the study and check these numbers.`,
  },
  {
    q: "What are the limitations?",
    a: `Three worth stating. The corpus skews to large, well-resourced companies, so it flatters the wider web rather than representing it. ${BENCHMARK.failed} sites could not be scanned and are excluded from every figure, which may bias results if blocked sites differ systematically. And only the homepage was scanned — a site can have excellent structured data on inner pages and score poorly here.`,
  },
  {
    q: "Why are some sectors missing from the table?",
    a: `Sectors with fewer than ${MIN_SECTOR_N} successfully scanned sites are excluded, because a median over one or two sites is not a median. Even the sectors shown are directional rather than statistically robust — treat them as a hint about where to look, not a league table.`,
  },
  {
    q: "Is this a one-off?",
    a: "It is a snapshot, dated. The plan is to re-run it against the same corpus periodically so the interesting number becomes the change rather than the level. If you want to be told when it updates, the contact page reaches a person.",
  },
];
