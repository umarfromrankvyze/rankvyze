import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getAuditHistory, getIssues } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/dashboard/score-card";
import { AuditCategoryBars, AuditCategoryRings } from "@/components/dashboard/audit-score";
import { IssueCard } from "@/components/dashboard/issue-card";
import { AUDIT_CATEGORY_KEYS, AUDIT_CATEGORY_LABELS, AUDIT_CATEGORY_TO_ISSUE_CATEGORY } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { percentChange } from "@/lib/metrics";

export const metadata: Metadata = { title: "AEO Audit" };

export default async function AuditPage() {
  const { website } = await dashboardContext();
  const [history, issues] = await Promise.all([getAuditHistory(website.id), getIssues(website.id)]);
  const audit = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  if (!audit) {
    return (
      <>
        <PageHeader eyebrow={website.domain} title="AEO Audit" description="How well AI engines can understand and trust your website." />
        <EmptyState icon={BarChart3} title="Your first audit is being prepared" description="An AEO specialist reviews your site across six categories. This usually completes within a few days of onboarding." />
      </>
    );
  }

  const open = issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS");
  const weakest = [...AUDIT_CATEGORY_KEYS].sort((a, b) => audit[a] - audit[b]).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={website.domain}
        title="AEO Audit"
        description={`Published ${formatDate(audit.createdAt)}. ${audit.summary ?? ""}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/issues">
              View all issues <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ScoreCard
          label="AEO Health"
          score={audit.overallScore}
          delta={previous ? percentChange(audit.overallScore, previous.overallScore) : undefined}
          deltaLabel={previous ? `since the ${formatDate(previous.createdAt)} audit.` : undefined}
          description={!previous ? "First audit — the baseline every future audit is compared against." : undefined}
        />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Where to focus</CardTitle>
              <CardDescription>Your three weakest categories.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {weakest.map((key) => {
              const count = open.filter((i) => i.category === AUDIT_CATEGORY_TO_ISSUE_CATEGORY[key]).length;
              return (
                <Link key={key} href={`/dashboard/issues?category=${AUDIT_CATEGORY_TO_ISSUE_CATEGORY[key]}`} className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 transition-colors hover:border-ink/25 hover:bg-surface-2">
                  <span className="text-[13.5px] font-medium text-ink">{AUDIT_CATEGORY_LABELS[key]}</span>
                  <span className="flex items-center gap-2">
                    <Badge variant={count ? "warning" : "neutral"}>{count} open</Badge>
                    <span className="font-display text-[16px] font-bold tabular-nums text-ink">{audit[key]}</span>
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-[15px] font-semibold text-ink">Category scores</h2>
        <AuditCategoryRings audit={audit} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Score breakdown</CardTitle>
              <CardDescription>{previous ? "Change since the previous audit shown in green/red." : "Six categories, scored 0–100."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AuditCategoryBars audit={audit} previous={previous} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Audit history</CardTitle>
              <CardDescription>Every published audit for this website.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-line border-t border-line">
              {[...history].reverse().map((a, i) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="font-display text-[20px] font-bold tabular-nums text-ink">{a.overallScore}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{formatDate(a.createdAt)}</p>
                    <p className="truncate text-[12px] text-ink-muted">{a.summary ?? "—"}</p>
                  </div>
                  {i === 0 && <Badge variant="brand">Latest</Badge>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Highest-impact issues</h2>
            <p className="text-[13px] text-ink-muted">{open.length} open issues from this audit.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/issues">
              View AEO issues <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="space-y-3">
          {open.slice(0, 4).map((issue) => (
            <IssueCard key={issue.id} issue={issue} compact />
          ))}
        </div>
      </section>
    </>
  );
}
