/**
 * Head-to-head comparison pages.
 *
 * "X vs Y" and "X alternatives" are the queries that make an AI assistant name
 * a vendor, so these are the highest-intent pages on the site. They are also
 * the easiest to write badly: a page whose conclusion is always "choose us"
 * gets discounted by readers and engines alike, and deserves to be.
 *
 * The rule here is that every entry names something the competitor does better
 * and a specific reader who should buy them instead. That is not modesty — a
 * comparison with a foregone conclusion carries no information, and information
 * is the only reason anything gets cited.
 *
 * Pricing marked verified was read off the vendor's own pricing page on the
 * date below. Where a vendor publishes nothing, that is what it says.
 */

export const COMPARED_ON = "7 September 2026";

export interface Comparison {
  slug: string;
  /** Their name, exactly as they write it. */
  name: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Self-contained answer to "X vs RankVyze" — the passage an engine lifts. */
  verdict: string;
  /** The one axis this comparison really turns on. */
  realDifference: { heading: string; body: string };
  rows: { label: string; them: string; us: string }[];
  /** Named plainly. Never empty. */
  chooseThem: string[];
  chooseUs: string[];
  /** Something true about them that is genuinely better than us. */
  credit: string;
  faq: { q: string; a: string }[];
}

const US = {
  price: "$99 once",
  engines: "ChatGPT, Perplexity, Gemini, Claude",
  model: "45-day done-for-you sprint",
  measurement: "Analyst-run, signed-out, screenshot per check",
  fixes: "Implemented via API, your site builder, or a change pack",
  guarantee: "Full refund if fewer than 2 engines mention you in 45 days",
};

