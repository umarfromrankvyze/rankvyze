import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  latestChecks,
  percentChange,
  promptsWithMention,
  summarize,
  summarizeByEngine,
  type VisibilitySummary,
} from "@/lib/metrics";

export const WEBSITE_COOKIE = "rv_website";

// ---------------------------------------------------------------------------
// Workspace (org + websites) for the signed-in customer
// ---------------------------------------------------------------------------

export const getWorkspace = cache(async (userId: string) => {
  const membership = await db.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      organization: {
        include: {
          websites: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
          subscription: true,
        },
      },
    },
  });
  if (!membership) return null;

  const organization = membership.organization;
  const jar = await cookies();
  const selectedId = jar.get(WEBSITE_COOKIE)?.value;
  const website = organization.websites.find((w) => w.id === selectedId) ?? organization.websites[0] ?? null;

  return { organization, websites: organization.websites, website, membership };
});

/** Guard: the website belongs to one of the user's organizations. */
export async function assertWebsiteAccess(userId: string, websiteId: string) {
  const website = await db.website.findFirst({
    where: { id: websiteId, organization: { members: { some: { userId } } } },
  });
  if (!website) throw new Error("Website not found");
  return website;
}

// ---------------------------------------------------------------------------
// Research rows → metrics
// ---------------------------------------------------------------------------

export interface ResearchRow {
  id: string;
  promptId: string;
  promptText: string;
  engineKey: string;
  engineName: string;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citationUrl: string | null;
  citedPagePath: string | null;
  sentiment: string | null;
  answerSummary: string | null;
  notes: string | null;
  screenshotUrl: string | null;
  checkedAt: Date;
  rivals: { competitorId: string | null; name: string; position: number | null }[];
}

