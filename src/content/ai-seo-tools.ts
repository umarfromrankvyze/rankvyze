import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

/**
 * The AI SEO / GEO tools comparison.
 *
 * Sourcing rule for this file: every price below was read from a page we
 * actually fetched, and the source is named on the page next to the figure.
 * Nothing is estimated, rounded from memory, or inferred from a competitor's
 * marketing. Where a vendor does not publish a price we say so rather than
 * guessing — Peec's own pricing page, for instance, lists four tiers and no
 * numbers at all.
 *
 * Verified 2026-09-06. Pricing in this category moves fast; PRICES_VERIFIED is
 * rendered on the page so a reader can judge how stale it is, and it is the one
 * value to bump when these are re-checked.
 */

export const PRICES_VERIFIED = "6 September 2026";

export interface ToolListing {
  name: string;
  /** What it fundamentally does. The distinction that actually matters. */
  kind: "Measures" | "Measures + fixes";
  price: string;
  /** Where that price came from. Shown, so the claim is checkable. */
  source: "vendor" | "semrush";
  engines: string;
  bestFor: string;
  /** Honest limitation. Every entry has one, including ours. */
  caveat: string;
  url: string;
  us?: boolean;
}

export const TOOLS_COMPARED: ToolListing[] = [
  {
    name: "RankVyze",
    kind: "Measures + fixes",
    price: `${PRICE_LABEL} once`,
    source: "vendor",
    engines: "ChatGPT, Perplexity, Gemini, Claude",
    bestFor: "Getting mentioned, not just finding out you aren't",
    caveat:
      "A fixed 45-day sprint, not continuous tracking. If you need daily monitoring across hundreds of prompts forever, a subscription tracker does that better.",
    url: "/pricing",
    us: true,
  },
  {
    name: "Otterly.AI",
    kind: "Measures",
    price: "From $29/mo",
    source: "vendor",
    engines: "ChatGPT, AI Overviews, Perplexity, Copilot",
    bestFor: "The cheapest way to start tracking",
    caveat: "15 prompts on the entry plan; 100 prompts is $189/mo.",
    url: "https://otterly.ai/pricing/",
  },
  {
    name: "Peec AI",
    kind: "Measures",
    price: "From $95/mo",
    source: "semrush",
    engines: "ChatGPT and other major engines",
    bestFor: "Prompt-level daily tracking",
    caveat: "Its own pricing page lists four tiers and no numbers — we could not verify this figure at source.",
    url: "https://www.peec.ai/",
  },
  {
    name: "Profound",
    kind: "Measures",
    price: "From $99/mo",
    source: "semrush",
    engines: "Major AI engines",
    bestFor: "Enterprise answer-engine analytics",
    caveat: "Positioned upmarket; the entry tier is not where most of its product lives.",
    url: "https://www.tryprofound.com/",
  },
  {
    name: "Semrush AI Visibility Toolkit",
    kind: "Measures",
    price: "From $99/mo",
    source: "semrush",
    engines: "Major AI engines",
    bestFor: "Teams already paying for Semrush",
    caveat: "Most useful as an add-on to a Semrush subscription rather than bought alone.",
    url: "https://www.semrush.com/",
  },
  {
    name: "Writesonic GEO Suite",
    kind: "Measures",
    price: "From $99/mo",
    source: "semrush",
    engines: "ChatGPT, Perplexity, AI Overviews, Gemini, Claude, Copilot, Grok",
    bestFor: "The widest engine coverage on this list",
    caveat: "Bundled into a broader content platform, so you are buying more than tracking.",
    url: "https://writesonic.com/",
  },
  {
    name: "Scrunch AI",
    kind: "Measures",
    price: "From $250/mo",
    source: "semrush",
    engines: "Major AI engines",
    bestFor: "Agencies managing several brands",
    caveat: "$500/mo for the agency tier. Priced well above the entry-level trackers.",
    url: "https://www.scrunchai.com/",
  },
  {
    name: "Evertune",
    kind: "Measures",
    price: "From $800/mo",
    source: "semrush",
    engines: "Major AI engines",
    bestFor: "Brand-level model analysis at enterprise scale",
    caveat: "The most expensive entry point here by a wide margin.",
    url: "https://www.evertune.ai/",
  },
  {
    name: "Conductor",
    kind: "Measures",
    price: "Usage-based",
    source: "semrush",
    engines: "Major AI engines",
    bestFor: "Existing Conductor customers",
    caveat: "No published starting price; cost depends on usage.",
    url: "https://www.conductor.com/",
  },
];

