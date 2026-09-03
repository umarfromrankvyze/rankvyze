import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getIssues, getOptimizations } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, SeverityDot } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ISSUE_CATEGORY_LABELS, type IssueCategory } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Opportunities" };

interface Opp {
  id: string;
  title: string;
  impact: number;
  effort: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  severity: string;
  status: string;
  href: string;
  linked: boolean;
}

const QUADRANTS = [
  { key: "quick", title: "Quick wins", desc: "High impact, low effort — do these first.", test: (o: Opp) => o.impact >= 6.5 && o.effort === "LOW" },
  { key: "big", title: "Big bets", desc: "High impact, more effort. Plan and schedule.", test: (o: Opp) => o.impact >= 6.5 && o.effort !== "LOW" },
  { key: "fill", title: "Fill-ins", desc: "Lower impact but cheap. Batch them.", test: (o: Opp) => o.impact < 6.5 && o.effort === "LOW" },
  { key: "later", title: "Later", desc: "Lower impact and costly. Revisit after the above.", test: (o: Opp) => o.impact < 6.5 && o.effort !== "LOW" },
] as const;

export default async function OpportunitiesPage() {
  const { website } = await dashboardContext();
  const [issues, optimizations] = await Promise.all([getIssues(website.id), getOptimizations(website.id)]);

  const opps: Opp[] = issues
    .filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS")
    .map((i) => {
      const opt = optimizations.find((o) => o.issueId === i.id);
      const effort = (opt?.effort as Opp["effort"]) ?? (i.severity === "LOW" ? "LOW" : i.category === "STRUCTURED_DATA" || i.category === "ENTITY" ? "LOW" : "MEDIUM");
      return { id: i.id, title: i.title, impact: i.impactScore, effort, category: i.category, severity: i.severity, status: i.status, href: `/dashboard/issues/${i.id}`, linked: Boolean(opt) };
    })
    .sort((a, b) => b.impact - a.impact);

  const potentialLift = Math.round(opps.reduce((n, o) => n + o.impact, 0) * 1.4);

  return (
    <>
      <PageHeader
        eyebrow={website.domain}
        title="Opportunities"
        description="Open issues plotted by impact and effort, so you know what to do first."
        actions={
          <Button asChild>
            <Link href="/dashboard/optimization">
              Open Optimization Center <ArrowRight />
            </Link>
          </Button>
        }
      />

      {opps.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No open opportunities" description="Every audit issue has been addressed. The next research run will show the effect." />
      ) : (
        <>
          <Card className="mb-6 border-brand-200 bg-brand-50/40">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Estimated headroom</p>
                <p className="mt-1 font-display text-[28px] font-bold tracking-tight text-ink">
                  +{Math.min(potentialLift, 100 - 42)} <span className="text-[15px] font-medium text-ink-muted">visibility points</span>
                </p>
                <p className="mt-1 max-w-xl text-[13px] text-ink-muted">A rough estimate from the combined impact of {opps.length} open issues. Real gains are measured on the next research run.</p>
              </div>
              <div className="flex gap-6 text-center">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((e) => (
                  <div key={e}>
                    <p className="font-display text-[22px] font-bold tabular-nums text-ink">{opps.filter((o) => o.effort === e).length}</p>
                    <p className="text-[11px] uppercase tracking-wider text-ink-faint">{e.toLowerCase()} effort</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {QUADRANTS.map((q, qi) => {
              const items = opps.filter(q.test);
              return (
                <Card key={q.key} className={cn(qi === 0 && "border-brand-200 ring-4 ring-brand-500/5")}>
                  <CardHeader>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {q.title}
                        <Badge variant={qi === 0 ? "brand" : "neutral"}>{items.length}</Badge>
                      </CardTitle>
                      <CardDescription>{q.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {items.length === 0 ? (
                      <p className="border-t border-line px-5 py-5 text-[13px] text-ink-faint">Nothing in this quadrant.</p>
                    ) : (
                      <ul className="divide-y divide-line border-t border-line">
                        {items.map((o) => (
                          <li key={o.id}>
                            <Link href={o.href} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                              <SeverityDot severity={o.severity} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13.5px] font-medium text-ink">{o.title}</span>
                                <span className="block text-[11.5px] text-ink-faint">
                                  {ISSUE_CATEGORY_LABELS[o.category as IssueCategory]} · {o.effort.toLowerCase()} effort
                                  {o.linked ? " · fix planned" : ""}
                                </span>
                              </span>
                              {o.status === "IN_PROGRESS" && <StatusBadge status={o.status} />}
                              <span className="w-9 text-right font-display text-[15px] font-bold tabular-nums text-ink">{o.impact.toFixed(1)}</span>
                              <ArrowRight className="size-3.5 text-ink-faint" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
