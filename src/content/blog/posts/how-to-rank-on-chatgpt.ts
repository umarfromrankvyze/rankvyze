import type { Post } from "../types";

export const post: Post = {
  slug: "how-to-rank-on-chatgpt",
  title: "How to rank on ChatGPT",
  seoTitle: "How to Rank on ChatGPT: A Practical Guide for Businesses",
  description:
    "ChatGPT doesn't rank pages — it recommends businesses it understands. Here's how it actually picks, and the seven changes that get you named.",
  excerpt:
    "ChatGPT has no ranking algorithm in the sense SEO means it. Understanding what it does instead is most of the work — and it explains why sites that dominate Google can be invisible in an AI answer.",
  publishedAt: "2026-09-03",
  category: "Guides",
  featured: true,
  targets: [
    "how to rank on chatgpt",
    "get ranked on chatgpt",
    "rank higher on chatgpt",
    "how to appear in chatgpt",
    "chatgpt seo",
  ],
  blocks: [
    {
      type: "p",
      text: "If you sell anything, some share of your buyers has already stopped typing keywords into Google and started asking an assistant a full question. **What's the best CRM for a two-person startup?** **Which Shopify agency should I hire for a fashion brand?** The answer that comes back names one or two businesses. Everyone else may as well not exist.",
    },
    {
      type: "p",
      text: "So the question every founder eventually asks is: how do I rank on ChatGPT? The honest answer starts by rejecting the premise.",
    },
    { type: "h2", text: "ChatGPT doesn't rank pages" },
    {
      type: "p",
      text: "Google returns an ordered list of documents. ChatGPT returns prose. There is no position four to climb to, no ranking factor to tune. What actually happens is closer to a recommendation than a ranking, and it comes from two places.",
    },
    {
      type: "ol",
      items: [
        "**What the model already knows.** Facts absorbed during training — who you are, what category you're in, who you serve. This is slow to change and you can't edit it directly.",
        "**What it retrieves right now.** When a question needs current or specific information, ChatGPT searches the web, reads a handful of pages, and writes an answer citing them. This you *can* influence, and it's where nearly all the winnable ground is.",
      ],
    },
    {
      type: "p",
      text: "Both paths depend on the same thing: whether a machine reading your site can state plainly what your business is, who it's for, and why it's credible. Not whether your page ranks — whether your *entity* is legible.",
    },
    {
      type: "callout",
      tone: "note",
      title: "Why good SEO isn't enough",
      text: "Ranking well means a page matched a query. Being recommended means a model understood a business well enough to vouch for it. Those are different jobs, and plenty of page-one sites fail the second one completely.",
    },
    { type: "h2", text: "The seven changes that actually move it" },
    {
      type: "p",
      text: "In roughly the order they pay off. The first three are where most businesses find their whole problem.",
    },
    {
      type: "steps",
      items: [
        {
          title: "1. Say what you are in the first sentence",
          text: "The single most common failure. A homepage H1 reading “We build beautiful things.” contains no noun a model can map to a category. Replace slogans with a plain definition: what you do, for whom, where. Put it in the H1 and the meta description, not below the fold.",
        },
        {
          title: "2. Make the claim machine-readable",
          text: "Add Organization schema with your name, URL, logo, areaServed and sameAs profiles, plus Service or Product schema on every offering page. This is the cheapest way to remove ambiguity, and it takes an afternoon.",
        },
        {
          title: "3. Render your content without JavaScript",
          text: "Most AI crawlers don't execute JS. If your homepage ships an empty div and fetches content client-side, your site is blank to them. Check by disabling JavaScript, or run curl and read what comes back.",
        },
        {
          title: "4. Publish the comparison content buyers ask for",
          text: "“Best X for Y”, “X vs Y”, “how much does X cost” dominate commercial intent. Engines answer them by citing pages that already frame the comparison. If only your competitor has written one, they own that answer.",
        },
        {
          title: "5. Earn corroboration off your own domain",
          text: "A claim on your site is one source. The same claim on directories, review sites, press and partner pages is evidence. Models weight agreement across domains heavily — it's how they avoid repeating marketing copy.",
        },
        {
          title: "6. Let the crawlers in, explicitly",
          text: "Check robots.txt for accidental blocks on GPTBot and OAI-SearchBot. Naming them in an Allow rule states intent unambiguously. Add /llms.txt describing your business and the pages you'd like cited.",
        },
        {
          title: "7. Structure answers as answers",
          text: "Question-shaped headings with direct answers underneath are the most quotable format there is. Lead each one with the sentence you'd want lifted verbatim — because that's exactly what happens.",
        },
      ],
    },
    { type: "h2", text: "Two crawlers, two different jobs" },
    {
      type: "p",
      text: "A detail that trips people up: OpenAI runs more than one crawler, and blocking the wrong one has different consequences.",
    },
    {
      type: "table",
      head: ["User agent", "What it does", "Blocking it means"],
      rows: [
        ["GPTBot", "Crawls for model training", "You're less likely to be known by default"],
        ["OAI-SearchBot", "Indexes for ChatGPT search results", "You can't appear in search-backed answers"],
        ["ChatGPT-User", "Fetches a page a user asked about", "Users can't pull your page into a chat"],
      ],
      caption: "Current as of publication — check OpenAI's documentation for changes.",
    },
    {
      type: "p",
      text: "Blocking GPTBot is a legitimate choice if you don't want your content training a model. Blocking OAI-SearchBot while hoping to appear in ChatGPT's answers is simply a mistake, and a surprisingly common one.",
    },
    { type: "h2", text: "How to tell whether any of it worked" },
    {
      type: "p",
      text: "This is where most AEO advice stops, and it's the part that matters. You cannot improve what you don't measure, and there is no Search Console for ChatGPT.",
    },
    {
      type: "p",
      text: "What works is unglamorous: write down the 20 questions your buyers actually ask, ask each one in a fresh signed-out session, and record whether you were named, in what position, and whether any of your pages were cited. Repeat monthly. That's a real baseline, and it's the only way to know whether a change helped or you got lucky.",
    },
    {
      type: "callout",
      tone: "tip",
      title: "Use a signed-out session",
      text: "Logged in, ChatGPT personalises from your history and memory — including every previous time you asked about your own company. You'll see yourself mentioned and conclude you're visible. Always check the way a stranger would.",
    },
    { type: "h2", text: "How long it takes" },
    {
      type: "p",
      text: "Technical fixes — schema, rendering, crawler policy — can register within days to a few weeks, because retrieval reads your live site. Content and corroboration take longer, typically a month or two, because they depend on other pages being crawled and on the model finding agreement across sources. Anything baked into training weights moves on the model's release cycle, which you don't control.",
    },
    {
      type: "p",
      text: "In practice: expect the first movement in weeks, not days, and judge the work on whether mentions increase across several engines rather than on one lucky answer.",
    },
    {
      type: "faq",
      items: [
        {
          q: "Can you pay to rank on ChatGPT?",
          a: "No. There is no paid placement in ChatGPT's organic answers. Anyone selling guaranteed ChatGPT rankings through payment to OpenAI is describing something that doesn't exist.",
        },
        {
          q: "Does traditional SEO help with ChatGPT?",
          a: "It helps but isn't sufficient. Crawlability, clean structure and authority all carry over. What doesn't carry over is keyword-first thinking: ChatGPT needs to understand your business as an entity, not match a page to a phrase.",
        },
        {
          q: "How long does it take to show up in ChatGPT?",
          a: "Technical changes like schema and crawler access can register within days to weeks. Content and third-party corroboration usually take one to two months. Training-derived knowledge changes only when the model is updated.",
        },
        {
          q: "Why does ChatGPT recommend my competitor instead of me?",
          a: "Usually because it understands them better, not because it likes them more. They typically have a clearer entity definition, structured data, comparison content answering the exact question, and more third-party sources describing them the same way.",
        },
        {
          q: "Does blocking GPTBot hurt my visibility?",
          a: "It reduces the chance the model learns about you during training, but it does not remove you from search-backed answers — that's OAI-SearchBot. Many sites block one while intending to block the other.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        {
          label: "OpenAI — GPTBot and crawler controls",
          href: "https://platform.openai.com/docs/bots",
          note: "The current user-agent strings and how to allow or block each one.",
        },
        {
          label: "Schema.org",
          href: "https://schema.org/docs/schemas.html",
          note: "Canonical definitions for Organization, Service and FAQPage markup.",
        },
        {
          label: "llmstxt.org",
          href: "https://llmstxt.org",
          note: "The /llms.txt convention referenced in step six.",
        },
      ],
    },
  ],
};
