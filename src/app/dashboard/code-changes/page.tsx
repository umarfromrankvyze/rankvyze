import type { Metadata } from "next";
import Link from "next/link";
import { Code2, GitPullRequest } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getCodeChanges, getIntegrations } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Code Changes" };

type CodeChangeRow = Awaited<ReturnType<typeof getCodeChanges>>[number];

function Group({ title, rows }: { title: string; rows: CodeChangeRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 font-display text-[15px] font-semibold text-ink">
        {title} <span className="text-[13px] font-normal text-ink-faint">({rows.length})</span>
      </h2>
      <ul className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        {rows.map((c) => (
          <li key={c.id}>
            <Link href={`/dashboard/code-changes/${c.id}`} className="flex items-start gap-4 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-surface-2">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
                {c.prUrl ? <GitPullRequest className="size-4 text-ink-muted" /> : <Code2 className="size-4 text-ink-muted" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] text-ink-faint">#{c.number}</span>
                  <span className="text-[14px] font-semibold text-ink">{c.title}</span>
                  <StatusBadge status={c.status} />
                </span>
                {c.summary && <span className="mt-1 block line-clamp-1 text-[13px] text-ink-muted">{c.summary}</span>}
                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-faint">
                  <span>{formatRelative(c.createdAt)}</span>
                  {c.repository && <span className="font-mono">{c.repository}</span>}
                  {c.branch && <span className="font-mono">{c.branch}</span>}
                  <span>
                    {c.files.length} file{c.files.length === 1 ? "" : "s"}
                  </span>
                  {(c.additions > 0 || c.deletions > 0) && (
                    <span className="font-mono">
                      <span className="text-green-700">+{c.additions}</span> <span className="text-red-700">−{c.deletions}</span>
                    </span>
                  )}
                  {c.optimization && <span>· {c.optimization.title}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function CodeChangesPage() {
  const { website } = await dashboardContext();
  const [changes, integrations] = await Promise.all([getCodeChanges(website.id), getIntegrations(website.id)]);
  const github = integrations.find((i) => i.provider === "GITHUB");
  const awaiting = changes.filter((c) => c.status === "AWAITING_REVIEW");
  const queued = changes.filter((c) => c.status === "READY_FOR_CLAUDE" || c.status === "GENERATING" || c.status === "DRAFT");
  const done = changes.filter((c) => c.status === "APPROVED" || c.status === "MERGED" || c.status === "REJECTED");

  return (
    <>
      <PageHeader
        eyebrow={website.domain}
        title="Code Changes"
        description="Implementation jobs for your optimizations. Each one is a reviewable diff — approve it to create a pull request."
        actions={
          github?.status === "CONNECTED" ? (
            <Badge variant="success" dot>
              GitHub connected · {github.label}
            </Badge>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings?tab=connections">Connect GitHub</Link>
            </Button>
          )
        }
      />

      {changes.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No code changes yet"
          description="Ask for a fix from any issue or optimization and it will appear here as a reviewable change."
          action={
            <Button asChild>
              <Link href="/dashboard/optimization">Open Optimization Center</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <Group title="Awaiting your review" rows={awaiting} />
          <Group title="Queued for implementation" rows={queued} />
          <Group title="Reviewed" rows={done} />
        </div>
      )}
    </>
  );
}
