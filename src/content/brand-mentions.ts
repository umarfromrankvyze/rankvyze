/**
 * The AI brand mentions pillar.
 *
 * This is the most competitive query family we target — every AEO vendor has a
 * page for it — so the only way to earn a citation is to be more useful than
 * the promotional ones. That means naming real alternatives, saying plainly
 * where they are better than us, and being specific about what our own
 * measurement does and does not do.
 *
 * Competitor facts are taken from each vendor's own site and dated. Nothing
 * here is inferred, and no pricing is quoted that a vendor does not publish —
 * a comparison page that gets a rival's plan wrong deserves to be ignored.
 */

export const RESEARCHED_ON = "6 September 2026";

export const ANSWER = {
  question: "Is it possible to track brand mentions in AI search?",
  short:
    "Yes. You can track brand mentions in AI search in three ways: run a fixed set of buyer prompts through each engine by hand and record the answers, subscribe to a monitoring tool that does it on a schedule, or build your own checker against an engine API. None of them gives you a complete picture — answers vary by user, session and region — so what you are really measuring is a rate across a fixed prompt set, not a ranking.",
  long: "The reason it feels impossible at first is that none of the usual tools work. AI answers produce no referrer, no impression count and no position in Search Console, so a brand can be recommended thousands of times a week and appear nowhere in analytics. Tracking has to be done by asking the questions and reading the answers — which is exactly what every tool in this category does under the hood.",
};

export interface Approach {
  name: string;
  summary: string;
  cost: string;
  goodFor: string;
  limits: string[];
}

export const APPROACHES: Approach[] = [
  {
    name: "Manual spot-checks",
    summary:
      "Write down 10–20 questions a buyer would actually ask, ask each one on each engine in a signed-out session, and record whether you were named, in what position, and which pages were cited. Screenshot everything.",
    cost: "Free, about two hours per round",
    goodFor: "Finding out where you stand before spending anything, and sanity-checking any tool you later buy.",
    limits: [
      "Slow, and it decays — a check from six weeks ago tells you nothing about today.",
      "Easy to fool yourself: asking a leading question you would never type as a customer produces a mention that means nothing.",
      "Signed-in sessions carry memory and personalisation, so results are not comparable. Always sign out.",
    ],
  },
  {
    name: "A monitoring tool",
    summary:
      "Subscribe to a platform that runs your prompt set across engines on a schedule and charts mention rate, position and share of voice over time.",
    cost: "Typically a monthly subscription, priced by prompt volume",
    goodFor: "Teams who need a trend line, competitor benchmarking, and something to put in a monthly report.",
    limits: [
      "It measures. Most of them do not fix anything, so the dashboard tells you that you are invisible without changing it.",
      "Prompt volume caps matter more than engine count — 150 prompts a month sounds like a lot until you split it across four engines and four weeks.",
      "Automated checks hit engines through APIs or headless sessions, which do not always behave like the consumer product a real buyer uses.",
    ],
  },
  {
    name: "Build your own",
    summary:
      "Script your prompt set against an engine API, store the raw responses, and grep for your brand name and your competitors'.",
    cost: "Roughly a cent per query, plus your engineering time",
    goodFor: "Engineering-led teams who want the raw responses in their own warehouse.",
    limits: [
      "API answers and consumer answers are not the same thing. The API has no memory, no personalisation and often a different retrieval configuration.",
      "You are maintaining it forever, and every engine changes its API on its own schedule.",
      "Not every engine exposes the surface people actually use — AI Overviews has no API at all.",
    ],
  },
];

export interface Vendor {
  name: string;
  url: string;
  /** Verbatim from their own site, so the comparison can't drift into caricature. */
  positioning: string;
  engines: string;
  model: string;
  /** Where they are genuinely stronger. Never omit this. */
  strongerAt: string;
}

export const VENDORS: Vendor[] = [
  {
    name: "Rank Prompt",
    url: "https://rankprompt.com",
    positioning: "“Track & Optimize 6 AI Platforms” — monitoring plus content generation and citation outreach.",
    engines: "ChatGPT, Perplexity, Google AI Mode, Claude, Gemini, Grok",
    model: "Self-serve dashboard, monthly plans tiered by prompt volume (Starter 150/mo up to Agency Plus 2,000/mo)",
    strongerAt:
      "More engines than we cover, far higher prompt volumes, and one-click multi-location tracking — the obvious choice for a franchise or an agency running many clients from one seat.",
  },
  {
    name: "Otterly.AI",
    url: "https://otterly.ai",
    positioning: "AI search monitoring across ChatGPT, Perplexity and Google AI Overviews.",
    engines: "ChatGPT, Perplexity, Google AI Overviews",
    model: "Self-serve monitoring subscription",
    strongerAt: "One of the cheaper entry points into scheduled monitoring if all you want is a trend line.",
  },
  {
    name: "Profound",
    url: "https://tryprofound.com",
    positioning: "Enterprise answer engine insights and AI visibility analytics.",
    engines: "Multiple, including ChatGPT and Perplexity",
    model: "Enterprise subscription",
    strongerAt: "Depth of analytics and the scale a large brand with a dedicated team needs.",
  },
  {
    name: "Peec AI",
    url: "https://peec.ai",
    positioning: "AI visibility analytics for marketing teams.",
    engines: "Multiple",
    model: "Self-serve subscription",
    strongerAt: "Clean reporting aimed squarely at in-house marketing teams.",
  },
];