/** The sub-questions this page answers, each phrased the way people search it. */
export const SECTIONS = [
  {
    id: "best-geo-tools",
    heading: "Best GEO tools",
    body: "Generative Engine Optimization is the same work under a different label, so the GEO tool market and the AI SEO tool market are the same market. Otterly.AI is the cheapest entry point at $29/mo; Peec AI, Profound, Semrush and Writesonic cluster around $95–$99/mo; Scrunch and Evertune sit above that. All of them measure. If you want the gap closed rather than reported, that is a different purchase.",
  },
  {
    id: "best-ai-visibility-tools",
    heading: "Best AI visibility tools",
    body: "“AI visibility” usually means one number: how often an engine names your brand across a set of tracked prompts. Every tool here computes it, and they mostly disagree, because the prompt set and the query method differ. Ask any vendor whether they query the consumer product or an API — the API behaves differently, with different retrieval and no personalisation, and that changes what the number means.",
  },
  {
    id: "best-tools-to-rank-on-chatgpt",
    heading: "Best tools to rank on ChatGPT",
    body: "No tool ranks you on ChatGPT, and any that claims to is describing something that does not exist — there is no paid placement in ChatGPT's organic answers. What moves it is entity clarity, structured data, server-rendered content, crawler access and third-party corroboration. Trackers tell you where you stand on those. Implementation is what changes it.",
  },
  {
    id: "best-ai-search-optimization-software",
    heading: "Best AI search optimization software",
    body: "The honest split in this category is between software that measures and a service that implements. A $29/mo tracker and a $800/mo platform both hand you a dashboard; neither rewrites your homepage, adds Organization schema or fixes a blocked crawler. Decide which half you are buying before you compare feature lists, because that decision explains almost the entire price range.",
  },
];

export const FAQ = [
  {
    q: "What is the best AI SEO tool?",
    a: `It depends on whether you want to measure or to be found. For tracking alone, Otterly.AI is the cheapest at $29/mo and Peec AI, Profound, Semrush and Writesonic sit around $95–$99/mo. For getting mentioned rather than monitored, RankVyze is ${PRICE_LABEL} once for a ${GUARANTEE_DAYS}-day sprint that measures, fixes and re-measures — refunded in full if you are not mentioned on ${GUARANTEE_MIN_ENGINES}+ engines.`,
  },
  {
    q: "How much do AI SEO and GEO tools cost?",
    a: "Published starting prices run from $29/mo (Otterly.AI) to $800/mo (Evertune), with most clustering at $95–$99/mo. Agency tiers are higher — Scrunch is $500/mo. Several vendors publish no price at all. RankVyze is a one-time $99 rather than a subscription.",
  },
  {
    q: "Can any tool actually get me ranked on ChatGPT?",
    a: "No tool ranks you, because ChatGPT has no ranking positions and no paid placement in organic answers. Tools measure whether you are named. Being named is the result of entity clarity, structured data, crawler access, answer-shaped content and corroboration — work someone has to do to your site.",
  },
  {
    q: "What is the difference between AI SEO tools and GEO tools?",
    a: "Nothing meaningful. AI SEO, GEO (Generative Engine Optimization), AEO (Answer Engine Optimization) and LLM SEO all describe optimizing to be recommended inside AI-generated answers. Vendors pick whichever label they think will rank.",
  },
  {
    q: "Do I need a paid tool to check my AI visibility?",
    a: "Not to start. Ask ten buyer questions across ChatGPT, Perplexity, Gemini and Claude in a signed-out window and record who gets named — thirty minutes, no cost, and it produces the prompt list every tool would ask you for anyway. Our free AI Visibility Checker does the technical half of the same audit.",
  },
  {
    q: "Which AI SEO tool covers the most engines?",
    a: "Of the tools with published coverage, Writesonic's GEO Suite lists the most: ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Copilot and Grok. Coverage breadth matters less than whether the engines your buyers actually use are included.",
  },
];
