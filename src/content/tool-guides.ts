/**
 * How-to steps and explanatory sections for each free tool.
 *
 * Kept apart from src/content/tools.ts on purpose. That file is the registry —
 * what a tool is, what it says, what it links to — and it is edited whenever a
 * tool is added. This is prose, edited whenever the writing improves. Splitting
 * them means a content pass never has to touch the registry.
 *
 * Why this exists at all: the tool pages ran 412–751 words, which is thin for
 * queries this competitive, and thin in the specific way that matters for AI
 * answers — a page with an input box and no explanation gives an engine nothing
 * to quote. `steps` is also emitted as HowTo structured data, which is the
 * format an answer engine most readily lifts a procedure from.
 *
 * The rule for writing here: every section answers a question someone actually
 * has after running the tool. "How to read this" and "what to do about it" earn
 * their place. Padding toward a word count does not, and reads like padding to
 * a reader and a ranking system alike.
 */

export interface ToolGuide {
  /** Rendered as an ordered list and emitted as HowTo structured data. */
  steps: { name: string; text: string }[];
  /** Prose below the tool. Each heading is an H2. */
  sections: { heading: string; body: string }[];
}

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "internal-link-checker": {
    steps: [
      { name: "Enter your domain", text: "Type your homepage address. You can paste any page — the crawl starts wherever you point it, and depth is measured from there." },
      { name: "Let it crawl", text: "It walks up to 25 pages breadth-first, obeying your robots.txt. Breadth-first matters: it is what makes the depth number mean clicks from your starting page rather than an arbitrary walk order." },
      { name: "Read the ranking, not the raw counts", text: "Nav and footer links are stripped out of the ranking. What is left is the pages your own editorial links vote for." },
      { name: "Fix orphans first, then depth", text: "A page nothing links to is invisible in a way no amount of content fixes. After that, pull anything commercially important up to within two clicks." },
    ],
    sections: [
      {
        heading: "Why sitewide links are excluded from the ranking",
        body: "Every page carries your nav and footer, so those links are identical for every destination — they cannot distinguish an important page from an unimportant one. A privacy policy linked from the footer of 200 pages collects 200 inbound links and deserves none of the weight that implies. This tool classes any target appearing on 80% or more of the crawled pages as sitewide and reports it separately, so the ranking shows only links someone chose to place. That is the number that reflects what your site actually says about itself.",
      },
      {
        heading: "What an orphan page costs you",
        body: "An orphan is a page nothing links to. It usually sits in the sitemap, so a crawler can discover it once, but there is no path to it by following links — and following links is how engines judge whether a page matters and how often to come back. Orphans are the most common reason a page stays unindexed on a site that is otherwise healthy. The fix is rarely technical: it is one contextual link from a page that is already crawled well.",
      },
      {
        heading: "Why click depth changes what gets indexed",
        body: "Crawl frequency falls off sharply with distance from your entry point. A page two clicks from the homepage gets revisited regularly; the same page at four clicks may be fetched once and left alone for months. That matters most for anything whose value depends on being current — pricing, availability, comparison tables. If a page earns money, it belongs within two clicks, and a footer or hub link is usually the cheapest way to get it there.",
      },
    ],
  },

  "sitemap-checker": {
    steps: [
      { name: "Enter your domain", text: "It looks for sitemap.xml, sitemap_index.xml and the usual variants. If yours lives somewhere unusual, paste the full URL to the file." },
      { name: "Check the URL count against reality", text: "If the total is far below the number of pages you publish, your generator is filtering something out — often drafts, paginated archives, or an entire section." },
      { name: "Read the lastmod coverage", text: "Entries without a lastmod give crawlers no way to prioritise. A sitemap where nothing carries one makes every page look equally stale." },
      { name: "Confirm robots.txt declares it", text: "The Sitemap line in robots.txt is how a crawler finds the file without being told. It is free and it reaches every crawler, including the AI ones." },
    ],
    sections: [
      {
        heading: "What actually breaks a sitemap",
        body: "Malformed XML is rare because generators produce it. The failures that matter are quieter: URLs on a different host, which is invalid and causes the whole file to be ignored for those entries; HTTP URLs listed on an HTTPS site, every one of which costs a redirect before the real page is reached; and duplicate entries, which usually mean two plugins are both writing the file. None of these throw an error anywhere you would see one.",
      },
      {
        heading: "Why a sitemap will not get you indexed on its own",
        body: "A sitemap tells an engine a URL exists. It does not tell it the URL is worth having. Pages that appear only in the sitemap — with no internal link pointing at them — are routinely discovered and then not indexed, because discovery and inclusion are separate decisions. Treat the sitemap as a completeness check on your internal linking rather than a substitute for it. If a page matters, something on your site should link to it.",
      },
    ],
  },

  "redirect-checker": {
    steps: [
      { name: "Paste the URL you want to trace", text: "Use the address people actually reach — an old link, a campaign URL, a shortened link — rather than the destination you hope it lands on." },
      { name: "Count the hops", text: "Each hop is a round trip before anyone sees content. One is normal. Two is tolerable. Three or more is worth removing." },
      { name: "Check the status codes", text: "301 is permanent and passes signals. 302 is temporary and tells engines to keep the original indexed. Using 302 for a permanent move is the most common redirect mistake there is." },
      { name: "Watch for a protocol or www hop", text: "http to https to www is two hops that most sites can collapse into one at the server or CDN." },
    ],
    sections: [
      {
        heading: "301 or 302, and why it matters more than it looks",
        body: "A 301 says the move is permanent: engines transfer ranking signals to the destination and eventually drop the old URL. A 302 says the original will return, so engines keep indexing the old URL and may not pass signals at all. Content management systems default to 302 more often than anyone expects, and the symptom is subtle — a migrated page that never quite ranks, while the old URL lingers in results for months.",
      },
      {
        heading: "What a redirect chain costs",
        body: "Every hop is a full round trip before a byte of content arrives, which is felt hardest on mobile connections. Crawlers apply their own limits and will stop following a chain that runs long, leaving the destination undiscovered. Chains accumulate quietly during migrations — each one adds a rule and nobody collapses the old ones — so the fix is usually to point the first URL straight at the final destination rather than to delete anything.",
      },
    ],
  },

  "ai-crawler-checker": {
    steps: [
      { name: "Enter your domain", text: "It reads your robots.txt and evaluates it the way each crawler does, rather than just showing you the file." },
      { name: "Look at search crawlers first", text: "OAI-SearchBot, PerplexityBot and Claude-SearchBot decide whether you can appear in AI answers at all. Blocking these removes you completely." },
      { name: "Decide about training crawlers separately", text: "GPTBot, ClaudeBot and Google-Extended feed model training. Blocking them is a legitimate choice and does not remove you from AI search." },
      { name: "Check the live probe results", text: "robots.txt is only half the story. A CDN or firewall can block a crawler by user agent regardless of what your robots.txt permits." },
    ],
    sections: [
      {
        heading: "The distinction that costs people the most visibility",
        body: "Each AI vendor runs more than one crawler, and they do different jobs. OpenAI's GPTBot gathers training data; OAI-SearchBot retrieves pages to answer a live question. They are separate user agents and they obey separate rules. Sites that want to stay out of model training frequently block everything with the vendor's name in it, which also removes them from the answers themselves. That is close to the worst outcome available: no training benefit to anyone, and no visibility either.",
      },
      {
        heading: "Why robots.txt alone is not proof of access",
        body: "robots.txt is a request that well-behaved crawlers honour, but it is not what enforces access. A bot-management rule at your CDN, a firewall filtering unknown user agents, or a rate limit can all refuse an AI crawler while your robots.txt says it is welcome. This is common on sites behind aggressive bot protection and it is invisible in the file itself, which is why this tool also fetches your homepage as each crawler and reports what actually came back.",
      },
    ],
  },

  "what-ai-crawlers-see": {
    steps: [
      { name: "Enter the page you care about", text: "Pick a page whose content matters commercially — a product, a pricing page, a comparison — rather than the homepage." },
      { name: "Compare the rendered and raw text", text: "The tool fetches your HTML the way a crawler does, without running your JavaScript, and shows what survives." },
      { name: "Look for missing body content", text: "If your main content is absent from the raw HTML, an engine that does not execute JavaScript sees an empty page." },
      { name: "Check the word count", text: "A page that renders 1,200 words in a browser and 40 in raw HTML is a client-side rendering problem, not a content problem." },
    ],
    sections: [
      {
        heading: "Why AI crawlers and Googlebot are not the same audience",
        body: "Googlebot renders JavaScript, on a delay and with a budget, but it renders. Most AI crawlers do not. They fetch the HTML your server returns and work with that. A single-page application that assembles its content in the browser can rank acceptably in Google and be genuinely invisible to ChatGPT and Perplexity, because what those crawlers received was a shell with a loading state. This is the most consequential technical difference between traditional SEO and AEO.",
      },
      {
        heading: "What to do when content is missing",
        body: "The fix is server-side rendering or static generation for the content that matters — not for the whole application. Most frameworks support rendering a page's substance on the server while leaving interactive components to hydrate afterwards. You do not need to abandon client-side interactivity; you need the text, headings and structured data present in the response body. If a crawler has to run your application to find out what you sell, assume it will not.",
      },
    ],
  },

  "schema-markup-checker": {
    steps: [
      { name: "Enter a page URL", text: "Structured data varies by page type, so check a product or article page rather than only the homepage." },
      { name: "Check which types are present", text: "Organization identifies the business. Article, Product, FAQPage and Service describe what a given page is." },
      { name: "Look for broken references", text: "An @id that points at a node which does not exist is worse than no reference — it asserts a relationship and fails to deliver it." },
      { name: "Fix errors before adding types", text: "One correct, complete Organization block does more than five partially filled ones." },
    ],
    sections: [
      {
        heading: "What structured data does for AI answers",
        body: "An engine reading prose has to infer what your business is, what it sells and where it operates. Structured data states those facts in a format that needs no inference, which removes the step most likely to produce a wrong answer about you. It does not make you rank. It makes you unambiguous — and ambiguity is why engines describe companies inaccurately or omit them from comparisons they would otherwise belong in.",
      },
      {
        heading: "Why the @graph pattern is worth the effort",
        body: "Separate JSON-LD blocks describe separate things with no stated relationship between them. Wrapping your nodes in an @graph and linking them by @id says explicitly that this Article was published by that Organization, which is the same entity the sameAs profiles describe. That connection is what lets an engine build a coherent picture rather than a pile of unrelated facts, and it is the difference between markup that validates and markup that is useful.",
      },
    ],
  },

  "meta-tag-checker": {
    steps: [
      { name: "Enter a page URL", text: "Check the pages you want people to find first — commercial pages before blog posts." },
      { name: "Read the title length", text: "Titles are truncated around 580 pixels, roughly 60 characters. Front-load anything that must survive the cut." },
      { name: "Check the description does work", text: "Descriptions are not a ranking factor, but they decide whether anyone clicks. A page with no description gets whatever text the engine chooses." },
      { name: "Confirm the canonical is self-referential", text: "A canonical pointing somewhere else tells engines to index that page instead of this one, which is occasionally intended and usually not." },
    ],
    sections: [
      {
        heading: "Why your description gets rewritten anyway",
        body: "Google rewrites meta descriptions most of the time, choosing page text that better matches the query. That is not a reason to skip writing one. The description is what appears when there is no obvious better match, which includes brand searches and shares — the queries most likely to convert. It also sets the framing an engine works from. A description that states what you do, for whom, and at what price is one an engine can lift verbatim.",
      },
      {
        heading: "Open Graph is what people actually see",
        body: "Every share on Slack, LinkedIn, WhatsApp or iMessage renders your Open Graph tags, not your meta description. A missing og:image produces a bare grey link that measurably fewer people click. The subtlety worth knowing: declaring an openGraph block without an image can suppress an otherwise working default, so a page that had a card can silently lose it after an unrelated change. Check the pages you share most.",
      },
    ],
  },

  "domain-age-checker": {
    steps: [
      { name: "Enter a domain", text: "Works on any registered domain, yours or a competitor's. No account and no API key." },
      { name: "Read the registration date", text: "This is the first registration on record, taken from the registry's own RDAP response rather than a scraped WHOIS page." },
      { name: "Compare against expectations", text: "A domain registered last month will not rank like one registered a decade ago, whatever the content quality." },
      { name: "Check the expiry", text: "A domain renewed years ahead signals a business that intends to still be there. One expiring in weeks is worth noticing on a supplier." },
    ],
    sections: [
      {
        heading: "How much domain age actually matters",
        body: "Age is not a ranking factor in itself — Google has said so repeatedly, and a fifteen-year-old parked domain ranks for nothing. What correlates with age is everything age gives time for: links accumulated, content published, a crawl history, mentions on other sites. A new domain is not penalised; it simply has none of those yet. The practical consequence is patience. A site launched this month competing against sites launched in 2015 is behind on evidence, not on merit, and the gap closes with published work rather than technical changes.",
      },
      {
        heading: "Where this data comes from",
        body: "RDAP, the registry protocol that replaced WHOIS. It is free, keyless, structured, and comes from the registry that holds the record rather than a third party's cached copy. Some registries redact dates for privacy, particularly for domains registered by individuals in the EU, and country-code domains vary in what they publish. When a date is missing here it is because the registry does not publish it, not because we could not find it.",
      },
    ],
  },

  "ai-visibility-checker": {
    steps: [
      { name: "Enter your domain", text: "The tool reads your site the way an engine would, then reports what it could and could not establish about you." },
      { name: "Read what it could not determine", text: "The gaps are the finding. If the tool cannot tell what you sell or where you operate, an engine describing you has the same problem." },
      { name: "Fix the identity gaps first", text: "Name, category, what you offer and where. These are what an engine needs before it can consider recommending you for anything." },
      { name: "Then check retrievability", text: "Being understandable is useless if crawlers cannot reach you. Run the AI crawler checker next." },
    ],
    sections: [
      {
        heading: "What this tool deliberately does not do",
        body: "It does not query ChatGPT, Perplexity, Gemini or Claude to see whether you are mentioned. Doing that properly means running many prompts across many engines and tracking results over time, which is a paid product — several exist and some are good. A free tool claiming to have done it would be reporting a number it did not measure. What this checks instead is everything that determines the answer: whether your identity is stated unambiguously, whether crawlers can reach your content, and whether what they find says what you would want said.",
      },
      {
        heading: "Why retrievability comes before content quality",
        body: "AI visibility has a strict order of operations. A crawler must be able to fetch the page; the page must contain the content in its HTML; the content must state facts clearly enough to be extracted; and the entity must be identifiable enough to be attributed. A failure at any earlier step makes every later one irrelevant. Most sites that are invisible in AI answers fail at step one or two, and no amount of writing fixes a page a crawler never received.",
      },
    ],
  },

  "llms-txt-generator": {
    steps: [
      { name: "Enter your domain", text: "The tool reads your sitemap and site metadata to draft a file describing what you publish." },
      { name: "Edit the summary", text: "The generated description is a starting point from your own copy. One sentence that states plainly what you do beats three that hedge." },
      { name: "Prune the link list", text: "Keep the pages you would want quoted. A file listing every URL is a sitemap with extra steps." },
      { name: "Publish at /llms.txt", text: "Serve it as text/plain at your domain root, alongside robots.txt." },
    ],
    sections: [
      {
        heading: "An honest note on llms.txt",
        body: "llms.txt is a proposed convention, not a standard, and no major AI engine has committed to reading it. Publishing one will not get you cited. It is cheap to add and it does something useful regardless: writing it forces you to state, in one file, what your site is about and which pages you would want quoted — which is an exercise most sites benefit from whether or not anything ever fetches the result. Treat it as low-cost preparation, not as a ranking lever, and be suspicious of anyone selling it as the latter.",
      },
      {
        heading: "What belongs in it",
        body: "A short description of what the site is, followed by curated links with one line of context each. The value is in the curation. A file pointing at your twelve most useful pages, each with a sentence explaining what it answers, is a genuine summary. A file pointing at four hundred URLs is a sitemap in a different syntax and communicates nothing a sitemap does not already.",
      },
    ],
  },

  "robots-txt-generator": {
    steps: [
      { name: "Enter your site URL", text: "Used only for the Sitemap line. Leave it blank to omit that line entirely." },
      { name: "Decide on each crawler group", text: "AI search, AI training, on-demand fetchers and traditional search are separate choices because they have separate consequences." },
      { name: "Add the paths to keep out", text: "Admin, checkout and account areas. Remember robots.txt is a request, not access control — anything genuinely private needs authentication." },
      { name: "Publish at your domain root", text: "Save it as robots.txt at the root, served as text/plain. It applies to that exact host and protocol; a subdomain needs its own." },
    ],
    sections: [
      {
        heading: "Blocking training without blocking answers",
        body: "If you want your writing kept out of model training but still want to appear in AI answers, block the training crawlers and allow the search ones. GPTBot, ClaudeBot, Google-Extended and Applebot-Extended gather training data. OAI-SearchBot, PerplexityBot and Claude-SearchBot retrieve pages to answer live questions. They are different user agents obeying different rules, and conflating them is the single most common self-inflicted visibility problem we see.",
      },
      {
        heading: "What robots.txt cannot do",
        body: "It cannot keep a page out of search results — a disallowed URL can still be indexed from links pointing at it, listed without a description. Use a noindex meta tag for that, and note the page must be crawlable for noindex to be read at all. It also cannot protect anything: the file is public, and listing a sensitive path in it is an advertisement. Real protection is authentication, and always was.",
      },
    ],
  },

  "schema-markup-generator": {
    steps: [
      { name: "Pick the type you need", text: "Organization for the business itself, LocalBusiness when there is a physical location, Service for what you offer, FAQPage for question and answer pairs." },
      { name: "Fill in what you actually know", text: "Empty fields are omitted rather than emitted blank. A short accurate block beats a long speculative one." },
      { name: "Copy the JSON-LD", text: "It comes wrapped in a script tag, ready to paste. Nothing you type here leaves your browser." },
      { name: "Paste it into the page head", text: "One Organization block sitewide; the page-specific types on the pages they describe." },
    ],
    sections: [
      {
        heading: "Which four types are worth your time",
        body: "Schema.org defines hundreds of types and almost all of them are irrelevant to whether an engine can identify your business. Organization establishes who you are. LocalBusiness adds address and hours when there is somewhere to visit. Service describes what you sell, which is what answers a best-X-for-Y question. FAQPage is the most quotable format there is, because a question and its answer need no reformatting to become part of a generated response. Offering forty types would bury these four.",
      },
      {
        heading: "sameAs is the property most often filled in wrongly",
        body: "sameAs lists third-party profiles describing the same entity, and its purpose is corroboration — an engine checks whether independent sources agree with your claims. That makes a sameAs pointing at a page which does not exist actively harmful: it asserts a corroborating source and fails to produce one, which is exactly the inconsistency the property is meant to resolve. Only list profiles that are live, and make sure the details on them match what you claim here word for word.",
      },
    ],
  },
};

export function getToolGuide(slug: string): ToolGuide | undefined {
  return TOOL_GUIDES[slug];
}
