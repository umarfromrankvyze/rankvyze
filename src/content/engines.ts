/**
 * Engine guides for /rank-in/[engine].
 *
 * Specifics in this space change often. Everything here is written at the level
 * of mechanism rather than current implementation detail, and anything that is
 * genuinely volatile is labelled as such rather than stated as fact. A page on
 * this site that goes stale and confidently wrong would be the exact failure
 * the product is sold to prevent.
 */

export interface EngineGuide {
  slug: string;
  /** matches the engine keys used across the app */
  key: string;
  name: string;
  vendor: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /**
   * The query a person actually types, and a self-contained answer to it.
   *
   * The most important field on the page. An answer engine lifts a passage
   * that resolves the question without needing the paragraph before it — so
   * this is written to stand alone, and to name who does the work, because an
   * answer that solves the problem but names nobody sends the reader back to
   * search.
   */
  answerBox: { question: string; answer: string };
  /** Concrete actions, emitted as HowTo structured data and rendered visibly. */
  steps: { name: string; text: string }[];
  /** How the engine actually assembles an answer. */
  howItWorks: string[];
  /** User agents to allow in robots.txt. */
  crawlers: { agent: string; purpose: string }[];
  /** What moves visibility on this engine specifically. */
  levers: { title: string; body: string }[];
  /** Mistakes that hurt on this engine in particular. */
  mistakes: string[];
  /** Honest note on how quickly changes register. */
  latency: string;
  faq: { q: string; a: string }[];
}

