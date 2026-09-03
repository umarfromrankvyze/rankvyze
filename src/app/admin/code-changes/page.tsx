import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { getAdminCodeChanges, getAdminOptimizations, getWebsiteOptions } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NewJobDialog } from "@/components/admin/new-job-dialog";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Code Changes" };

const ORDER = ["READY_FOR_CLAUDE", "GENERATING", "DRAFT", "AWAITING_REVIEW", "APPROVED", "REJECTED", "MERGED"];

export default async function AdminCodeChangesPage() {
  const [changes, websites, optimizations] = await Promise.all([getAdminCodeChanges(), getWebsiteOptions(), getAdminOptimizations()]);
  const sorted = [...changes].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));

  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Code Changes"
        description="Claude optimization jobs across all customers. Jobs marked “Ready for Claude” are waiting for an implementation."
        actions={<NewJobDialog websites={websites} optimizations={optimizations.map((o) => ({ id: o.id, websiteId: o.websiteId, title: `${o.website.name} · ${o.title}` }))} />}
      />
      {sorted.length === 0 ? (
        <EmptyState icon={Code2} title="No jobs yet" description="Create a job or ask a customer to request a fix." />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          {sorted.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/code-changes/${c.id}`} className="flex items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-surface-2">
                <span className="w-14 shrink-0 font-mono text-[12px] text-ink-faint">#{c.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-ink">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-ink-muted">
                    {c.website.name} · {c.website.domain}
                    {c.repository ? ` · ${c.repository}` : ""} · {c.files.length} file{c.files.length === 1 ? "" : "s"} · {formatRelative(c.createdAt)}
                  </span>
                </span>
                <ArrowRight className="size-4 text-ink-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
