import type { Post } from "../types";

export const post: Post = {
  slug: "how-to-get-cited-by-perplexity",
  title: "How to get cited by Perplexity",
  seoTitle: "How to Get Cited by Perplexity: What Actually Earns a Citation",
  description:
    "Perplexity shows its sources, which makes it the easiest engine to learn from. What earns a citation, and how to work backwards from the answers you're losing.",
  excerpt:
    "Perplexity cites everything it uses, so unlike other engines it tells you exactly who beat you and with which page. That makes it the best diagnostic tool you have.",
  publishedAt: "2026-09-03",
  category: "Guides",
  targets: [
    "how to rank on perplexity",
    "get cited by perplexity",
    "perplexity seo",
    "perplexity ai citations",
    "how to appear in perplexity",
  ],
  blocks: [
    {
      type: "p",
      text: "Perplexity is the most useful engine to optimize for, and not because it's the biggest. It's useful because it shows its working. Every answer carries numbered citations, so when you lose, you can see precisely which page won and read it.",
    },
    {
      type: "p",
      text: "No other engine hands you that. Treat Perplexity as your diagnostic instrument even if it isn't your largest source of buyers.",
    },
    { type: "h2", text: "How Perplexity builds an answer" },
    {
      type: "p",
      text: "Simplified, but accurate enough to act on: it turns your question into searches, retrieves a set of candidate pages, reads them, and writes an answer grounded in what it read — citing as it goes.",
    },
    {
      type: "p",
      text: "Two consequences follow, and they're the whole strategy.",
    },
    {
      type: "ul",
      items: [
        "**Retrieval is live.** Publishing a page that answers a question can affect answers within days, not model-release cycles. This is the fastest feedback loop in AEO.",
        "**Citations go to pages, not brands.** Perplexity cites the specific URL that answered the question. A brilliant homepage doesn't help if the answer needed a pricing page you never wrote.",
      ],
    },
    { type: "h2", text: "Work backwards from the answers you're losing" },
    {
      type: "p",
      text: "The highest-value hour you can spend:",
    },
    {
      type: "steps",
      items: [
        {
          title: "Ask your ten buyer questions, signed out",
          text: "Use the phrasing a customer would, not your internal vocabulary. Record the full answer and every citation.",
        },
        {
          title: "Open the cited pages",
          text: "For each question you lost, read the pages that won. You now have the exact bar to clear.",
        },
        {
          title: "Categorise what won",
          text: "Usually one of four: a comparison page, a pricing or cost page, a listicle on a third-party site, or a genuinely deep guide. The distribution tells you what to build.",
        },
        {
          title: "Write the page that should have been cited",
          text: "Answer the question directly in the first sixty words, then support it. Don't bury the answer beneath positioning.",
        },
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Third-party listicles are a shortcut",
      text: "If “best X in Y” listicles on other sites keep winning, getting included in those is often faster than outranking them. That's outreach, not engineering — but it's frequently the highest-leverage move available.",
    },
    { type: "h2", text: "What makes a page quotable" },
    {
      type: "p",
      text: "Perplexity has to lift a sentence or two and attribute it. Pages that make that easy get cited disproportionately.",
    },
    {
      type: "table",
      head: ["Property", "Why it earns citations"],
      rows: [
        ["Answer in the first 60 words", "The lead sentence is the one most likely to be quoted"],
        ["Question-shaped headings", "Maps directly onto the query being answered"],
        ["Specific numbers and ranges", "Concrete claims are quotable; vague ones aren't"],
        ["Comparison tables", "Structured, extractable, and hard to paraphrase away"],
        ["A dated update line", "Recency is a tiebreaker between otherwise similar pages"],
        ["Stated scope", "“For teams of 5–50” helps it match the right question"],
      ],
    },
    { type: "h2", text: "Let PerplexityBot in" },
    {
      type: "p",
      text: "Perplexity runs `PerplexityBot` for indexing and `Perplexity-User` for fetching a page a user has asked about directly. Blocking either removes you from a different part of the experience. Check your robots.txt, and name them explicitly if you want to state intent.",
    },
    {
      type: "code",
      lang: "text",
      code: "User-agent: PerplexityBot\nAllow: /\n\nUser-agent: Perplexity-User\nAllow: /\n\nSitemap: https://yoursite.com/sitemap.xml",
    },
    { type: "h2", text: "Measuring it" },
    {
      type: "p",
      text: "Because citations are visible, the metric is unusually clean: for a fixed set of questions, count how often one of your pages appears in the citation list. Track which of your pages earn citations — the distribution is usually concentrated in two or three, and those are the ones worth expanding.",
    },
    {
      type: "p",
      text: "Then track the same questions on [ChatGPT](/blog/how-to-rank-on-chatgpt) and Gemini. Perplexity moves first; the others tend to follow, which makes it a leading indicator for the whole programme.",
    },
    {
      type: "faq",
      items: [
        {
          q: "How does Perplexity choose its sources?",
          a: "It searches for the question, retrieves candidate pages, and grounds its answer in what it reads — citing the specific URLs used. Pages that answer the question directly and early are far likelier to be selected.",
        },
        {
          q: "How fast can a new page get cited by Perplexity?",
          a: "Because retrieval happens at query time rather than from static training data, a newly published page can start appearing within days once it's crawled.",
        },
        {
          q: "Does blocking PerplexityBot remove me from Perplexity?",
          a: "It prevents indexing for general answers. Perplexity-User, which fetches a page a user explicitly asks about, is a separate agent — blocking one does not block the other.",
        },
        {
          q: "Why does Perplexity cite my competitor's blog instead of my product page?",
          a: "Usually because the blog answers the question and the product page sells. If a query asks how to choose between options, a page that compares options will beat one that asserts you're the best.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        {
          label: "Perplexity — bots and crawlers",
          href: "https://docs.perplexity.ai/guides/bots",
          note: "User agents, IP ranges and how to control access.",
        },
      ],
    },
  ],
};
