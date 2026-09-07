/**
 * Publish three posts.
 *
 * Chosen against a gap in the existing twelve rather than by keyword volume:
 *
 *  1. aeo-tools-vs-aeo-services — the category question. Every roundup ranking
 *     for "best AI SEO tools" reviews software and only software, so a service
 *     is the wrong answer on those pages however good it is. The distinction
 *     between buying a dashboard and buying the work is one nobody in this
 *     category writes about honestly, because most publishers sell one of them.
 *  2. internal-linking-for-ai-search — supports the internal link checker, and
 *     carries first-party numbers from crawling our own site.
 *  3. why-your-new-site-isnt-indexed — the question a new domain owner actually
 *     types, answered with the one mechanism most people have never heard of.
 *
 * Upserts by slug, so re-running edits rather than duplicates.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ---------------------------------------------------------------- post one

const toolsVsServices = [
  {
    type: "p",
    text: "**An AEO tool tells you whether AI engines mention you. An AEO service changes whether they do.** They are sold in the same aisle, priced within range of each other, and solve entirely different problems — and picking the wrong one is the most common way money gets wasted in this category.",
  },
  {
    type: "callout",
    tone: "note",
    title: "Where this comes from",
    text: "We read the roundups that rank for \"best AI SEO tools\", \"best GEO tools\" and \"best AI visibility tools\". Every one of them reviews software, and only software. Not one includes a done-for-you service. If you searched those terms hoping to find someone to do the work, the results were never going to contain the answer.",
  },
  { type: "h2", text: "The difference in one table" },
  {
    type: "table",
    head: ["", "AEO tool", "AEO service"],
    rows: [
      ["What you buy", "A dashboard and a data feed", "The work, done"],
      ["What it produces", "Reports: which prompts mention you, which cite competitors", "Changes to your site and your entity footprint"],
      ["Typical price", "$50–$500/month, ongoing", "$99 one-time to $10,000/month"],
      ["Who operates it", "You, or your team", "The provider"],
      ["Fails when", "Nobody acts on the report", "You cannot tell what was actually done"],
      ["Right for", "Teams with a developer and a writer already", "Teams without one, or without the hours"],
    ],
  },
  {
    type: "p",
    text: "The trap is that a tool feels like progress. You buy it, the dashboard fills with prompts, and you can see precisely how invisible you are — in colour, updated weekly. None of that changes an answer. Measurement is not the intervention.",
  },
  { type: "h2", text: "What a tool genuinely gives you" },
  {
    type: "p",
    text: "This is not an argument against tools. Tracking is real work that is tedious to do by hand, and the good ones do it properly: running your buyer's questions across engines on a schedule, logging which brands appear, capturing the URLs each answer cites. That last part is the underrated one — citation sources tell you which pages an engine already trusts on your topic, which is a list of where to get mentioned.",
  },
  {
    type: "p",
    text: "A tool earns its subscription when someone on your team will read the output and act within the week. If that person does not exist, you are paying a monthly fee to be told bad news.",
  },
  { type: "h2", text: "What a service gives you, and what to check" },
  {
    type: "p",
    text: "A service should be judged on what changed, not on what was reported. The work in AEO is unglamorous and specific: making sure your content is in the HTML rather than assembled by JavaScript a crawler will not run, stating who you are in structured data, getting the AI search crawlers unblocked, and building the third-party corroboration engines cross-check you against.",
  },
  {
    type: "ul",
    items: [
      "**Ask what gets changed.** A provider who cannot name the specific edits is selling a report with a bigger invoice.",
      "**Ask about crawler access first.** If AI search crawlers cannot fetch your pages, everything else is decoration. Our [AI crawler checker](/tools/ai-crawler-checker) answers this in a few seconds, free.",
      "**Ask how they measure.** \"Mentioned on two engines\" is checkable. \"Improved AI visibility\" is not.",
      "**Ask what happens if it does not work.** A provider carrying no risk has no reason to prioritise you.",
    ],
  },
  { type: "h2", text: "How to tell which one you need" },
  {
    type: "steps",
    items: [
      {
        title: "Check whether you are retrievable at all",
        text: "Run the [AI crawler checker](/tools/ai-crawler-checker) and [what AI crawlers see](/tools/what-ai-crawlers-see). If crawlers are blocked, or your content only exists after JavaScript runs, no tool subscription will help — this is an implementation problem.",
      },
      {
        title: "Decide who will act on a report",
        text: "Name the person. If you cannot, a tool will produce dashboards nobody opens. Buy the work instead.",
      },
      {
        title: "Check whether anything about you exists off-site",
        text: "Search your brand name in quotes. If no third party mentions you anywhere, tracking will confirm that for months while nothing changes. Corroboration is the constraint, and it is service work.",
      },
      {
        title: "Buy tracking once there is something to track",
        text: "Once you are retrievable, identifiable and mentioned somewhere, a tool starts earning its fee — it tells you which of those mentions actually moved an answer.",
      },
    ],
  },
  { type: "h2", text: "Where we sit, plainly" },
  {
    type: "p",
    text: "RankVyze is a service, not a tool. We charge $99 once for a 45-day sprint, and if you are not mentioned on at least two AI engines by the end of it, we refund the whole thing. We publish that number because almost nobody in this category publishes any number, which makes it impossible to budget for the work.",
  },
  {
    type: "p",
    text: "If what you actually need is tracking, buy tracking — we compare the real options and their real prices on [AI visibility tools](/ai-visibility-tools), including the ones we do not compete with.",
  },
  {
    type: "faq",
    items: [
      {
        q: "Can I do AEO myself?",
        a: "Yes, and if you have a developer and a writer it is often the right call. The work is roughly 20 to 40 hours done properly: server-side rendering for content that matters, structured data, crawler policy, and off-site profiles that agree with each other. Our free tools cover the diagnostic half at no cost.",
      },
      {
        q: "Do AEO tools actually work?",
        a: "For measurement, yes — the established ones run real prompts across real engines and report what came back. What none of them do is change the answer. Treat them as instrumentation, and budget separately for whatever the instrumentation tells you to fix.",
      },
      {
        q: "Why do the 'best AI SEO tools' lists never include services?",
        a: "Because the query asks for software, and the publishers are usually software vendors or agencies reviewing software. It is not a conspiracy, it is category convention — but it does mean the lists are the wrong place to look if you want the work done rather than measured.",
      },
      {
        q: "How long before an AI engine mentions a business?",
        a: "For a site that is already indexed and has some third-party presence, typically four to eight weeks after the fixes land. For a brand-new domain with no mentions anywhere, longer — the constraint is corroboration from other sites, and that cannot be rushed by anything on your own server.",
      },
    ],
  },
  {
    type: "links",
    title: "Related",
    items: [
      { label: "What AEO actually costs", href: "/blog/what-answer-engine-optimization-costs", note: "The four ways to buy it, with real ranges." },
      { label: "AI visibility tools compared", href: "/ai-visibility-tools", note: "Real prices, read from the vendors' own pages." },
      { label: "How to choose an AEO tool", href: "/blog/how-to-choose-an-aeo-tool", note: "If tracking is what you need." },
    ],
  },
];

// ---------------------------------------------------------------- post two

const internalLinking = [
  {
    type: "p",
    text: "**Internal links are the only ranking signal you control completely.** No outreach, no waiting, no one else's approval. And on most sites they are quietly broken in a way nobody notices, because the thing that breaks is invisible in every dashboard: the pages your own site says are important are not the pages you would name.",
  },
  { type: "h2", text: "Why this matters more for AI search than it used to" },
  {
    type: "p",
    text: "Engines use internal links for two things: finding pages, and judging which ones matter. For AI answers the first one dominates. An answer engine has to retrieve a page before it can quote it, and retrieval depends on the page having been crawled recently enough to be in the index at all. A page nothing links to gets crawled once, if the sitemap is read, and then largely forgotten.",
  },
  {
    type: "p",
    text: "That is a harsher outcome than it used to be. In traditional search a rarely-crawled page still sits in the index and can surface for a long-tail query. In AI search, a page that was not retrieved simply does not exist for that answer.",
  },
  { type: "h2", text: "The measurement mistake almost everyone makes" },
  {
    type: "p",
    text: "Count inbound internal links naively and your privacy policy wins. It is in the footer of every page, so on a 200-page site it collects 200 inbound links — more than any article you have ever written. Your terms page comes second. This is not a quirk to work around; it is the reason most internal link reports are useless.",
  },
  {
    type: "callout",
    tone: "tip",
    title: "The distinction that makes the number mean something",
    text: "Separate sitewide links from contextual ones. A sitewide link appears on nearly every page, so it cannot distinguish an important page from an unimportant one. A contextual link is one a person chose to place in a sentence. Only the second kind tells you anything, and it is the kind engines weigh most heavily.",
  },
  {
    type: "p",
    text: "Our [internal link checker](/tools/internal-link-checker) does this split automatically: any target appearing on 80% or more of the crawled pages is classed as template furniture and reported separately, leaving a ranking of pages that earned their links.",
  },
  { type: "h2", text: "Three problems worth finding" },
  {
    type: "h3",
    text: "Orphan pages",
  },
  {
    type: "p",
    text: "A page nothing links to. It is usually in the sitemap, so it can be discovered — but discovery and inclusion are separate decisions, and a page with no inbound links gives an engine no evidence that it matters. Orphans are the single most common reason a page stays unindexed on an otherwise healthy site, and the fix is almost never technical. It is one contextual link from a page that already gets crawled.",
  },
  { type: "h3", text: "Click depth" },
  {
    type: "p",
    text: "Crawl frequency falls off sharply with distance from your homepage. Two clicks gets revisited regularly. Four clicks might be fetched once and left for months. That matters most for anything whose value depends on being current — pricing, availability, comparison tables with dates in them.",
  },
  { type: "h3", text: "Broken internal links" },
  {
    type: "p",
    text: "Every one spends crawl budget on nothing and lands a reader on an error. They accumulate silently after any restructure, because nothing warns you when a link you wrote two years ago stops resolving.",
  },
  { type: "h2", text: "What our own site looked like" },
  {
    type: "p",
    text: "We ran the checker against rankvyze.com while building it, which is the only honest way to describe what the output is worth. At the time of writing the site had 93 URLs in its sitemap. A 25-page crawl found 670 internal links across 94 unique targets.",
  },
  {
    type: "table",
    head: ["Clicks from homepage", "Pages", "What it means"],
    rows: [
      ["0", "1", "The homepage itself"],
      ["1", "24", "Everything in the nav and footer"],
      ["2", "69", "The long tail — glossary, guides, tools"],
      ["3 or more", "0", "Nothing buried"],
    ],
  },
  {
    type: "p",
    text: "Zero orphans and zero broken links, which is the boring answer you want. But the finding that mattered was in the ranking rather than the errors: our highest-intent commercial page was reachable only through one hub page, two clicks from anywhere, while eight lower-intent pages sat in the footer. Nothing was broken. The site was simply voting for the wrong things.",
  },
  { type: "h2", text: "How to fix it, in order" },
  {
    type: "steps",
    items: [
      {
        title: "Find the orphans",
        text: "Run the [internal link checker](/tools/internal-link-checker) against your homepage. Anything in your sitemap that nothing links to is the first list to work through, because those pages are getting no consideration at all.",
      },
      {
        title: "Give each orphan one real link",
        text: "From a page that is already crawled well, inside a sentence, with anchor text that describes the destination. One contextual link beats being added to the footer.",
      },
      {
        title: "Pull your commercial pages up to two clicks",
        text: "List the pages that make money. If any is three or more clicks from the homepage, it needs a link from somewhere shallower — usually the nav, the footer, or a hub page that is already shallow.",
      },
      {
        title: "Fix broken links and stray nofollows",
        text: "Both are cheap to fix and pure loss otherwise. Internal nofollow is almost always unintentional and usually arrives as a plugin default.",
      },
      {
        title: "Re-run and compare",
        text: "The ranking should now put your commercially important pages near the top. If it does not, your site is still telling engines something different from what you intend.",
      },
    ],
  },
  {
    type: "faq",
    items: [
      {
        q: "How many internal links should a page have?",
        a: "There is no correct number, and targets like \"100 links per page\" are folklore. What matters is that every page you care about receives at least one contextual link, and that important pages receive more than unimportant ones. Ranking your pages by contextual inbound links and checking the order matches your priorities is a better test than any count.",
      },
      {
        q: "Do footer links count?",
        a: "They count for discovery — a footer link guarantees a page is reachable and crawled. They count for very little in judging importance, because every page has them. Use the footer to guarantee reachability, and body links to signal importance.",
      },
      {
        q: "What is a good click depth?",
        a: "Within two clicks of the homepage for anything commercially important. Three is acceptable for archive and reference content. Beyond three, expect infrequent crawling and slow updates.",
      },
      {
        q: "Does anchor text matter for AI search?",
        a: "Yes, and arguably more than for traditional search. Anchor text is one of the clearest statements on your site about what a page is, and engines building an understanding of your entity read it as a label. \"Click here\" wastes that; the destination's actual subject does not.",
      },
      {
        q: "Can internal linking fix a page that is not indexed?",
        a: "Often, yes — if the reason it is unindexed is that nothing links to it, which is common. It will not fix a page blocked by robots.txt, carrying a noindex tag, or whose content only exists after JavaScript runs. Rule those out first with the [meta tag checker](/tools/meta-tag-checker).",
      },
    ],
  },
  {
    type: "links",
    title: "Tools used in this post",
    items: [
      { label: "Internal link checker", href: "/tools/internal-link-checker", note: "Ranks your pages by contextual links, finds orphans and depth problems." },
      { label: "Sitemap checker", href: "/tools/sitemap-checker", note: "Confirms what you are actually declaring to crawlers." },
      { label: "Meta tag checker", href: "/tools/meta-tag-checker", note: "Rules out noindex and canonical problems." },
    ],
  },
];

// -------------------------------------------------------------- post three

const notIndexed = [
  {
    type: "p",
    text: "**A new domain typically takes one to four weeks for its first pages to appear in Google, and longer to be indexed in full.** Before assuming something is broken, it is worth ruling out the handful of things that genuinely block indexing — and then using the one submission route most people have never heard of.",
  },
  {
    type: "callout",
    tone: "warn",
    title: "First, check your search syntax",
    text: "The site: operator takes no space. Searching site: yoursite.com with a space silently disables the operator and returns ordinary results, including other companies with similar names. It is site:yoursite.com, and getting this wrong has convinced a lot of people they had a problem they did not have.",
  },
  { type: "h2", text: "Five things that actually block indexing" },
  {
    type: "p",
    text: "Work through these before concluding it is a waiting game. Each takes under a minute and each is a real, common cause.",
  },
  {
    type: "table",
    head: ["Check", "What kills you", "How to check"],
    rows: [
      ["robots.txt", "Disallow: / left over from staging", "Load yoursite.com/robots.txt and read it"],
      ["noindex", "A meta robots noindex shipped to production", "[Meta tag checker](/tools/meta-tag-checker)"],
      ["X-Robots-Tag", "A noindex header set at the CDN, invisible in the HTML", "Check response headers"],
      ["Canonical", "Every page pointing at the homepage", "[Meta tag checker](/tools/meta-tag-checker)"],
      ["Rendering", "Content assembled by JavaScript the crawler never runs", "[What AI crawlers see](/tools/what-ai-crawlers-see)"],
    ],
  },
  {
    type: "p",
    text: "A staging-era robots.txt is the most common single cause, and the most embarrassing, because the site works perfectly for every human who visits it. The noindex header is the nastiest, because it does not appear anywhere in your HTML — you have to look at the response headers to find it.",
  },
  { type: "h2", text: "The submission route nobody mentions" },
  {
    type: "p",
    text: "Google gets all the attention, and Google has exactly one submission mechanism: Search Console. Verify the property, submit the sitemap, request indexing on individual URLs. There is no faster path and no API that changes this.",
  },
  {
    type: "p",
    text: "Bing is different, and this is the part worth knowing. Bing supports **IndexNow**, an open protocol that lets you push URLs directly rather than wait to be crawled. You host a key file at your domain root, POST a JSON body listing your URLs, and Bing, Yandex and Seznam all receive the same submission.",
  },
  {
    type: "code",
    lang: "json",
    caption: "POST to https://api.indexnow.org/indexnow",
    code: '{\n  "host": "yoursite.com",\n  "key": "your-key",\n  "keyLocation": "https://yoursite.com/your-key.txt",\n  "urlList": [\n    "https://yoursite.com/",\n    "https://yoursite.com/pricing"\n  ]\n}',
  },
  {
    type: "callout",
    tone: "tip",
    title: "Why Bing matters more than its market share suggests",
    text: "ChatGPT's search step is Bing-backed. A page Bing has not indexed cannot be retrieved, summarised or cited in a ChatGPT answer — so on a new domain, Bing indexing latency is the actual bottleneck on AI visibility, and it is the one you can do something about today.",
  },
  {
    type: "p",
    text: "Up to 10,000 URLs go in a single request. Do not resubmit unchanged URLs repeatedly — the endpoint returns a 422 for that, and it is treated as spam behaviour.",
  },
  { type: "h2", text: "What actually speeds Google up" },
  {
    type: "ol",
    items: [
      "**Verify Search Console and submit the sitemap.** This is the gate in front of every other Google action, and an unverified property has no submission route at all.",
      "**Request indexing on your five most important URLs.** Not all of them — the quota is small and it is better spent on pages that matter.",
      "**Make every page reachable within two clicks.** Discovery follows links. A page reachable only from the sitemap gets crawled once and reconsidered rarely; run the [internal link checker](/tools/internal-link-checker) to find the ones that are stranded.",
      "**Get one external link.** A single link from any indexed site gives crawlers a route in that does not depend on your sitemap being read. This is the step people skip and it is the one that most reliably works.",
      "**Publish something worth returning for.** Crawl frequency responds to change. A site that never updates gets visited on a schedule that reflects that.",
    ],
  },
  { type: "h2", text: "A realistic timeline" },
  {
    type: "table",
    head: ["When", "What to expect"],
    rows: [
      ["Days 1–7", "Bing picks up an IndexNow submission. Homepage appears in Google if you have any external link at all."],
      ["Weeks 1–3", "Google indexes the bulk of a small site, assuming Search Console is verified and the sitemap submitted."],
      ["Weeks 4–8", "Low-competition pages — glossaries, tools, definitions — start ranking. Commercial pages usually do not yet."],
      ["Months 2–4", "AI engines begin citing pages, but only where an indexed page or a third-party mention exists to cite."],
    ],
  },
  {
    type: "p",
    text: "If you are inside those windows and the five checks above came back clean, nothing is wrong. New domains are not penalised; they simply have no crawl history, no links and no track record, and those are accumulated rather than configured.",
  },
  {
    type: "faq",
    items: [
      {
        q: "How long does Google take to index a new site?",
        a: "Typically one to four weeks for the first pages, and longer for full coverage. The single biggest variable is whether any external site links to you — a domain with one inbound link from an indexed page is usually found within days, while one with none can wait weeks for its sitemap to be picked up.",
      },
      {
        q: "Does submitting a sitemap guarantee indexing?",
        a: "No. A sitemap tells an engine a URL exists; it does not argue that the URL is worth having. Pages that appear only in a sitemap, with no internal or external links, are routinely discovered and then not indexed. Discovery and inclusion are separate decisions.",
      },
      {
        q: "Is there an IndexNow equivalent for Google?",
        a: "No. Google does not participate in IndexNow and has said it has no plans to. Search Console remains the only submission route, which is why verifying it is the first thing to do on any new domain.",
      },
      {
        q: "Why is only my homepage indexed?",
        a: "Usually one of two things: the site is simply young and Google has started with the page it found first, or the other pages have no internal links pointing at them and look unimportant. Check the second with the [internal link checker](/tools/internal-link-checker) before assuming the first.",
      },
      {
        q: "Does domain age itself hurt my rankings?",
        a: "Age is not a ranking factor. What correlates with it is everything age allows to accumulate: links, content, crawl history, mentions elsewhere. A new domain is not penalised, it is just short on evidence. You can check any domain's real registration date with our [domain age checker](/tools/domain-age-checker).",
      },
    ],
  },
  {
    type: "links",
    title: "Check your own site",
    items: [
      { label: "Meta tag checker", href: "/tools/meta-tag-checker", note: "noindex, canonical and title problems in one pass." },
      { label: "Sitemap checker", href: "/tools/sitemap-checker", note: "Finds your sitemap and reports what is wrong with it." },
      { label: "Internal link checker", href: "/tools/internal-link-checker", note: "Finds pages nothing links to." },
    ],
  },
];

// ------------------------------------------------------------------ publish

const posts = [
  {
    slug: "aeo-tools-vs-aeo-services",
    title: "AEO tools vs AEO services: which one do you actually need?",
    seoTitle: "AEO Tools vs AEO Services",
    description:
      "An AEO tool tells you whether AI engines mention you. A service changes whether they do. Real prices, and how to tell which one you actually need.",
    excerpt:
      "One measures, the other changes the answer. They are sold in the same aisle and solve different problems — here is how to tell which you need.",
    category: "Strategy",
    targets: [
      "aeo tools vs services",
      "do i need an aeo agency",
      "ai visibility tool vs agency",
      "best aeo service",
      "answer engine optimization service",
      "done for you aeo",
    ],
    featured: true,
    position: 12,
    blocks: toolsVsServices,
  },
  {
    slug: "internal-linking-for-ai-search",
    title: "Internal linking for AI search: the pages your own site votes for",
    seoTitle: "Internal Linking for AI Search",
    description:
      "Why sitewide links tell you nothing, what an orphan page really costs, and how to find both — with real numbers from crawling our own site.",
    excerpt:
      "Count inbound links naively and your privacy policy wins. Here is the split that makes the number mean something.",
    category: "Technical",
    targets: [
      "internal linking for ai search",
      "internal link checker",
      "orphan pages seo",
      "click depth seo",
      "internal linking best practices",
      "how many internal links per page",
    ],
    featured: false,
    position: 20,
    blocks: internalLinking,
  },
  {
    slug: "why-your-new-site-isnt-indexed",
    title: "Why your new site isn't indexed yet",
    seoTitle: "Why Your New Site Isn't Indexed Yet",
    description:
      "Five things that genuinely block indexing, the submission protocol most people have never heard of, and a realistic timeline for a new domain.",
    excerpt:
      "Rule out the five real blockers, then use the submission route nobody mentions. A realistic timeline for a brand-new domain.",
    category: "Technical",
    targets: [
      "new site not indexed",
      "how long does google take to index a new site",
      "site not showing up in google",
      "why is only my homepage indexed",
      "indexnow bing",
      "how to get indexed faster",
    ],
    featured: false,
    position: 22,
    blocks: notIndexed,
  },
];

for (const p of posts) {
  const data = {
    title: p.title,
    seoTitle: p.seoTitle,
    description: p.description,
    excerpt: p.excerpt,
    category: p.category,
    targets: p.targets.join(", "),
    status: "PUBLISHED",
    featured: p.featured,
    position: p.position,
    blocksJson: JSON.stringify(p.blocks),
    publishedAt: new Date(),
  };

  const row = await db.blogPost.upsert({
    where: { slug: p.slug },
    update: data,
    create: { slug: p.slug, ...data },
  });

  console.info(`${row.status.padEnd(9)} /blog/${row.slug}  — ${p.blocks.length} blocks`);
}

console.info(`\ntotal published: ${await db.blogPost.count({ where: { status: "PUBLISHED" } })}`);
await db.$disconnect();
