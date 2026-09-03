"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { IssueCard, type IssueCardData } from "@/components/dashboard/issue-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_LABELS, ISSUE_STATUSES } from "@/lib/enums";
import { cn, titleCase } from "@/lib/utils";

const GROUPS = [
  { key: "high", label: "High impact", severities: ["CRITICAL", "HIGH"], tone: "bg-danger" },
  { key: "medium", label: "Medium impact", severities: ["MEDIUM"], tone: "bg-warning" },
  { key: "low", label: "Low impact", severities: ["LOW"], tone: "bg-ink-faint" },
] as const;

export function IssuesList({ issues, initialCategory }: { issues: IssueCardData[]; initialCategory?: string }) {
  const [status, setStatus] = useState<string>("active");
  const [category, setCategory] = useState<string>(initialCategory && ISSUE_CATEGORIES.includes(initialCategory as never) ? initialCategory : "all");

  const filtered = useMemo(
    () =>
      issues.filter(
        (i) =>
          (status === "all" || (status === "active" ? i.status === "OPEN" || i.status === "IN_PROGRESS" : i.status === status)) &&
          (category === "all" || i.category === category),
      ),
    [issues, status, category],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-surface-3 p-1 scrollbar-thin">
          {[
            ["active", "Active"],
            ["all", "All"],
            ...ISSUE_STATUSES.map((s) => [s, titleCase(s)]),
          ].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setStatus(k)} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", status === k ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink")}>
              {label}
            </button>
          ))}
        </div>
        <div className="w-full sm:ml-auto sm:w-56">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9">
            <option value="all">All categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {ISSUE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing here" description={issues.length ? "No issues match these filters." : "Your audit hasn't flagged any issues yet."} />
      ) : (
        <div className="space-y-8">
          {GROUPS.map((g) => {
            const items = filtered.filter((i) => (g.severities as readonly string[]).includes(i.severity));
            if (!items.length) return null;
            return (
              <section key={g.key}>
                <h2 className="mb-3 flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                  <span className={cn("size-2.5 rounded-full", g.tone)} />
                  {g.label}
                  <span className="text-[13px] font-normal text-ink-faint">({items.length})</span>
                </h2>
                <div className="space-y-3">
                  {items.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
