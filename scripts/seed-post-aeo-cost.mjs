/**
 * Publish "What answer engine optimization actually costs".
 *
 * Highest commercial intent of anything left on the keyword map, and the one
 * page where we have a structural advantage: almost nobody in this category
 * publishes a number, so a real one is the differentiator.
 *
 * Upserts by slug — safe to re-run.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const blocks = [
  {
    type: "p",
    text: "**Answer engine optimization costs between $0 and about $10,000 a month, and the spread is almost entirely about who does the work rather than how much gets done.** Here are the actual ranges, what sits inside each, and how to tell which one you need.",
  },
  {
    type: "callout",
    tone: "note",
    title: "Why this page exists",
    text: "Nearly every AEO provider hides pricing behind a call. That is a choice about sales process, not a fact about the work — and it makes the category impossible to budget for. The numbers below are what we see quoted; ours is at the bottom, stated plainly.",
  },
  { type: "h2", text: "The four ways to buy it" },
  {
    type: "table",
    head: ["Option", "Typical cost", "What you get", "Best when"],
    rows: [
      ["Do it yourself", "$0 plus your time", "Schema, rendering fixes, crawler policy, content — roughly 20–40 hours to do properly", "You have a developer and a writer already"],
      ["AEO tool subscription", "$50–$500/month", "Tracking and reporting. Tells you where you stand; does not fix anything", "You have a team who will act on the data"],
      ["Retainer agency", "$2,000–$10,000/month", "Ongoing research, audits, implementation, reporting", "You need continuous work across many pages"],
      ["Fixed-scope sprint", "$99–$5,000 one-time", "A defined engagement: measure, fix, re-measure", "You want to know whether this works before committing"],
    ],
  },
  {
    type: "p",
    text: "The gap between a tool subscription and an agency retainer is where most people get stuck. A tool tells you that ChatGPT doesn't mention you. It cannot tell you that your homepage H1 says nothing a machine can categorise, and it certainly can't rewrite it.",
  },
  { type: "h2", text: "What actually drives the price" },
  {
    type: "ul",
    items: [
      "**Whether implementation is included.** Diagnosis is a few hours. Doing the work — schema, rendering, entity copy, new pages — is most of the cost. Read any quote for this first.",
      "**How research is done.** Manual analysts asking real questions on real engines cost more per check than an API, and produce results that reflect what a customer actually sees. Automated checks are cheaper and drift from reality.",
      "**How many questions are tracked.** Ten prompts across four engines is 40 checks per round. A hundred prompts is 400. This scales linearly and is the single biggest input to an agency's number.",
      "**Whether anything is guaranteed.** Almost nothing in this category is. A provider carrying the risk has priced it in — or has decided it can meet the bar.",
    ],
  },
  {
    type: "callout",
    tone: "warn",
    title: "The question that filters most providers",
    text: "Ask: “What exactly do I get if this doesn't work?” The common answer is a report explaining why the market was difficult. If there is no defined outcome and no consequence for missing it, you are buying activity, not a result.",
  },
  { type: "h2", text: "Is it worth paying for at all?" },
  {
    type: "p",
    text: "Only if your buyers ask comparative questions before choosing. If someone already knows your brand name and types it, an AI answer isn't in the path. If they ask “what's the best X for Y”, it is — and the answer names two or three companies.",
  },
  {
    type: "steps",
    items: [
      { title: "Work out what one customer is worth", text: "Average deal value times gross margin. For most B2B services this is in the thousands." },
      { title: "Count the questions you'd want to win", text: "Ten to twenty is typical for a focused business." },
      { title: "Check where you stand on them today", text: "Ask each one in a signed-out session across ChatGPT, Perplexity, Gemini and Claude. Count how often you're named." },
      { title: "Compare that gap to the price", text: "If you are absent from questions your buyers ask and one customer covers the cost several times over, the arithmetic is not close." },
    ],
  },
  { type: "h2", text: "What RankVyze costs" },
  {
    type: "p",
    text: "**$99, once.** That covers a 45-day sprint: baseline research across ChatGPT, Perplexity, Gemini and Claude, a full AEO audit scored across six categories, implementation of the fixes as reviewable changes, and a re-measurement against the day-zero baseline.",
  },
  {
    type: "p",
    text: "If your business isn't mentioned on at least two of the four engines by the end of those 45 days, on the prompt set agreed at the start, the $99 is refunded in full. The conditions that void that are [published in advance](/guarantee) — there are no others.",
  },
  {
    type: "p",
    text: "It is a fixed-scope sprint, not a retainer, and it is deliberately priced to remove the decision. See [what's included](/pricing), or read about [the service itself](/answer-engine-optimization).",
  },
  {
    type: "faq",
    items: [
      {
        q: "How much does answer engine optimization cost?",
        a: "Anywhere from $0 doing it yourself to $10,000 a month on an agency retainer. Tool subscriptions run $50–$500 a month but only measure. Fixed-scope sprints run $99–$5,000 one-time. RankVyze is $99 once for a 45-day sprint, refunded if it doesn't work.",
      },
      {
        q: "Why do most AEO agencies not publish prices?",
        a: "Because scope varies and because a call converts better than a price page. It isn't necessarily a red flag, but it does mean you cannot compare providers without several conversations — which is itself a cost.",
      },
      {
        q: "Is a monthly AEO retainer worth it?",
        a: "It can be, if you have many pages, many questions to win, and a competitor actively working the same ground. For a business with ten to twenty buyer questions and one site, a fixed-scope engagement usually reaches the same place for far less.",
      },
      {
        q: "Can I do answer engine optimization myself for free?",
        a: "Yes. The technical half — Organization and Service schema, server-rendered content, crawler access, a plain entity definition on the homepage — is roughly a day's work for a competent developer. The slower half is content and third-party corroboration.",
      },
      {
        q: "Does AEO pricing include content writing?",
        a: "Often not, and it is the most common hidden cost. Comparison and pricing pages are usually what wins commercial questions, so if writing is excluded you are buying diagnosis rather than a result. Ask explicitly.",
      },
    ],
  },
];

const data = {
  title: "What answer engine optimization actually costs",
  seoTitle: "How Much Does AEO Cost? Real Prices, 2026",
  description:
    "AEO pricing ranges from $0 to $10,000 a month. The real ranges for tools, retainers and fixed-scope sprints, what drives the number, and how to tell which you need.",
  excerpt:
    "Almost nobody in this category publishes a price, which makes it impossible to budget for. Here are the actual ranges, what sits inside each, and what drives the number.",
  category: "Strategy",
  targets: [
    "how much does aeo cost",
    "answer engine optimization cost",
    "aeo pricing",
    "aeo agency cost",
    "generative engine optimization pricing",
  ].join(", "),
  status: "PUBLISHED",
  featured: true,
  position: 15,
  blocksJson: JSON.stringify(blocks),
  publishedAt: new Date(),
};

const post = await db.blogPost.upsert({
  where: { slug: "what-answer-engine-optimization-costs" },
  update: data,
  create: { slug: "what-answer-engine-optimization-costs", ...data },
});

console.info(`${post.status}  /blog/${post.slug}  — ${blocks.length} blocks`);
console.info(`total published: ${await db.blogPost.count({ where: { status: "PUBLISHED" } })}`);
await db.$disconnect();
