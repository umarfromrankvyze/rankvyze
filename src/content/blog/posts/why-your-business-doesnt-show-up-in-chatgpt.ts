import type { Post } from "../types";

export const post: Post = {
  slug: "why-your-business-doesnt-show-up-in-chatgpt",
  title: "Why your business doesn't show up in ChatGPT",
  seoTitle: "Why Your Business Doesn't Show Up in ChatGPT (and How to Diagnose It)",
  description:
    "Six reasons a real business stays invisible in AI answers, in the order they're worth checking — and how to tell which one is yours in about twenty minutes.",
  excerpt:
    "Invisibility in AI answers almost always has a specific, findable cause. Here's how to work out which of the six it is, starting with the two-minute checks.",
  publishedAt: "2026-09-03",
  category: "Guides",
  featured: true,
  targets: [
    "why is my business not showing up in chatgpt",
    "business not appearing in chatgpt",
    "chatgpt doesn't know my company",
    "how to get my business on chatgpt",
  ],
  blocks: [
    {
      type: "p",
      text: "You ask ChatGPT the question your best customers ask. It names three companies. None of them is you — and at least one is objectively worse at the job. This is the moment most people go looking for an answer, and the useful thing to know is that invisibility is rarely mysterious. It has a cause, and the cause is usually findable in under half an hour.",
    },
    {
      type: "p",
      text: "Here are the six causes in the order they're worth checking, cheapest first.",
    },
    { type: "h2", text: "1. The crawlers can't read your site" },
    {
      type: "p",
      text: "Start here because it's two minutes and it invalidates everything else. Most AI crawlers do not execute JavaScript. If your content is fetched client-side, the page they see is empty.",
    },
    {
      type: "code",
      lang: "bash",
      code: "# What a non-JS crawler actually sees\ncurl -s https://yoursite.com | sed 's/<[^>]*>//g' | tr -s '[:space:]' ' ' | head -c 600",
      caption: "If that prints almost nothing, you've found your problem.",
    },
    {
      type: "p",
      text: "Then check `robots.txt` for rules blocking `GPTBot` or `OAI-SearchBot`. Plenty of sites blocked AI crawlers in 2023 on general principle and never revisited the decision.",
    },
    { type: "h2", text: "2. Your homepage doesn't say what you are" },
    {
      type: "p",
      text: "The most common cause among sites that are otherwise healthy. Marketing copy optimises for feeling; models need category. An H1 reading “Growth, unlocked.” tells a model nothing it can match to “best analytics tool for ecommerce”.",
    },
    {
      type: "p",
      text: "The test: read your homepage's first hundred words and ask whether a stranger could finish the sentence *“This company is a ___ that helps ___ do ___.”* If they can't, neither can a model.",
    },
    {
      type: "table",
      head: ["Instead of", "Write"],
      rows: [
        ["We build beautiful things.", "Shopify agency for fashion and lifestyle brands."],
        ["Growth, unlocked.", "Analytics for ecommerce teams who want to understand checkout drop-off."],
        ["Your partner in success.", "Immigration law firm for startup founders relocating to Canada."],
      ],
    },
    { type: "h2", text: "3. Nothing on your site is machine-readable" },
    {
      type: "p",
      text: "Without structured data, a model has to infer your identity from prose. With it, you're simply telling it. Organization schema is the floor; Service or Product schema on offering pages is what answers “best X for Y” questions.",
    },
    {
      type: "code",
      lang: "json",
      code: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Acme",\n  "url": "https://acme.com",\n  "description": "Shopify agency for fashion and lifestyle brands.",\n  "areaServed": ["US", "GB", "IN"],\n  "sameAs": [\n    "https://www.linkedin.com/company/acme",\n    "https://www.shopify.com/partners/acme"\n  ]\n}`,
      caption: "The minimum viable Organization block. sameAs is doing more work than it looks.",
    },
    { type: "h2", text: "4. You've never answered the question being asked" },
    {
      type: "p",
      text: "Retrieval-backed answers cite pages that already address the query. If the question is “how much does a Shopify agency cost” and your pricing page redirects to a contact form, there is nothing to cite. A competitor who published honest ranges gets the citation by default.",
    },
    {
      type: "p",
      text: "List the ten questions a buyer asks before choosing you. Count how many have a page that answers them directly. For most businesses the answer is two or three.",
    },
    { type: "h2", text: "5. Only you say what you are" },
    {
      type: "p",
      text: "Models weight corroboration because it's the cheapest defence against believing marketing copy. If acme.com is the sole source describing Acme as a fashion Shopify specialist, that claim is weak. If a directory, two review sites and a press mention describe it the same way, it's a fact.",
    },
    {
      type: "callout",
      tone: "tip",
      title: "The cheapest corroboration you already have",
      text: "Most businesses are already listed somewhere they've forgotten about — a partner directory, an old press release, a marketplace profile. Find them, make sure they describe you consistently, and link them from your Organization schema's sameAs array.",
    },
    { type: "h2", text: "6. You're actually visible and testing it wrong" },
    {
      type: "p",
      text: "Worth ruling out before spending money. Two mistakes account for nearly all false readings.",
    },
    {
      type: "ul",
      items: [
        "**Testing while signed in.** ChatGPT personalises from your history and memory. If you've discussed your company before, it will happily mention it — to you, and to nobody else.",
        "**Testing one prompt once.** Answers vary between sessions. A single miss means little; a miss across ten prompts and four engines is a finding.",
      ],
    },
    { type: "h2", text: "A twenty-minute diagnosis" },
    {
      type: "steps",
      items: [
        { title: "Minutes 0–2", text: "curl your homepage. Confirm real text comes back without JavaScript." },
        { title: "Minutes 2–4", text: "Open /robots.txt. Confirm nothing blocks GPTBot or OAI-SearchBot." },
        { title: "Minutes 4–6", text: "View source, search for ld+json. Note whether Organization exists at all." },
        { title: "Minutes 6–10", text: "Read your first hundred words. Complete the “a ___ that helps ___” sentence." },
        {
          title: "Minutes 10–20",
          text: "In a signed-out session, ask five real buyer questions across ChatGPT and Perplexity. Record who gets named and which pages get cited.",
        },
      ],
    },
    {
      type: "p",
      text: "At the end you'll have a specific cause rather than a vague worry — and the fix for each of these is a known quantity, not a mystery. If you'd rather not run it yourself, that's roughly what our [free scan](/pricing) automates for the technical half.",
    },
    {
      type: "faq",
      items: [
        {
          q: "Why does ChatGPT know my competitor but not me?",
          a: "Almost always because their site states its category plainly, carries structured data, answers the specific question being asked, and is described consistently on other domains. It's legibility, not preference.",
        },
        {
          q: "Does ChatGPT have an index I can submit to?",
          a: "There is no submission form equivalent to Google Search Console. Search-backed answers rely on crawling, so the controls you have are robots.txt, your site's structure, and being cited elsewhere.",
        },
        {
          q: "How do I check if ChatGPT can see my website?",
          a: "Fetch your homepage without JavaScript and read what comes back, then confirm robots.txt doesn't block OAI-SearchBot. If the raw HTML has little text, crawlers see little text.",
        },
      ],
    },
    {
      type: "links",
      title: "Check these directly",
      items: [
        {
          label: "OpenAI — GPTBot and crawler controls",
          href: "https://platform.openai.com/docs/bots",
          note: "Which user agent does what, and how to allow each.",
        },
        {
          label: "Google — crawler and fetcher overview",
          href: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
          note: "Includes Google-Extended, the control for Gemini.",
        },
      ],
    },
  ],
};
