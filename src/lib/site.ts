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
  /**
   * Third-party profiles that describe this same entity.
   *
   * Empty until the profiles genuinely exist. A sameAs pointing at a 404 is
   * worse than no sameAs at all: it asserts a corroborating source and then
   * fails to produce one, which is exactly the inconsistency the property is
   * meant to resolve.
   *
   * To fill it: run `npx tsx scripts/entity-checklist.mts` for what to create
   * and the exact copy to paste, add the URLs here, then run
   * `npx tsx scripts/check-sameas.mts` before deploying — it refuses any URL
   * that doesn't resolve.
   *
   * Only X is listed so far, and only because it was verified rather than
   * assumed: x.com/rankvyze returns 200 with the title "RankVyze (@RankVyze)"
   * while a nonsense handle on the same host returns 404, so the 200 means
   * something. LinkedIn, YouTube, GitHub/rankvyze and Product Hunt all 404 —
   * those pages genuinely do not exist yet.
   *
   * Instagram, Facebook and Reddit are deliberately absent despite returning
   * 200: they return 200 for handles that do not exist either, so a 200 there
   * is not evidence of anything. Adding one on that basis would be asserting a
   * corroborating source we had not actually confirmed.
   */
  sameAs: ["https://x.com/rankvyze"] as string[],
} as const;

/**
 * When the marketing content was last substantively revised.
 *
 * Deliberately a hand-maintained constant rather than `new Date()`: a build
 * timestamp would tell crawlers every page changed on every deploy, which is
 * both untrue and the kind of noisy freshness signal that gets discounted.
 * Bump it when the copy actually changes.
 */
export const CONTENT_UPDATED = "2026-09-06";
