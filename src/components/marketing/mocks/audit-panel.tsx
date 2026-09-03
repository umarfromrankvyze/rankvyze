import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "AI Understanding", value: 82 },
  { label: "Content", value: 61 },
  { label: "Structured Data", value: 54 },
  { label: "Technical Accessibility", value: 73 },
  { label: "Entity Signals", value: 49 },
  { label: "Authority", value: 43 },
];

const ISSUES = [
  { title: "Weak entity definition", impact: 9.4, severity: "high" },
  { title: "Missing comparison content", impact: 8.7, severity: "high" },
  { title: "Poor structured data", impact: 7.2, severity: "medium" },
  { title: "Weak topical coverage", impact: 6.5, severity: "medium" },
];

function tone(v: number) {
  if (v >= 70) return "bg-success";
  if (v >= 50) return "bg-warning";
  return "bg-danger";
}

export function AuditPanel() {
  const size = 148;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = 67;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="font-display text-[14px] font-semibold text-ink">AEO Audit</p>
        <p className="text-[11.5px] text-ink-faint">acme.com · Sep 1, 2026</p>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:gap-8">
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1EF" strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#D97706"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c - (value / 100) * c}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[38px] font-bold leading-none tracking-tight text-ink">{value}</span>
              <span className="mt-1 text-[11px] text-ink-faint">/ 100</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AEO Health Score</p>
          <p className="mt-1 rounded-md bg-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-amber-700">Needs work</p>
        </div>

        <ul className="space-y-3">
          {CATEGORIES.map((cat) => (
            <li key={cat.label}>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-ink">{cat.label}</span>
                <span className="font-semibold tabular-nums text-ink">{cat.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className={cn("h-full rounded-full", tone(cat.value))} style={{ width: `${cat.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line">
        <div className="flex items-center justify-between bg-surface-2 px-5 py-2.5">
          <p className="text-[11px] font-semibold text-ink">Highest-impact issues</p>
          <p className="text-[10.5px] text-ink-faint">15 open</p>
        </div>
        <ul className="divide-y divide-line">
          {ISSUES.map((issue) => (
            <li key={issue.title} className="flex items-center gap-3 px-5 py-3 text-[13px]">
              <span className={cn("size-2 shrink-0 rounded-full", issue.severity === "high" ? "bg-danger" : "bg-warning")} />
              <span className="flex-1 font-medium text-ink">{issue.title}</span>
              <span className="text-[11px] text-ink-faint">Impact</span>
              <span className="w-8 text-right font-semibold tabular-nums text-ink">{issue.impact}</span>
              <ChevronRight className="size-3.5 text-ink-faint" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
