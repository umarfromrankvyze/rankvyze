import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { db } from "@/lib/db";
import type { ReportSnapshot } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { ScoreRing } from "@/components/ui/score-ring";
import { EngineIcon } from "@/components/ui/engine-icon";
import { ProgressBar } from "@/components/ui/progress";
import { LogoMark } from "@/components/ui/logo";
import { SeverityDot } from "@/components/ui/status-badge";
import { AuditCategoryBars } from "@/components/dashboard/audit-score";
import { VisibilityChart } from "@/components/dashboard/charts";
import { ReportToolbar } from "@/components/dashboard/report-actions";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Report" };

// Older seed reports store a compact shape; normalise to the full snapshot.
function normalise(raw: unknown): ReportSnapshot | null {
  const d = raw as Partial<ReportSnapshot> & { visibilityScore?: number; aeoScore?: number; mentionRate?: number; citationRate?: number; avgPosition?: number | null };
  if (d.visibility) return d as ReportSnapshot;
  if (typeof d.visibilityScore === "number") {
    return {
      generatedAt: "",
      visibility: { score: d.visibilityScore, delta: 0, mentionRate: d.mentionRate ?? 0, citationRate: d.citationRate ?? 0, avgPosition: d.avgPosition ?? null, queriesWon: 0, queriesLost: 0, promptCount: 0 },
      engines: [],
      audit: typeof d.aeoScore === "number" ? { overallScore: d.aeoScore, aiUnderstanding: 0, content: 0, structuredData: 0, technical: 0, entitySignals: 0, authority: 0 } : null,
      competitors: [],
      topIssues: [],
      completedOptimizations: [],
      contentOpportunities: [],
      citations: { own: 0, competitor: 0, topPages: [] },
      trend: [],
    };
  }
  return null;
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { website, organization } = await dashboardContext();
  const { id } = await params;
  const report = await db.report.findFirst({ where: { id, websiteId: website.id } });
  if (!report) notFound();
  const data = normalise(JSON.parse(report.dataJson));
  if (!data) notFound();
  const compact = data.engines.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/reports" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="size-3.5" /> All reports
        </Link>
        <ReportToolbar websiteId={website.id} reportId={report.id} />
      </div>

      <article className="mx-auto max-w-4xl rounded-2xl border border-line bg-white p-8 shadow-card print:border-0 print:p-0 print:shadow-none md:p-12">
        <header className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-600">
              <LogoMark size={18} /> RankVyze report
            </div>
            <h1 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-tight text-ink md:text-[34px]">{report.title}</h1>
            <p className="mt-2 text-[13.5px] text-ink-muted">
              {organization.name} · {website.domain} · {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
            </p>
          </div>
          <p className="text-[12px] text-ink-faint">Generated {formatDate(report.createdAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        </header>

        {/* Headline scores */}
        <section className="grid gap-4 py-8 sm:grid-cols-2">
          <div className="flex items-center gap-5 rounded-xl border border-line p-5">
            <ScoreRing value={data.visibility.score} size={96} stroke={8} animate={false} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AI Visibility Score</p>
              <p className="mt-1 flex items-center gap-2 font-display text-[30px] font-bold leading-none text-ink">
                {data.visibility.score}
                {!compact && <Delta value={data.visibility.delta} />}
              </p>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">
                Mentioned {data.visibility.mentionRate}% · cited {data.visibility.citationRate}% · avg. position {data.visibility.avgPosition ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-xl border border-line p-5">
            <ScoreRing value={data.audit?.overallScore ?? 0} size={96} stroke={8} animate={false} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AEO Health Score</p>
              <p className="mt-1 font-display text-[30px] font-bold leading-none text-ink">{data.audit?.overallScore ?? "—"}</p>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">{data.audit && !compact ? "Six-category site audit." : "No detailed audit in this period."}</p>
            </div>
          </div>
        </section>

        {compact ? (
          <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] text-ink-muted">This report was generated with the compact format. Newer reports include engine, competitor and issue detail.</p>
        ) : (
          <>
            {data.trend.length > 1 && (
              <ReportSection title="Trend over time">
                <VisibilityChart data={data.trend} height={200} />
              </ReportSection>
            )}

            <ReportSection title="Engine performance">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.engines.map((e) => (
                  <div key={e.key} className="rounded-xl border border-line p-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                        <EngineIcon engine={e.key} size={14} /> {e.name}
                      </span>
                      <Delta value={e.delta} size="sm" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-[26px] font-bold tabular-nums text-ink">{e.score}</span>
                      <span className="text-[12px] text-ink-faint">
                        mentioned {e.mentionRate}% · cited {e.citationRate}%
                      </span>
                    </div>
                    <ProgressBar value={e.score} tone="ink" animate={false} className="mt-2" />
                  </div>
                ))}
              </div>
            </ReportSection>

            {data.audit && (
              <ReportSection title="AEO Health by category">
                <AuditCategoryBars audit={data.audit} />
              </ReportSection>
            )}

            <ReportSection title="Competitor comparison">
              <ul className="space-y-3">
                {data.competitors.map((c) => (
                  <li key={c.domain}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className={c.isYou ? "font-semibold text-brand-700" : "font-medium text-ink"}>
                        {c.name}
                        {c.isYou ? " (you)" : ""}
                      </span>
                      <span className="tabular-nums text-ink-muted">
                        {c.score} · mentioned {c.mentionRate}% · {c.citations} citations
                      </span>
                    </div>
                    <ProgressBar value={c.score} tone={c.isYou ? "brand" : "ink"} animate={false} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            </ReportSection>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <ReportSection title="Top open issues">
                <ul className="space-y-2">
                  {data.topIssues.map((i) => (
                    <li key={i.id} className="flex items-center gap-2.5 text-[13px]">
                      <SeverityDot severity={i.severity} />
                      <span className="flex-1 text-ink">{i.title}</span>
                      <span className="font-semibold tabular-nums text-ink">{i.impactScore.toFixed(1)}</span>
                    </li>
                  ))}
                  {data.topIssues.length === 0 && <li className="text-[13px] text-ink-muted">No open issues.</li>}
                </ul>
              </ReportSection>
              <ReportSection title="Completed optimizations">
                <ul className="space-y-2">
                  {data.completedOptimizations.map((o) => (
                    <li key={o.id} className="flex items-center gap-2.5 text-[13px]">
                      <span className="size-1.5 rounded-full bg-success" />
                      <span className="flex-1 text-ink">{o.title}</span>
                      <Badge variant="outline">{titleCase(o.type)}</Badge>
                    </li>
                  ))}
                  {data.completedOptimizations.length === 0 && <li className="text-[13px] text-ink-muted">Nothing completed in this period.</li>}
                </ul>
              </ReportSection>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <ReportSection title="Content opportunities">
                <ul className="space-y-2">
                  {data.contentOpportunities.map((o) => (
                    <li key={o.id} className="flex items-center gap-2.5 text-[13px]">
                      <Badge variant={o.potential === "HIGH" ? "brand" : "neutral"}>{titleCase(o.potential)}</Badge>
                      <span className="flex-1 text-ink">{o.title}</span>
                    </li>
                  ))}
                </ul>
              </ReportSection>
              <ReportSection title="Citations">
                <p className="text-[13px] text-ink">
                  <span className="font-display text-[22px] font-bold">{data.citations.own}</span> citations of your pages ·{" "}
                  <span className="font-display text-[22px] font-bold">{data.citations.competitor}</span> of competitors&apos;.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {data.citations.topPages.map((p) => (
                    <li key={p.path} className="flex items-center justify-between text-[12.5px]">
                      <code className="font-mono text-ink">{p.path}</code>
                      <span className="tabular-nums text-ink-muted">{p.count}</span>
                    </li>
                  ))}
                </ul>
              </ReportSection>
            </div>
          </>
        )}

        <footer className="mt-8 border-t border-line pt-6 text-[11.5px] text-ink-faint">
          Metrics are derived from manual research of {data.visibility.promptCount || "tracked"} prompts across four AI engines by the RankVyze team. © 2026 RankVyze.
        </footer>
      </article>
    </>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-6 border-0 shadow-none print:break-inside-avoid">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">{children}</CardContent>
    </Card>
  );
}