export const getResearchRows = cache(async (websiteId: string): Promise<ResearchRow[]> => {
  const rows = await db.aIResearchResult.findMany({
    where: { websiteId },
    orderBy: { checkedAt: "desc" },
    include: {
      prompt: { select: { text: true } },
      engine: { select: { key: true, name: true } },
      rivals: { select: { competitorId: true, name: true, position: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    promptId: r.promptId,
    promptText: r.prompt.text,
    engineKey: r.engine.key,
    engineName: r.engine.name,
    mentioned: r.mentioned,
    position: r.position,
    cited: r.cited,
    citationUrl: r.citationUrl,
    citedPagePath: r.citedPagePath,
    sentiment: r.sentiment,
    answerSummary: r.answerSummary,
    notes: r.notes,
    screenshotUrl: r.screenshotUrl,
    checkedAt: r.checkedAt,
    rivals: r.rivals,
  }));
});

export const getEngines = cache(async () => db.aIEngine.findMany({ where: { isActive: true }, orderBy: { sortkey: "asc" } }));

export interface CompetitorStanding {
  id: string | null; // null = the customer's own brand
  name: string;
  domain: string;
  isYou: boolean;
  summary: VisibilitySummary;
  citations: number;
  byEngine: Record<string, VisibilitySummary>;
}

export interface TrendPoint {
  date: string;
  score: number;
  mentionRate: number;
  citationRate: number;
}

export const getVisibilityOverview = cache(async (websiteId: string) => {
  const [engines, rows, snapshots, competitors, competitorCitations, prompts, ownCitations] = await Promise.all([
    getEngines(),
    getResearchRows(websiteId),
    db.visibilitySnapshot.findMany({ where: { websiteId }, orderBy: { capturedOn: "asc" }, include: { engine: { select: { key: true } } } }),
    db.competitor.findMany({ where: { websiteId, isTracked: true }, orderBy: { createdAt: "asc" } }),
    db.citation.findMany({ where: { websiteId, isOwnDomain: false }, select: { resultId: true, competitorId: true } }),
    db.prompt.count({ where: { websiteId, isActive: true } }),
    db.citation.count({ where: { websiteId, isOwnDomain: true } }),
  ]);

  const engineKeys = engines.map((e) => e.key);
  const latest = latestChecks(rows);
  const summary = summarize(latest);
  const byEngine = summarizeByEngine(latest, engineKeys);

  // Trend + deltas from snapshots
  const overallSnaps = snapshots.filter((s) => !s.engineId);
  const trend: TrendPoint[] = overallSnaps.map((s) => ({
    date: s.capturedOn.toISOString(),
    score: Math.round(s.visibilityScore),
    mentionRate: Math.round(s.mentionRate),
    citationRate: Math.round(s.citationRate),
  }));
  const previous = pickPrevious(overallSnaps.map((s) => ({ at: s.capturedOn, value: s.visibilityScore })));
  const delta = previous === null ? 0 : percentChange(summary.score, previous);

  const engineTrends: Record<string, TrendPoint[]> = {};
  const engineDeltas: Record<string, number> = {};
  for (const key of engineKeys) {
    const snaps = snapshots.filter((s) => s.engine?.key === key);
    engineTrends[key] = snaps.map((s) => ({
      date: s.capturedOn.toISOString(),
      score: Math.round(s.visibilityScore),
      mentionRate: Math.round(s.mentionRate),
      citationRate: Math.round(s.citationRate),
    }));
    const prevEngine = pickPrevious(snaps.map((s) => ({ at: s.capturedOn, value: s.visibilityScore })));
    engineDeltas[key] = prevEngine === null ? 0 : percentChange(byEngine[key].score, prevEngine);
  }

  // Competitor standings computed from the same latest checks
  const citedPairs = new Set(competitorCitations.map((c) => `${c.resultId}:${c.competitorId}`));
  const standings: CompetitorStanding[] = competitors.map((c) => {
    const compRows = latest.map((r) => {
      const m = r.rivals.find((x) => x.competitorId === c.id);
      return {
        promptId: r.promptId,
        engineKey: r.engineKey,
        mentioned: Boolean(m),
        position: m?.position ?? null,
        cited: citedPairs.has(`${r.id}:${c.id}`),
        checkedAt: r.checkedAt,
      };
    });
    return {
      id: c.id,
      name: c.name,
      domain: c.domain,
      isYou: false,
      summary: summarize(compRows),
      citations: competitorCitations.filter((x) => x.competitorId === c.id).length,
      byEngine: summarizeByEngine(compRows, engineKeys),
    };
  });

  const website = await db.website.findUnique({ where: { id: websiteId }, select: { name: true, domain: true } });
  const you: CompetitorStanding = {
    id: null,
    name: website?.name ?? "Your brand",
    domain: website?.domain ?? "",
    isYou: true,
    summary,
    citations: ownCitations,
    byEngine,
  };

  const leaderboard = [...standings, you].sort((a, b) => b.summary.score - a.summary.score);

  return {
    engines,
    summary,
    byEngine,
    delta,
    engineDeltas,
    trend,
    engineTrends,
    promptCount: prompts,
    promptsMentioned: promptsWithMention(latest),
    ownCitations,
    competitorCitations: competitorCitations.length,
    leaderboard,
    latest,
    lastCheckedAt: latest.reduce<Date | null>((acc, r) => (!acc || r.checkedAt > acc ? r.checkedAt : acc), null),
    hasResearch: rows.length > 0,
  };
});

/** Value from ~28 days before the most recent snapshot, or the earliest if history is shorter. */
function pickPrevious(points: { at: Date; value: number }[]): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  const target = last.at.getTime() - 28 * 86400000;
  let best = points[0];
  for (const p of points) {
    if (Math.abs(p.at.getTime() - target) < Math.abs(best.at.getTime() - target)) best = p;
  }
  return best === last ? points[points.length - 2].value : best.value;
}

// ---------------------------------------------------------------------------
// Page-level queries
// ---------------------------------------------------------------------------

export const getPrompts = cache(async (websiteId: string) => {
  const [prompts, rows, engines] = await Promise.all([
    db.prompt.findMany({ where: { websiteId }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }] }),
    getResearchRows(websiteId),
    getEngines(),
  ]);
  const latest = latestChecks(rows);
  return prompts.map((p) => {
    const perEngine = Object.fromEntries(
      engines.map((e) => [e.key, latest.find((r) => r.promptId === p.id && r.engineKey === e.key) ?? null]),
    );
    const checks = Object.values(perEngine).filter(Boolean) as ResearchRow[];
    return {
      ...p,
      perEngine,
      mentionedOn: checks.filter((r) => r.mentioned).length,
      citedOn: checks.filter((r) => r.cited).length,
      bestPosition: checks.reduce<number | null>((acc, r) => (r.position && (!acc || r.position < acc) ? r.position : acc), null),
      lastCheckedAt: checks.reduce<Date | null>((acc, r) => (!acc || r.checkedAt > acc ? r.checkedAt : acc), null),
      history: rows.filter((r) => r.promptId === p.id),
    };
  });
});

export type PromptWithResults = Awaited<ReturnType<typeof getPrompts>>[number];

export const getCompetitors = cache(async (websiteId: string) => {
  const overview = await getVisibilityOverview(websiteId);
  const competitors = await db.competitor.findMany({ where: { websiteId }, orderBy: { createdAt: "asc" } });
  return competitors.map((c) => ({
    ...c,
    standing: overview.leaderboard.find((s) => s.id === c.id) ?? null,
  }));
});

export const getCitations = cache(async (websiteId: string) =>
  db.citation.findMany({
    where: { websiteId },
    orderBy: { occurredAt: "desc" },
    include: {
      engine: { select: { key: true, name: true } },
      prompt: { select: { id: true, text: true } },
      competitor: { select: { id: true, name: true, domain: true } },
    },
  }),
);

