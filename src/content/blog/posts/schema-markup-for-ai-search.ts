import type { Post } from "../types";

export const post: Post = {
  slug: "schema-markup-for-ai-search",
  title: "Schema markup for AI search: what to add first",
  seoTitle: "Schema Markup for AI Search: The Four Types That Matter",
  description:
    "Which structured data types actually influence AI answers, in priority order, with copy-paste JSON-LD for Organization, Service, FAQPage and Article.",
  excerpt:
    "You don't need forty schema types. You need four, done properly and linked together — here's the exact markup and the order to add it in.",
  publishedAt: "2026-09-03",
  category: "Technical",
  targets: [
    "schema markup for ai search",
    "structured data for llms",
    "organization schema example",
    "json-ld for chatgpt",
    "does schema help with ai search",
  ],
  blocks: [
    {
      type: "p",
      text: "Structured data is the cheapest AEO work there is. It's an afternoon, it doesn't require writing anything new, and it converts claims a machine would otherwise have to infer from prose into assertions it can simply read.",
    },
    {
      type: "p",
      text: "The catch is that most schema advice is written for Google rich results, which is a different goal. Rich-result markup optimises for a visual snippet. AEO markup optimises for identity — making it unambiguous what your business is and what it offers.",
    },
    {
      type: "callout",
      tone: "note",
      title: "An honest caveat",
      text: "No AI provider publishes structured data as a ranking input, so treat this as reducing ambiguity rather than as a documented lever. What is documented is that schema is machine-readable and prose is not — which is enough reason to add it.",
    },
    { type: "h2", text: "The four that matter, in order" },
    {
      type: "table",
      head: ["Type", "Answers the question", "Where it goes"],
      rows: [
        ["Organization", "Who is this company?", "Site-wide, once"],
        ["Service or Product", "What do they sell, to whom?", "Each offering page"],
        ["FAQPage", "What are the direct answers?", "Pages with real Q&A on them"],
        ["Article", "Who wrote this, and when?", "Blog and guide pages"],
      ],
    },
    {
      type: "p",
      text: "Everything else — BreadcrumbList, WebSite, LocalBusiness, Review — is worth having, but none of it changes whether a model can state what you are.",
    },
    { type: "h2", text: "1. Organization" },
    {
      type: "p",
      text: "The single most valuable block on your site. `sameAs` is doing more work than it appears: it's how you connect your domain to profiles that already exist in a model's knowledge, which is the mechanism corroboration runs on.",
    },
    {
      type: "code",
      lang: "json",
      code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://acme.com/#organization",
  "name": "Acme",
  "url": "https://acme.com",
  "logo": "https://acme.com/logo.png",
  "description": "Shopify agency for fashion and lifestyle brands doing $1M–$50M in revenue.",
  "foundingDate": "2019-04-01",
  "areaServed": ["US", "GB", "IN"],
  "sameAs": [
    "https://www.linkedin.com/company/acme",
    "https://x.com/acme",
    "https://github.com/acme"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "hello@acme.com"
  }
}`,
    },
    {
      type: "callout",
      tone: "warn",
      title: "Only list sameAs profiles you actually control",
      text: "An empty sameAs array is better than one pointing at a lookalike account. Linking a profile that isn't yours actively teaches engines the wrong association, and it's difficult to undo.",
    },
    { type: "h2", text: "2. Service or Product" },
    {
      type: "p",
      text: "Organization says who you are; Service says what you sell. This is the block that answers “best X for Y” questions, because `serviceType` plus `audience` is exactly the shape of that query.",
    },
    {
      type: "code",
      lang: "json",
      code: `{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Shopify Plus migration",
  "serviceType": "Ecommerce replatforming",
  "provider": { "@id": "https://acme.com/#organization" },
  "areaServed": "US",
  "audience": {
    "@type": "Audience",
    "audienceType": "DTC fashion brands on Magento or WooCommerce"
  },
  "offers": {
    "@type": "Offer",
    "price": "18000",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}`,
    },
    {
      type: "p",
      text: "Note `provider` referencing the Organization by `@id` rather than repeating it. That's the linking pattern in the next section, and it's what turns a pile of separate blocks into one description of a business.",
    },
    { type: "h2", text: "3. FAQPage" },
    {
      type: "p",
      text: "The highest-leverage block per line of code, with one rule: **the questions and answers must be visible on the page.** Marking up FAQs that a human can't see is a guidelines violation, and it's also just a bad idea — the visible version is what gets quoted.",
    },
    {
      type: "code",
      lang: "json",
      code: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a Shopify migration cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most Magento-to-Shopify Plus migrations run $15,000–$40,000 depending on catalogue size, custom checkout logic and how much data needs transforming."
      }
    }
  ]
}`,
    },
    {
      type: "callout",
      tone: "tip",
      title: "Generate the markup from the visible content",
      text: "Keep one array of Q&A pairs in code, render the accordion from it, and build the JSON-LD from the same array. Then the two cannot drift, and you never have to remember to update both. That's how the FAQ on this site's pricing page works.",
    },
    { type: "h2", text: "4. Article" },
    {
      type: "p",
      text: "On guides and blog posts. `dateModified` matters more than most people expect: recency is a common tiebreaker between two pages that answer a question equally well.",
    },
    {
      type: "code",
      lang: "json",
      code: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to rank on ChatGPT",
  "datePublished": "2026-09-03",
  "dateModified": "2026-09-03",
  "author": { "@id": "https://acme.com/#organization" },
  "publisher": { "@id": "https://acme.com/#organization" },
  "mainEntityOfPage": "https://acme.com/blog/how-to-rank-on-chatgpt"
}`,
    },
    { type: "h2", text: "Link the blocks with @id" },
    {
      type: "p",
      text: "The mistake that wastes most of the value: publishing four unconnected JSON-LD blocks. A parser then sees four unrelated things rather than one entity described four ways.",
    },
    {
      type: "p",
      text: "Give the Organization a stable `@id` — the convention is `https://yoursite.com/#organization` — and reference *that* from every other block, as `provider`, `author`, `publisher`. Wrapping site-wide blocks in an `@graph` array makes the relationship explicit:",
    },
    {
      type: "code",
      lang: "json",
      code: `{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://acme.com/#organization", "name": "Acme" },
    {
      "@type": "WebSite",
      "@id": "https://acme.com/#website",
      "url": "https://acme.com",
      "publisher": { "@id": "https://acme.com/#organization" }
    }
  ]
}`,
    },
    { type: "h2", text: "Verify it, then check it renders server-side" },
    {
      type: "steps",
      items: [
        {
          title: "Validate the syntax",
          text: "Run the page through validator.schema.org and Google's Rich Results Test. Both catch malformed JSON and invalid property names.",
        },
        {
          title: "Confirm it's in the HTML source",
          text: "Schema injected by client-side JavaScript is invisible to crawlers that don't execute JS. curl the page and grep for ld+json.",
        },
        {
          title: "Check the @id references resolve",
          text: "Every @id you reference should be defined somewhere on the site. A dangling reference is a broken link in the graph.",
        },
      ],
    },
    {
      type: "code",
      lang: "bash",
      code: "curl -s https://yoursite.com | grep -o 'application/ld+json' | wc -l\n# 0 means your schema isn't server-rendered",
    },
    {
      type: "faq",
      items: [
        {
          q: "Does schema markup help with AI search?",
          a: "No AI provider lists it as a documented ranking factor. What it does is remove ambiguity: structured data states your category, audience and offerings in a form a machine can read directly rather than infer from marketing prose.",
        },
        {
          q: "Which schema type should I add first?",
          a: "Organization, site-wide, with a complete sameAs array. It's the block that establishes who you are, and every other block references it.",
        },
        {
          q: "Can I use FAQPage schema for questions not shown on the page?",
          a: "No. Structured data must reflect content visible to users. Marking up hidden FAQs violates search guidelines and gains you nothing, since the visible text is what gets quoted.",
        },
        {
          q: "JSON-LD or microdata?",
          a: "JSON-LD. It's the format Google recommends, it sits in a single script tag instead of being woven through your markup, and it's far easier to generate from application data.",
        },
        {
          q: "Does schema need to be server-rendered?",
          a: "Yes, in practice. Many AI crawlers don't execute JavaScript, so structured data injected client-side may never be seen.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        {
          label: "Schema.org — full type hierarchy",
          href: "https://schema.org/docs/schemas.html",
          note: "Canonical property definitions for every type above.",
        },
        {
          label: "Google — structured data general guidelines",
          href: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
          note: "The visible-content rule and other policies worth not breaking.",
        },
        {
          label: "Schema Markup Validator",
          href: "https://validator.schema.org/",
          note: "Validates any schema type, not only the ones Google renders.",
        },
      ],
    },
  ],
};
