/**
 * The AI visibility tools comparison.
 *
 * Merged from two pages that were competing for the same queries — one had the
 * wider vendor list, this one had the verification discipline. Both are kept:
 * nine tools, and a `source` on every price saying where the figure came from.
 *
 * That provenance field is the point. Pricing is the easiest thing to get
 * wrong about a competitor and the most damaging, and most comparison pages in
 * this category quote each other in a circle. "Read off their pricing page" and
 * "reported by a third party" are different claims and are labelled as such;
 * where a vendor publishes nothing, the table says so rather than inventing a
 * number to fill the column.
 *
 * Cost per prompt per month is derived, not quoted. It is the number that
 * actually decides this purchase and headline pricing hides it: a $29 plan
 * covering 15 prompts is not cheaper than a $189 plan covering 100.
 */

export const PRICING_CHECKED = "7 September 2026";

export type PriceSource = "vendor" | "thirdParty" | "none";

export const SOURCE_LABEL: Record<PriceSource, string> = {
  vendor: "read from their pricing page",
  thirdParty: "reported by a third party",
  none: "no public pricing",
};

export interface Tool {
  name: string;
  url: string;
  pricingUrl?: string;
  source: PriceSource;
  entry: string;
  entryPrompts: string;
  /** Derived from published price ÷ prompts. null where either is unknown. */
  costPerPrompt: string | null;
  engines: string;
  bestFor: string;
  watchOut: string;
}

export const TOOLS: Tool[] = [
  {
    name: "Otterly.AI",
    url: "https://otterly.ai",
    pricingUrl: "https://otterly.ai/pricing/",
    source: "vendor",
    entry: "$29 · $189 · $489/mo",
    entryPrompts: "15 · 100 · 400",
    costPerPrompt: "$1.93 → $1.22",
    engines: "ChatGPT, AI Overviews, Perplexity, Copilot. Claude, Gemini and AI Mode are paid add-ons.",
    bestFor: "The cheapest honest way to start. If you want a trend line and nothing else, Lite is hard to argue with.",
    watchOut:
      "15 prompts on the entry plan is 15 questions in total, not per engine. Add-on engines change the effective price meaningfully.",
  },
  {
    name: "Profound",
    url: "https://tryprofound.com",
    pricingUrl: "https://www.tryprofound.com/pricing",
    source: "vendor",
    entry: "$99 · $399/mo · Enterprise custom",
    entryPrompts: "50 · 100",
    costPerPrompt: "$1.98 → $3.99",
    engines: "Starter is ChatGPT only. Growth covers 3 engines. Enterprise up to 9.",
    bestFor: "Large brands with a dedicated team. Deepest analytics in the category and the funding to match.",
    watchOut:
      "Starter tracks ChatGPT alone, which is a single-engine view of a multi-engine problem. Listed prices are billed yearly.",
  },
  {
    name: "Semrush AI Visibility Toolkit",
    url: "https://www.semrush.com",
    source: "thirdParty",
    entry: "From $99/mo",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Major AI engines",
    bestFor: "Teams already paying for Semrush. Adding a module beats adding a vendor.",
    watchOut: "Most useful as an add-on to an existing subscription rather than bought alone.",
  },
  {
    name: "Writesonic GEO Suite",
    url: "https://writesonic.com",
    source: "thirdParty",
    entry: "From $99/mo",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "ChatGPT, Perplexity, AI Overviews, Gemini, Claude, Copilot, Grok — seven, the widest here.",
    bestFor: "Teams who want content generation and tracking from one vendor.",
    watchOut: "Bundled into a broader content platform, so you are buying considerably more than tracking.",
  },
  {
    name: "Peec AI",
    url: "https://peec.ai",
    source: "thirdParty",
    entry: "From $95/mo",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "ChatGPT and other major engines",
    bestFor: "In-house marketing teams who want clean reporting rather than a data platform.",
    watchOut: "Their own pricing page lists four tiers with no numbers, so we could not verify this figure at source.",
  },
  {
    name: "Rank Prompt",
    url: "https://rankprompt.com",
    pricingUrl: "https://rankprompt.com/pricing/",
    source: "none",
    entry: "Not published",
    entryPrompts: "150 → 2,000",
    costPerPrompt: null,
    engines: "ChatGPT, Perplexity, Google AI Mode, Claude, Gemini, Grok",
    bestFor: "Agencies and multi-location businesses. One-click multi-location tracking is genuinely uncommon.",
    watchOut: "No public pricing, so you cannot compare cost per prompt without a sales conversation.",
  },
  {
    name: "Scrunch AI",
    url: "https://scrunchai.com",
    source: "thirdParty",
    entry: "From $250/mo",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Major AI engines",
    bestFor: "Teams wanting agent-behaviour analytics alongside visibility tracking.",
    watchOut: "Around $500/mo for the agency tier — priced well above the entry-level trackers.",
  },
  {
    name: "Evertune",
    url: "https://evertune.ai",
    source: "thirdParty",
    entry: "From $800/mo",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Major AI engines",
    bestFor: "Brand teams treating AI visibility as a measurement discipline with budget to match.",
    watchOut: "The most expensive entry point here by a wide margin.",
  },
  {
    name: "Conductor",
    url: "https://www.conductor.com",
    source: "none",
    entry: "Usage-based",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Major AI engines",
    bestFor: "Enterprises already running Conductor for organic search.",
    watchOut: "No published starting price; cost depends on usage, so budget with a quote rather than an estimate.",
  },
];

