import { CLAIM_WINDOW_DAYS, GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Single source for the pricing FAQ.
 *
 * The visible accordion and the FAQPage structured data both read from here, so
 * the schema can never drift from what a person actually sees — schema that
 * claims answers the page doesn't show is a violation, not a shortcut.
 */
export const PRICING_FAQ: FaqItem[] = [
  {
    q: "Is this really one payment?",
    a: `Yes. ${PRICE_LABEL} once buys the ${GUARANTEE_DAYS}-day sprint — research, audit, fixes and tracking. No subscription, and no card on file after it completes.`,
  },
  {
    q: "What exactly triggers the refund?",
    a: `If your brand isn't named by at least ${GUARANTEE_MIN_ENGINES} of the four engines on your locked prompts within ${GUARANTEE_DAYS} days, you claim in one click and get the full amount back. You have ${CLAIM_WINDOW_DAYS} days from the end of the sprint to claim.`,
  },
  {
    q: "How do you know whether the engines mention me?",
    a: "Our analysts ask each of your prompts on each engine in a normal signed-out session and record exactly what came back, including screenshots. Those records are what both your dashboard and the guarantee read from.",
  },
  {
    q: "Do you change my website?",
    a: "Only with your approval. Fixes arrive as reviewable diffs and content briefs; you decide what ships, and your team merges it.",
  },
  {
    q: `What happens after ${GUARANTEE_DAYS} days?`,
    a: "The sprint completes and you keep everything — the audit, the fixes, the data and the report. If you want continued tracking, talk to us; there's no automatic charge.",
  },
];