export const getLatestAudit = cache(async (websiteId: string) =>
  db.aEOAudit.findFirst({ where: { websiteId, status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
);

export const getAuditHistory = cache(async (websiteId: string) =>
  db.aEOAudit.findMany({ where: { websiteId, status: "PUBLISHED" }, orderBy: { createdAt: "asc" } }),
);

export const getIssues = cache(async (websiteId: string) =>
  db.aEOIssue.findMany({
    where: { websiteId },
    orderBy: [{ impactScore: "desc" }, { createdAt: "asc" }],
    include: { optimizations: { select: { id: true, status: true, title: true } } },
  }),
);

export const getIssue = cache(async (websiteId: string, id: string) =>
  db.aEOIssue.findFirst({
    where: { id, websiteId },
    include: {
      optimizations: { include: { codeChanges: { select: { id: true, number: true, status: true, title: true } } } },
      audit: { select: { id: true, createdAt: true, overallScore: true } },
    },
  }),
);

export const getOptimizations = cache(async (websiteId: string) =>
  db.optimization.findMany({
    where: { websiteId },
    orderBy: [{ impactScore: "desc" }],
    include: {
      issue: { select: { id: true, title: true, severity: true } },
      codeChanges: { select: { id: true, number: true, status: true } },
    },
  }),
);

export const getCodeChanges = cache(async (websiteId: string) =>
  db.codeChange.findMany({
    where: { websiteId },
    orderBy: { number: "desc" },
    include: { optimization: { select: { id: true, title: true } }, files: { select: { id: true, path: true, additions: true, deletions: true } } },
  }),
);

export const getCodeChange = cache(async (websiteId: string, id: string) =>
  db.codeChange.findFirst({
    where: { id, websiteId },
    include: {
      optimization: { include: { issue: { select: { id: true, title: true, impactScore: true, severity: true } } } },
      files: true,
      reviewedBy: { select: { name: true } },
    },
  }),
);

export const getContentOpportunities = cache(async (websiteId: string) =>
  db.contentOpportunity.findMany({
    where: { websiteId },
    orderBy: [{ estimatedLift: "desc" }],
    include: { prompt: { select: { id: true, text: true } } },
  }),
);

export const getReports = cache(async (websiteId: string) =>
  db.report.findMany({ where: { websiteId }, orderBy: { createdAt: "desc" } }),
);

export const getIntegrations = cache(async (websiteId: string) =>
  db.integration.findMany({ where: { websiteId }, orderBy: { provider: "asc" } }),
);

/** Everything the report generator freezes into dataJson. */
export async function buildReportSnapshot(websiteId: string) {
  const [overview, audit, issues, optimizations, opportunities, citations] = await Promise.all([
    getVisibilityOverview(websiteId),
    getLatestAudit(websiteId),
    getIssues(websiteId),
    getOptimizations(websiteId),
    getContentOpportunities(websiteId),
    getCitations(websiteId),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    visibility: {
      score: overview.summary.score,
      delta: overview.delta,
      mentionRate: overview.summary.mentionRate,
      citationRate: overview.summary.citationRate,
      avgPosition: overview.summary.avgPosition,
      queriesWon: overview.summary.queriesWon,
      queriesLost: overview.summary.queriesLost,
      promptCount: overview.promptCount,
    },
    engines: overview.engines.map((e) => ({
      key: e.key,
      name: e.name,
      score: overview.byEngine[e.key].score,
      mentionRate: overview.byEngine[e.key].mentionRate,
      citationRate: overview.byEngine[e.key].citationRate,
      delta: overview.engineDeltas[e.key],
    })),
    audit: audit
      ? {
          overallScore: audit.overallScore,
          aiUnderstanding: audit.aiUnderstanding,
          content: audit.content,
          structuredData: audit.structuredData,
          technical: audit.technical,
          entitySignals: audit.entitySignals,
          authority: audit.authority,
        }
      : null,
    competitors: overview.leaderboard.map((c) => ({
      name: c.name,
      domain: c.domain,
      isYou: c.isYou,
      score: c.summary.score,
      mentionRate: c.summary.mentionRate,
      citations: c.citations,
    })),
    topIssues: issues
      .filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS")
      .slice(0, 6)
      .map((i) => ({ id: i.id, title: i.title, severity: i.severity, impactScore: i.impactScore, category: i.category })),
    completedOptimizations: optimizations
      .filter((o) => o.status === "COMPLETED")
      .map((o) => ({ id: o.id, title: o.title, type: o.type, completedAt: o.completedAt?.toISOString() ?? null })),
    contentOpportunities: opportunities.slice(0, 6).map((o) => ({ id: o.id, title: o.title, potential: o.potential, contentType: o.contentType })),
    citations: {
      own: citations.filter((c) => c.isOwnDomain).length,
      competitor: citations.filter((c) => !c.isOwnDomain).length,
      topPages: Object.entries(
        citations
          .filter((c) => c.isOwnDomain)
          .reduce<Record<string, number>>((acc, c) => {
            const k = c.pagePath ?? c.url;
            acc[k] = (acc[k] ?? 0) + 1;
            return acc;
          }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count })),
    },
    trend: overview.trend,
  };
}

export type ReportSnapshot = Awaited<ReturnType<typeof buildReportSnapshot>>;
