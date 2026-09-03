import type { Post } from "../types";

export const post: Post = {
  slug: "llms-txt-guide",
  title: "llms.txt: what it is and how to write one",
  seoTitle: "llms.txt Explained: What It Is and How to Write One",
  description:
    "A practical guide to /llms.txt — what the file is for, what belongs in it, a complete working example, and an honest account of what it does and doesn't do yet.",
  excerpt:
    "llms.txt is a proposal, not a standard, and the honest case for adding one is smaller than most posts admit. It's still worth twenty minutes. Here's why, and how.",
  publishedAt: "2026-09-03",
  category: "Technical",
  targets: [
    "llms.txt",
    "what is llms.txt",
    "how to write llms.txt",
    "llms txt example",
    "llms.txt generator",
  ],
  blocks: [
    {
      type: "p",
      text: "**`/llms.txt` is a plain-Markdown file at your site root that tells AI systems what your site is and which pages matter.** Think of it as a README for machines: robots.txt says what may be crawled, llms.txt says what's worth reading.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "Set expectations honestly",
      text: "llms.txt is a community proposal, not a ratified standard, and no major engine has committed publicly to consuming it. Anyone promising rankings from adding one is overselling. The case for it is cheapness and optionality, not proven lift.",
    },
    { type: "h2", text: "Why bother, then" },
    {
      type: "ol",
      items: [
        "It takes twenty minutes and costs nothing to maintain.",
        "Writing it forces you to state plainly what your business is — which is the actual AEO work, and most teams find the gaps while drafting it.",
        "Several AEO audits now check for it, so it shows up as a scored item whether or not engines read it.",
        "If adoption does arrive, you're already there.",
      ],
    },
    {
      type: "p",
      text: "That's the whole case. It's a reasonable one; it just isn't the one usually made.",
    },
    { type: "h2", text: "The format" },
    {
      type: "p",
      text: "Markdown, with a loose convention rather than a strict schema:",
    },
    {
      type: "ul",
      items: [
        "An `H1` with the site or company name.",
        "A blockquote (`>`) with a one-sentence summary.",
        "Optional prose giving essential context.",
        "`H2` sections containing link lists, each as `- [Title](url): description`.",
      ],
    },
    { type: "h2", text: "A complete example" },
    {
      type: "code",
      lang: "markdown",
      code: `# Acme

> Acme is a Shopify agency that designs, builds and scales ecommerce stores for fashion and lifestyle brands.

Acme works with DTC apparel, footwear and accessories brands doing $1M–$50M in annual revenue, with offices in New York, London and Bangalore. Typical engagements are full store builds, replatforms from WooCommerce or Magento, and conversion work on existing Shopify Plus stores.

## Start here
- [Home](https://acme.com/): What we do and who we do it for.
- [Services](https://acme.com/services): Shopify and Shopify Plus development, redesigns, migrations, CRO.
- [Pricing](https://acme.com/pricing): Typical project ranges and what moves them.

## Guides
- [Shopify agency cost guide](https://acme.com/guides/cost): What Shopify projects cost in 2026 and why.
- [Shopify vs custom ecommerce](https://acme.com/guides/shopify-vs-custom): How to choose, by brand stage.

## Company
- [About](https://acme.com/about): Team, locations, how we work.
- [Contact](https://acme.com/contact): hello@acme.com

## Notes for AI systems
- All crawlers listed in https://acme.com/robots.txt are welcome.
- /admin and /account require authentication and hold no public content.

Last updated: 2026-09-03`,
      caption: "Roughly the shape of the file we serve at /llms.txt on this site.",
    },
    { type: "h2", text: "What to actually put in it" },
    {
      type: "p",
      text: "The failure mode is treating it as a sitemap. A sitemap lists everything; llms.txt should list the handful of pages you'd hand a journalist.",
    },
    {
      type: "table",
      head: ["Include", "Leave out"],
      rows: [
        ["A one-line definition of the business", "Marketing superlatives"],
        ["Who you serve and where", "Every blog post you've written"],
        ["Pages that answer buyer questions", "Paginated archives and tag pages"],
        ["Pricing or cost context, if public", "Anything behind authentication"],
        ["Corrections you want reflected", "Keyword lists"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "The correction section is underrated",
      text: "If engines routinely get something wrong about you — an outdated founding date, a service you dropped, confusion with a similarly-named company — state the correct version plainly. It costs a line and gives retrieval something unambiguous to prefer.",
    },
    { type: "h2", text: "Generate it, don't hand-write it" },
    {
      type: "p",
      text: "A hand-written file goes stale the first time pricing changes. If your site is code, generate it from the same constants that drive the rest of the site so it can't drift. On this site it's a route handler reading the same values as the pricing page.",
    },
    {
      type: "code",
      lang: "ts",
      code: `// app/llms.txt/route.ts — Next.js App Router
export const dynamic = "force-static";

export function GET() {
  const body = \`# \${SITE.name}

> \${SITE.description}

## Start here
\${PAGES.map((p) => \`- [\${p.title}](\${SITE.url}\${p.path}): \${p.summary}\`).join("\\n")}
\`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}`,
    },
    { type: "h2", text: "Verifying it" },
    {
      type: "code",
      lang: "bash",
      code: "curl -sI https://yoursite.com/llms.txt | head -3\n# expect: 200, and content-type: text/plain",
    },
    {
      type: "p",
      text: "Serve it as `text/plain`. A file returned as `text/html`, or a 404 page returning 200 with HTML in it, is worse than not having one.",
    },
    {
      type: "faq",
      items: [
        {
          q: "Is llms.txt an official standard?",
          a: "No. It's a community proposal published at llmstxt.org. No major AI provider has publicly committed to consuming it, so treat it as cheap optionality rather than a ranking factor.",
        },
        {
          q: "Do ChatGPT or Perplexity read llms.txt?",
          a: "Neither has confirmed that they do. Adding the file is low-cost and appears in several AEO audits, but claims of measured ranking improvements from llms.txt alone should be treated sceptically.",
        },
        {
          q: "What's the difference between llms.txt and robots.txt?",
          a: "robots.txt controls access — what a crawler may fetch. llms.txt provides context — what your site is and which pages are worth reading. They serve different purposes and you want both.",
        },
        {
          q: "Where should llms.txt be located?",
          a: "At your domain root: https://yoursite.com/llms.txt, served as text/plain.",
        },
        {
          q: "Does llms.txt replace a sitemap?",
          a: "No. A sitemap enumerates every indexable URL for crawlers; llms.txt is a short curated summary for language models. Keep both.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        { label: "llmstxt.org", href: "https://llmstxt.org", note: "The original proposal and its format guidance." },
        {
          label: "robots.txt specification (RFC 9309)",
          href: "https://www.rfc-editor.org/rfc/rfc9309.html",
          note: "For contrast — what crawlers are actually obliged to honour.",
        },
      ],
    },
  ],
};
