export interface ContentBlock {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  /**
   * Outbound references. Primary sources only — the specification or the
   * crawler operator's own documentation — so a reader can verify a claim
   * without taking our word for it.
   */
  links?: { label: string; href: string; note: string }[];
}

export interface ContentPage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  updated?: string;
  blocks: ContentBlock[];
}

export const CONTENT_PAGES: ContentPage[] = [
  {
    slug: "about",
    title: "We help businesses become the answer.",
    eyebrow: "About RankVyze",
    description: "RankVyze is an Answer Engine Optimization platform. We measure how AI engines see your business and turn the gaps into fixes you can ship.",
    blocks: [
      {
        heading: "Why we exist",
        paragraphs: [
          "A growing share of buying decisions now start with a question to an AI assistant instead of a search box. Those assistants don't return ten links — they return one or two recommendations. If your business isn't one of them, you're invisible at the exact moment a customer is ready to buy.",
          "Traditional SEO tooling was built for ranking pages. RankVyze was built for being recommended: understanding what AI engines know about you, where they prefer a competitor, and what to change so that they choose you.",
        ],
      },
      {
        heading: "How we work",
        paragraphs: [
          "Every metric in RankVyze comes from real AI answers to real buyer questions. In this first version our team researches each prompt by hand across ChatGPT, Perplexity, Gemini and Claude, and records exactly what each engine said. The platform is designed so that engine APIs slot in without changing a single score.",
          "We don't stop at diagnosis. Audit findings become prioritized issues, issues become optimizations, and optimizations become reviewable code and content changes — with you approving every one before it ships.",
        ],
      },
      {
        heading: "What we believe",
        bullets: [
          "Measurement should come from the engines themselves, not proxies.",
          "Recommendations without implementation are just another report.",
          "Nothing changes on your site without your review.",
          "Orange is the only colour you need to notice.",
        ],
      },
    ],
  },
  {
    slug: "careers",
    title: "Build the tools that decide who AI recommends.",
    eyebrow: "Careers",
    description: "We're a small team working on a problem that didn't exist three years ago. If that excites you, we'd like to hear from you.",
    blocks: [
      {
        heading: "Open roles",
        paragraphs: ["We're currently hiring for the roles below. Send a short note and links to work you're proud of to careers@rankvyze.com."],
        bullets: [
          "AEO Research Analyst — run manual engine research, define prompt sets, and write audits customers act on.",
          "Full-stack Engineer (Next.js, TypeScript, Prisma) — build the customer dashboard and the agent-assisted implementation pipeline.",
          "Founding Designer — own the product's visual system from marketing site to dashboard.",
        ],
      },
      {
        heading: "How we work",
        bullets: ["Remote-first, with overlap in European and US Eastern hours.", "Small team, direct ownership, no layers.", "We ship weekly and talk to customers every day."],
      },
    ],
  },
  {
    slug: "docs",
    title: "Documentation",
    eyebrow: "Docs",
    description: "How RankVyze works, what the numbers mean, and how the workflow fits together.",
    updated: "September 2026",
    blocks: [
      {
        heading: "AI Visibility Score",
        paragraphs: [
          "A 0–100 composite computed from the most recent check of every tracked prompt on every engine. It weights mention rate (50%), citation rate (30%) and mention position (20%). Position credit decays from 100% for first place to 25% beyond fifth.",
          "The score is recomputed from raw research results every time the dashboard loads, so a corrected result changes the score immediately.",
        ],
      },
      {
        heading: "Research",
        paragraphs: [
          "Each research session checks every active prompt on every engine and records: whether your brand was mentioned, at what position, whether a page of yours was cited, which competitors were named, and a short summary of the answer. Only the latest check per prompt and engine counts toward current metrics; earlier checks remain in history.",
          "In this version, research is performed by RankVyze analysts. The data model records the source of each result so that API-based research can be introduced without changing any calculation.",
        ],
      },
      {
        heading: "AEO Audit",
        paragraphs: [
          "Audits score six categories from 0–100: AI Understanding, Content, Structured Data, Technical Accessibility, Entity Signals and Authority. Each audit produces issues with a severity, an impact score (0–10), affected pages and a recommended implementation.",
        ],
      },
      {
        heading: "Optimization workflow",
        bullets: [
          "Issue → Optimization: every issue can become a planned optimization with an effort estimate.",
          "Fix with AI: queues an implementation job. In this version a RankVyze engineer authors the change; the job record is designed for automated agent runs.",
          "Review: changes appear as diffs. Approve, reject, or create a pull request when a repository is connected.",
          "Verify: the next audit and research run measure the effect.",
        ],
      },
      {
        heading: "Connections",
        paragraphs: ["GitHub, Shopify, WordPress and code upload connections are recorded as requests and completed by our team during onboarding. Automated OAuth flows are in development."],
      },
      {
        heading: "Standards we rely on",
        paragraphs: ["The structured data we recommend, and generate, follows these specifications rather than anything proprietary to us."],
        links: [
          { label: "Schema.org full schema list", href: "https://schema.org/docs/full.html", note: "Canonical definitions for every type we emit." },
          { label: "Google — structured data general guidelines", href: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies", note: "The rules on markup matching visible content." },
          { label: "robots.txt specification (RFC 9309)", href: "https://www.rfc-editor.org/rfc/rfc9309.html", note: "What crawlers are actually obliged to honour." },
        ],
      },
    ],
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    eyebrow: "FAQ",
    description: "Straight answers about what RankVyze does — and doesn't — do.",
    blocks: [
      {
        heading: "Is this SEO?",
        paragraphs: ["It's adjacent. SEO optimizes for ranking in a list of links. AEO optimizes for being understood and recommended inside an AI-generated answer. Good SEO helps, but it isn't sufficient — plenty of page-one sites never get recommended."],
      },
      {
        heading: "How is my AI Visibility Score calculated?",
        paragraphs: ["From real answers to your tracked prompts across ChatGPT, Perplexity, Gemini and Claude: whether you're mentioned, where, and whether your pages are cited. See the documentation for the exact weights."],
      },
      {
        heading: "Do you use the engines' APIs?",
        paragraphs: ["Not yet. Our analysts research each prompt manually and record what the engines said. This is slower but more faithful to what real users see. The platform is built so API research can replace manual research without changing any metric."],
      },
      {
        heading: "Will RankVyze change my website automatically?",
        paragraphs: ["No. Fixes are delivered as reviewable changes. Nothing is written to your site until you approve it, and pull requests are merged by your team."],
      },
      {
        heading: "Which platforms do you support?",
        paragraphs: ["Any website for research and audits. For implementation, GitHub-hosted sites are best supported today; Shopify and WordPress connections are being rolled out."],
      },
      {
        heading: "How often is research updated?",
        paragraphs: ["Monthly on all plans, with more frequent runs on Growth and Scale. You can add prompts at any time; they're included in the next run."],
      },
    ],
  },
  {
    slug: "aeo-guide",
    title: "The Answer Engine Optimization guide",
    eyebrow: "AEO Guide",
    description: "A practical introduction to getting recommended by AI engines: what they look for, what usually goes wrong, and where to start.",
    updated: "September 2026",
    blocks: [
      {
        heading: "1. Define your entity in plain language",
        paragraphs: [
          "Engines need a sentence they can quote: who you are, what you do, for whom, and where. Put it in your homepage H1 or first paragraph, repeat it in your metadata description, and back it with Organization schema. Avoid slogans in the H1 — “We build beautiful things” tells a model nothing.",
        ],
      },
      {
        heading: "2. Make your specialisation visible as depth, not a tag",
        paragraphs: ["One page about your niche reads as a category. A cluster — a service page, a guide, case studies with outcomes and an FAQ, all interlinked — reads as expertise. Engines infer specialisation from depth."],
      },
      {
        heading: "3. Publish the comparison content buyers ask for",
        paragraphs: ["“Best X for Y”, “X vs Y”, “how much does X cost” — engines answer these by citing pages that already frame the answer. Write them honestly, include a verdict and a table, and add FAQ schema."],
      },
      {
        heading: "4. Ship structured data that repeats your claims",
        bullets: ["Organization with name, url, logo, sameAs and areaServed.", "Service or Product on every offering page.", "FAQPage on question-and-answer content.", "Person for authors, linked to the Organization."],
      },
      {
        heading: "5. Be readable without JavaScript",
        paragraphs: ["Most AI crawlers don't execute JavaScript. If your key content renders client-side, it doesn't exist to them. Server-render it or pre-render it."],
      },
      {
        heading: "6. Earn corroboration",
        paragraphs: ["A claim on your own domain is weak evidence. The same claim on five other domains — directories, reviews, press, partner pages — is strong evidence. Surface the corroboration you already have and link it from your Organization schema."],
      },
      {
        heading: "7. Measure what engines actually say",
        paragraphs: ["Track the real questions your buyers ask, check them on every engine, and record mentions, positions and citations over time. That's the loop RankVyze runs for you."],
      },
      {
        heading: "Primary sources",
        paragraphs: [
          "Everything above is checkable against the specifications and the crawler operators' own documentation. If you only read one, make it the crawler list for the engine you care about most — the user-agent strings change more often than the advice does.",
        ],
        links: [
          { label: "Schema.org", href: "https://schema.org/docs/schemas.html", note: "The vocabulary behind Organization, Service and FAQPage markup." },
          { label: "OpenAI — GPTBot and crawler controls", href: "https://platform.openai.com/docs/bots", note: "Current user-agent strings and how to allow or block them." },
          { label: "Anthropic — ClaudeBot and site owners", href: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler", note: "How Anthropic's crawler identifies itself and honours robots.txt." },
          { label: "Google — crawler and fetcher overview", href: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers", note: "Includes Google-Extended, the control for Gemini training and grounding." },
          { label: "llmstxt.org", href: "https://llmstxt.org", note: "The /llms.txt convention referenced in step 5." },
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    description: "How RankVyze collects, uses and protects information.",
    updated: "1 September 2026",
    blocks: [
      {
        heading: "Information we collect",
        paragraphs: ["Account information you provide (name, email, password hash), information about the websites you register (URLs, business descriptions, competitors, prompts), and research data our team records about how AI engines respond to prompts relating to your business. We collect standard technical logs (IP address, browser, timestamps) to operate and secure the service."],
      },
      {
        heading: "How we use it",
        paragraphs: ["To provide the service: computing visibility metrics, producing audits, generating reports, and delivering optimizations. To communicate with you about your account. To improve the product in aggregate. We do not sell personal information."],
      },
      {
        heading: "Sharing",
        paragraphs: ["We share data with infrastructure providers needed to run the service (hosting, database, email) under contractual confidentiality obligations. We disclose information when required by law."],
      },
      {
        heading: "Retention and deletion",
        paragraphs: ["Account and website data is retained while your account is active. You can request deletion at any time by contacting privacy@rankvyze.com; we delete or anonymise data within 30 days except where retention is legally required."],
      },
      {
        heading: "Your rights",
        paragraphs: ["Depending on your location you may have rights to access, correct, export or delete your data and to object to certain processing. Contact privacy@rankvyze.com to exercise them."],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    description: "The agreement between you and RankVyze when you use the service.",
    updated: "1 September 2026",
    blocks: [
      {
        heading: "The service",
        paragraphs: ["RankVyze provides AI visibility research, AEO audits, and optimization recommendations and tooling for websites you own or are authorized to manage. Research results reflect what AI engines returned at the time of checking and may change."],
      },
      {
        heading: "Your responsibilities",
        bullets: ["You must have the right to analyse and modify the websites you register.", "You are responsible for reviewing and approving any change before it is applied to your site.", "You must keep your credentials confidential and notify us of unauthorised access."],
      },
      {
        heading: "No guarantees of placement",
        paragraphs: ["AI engines are operated by third parties. We do not control their outputs and do not guarantee that any optimization will result in a mention, citation or recommendation."],
      },
      {
        heading: "Payment and cancellation",
        paragraphs: ["Paid plans are billed monthly in advance and can be cancelled at any time, effective at the end of the current billing period. Trials require no payment method."],
      },
      {
        heading: "Limitation of liability",
        paragraphs: ["To the maximum extent permitted by law, RankVyze's total liability for any claim arising from the service is limited to the fees you paid in the twelve months before the claim."],
      },
    ],
  },
  {
    slug: "security",
    title: "Security",
    eyebrow: "Legal",
    description: "How we protect your data and your website.",
    updated: "1 September 2026",
    blocks: [
      {
        heading: "Application security",
        bullets: ["Passwords are hashed with bcrypt; sessions are server-side and revocable.", "All traffic is encrypted in transit.", "Role-based access separates customer workspaces from the internal console.", "Every mutation is validated server-side and scoped to the authenticated organization."],
      },
      {
        heading: "Your website",
        paragraphs: ["RankVyze never writes to your website without an explicit approval in the product. Implementation changes are delivered as diffs and pull requests that your team reviews and merges."],
      },
      {
        heading: "Reporting a vulnerability",
        paragraphs: ["Email security@rankvyze.com. We acknowledge reports within two business days and keep you informed until resolution."],
      },
    ],
  },
];

export function getContentPage(slug: string) {
  return CONTENT_PAGES.find((p) => p.slug === slug) ?? null;
}
