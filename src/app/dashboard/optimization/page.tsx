import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getOptimizations } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/score-card";
import { OptimizationList } from "@/components/dashboard/optimization-list";
import { ProgressBar } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Optimization" };

export default async function OptimizationPage() {
  const { website } = await dashboardContext();
  const items = await getOptimizations(website.id);
  const completed = items.filter((i) => i.status === "COMPLETED").length;
  const inProgress = items.filter((i) => i.status === "IN_PROGRESS" || i.status === "APPROVED").length;
  const suggested = items.filter((i) => i.status === "SUGGESTED").length;
  const total = items.filter((i) => i.status !== "REJECTED").length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="AI Optimization Center" description="Every recommended fix in one place. Review it, ask for an AI-assisted implementation, or mark it done yourself." />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Plan progress</p>
            <span className="text-[12px] font-medium text-ink-muted">
              {completed} of {total}
            </span>
          </div>
          <p className="mt-3 font-display text-[28px] font-bold leading-none tracking-tight text-ink">{pct}%</p>
          <ProgressBar value={pct} tone="brand" size="md" className="mt-3" />
          <CardContent className="mt-3 p-0 text-[12.5px] text-ink-muted">Completed fixes are verified on the next audit and research run.</CardContent>
        </Card>
        <StatTile label="Recommended" value={suggested} sub="ready to start" />
        <StatTile label="In progress" value={inProgress} sub="being implemented or reviewed" />
        <StatTile label="Completed" value={completed} sub="shipped" />
      </div>

      <OptimizationList websiteId={website.id} items={items} />
    </>
  );
}
