import { cn } from "@/lib/utils";
import { EngineIcon } from "@/components/ui/engine-icon";

const ROWS = [
  { name: "Competitor A", domain: "northwind.digital", value: 84, mentions: 71, citations: 38 },
  { name: "Competitor B", domain: "halcyon.studio", value: 76, mentions: 62, citations: 24 },
  { name: "Competitor C", domain: "vertexcommerce.co", value: 68, mentions: 54, citations: 19 },
  { name: "Your Brand", domain: "acme.com", value: 42, mentions: 31, citations: 11, you: true },
];

export function CompetitorTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="font-display text-[14px] font-semibold text-ink">AI Visibility · Competitors</p>
        <div className="hidden items-center gap-1.5 sm:flex">
          {["chatgpt", "perplexity", "gemini", "claude"].map((e) => (
            <span key={e} className="flex size-6 items-center justify-center rounded-md border border-line bg-white">
              <EngineIcon engine={e} size={12} />
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 px-5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint sm:grid-cols-[1.4fr_2fr_auto_auto]">
        <span>Brand</span>
        <span className="hidden sm:block">AI Visibility</span>
        <span className="hidden text-right sm:block">Mentions</span>
        <span className="text-right">Score</span>
      </div>
      <ul className="divide-y divide-line">
        {ROWS.map((r) => (
          <li
            key={r.name}
            className={cn(
              "grid grid-cols-[1fr_auto] items-center gap-x-4 px-5 py-3.5 sm:grid-cols-[1.4fr_2fr_auto_auto]",
              r.you && "bg-brand-50/60",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border font-display text-[11px] font-bold",
                  r.you ? "border-brand-200 bg-brand-500 text-white" : "border-line bg-surface-3 text-ink-muted",
                )}
              >
                {r.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className={cn("truncate text-[13.5px] font-semibold", r.you ? "text-brand-700" : "text-ink")}>{r.name}</p>
                <p className="truncate text-[11px] text-ink-faint">{r.domain}</p>
              </div>
            </div>
            <div className="hidden items-center sm:flex">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div className={cn("h-full rounded-full", r.you ? "bg-brand-500" : "bg-ink/70")} style={{ width: `${r.value}%` }} />
              </div>
            </div>
            <span className="hidden text-right text-[13px] tabular-nums text-ink-muted sm:block">{r.mentions}%</span>
            <span className={cn("text-right font-display text-[18px] font-bold tabular-nums", r.you ? "text-brand-600" : "text-ink")}>
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-line bg-surface-2 px-5 py-3 text-[12px] text-ink-muted">
        You&apos;re mentioned in <span className="font-semibold text-ink">31%</span> of tracked queries. Competitor A is mentioned in{" "}
        <span className="font-semibold text-ink">71%</span> — and cited 3.5× more often.
      </div>
    </div>
  );
}