export const ENGINE_GUIDES: EngineGuide[] = [
  {
    slug: "chatgpt",
    key: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    metaTitle: "How to Get Ranked on ChatGPT",
    metaDescription:
      "How ChatGPT decides which businesses to name, which crawlers to allow, and what actually moves whether you appear in its answers.",
    h1: "How to get ranked on ChatGPT.",
    intro:
      "ChatGPT answers from two different places depending on the question, and the distinction decides everything about how you get in. Some answers come from what the model absorbed during training. Others come from a live retrieval step that fetches pages and cites them. You can influence the second within weeks. The first moves on a timescale you do not control.",
    answerBox: {
      question: "How do I get ranked on ChatGPT?",
      answer:
        "To get ranked on ChatGPT, make your site retrievable to OAI-SearchBot, state plainly what your business is in server-rendered HTML, mark it up with Organization and Service schema, publish pages that answer the comparative questions buyers ask, and earn mentions on independent sites ChatGPT already reads. ChatGPT names businesses from two places — a live search step you can influence within weeks, and training data you cannot — so the work that pays is making the retrieval step find and trust you. RankVyze does this as a fixed 45-day engagement and refunds in full if at least two engines still don't mention you.",
    },
    steps: [
      { name: "Allow the right crawler", text: "Permit OAI-SearchBot in robots.txt. It powers ChatGPT's search step. GPTBot governs training data and is a separate decision — blocking it does not remove you from ChatGPT's answers." },
      { name: "Serve your content without JavaScript", text: "The retrieval step reads served HTML. View source on your most important page: if the body copy isn't there, ChatGPT cannot read it." },
      { name: "Say what you are in the H1 and the first paragraph", text: "Name the category, not just the benefit. A model needs something to attach your brand to when someone asks for that category by name." },
      { name: "Add Organization and Service schema with sameAs", text: "Structured data resolves who you are; sameAs links to independent profiles are what confirm you exist beyond your own marketing." },
      { name: "Publish direct answers to comparative questions", text: "'Best X for Y' and 'X vs Y' are the queries that produce vendor names. Lead with the verdict — a page that reaches its conclusion in paragraph twelve gives a model nothing to quote." },
      { name: "Earn independent mentions", text: "Directories, review platforms and publications feed both the retrieval step and the trained view. Corroboration outweighs anything you say about yourself." },
      { name: "Measure across a fixed prompt set", text: "Answers vary by phrasing, session and region. Track the same prompts on a schedule, or you are reading noise." },
    ],
    howItWorks: [
      "For questions that need current information, ChatGPT runs a search and reads the pages it retrieves before answering.",
      "Retrieved pages are summarised and often cited with links, so the source text directly shapes the wording of the answer.",
      "For questions answered without retrieval, the response reflects training data — which means older, widely-repeated information about your brand.",
      "Being mentioned across many independent sources influences the trained view; being clearly readable influences the retrieved view.",
    ],
    crawlers: [
      { agent: "OAI-SearchBot", purpose: "Powers search and the links shown in answers. This is the one that matters for visibility." },
      { agent: "ChatGPT-User", purpose: "Fetches a page when a user or tool follows a link during a conversation." },
      { agent: "GPTBot", purpose: "Collects data used for model training. Blocking it does not remove you from search results." },
    ],
    levers: [
      {
        title: "Be retrievable without JavaScript",
        body: "The retrieval step reads served HTML. Content that only exists after client-side rendering is frequently missed entirely, which silently removes your best pages from consideration.",
      },
      {
        title: "Answer the comparative question directly",
        body: "ChatGPT is heavily used for 'best X for Y' and 'X vs Y'. A page that states a clear verdict in its opening lines gives the model something quotable; a page that builds to a conclusion over 2,000 words does not.",
      },
      {
        title: "Make the entity unambiguous",
        body: "One consistent name, a plain description of what you do, and Organization markup with sameAs links. Ambiguity between similarly-named companies is a common and entirely avoidable reason for being skipped.",
      },
      {
        title: "Earn mentions on sources it already reads",
        body: "Directories, review platforms and established publications feed both the retrieval step and the trained view. Corroboration across independent domains outweighs anything you can say about yourself.",
      },
    ],
    mistakes: [
      "Blocking GPTBot in the belief it controls search visibility — it governs training data, not retrieval.",
      "Publishing key content only inside a JavaScript-rendered application shell.",
      "Assuming a mention in one conversation generalises; answers vary between users and sessions.",
      "Chasing the trained view with keyword-stuffed pages, which affects nothing on this timescale.",
    ],
    latency:
      "Retrieval-driven answers can reflect site changes within days to a few weeks. The trained view moves only when models are retrained, which is outside anyone's control and should not be planned around.",
    faq: [
      {
        q: "Should I block GPTBot?",
        a: "It is a legitimate choice about training data, and it does not remove you from ChatGPT's search results — those use a different agent. If your goal is visibility, do not block OAI-SearchBot.",
      },
      {
        q: "Why does ChatGPT name us for one person and not another?",
        a: "Answers vary by phrasing, conversation history, region and whether retrieval was triggered. This is why visibility has to be measured across a fixed prompt set rather than inferred from single conversations.",
      },
      {
        q: "How long until changes show up?",
        a: "For retrieval-driven queries, usually days to a few weeks once the page is crawled. Anything relying on the trained view is a much longer and less predictable horizon.",
      },
    ],
  },
  {
    slug: "perplexity",
    key: "perplexity",
    name: "Perplexity",
    vendor: "Perplexity AI",
    metaTitle: "How to Rank in Perplexity",
    metaDescription:
      "Perplexity cites its sources on nearly every answer, which makes it the fastest and most measurable engine to move. How its retrieval works and what to fix first.",
    h1: "How to get your business cited in Perplexity.",
    intro:
      "Perplexity is retrieval-first by design: almost every answer is assembled from pages fetched at query time and shown with numbered citations. That makes it the most transparent engine to work with — you can see exactly which sources it used — and typically the quickest to reflect changes you make.",
    answerBox: {
      question: "How do I get cited by Perplexity?",
      answer:
        "Perplexity retrieves and cites on almost every query, which makes it the fastest engine to move: allow PerplexityBot, publish pages that answer one question each in their opening lines, keep the facts current and dated, and make sure the passage worth quoting sits near the top. Because it shows its sources, you can verify a win directly rather than inferring it. RankVyze tracks Perplexity citations per prompt and fixes what blocks them.",
    },
    steps: [
      { name: "Allow PerplexityBot and Perplexity-User", text: "The first crawls for the index, the second fetches a page live during a conversation. Blocking either removes you from citations." },
      { name: "Give each page one job", text: "Perplexity quotes passages, not pages. One question per page, answered in the first two sentences, is the format that gets lifted." },
      { name: "Date your facts", text: "Perplexity favours current sources. An undated page loses to a dated one saying the same thing." },
      { name: "Keep the quotable line above the fold", text: "The passage most likely to be cited is the one that resolves the question without context. Put it first." },
      { name: "Check the citation, not the ranking", text: "Perplexity shows its sources. If you aren't in them for your own prompts, you have a direct, checkable signal of what to fix." },
    ],
    howItWorks: [
      "Nearly every answer triggers a live search rather than relying on model memory.",
      "Retrieved pages are ranked, summarised and cited inline with visible source links.",
      "Because citations are shown, you can verify precisely which of your pages was used, or which competitor's was used instead.",
      "Content structured as clear, self-contained answers is easier to extract and therefore more likely to be quoted.",
    ],
    crawlers: [
      { agent: "PerplexityBot", purpose: "Indexes pages for retrieval. Allowing it is a prerequisite for being cited." },
      { agent: "Perplexity-User", purpose: "Fetches a page when a user follows a citation." },
    ],
    levers: [
      {
        title: "Write extractable answers",
        body: "A heading that asks the question and a paragraph that answers it immediately is the single most citable structure. Perplexity lifts passages, so passages that stand alone win.",
      },
      {
        title: "Publish the data nobody else does",
        body: "Prices, specifications, comparison tables and original figures get cited because they cannot be sourced elsewhere. Restating common knowledge competes with every other page that also restates it.",
      },
      {
        title: "Keep pages current and dated",
        body: "Perplexity favours freshness for anything time-sensitive. A visible, accurate review date is a real ranking input, not decoration.",
      },
      {
        title: "Watch which competitor gets cited",
        body: "The citation list is a competitive audit handed to you for free. Whoever is cited for your target query has already written the page you are missing.",
      },
    ],
    mistakes: [
      "Burying the answer beneath a long preamble, so no self-contained passage exists to extract.",
      "Disallowing PerplexityBot while expecting to appear in its answers.",
      "Publishing undated content in a category where recency obviously matters.",
      "Optimising for keyword density rather than for a quotable, complete answer.",
    ],
    latency:
      "Often the fastest of the four. New or updated pages can start being cited within days of being crawled, which makes Perplexity the best early signal that a change is working.",
    faq: [
      {
        q: "Why is Perplexity usually the first engine to show movement?",
        a: "Because it retrieves live on nearly every query rather than leaning on training data. There is no retraining cycle standing between your change and the answer.",
      },
      {
        q: "Do the citations reflect ranking?",
        a: "Roughly. Order suggests how heavily a source was weighted, but the more useful signal is simply whether you are in the list at all, and who is there instead of you.",
      },
      {
        q: "Does Perplexity favour big publishers?",
        a: "Less than most. Because it retrieves per query, a small site with the most specific answer to a narrow question is regularly cited above large general publications.",
      },
    ],
  },
  {
    slug: "google-ai-overviews",
    key: "gemini",
    name: "Google AI Overviews",
    vendor: "Google",
    metaTitle: "How to Rank in Google AI Overviews",
    metaDescription:
      "AI Overviews are generated from Google's ordinary Search index. What that means for visibility, how Google-Extended works, and why classical SEO is the foundation.",
    h1: "How to appear in Google AI Overviews and Gemini.",
    intro:
      "The most important thing to understand about AI Overviews is that they are generated from the same Search index that produces ordinary results. There is no separate AI index to get into. That makes this the one surface where good conventional SEO is not merely helpful but foundational — you generally cannot appear in an Overview for a query you cannot rank for at all.",
    answerBox: {
      question: "How do I appear in Google's AI Overviews?",
      answer:
        "AI Overviews are generated from Google's ordinary Search index, so appearing in them starts with ranking in classic organic results for the query — there is no separate submission or opt-in. On top of that, the pages pulled into an Overview tend to answer a specific question directly, carry clean structured data, and load fast. Do not block Google-Extended if you want to be included. RankVyze works the organic and the answer-shaped layer together, because on this engine they are the same job.",
    },
    steps: [
      { name: "Rank organically first", text: "AI Overviews draw from the Search index. If you are not on page one for the query, you are not a candidate." },
      { name: "Leave Google-Extended allowed", text: "Blocking it excludes you from Gemini and AI Overviews grounding while doing nothing for your organic ranking." },
      { name: "Answer the question in the first 40 words", text: "Overviews assemble from passages that resolve a query directly. Preamble is not extracted." },
      { name: "Ship clean structured data", text: "Organization, Product, FAQPage and HowTo where they genuinely apply. Markup for content the page doesn't show is a violation, not a shortcut." },
      { name: "Fix Core Web Vitals", text: "Slow pages are crawled less and rendered less reliably, which quietly removes them from consideration." },
    ],
    howItWorks: [
      "AI Overviews are assembled from pages already in Google's Search index, then summarised with links out.",
      "Being crawlable and indexable by Googlebot is the entry requirement; there is no separate opt-in for inclusion.",
      "Google-Extended is a distinct control governing use of your content for Gemini model training — separate from Search indexing.",
      "Local queries lean heavily on Google Business Profile and Maps data rather than your website alone.",
    ],
    crawlers: [
      { agent: "Googlebot", purpose: "Standard Search crawling. Indexing here is the prerequisite for AI Overviews." },
      { agent: "Google-Extended", purpose: "Controls whether content trains Gemini. Blocking it does not affect Search or Overview inclusion." },
    ],
    levers: [
      {
        title: "Fix conventional SEO first",
        body: "Crawlability, indexation, page quality and internal linking decide whether you are eligible at all. On this surface, AEO sits on top of SEO rather than replacing it.",
      },
      {
        title: "Structure content into clear sub-answers",
        body: "Overviews synthesise several sources into a short answer with sections. Pages organised into distinct, well-headed sub-answers are easier to draw from than continuous prose.",
      },
      {
        title: "Own your Business Profile for local queries",
        body: "For anything with a location, Maps and Business Profile data frequently outweigh your website. Accuracy and completeness there is the highest-leverage work available.",
      },
      {
        title: "Use the structured data Google documents",
        body: "This is the one engine that publishes explicit structured data guidance. Following it is unusually well-rewarded, because the expectations are written down.",
      },
    ],
    mistakes: [
      "Treating AI Overviews as a separate channel needing separate content, rather than a surface on top of Search.",
      "Blocking Google-Extended and assuming it removed you from Overviews — it governs training, not inclusion.",
      "Neglecting Google Business Profile for local queries while optimising the website.",
      "Expecting to appear in an Overview for a query where the site does not rank organically at all.",
    ],
    latency:
      "Tied to ordinary Google crawling and indexing, so days to weeks for established sites and longer for new ones. Overview presence is also volatile — Google adjusts when they trigger, so appearance and disappearance are both normal.",
    faq: [
      {
        q: "Are AI Overviews and Gemini the same thing?",
        a: "Related but distinct. AI Overviews appear inside Google Search; Gemini is the standalone assistant. They share underlying model technology and much of the same web understanding, which is why the same work helps both.",
      },
      {
        q: "Do AI Overviews reduce clicks?",
        a: "For informational queries where the answer is fully given, yes — that is well documented. It is a strong argument for being the cited source rather than the tenth blue link nobody reaches.",
      },
      {
        q: "Should I block Google-Extended?",
        a: "It is a legitimate decision about model training and it does not remove you from Search or AI Overviews. Weigh it as a content licensing question, not a visibility one.",
      },
    ],
  },
  {
    slug: "claude",
    key: "claude",
    name: "Claude",
    vendor: "Anthropic",
    metaTitle: "How to Rank in Claude",
    metaDescription:
      "Claude is conservative about naming businesses and heavily used inside companies. How its web search works and what earns a mention.",
    h1: "How to get your business mentioned in Claude.",
    intro:
      "Claude names businesses more sparingly than the other engines, and hedges more readily toward criteria rather than recommendations. Its usage skews professional and enterprise, which changes the calculus: fewer mentions overall, but the people receiving them are disproportionately the ones making purchasing decisions.",
    answerBox: {
      question: "How do I get Claude to mention my business?",
      answer:
        "Claude names businesses sparingly and is comparatively cautious about recommending one, so the lever is credibility rather than volume: allow ClaudeBot and Claude-SearchBot, make claims that are specific and verifiable, and get corroborated by sources independent of your own domain. Unsupported superlatives are actively counterproductive here — a claim nothing backs is a claim Claude tends to leave out. RankVyze treats Claude as the engine where evidence quality, not content quantity, decides the outcome.",
    },
    steps: [
      { name: "Allow ClaudeBot, Claude-User and Claude-SearchBot", text: "Three agents with different jobs — training, live fetch during a conversation, and search. Search is the one that decides visibility." },
      { name: "Replace superlatives with specifics", text: "'The best agency in London' is unverifiable. 'Founded 2019, 40 staff, B Corp certified' is checkable, and checkable is what gets repeated." },
      { name: "Build third-party corroboration", text: "Claude weighs what independent sources say about you far more heavily than what you say about yourself." },
      { name: "Be consistent everywhere", text: "One name, one description, one address across every profile. Contradictions between sources read as uncertainty, and uncertainty reads as a reason to omit you." },
      { name: "Publish something genuinely worth citing", text: "Original data, a real methodology, a documented result. Claude cites sources that add information rather than restate it." },
    ],
    howItWorks: [
      "Claude can search the web when a question needs current information, and cites what it used.",
      "Without search, answers draw on training data — so widely-corroborated facts about your business carry further than recent site changes.",
      "It is comparatively cautious about unqualified recommendations, often answering with selection criteria instead of names.",
      "Substantive, well-reasoned source material tends to be favoured over promotional copy.",
    ],
    crawlers: [
      { agent: "ClaudeBot", purpose: "Crawls content for training." },
      { agent: "Claude-User", purpose: "Fetches pages when a user's request requires reading a specific URL." },
      { agent: "Claude-SearchBot", purpose: "Indexes pages to support search results within Claude." },
    ],
    levers: [
      {
        title: "Write for a sceptical reader",
        body: "Claude weights reasoning and evidence over enthusiasm. Content that states trade-offs and concedes limitations reads as reference material rather than marketing, and is treated accordingly.",
      },
      {
        title: "Be verifiable elsewhere",
        body: "Given its caution about recommendations, independent corroboration matters more here than on any other engine. Claims that can be checked against other sources are the ones that survive.",
      },
      {
        title: "Answer B2B and professional questions properly",
        body: "The audience skews toward work. Depth on professional questions is more valuable than broad consumer content.",
      },
      {
        title: "Structure for extraction",
        body: "Clear headings, defined terms and self-contained sections make a page usable as a source, which is the precondition for being cited at all.",
      },
    ],
    mistakes: [
      "Expecting the mention rate you see on Perplexity — Claude names businesses less often by design.",
      "Marketing language without substantiation, which is discounted more sharply here.",
      "Ignoring it because consumer usage is lower, when its professional audience is the buying audience.",
      "Blocking every Anthropic agent indiscriminately, including the one that supports search.",
    ],
    latency:
      "Search-driven answers can reflect changes within weeks of crawling. The trained view moves only with model updates, so treat corroboration as a long-term investment rather than a switch.",
    faq: [
      {
        q: "Why does Claude mention us less than other engines?",
        a: "It is more conservative about unqualified recommendations and will often answer with criteria rather than names. That is a design choice, not a signal that something is wrong with your site.",
      },
      {
        q: "Is Claude worth optimising for given lower usage?",
        a: "Its usage is concentrated among professionals and inside companies, so mentions land with people who buy. For B2B especially, its share of decision-makers exceeds its share of conversations.",
      },
      {
        q: "Which Anthropic crawler should we allow?",
        a: "If visibility is the aim, allow the search-supporting agent. Training crawlers are a separate decision and blocking them does not remove you from search results.",
      },
    ],
  },
  {
    slug: "microsoft-copilot",
    key: "chatgpt",
    name: "Microsoft Copilot",
    vendor: "Microsoft",
    metaTitle: "How to Rank in Microsoft Copilot",
    metaDescription:
      "Copilot is built on the Bing index and reaches business users through Windows and Microsoft 365. Why Bing indexing is the whole foundation.",
    h1: "How to get your business recommended in Microsoft Copilot.",
    intro:
      "Copilot's distinguishing feature is where it sits: inside Windows, Edge and Microsoft 365, in front of enterprise users during their working day. Its retrieval is grounded in the Bing index, which makes Bing indexing — a thing most teams neglect entirely — the foundation rather than an afterthought.",
    answerBox: {
      question: "How do I show up in Microsoft Copilot?",
      answer:
        "Copilot answers follow the Bing index, so the whole job is being indexed by Bing well and quickly: verify the site in Bing Webmaster Tools, submit your sitemap, and wire up IndexNow so new and changed pages are pushed to Bing within seconds instead of waiting for a crawl. Because Copilot ships inside Windows and Office, it reaches a desktop and enterprise audience the other engines don't. RankVyze sets up the Bing and IndexNow layer as part of the sprint.",
    },
    steps: [
      { name: "Verify in Bing Webmaster Tools", text: "Bing indexes verified sites faster and tells you what it could not crawl. A ten-minute job with an outsized effect." },
      { name: "Submit your sitemap to Bing", text: "Google Search Console does not feed Bing. This is a separate submission and it is frequently skipped." },
      { name: "Implement IndexNow", text: "One POST per publish pushes changed URLs to Bing immediately. On a new domain this is the difference between days and weeks to first retrieval." },
      { name: "Keep the same answer-shaped content", text: "Everything that helps ChatGPT retrieval helps here. The engine differs; the readable, direct, well-marked-up page does not." },
      { name: "Watch enterprise-shaped queries", text: "Copilot's audience skews to work tasks. Prompts about procurement, compliance and tooling matter more here than consumer phrasing." },
    ],
    howItWorks: [
      "Answers are grounded in Bing's web index, so Bing indexing is the entry requirement.",
      "Retrieved pages are summarised with citations back to sources.",
      "Distribution through Windows and Microsoft 365 puts it in front of business users who may never open a browser tab to search.",
      "Bing Webmaster Tools offers direct submission, which can accelerate indexing considerably.",
    ],
    crawlers: [{ agent: "bingbot", purpose: "Crawls for the Bing index, which grounds Copilot's answers." }],
    levers: [
      {
        title: "Verify the site in Bing Webmaster Tools",
        body: "Most teams never do this. It surfaces indexing problems invisible in Google Search Console and allows direct URL submission, which is the fastest route into the index Copilot reads.",
      },
      {
        title: "Do not assume Google indexing implies Bing indexing",
        body: "They are separate crawlers with separate coverage. Sites well indexed by Google are routinely missing large sections from Bing, and nobody notices until they check.",
      },
      {
        title: "Lean into business context",
        body: "The audience is at work. Professional, B2B and productivity-adjacent content matches the context in which Copilot is actually used.",
      },
      {
        title: "Use IndexNow",
        body: "Bing supports IndexNow for instant change notification. It is cheap to implement and materially shortens the gap between publishing and being retrievable.",
      },
    ],
    mistakes: [
      "Optimising exclusively for Google and never checking Bing coverage at all.",
      "Skipping Bing Webmaster Tools, and so never seeing indexing problems that block Copilot entirely.",
      "Dismissing Copilot on consumer market share while ignoring its enterprise desktop distribution.",
      "Assuming a Google sitemap submission covers Bing.",
    ],
    latency:
      "Bing indexing is often quick once a site is verified, and IndexNow can shorten it further. Copilot answers follow the index, so improvements can register in days rather than weeks.",
    faq: [
      {
        q: "Is Copilot worth the effort separately?",
        a: "The work is mostly shared with everything else — the specific additions are Bing verification and IndexNow, both small. Given enterprise desktop distribution, that is a good return for the effort.",
      },
      {
        q: "Is our Bing indexing likely to be fine already?",
        a: "Frequently it is not. Checking takes minutes in Bing Webmaster Tools and regularly turns up missing sections that no Google-focused tooling would reveal.",
      },
      {
        q: "Does Copilot use the same sources as ChatGPT?",
        a: "There is overlap, but the grounding differs — Copilot leans on Bing's index. A page can be well represented in one and absent from the other.",
      },
    ],
  },
];

export const ENGINE_GUIDE_SLUGS = ENGINE_GUIDES.map((e) => e.slug);

export function getEngineGuide(slug: string) {
  return ENGINE_GUIDES.find((e) => e.slug === slug) ?? null;
}
