import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Delta } from "@/components/ui/delta";
import { ScoreRing } from "@/components/ui/score-ring";
import { Counter } from "@/components/ui/counter";
import { scoreLabel } from "@/lib/metrics";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  label: string;
  score: number;
  delta?: number;
  deltaLabel?: string;
  description?: string;
  className?: string;
  size?: "md" | "lg";
  tone?: "auto" | "brand";
}

/** Big headline score with ring — AI Visibility, AEO Health. */
export function ScoreCard({ label, score, delta, deltaLabel = "vs. previous period", description, className, size = "lg", tone = "auto" }: ScoreCardProps) {
  return (
    <Card className={cn("flex items-center gap-6 p-6", className)}>
      <ScoreRing value={score} size={size === "lg" ? 128 : 104} stroke={size === "lg" ? 10 : 8} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
        <div className="mt-1.5 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="font-display text-[40px] font-bold leading-none tracking-tight text-ink">
            <Counter value={score} />
            <span className="ml-1 text-[18px] font-medium text-ink-faint">/ 100</span>
          </span>
          {delta !== undefined && <Delta value={delta} className="mb-1" />}
        </div>
        <p className="mt-2 text-[13px] text-ink-muted">
          <span className="font-medium text-ink">{scoreLabel(score)}.</span> {description ?? (delta !== undefined ? deltaLabel : "")}
        </p>
      </div>
    </Card>
  );
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: number;
  invertDelta?: boolean;
  icon?: LucideIcon;
  className?: string;
  accent?: boolean;
}

export function StatTile({ label, value, sub, delta, invertDelta, icon: Icon, className, accent }: StatTileProps) {
  return (
    <Card className={cn("p-5", accent && "border-brand-200 bg-brand-50/40", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
        {Icon && <Icon className={cn("size-4", accent ? "text-brand-500" : "text-ink-faint")} />}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="font-display text-[28px] font-bold leading-none tracking-tight text-ink">{value}</p>
        {delta !== undefined && <Delta value={delta} invert={invertDelta} size="sm" />}
      </div>
      {sub && <p className="mt-2 text-[12.5px] text-ink-muted">{sub}</p>}
    </Card>
  );
}
