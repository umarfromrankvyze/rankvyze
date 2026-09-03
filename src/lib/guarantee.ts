/**
 * The 45-day visibility guarantee.
 *
 * This is a financial promise, so it is evaluated by a pure function over
 * AIResearchResult rows — the same source every other metric reads. No
 * judgement call sits between the research and the refund decision.
 *
 * The bar: the brand is mentioned on at least GUARANTEE_MIN_ENGINES distinct
 * AI engines, at any point inside the window, on a prompt from the set locked
 * when the engagement started.
 */

export const GUARANTEE_DAYS = 45;
export const GUARANTEE_MIN_ENGINES = 2;
/** Days after the window closes during which a refund can be claimed. */
export const CLAIM_WINDOW_DAYS = 15;
/** Customer must finish onboarding within this many days or the guarantee voids. */
export const ONBOARDING_GRACE_DAYS = 7;

export const PRICE_CENTS = 9900;
export const PRICE_LABEL = "$99";

export type EngagementStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "MET"
  | "ELIGIBLE"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "DENIED"
  | "VOID";

export const VOID_REASONS = {
  ONBOARDING_INCOMPLETE: `Onboarding wasn't completed within ${ONBOARDING_GRACE_DAYS} days of purchase.`,
  NO_FIXES_APPROVED: "None of the recommended optimizations were approved, so the work could not be carried out.",
  SITE_UNREACHABLE: "The website was unreachable or blocked AI crawlers for more than 7 days during the engagement.",
} as const;

export type VoidReason = keyof typeof VOID_REASONS;

export interface GuaranteeCheck {
  engineKey: string;
  engineName: string;
  promptId: string;
  promptText: string;
  mentioned: boolean;
  position: number | null;
  checkedAt: Date;
}

export interface GuaranteeEvidence {
  engineKey: string;
  engineName: string;
  promptText: string;
  position: number | null;
  checkedAt: string;
}

export interface GuaranteeEvaluation {
  met: boolean;
  engineCount: number;
  enginesNeeded: number;
  /** First qualifying mention per engine, ordered by date */
  evidence: GuaranteeEvidence[];
  /** Engines with no qualifying mention yet */
  missingEngines: string[];
  metAt: Date | null;
}

export function windowFor(startsAt: Date) {
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + GUARANTEE_DAYS);
  const claimEndsAt = new Date(endsAt);
  claimEndsAt.setDate(claimEndsAt.getDate() + CLAIM_WINDOW_DAYS);
  return { startsAt, endsAt, claimEndsAt };
}

export function daysRemaining(endsAt: Date, now = new Date()) {
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000));
}

/**
 * @param checks     every research result for the website
 * @param window     the engagement window
 * @param lockedPrompts prompt ids frozen at day 0; empty means "any prompt"
 * @param allEngineKeys every active engine, so we can report what's missing
 */
export function evaluateGuarantee(
  checks: GuaranteeCheck[],
  window: { startsAt: Date; endsAt: Date },
  lockedPrompts: string[],
  allEngineKeys: { key: string; name: string }[],
): GuaranteeEvaluation {
  const locked = new Set(lockedPrompts);
  const qualifying = checks
    .filter(
      (c) =>
        c.mentioned &&
        c.checkedAt >= window.startsAt &&
        c.checkedAt <= window.endsAt &&
        (locked.size === 0 || locked.has(c.promptId)),
    )
    .sort((a, b) => a.checkedAt.getTime() - b.checkedAt.getTime());

  // First qualifying mention per engine — that is the evidence we keep.
  const firstByEngine = new Map<string, GuaranteeCheck>();
  for (const c of qualifying) if (!firstByEngine.has(c.engineKey)) firstByEngine.set(c.engineKey, c);

  const evidence: GuaranteeEvidence[] = [...firstByEngine.values()]
    .sort((a, b) => a.checkedAt.getTime() - b.checkedAt.getTime())
    .map((c) => ({
      engineKey: c.engineKey,
      engineName: c.engineName,
      promptText: c.promptText,
      position: c.position,
      checkedAt: c.checkedAt.toISOString(),
    }));

  const engineCount = firstByEngine.size;
  const met = engineCount >= GUARANTEE_MIN_ENGINES;

  // The moment the bar was cleared = the date of the Nth engine's first mention.
  const metAt = met ? new Date(evidence[GUARANTEE_MIN_ENGINES - 1].checkedAt) : null;

  return {
    met,
    engineCount,
    enginesNeeded: GUARANTEE_MIN_ENGINES,
    evidence,
    missingEngines: allEngineKeys.filter((e) => !firstByEngine.has(e.key)).map((e) => e.name),
    metAt,
  };
}

/** Human-readable status for the dashboard. */
export function guaranteeHeadline(status: EngagementStatus, evaluation: GuaranteeEvaluation, days: number) {
  switch (status) {
    case "MET":
      return `Guarantee met — you're being recommended on ${evaluation.engineCount} engines.`;
    case "ELIGIBLE":
      return "The guarantee wasn't met. You're eligible for a full refund.";
    case "REFUND_REQUESTED":
      return "Refund requested — we're reviewing it.";
    case "REFUNDED":
      return "Refunded in full.";
    case "DENIED":
      return "Refund request was declined.";
    case "VOID":
      return "The guarantee no longer applies to this engagement.";
    case "PENDING_PAYMENT":
      return "Waiting for payment to complete.";
    default:
      return evaluation.engineCount > 0
        ? `On ${evaluation.engineCount} of ${GUARANTEE_MIN_ENGINES} engines needed · ${days} days left`
        : `${days} days left to reach ${GUARANTEE_MIN_ENGINES} engines`;
  }
}
