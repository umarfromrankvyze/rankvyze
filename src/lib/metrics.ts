/**
 * Every number the customer sees is derived from AIResearchResult rows.
 * In V1 those rows are entered by hand by RankVyze staff; an engine API would
 * write identical rows, so nothing in this module knows or cares which.
 */

export interface ResearchLike {
  promptId: string;
  engineKey: string;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  checkedAt: Date;
}

export interface VisibilitySummary {
  /** distinct prompt × engine checks considered */
  checks: number;
  mentioned: number;
  cited: number;
  /** 0–100 */
  mentionRate: number;
  /** 0–100 */
  citationRate: number;
  avgPosition: number | null;
  /** 0–100 composite */
  score: number;
  queriesWon: number;
  queriesLost: number;
}

const WEIGHTS = { mention: 0.5, citation: 0.3, position: 0.2 } as const;

/** 1st mention is worth full credit; credit decays quickly after the top 3. */
export function positionScore(position: number | null): number {
  if (!position || position < 1) return 0;
  const table = [1, 0.85, 0.7, 0.55, 0.4];
  return table[position - 1] ?? 0.25;
}

/**
 * Keep only the most recent check for each prompt/engine pair so repeated
 * research sessions replace, rather than dilute, earlier results.
 */
export function latestChecks<T extends ResearchLike>(rows: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const row of rows) {
    const key = `${row.promptId}::${row.engineKey}`;
    const existing = byKey.get(key);
    if (!existing || existing.checkedAt < row.checkedAt) byKey.set(key, row);
  }
  return [...byKey.values()];
}

export function summarize(rows: ResearchLike[]): VisibilitySummary {
  const checks = rows.length;
  if (checks === 0) {
    return {
      checks: 0,
      mentioned: 0,
      cited: 0,
      mentionRate: 0,
      citationRate: 0,
      avgPosition: null,
      score: 0,
      queriesWon: 0,
      queriesLost: 0,
    };
  }

  let mentioned = 0;
  let cited = 0;
  let positionTotal = 0;
  let positionCount = 0;
  let positionFactor = 0;
  let won = 0;
  let lost = 0;

  for (const row of rows) {
    if (row.mentioned) {
      mentioned += 1;
      positionFactor += positionScore(row.position);
      if (row.position) {
        positionTotal += row.position;
        positionCount += 1;
      }
      if (row.position !== null && row.position <= 3) won += 1;
    } else {
      lost += 1;
    }
    if (row.cited) cited += 1;
  }

  const mentionRate = mentioned / checks;
  const citationRate = cited / checks;
  const posFactor = positionFactor / checks;

  const score = Math.round(
    100 * (WEIGHTS.mention * mentionRate + WEIGHTS.citation * citationRate + WEIGHTS.position * posFactor),
  );

  return {
    checks,
    mentioned,
    cited,
    mentionRate: Math.round(mentionRate * 100),
    citationRate: Math.round(citationRate * 100),
    avgPosition: positionCount ? Math.round((positionTotal / positionCount) * 10) / 10 : null,
    score,
    queriesWon: won,
    queriesLost: lost,
  };
}

export function summarizeByEngine(rows: ResearchLike[], engineKeys: string[]) {
  const out: Record<string, VisibilitySummary> = {};
  for (const key of engineKeys) {
    out[key] = summarize(rows.filter((r) => r.engineKey === key));
  }
  return out;
}

/** Number of distinct prompts mentioned on at least one engine. */
export function promptsWithMention(rows: ResearchLike[]) {
  const set = new Set<string>();
  for (const r of rows) if (r.mentioned) set.add(r.promptId);
  return set.size;
}

export function percentChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Needs work";
  return "Weak";
}
