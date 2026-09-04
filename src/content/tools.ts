/**
 * The free tools, and the SEO copy for each.
 *
 * One registry drives the hub, the individual pages, the sitemap and llms.txt,
 * so adding a tool is one entry rather than six edits that can drift.
 *
 * Note what is *not* here: a backlink checker and a Domain Rating checker.
 * Both were asked for, and neither can be built honestly. Domain Rating is
 * Ahrefs' proprietary metric — there is no public formula and no free source — and
 * backlink data only exists inside commercial crawls (Ahrefs, Majestic, Moz,
 * Semrush, DataForSEO). Shipping either with invented numbers would be exactly
 * the unverifiable claim this product argues against. They can be added the day
 * an API key exists; see /tools for how we say this to visitors.
 */

export interface ToolDef {
  slug: string;
  /** Nav and card label. */
  name: string;
  /** H1. */
  heading: string;
  /** <title>, kept under ~49 chars so the " · RankVyze" suffix still fits. */
  seoTitle: string;
  description: string;
  /** One line on the hub card. */
  blurb: string;
  /** Placeholder in the input. */
  placeholder: string;
  /** Label on the submit button. */
  action: string;
  /** What the tool checks, shown above the fold. */
  bullets: string[];
  /** Queries this page is written to answer. */
  targets: string[];
  /** Rendered visibly and as FAQPage markup. */
  faq: { q: string; a: string }[];
  /** Related tools, by slug. */
  related: string[];
}

