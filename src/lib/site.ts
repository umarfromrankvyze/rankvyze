/**
 * Canonical site facts, in one place.
 *
 * Structured data, the sitemap, robots.txt and llms.txt all have to agree with
 * each other — an Organization block claiming one URL while the canonical tag
 * claims another is exactly the ambiguity we sell a product to remove.
 */

export const SITE_URL = process.env.APP_URL ?? "https://rankvyze.com";

export const SITE = {
  name: "RankVyze",
  legalName: "RankVyze",
  url: SITE_URL,
  tagline: "Rank higher in AI search",
  description:
    "RankVyze gets your business mentioned and recommended by ChatGPT, Perplexity, Gemini and Claude. If you aren't mentioned on at least two engines within 45 days, we refund you 100%.",
  shortDescription: "Answer Engine Optimization for businesses that want to be recommended by AI.",
  email: "hello@rankvyze.com",
  logo: `${SITE_URL}/brand/logo-512.png`,
  /** When the company started. Engines use it to place the entity in time. */
  foundingDate: "2026",
  /** Where we will actually take customers. Not a claim of offices. */
  areaServed: "Worldwide",
  /** Fill these in as the profiles go live — they are the corroboration signal. */
  sameAs: [] as string[],
} as const;

/**
 * When the marketing content was last substantively revised.
 *
 * Deliberately a hand-maintained constant rather than `new Date()`: a build
 * timestamp would tell crawlers every page changed on every deploy, which is
 * both untrue and the kind of noisy freshness signal that gets discounted.
 * Bump it when the copy actually changes.
 */
export const CONTENT_UPDATED = "2026-09-03";
