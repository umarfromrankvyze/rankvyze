import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Delta } from "@/components/ui/delta";
import { EngineIcon, engineMeta } from "@/components/ui/engine-icon";
import { ProgressBar } from "@/components/ui/progress";
import type { VisibilitySummary } from "@/lib/metrics";
import { cn } from "@/lib/utils";

interface EngineCardProps {
  engineKey: string;
  name: string;
  summary: VisibilitySummary;
  delta?: number;
  href?: string;
  className?: string;
  compact?: boolean;
}

export function EngineCard({ engineKey, name, summary, delta, href, className, compact }: EngineCardProps) {
  const meta = engineMeta(engineKey);
  const body = (
    <Card className={cn("group h-full p-5 transition-all", href && "hover:-translate-y-0.5 hover:shadow-lift", className)}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink">
          <span className="flex size-7 items-center justify-center rounded-md border border-line bg-white">
            <EngineIcon engine={engineKey} size={15} />
          </span>
          {name}
        </span>
        {delta !== undefined && <Delta value={delta} size="sm" />}
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="font-display text-[32px] font-bold leading-none tracking-tight text-ink">{summary.score}</span>
        <span className="mb-0.5 text-[13px] text-ink-faint">%</span>
      </div>
      <ProgressBar value={summary.score} tone="ink" className="mt-3" />
      {!compact && (
        <dl className="mt-4 grid grid-cols-3 gap-2 text-[11.5px]">
          <div>
            <dt className="text-ink-faint">Mentioned</dt>
            <dd className="font-semibold tabular-nums text-ink">{summary.mentionRate}%</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Cited</dt>
            <dd className="font-semibold tabular-nums text-ink">{summary.citationRate}%</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Avg. pos.</dt>
            <dd className="font-semibold tabular-nums text-ink">{summary.avgPosition ?? "—"}</dd>
          </div>
        </dl>
      )}
      <span className="sr-only">{meta.name}</span>
    </Card>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
