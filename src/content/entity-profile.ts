/**
 * The canonical entity description.
 *
 * Every third-party profile — LinkedIn, Crunchbase, G2, a directory listing —
 * must say the same thing in the same words. That is not tidiness: an engine
 * confirms an entity by finding agreement across independent sources, and a
 * business described three different ways on three sites reads as three
 * uncertain half-matches rather than one confident answer.
 *
 * So this file is the source both the structured data and the profile
 * checklist read from. Change the description here, and the place you have to
 * change it everywhere else is listed by `npx tsx scripts/entity-checklist.mts`.
 */

export const ENTITY = {
  /** Exactly as it should appear everywhere. Not "Rankvyze", not "RankVyze.com". */
  name: "RankVyze",
  legalName: "RankVyze",
  url: "https://rankvyze.com",

  /** Under 60 characters — most directory taglines truncate around there. */
  tagline: "Answer engine optimization with a 45-day guarantee",

  /** One sentence. This is the one an engine is most likely to quote back. */
  short:
    "RankVyze is an answer engine optimization service that gets businesses mentioned by ChatGPT, Perplexity, Gemini and Claude.",

  /** Two to three sentences, for profile "about" fields with room. */
  medium:
    "RankVyze is an answer engine optimization service. We measure how ChatGPT, Perplexity, Gemini and Claude answer the questions a business's buyers actually ask, audit the site for the signals those engines rely on, and implement the fixes. It is a single $99 payment for a 45-day sprint, refunded in full if the business still isn't mentioned by at least two of the four engines.",

  /** Long form, for profiles that allow a full description. */
  long: [
    "RankVyze is an answer engine optimization (AEO) service. When someone asks an AI assistant for a recommendation, the answer names two or three businesses rather than showing ten links — and everyone else is invisible, regardless of how well they would have ranked in traditional search.",
    "We measure how ChatGPT, Perplexity, Gemini and Claude answer the questions a business's buyers actually ask, recording what each engine said, in what position, and which pages it cited. We audit the site against the signals those engines rely on — entity clarity, retrievable content, structured data and third-party corroboration — and implement the fixes, either directly through an API connection or in the customer's own site builder.",
    "The offer is one $99 payment for a 45-day sprint. If the business is not mentioned by at least two of the four engines within 45 days, the payment is refunded in full.",
  ].join("\n\n"),

  /**
   * Topics with demonstrable published coverage on the site. Emitted as
   * schema.org knowsAbout, which is an entity signal that needs no external
   * profile — but only defensible because each of these has real pages behind
   * it, not because we would like to be associated with them.
   */
  knowsAbout: [
    "Answer Engine Optimization",
    "Generative Engine Optimization",
    "AI search visibility",
    "ChatGPT search optimization",
    "Perplexity citations",
    "Google AI Overviews",
    "Schema.org structured data",
    "llms.txt",
    "AI crawler configuration",
    "Brand visibility measurement",
  ],

  /** Category labels directories ask for, in their usual wording. */
  categories: ["Marketing Services", "Search Engine Optimization", "Digital Marketing", "SaaS"],

  email: "hello@rankvyze.com",
  foundingDate: "2026",
  areaServed: "Worldwide",
  logo: "https://rankvyze.com/brand/logo-512.png",
} as const;

/**
 * The profiles worth creating, hardest-working first.
 *
 * Ordered by how much weight an engine actually gives the source, not by how
 * easy the signup is. The first four carry most of the corroboration; the rest
 * are worth having but are not what decides whether you get named.
 */
export interface ProfileTarget {
  name: string;
  url: string;
  /** Why this one, specifically. */
  why: string;
  /** Which description field to paste. */
  use: "short" | "medium" | "long";
  priority: 1 | 2 | 3;
}

export const PROFILE_TARGETS: ProfileTarget[] = [
  {
    name: "LinkedIn company page",
    url: "https://www.linkedin.com/company/setup/new/",
    why: "The single most-referenced corroboration source for a business entity. Engines treat it as near-authoritative for name, category and whether the company is real.",
    use: "medium",
    priority: 1,
  },
  {
    name: "Crunchbase",
    url: "https://www.crunchbase.com/",
    why: "Structured company data that is widely syndicated and heavily represented in training data. Carries disproportionate weight for company existence and category.",
    use: "medium",
    priority: 1,
  },
  {
    name: "GitHub organisation",
    url: "https://github.com/organizations/plan",
    why: "Move the repository from a personal account to a RankVyze organisation. A product whose source sits under an individual's handle reads as a side project, and the org page is itself a corroborating profile.",
    use: "short",
    priority: 1,
  },
  {
    name: "G2",
    url: "https://www.g2.com/products/new",
    why: "Software review platforms are what an engine reaches for on 'best X' queries. A listing with even a few genuine reviews changes the answer to a category question.",
    use: "medium",
    priority: 1,
  },
  {
    name: "X / Twitter",
    url: "https://x.com/",
    why: "Frequently retrieved for recency and used as an identity anchor. Worth holding the handle even if you post rarely.",
    use: "short",
    priority: 2,
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/",
    why: "A launch page is a durable, independently-hosted description of the product that engines index and cite for new tools.",
    use: "medium",
    priority: 2,
  },
  {
    name: "Capterra / GetApp",
    url: "https://www.capterra.com/vendors/sign-up",
    why: "Second review platform. Overlapping listings across independent review sites is exactly the pattern that reads as corroboration rather than self-promotion.",
    use: "medium",
    priority: 2,
  },
  {
    name: "Wellfound (AngelList)",
    url: "https://wellfound.com/",
    why: "Company profile that ranks well and is commonly retrieved for early-stage companies.",
    use: "medium",
    priority: 3,
  },
  {
    name: "Google Business Profile",
    url: "https://business.google.com/",
    why: "Only if you have a genuine service area or address. Feeds Google's entity graph directly, which is what AI Overviews ground against.",
    use: "short",
    priority: 3,
  },
];