export const COMPARISONS: Comparison[] = [
  {
    slug: "otterly",
    name: "Otterly.AI",
    url: "https://otterly.ai",
    metaTitle: "Otterly.AI vs RankVyze",
    metaDescription:
      "Otterly.AI is the cheapest way to watch your AI visibility; RankVyze is a one-time sprint that changes it. Verified pricing, honest trade-offs, and who should buy which.",
    h1: "Otterly.AI vs RankVyze.",
    verdict:
      "Otterly.AI and RankVyze are not really competitors. Otterly is a monitoring subscription starting at $29/month for 15 tracked prompts — the cheapest credible way to watch whether AI engines mention you. RankVyze is a one-time $99 engagement that measures for a week and then spends five more fixing what it found, refunded in full if at least two of four engines still don't mention you after 45 days. If you have someone in-house who will act on a dashboard, Otterly is better value. If you don't, a dashboard is a year of watching a flat line.",
    realDifference: {
      heading: "One measures, one changes the number",
      body: "This is the whole comparison. Otterly tells you your mention rate and charts it over time, accurately and cheaply. It does not write your structured data, rewrite your H1, or open a pull request against your repository. If nobody on your side is going to do those things, the chart will still be flat in March — and you will have paid twelve times for the privilege of watching it.",
    },
    rows: [
      { label: "Price", them: "$29 / $189 / $489 per month", us: US.price },
      { label: "Tracked prompts", them: "15 / 100 / 400", us: "10–20, locked for the sprint" },
      { label: "Engines", them: "ChatGPT, AI Overviews, Perplexity, Copilot. Others cost extra.", us: US.engines },
      { label: "What you get", them: "A dashboard and a trend line", us: US.fixes },
      { label: "Commitment", them: "Monthly, ongoing", us: "One payment, ends at 45 days" },
      { label: "Guarantee", them: "None", us: US.guarantee },
    ],
    chooseThem: [
      "You have an in-house marketer or agency who will act on the findings.",
      "You want a permanent trend line rather than a fixed engagement.",
      "You track more than 20 prompts, or want daily rather than periodic checks.",
      "Your budget is $29/month and not $99 at once.",
    ],
    chooseUs: [
      "You want the problem fixed, not charted.",
      "Nobody on your side is going to implement AEO work.",
      "You want the money back if it doesn't land.",
    ],
    credit:
      "Otterly is genuinely the best-value entry point in this category. At $29/month it is cheaper than an hour of anyone's time, and if all you need is to know where you stand, buying it instead of us is the right call.",
    faq: [
      {
        q: "Is Otterly.AI cheaper than RankVyze?",
        a: "Per month, yes — $29 against a one-time $99. Over a year, Otterly Lite costs $348 and RankVyze costs $99, but they are not the same purchase: Otterly keeps measuring for those twelve months, and RankVyze stops after 45 days having implemented the fixes.",
      },
      {
        q: "Can I use both?",
        a: "That is a reasonable setup. Run the RankVyze sprint to fix the underlying signals, then keep Otterly Lite afterwards to watch that the number holds. We would rather say that than pretend a monitoring tool has no place.",
      },
      {
        q: "How many prompts does Otterly track on the entry plan?",
        a: "Fifteen, in total — not fifteen per engine. Read off their pricing page on 7 September 2026. The 100-prompt plan is $189/month.",
      },
    ],
  },
  {
    slug: "profound",
    name: "Profound",
    url: "https://tryprofound.com",
    metaTitle: "Profound vs RankVyze",
    metaDescription:
      "Profound is the enterprise AI visibility platform at $399/month; RankVyze is a $99 one-time sprint with a refund guarantee. Verified pricing and an honest account of who each is for.",
    h1: "Profound vs RankVyze.",
    verdict:
      "Profound is the enterprise choice in AI visibility analytics — $99/month for ChatGPT-only tracking of 50 prompts, $399/month for three engines and 100 prompts, and custom pricing above that for up to nine engines with SSO and SOC 2. RankVyze is a $99 one-time sprint across four engines that implements the fixes and refunds in full if at least two engines still don't mention you in 45 days. Profound is built for a brand team with headcount; RankVyze is built for a business that does not have one.",
    realDifference: {
      heading: "Analytics depth versus getting it done",
      body: "Profound is the deeper product and it is not close. It has the funding, the enterprise controls and the analytics surface a large brand needs, and if you have a team whose job is AI visibility, that depth compounds. What it does not do is the implementation. RankVyze inverts that: shallower measurement, and then five weeks of someone actually changing your site.",
    },
    rows: [
      { label: "Price", them: "$99 / $399 per month · Enterprise custom", us: US.price },
      { label: "Tracked prompts", them: "50 / 100", us: "10–20, locked for the sprint" },
      { label: "Engines", them: "1 on Starter, 3 on Growth, up to 9 on Enterprise", us: US.engines },
      { label: "What you get", them: "Enterprise analytics and reporting", us: US.fixes },
      { label: "Enterprise controls", them: "SSO/SAML, SOC 2 on Enterprise", us: "None — we are not an enterprise vendor" },
      { label: "Guarantee", them: "None", us: US.guarantee },
    ],
    chooseThem: [
      "You are a large brand with a team dedicated to AI visibility.",
      "You need SSO, SOC 2 or procurement-grade controls.",
      "You track many brands, markets or product lines at once.",
      "You want the deepest analytics available in the category.",
    ],
    chooseUs: [
      "You are one person or a small team with no capacity to implement findings.",
      "You want a fixed cost with a defined end, not a subscription.",
      "You want the downside covered.",
    ],
    credit:
      "Profound is the most serious analytics product in this category, and its Enterprise tier covers engines and controls we do not attempt. If you have the team to use it, it will tell you more than we will.",
    faq: [
      {
        q: "Does Profound's cheapest plan cover all AI engines?",
        a: "No. Starter at $99/month tracks ChatGPT only, which is a single-engine view of a multi-engine problem. Three engines start at $399/month. Read off their pricing page on 7 September 2026; listed prices are billed yearly.",
      },
      {
        q: "Is RankVyze an alternative to Profound?",
        a: "Only for smaller buyers. If you are evaluating Profound Enterprise, you have requirements — SSO, SOC 2, many brands — that we do not meet and do not claim to. For a single business with no in-house AEO capacity, we are the closer fit.",
      },
      {
        q: "Which measures more accurately?",
        a: "They measure differently. Profound automates at scale; ours are run by a person in a signed-out session with a screenshot attached to every check. Automation covers far more prompts. Manual checks look more like what a real buyer sees. Neither is strictly better and we would distrust anyone claiming otherwise.",
      },
    ],
  },
  {
    slug: "rank-prompt",
    name: "Rank Prompt",
    url: "https://rankprompt.com",
    metaTitle: "Rank Prompt vs RankVyze",
    metaDescription:
      "Rank Prompt tracks six AI engines with agency and multi-location features; RankVyze is a $99 one-time sprint with a refund guarantee. An honest comparison, including where they win.",
    h1: "Rank Prompt vs RankVyze.",
    verdict:
      "Rank Prompt is a self-serve AI visibility platform tracking six engines — ChatGPT, Perplexity, Google AI Mode, Claude, Gemini and Grok — with plans from 150 to 2,000 prompts a month and one-click multi-location tracking aimed at agencies and franchises. RankVyze covers four engines and tracks far fewer prompts, but it is a one-time $99 engagement that implements the fixes and refunds in full if at least two engines still don't mention you after 45 days. Rank Prompt is the better tool; RankVyze is the better purchase if you need the work done rather than measured.",
    realDifference: {
      heading: "Breadth versus completion",
      body: "Rank Prompt covers more engines than we do and at volumes we do not approach — 150 prompts a month at entry against our ten to twenty for a sprint. If you are an agency running many clients, or a franchise tracking many locations, that breadth is the product and we are not a substitute for it. What we offer instead is an ending: the sprint finishes, the fixes are shipped, and if it did not work you get your money back.",
    },
    rows: [
      { label: "Price", them: "Not published — sales conversation required", us: US.price },
      { label: "Tracked prompts", them: "150 → 2,000 per month", us: "10–20, locked for the sprint" },
      { label: "Engines", them: "Six, including Grok and Google AI Mode", us: US.engines },
      { label: "Multi-location", them: "One-click, built in", us: "Not supported" },
      { label: "What you get", them: "Dashboard, content generation, citation outreach", us: US.fixes },
      { label: "Guarantee", them: "None published", us: US.guarantee },
    ],
    chooseThem: [
      "You are an agency running AI visibility for several clients.",
      "You have multiple locations and need each tracked separately.",
      "You want Grok or Google AI Mode coverage specifically.",
      "You track well over a hundred prompts a month.",
    ],
    chooseUs: [
      "You are one business, not a portfolio of them.",
      "You want the fixes implemented rather than the findings reported.",
      "You want a published price before you talk to anyone.",
    ],
    credit:
      "Rank Prompt covers six engines to our four and offers multi-location tracking we do not have at all. For an agency or a franchise, that is decisive, and we would send you to them.",
    faq: [
      {
        q: "How much does Rank Prompt cost?",
        a: "They do not publish pricing. Their site lists four tiers — Starter, Pro, Agency and Agency Plus — with prompt volumes from 150 to 2,000 a month, but no figures, so you cannot compare cost per prompt without contacting sales. Checked 7 September 2026.",
      },
      {
        q: "Does Rank Prompt track more engines than RankVyze?",
        a: "Yes. Six against our four — they add Grok and Google AI Mode. Whether that matters depends on whether your buyers use those engines, which for most businesses they do not yet.",
      },
      {
        q: "What does RankVyze do that Rank Prompt doesn't?",
        a: "Implement. Rank Prompt generates content and runs citation outreach, but the technical fixes — structured data, entity markup, retrievability — remain yours to ship. We deliver those as pull requests, through your CMS API, or in your site builder, and refund the fee if the outcome does not land.",
      },
    ],
  },
];

export const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug);

export function getComparison(slug: string) {
  return COMPARISONS.find((c) => c.slug === slug);
}
