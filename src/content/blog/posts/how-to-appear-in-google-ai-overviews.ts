import type { Post } from "../types";

export const post: Post = {
  slug: "how-to-appear-in-google-ai-overviews",
  title: "How to appear in Google AI Overviews",
  seoTitle: "How to Appear in Google AI Overviews (and Gemini)",
  description:
    "AI Overviews are built on Google's existing index, which makes them the most winnable AI surface — if you understand which pages get pulled into them and why.",
  excerpt:
    "AI Overviews sit on top of the index you've already been optimizing for a decade. That makes this the one AI surface where your existing SEO work is a genuine head start.",
  publishedAt: "2026-09-03",
  category: "Guides",
  targets: [
    "how to appear in google ai overviews",
    "rank in ai overviews",
    "google ai overview optimization",
    "how to rank on gemini",
    "ai overviews seo",
  ],
  blocks: [
    {
      type: "p",
      text: "Of the four major answer surfaces, Google's AI Overviews is the one where your existing work counts for the most. It's generated from Google's index — the same index your SEO has been feeding for years. You aren't starting from zero; you're starting from wherever your organic performance already is.",
    },
    {
      type: "p",
      text: "That's the good news. The complication is that being in the index is necessary and not sufficient, and the pages that get pulled into an Overview aren't always the ones ranking first.",
    },
    { type: "h2", text: "What an Overview is actually doing" },
    {
      type: "p",
      text: "Google breaks a query into sub-questions, retrieves pages that answer each one, and synthesises a short response with links out to the sources it used. The links are the prize: they're the click, and they're the citation.",
    },
    {
      type: "p",
      text: "Two practical consequences:",
    },
    {
      type: "ul",
      items: [
        "**A page can be cited for a sub-question it wasn't written for.** If your guide contains the single best paragraph explaining one component of a bigger question, that paragraph can pull the whole page in.",
        "**Position one isn't a guarantee.** Overviews regularly cite results from further down when those pages answer the specific sub-question more directly.",
      ],
    },
    { type: "h2", text: "The passage is the unit, not the page" },
    {
      type: "p",
      text: "This is the mental shift that matters. Traditional SEO optimises a page against a query. Overviews extract *passages*. So the question to ask of every section is: could this stand alone as an answer if someone lifted it out of the page?",
    },
    {
      type: "table",
      head: ["Passage that gets extracted", "Passage that doesn't"],
      rows: [
        ["Opens with a direct answer", "Opens with context and background"],
        ["Self-contained — no “as mentioned above”", "Depends on earlier paragraphs"],
        ["One idea per paragraph", "Three ideas woven together"],
        ["Concrete figures, ranges, dates", "Qualitative and hedged"],
        ["Sits under a question-shaped H2", "Sits under a clever heading"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "The rewrite that costs nothing",
      text: "Take your best-performing page and move the answer to the top of each section. Most pages bury the answer in the third paragraph after establishing why the question matters. Invert that — the reader benefits too.",
    },
    { type: "h2", text: "Google-Extended, and what it does and doesn't control" },
    {
      type: "p",
      text: "`Google-Extended` is a robots.txt token controlling whether your content can be used for Gemini and grounding. It's not a crawler with its own user agent — Googlebot does the crawling, and Google-Extended governs a downstream use.",
    },
    {
      type: "code",
      lang: "text",
      code: "# Allow use in Gemini and grounded answers (this is the default)\nUser-agent: Google-Extended\nAllow: /\n\n# Opt out — note this does not affect Search ranking\nUser-agent: Google-Extended\nDisallow: /",
    },
    {
      type: "p",
      text: "Google states that disallowing Google-Extended doesn't affect Search rankings. Appearing in AI Overviews specifically is governed by ordinary Search indexing — so the `nosnippet` family of controls is the relevant lever there, and using them costs you featured snippets too.",
    },
    { type: "h2", text: "Which queries trigger an Overview" },
    {
      type: "p",
      text: "Not all of them, and the distribution is worth knowing before you invest:",
    },
    {
      type: "ul",
      items: [
        "**Informational and how-to queries** — the most common trigger by a wide margin.",
        "**Comparison and “best X for Y” queries** — high commercial value, frequently triggered.",
        "**Definitional queries** — nearly always.",
        "**Navigational queries** — rarely; someone searching your brand name wants your site.",
        "**Sensitive categories** — Google is visibly more conservative around medical, legal and financial topics.",
      ],
    },
    {
      type: "p",
      text: "If your money queries are navigational, Overviews matter less to you than the volume figures suggest. Check before you plan around it.",
    },
    { type: "h2", text: "How to measure it" },
    {
      type: "p",
      text: "Search Console doesn't separate AI Overview impressions from ordinary ones, so there's no clean report to pull. What you have:",
    },
    {
      type: "steps",
      items: [
        {
          title: "Track a fixed query set manually",
          text: "Twenty queries, checked monthly in an incognito window. Record whether an Overview appeared and whether you were cited.",
        },
        {
          title: "Watch for the impressions-flat, clicks-down pattern",
          text: "In Search Console, a query holding impressions while losing clicks is the classic signature of an Overview absorbing the answer.",
        },
        {
          title: "Note which of your pages get cited",
          text: "It's often not the one you'd expect. That page is telling you what format works — expand it, then apply the same structure elsewhere.",
        },
      ],
    },
    {
      type: "p",
      text: "The same passage discipline that earns Overview citations also helps on [ChatGPT](/blog/how-to-rank-on-chatgpt) and [Perplexity](/blog/how-to-get-cited-by-perplexity). This is the one place where the work genuinely compounds across engines.",
    },
    {
      type: "faq",
      items: [
        {
          q: "How do I get my website into Google AI Overviews?",
          a: "Be indexed and eligible for snippets, then structure content as extractable passages: question-shaped headings with a direct, self-contained answer immediately underneath. Overviews cite passages, not whole pages.",
        },
        {
          q: "Do AI Overviews use the normal Google index?",
          a: "Yes. They're generated from Google Search's existing index, which is why standard technical SEO — crawlability, indexing, page quality — remains the foundation.",
        },
        {
          q: "What is Google-Extended?",
          a: "A robots.txt control governing whether your content can be used for Gemini and grounded generative answers. It isn't a separate crawler, and Google says disallowing it doesn't affect Search rankings.",
        },
        {
          q: "Can I opt out of AI Overviews specifically?",
          a: "Not with a dedicated control. Overview eligibility follows Search snippet eligibility, so opting out means using nosnippet or max-snippet — which also removes you from featured snippets and shortens your regular result.",
        },
        {
          q: "Do AI Overviews reduce clicks?",
          a: "For queries fully answered in the Overview, typically yes. The counter is to be the cited source and to own queries an Overview can't finish — anything requiring a decision, a quote, or a product.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        {
          label: "Google — AI features and your website",
          href: "https://developers.google.com/search/docs/appearance/ai-features",
          note: "Google's own guidance on AI Overviews eligibility and controls.",
        },
        {
          label: "Google — crawler and fetcher overview",
          href: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
          note: "Where Google-Extended is defined alongside Googlebot.",
        },
      ],
    },
  ],
};