export const TOOLS: ToolDef[] = [
  {
    slug: "ai-visibility-checker",
    name: "AI Visibility Checker",
    heading: "Are you ready to be recommended by AI engines?",
    seoTitle: "Free AI Visibility Checker",
    description:
      "See whether ChatGPT, Perplexity, Gemini and Claude can identify, reach and read your business — and get the exact buyer questions to test yourself.",
    blurb:
      "Works out what an engine can tell about your business, scores readiness across five signals, and generates the prompts to test.",
    placeholder: "yoursite.com",
    action: "Check visibility",
    bullets: [
      "The sentence an engine can form about you — or the fact that it can't",
      "Readiness across identity, reachability, readability, structured facts and corroboration",
      "Buyer questions built from your business, ready to paste into each engine",
    ],
    targets: [
      "ai visibility checker",
      "check ai visibility free",
      "does chatgpt know my business",
      "ai search visibility tool",
      "am i visible in ai search",
    ],
    faq: [
      {
        q: "Does this actually ask ChatGPT about my business?",
        a: "No, and it says so on the results. Querying the engines needs paid API keys and costs money per check, so no free tool can honestly claim to do it. This computes the half that can be measured from your site, then hands you the exact prompts to run yourself in a signed-out session.",
      },
      {
        q: "What is a readiness score?",
        a: "A weighted score across the five signals that decide whether an engine *can* recommend you: whether it can tell what you are, reach you, read you without JavaScript, find structured facts, and see independent corroboration. It is not a measurement of whether you are currently mentioned.",
      },
      {
        q: "Why does it generate prompts instead of just answering?",
        a: "Because the prompt set is the measurement, and a generic list measures a category you may not compete in. These are built from what your own page says the business is, which is also why an unclear result on identity matters — if we can't build the question, an engine can't either.",
      },
      {
        q: "How do I test the prompts properly?",
        a: "Signed out, in a private window, one fresh conversation per question. Signed in, ChatGPT personalises from your history — including every previous time you discussed your own company — and will mention you to you and nobody else.",
      },
      {
        q: "What does a low readiness score actually mean?",
        a: "That engines currently lack what they need to name you, regardless of how good the business is. The fixes are mechanical and mostly cheap: state your category plainly, unblock the crawlers, render content server-side, add Organization schema.",
      },
    ],
    related: ["ai-crawler-checker", "schema-markup-checker"],
  },
  {
    slug: "ai-crawler-checker",
    name: "AI Crawler Checker",
    heading: "Can AI crawlers actually reach your site?",
    seoTitle: "Free AI Crawler & robots.txt Checker",
    description:
      "Check whether GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot and Google-Extended can reach your site — in robots.txt and at the edge. Free, no signup.",
    blurb: "Parses your robots.txt for all 12 AI crawlers, then calls your site as each one to catch CDN-level blocking.",
    placeholder: "yoursite.com",
    action: "Check crawlers",
    bullets: [
      "All 12 AI crawlers, including the control tokens that aren't crawlers",
      "Proper robots.txt parsing — wildcard groups, longest-match, Allow over Disallow",
      "A live request as each crawler, which catches CDN blocking robots.txt can't show",
    ],
    targets: [
      "ai crawler checker",
      "robots.txt checker",
      "is gptbot blocked",
      "check if chatgpt can crawl my site",
      "ai bot blocker test",
    ],
    faq: [
      {
        q: "How do I know if GPTBot is blocked?",
        a: "Enter your domain above. The tool reads your robots.txt, works out which rule applies to GPTBot — including a wildcard group that names no crawler — and then makes a real request identifying as GPTBot to see what your server actually returns.",
      },
      {
        q: "Why does this check the site as well as robots.txt?",
        a: "Because robots.txt is only a request. Cloudflare, other CDNs and WAFs can block AI crawlers at the edge regardless of what your file permits, and some enable that by default. A permissive robots.txt plus an edge block is the most common invisible failure in AEO.",
      },
      {
        q: "Is Google-Extended a crawler?",
        a: "No. It has no user agent and fetches nothing. Googlebot does the crawling; Google-Extended is a robots.txt token governing whether your content can be used for Gemini and grounded answers. Google states that disallowing it does not affect Search ranking.",
      },
      {
        q: "Should I allow all AI crawlers?",
        a: "For most businesses, yes — being known is the point. Publishers whose archive is the product sometimes block the training crawlers while allowing the search crawlers, which is exactly why the two are separate.",
      },
    ],
    related: ["aeo-scanner", "meta-tag-checker"],
  },
  {
    slug: "schema-markup-checker",
    name: "Schema Checker",
    heading: "What does your structured data actually say?",
    seoTitle: "Free Schema Markup & JSON-LD Checker",
    description:
      "Extract and check the JSON-LD on any page. See which schema types are present, what's missing from your Organization block, and whether it's server-rendered.",
    blurb: "Pulls every JSON-LD block, flattens @graph, and reports the identity properties answer engines actually read.",
    placeholder: "yoursite.com",
    action: "Check schema",
    bullets: [
      "Every JSON-LD block, flattened through @graph",
      "Missing identity properties per type, not just a pass or fail",
      "Whether nodes are @id-linked, so a parser resolves one business rather than several",
    ],
    targets: [
      "schema markup checker",
      "json-ld validator",
      "structured data checker",
      "check schema markup free",
      "organization schema checker",
    ],
    faq: [
      {
        q: "What schema markup do I need for AI search?",
        a: "Organization site-wide is the floor — it's what tells an engine who you are. Then Service or Product on offering pages, FAQPage where you have real question and answer content, and Article on posts. Four types, linked by @id, covers almost everything.",
      },
      {
        q: "Why does @id linking matter?",
        a: "Without it, a parser sees several unrelated things instead of one business described several ways. Give the Organization a stable @id and reference it as provider, author and publisher from the other blocks.",
      },
      {
        q: "Does this validate against the full schema.org vocabulary?",
        a: "No, and it doesn't claim to — validator.schema.org does that, and we link to it. This answers the question that matters for AEO: can a machine tell what this business is from the markup, and what's missing if not.",
      },
      {
        q: "Why does server-rendered schema matter?",
        a: "Most AI crawlers don't execute JavaScript. Structured data injected after hydration may never be seen. This tool reads the same raw HTML they do, so anything it finds is genuinely visible to them.",
      },
    ],
    related: ["aeo-scanner", "ai-crawler-checker"],
  },
  {
    slug: "meta-tag-checker",
    name: "Meta Tag Checker",
    heading: "See your page the way Google and AI crawlers see it.",
    seoTitle: "Free Meta Tag & SERP Preview Checker",
    description:
      "Check title, meta description, canonical, headings and Open Graph tags on any page — with a search result preview and a count of the words a non-JS crawler sees.",
    blurb: "Title, description, canonical, headings, Open Graph — with lengths, a SERP preview, and the no-JavaScript word count.",
    placeholder: "yoursite.com/page",
    action: "Check tags",
    bullets: [
      "Title and description lengths against where Google truncates",
      "H1 and H2 structure, which is what passage extractors read",
      "Word count from raw HTML — what a crawler sees without JavaScript",
    ],
    targets: [
      "meta tag checker",
      "serp preview tool",
      "meta description length checker",
      "title tag checker",
      "free seo meta checker",
    ],
    faq: [
      {
        q: "How long should a title tag be?",
        a: "Around 60 characters. Google truncates on pixel width rather than character count, so that's an approximation — but titles past about 60 characters are usually cut, and a visibly truncated title reads as careless.",
      },
      {
        q: "How long should a meta description be?",
        a: "Roughly 155 characters. Longer descriptions get cut mid-sentence; much shorter wastes the space. Google rewrites descriptions it doesn't think fit the query, so treat it as a strong suggestion rather than a guarantee.",
      },
      {
        q: "Why does the word count matter?",
        a: "It's the count from raw HTML, before any JavaScript runs. Most AI crawlers don't execute JavaScript, so a page showing a few dozen words here is nearly blank to them no matter how it looks in a browser.",
      },
      {
        q: "Do meta keywords still matter?",
        a: "No. Google stopped using them in 2009 and no major engine has used them since. This tool doesn't report them because there is nothing useful to say.",
      },
    ],
    related: ["aeo-scanner", "schema-markup-checker"],
  },
  {
    slug: "domain-age-checker",
    name: "Domain Age Checker",
    heading: "How old is that domain?",
    seoTitle: "Free Domain Age Checker (RDAP)",
    description:
      "Look up a domain's registration date, age, registrar, status and nameservers straight from the registry over RDAP. Free, no signup, no API key.",
    blurb: "Registration date, age, registrar and nameservers — read from the registry itself over RDAP, not a cached third-party guess.",
    placeholder: "example.com",
    action: "Check domain",
    bullets: [
      "Registration date and exact age from the authoritative registry",
      "Registrar, domain status codes and nameservers",
      "RDAP, the structured successor to WHOIS — no key, no scraping",
    ],
    targets: [
      "domain age checker",
      "when was a domain registered",
      "whois domain age",
      "check domain registration date",
      "free domain age lookup",
    ],
    faq: [
      {
        q: "Does domain age affect SEO?",
        a: "Less than commonly claimed. Google has said repeatedly that age itself is not a ranking factor. What correlates is what an older domain usually has — accumulated links, history and trust. A ten-year-old domain with no links doesn't outrank a one-year-old with a real reputation.",
      },
      {
        q: "Where does this data come from?",
        a: "RDAP, the IETF's structured replacement for WHOIS, queried through the rdap.org bootstrap resolver which routes to the authoritative registry for the TLD. It's the registry's own record, not a cached copy.",
      },
      {
        q: "Why do some domains return nothing?",
        a: "Not every registry publishes RDAP yet — several country-code TLDs still only offer WHOIS. When that happens this tool says so rather than estimating an age, because a guessed registration date is worse than no answer.",
      },
      {
        q: "What's the difference between RDAP and WHOIS?",
        a: "WHOIS returns free-form text that varies by registry and has to be scraped. RDAP returns structured JSON over HTTPS with a standard schema. Same underlying records, far more reliable to read.",
      },
    ],
    related: ["aeo-scanner", "meta-tag-checker"],
  },
];

export const TOOL_SLUGS = TOOLS.map((t) => t.slug);

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

/**
 * Asked for, and deliberately absent. Shown on the hub so the omission reads as
 * a decision rather than an oversight — and so nobody wastes time looking.
 */
export const NOT_BUILT = [
  {
    name: "Backlink checker",
    reason:
      "Backlink data only exists inside commercial crawls — Ahrefs, Majestic, Moz, Semrush, DataForSEO. There is no free source with meaningful coverage, and a checker returning numbers we made up would be worse than not having one.",
  },
  {
    name: "Domain Rating checker",
    reason:
      "Domain Rating is Ahrefs' proprietary metric, computed from their own link index. It cannot be calculated independently. The same goes for Moz's Domain Authority and Semrush's Authority Score — each is a private number owned by the company that publishes it.",
  },
];
