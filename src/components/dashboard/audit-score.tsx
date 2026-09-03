import { ProgressBar } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import { AUDIT_CATEGORY_KEYS, AUDIT_CATEGORY_LABELS, type AuditCategoryKey } from "@/lib/enums";
import { cn } from "@/lib/utils";

export interface AuditLike {
  overallScore: number;
  aiUnderstanding: number;
  content: number;
  structuredData: number;
  technical: number;
  entitySignals: number;
  authority: number;
}

export function AuditCategoryBars({ audit, previous, className, size = "md" }: { audit: AuditLike; previous?: AuditLike | null; className?: string; size?: "sm" | "md" }) {
  return (
    <ul className={cn("space-y-3.5", className)}>
      {AUDIT_CATEGORY_KEYS.map((key: AuditCategoryKey) => {
        const value = audit[key];
        const prev = previous?.[key];
        const diff = prev !== undefined ? value - prev : null;
        return (
          <li key={key}>
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-ink">{AUDIT_CATEGORY_LABELS[key]}</span>
              <span className="flex items-center gap-2">
                {diff !== null && diff !== 0 && (
                  <span className={cn("text-[11px] font-medium tabular-nums", diff > 0 ? "text-green-700" : "text-red-700")}>
                    {diff > 0 ? "+" : ""}
                    {diff}
                  </span>
                )}
                <span className="w-7 text-right font-semibold tabular-nums text-ink">{value}</span>
              </span>
            </div>
            <ProgressBar value={value} tone="auto" size={size === "sm" ? "xs" : "sm"} className="mt-1.5" />
          </li>
        );
      })}
    </ul>
  );
}

export function AuditCategoryRings({ audit }: { audit: AuditLike }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {AUDIT_CATEGORY_KEYS.map((key) => (
        <div key={key} className="flex flex-col items-center rounded-xl border border-line bg-white p-4 text-center shadow-card">
          <ScoreRing value={audit[key]} size={72} stroke={6} />
          <p className="mt-2.5 text-[12px] font-medium leading-tight text-ink">{AUDIT_CATEGORY_LABELS[key]}</p>
        </div>
      ))}
    </div>
  );
}