/** Said plainly, because a comparison that only flatters the author is worthless. */
export const HOW_WE_DIFFER = {
  heading: "Where RankVyze fits — and where it doesn't",
  weAre: [
    {
      title: "A sprint, not a subscription",
      body: "One $99 payment for 45 days of work. There is no monthly charge and no card kept on file afterwards. If you want a permanent dashboard and a trend line stretching into next year, a monitoring subscription is the right purchase and we are not it.",
    },
    {
      title: "We fix what we find",
      body: "Measurement is the first week, not the product. The rest of the sprint is the audit and the implementation — delivered as pull requests against your repo, through your CMS API, or in your site builder.",
    },
    {
      title: "Refunded if it doesn't work",
      body: "If at least two of the four engines still don't mention you after 45 days, you get the full $99 back. No monitoring tool offers this, because a tool that only measures cannot promise an outcome.",
    },
    {
      title: "Analysts, not APIs",
      body: "Our checks are run by a person in a normal signed-out session, with a screenshot attached to every record. That is slower and covers fewer prompts than an automated platform — a real trade-off — but it measures the surface your buyers actually use, and the evidence is something you can look at rather than trust.",
    },
  ],
  notFor: [
    "You want continuous tracking of hundreds of prompts across six engines — buy a monitoring platform.",
    "You want the raw responses in your own data warehouse — build it against an API.",
    "You only want a number for a monthly report and have someone in-house to act on it.",
  ],
};

export const STEPS = [
  {
    name: "Write the prompts your buyers would actually type",
    text: "Not your brand name — nobody discovers you by searching for you. Write the ten questions someone asks when they have the problem and don't yet know who solves it.",
  },
  {
    name: "Sign out of every engine",
    text: "A signed-in session carries memory, past conversations and personalisation. It will show you your own brand far more often than a stranger sees it, which is the single most common way people fool themselves here.",
  },
  {
    name: "Ask each prompt on each engine and record four things",
    text: "Whether your brand was named, its position in the answer, which competitors appeared, and which URLs were cited. Screenshot each one — engines are not reproducible, so the screenshot is the record.",
  },
  {
    name: "Compute a rate, not a ranking",
    text: "There is no position one in an answer. What you have is a mention rate across a fixed prompt set: named in 6 of 20 prompts on ChatGPT is a real, comparable number. A single conversation is not.",
  },
  {
    name: "Repeat on a schedule with the prompt set locked",
    text: "Changing the prompts between rounds destroys the comparison. Lock the set, re-run it every two to four weeks, and only then are you looking at a trend rather than noise.",
  },
  {
    name: "Work backwards from the citations",
    text: "The URLs an engine cites tell you which sources it trusts for that question. Getting mentioned usually means getting onto those sources, or becoming one of them.",
  },
];

export const FAQ = [
  {
    q: "Is it possible to track brand mentions in AI search?",
    a: "Yes — by asking a fixed set of prompts on each engine and recording the answers, either manually, through a monitoring tool, or with your own script against an engine API. What you cannot do is see every mention: AI answers send no referrer and produce no impression data, so you are always measuring a sample across your prompt set rather than counting every occurrence.",
  },
  {
    q: "What is an AI brand mention?",
    a: "An AI brand mention is any occurrence of your business's name inside a generated answer, whether or not the answer links to your site. It is distinct from a citation, which is a linked source the engine used to build the answer — you can be mentioned without being cited, and cited without being mentioned.",
  },
  {
    q: "Can I see AI brand mentions in Google Analytics?",
    a: "No. An assistant that names your business in an answer sends no traffic and therefore no referrer. Some clicks from AI products do arrive with a referrer such as chatgpt.com, but those are the minority of the times you were named — the mention itself is invisible to analytics by construction.",
  },
  {
    q: "How many prompts should I track?",
    a: "Ten to twenty is enough to be meaningful and few enough to actually re-run. Volume matters less than consistency: twenty prompts checked every fortnight tells you far more than two hundred checked once.",
  },
  {
    q: "Why does my brand appear for me but not for a colleague?",
    a: "Answers vary by phrasing, conversation memory, account personalisation and region. This is exactly why a mention rate across a locked prompt set in signed-out sessions is the only number worth tracking, and why a single screenshot proves nothing on its own.",
  },
  {
    q: "Does tracking brand mentions improve them?",
    a: "No, and this is the trap. Measurement tells you where you stand; it changes nothing by itself. The work that moves the number is entity clarity, retrievable content and third-party corroboration — which is why a monitoring subscription can run for a year while the number stays flat.",
  },
];
