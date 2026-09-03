import type { Metadata } from "next";
import Link from "next/link";
import { Radar } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getVisibilityOverview } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EngineIcon, engineMeta } from "@/components/ui/engine-icon";
import { ScoreCard, StatTile } from "@/components/dashboard/score-card";
import { EngineCard } from "@/components/dashboard/engine-card";
import { EngineTrendChart, RateChart, VisibilityChart } from "@/components/dashboard/charts";
import { ResearchNotice } from "@/components/dashboard/research-notice";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Visibility" };

export default async function VisibilityPage({ searchParams }: { searchParams: Promise<{ engine?: string }> }) {
  const { website } = await dashboardContext();
  const { engine: engineParam } = await searchParams;
  const overview = await getVisibilityOverview(website.id);
  const tabs = [{ key: "overview", name: "Overview" }, ...overview.engines.map((e) => ({ key: e.key, name: e.name }))];
  const active = tabs.some((t) => t.key === engineParam) ? engineParam! : "overview";

  if (!overview.hasResearch) {
    return (
      <>
        <PageHeader eyebrow={website.domain} title="AI Visibility" description="Detailed analytics per AI engine." />
        <EmptyState icon={Radar} title="No research results yet" description="Once the RankVyze team completes the first research run, per-engine analytics appear here." />
      </>
    );
  }

  const summary = active === "overview" ? overview.summary : overview.byEngine[active];
  const delta = active === "overview" ? overview.delta : overview.engineDeltas[active];
  const rows = active === "overview" ? overview.latest : overview.latest.filter((r) => r.engineKey === active);
  const won = rows.filter((r) => r.mentioned && r.position !== null && r.position <= 3);
  const lost = rows.filter((r) => !r.mentioned);

  return (
    <>
      <PageHeader eyebrow={website.domain} title="AI Visibility" description="How often, and how prominently, AI engines recommend you for the questions your buyers ask." />

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-thin" aria-label="Engines">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "overview" ? "/dashboard/visibility" : `/dashboard/visibility?engine=${t.key}`}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active === t.key ? "border-brand-500 text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t.key !== "overview" && <EngineIcon engine={t.key} size={14} />}
            {t.name}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_repeat(2,1fr)]">
        <ScoreCard
          label={active === "overview" ? "AI Visibility Score" : `${engineMeta(active).name} visibility`}
          score={summary.score}
          delta={delta}
          className="lg:row-span-2"
        />
        <StatTile label="Mention rate" value={`${summary.mentionRate}%`} sub={`${summary.mentioned} of ${summary.checks} checks`} />
        <StatTile label="Average position" value={summary.avgPosition ?? "—"} sub="when mentioned; 1 = named first" />
        <StatTile label="Citation rate" value={`${summary.citationRate}%`} sub={`${summary.cited} answers linked to your pages`} />
        <StatTile
          label="Queries won / lost"
          value={
            <>
              <span className="text-green-700">{summary.queriesWon}</span>
              <span className="text-ink-faint"> / </span>
              <span className="text-red-700">{summary.queriesLost}</span>
            </>
          }
          sub="won = top-3 mention · lost = not mentioned"
        />
      </div>

      {active === "overview" ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overview.engines.map((e) => (
              <EngineCard key={e.key} engineKey={e.key} name={e.name} summary={overview.byEngine[e.key]} delta={overview.engineDeltas[e.key]} href={`/dashboard/visibility?engine=${e.key}`} compact />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Overall trend</CardTitle>
                  <CardDescription>Composite score, weekly.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <VisibilityChart data={overview.trend} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>By engine</CardTitle>
                  <CardDescription>Which engines are improving fastest.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <EngineTrendChart series={overview.engineTrends} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{engineMeta(active).name} score trend</CardTitle>
                <CardDescription>Weekly composite for this engine.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <VisibilityChart data={overview.engineTrends[active] ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Mention &amp; citation rate</CardTitle>
                <CardDescription>Share of tracked prompts where you appear.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <RateChart data={overview.engineTrends[active] ?? []} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queries won</CardTitle>
              <CardDescription>Top-3 recommendation{active === "overview" ? " on any engine" : ""}.</CardDescription>
            </div>
            <Badge variant="success">{won.length}</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {won.length ? (
              <ul className="divide-y divide-line border-t border-line">
                {won.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                    <EngineIcon engine={r.engineKey} size={14} />
                    <span className="min-w-0 flex-1 truncate text-ink">{r.promptText}</span>
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">#{r.position}</span>
                    {r.cited && <span className="text-[11px] text-ink-faint">cited</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-line px-5 py-6 text-[13px] text-ink-muted">Nothing won yet — the optimization plan is built to change that.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queries lost</CardTitle>
              <CardDescription>Prompts where you weren&apos;t mentioned at all.</CardDescription>
            </div>
            <Badge variant="danger">{lost.length}</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-line border-t border-line">
              {lost.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                  <EngineIcon engine={r.engineKey} size={14} />
                  <span className="min-w-0 flex-1 truncate text-ink">{r.promptText}</span>
                  <span className="truncate text-[11px] text-ink-faint">{r.rivals[0] ? `${r.rivals[0].name} instead` : formatDate(r.checkedAt)}</span>
                </li>
              ))}
            </ul>
            {lost.length > 8 && (
              <div className="border-t border-line px-5 py-3">
                <Button variant="link" size="sm" asChild>
                  <Link href="/dashboard/prompts">See all {lost.length} in Prompts →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <ResearchNotice lastCheckedAt={overview.lastCheckedAt} checks={overview.summary.checks} />
      </div>
    </>
  );
}