export const TOOLS_ANSWER = {
  question: "What is the best AI visibility tool?",
  answer:
    "There is no single best one, because they split by budget and by team rather than by quality. Otterly.AI is the cheapest credible entry at $29/month for 15 prompts; Profound is the enterprise choice at $399/month for 100 prompts across three engines; Rank Prompt and Writesonic cover the most engines; Evertune starts around $800/month. The number that decides it is cost per tracked prompt per month, not headline price — and every one of them measures without fixing anything, which is a separate purchase.",
};

export const CHOOSING = [
  {
    q: "How many prompts do you actually need?",
    a: "Ten to twenty is enough for a stable rate. Plans are sold on prompt volume, so buying 400 when you will maintain 20 is the most common way to overspend in this category.",
  },
  {
    q: "How many engines matter to your buyers?",
    a: "Four covers almost everyone. Six or seven looks better on a comparison table but adds cost, and Grok or AI Mode coverage is rarely what decides a deal.",
  },
  {
    q: "Do you have someone to act on the data?",
    a: "This is the real question. Every tool here produces findings, not fixes. Without a person to implement them, a monitoring subscription is a year of watching a flat line.",
  },
  {
    q: "Is the score comparable to anything?",
    a: "No. Each platform uses its own prompt set, engines and weighting, and most do not publish the formula. Only compare a score to its own history.",
  },
  {
    q: "How current are these prices?",
    a: `Checked ${PRICING_CHECKED}, and labelled by where each figure came from. This category reprices often — treat the table as a shortlist, and confirm on the vendor's own page before you commit.`,
  },
];

export const WHERE_WE_FIT = {
  body: "RankVyze is not in that table as a cheaper monitoring tool, because it isn't one. It is a $99 one-time engagement that measures for a week and spends the remaining five fixing what it found, refunded in full if at least two of four engines still don't mention you after 45 days. If what you want is a permanent dashboard and a trend line stretching into next year, buy one of the tools above — we are the wrong shape for that, and we would rather say so than sell you a worse version of it.",
  useThemIf: [
    "You need continuous tracking of 100+ prompts and a monthly report.",
    "You have an in-house team who will act on what the dashboard says.",
    "You want the raw data in your own warehouse via an API.",
  ],
  useUsIf: [
    "You want the problem fixed rather than charted.",
    "You do not have someone in-house to implement AEO work.",
    "You want the downside covered if it doesn't work.",
  ],
};
