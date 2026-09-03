import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getLatestAudit, getReports, getVisibilityOverview } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenerateReportButton } from "@/components/dashboard/report-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const { website } = await dashboardContext();
  const [reports, overview, audit] = await Promise.all([getReports(website.id), getVisibilityOverview(website.id), getLatestAudit(website.id)]);

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Reports" description="Board-ready snapshots of AI visibility, AEO health, competitors and completed work." actions={<GenerateReportButton websiteId={website.id} />} />

      <Card className="mb-6">
        <CardHeader>
          <div>
            <CardTitle>What a report includes</CardTitle>
            <CardDescription>Generated from live data and frozen at that moment, so past reports never change.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-6 gap-y-2 text-[13.5px] text-ink sm:grid-cols-2 lg:grid-cols-3">
            {["AI Visibility Score and trend", "AEO Health Score by category", "Engine performance", "Competitor comparison", "Top open issues", "Completed optimizations", "Content opportunities", "Citations and most-cited pages"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand-500" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-ink-faint">
            Current: AI Visibility {overview.summary.score} · AEO Health {audit?.overallScore ?? "—"} · {overview.promptCount} prompts tracked.
          </p>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <EmptyState icon={FileText} title="No reports yet" description="Generate your first report to share progress with your team." action={<GenerateReportButton websiteId={website.id} />} />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          {reports.map((r) => {
            const data = JSON.parse(r.dataJson) as { visibility?: { score?: number }; visibilityScore?: number; audit?: { overallScore?: number }; aeoScore?: number };
            const vis = data.visibility?.score ?? data.visibilityScore;
            const aeo = data.audit?.overallScore ?? data.aeoScore;
            return (
              <li key={r.id}>
                <Link href={`/dashboard/reports/${r.id}`} className="flex items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-surface-2">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
                    <FileText className="size-4 text-ink-muted" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink">{r.title}</span>
                      <StatusBadge status={r.status} />
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-muted">
                      {formatDate(r.periodStart)} – {formatDate(r.periodEnd)} · generated {formatDate(r.createdAt)}
                    </span>
                  </span>
                  <span className="hidden items-center gap-6 sm:flex">
                    <span className="text-center">
                      <span className="block font-display text-[18px] font-bold tabular-nums text-ink">{vis ?? "—"}</span>
                      <span className="text-[10.5px] uppercase tracking-wider text-ink-faint">Visibility</span>
                    </span>
                    <span className="text-center">
                      <span className="block font-display text-[18px] font-bold tabular-nums text-ink">{aeo ?? "—"}</span>
                      <span className="text-[10.5px] uppercase tracking-wider text-ink-faint">AEO</span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-ink-faint" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
