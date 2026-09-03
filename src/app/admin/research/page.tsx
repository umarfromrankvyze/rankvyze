import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { getResearchSessions, getWebsiteOptions } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NewSessionDialog } from "@/components/admin/new-session-dialog";
import { formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Research" };

type SessionRow = Awaited<ReturnType<typeof getResearchSessions>>[number];

function List({ rows }: { rows: SessionRow[] }) {
  return (
  <ul className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
    {rows.map((s) => (
      <li key={s.id}>
        <Link href={`/admin/research/${s.id}`} className="flex items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-surface-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
            <FlaskConical className="size-4 text-ink-muted" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-semibold text-ink">{s.title}</span>
              <StatusBadge status={s.status} />
            </span>
            <span className="mt-0.5 block text-[12.5px] text-ink-muted">
              {s.website.name} · {s.website.domain} · {s.owner?.name ?? "Unassigned"} · started {formatDate(s.startedAt)}
              {s.completedAt ? ` · completed ${formatRelative(s.completedAt)}` : ""}
            </span>
          </span>
          <span className="text-center">
            <span className="block font-display text-[18px] font-bold tabular-nums text-ink">{s._count.results}</span>
            <span className="text-[10.5px] uppercase tracking-wider text-ink-faint">results</span>
          </span>
          <ArrowRight className="size-4 text-ink-faint" />
        </Link>
      </li>
    ))}
  </ul>
  );
}

export default async function AdminResearchPage() {
  const [sessions, websites] = await Promise.all([getResearchSessions(), getWebsiteOptions()]);
  const active = sessions.filter((s) => s.status === "IN_PROGRESS");
  const done = sessions.filter((s) => s.status !== "IN_PROGRESS");

  return (
    <>
      <PageHeader eyebrow="Internal" title="AI Research" description="Manual research sessions. Each result you enter feeds the customer's visibility metrics directly." actions={<NewSessionDialog websites={websites} />} />

      <Card className="mb-6 border-brand-200 bg-brand-50/40">
        <CardContent className="p-5 text-[13.5px] leading-relaxed text-ink">
          <p className="font-semibold">Why this is manual</p>
          <p className="mt-1 text-ink-muted">
            V1 has no engine APIs. Researchers check each prompt by hand and record exactly what the engine said. The data model is source-agnostic (<code className="rounded bg-white px-1 font-mono text-[12px]">source = MANUAL | API</code>), so an API integration later writes the same rows and every metric keeps working.
          </p>
        </CardContent>
      </Card>

      {sessions.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No research sessions" description="Create a session for a website to start entering results." action={<NewSessionDialog websites={websites} />} />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-[15px] font-semibold text-ink">In progress ({active.length})</h2>
              <List rows={active} />
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-[15px] font-semibold text-ink">Completed ({done.length})</h2>
              <List rows={done} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
