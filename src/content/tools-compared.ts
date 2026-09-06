/**
 * The AI visibility tools comparison.
 *
 * Pricing is the easiest thing to get wrong about a competitor and the most
 * damaging. So every figure marked `verified` was read off that vendor's own
 * pricing page on the date below; anything they don't publish is recorded as
 * not published rather than filled in from a roundup article.
 *
 * Cost per prompt per month is the derived column that actually decides this
 * purchase. Headline price hides it: a $29 plan covering 15 prompts is not
 * cheaper than a $189 plan covering 100.
 */

export const PRICING_CHECKED = "6 September 2026";

export interface Tool {
  name: string;
  url: string;
  pricingUrl?: string;
  /** True when the numbers came from the vendor's own pricing page. */
  verified: boolean;
  entry: string;
  entryPrompts: string;
  /** Derived, not claimed. null where the vendor publishes no price. */
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
    verified: true,
    entry: "$29/mo (Lite) · $189/mo (Standard) · $489/mo (Premium)",
    entryPrompts: "15 · 100 · 400 prompts",
    costPerPrompt: "≈$1.93 → $1.22",
    engines: "ChatGPT, Google AI Overviews, Perplexity, Copilot. Claude, Gemini and AI Mode are paid add-ons.",
    bestFor: "The cheapest honest way to start. If you want a trend line and nothing else, Lite is hard to argue with.",
    watchOut:
      "15 prompts on the entry plan is 15 questions total, not per engine. Add-on engines change the effective price meaningfully.",
  },
  {
    name: "Profound",
    url: "https://tryprofound.com",
    pricingUrl: "https://www.tryprofound.com/pricing",
    verified: true,
    entry: "$99/mo (Starter) · $399/mo (Growth) · Enterprise custom",
    entryPrompts: "50 · 100 prompts",
    costPerPrompt: "≈$1.98 → $3.99",
    engines: "Starter is ChatGPT only. Growth covers 3 engines. Enterprise up to 9.",
    bestFor: "Large brands with a dedicated team. Deepest analytics in the category and the funding to match.",
    watchOut:
      "Starter tracks ChatGPT alone, which is a single-engine view of a multi-engine problem. Listed prices are billed yearly.",
  },
  {
    name: "Rank Prompt",
    url: "https://rankprompt.com",
    pricingUrl: "https://rankprompt.com/pricing/",
    verified: false,
    entry: "Not published on the site",
    entryPrompts: "150 → 2,000 prompts/mo across four tiers",
    costPerPrompt: null,
    engines: "ChatGPT, Perplexity, Google AI Mode, Claude, Gemini, Grok — six, the widest here.",
    bestFor: "Agencies and multi-location businesses. One-click multi-location tracking is genuinely uncommon.",
    watchOut: "No public pricing, so you cannot compare cost per prompt without a sales conversation.",
  },
  {
    name: "Peec AI",
    url: "https://peec.ai",
    verified: false,
    entry: "Reported around €85/mo; not verified from their page",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Multiple",
    bestFor: "In-house marketing teams who want clean reporting rather than a data platform.",
    watchOut: "We could not verify pricing directly — check before budgeting.",
  },
  {
    name: "Scrunch AI",
    url: "https://scrunchai.com",
    verified: false,
    entry: "Reported around $299/mo; not verified from their page",
    entryPrompts: "Not published",
    costPerPrompt: null,
    engines: "Multiple",
    bestFor: "Teams wanting agent-behaviour analytics alongside visibility tracking.",
    watchOut: "We could not verify pricing directly — check before budgeting.",
  },
];

export const TOOLS_ANSWER = {
  question: "What is the best AI visibility tool?",
  answer:
    "There is no single best one, because they split by budget and by team rather than by quality. Otterly.AI is the cheapest credible entry at $29/month for 15 prompts; Profound is the enterprise choice at $399/month for 100 prompts across three engines; Rank Prompt covers the most engines and suits agencies and multi-location brands. The number that decides it is cost per tracked prompt per month, not headline price — and all of them measure without fixing anything, which is a separate purchase.",
};

export const CHOOSING = [
  {
    q: "How many prompts do you actually need?",
    a: "Ten to twenty is enough for a stable rate. Plans are sold on prompt volume, so buying 400 when you will maintain 20 is the most common way to overspend here.",
  },
  {
    q: "How many engines matter to your buyers?",
    a: "Four covers almost everyone. Six looks better on a comparison table but adds cost, and Grok or AI Mode coverage is rarely what decides a deal.",
  },
  {
    q: "Do you have someone to act on the data?",
    a: "This is the real question. Every tool here produces findings, not fixes. Without a person to implement them, a monitoring subscription is a year of watching a flat line.",
  },
  {
    q: "Is the score comparable to anything?",
    a: "No. Each platform uses its own prompt set, engines and weighting, and most do not publish the formula. Only compare a score to its own history.",
  },
];

export const WHERE_WE_FIT = {
  body: "RankVyze is not on this list as a cheaper monitoring tool, because it isn't one. It is a $99 one-time engagement that measures for a week and then spends the remaining five fixing what it found, refunded in full if at least two of four engines still don't mention you after 45 days. If what you want is a permanent dashboard and a trend line stretching into next year, buy one of the tools above — we are the wrong shape for that, and we would rather say so than sell you a worse version of it.",
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
