import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, GitBranch } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getCodeChange, getIntegrations } from "@/server/queries";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeDiff } from "@/components/dashboard/code-diff";
import { CodeChangeReview } from "@/components/dashboard/code-change-review";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Code change" };

const STATUS_COPY: Record<string, string> = {
  DRAFT: "This job is being scoped. No diff has been produced yet.",
  READY_FOR_CLAUDE: "Queued for implementation. The diff will appear here for your review when it's ready — nothing touches your site until you approve.",
  GENERATING: "Implementation in progress.",
  AWAITING_REVIEW: "Review the diff below. Approving does not change your site — it lets you create a pull request your team merges.",
  APPROVED: "Approved. Create a pull request to hand it to your engineers.",
  REJECTED: "Rejected. The optimization is back in the recommended list.",
  MERGED: "A pull request was created for this change.",
};

export default async function CodeChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { website } = await dashboardContext();
  const { id } = await params;
  const [change, integrations] = await Promise.all([getCodeChange(website.id, id), getIntegrations(website.id)]);
  if (!change) notFound();
  const github = integrations.find((i) => i.provider === "GITHUB");
  const context = change.contextJson ? (JSON.parse(change.contextJson) as { pages?: string[]; websiteUrl?: string; framework?: string; constraints?: string[] }) : null;

  return (
    <>
      <Link href="/dashboard/code-changes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All code changes
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] text-ink-faint">Optimization #{change.number}</span>
            <StatusBadge status={change.status} />
          </div>
          <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">{change.title}</h1>
          {change.summary && <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">{change.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
            {change.repository && (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <GitBranch className="size-3.5" /> {change.repository}
                {change.branch ? ` · ${change.branch}` : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> Created {formatDate(change.createdAt)}
            </span>
            {change.reviewedAt && (
              <span>
                Reviewed {formatDate(change.reviewedAt)}
                {change.reviewedBy ? ` by ${change.reviewedBy.name}` : ""}
              </span>
            )}
            {(change.additions > 0 || change.deletions > 0) && (
              <span className="font-mono">
                <span className="text-green-700">+{change.additions}</span> <span className="text-red-700">−{change.deletions}</span>
              </span>
            )}
          </div>
        </div>
        <CodeChangeReview websiteId={website.id} id={change.id} status={change.status} prUrl={change.prUrl} githubConnected={github?.status === "CONNECTED"} />
      </div>

      <p className="mt-5 rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] text-ink-muted">{STATUS_COPY[change.status]}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {change.files.length ? (
            change.files.map((f) => <CodeDiff key={f.id} path={f.path} diff={f.diff} additions={f.additions} deletions={f.deletions} />)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-display text-[15px] font-semibold text-ink">No diff yet</p>
                <p className="mt-1 text-[13px] text-ink-muted">Files will appear here once the implementation is produced.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {change.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Task</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{change.instructions}</p>
              </CardContent>
            </Card>
          )}
          {change.optimization?.issue && (
            <Card>
              <CardHeader>
                <CardTitle>Fixes issue</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/issues/${change.optimization.issue.id}`} className="flex items-start justify-between gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-surface-2">
                  <span className="text-[13.5px] font-medium text-ink">{change.optimization.issue.title}</span>
                  <span className="font-display text-[15px] font-bold tabular-nums text-ink">{change.optimization.issue.impactScore.toFixed(1)}</span>
                </Link>
              </CardContent>
            </Card>
          )}
          {context && (
            <Card>
              <CardHeader>
                <CardTitle>Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                {context.websiteUrl && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Website</p>
                    <p className="text-ink">{context.websiteUrl}</p>
                  </div>
                )}
                {context.framework && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Framework</p>
                    <p className="text-ink">{context.framework}</p>
                  </div>
                )}
                {context.pages && context.pages.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Pages</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {context.pages.map((p) => (
                        <code key={p} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
                          {p}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
                {context.constraints && context.constraints.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Constraints</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink">
                      {context.constraints.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
