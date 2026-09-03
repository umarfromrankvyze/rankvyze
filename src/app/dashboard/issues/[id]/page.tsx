import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getIssue } from "@/server/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, SeverityDot } from "@/components/ui/status-badge";
import { IssueActions } from "@/components/dashboard/issue-actions";
import { ISSUE_CATEGORY_LABELS, type IssueCategory } from "@/lib/enums";
import { formatDate, parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Issue" };

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { website } = await dashboardContext();
  const { id } = await params;
  const issue = await getIssue(website.id, id);
  if (!issue) notFound();

  const pages = parseJsonArray(issue.affectedPages);
  const activeFix = issue.optimizations.some((o) => o.codeChanges.some((c) => !["REJECTED", "MERGED"].includes(c.status)));

  return (
    <>
      <Link href="/dashboard/issues" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All issues
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityDot severity={issue.severity} />
            <Badge variant="outline">{ISSUE_CATEGORY_LABELS[issue.category as IssueCategory] ?? issue.category}</Badge>
            <StatusBadge status={issue.status} />
            <StatusBadge status={issue.severity} dot={false} />
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">{issue.title}</h1>
          <p className="mt-2 text-[13px] text-ink-faint">
            Found {formatDate(issue.createdAt)}
            {issue.audit ? ` · from the ${formatDate(issue.audit.createdAt)} audit (${issue.audit.overallScore}/100)` : ""}
            {issue.resolvedAt ? ` · resolved ${formatDate(issue.resolvedAt)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Impact</p>
            <p className="font-display text-[36px] font-bold leading-none tracking-tight text-ink">
              {issue.impactScore.toFixed(1)}
              <span className="text-[16px] font-medium text-ink-faint"> / 10</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <IssueActions websiteId={website.id} issueId={issue.id} status={issue.status} hasActiveFix={activeFix} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[14.5px] leading-relaxed text-ink">{issue.description}</p>
            </CardContent>
          </Card>

          {issue.whyItMatters && (
            <Card className="border-brand-200 bg-brand-50/40">
              <CardHeader>
                <CardTitle>Why it matters for AI visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14.5px] leading-relaxed text-ink">{issue.whyItMatters}</p>
              </CardContent>
            </Card>
          )}

          {(issue.currentImplementation || issue.recommendedImplementation) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-5 py-2.5">
                  <span className="size-2 rounded-full bg-danger" />
                  <p className="text-[12px] font-semibold text-ink">Before · current implementation</p>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[12.5px] leading-relaxed text-ink-muted scrollbar-thin">{issue.currentImplementation ?? "—"}</pre>
              </Card>
              <Card className="overflow-hidden border-green-200">
                <div className="flex items-center gap-2 border-b border-green-200 bg-success-soft px-5 py-2.5">
                  <span className="size-2 rounded-full bg-success" />
                  <p className="text-[12px] font-semibold text-green-800">After · recommended implementation</p>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[12.5px] leading-relaxed text-ink scrollbar-thin">{issue.recommendedImplementation ?? "—"}</pre>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affected pages</CardTitle>
            </CardHeader>
            <CardContent>
              {pages.length ? (
                <ul className="space-y-1.5">
                  {pages.map((p) => (
                    <li key={p}>
                      <code className="rounded bg-surface-3 px-2 py-1 font-mono text-[12px] text-ink">{p}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-ink-muted">Site-wide.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {issue.optimizations.length === 0 && <p className="text-[13px] text-ink-muted">No optimization planned yet. “Fix with AI” creates one and queues the implementation.</p>}
              {issue.optimizations.map((o) => (
                <div key={o.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-ink">{o.title}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  {o.codeChanges.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {o.codeChanges.map((c) => (
                        <li key={c.id}>
                          <Link href={`/dashboard/code-changes/${c.id}`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink">
                            <span className="font-mono text-[11px]">#{c.number}</span> {c.title} <ArrowRight className="size-3" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <Button variant="link" size="sm" asChild>
                <Link href="/dashboard/optimization">Open Optimization Center →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
