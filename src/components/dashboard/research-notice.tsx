import { Info } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ResearchNotice({ lastCheckedAt, checks }: { lastCheckedAt: Date | null; checks: number }) {
  return (
    <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-faint">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Metrics are computed from {checks} prompt × engine checks researched by the RankVyze team
        {lastCheckedAt ? `, last updated ${formatDate(lastCheckedAt)}` : ""}. Engine API integrations will replace manual research
        without changing how scores are calculated.
      </span>
    </p>
  );
}
