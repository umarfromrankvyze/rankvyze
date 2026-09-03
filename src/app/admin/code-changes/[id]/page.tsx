import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminCodeChange } from "@/server/admin-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { JobEditor, SendToClaudeButton, StatusControl } from "@/components/admin/code-change-job";
import { formatDate, parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Claude job" };

export default async function AdminCodeChangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getAdminCodeChange(id);
  if (!job) notFound();
  const github = job.website.integrations[0];
  const context = job.contextJson ? (JSON.parse(job.contextJson) as { pages?: string[]; websiteUrl?: string; framework?: string; constraints?: string[] }) : null;
  const issue = job.optimization?.issue ?? null;

  return (
    <>
      <Link href="/admin/code-changes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All jobs
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Claude Optimization Job · #{job.number}</p>
          <h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
            <StatusBadge status={job.status} />
            <span>Created {formatDate(job.createdAt)}</span>
            {job.reviewedAt && (
              <span>
                · Reviewed {formatDate(job.reviewedAt)} by {job.reviewedBy?.name ?? "customer"}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusControl id={job.id} status={job.status} />
          <SendToClaudeButton id={job.id} status={job.status} disabled={!job.instructions} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <JobEditor job={{ id: job.id, title: job.title, summary: job.summary, instructions: job.instructions, repository: job.repository, branch: job.branch, status: job.status }} files={job.files} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-[13px]">
              <p className="font-semibold text-ink">{job.website.name}</p>
              <a href={job.website.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink-muted hover:text-ink">
                {job.website.url} <ExternalLink className="size-3" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Repository</CardTitle>
                <CardDescription>Where the change would be applied.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-[13px]">
              <p className="font-mono text-ink">{job.repository ?? github?.label ?? "Not set"}</p>
              {job.branch && <p className="font-mono text-ink-muted">{job.branch}</p>}
              <div className="flex items-center gap-2">
                <span className="text-ink-faint">GitHub:</span> <StatusBadge status={github?.status ?? "NOT_CONNECTED"} />
              </div>
              {job.prUrl && (
                <a href={job.prUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink hover:underline">
                  {job.prUrl} <ExternalLink className="size-3" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Context</CardTitle>
                <CardDescription>What the agent receives alongside the task.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Website URL</p>
                <p className="text-ink">{context?.websiteUrl ?? job.website.url}</p>
              </div>
              {issue && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Audit issue</p>
                  <p className="text-ink">
                    {issue.title} <Badge variant="outline">{issue.impactScore.toFixed(1)}</Badge>
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Relevant pages</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(context?.pages?.length ? context.pages : parseJsonArray(issue?.affectedPages)).map((p) => (
                    <code key={p} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
                      {p}
                    </code>
                  ))}
                  {!context?.pages?.length && !parseJsonArray(issue?.affectedPages).length && <span className="text-ink-faint">—</span>}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Code files</p>
                {job.files.length ? (
                  <ul className="mt-1 space-y-0.5 font-mono text-[12px] text-ink">
                    {job.files.map((f) => (
                      <li key={f.id}>{f.path}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-faint">None yet</p>
                )}
              </div>
              {issue?.recommendedImplementation && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Recommended fix</p>
                  <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-2.5 font-mono text-[11.5px] text-ink scrollbar-thin">{issue.recommendedImplementation}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-brand-200 bg-brand-50/40">
            <CardContent className="p-4 text-[12.5px] leading-relaxed text-ink-muted">
              <p className="font-semibold text-ink">Future infrastructure</p>
              <p className="mt-1">
                “Send to Claude” currently queues the job. When the Claude Code integration is connected, this same job record (task, repository, files, instructions) will be dispatched automatically and the generated diff will land in “Generated changes” for review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
