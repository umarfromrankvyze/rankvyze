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
    metaTitle: "How to Rank in ChatGPT",
    metaDescription:
      "How ChatGPT decides which businesses to name, which crawlers to allow, and what actually moves whether you appear in its answers.",
    h1: "How to get your business recommended in ChatGPT.",
    intro:
      "ChatGPT answers from two different places depending on the question, and the distinction decides everything about how you get in. Some answers come from what the model absorbed during training. Others come from a live retrieval step that fetches pages and cites them. You can influence the second within weeks. The first moves on a timescale you do not control.",
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
