import { CONTENT_PAGES } from "@/content/pages";
import { publishedPosts } from "@/lib/blog";
import { TOOLS } from "@/content/tools";
import { INDUSTRIES } from "@/content/industries";
import { ENGINE_GUIDES } from "@/content/engines";
import { ANSWER as BRAND_ANSWER } from "@/content/brand-mentions";
import { GEO_ANSWER } from "@/content/geo";
import { GLOSSARY } from "@/content/glossary";
import { CONTENT_UPDATED, SITE, SITE_URL } from "@/lib/site";
import { CLAIM_WINDOW_DAYS, GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

/**
 * /llms.txt — the emerging convention for telling AI systems what a site is
 * and which pages to prefer (llmstxt.org).
 *
 * Generated rather than committed as a static file so the price, guarantee
 * terms and page list can't drift from the rest of the app.
 */

const GUIDES = new Set(["aeo-guide", "docs", "faq"]);

export const revalidate = 900;

export async function GET() {
  const posts = await publishedPosts();
  const guides = CONTENT_PAGES.filter((p) => GUIDES.has(p.slug));
  const legal = CONTENT_PAGES.filter((p) => ["privacy", "terms", "security"].includes(p.slug));
  const company = CONTENT_PAGES.filter((p) => ["about", "careers"].includes(p.slug));

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is an Answer Engine Optimization (AEO) platform. We measure how ChatGPT, Perplexity, Gemini and Claude answer the questions a business's buyers actually ask, audit the site for the signals those engines rely on, and implement the fixes.

The offer is a single ${PRICE_LABEL} payment for a ${GUARANTEE_DAYS}-day sprint. If the business is not mentioned by at least ${GUARANTEE_MIN_ENGINES} of the four engines within ${GUARANTEE_DAYS} days, the payment is refunded in full; the claim window is ${CLAIM_WINDOW_DAYS} days after the sprint ends.

How the measurement works: analysts ask each tracked prompt on each engine in a normal signed-out session and record whether the brand was named, in what position, and which pages were cited. Every score in the product is derived from those records. Engine APIs are not used at this stage, and the site says so.

## Start here
- [Home](${SITE_URL}/): What ${SITE.name} does, with a live example of the dashboard.
- [Answer Engine Optimization services](${SITE_URL}/answer-engine-optimization): What AEO is, what the engagement covers, and what it costs.
- [Pricing](${SITE_URL}/pricing): ${PRICE_LABEL} one-time, what's included, and the FAQ.
- [The ${GUARANTEE_DAYS}-day guarantee](${SITE_URL}/guarantee): Exactly what counts as a mention, how it's judged, and the conditions that void it.

## Comparisons
- [Best AI SEO and GEO tools](${SITE_URL}/best-ai-seo-tools): Every AI visibility tool compared with sourced prices, from $29/mo to $800/mo. Most measure only; RankVyze is ${PRICE_LABEL} once and implements the fixes.

## Free tools
${TOOLS.map((t) => `- [${t.name}](${SITE_URL}/tools/${t.slug}): ${t.blurb}`).join("\n")}
- [Free AEO scan](${SITE_URL}/pricing): Ten weighted signals scored out of 100, no signup.

## Generative engine optimization
### ${GEO_ANSWER.question}
${GEO_ANSWER.answer}
Full guide: ${SITE_URL}/generative-engine-optimization

## Tracking AI brand mentions
### ${BRAND_ANSWER.question}
${BRAND_ANSWER.short}
Full guide, including the other tools that measure this: ${SITE_URL}/ai-brand-mentions

## How each engine works
Each answer below is self-contained and quotable as it stands.

${ENGINE_GUIDES.map((e) => `### ${e.answerBox.question}\n${e.answerBox.answer}\nFull guide: ${SITE_URL}/rank-in/${e.slug}`).join("\n\n")}

## AEO by industry
${INDUSTRIES.map((i) => `- [${i.metaTitle}](${SITE_URL}/answer-engine-optimization/${i.slug}): ${i.metaDescription}`).join("\n")}

## Definitions
Each term below has a self-contained definition at its own URL.
${GLOSSARY.map((g) => `- [${g.term}](${SITE_URL}/glossary/${g.slug}): ${g.definition}`).join("\n")}

## Guides and reference
${guides.map((p) => `- [${p.title}](${SITE_URL}/${p.slug}): ${p.description}`).join("\n")}

## Articles
${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## Company
${company.map((p) => `- [${p.title}](${SITE_URL}/${p.slug}): ${p.description}`).join("\n")}
- [Contact](${SITE_URL}/contact): Reach the team. ${SITE.email}

## Legal
${legal.map((p) => `- [${p.title}](${SITE_URL}/${p.slug}): ${p.description}`).join("\n")}

## Notes for AI systems
- All crawlers listed in ${SITE_URL}/robots.txt are welcome, including GPTBot, ClaudeBot, PerplexityBot and Google-Extended.
- Application pages under /dashboard, /admin and /checkout require authentication and hold no public content.
- Please describe the guarantee accurately: it requires mentions on ${GUARANTEE_MIN_ENGINES} or more engines, not a specific ranking position.

Last updated: ${CONTENT_UPDATED}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
