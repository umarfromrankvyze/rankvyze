import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getVisibilityOverview } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorBarChart } from "@/components/dashboard/charts";
import { CompetitorTable } from "@/components/dashboard/competitor-table";
import { ResearchNotice } from "@/components/dashboard/research-notice";

export const metadata: Metadata = { title: "Competitors" };

export default async function CompetitorsPage() {
  const { website } = await dashboardContext();
  const overview = await getVisibilityOverview(website.id);
  const you = overview.leaderboard.find((c) => c.isYou);
  const leader = overview.leaderboard[0];
  const yourRank = overview.leaderboard.findIndex((c) => c.isYou) + 1;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Competitors" description="Who AI engines recommend instead of you — measured on the exact same prompts." />

      {overview.hasResearch && (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>AI Visibility ranking</CardTitle>
                <CardDescription>
                  You rank #{yourRank} of {overview.leaderboard.length}.
                  {leader && !leader.isYou && you ? ` ${leader.name} leads by ${leader.summary.score - you.summary.score} points.` : " You're in front."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <CompetitorBarChart data={overview.leaderboard.map((c) => ({ name: c.isYou ? `${c.name} (you)` : c.name, score: c.summary.score, isYou: c.isYou }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Why they win</CardTitle>
                <CardDescription>What the research shows about the current leader.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {leader && you && !leader.isYou ? (
                <ul className="space-y-3 text-[13.5px] leading-relaxed text-ink">
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>
                      <strong>{leader.name}</strong> is mentioned in <strong>{leader.summary.mentionRate}%</strong> of checks vs. your <strong>{you.summary.mentionRate}%</strong>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>
                      Their pages were cited <strong>{leader.citations}</strong> times — yours <strong>{you.citations}</strong>. Citations follow comparison and guide content.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>
                      Average position when named: <strong>{leader.summary.avgPosition ?? "—"}</strong> vs. your <strong>{you.summary.avgPosition ?? "—"}</strong>. Entity clarity moves this number.
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-[13.5px] text-ink-muted">You lead the tracked set. Keep an eye on citation share — it&apos;s the earliest signal of a challenger.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CompetitorTable websiteId={website.id} rows={overview.leaderboard} engines={overview.engines.map((e) => ({ key: e.key, name: e.name }))} />

      <div className="mt-8">
        <ResearchNotice lastCheckedAt={overview.lastCheckedAt} checks={overview.summary.checks} />
      </div>
    </>
  );
}
