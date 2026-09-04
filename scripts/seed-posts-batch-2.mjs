/**
 * Second batch of posts, chosen from the keyword-map gaps by intent.
 *
 * Upserts by slug, deletes nothing — safe to re-run.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const posts = [];

// ---------------------------------------------------------------------------
// 1. AI crawlers / robots.txt — closes four mapped gaps at once, and
//    copy-paste technical pages are the most linkable thing on the list.
// ---------------------------------------------------------------------------
posts.push({
  slug: "ai-crawlers-robots-txt",
  title: "Which AI crawlers to allow, and how",
  seoTitle: "AI Crawlers and robots.txt: The Complete List",
  description:
    "Every AI crawler that matters, what each one actually does, and the robots.txt block to copy. Blocking the wrong one removes you from answers you wanted to be in.",
  excerpt:
    "GPTBot and OAI-SearchBot are not the same thing, and blocking one while meaning the other is the most common self-inflicted AEO wound there is.",
  category: "Technical",
  featured: true,
  position: 25,
  targets: [
    "ai crawlers robots.txt",
    "should i block gptbot",
    "what is gptbot",
    "how to allow ai crawlers",
    "oai-searchbot",
  ],
  blocks: [
    {
      type: "p",
      text: "**Most AI companies run more than one crawler, and they do different jobs.** Blocking the training crawler while hoping to appear in that company's search-backed answers is the single most common self-inflicted wound in this field — and it is usually a decision someone made in 2023 and never revisited.",
    },
    { type: "h2", text: "The crawlers, and what each one does" },
    {
      type: "table",
      head: ["User agent", "Operator", "What it does", "Blocking it means"],
      rows: [
        ["GPTBot", "OpenAI", "Crawls to train future models", "Less likely to be known by default"],
        ["OAI-SearchBot", "OpenAI", "Indexes for ChatGPT search results", "You can't appear in search-backed answers"],
        ["ChatGPT-User", "OpenAI", "Fetches a page a user asked about", "Users can't pull your page into a chat"],
        ["PerplexityBot", "Perplexity", "Indexes for Perplexity answers", "Removed from general Perplexity answers"],
        ["Perplexity-User", "Perplexity", "Fetches a page on user request", "Users can't pull your page in directly"],
        ["ClaudeBot", "Anthropic", "Crawls for training", "Less likely to be known by Claude"],
        ["Claude-User", "Anthropic", "Fetches on user request", "Users can't pull your page into Claude"],
        ["Claude-SearchBot", "Anthropic", "Indexes for Claude's search", "Removed from Claude's search results"],
        ["Google-Extended", "Google", "A control token, not a crawler — governs Gemini and grounding", "Content excluded from Gemini; Search rank unaffected"],
        ["Googlebot", "Google", "Ordinary Search crawling, which AI Overviews are built on", "Removed from Google entirely"],
        ["Applebot-Extended", "Apple", "Control token for Apple Intelligence training", "Excluded from Apple's models"],
        ["Bingbot", "Microsoft", "Search index behind Copilot", "Removed from Bing and Copilot"],
      ],
      caption: "Current as of publication. Operators change these; the primary sources are linked at the end.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "Google-Extended is not a crawler",
      text: "It has no user agent of its own and fetches nothing. Googlebot does the crawling; Google-Extended is a robots.txt token that governs a downstream use. Google states that disallowing it does not affect Search rankings — but it also does not remove you from AI Overviews, which follow ordinary Search snippet eligibility.",
    },
    { type: "h2", text: "The block to copy" },
    {
      type: "p",
      text: "If you want to be found in AI answers, this is the whole configuration. Naming each agent explicitly is not required — a permissive default already allows them — but it states intent, and it means the next person to touch this file has to make a deliberate choice rather than an accidental one.",
    },
    {
      type: "code",
      lang: "text",
      code: `# --- OpenAI ---
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# --- Perplexity ---
User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# --- Anthropic ---
User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

# --- Google ---
User-agent: Google-Extended
Allow: /

# --- Microsoft / Apple ---
User-agent: Bingbot
Allow: /

User-agent: Applebot-Extended
Allow: /

# --- Everything else ---
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api

Sitemap: https://yoursite.com/sitemap.xml`,
      caption: "Adjust the Disallow lines to your own authenticated paths.",
    },
    { type: "h2", text: "Should you block the training crawlers?" },
    {
      type: "p",
      text: "This is a real decision with a real trade-off, and the honest answer depends on what your content is worth to you.",
    },
    {
      type: "table",
      head: ["Allow training crawlers", "Block them"],
      rows: [
        ["Your business can be known without a live search", "Your writing isn't used to train a competitor's model"],
        ["Answers about you work offline from retrieval", "You keep a clearer claim if licensing ever matters"],
        ["Costs you nothing you were selling", "You lose the default-knowledge path entirely"],
      ],
    },
    {
      type: "p",
      text: "For most businesses the calculus is easy: you are not in the content-licensing business, and being known is the entire point. For publishers whose archive is the product, blocking training while allowing search is a coherent position — and it is exactly why the two crawlers are separate.",
    },
    {
      type: "callout",
      tone: "tip",
      title: "The one combination that is always a mistake",
      text: "Blocking OAI-SearchBot, PerplexityBot or Claude-SearchBot while wanting to appear in those products' answers. Those are the search crawlers. If you block them, no amount of content or schema will put you in the result.",
    },
    { type: "h2", text: "How to check what you have now" },
    {
      type: "steps",
      items: [
        {
          title: "Read your own file",
          text: "Open yoursite.com/robots.txt in a browser. Read every Disallow. Plenty of sites blocked AI crawlers on general principle in 2023 and never revisited it.",
        },
        {
          title: "Check the wildcard rules",
          text: "A `User-agent: *` block with a broad Disallow applies to every crawler that has no rule of its own. That is how sites block AI crawlers without ever naming one.",
        },
        {
          title: "Confirm the file is actually served",
          text: "A 404 page returning 200 with HTML in it is worse than no file — crawlers may treat unparseable content unpredictably.",
        },
        {
          title: "Check your CDN and firewall too",
          text: "robots.txt is a request, not a wall. Cloudflare, Vercel and AWS WAF can all block AI crawlers at the edge regardless of what your file says, and several enable this by default.",
        },
      ],
    },
    {
      type: "code",
      lang: "bash",
      code: `# What your robots.txt actually says
curl -s https://yoursite.com/robots.txt

# Does the site answer a crawler at all? (a 403 here is your answer)
curl -s -o /dev/null -w "%{http_code}\\n" \\
  -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" \\
  https://yoursite.com/`,
      caption: "The second command is the one that catches edge-level blocking.",
    },
    {
      type: "callout",
      tone: "note",
      title: "The blocking that isn't in your robots.txt",
      text: "Cloudflare added a one-click AI crawler block, and it is on by default for some plans. If your robots.txt is permissive but crawlers still get nothing, check your CDN's bot-management settings before touching anything else.",
    },
    { type: "h2", text: "robots.txt is not a security control" },
    {
      type: "p",
      text: "It is a published request that well-behaved crawlers honour. It does not authenticate, does not enforce, and listing a path under `Disallow` announces that the path exists. Anything that must not be read needs authentication, not a line in a text file.",
    },
    {
      type: "p",
      text: "Once crawlers can reach you, the next question is whether what they find says anything useful — which is [why businesses stay invisible](/blog/why-your-business-doesnt-show-up-in-chatgpt) even with a permissive file.",
    },
    {
      type: "faq",
      items: [
        {
          q: "What is GPTBot?",
          a: "OpenAI's crawler for gathering training data. It is separate from OAI-SearchBot, which indexes for ChatGPT's search results, and from ChatGPT-User, which fetches a page when a user asks about it directly.",
        },
        {
          q: "Should I block GPTBot?",
          a: "Only if you don't want your content used for model training and accept being less known by default. It is a legitimate choice for publishers. For most businesses, being known is the point — and blocking it does nothing to protect you commercially.",
        },
        {
          q: "Does blocking GPTBot remove me from ChatGPT?",
          a: "No. Search-backed answers come from OAI-SearchBot. Blocking GPTBot only reduces the chance the model learns about you during training. Many sites block one while intending the other.",
        },
        {
          q: "Does Google-Extended affect my Google rankings?",
          a: "Google states it does not. It governs use in Gemini and grounded generative answers, not Search ranking. AI Overviews eligibility follows ordinary Search snippet settings instead.",
        },
        {
          q: "Do AI crawlers actually obey robots.txt?",
          a: "The major operators publish that they do, and their crawlers are identifiable by user agent and published IP ranges. It is a voluntary protocol, so it is not a guarantee — treat it as a request, never as access control.",
        },
        {
          q: "Where should robots.txt live?",
          a: "At your domain root — https://yoursite.com/robots.txt — served as text/plain. It applies only to that exact host and protocol, so a subdomain needs its own.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        { label: "OpenAI — bots and crawlers", href: "https://platform.openai.com/docs/bots", note: "The three OpenAI agents and what each is for." },
        { label: "Perplexity — bots", href: "https://docs.perplexity.ai/guides/bots", note: "User agents and published IP ranges." },
        { label: "Anthropic — crawler access", href: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler", note: "ClaudeBot and how to control it." },
        { label: "Google — crawlers and fetchers", href: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers", note: "Where Google-Extended is defined." },
        { label: "RFC 9309 — the robots.txt standard", href: "https://www.rfc-editor.org/rfc/rfc9309.html", note: "What crawlers are actually obliged to honour." },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------
// 2. Diagnostic post — highest conversion intent, routes to the free scan.
// ---------------------------------------------------------------------------
posts.push({
  slug: "how-to-check-if-chatgpt-knows-your-business",
  title: "How to check if ChatGPT knows your business",
  seoTitle: "How to Check If ChatGPT Knows Your Business",
  description:
    "A repeatable 30-minute test across ChatGPT, Perplexity, Gemini and Claude — and the three mistakes that make most people read their own results backwards.",
  excerpt:
    "Asking ChatGPT about your own company while signed in tells you almost nothing. Here's the test that actually produces a number you can act on.",
  category: "Guides",
  position: 35,
  targets: [
    "how to check if chatgpt knows my business",
    "does chatgpt know my company",
    "check ai visibility",
    "test chatgpt brand mentions",
    "am i in chatgpt",
  ],
  blocks: [
    {
      type: "p",
      text: "Almost everyone runs this test wrong the first time, and the wrong version is reassuring — which is worse than useless. Here is the version that produces a number you can act on, and repeat in a month to see whether anything moved.",
    },
    { type: "h2", text: "The three mistakes that ruin the result" },
    {
      type: "ol",
      items: [
        "**Testing while signed in.** ChatGPT personalises from your history and memory, including every previous time you discussed your own company. It will mention you — to you, and to nobody else.",
        "**Asking about yourself by name.** “What is Acme?” tests recall of a name you supplied. Your buyers don't know your name yet; that's the problem. Ask the question *they* ask.",
        "**Asking once.** Answers vary between sessions. One miss is noise. A miss across ten questions and four engines is a finding.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Use a private window, every time",
      text: "Signed out, incognito, no extensions. This is the single change that makes the test mean anything — you want to see what a stranger sees, not what the model has learned about you from you.",
    },
    { type: "h2", text: "Write the ten questions first" },
    {
      type: "p",
      text: "Before opening a single engine, write down the ten questions a buyer asks in the week before they choose someone like you. In their words, not your internal vocabulary. A good set mixes four shapes:",
    },
    {
      type: "table",
      head: ["Shape", "Example", "What it tells you"],
      rows: [
        ["Category discovery", "best CRM for a two-person startup", "Whether you're in the consideration set at all"],
        ["Comparison", "Notion vs Airtable for a small agency", "Whether you're framed against the right alternatives"],
        ["Cost", "how much does a Shopify agency cost", "Whether you own the commercial question"],
        ["Local or vertical", "immigration lawyer for startup founders in Toronto", "Whether the qualifiers reach you"],
      ],
    },
    { type: "h2", text: "Run the test" },
    {
      type: "steps",
      items: [
        { title: "Open a private window", text: "Signed out on ChatGPT, Perplexity, Gemini and Claude. Four tabs." },
        { title: "Ask question one on all four", text: "Same wording, one at a time, fresh conversation each." },
        {
          title: "Record four things per answer",
          text: "Were you named at all? In what position — first, or fifth? Which competitors were named? Were any of your pages cited?",
        },
        { title: "Repeat for all ten questions", text: "Forty data points. This takes about half an hour and it is the whole job." },
        {
          title: "Score it",
          text: "Mention rate is the count of answers naming you, over forty. That single number is your baseline. Write down the date.",
        },
      ],
    },
    {
      type: "callout",
      tone: "note",
      title: "Position matters more than it looks",
      text: "Being named first reads as a recommendation. Being named fifth reads as a list someone will scroll past. Track it — a business that moves from fifth to first without changing mention rate has still won.",
    },
    { type: "h2", text: "Reading the result" },
    {
      type: "table",
      head: ["Mention rate", "What it means", "What to do first"],
      rows: [
        ["0%", "The engines cannot place you in this category at all", "Entity clarity: say what you are, plainly, on the homepage"],
        ["1–20%", "Known, but not a default answer", "Comparison and cost content for the questions you lose"],
        ["20–50%", "In the consideration set", "Corroboration — get described the same way off your own domain"],
        ["Over 50%", "A default answer in your category", "Defend it, and widen the question set"],
      ],
    },
    {
      type: "p",
      text: "Whatever the number, also look at *who* won. Open the pages the engines cited. That is the bar you have to clear, written down for you by a competitor.",
    },
    { type: "h2", text: "The technical half you can't see this way" },
    {
      type: "p",
      text: "The prompt test tells you where you stand. It cannot tell you why. The usual causes are mechanical: content that only exists after JavaScript runs, [a crawler blocked in robots.txt](/blog/ai-crawlers-robots-txt), no [structured data](/blog/schema-markup-for-ai-search), or a homepage that never states what the company is.",
    },
    {
      type: "p",
      text: "Our [free scan](/pricing) checks that half against your homepage in about ten seconds — schema, server rendering, crawler access, entity clarity — and scores each one. Run it alongside the prompt test and you have both halves of the picture.",
    },
    { type: "h2", text: "Repeat it monthly" },
    {
      type: "p",
      text: "The same ten questions, the same four engines, the same signed-out conditions, once a month. Without a fixed set you cannot distinguish a change that worked from a model update that happened to help — and that distinction is the entire difference between doing this and guessing.",
    },
    {
      type: "faq",
      items: [
        {
          q: "How do I check if ChatGPT knows my business?",
          a: "Ask the ten questions your buyers ask — not your company name — in a signed-out private window, and record whether you're named, in what position, and whether your pages are cited. Repeat across Perplexity, Gemini and Claude. Forty data points takes about thirty minutes.",
        },
        {
          q: "Why does ChatGPT mention my business to me but not to others?",
          a: "Because you're signed in. ChatGPT personalises from your conversation history and memory, including previous times you discussed your own company. Always test signed out.",
        },
        {
          q: "Is there a tool that checks this automatically?",
          a: "Tools exist that track brand mentions across engines, including ours. They're worth it once you're measuring continuously. For a first read, doing it by hand is free and teaches you more, because you see the full answers and the competitors' pages.",
        },
        {
          q: "How often should I re-check?",
          a: "Monthly. Technical changes can register in days, but content and corroboration take a month or two, and answers vary enough between sessions that a weekly cadence mostly measures noise.",
        },
        {
          q: "What if ChatGPT says something wrong about my business?",
          a: "State the correct version plainly on your own site — homepage, about page, and in your structured data — and get it corroborated on third-party pages. Models weight agreement across domains, so one page contradicting an old fact rarely moves it.",
        },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------
// 3. Claude — the one engine we sell against and had never written about.
// ---------------------------------------------------------------------------
posts.push({
  slug: "how-to-rank-on-claude",
  title: "How to get recommended by Claude",
  seoTitle: "How to Get Recommended by Claude (Anthropic)",
  description:
    "Claude is the most conservative of the four engines about naming businesses. That makes it harder to win and more valuable when you do. What actually moves it.",
  excerpt:
    "Claude hedges more than the other engines and names fewer companies. The bar is higher — which is exactly why fewer competitors are trying to clear it.",
  category: "Guides",
  position: 45,
  targets: [
    "how to rank on claude",
    "claude ai seo",
    "get recommended by claude",
    "claudebot",
    "anthropic ai search optimization",
  ],
  blocks: [
    {
      type: "p",
      text: "Claude is the engine people skip, usually on audience-size grounds. That reasoning is backwards for anyone selling to developers, technical buyers or professional-services firms — and it ignores the more interesting fact, which is that Claude is measurably harder to get named by.",
    },
    { type: "h2", text: "Why Claude names fewer businesses" },
    {
      type: "p",
      text: "Ask the same commercial question of all four engines and Claude will more often answer with criteria rather than companies: here is how to evaluate options, here is what matters, here are the trade-offs. It recommends specific businesses when it has a reason to be confident, and hedges when it doesn't.",
    },
    {
      type: "p",
      text: "That is a higher bar, and it has a direct consequence: the tactics that work on more permissive engines — publishing volume, keyword coverage, self-declared superlatives — move Claude least. What moves it is being unambiguously identifiable and independently corroborated.",
    },
    {
      type: "callout",
      tone: "note",
      title: "The upside of a harder bar",
      text: "Almost nobody is optimizing for Claude specifically. The competition for these answers is thinner than for ChatGPT, and a mention carries more weight with the reader precisely because the engine gives fewer of them.",
    },
    { type: "h2", text: "Let the right crawler in" },
    {
      type: "p",
      text: "Anthropic runs several agents, and as with OpenAI they do different jobs. Blocking the training crawler while wanting to appear in Claude's search results is the same mistake people make with GPTBot.",
    },
    {
      type: "table",
      head: ["User agent", "What it does", "Blocking it means"],
      rows: [
        ["ClaudeBot", "Crawls for model training", "Less likely to be known by default"],
        ["Claude-SearchBot", "Indexes for Claude's web search", "Removed from search-backed answers"],
        ["Claude-User", "Fetches a page a user asked about", "Users can't pull your page into a conversation"],
      ],
    },
    {
      type: "code",
      lang: "text",
      code: `User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /`,
      caption: "The full multi-engine block is in the AI crawlers guide.",
    },
    { type: "h2", text: "What actually moves it" },
    {
      type: "steps",
      items: [
        {
          title: "Be unambiguous about what you are",
          text: "Claude is unusually sensitive to category clarity. A homepage that says what the company is, who it serves, and where — in plain nouns, in the first hundred words — does more here than anywhere else.",
        },
        {
          title: "Be specific about scope",
          text: "“For teams of 5–50”, “Magento to Shopify Plus migrations”, “US and Canada”. Stated limits make a recommendation safe to give, and Claude weights safety heavily.",
        },
        {
          title: "Get corroborated off your own domain",
          text: "One domain asserting something is a claim. Several independent sources agreeing is a fact. This is the single biggest lever on Claude, and the slowest.",
        },
        {
          title: "Say what you're not good at",
          text: "Counter-intuitive and genuinely effective. Content that states where a product is the wrong choice reads as reliable rather than promotional — and reliability is the thing being assessed.",
        },
        {
          title: "Keep claims checkable",
          text: "Numbers, dates, named integrations, real constraints. Vague superlatives are the easiest thing for a cautious system to discount.",
        },
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "The honesty test",
      text: "Read your homepage and count the claims a stranger could verify from a third party within five minutes. On most sites the answer is zero. That number is roughly what a cautious engine has to work with.",
    },
    { type: "h2", text: "How to measure it" },
    {
      type: "p",
      text: "Same method as [the other engines](/blog/how-to-check-if-chatgpt-knows-your-business): a fixed set of buyer questions, asked signed out, scored monthly. Expect a lower mention rate than ChatGPT on the same set — that gap is the point, not a measurement error.",
    },
    {
      type: "p",
      text: "One Claude-specific signal worth recording: when it declines to name anyone and answers with criteria instead. That is not a loss so much as an unclaimed answer — and the criteria it lists are a free specification for the page that would win it.",
    },
    {
      type: "faq",
      items: [
        {
          q: "How do I get my business recommended by Claude?",
          a: "Make the entity unambiguous — plain category, audience and scope on your homepage — allow ClaudeBot and Claude-SearchBot, and get described consistently on independent sites. Claude weights corroboration and specificity more heavily than volume.",
        },
        {
          q: "Does Claude browse the web?",
          a: "Yes, for questions that need current information, and it cites what it uses. It also draws on knowledge from training, which is why crawler access matters on both paths.",
        },
        {
          q: "What is ClaudeBot?",
          a: "Anthropic's crawler for gathering training data. Claude-SearchBot indexes for Claude's search, and Claude-User fetches a page a user asks about directly. They are separate and can be controlled independently.",
        },
        {
          q: "Is Claude worth optimizing for?",
          a: "If you sell to developers, technical buyers or professional-services firms, yes — the audience skews that way and competition for these answers is thinner. If you sell high-volume consumer goods, it should sit below the other three.",
        },
        {
          q: "Why does Claude refuse to recommend a specific company?",
          a: "It hedges when it lacks confidence, answering with evaluation criteria instead. That is usually a signal that no business in the category is clearly enough defined to name — which makes it an opening rather than a dead end.",
        },
      ],
    },
    {
      type: "links",
      title: "Primary sources",
      items: [
        {
          label: "Anthropic — crawler access and blocking",
          href: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
          note: "The current agents and how to control each.",
        },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------
// 4. Tool-buying guide. Deliberately a framework rather than a ranked listicle
//    naming competitors: we cannot verify rivals' current pricing or features,
//    and inventing them would be exactly the unverifiable claim this whole
//    product argues against.
// ---------------------------------------------------------------------------
posts.push({
  slug: "how-to-choose-an-aeo-tool",
  title: "How to choose an AEO tool",
  seoTitle: "AEO Tools: How to Choose One (and When Not To)",
  description:
    "The four categories of AI visibility tool, the questions that separate them, and an honest account of when a tool is the wrong purchase entirely.",
  excerpt:
    "Most AEO tools measure. Very few fix anything. Knowing which you're buying is most of the decision — and sometimes the answer is neither.",
  category: "Strategy",
  position: 55,
  targets: [
    "aeo tools",
    "best aeo tools",
    "ai visibility tracking tool",
    "track brand mentions in chatgpt",
    "geo tools",
  ],
  blocks: [
    {
      type: "p",
      text: "New AEO tools appear weekly and most describe themselves identically. The useful distinction isn't feature lists — it's what the tool actually does when it finds a problem.",
    },
    {
      type: "callout",
      tone: "note",
      title: "Why this isn't a ranked list",
      text: "A “best tools” post is only honest if its pricing and feature claims are verified and current, and in a category moving this fast they go stale in weeks. Rather than publish numbers we can't stand behind, this is the framework we'd use — including where we fit and where we don't.",
    },
    { type: "h2", text: "The four categories" },
    {
      type: "table",
      head: ["Category", "What it does", "Typical price", "Buy it when"],
      rows: [
        ["Rank trackers", "Ask engines your prompts on a schedule, chart mention rate", "$50–$300/mo", "You have a team who will act on the data"],
        ["Brand monitors", "Alert when you're mentioned across AI and social", "$100–$500/mo", "PR and reputation matter more than acquisition"],
        ["Audit tools", "Score your site against AEO criteria", "Free–$200/mo", "You want a checklist and have a developer"],
        ["Done-for-you", "Measure, fix and re-measure on your behalf", "$99 one-time–$10k/mo", "Nobody internally will do the work"],
      ],
    },
    {
      type: "p",
      text: "The mismatch that wastes the most money is buying a tracker when you needed the fourth category. A tracker will tell you, accurately and repeatedly, that ChatGPT doesn't mention you. It cannot tell you that your H1 says nothing a machine can categorise, and it certainly won't rewrite it.",
    },
    { type: "h2", text: "The five questions that separate them" },
    {
      type: "steps",
      items: [
        {
          title: "How are the answers actually collected?",
          text: "Analysts asking real questions in real sessions reflect what a customer sees. Some tools use APIs, which behave differently from the consumer product — different retrieval, different personalisation, sometimes a different model. Ask, and expect a straight answer.",
        },
        {
          title: "How many prompts, and can you choose them?",
          text: "The prompt set is the measurement. A tool that picks generic industry prompts for you is measuring a category you may not compete in.",
        },
        {
          title: "Does it show you the full answer, or just a score?",
          text: "The competitor named instead of you, and the page cited, are the actionable parts. A score without the answer text is a dashboard, not a diagnosis.",
        },
        {
          title: "Does it distinguish mention from citation?",
          text: "Being named and having a page linked are different outcomes with different fixes. Tools that collapse them into one metric hide the more useful signal — citation moves first.",
        },
        {
          title: "What happens after it finds a problem?",
          text: "The whole question. Report, prioritised list, or implemented change? Price differences of 50x across this category are almost entirely explained by this one answer.",
        },
      ],
    },
    { type: "h2", text: "When a tool is the wrong purchase" },
    {
      type: "ul",
      items: [
        "**You haven't done the free version yet.** Ten questions, four engines, signed out, half an hour. If you haven't done that once by hand, you don't yet know what you'd be automating.",
        "**Nobody will act on it.** A subscription that produces a monthly chart nobody implements is a worse outcome than doing nothing, because it feels like progress.",
        "**Your site fails the basics.** If your content only renders after JavaScript, or a crawler is blocked, tracking will faithfully report zero every month until that's fixed. Fix the mechanics first.",
        "**Your buyers don't ask comparative questions.** If people search your brand name because they already know you, AI answers aren't in the path and no tool changes that.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Do the manual version first, always",
      text: "It costs nothing, takes thirty minutes, and produces the one thing every tool needs from you anyway: the list of questions worth tracking. It also tells you whether the problem is worth paying to solve.",
    },
    { type: "h2", text: "Where RankVyze sits, honestly" },
    {
      type: "p",
      text: "We're the fourth category: measure, fix, re-measure, for $99 once. Research is done by analysts in normal signed-out sessions rather than through APIs, because that is what a customer actually sees. Fixes are delivered as reviewable changes, not a list.",
    },
    {
      type: "p",
      text: "Where we're the wrong choice: if you want continuous daily tracking across hundreds of prompts, a subscription tracker does that better. If you have a large team already doing this work and need only instrumentation, you want a tool, not an engagement. And if your site fails the mechanical basics, our [free scan](/pricing) will tell you so — and you should fix that before paying anyone, us included.",
    },
    {
      type: "p",
      text: "The full comparison of what an engagement costs versus a subscription is in [what answer engine optimization actually costs](/blog/what-answer-engine-optimization-costs).",
    },
    {
      type: "faq",
      items: [
        {
          q: "What are AEO tools?",
          a: "Software that measures or improves how AI engines answer questions about a business. They fall into four groups: rank trackers, brand monitors, site audit tools, and done-for-you services. Most measure; few fix anything.",
        },
        {
          q: "What should an AI visibility tool cost?",
          a: "Trackers and monitors run roughly $50–$500 a month. Audit tools range from free to about $200. Done-for-you engagements run from $99 one-time to $10,000 a month, and that range is explained almost entirely by whether implementation is included.",
        },
        {
          q: "Do I need an AEO tool at all?",
          a: "Not to start. Ten buyer questions across four engines in a signed-out window takes thirty minutes and produces a real baseline. Buy a tool when you're tracking continuously and someone is acting on what it says.",
        },
        {
          q: "Do AEO tools use the real ChatGPT?",
          a: "Some query the API, which can behave differently from the consumer product — different retrieval, different personalisation, sometimes a different model. Others use analysts in normal sessions. Ask which, because it changes what the numbers mean.",
        },
        {
          q: "What's the difference between a mention and a citation?",
          a: "A mention is your business being named in the answer text. A citation is one of your pages being linked as a source. Citation rate usually moves weeks before mention rate, which makes it the better early signal — so a tool that reports only one number is hiding the useful half.",
        },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------

for (const post of posts) {
  const data = {
    title: post.title,
    seoTitle: post.seoTitle,
    description: post.description,
    excerpt: post.excerpt,
    category: post.category,
    targets: post.targets.join(", "),
    status: "PUBLISHED",
    featured: post.featured ?? false,
    position: post.position,
    blocksJson: JSON.stringify(post.blocks),
    publishedAt: new Date(),
  };
  const row = await db.blogPost.upsert({ where: { slug: post.slug }, update: data, create: { slug: post.slug, ...data } });
  const titleLen = (row.seoTitle ?? row.title).length + " · RankVyze".length;
  console.info(
    `${row.slug}\n  ${post.blocks.length} blocks · title ${titleLen} chars ${titleLen > 62 ? "(TOO LONG)" : "ok"} · description ${row.description.length} chars ${row.description.length > 165 ? "(TOO LONG)" : "ok"}`,
  );
}

console.info(`\ntotal published: ${await db.blogPost.count({ where: { status: "PUBLISHED" } })}`);
await db.$disconnect();
