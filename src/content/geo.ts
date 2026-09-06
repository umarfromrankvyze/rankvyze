/**
 * The generative engine optimization pillar.
 *
 * The glossary already defines GEO in one sentence. This page exists for a
 * different reader: someone evaluating whether to buy GEO work, who is trying
 * to tell it apart from AEO and from SEO and cannot, because the vendors
 * selling it have every incentive to keep the distinction blurry.
 *
 * So the page takes a position most competitors won't: GEO and AEO describe
 * the same work, the label proliferation is positioning, and nobody should pay
 * a premium for one acronym over another. That is more useful than another
 * "GEO is the future" page, and it is the reason this one is worth citing.
 */

export const GEO_ANSWER = {
  question: "What is generative engine optimization (GEO)?",
  answer:
    "Generative engine optimization is the practice of making content more likely to be surfaced and cited by AI systems that generate answers — ChatGPT, Perplexity, Google's AI Overviews, Claude and Gemini. The term comes from a 2023 research paper that ran controlled experiments on which content changes actually increase visibility in generated answers. In commercial use it describes the same body of work as answer engine optimization; the two labels are interchangeable, and no vendor should be charging a premium for one over the other.",
};

/**
 * The origin, stated precisely, because almost every page on this topic
 * gestures at "research" without saying whose. Citing the primary source is
 * both more honest and more citable.
 */
export const ORIGIN = {
  title: "GEO: Generative Engine Optimization",
  authors: "Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan and Deshpande",
  affiliations: "Princeton University, the Allen Institute for AI, Georgia Tech and IIT Delhi",
  published: "arXiv, November 2023; presented at ACM SIGKDD (KDD '24)",
  url: "https://arxiv.org/abs/2311.09735",
  what: [
    "It coined the term. Before this paper, there was no name for optimising content specifically for generated answers rather than for a ranked list of links.",
    "It built GEO-BENCH, a benchmark of roughly 10,000 queries, and used it to test content strategies under controlled conditions rather than by anecdote.",
    "It demonstrated that the visibility of a source inside a generated answer can be deliberately influenced — which is the entire premise the industry now rests on.",
  ],
  caveat:
    "Worth reading rather than taking second-hand. Much of what is quoted from it online is a headline percentage stripped of the conditions it was measured under, and the paper predates the current generation of retrieval systems.",
};

export interface Discipline {
  label: string;
  target: string;
  unit: string;
  wins: string;
  timescale: string;
  isUs?: boolean;
}

export const COMPARISON: Discipline[] = [
  {
    label: "SEO",
    target: "A ranked list of ten blue links",
    unit: "Position for a keyword",
    wins: "Being clicked",
    timescale: "Months to years",
  },
  {
    label: "GEO",
    target: "A generated answer",
    unit: "Whether you are named or cited",
    wins: "Being named at all — there is no position four",
    timescale: "Weeks to months on retrieval-driven queries",
    isUs: true,
  },
  {
    label: "AEO",
    target: "A generated answer",
    unit: "Whether you are named or cited",
    wins: "Being named at all — there is no position four",
    timescale: "Weeks to months on retrieval-driven queries",
    isUs: true,
  },
];

export const SAME_THING = {
  heading: "GEO and AEO are the same work",
  body: [
    "If there is a distinction, it is one of emphasis. GEO is used more often when talking about content-level changes — how a passage is written, whether it carries statistics or quotations, whether it reads as quotable. AEO is used more often for the whole discipline, including the technical and entity work underneath.",
    "In practice both describe the same job: make the entity unambiguous, make the content retrievable, and build corroboration from sources you do not own. A provider whose GEO offering differs materially from their AEO offering is selling you a naming convention.",
  ],
  labels: ["GEO", "AEO", "LLM SEO", "AI SEO", "AI search optimization", "Answer engine marketing"],
  punchline:
    "Six names, one body of work. The proliferation is vendor positioning, and knowing that is the fastest way to tell whether someone is selling you something real.",
};

export const LEVERS = [
  {
    title: "Make the entity unambiguous",
    body: "One consistent name, a plain statement of the category you are in, Organization markup, and sameAs links to profiles that exist. A model cannot recommend a business it cannot resolve.",
  },
  {
    title: "Write passages that survive extraction",
    body: "A generated answer is assembled from passages lifted out of pages. A paragraph that only makes sense after the three before it will not be used. Lead with the answer, then explain.",
  },
  {
    title: "Be readable without JavaScript",
    body: "Retrieval reads served HTML. Content that appears only after client-side rendering is frequently missed, which silently removes your best pages from consideration.",
  },
  {
    title: "Carry verifiable specifics",
    body: "The GEO paper's most durable finding is that concrete material — statistics, quotations, cited sources — outperforms unsupported assertion. Superlatives about yourself are the weakest content you can publish.",
  },
  {
    title: "Earn corroboration off your own domain",
    body: "Independent sources agreeing about who you are is what turns a claim into a fact an engine will repeat. This is the slowest lever and the one that matters most.",
  },
  {
    title: "Measure against a locked prompt set",
    body: "Answers vary by user, session and phrasing, so the only meaningful number is a mention rate across a fixed set of prompts, re-run on a schedule.",
  },
];

export const GEO_FAQ = [
  {
    q: "What is the difference between GEO and AEO?",
    a: "In practice, none. Both describe making a business legible and credible enough that AI systems name it in a generated answer. GEO is used slightly more often for content-level work and AEO for the whole discipline, but no serious provider does materially different work under the two labels.",
  },
  {
    q: "Is GEO the same as SEO?",
    a: "No. SEO competes for a position in a list of ten links; GEO competes to be one of the two or three names an assistant mentions when it answers directly. The underlying signals overlap — crawlability, structure, authority — but the target and the unit of success are different, and there is no equivalent of ranking fourth.",
  },
  {
    q: "Where did the term generative engine optimization come from?",
    a: "From a 2023 paper of that name by Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan and Deshpande, from Princeton, the Allen Institute for AI, Georgia Tech and IIT Delhi. It introduced the term and GEO-BENCH, a benchmark of around 10,000 queries used to test content strategies under controlled conditions.",
  },
  {
    q: "Do I need GEO if I already do SEO?",
    a: "Some of your SEO work already helps — crawlable, well-structured, authoritative pages are good for both. What SEO does not cover is entity resolution, passage-level extractability and the corroboration that decides whether a model is willing to name you. Those are the additions, not a replacement.",
  },
  {
    q: "How long does GEO take to work?",
    a: "On retrieval-driven queries, where the engine searches live before answering, changes can register within days to a few weeks of being crawled. Anything relying on a model's trained view moves only when models are retrained, which nobody outside the labs controls and which should not be planned around.",
  },
  {
    q: "How do you measure whether GEO is working?",
    a: "By mention rate across a locked prompt set, per engine, re-run on a schedule — plus citations, which move earlier and tell you which specific page earned the reference. Traffic and rankings do not measure this: a generated answer usually produces no click at all.",
  },
];
