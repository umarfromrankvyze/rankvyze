import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquareText, Quote, Radar, Trophy } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getIssues, getVisibilityOverview } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreCard, StatTile } from "@/components/dashboard/score-card";
import { EngineCard } from "@/components/dashboard/engine-card";
import { CompetitorBarChart, VisibilityChart } from "@/components/dashboard/charts";
import { IssueCard } from "@/components/dashboard/issue-card";
import { ResearchNotice } from "@/components/dashboard/research-notice";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { website } = await dashboardContext();
  const [overview, issues] = await Promise.all([getVisibilityOverview(website.id), getIssues(website.id)]);
  const topIssues = issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS").slice(0, 5);

  if (!overview.hasResearch) {
    return (
      <>
        <PageHeader eyebrow={website.domain} title="Overview" description="Your AI visibility research is being set up." />
        <EmptyState
          icon={Radar}
          title="Research in progress"
          description={`The RankVyze team is checking your ${overview.promptCount} tracked prompts across ${overview.engines.length} AI engines. Results usually appear within a few days of onboarding.`}
          action={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/prompts">Review prompts</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/audit">View AEO audit</Link>
              </Button>
            </div>
          }
        />
      </>
    );
  }

  const { summary } = overview;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Overview" description={`How AI engines see ${website.name} right now.`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr_1fr]">
        <ScoreCard label="AI Visibility Score" score={summary.score} delta={overview.delta} deltaLabel="Compared with the previous period." className="lg:row-span-2" />
        <StatTile
          label="AI Mentions"
          value={
            <>
              {overview.promptsMentioned}
              <span className="text-[15px] font-medium text-ink-faint"> / {overview.promptCount}</span>
            </>
          }
          sub="tracked prompts where you're named on at least one engine"
          icon={MessageSquareText}
        />
        <StatTile label="AI Citations" value={overview.ownCitations} sub={`${overview.competitorCitations} competitor citations in the same answers`} icon={Quote} />
        <StatTile
          label="Queries Won"
          value={
            <>
              {summary.queriesWon}
              <span className="text-[15px] font-medium text-ink-faint"> / {summary.checks}</span>
            </>
          }
          sub="checks where you're in the top 3 recommendations"
          icon={Trophy}
        />
        <StatTile label="Avg. position" value={summary.avgPosition ?? "—"} sub="when mentioned, across all engines" />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold text-ink">Engine Visibility</h2>
          <Link href="/dashboard/visibility" className="text-[13px] font-medium text-ink-muted hover:text-ink">
            Full breakdown →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.engines.map((e) => (
            <EngineCard key={e.key} engineKey={e.key} name={e.name} summary={overview.byEngine[e.key]} delta={overview.engineDeltas[e.key]} href={`/dashboard/visibility?engine=${e.key}`} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Visibility trend</CardTitle>
              <CardDescription>Weekly AI Visibility score, last 12 weeks.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <VisibilityChart data={overview.trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Competitor position</CardTitle>
              <CardDescription>AI Visibility across the same prompts.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CompetitorBarChart data={overview.leaderboard.map((c) => ({ name: c.isYou ? `${c.name} (you)` : c.name, score: c.summary.score, isYou: c.isYou }))} />
            <Link href="/dashboard/competitors" className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-ink">
              Compare in detail <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Recent Opportunities</h2>
            <p className="text-[13px] text-ink-muted">The five highest-impact AEO issues holding your visibility back.</p>
          </div>
          <Link href="/dashboard/issues" className="text-[13px] font-medium text-ink-muted hover:text-ink">
            All issues →
          </Link>
        </div>
        {topIssues.length ? (
          <div className="space-y-3">
            {topIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} compact />
            ))}
          </div>
        ) : (
          <EmptyState compact title="No open issues" description="Your latest audit didn't flag anything — or everything's been fixed." />
        )}
      </section>

      <div className="mt-8">
        <ResearchNotice lastCheckedAt={overview.lastCheckedAt} checks={summary.checks} />
      </div>
    </>
  );
}
