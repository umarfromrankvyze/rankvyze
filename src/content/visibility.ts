/**
 * The AI search visibility pillar.
 *
 * The risk with a fourth page in this cluster is that it restates the other
 * three. So this one has a job none of them have: it publishes the arithmetic.
 * Everyone in this category sells "a visibility score" and almost nobody says
 * how theirs is calculated, which makes the number unfalsifiable and therefore
 * worthless for comparison.
 *
 * The weights below are read from src/lib/metrics.ts rather than retyped, so
 * the page cannot drift from the code that computes a customer's actual score.
 */

import { WEIGHT_TABLE, POSITION_CREDIT } from "@/lib/metrics-public";

export const VISIBILITY_ANSWER = {
  question: "What is AI search visibility, and how is it measured?",
  answer:
    "AI search visibility is how often an AI assistant names your business when someone asks a question you should be the answer to. Because a generated answer produces no ranking, no impressions and usually no click, it cannot be measured by traffic — it is measured by asking a fixed set of prompts on each engine and recording three things: whether you were named, whether a page of yours was cited, and where in the answer you appeared. Those three combine into a single 0–100 score.",
};

export const WHY_NOT_TRAFFIC = [
  {
    title: "No referrer",
    body: "An assistant that recommends you in conversation sends no visit at all. The recommendation happened; your analytics recorded nothing. Some AI products do pass a referrer on the minority of answers that get clicked, which is why AI traffic looks tiny even when AI influence is large.",
  },
  {
    title: "No position to track",
    body: "There is no result three in a generated answer. You are named or you are not, and rank-tracking software has nothing to report because there is no ranking to report on.",
  },
  {
    title: "No impressions",
    body: "Search Console counts impressions for the ten blue links, not for the answer above them. A query you dominate in AI answers can show zero impressions in the tool most teams treat as ground truth.",
  },
  {
    title: "Answers are not reproducible",
    body: "The same prompt returns different answers to different people and at different times. Any single check is an anecdote; only a rate across a fixed prompt set, repeated, is a measurement.",
  },
];

/** The three inputs, in the order they matter. */
export const COMPONENTS = [
  {
    key: "Mention rate",
    weight: WEIGHT_TABLE.mention,
    definition: "The share of prompt × engine checks in which your brand name appeared in the answer.",
    why: "Weighted highest because being named is the whole outcome. A customer reading a recommendation has already been influenced whether or not they click.",
  },
  {
    key: "Citation rate",
    weight: WEIGHT_TABLE.citation,
    definition: "The share of checks in which one of your pages was listed as a source the engine used.",
    why: "Weighted second because it is the leading indicator: citations usually move before mentions do, and they identify exactly which page earned the reference.",
  },
  {
    key: "Position factor",
    weight: WEIGHT_TABLE.position,
    definition:
      "How prominently you appear when you are named — first business mentioned, second, third — averaged across all checks.",
    why: "Weighted lowest because the gap between being named first and named third is real but far smaller than the gap between being named and being absent.",
  },
];

export const POSITION_TABLE = POSITION_CREDIT;

export const WORKED_EXAMPLE = {
  setup: "20 prompts × 4 engines = 80 checks. Named in 24 of them, cited in 12, and where named, mostly second or third.",
  rows: [
    { label: "Mention rate", calc: "24 ÷ 80", value: "0.30" },
    { label: "Citation rate", calc: "12 ÷ 80", value: "0.15" },
    { label: "Position factor", calc: "sum of position credit ÷ 80", value: "0.21" },
  ],
  formula: "100 × (0.5 × 0.30 + 0.3 × 0.15 + 0.2 × 0.21)",
  result: 24,
  reading:
    "A score of 24 means you are named in roughly a third of the questions you should own, cited half as often as that, and usually not first when you do appear. It is a starting position, not a failure — most businesses that have never done this work score in the teens or twenties.",
};

/** Said plainly, because a benchmark we cannot evidence would undermine the point. */
export const NO_BENCHMARKS = {
  heading: "We don't publish benchmark averages",
  body: "You will find pages claiming that the average business scores 18, or that above 40 is good. We have not run enough measured engagements to say that honestly, and a benchmark invented to make a number feel meaningful is exactly the sort of unfalsifiable claim this page exists to argue against. What matters is your own score moving against your own locked prompt set — that comparison is valid from the first round.",
};

export const VISIBILITY_FAQ = [
  {
    q: "What is AI search visibility?",
    a: "How often AI assistants name your business when answering questions your buyers ask. It is measured as a rate across a fixed set of prompts on each engine, not as a ranking, because generated answers have no positions to rank in.",
  },
  {
    q: "How is an AI visibility score calculated?",
    a: `Ours is 100 × (${WEIGHT_TABLE.mention} × mention rate + ${WEIGHT_TABLE.citation} × citation rate + ${WEIGHT_TABLE.position} × position factor), where each rate is over the total number of prompt × engine checks. Position credit decays from 1.0 for first mention to 0.25 beyond fifth. Other vendors weight these differently, and most do not publish their formula at all — so scores are not comparable between tools.`,
  },
  {
    q: "Can I measure AI visibility in Google Analytics or Search Console?",
    a: "No. A generated answer usually produces no click and therefore no referrer, and Search Console counts impressions for the link results rather than the answer above them. A query you dominate in AI answers can show zero impressions in both tools.",
  },
  {
    q: "How many prompts do I need for the score to mean anything?",
    a: "Ten to twenty prompts across four engines — 40 to 80 checks — is enough for the rate to be stable between rounds. Below about ten prompts a single answer changing swings the score enough to be misleading.",
  },
  {
    q: "Is a visibility score comparable between tools?",
    a: "No, and treating it as if it were is the most common mistake here. Different tools use different prompt sets, different engines, different position weighting and different definitions of a mention. Compare your score against your own previous score, never against a number from another platform.",
  },
  {
    q: "What is a good AI visibility score?",
    a: "The only honest answer is: higher than your last one, on the same prompt set. We do not publish a benchmark average because we have not measured enough engagements to state one truthfully, and a made-up threshold would make the number feel more meaningful than it is.",
  },
];
