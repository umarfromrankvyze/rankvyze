/**
 * Glossary entries for /glossary and /glossary/[term].
 *
 * `definition` is deliberately one self-contained sentence that reads correctly
 * with no surrounding context. That is the unit an answer engine extracts, and
 * writing it as anything else forfeits the citation these pages exist to earn.
 */

export interface GlossaryTerm {
  slug: string;
  term: string;
  /** Common alternative names, used for on-page context and internal search. */
  aka?: string[];
  /** One self-contained, quotable sentence. */
  definition: string;
  /** Two or three short paragraphs of real explanation. */
  body: string[];
  /** Why it matters commercially, in one paragraph. */
  whyItMatters: string;
  related: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "answer-engine-optimization",
    term: "Answer Engine Optimization (AEO)",
    aka: ["AEO"],
    definition:
      "Answer engine optimization is the practice of making a business legible and credible enough that AI systems name it inside a generated answer.",
    body: [
      "Traditional search optimization competes for a position in a list of links. Answer engine optimization competes to be one of the handful of names an assistant mentions when it answers a question directly — a fundamentally narrower target, because an answer names two or three businesses rather than showing ten.",
      "The work divides into three parts: making the entity unambiguous, so a model knows what the business is and who it serves; making the content retrievable, so it can actually be read and quoted; and building corroboration, so claims are supported by sources beyond the business's own domain.",
    ],
    whyItMatters:
      "When an assistant returns one recommendation instead of a page of options, the difference between being named and being absent is the difference between a customer and no customer. There is no equivalent of position four.",
    related: ["generative-engine-optimization", "answer-engine", "citation", "entity"],
  },
  {
    slug: "generative-engine-optimization",
    term: "Generative Engine Optimization (GEO)",
    aka: ["GEO"],
    definition:
      "Generative engine optimization is optimising content so that generative AI systems surface and cite it in their responses; in practice it describes the same work as answer engine optimization.",
    body: [
      "GEO emerged from academic work studying how content could be adjusted to increase its likelihood of appearing in generated answers. It has since been adopted commercially, largely interchangeably with AEO.",
      "Any distinction is one of emphasis rather than substance. GEO is more often used when discussing content-level changes; AEO more often when discussing the whole discipline including technical and entity work. Nobody should be paying a premium for one label over the other.",
    ],
    whyItMatters:
      "The proliferation of labels — GEO, AEO, LLM SEO, AI SEO — is mostly vendor positioning. Understanding they describe one body of work makes it much easier to judge whether a provider is selling something real.",
    related: ["answer-engine-optimization", "llm-seo", "citation"],
  },
  {
    slug: "answer-engine",
    term: "Answer Engine",
    definition:
      "An answer engine is a system that responds to a query with a direct synthesised answer rather than a list of links to sources.",
    body: [
      "ChatGPT, Perplexity, Claude, Gemini and Google's AI Overviews are all answer engines. They differ in how they retrieve and how readily they name businesses, but they share the defining behaviour: the user receives a conclusion rather than a set of candidates to evaluate.",
      "The consequence is a collapse in the number of businesses visible per query. A search results page shows ten organic results plus ads; an answer typically names two or three. Everyone else is invisible, regardless of how well they would have ranked.",
    ],
    whyItMatters:
      "Every business with a discovery channel through search is exposed to this shift. The question is not whether answer engines matter but whether you are among the few names they use.",
    related: ["ai-overviews", "answer-engine-optimization", "zero-click-search"],
  },
  {
    slug: "ai-overviews",
    term: "AI Overviews",
    definition:
      "AI Overviews are AI-generated summaries that appear at the top of Google Search results, assembled from pages in Google's ordinary Search index.",
    body: [
      "Because Overviews are generated from the same index that produces normal results, there is no separate index to be admitted to. Being crawlable and indexable by Googlebot is the prerequisite — you generally cannot appear in an Overview for a query you cannot rank for at all.",
      "Google-Extended, often confused with this, is a separate control governing whether your content is used to train Gemini models. Blocking it does not remove you from Search or from Overviews.",
    ],
    whyItMatters:
      "AI Overviews reach more people than any standalone assistant, simply because they appear inside the search everyone already uses. They are also the surface where conventional SEO work translates most directly into AI visibility.",
    related: ["answer-engine", "google-extended", "zero-click-search", "structured-data"],
  },
  {
    slug: "llm-seo",
    term: "LLM SEO",
    definition:
      "LLM SEO is a colloquial term for optimising a website so that large language models mention and cite it — another name for answer engine optimization.",
    body: [
      "The term is common in practitioner discussion and rare in formal writing. It is used interchangeably with AEO and GEO.",
      "It can mislead slightly, because much of the work targets the retrieval layer that sits in front of the model rather than the model itself. What gets fetched and quoted is usually more tractable than what a model learned in training.",
    ],
    whyItMatters:
      "Recognising these labels as synonyms prevents buying the same service three times under different names, which is a live risk in this market.",
    related: ["answer-engine-optimization", "generative-engine-optimization", "retrieval-augmented-generation"],
  },
  {
    slug: "llms-txt",
    term: "llms.txt",
    definition:
      "llms.txt is a proposed plain-text file at the root of a website that summarises what the site is and points to its most important pages for AI systems.",
    body: [
      "The convention was proposed to give language models a concise, curated entry point to a site — closer in spirit to a hand-written index than to robots.txt, which grants or denies access rather than explaining anything.",
      "Adoption by major engines is not universal and should not be assumed. It is cheap to publish and does no harm, but it is a supplement to clear on-page content and structured data, never a substitute.",
    ],
    whyItMatters:
      "It costs almost nothing to add and states plainly what your business is and which pages matter. Treat it as a small hedge on an emerging convention rather than a lever with proven effect.",
    related: ["ai-crawler", "structured-data", "entity"],
  },
  {
    slug: "structured-data",
    term: "Structured Data",
    aka: ["Schema markup", "JSON-LD"],
    definition:
      "Structured data is machine-readable markup embedded in a page that states explicitly what its content means, most commonly using schema.org vocabulary in JSON-LD format.",
    body: [
      "Without it, a machine must infer from prose that a page describes a business, a product or an event. With it, the page says so directly: this is an Organization, this is its name, this is where it operates, these are its profiles elsewhere.",
      "For answer engines the value is disambiguation. Structured data removes the guesswork about what an entity is and how it relates to others, which is precisely the guesswork that causes a business to be skipped.",
    ],
    whyItMatters:
      "It is the cheapest available intervention with the most reliable effect. Most sites either omit it or implement a fragment, which makes complete, accurate markup a genuine differentiator.",
    related: ["schema-org", "entity", "sameas", "faq-schema"],
  },
  {
    slug: "schema-org",
    term: "Schema.org",
    definition:
      "Schema.org is a shared vocabulary of types and properties, maintained collaboratively by major search engines, used to describe the meaning of web content in a machine-readable way.",
    body: [
      "It provides the nouns — Organization, Product, LocalBusiness, FAQPage, Person — and the properties that describe them. Publishers embed these as JSON-LD so machines can parse meaning rather than infer it.",
      "Choosing the most specific applicable type matters. A law firm marked up as Organization is understood generically; the same firm marked up as LegalService carries its category in the data itself.",
    ],
    whyItMatters:
      "It is the common language every major engine already understands. Using it correctly is the difference between describing your business and merely mentioning it.",
    related: ["structured-data", "entity", "faq-schema"],
  },
  {
    slug: "entity",
    term: "Entity",
    definition:
      "An entity is a distinct thing — a company, person, product or place — that a search or AI system recognises and reasons about as a single identifiable object.",
    body: [
      "Modern systems do not merely match strings; they resolve references to entities. 'Acme', 'Acme Ltd' and 'acme.com' should all resolve to one entity with known attributes and relationships.",
      "Entity resolution fails when a business presents inconsistently — three name variants across a site, no structured data, no links to profiles elsewhere. The system cannot confidently determine that these references describe one company, and low confidence produces omission.",
    ],
    whyItMatters:
      "Entity clarity is the foundation everything else rests on. A business a model cannot confidently identify will not be recommended, however good its content.",
    related: ["knowledge-graph", "structured-data", "sameas", "brand-mention"],
  },
  {
    slug: "knowledge-graph",
    term: "Knowledge Graph",
    definition:
      "A knowledge graph is a structured database of entities and the relationships between them, used by search and AI systems to reason about the world rather than just match text.",
    body: [
      "Google's Knowledge Graph is the best known, powering the information panels beside search results. Similar structures inform how AI systems understand which companies exist, what they do and how they relate.",
      "Presence in such a graph is earned through consistent, corroborated signals across many sources — not by asking. Structured data and third-party profiles feed it.",
    ],
    whyItMatters:
      "A business represented in a knowledge graph is far easier for any system to recommend confidently, because its identity and attributes are already established rather than inferred at query time.",
    related: ["entity", "sameas", "structured-data"],
  },
  {
    slug: "citation",
    term: "Citation",
    definition:
      "In AI search, a citation is a link an answer engine shows to the source page it used when generating part of its answer.",
    body: [
      "Perplexity cites on nearly every answer; ChatGPT and Gemini cite when retrieval was involved. Citations are the most direct evidence available that a specific page was read and used.",
      "Citations and mentions are distinct. A business can be named without any of its pages being cited — the model drew on trained knowledge or third-party sources — and a page can be cited without the business being recommended.",
    ],
    whyItMatters:
      "Citations are measurable in a way brand mentions are not, and they identify exactly which page earned the reference. They also tend to move before mention rate does, making them a useful leading indicator.",
    related: ["brand-mention", "answer-engine", "retrieval-augmented-generation"],
  },
  {
    slug: "brand-mention",
    term: "Brand Mention",
    definition:
      "A brand mention in AI search is any occurrence of a business's name inside a generated answer, whether or not the answer links to that business's website.",
    body: [
      "Mentions are the primary visibility metric for AEO, because being named is what puts a business into consideration. A mention with no link still shapes the decision.",
      "Mention position matters: the first business named in an answer carries materially more weight than the fourth, in the same way the first organic result does.",
    ],
    whyItMatters:
      "Mention rate across a fixed prompt set is the clearest measure of whether AI visibility work is succeeding. It is also what RankVyze's guarantee is judged on.",
    related: ["citation", "share-of-voice", "prompt-tracking"],
  },
  {
    slug: "prompt-tracking",
    term: "Prompt Tracking",
    definition:
      "Prompt tracking is the practice of repeatedly asking a fixed set of buyer questions across AI engines and recording whether and how a business is mentioned each time.",
    body: [
      "It is the AEO equivalent of rank tracking, with one crucial difference: answers vary between users, sessions and phrasings, so a single observation proves very little. Only a consistent set of prompts checked repeatedly produces a trustworthy signal.",
      "A sound prompt set mirrors how buyers actually ask — including comparative and constraint-laden questions — rather than the keywords a business wishes it ranked for.",
    ],
    whyItMatters:
      "Without it, AI visibility is anecdote. Someone tries one query, sees a competitor, and draws a conclusion from a sample of one. Tracking turns that into evidence.",
    related: ["brand-mention", "share-of-voice", "citation"],
  },
  {
    slug: "share-of-voice",
    term: "AI Share of Voice",
    definition:
      "AI share of voice is the proportion of tracked prompts in which a business is mentioned, relative to its competitors, across AI engines.",
    body: [
      "It reframes visibility as competitive rather than absolute. Being mentioned in 30% of prompts means little until you know the leading competitor is mentioned in 80%.",
      "Measured per engine it becomes more useful still, because engines diverge sharply — a business can lead on Perplexity and be absent from Gemini, which points directly at what to fix.",
    ],
    whyItMatters:
      "It converts a vague sense of AI visibility into a number that can be tracked and compared, and it identifies which competitor is taking the answers you want.",
    related: ["brand-mention", "prompt-tracking", "citation"],
  },
  {
    slug: "retrieval-augmented-generation",
    term: "Retrieval-Augmented Generation (RAG)",
    aka: ["RAG"],
    definition:
      "Retrieval-augmented generation is a technique where an AI system searches for relevant documents at query time and uses their contents to generate its answer, rather than relying only on training data.",
    body: [
      "RAG is why AEO is tractable at all. If answers came purely from training, influencing them would mean waiting for retraining. Because a retrieval step fetches live pages, changes to a website can affect answers within days.",
      "Retrieval is also where most of the leverage sits. Whether your page is fetched, and whether the passage is extractable, are far more controllable than what a model absorbed months ago.",
    ],
    whyItMatters:
      "Understanding RAG explains both the opportunity and the timeline — and separates work that can move quickly from work that cannot move at all on a useful horizon.",
    related: ["grounding", "citation", "answer-engine"],
  },
  {
    slug: "grounding",
    term: "Grounding",
    definition:
      "Grounding is the practice of tying an AI system's answer to specific retrieved sources so its claims can be traced and verified.",
    body: [
      "A grounded answer is built from documents the system fetched; an ungrounded one is produced from model memory. Grounded answers are more current, more verifiable, and usually carry citations.",
      "For a business, grounding is the mechanism by which its own website can influence what an engine says about it.",
    ],
    whyItMatters:
      "Ungrounded answers about your business reflect whatever the model absorbed, which may be years old or simply wrong. Being retrievable is how you get grounded answers instead.",
    related: ["retrieval-augmented-generation", "citation", "hallucination"],
  },
  {
    slug: "hallucination",
    term: "Hallucination",
    definition:
      "A hallucination is a confident, fluent statement produced by an AI system that is factually wrong or unsupported by any source.",
    body: [
      "For businesses this manifests as invented pricing, discontinued services described as current, wrong locations, or attributes belonging to a similarly-named company.",
      "The usual cause is an information gap. When authoritative current information is missing or unreadable, the model fills the space from whatever is nearest in its training — including stale or conflated material.",
    ],
    whyItMatters:
      "Hallucinations about your business are actively harmful and largely preventable. Clear, current, retrievable information is the fix, because it removes the gap the model was filling.",
    related: ["grounding", "entity", "retrieval-augmented-generation"],
  },
  {
    slug: "ai-crawler",
    term: "AI Crawler",
    definition:
      "An AI crawler is an automated agent operated by an AI company that fetches web pages either to train models or to support live search within an assistant.",
    body: [
      "The distinction between the two purposes is the part most sites get wrong. Training crawlers collect data for future models; search crawlers fetch pages to answer questions now. They are usually separate user agents with separate robots.txt rules.",
      "Blocking a training crawler is a legitimate content licensing decision. Blocking a search crawler removes you from that engine's answers, which is almost never what anyone intends.",
    ],
    whyItMatters:
      "Sites regularly block the wrong agent and quietly remove themselves from AI search while believing they protected their content from training.",
    related: ["gptbot", "google-extended", "llms-txt"],
  },
  {
    slug: "gptbot",
    term: "GPTBot",
    definition:
      "GPTBot is OpenAI's web crawler used to collect training data; it is distinct from the agents that power search results shown inside ChatGPT.",
    body: [
      "OpenAI operates several agents with different purposes. GPTBot gathers training data. OAI-SearchBot supports search and the links shown in answers. ChatGPT-User fetches a page when a user follows a link.",
      "Blocking GPTBot in robots.txt opts out of training use. It does not remove a site from ChatGPT's search results, because those use a different agent.",
    ],
    whyItMatters:
      "The confusion runs both ways: some sites block GPTBot expecting it to stop ChatGPT recommending competitors, and others allow everything while intending to opt out of training. Both are avoidable.",
    related: ["ai-crawler", "google-extended", "answer-engine-optimization"],
  },
  {
    slug: "google-extended",
    term: "Google-Extended",
    definition:
      "Google-Extended is a robots.txt token that controls whether a site's content may be used to train Google's Gemini models, without affecting Google Search indexing.",
    body: [
      "It is a training control, not a visibility control. Disallowing it does not remove a site from Google Search, and does not remove it from AI Overviews, which are generated from the ordinary Search index.",
      "This makes it one of the few clean choices available: a site can decline training use while remaining fully visible in Google's AI-generated answers.",
    ],
    whyItMatters:
      "It is widely misunderstood as an AI Overviews opt-out. Treating it as one leads either to a false sense of control or to unnecessary anxiety about visibility.",
    related: ["ai-overviews", "ai-crawler", "gptbot"],
  },
  {
    slug: "server-side-rendering",
    term: "Server-Side Rendering (SSR)",
    definition:
      "Server-side rendering is generating a page's HTML on the server so its content is present in the initial response, before any JavaScript runs in the browser.",
    body: [
      "Many AI crawlers do not execute JavaScript. A page whose content is assembled client-side may therefore be seen as an empty shell — the markup arrives, the substance never does.",
      "This is among the most common and most severe AEO failures, because it is invisible in a browser. The page looks perfect to a human and is blank to the machine.",
    ],
    whyItMatters:
      "If your content is not in the served HTML, no amount of quality or structured data helps. It is the first thing worth checking and the most consequential thing to get wrong.",
    related: ["ai-crawler", "structured-data", "answer-engine-optimization"],
  },
  {
    slug: "sameas",
    term: "sameAs",
    definition:
      "sameAs is a schema.org property listing authoritative URLs that refer to the same entity — typically social, directory and professional profiles.",
    body: [
      "It is the explicit statement that the company described on your site is the same company as the one on LinkedIn, Crunchbase, a review platform or an industry register.",
      "Those links are what let a system corroborate your claims against independent sources and merge scattered references into one confident entity.",
    ],
    whyItMatters:
      "It is a few lines of markup that converts existing profiles into a verification network. Almost no small business does it, and it is among the highest return-per-effort changes available.",
    related: ["entity", "structured-data", "knowledge-graph"],
  },
  {
    slug: "faq-schema",
    term: "FAQ Schema",
    definition:
      "FAQ schema is structured data marking up question-and-answer pairs on a page so machines can identify each question and its corresponding answer precisely.",
    body: [
      "Question-and-answer content is the format closest to what an answer engine produces, which makes it unusually easy to reuse. Marked-up FAQs are frequently lifted more or less verbatim.",
      "The requirement is that the marked-up content matches what a visitor sees. Markup describing content that is absent or different is a mismatch engines detect and penalise.",
    ],
    whyItMatters:
      "Of all content formats, FAQs convert most directly into citations, because the structure already matches the output. It is the cheapest way to become quotable.",
    related: ["structured-data", "schema-org", "citation"],
  },
  {
    slug: "zero-click-search",
    term: "Zero-Click Search",
    definition:
      "A zero-click search is a query answered fully on the results page or inside an assistant, so the user never visits any website.",
    body: [
      "The share of searches ending without a click has risen steadily, and AI Overviews and assistants accelerate it further by answering completely rather than pointing elsewhere.",
      "The strategic response is not to fight it but to relocate: if the answer is consumed in the interface, the objective becomes being the business named in that answer rather than the site that receives the click.",
    ],
    whyItMatters:
      "Traffic-based measurement understates AI visibility badly. A business can be recommended thousands of times and see it in brand searches and direct enquiries rather than referral traffic.",
    related: ["ai-overviews", "answer-engine", "brand-mention"],
  },
  {
    slug: "e-e-a-t",
    term: "E-E-A-T",
    definition:
      "E-E-A-T stands for Experience, Expertise, Authoritativeness and Trustworthiness — the framework Google's quality raters use to assess content and its creators.",
    body: [
      "It is not a direct ranking factor but a description of what Google's systems attempt to reward. The signals it describes — identifiable authors with credentials, citations, corroboration, transparency — overlap heavily with what AI engines weigh when deciding which sources to trust.",
      "It matters most in areas where bad information causes harm: health, finance and legal. Those are exactly the verticals where engines are most conservative about naming a business.",
    ],
    whyItMatters:
      "Anonymous content with no verifiable expertise behind it is discounted by both search and AI systems. In regulated verticals the effect is severe enough to determine whether you are recommendable at all.",
    related: ["entity", "brand-mention", "citation"],
  },
];

export const GLOSSARY_SLUGS = GLOSSARY.map((g) => g.slug);

export function getGlossaryTerm(slug: string) {
  return GLOSSARY.find((g) => g.slug === slug) ?? null;
}

export function relatedTerms(slug: string) {
  const entry = getGlossaryTerm(slug);
  if (!entry) return [];
  return entry.related.map(getGlossaryTerm).filter((t): t is GlossaryTerm => Boolean(t));
}
