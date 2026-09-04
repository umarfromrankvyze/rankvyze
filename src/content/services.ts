import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

/**
 * Copy for /answer-engine-optimization — the commercial page.
 *
 * Kept as data rather than JSX so the FAQ feeds both the visible accordion and
 * the FAQPage markup from one source. Structured data that can drift from the
 * page it describes is the failure this product exists to fix; it would be
 * embarrassing to ship it on our own site.
 */

export const SERVICE_FAQ = [
  {
    q: "What does an answer engine optimization service actually do?",
    a: `Three things. It measures how AI engines currently answer the questions your buyers ask, audits your site for the signals those engines rely on — entity clarity, structured data, server-rendered content, crawler access, corroboration — and then implements the fixes. RankVyze does all three for ${PRICE_LABEL}, and hands you reviewable changes rather than a PDF of recommendations.`,
  },
  {
    q: "How much does answer engine optimization cost?",
    a: `Agencies in this category typically quote $2,000–$10,000 per month on a retainer, and most won't publish a number at all. RankVyze is ${PRICE_LABEL} once for a ${GUARANTEE_DAYS}-day sprint, refunded in full if your business isn't mentioned on at least ${GUARANTEE_MIN_ENGINES} of the four engines by the end of it.`,
  },
  {
    q: "Is AEO the same as GEO or LLM SEO?",
    a: "In practice, yes. Generative Engine Optimization (GEO), LLM SEO and AI search optimization all describe the same work: making a business legible enough that an AI system will recommend it inside a generated answer. The labels differ; the work doesn't.",
  },
  {
    q: "Do I still need traditional SEO?",
    a: "Yes. Answer engines lean on much of the same infrastructure — crawlability, site structure, page quality, authority — and Google's AI Overviews are generated from the ordinary Search index. AEO is a layer on top, not a replacement. Anyone telling you to stop doing SEO is selling something.",
  },
  {
    q: "How long before anything changes?",
    a: `Technical fixes — schema, rendering, crawler policy — can register within days to a few weeks, because retrieval reads your live site. Content and third-party corroboration usually take a month or two. The ${GUARANTEE_DAYS}-day window exists because that is roughly how long the whole picture takes to move.`,
  },
  {
    q: "What if it doesn't work?",
    a: `You get your money back. If your business isn't mentioned on ${GUARANTEE_MIN_ENGINES} or more engines within ${GUARANTEE_DAYS} days, on the prompt set agreed at day zero, the ${PRICE_LABEL} is refunded in full. The conditions that void it are published in advance on the guarantee page — there are no others.`,
  },
  {
    q: "Which businesses does this work for?",
    a: "Anything with a considered purchase: B2B software, agencies, professional services, legal, healthcare, high-ticket ecommerce. The test is whether your buyers ask comparative questions before choosing. If they do, an AI answer is already shaping that decision — with or without you in it.",
  },
];

export const WHAT_WE_DO = [
  {
    title: "Measure where you actually stand",
    body: "We run the questions your buyers ask through ChatGPT, Perplexity, Gemini and Claude, in signed-out sessions, and record who gets named, in what position, and which pages get cited. That's your baseline. Skipping it is why most AEO work is unfalsifiable — without it you can't tell a change that worked from a model update that happened to help.",
  },
  {
    title: "Audit the signals engines read",
    body: "Six categories, scored: entity clarity, structured data, content coverage, technical rendering, crawler access and corroboration. Every finding names the specific gap and the specific fix, not a grade.",
  },
  {
    title: "Implement the fixes",
    body: "Schema, rendering, crawler policy, homepage entity definition and the content that answers questions nothing on your site currently answers. Delivered as reviewable code and content changes that you approve before anything ships.",
  },
  {
    title: "Re-measure against the baseline",
    body: `The same prompts, the same engines, at the end of the ${GUARANTEE_DAYS} days. You see the before and after on one screen, per engine and per question — which is also how the guarantee is judged.`,
  },
];

export const ENGINES_COVERED = [
  { key: "chatgpt", name: "ChatGPT", note: "OAI-SearchBot indexing and search-backed answers" },
  { key: "perplexity", name: "Perplexity", note: "Citation share, the fastest-moving signal" },
  { key: "gemini", name: "Gemini", note: "Google-Extended and AI Overviews eligibility" },
  { key: "claude", name: "Claude", note: "ClaudeBot access and entity recall" },
];
