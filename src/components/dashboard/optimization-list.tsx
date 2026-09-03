"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle, CircleDot, Eye, Sparkles, Wrench, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, titleCase } from "@/lib/utils";
import { requestFix, setOptimizationStatus } from "@/server/actions/workspace";

export interface OptimizationRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  impactScore: number;
  effort: string;
  issue: { id: string; title: string; severity: string } | null;
  codeChanges: { id: string; number: number; status: string }[];
}

const GROUPS = [
  { key: "todo", label: "Recommended", statuses: ["SUGGESTED"] },
  { key: "doing", label: "In progress", statuses: ["APPROVED", "IN_PROGRESS"] },
  { key: "done", label: "Completed", statuses: ["COMPLETED"] },
  { key: "rejected", label: "Rejected", statuses: ["REJECTED"] },
] as const;

export function OptimizationList({ websiteId, items }: { websiteId: string; items: OptimizationRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();

  const fix = (o: OptimizationRow) => {
    setBusy(o.id);
    start(async () => {
      const r = await requestFix(websiteId, o.id);
      setBusy(null);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message);
      if (r.data?.codeChangeId) router.push(`/dashboard/code-changes/${r.data.codeChangeId}`);
    });
  };

  const setStatus = (o: OptimizationRow, status: "COMPLETED" | "REJECTED" | "SUGGESTED") => {
    setBusy(o.id);
    start(async () => {
      const r = await setOptimizationStatus(websiteId, o.id, status);
      setBusy(null);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
    });
  };

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);
  const types = Array.from(new Set(items.map((i) => i.type)));

  if (items.length === 0) {
    return <EmptyState icon={Wrench} title="No optimizations yet" description="Recommendations are generated from your AEO audit. Ask for a fix from any issue to start one." />;
  }

  return (
    <>
      <div className="mb-5 flex items-center gap-1 overflow-x-auto rounded-lg bg-surface-3 p-1 scrollbar-thin">
        {["all", ...types].map((t) => (
          <button key={t} type="button" onClick={() => setFilter(t)} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", filter === t ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink")}>
            {t === "all" ? "All types" : titleCase(t)}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {GROUPS.map((g) => {
          const rows = visible.filter((i) => (g.statuses as readonly string[]).includes(i.status));
          if (!rows.length) return null;
          return (
            <section key={g.key}>
              <h2 className="mb-2 font-display text-[15px] font-semibold text-ink">
                {g.label} <span className="text-[13px] font-normal text-ink-faint">({rows.length})</span>
              </h2>
              <ul className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
                {rows.map((o) => {
                  const activeChange = o.codeChanges.find((c) => !["REJECTED", "MERGED"].includes(c.status));
                  const done = o.status === "COMPLETED";
                  const Icon = done ? Check : o.status === "IN_PROGRESS" || o.status === "APPROVED" ? CircleDot : o.status === "REJECTED" ? XCircle : Circle;
                  return (
                    <li key={o.id} className="flex flex-col gap-3 border-b border-line p-4 last:border-0 md:flex-row md:items-center">
                      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border", done ? "border-green-200 bg-success-soft text-green-700" : o.status === "REJECTED" ? "border-line bg-surface-3 text-ink-faint" : "border-line bg-white text-ink-faint")}>
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={cn("text-[14px] font-semibold", done ? "text-ink-muted line-through decoration-line-strong" : "text-ink")}>{o.title}</p>
                          <Badge variant="outline">{titleCase(o.type)}</Badge>
                          <StatusBadge status={o.status} />
                        </div>
                        {o.description && <p className="mt-1 line-clamp-1 text-[13px] text-ink-muted">{o.description}</p>}
                        <p className="mt-1 text-[11.5px] text-ink-faint">
                          Impact {o.impactScore.toFixed(1)} · {o.effort.toLowerCase()} effort
                          {o.issue && (
                            <>
                              {" · from "}
                              <Link href={`/dashboard/issues/${o.issue.id}`} className="underline-offset-2 hover:text-ink hover:underline">
                                {o.issue.title}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {activeChange ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/code-changes/${activeChange.id}`}>
                              <Eye /> Review #{activeChange.number}
                            </Link>
                          </Button>
                        ) : o.issue ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/issues/${o.issue.id}`}>
                              <Eye /> Review
                            </Link>
                          </Button>
                        ) : null}
                        {!done && o.status !== "REJECTED" && !activeChange && (
                          <Button size="sm" onClick={() => fix(o)} loading={busy === o.id}>
                            <Sparkles /> Fix with AI
                          </Button>
                        )}
                        {!done && o.status !== "REJECTED" && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(o, "COMPLETED")} disabled={busy === o.id} title="Mark done">
                            <Check />
                          </Button>
                        )}
                        {o.status === "SUGGESTED" && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(o, "REJECTED")} disabled={busy === o.id} title="Reject">
                            <XCircle />
                          </Button>
                        )}
                        {o.status === "REJECTED" && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(o, "SUGGESTED")} disabled={busy === o.id}>
                            Restore
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
