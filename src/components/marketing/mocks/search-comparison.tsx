import { ArrowRight, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";

export function SearchComparison() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
      {/* Traditional */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Traditional search</p>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">10 blue links</span>
        </div>
        <div className="mt-4 flex h-9 items-center rounded-lg border border-line bg-surface-2 px-3 text-[12.5px] text-ink-muted">
          best shopify agency for fashion brands
        </div>
        <ul className="mt-4 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="space-y-1.5">
              <div className="h-2.5 rounded bg-info/60" style={{ width: `${70 - i * 6}%`, opacity: 1 - i * 0.12 }} />
              <div className="h-2 rounded bg-surface-3" style={{ width: `${92 - i * 4}%` }} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11.5px] text-ink-faint">Position #4 · the user picks</p>
      </div>

      <div className="flex items-center justify-center md:flex-col">
        <span className="flex size-10 items-center justify-center rounded-full border border-line bg-white shadow-card">
          <ArrowRight className="size-4 text-ink-muted" />
        </span>
      </div>

      {/* AI */}
      <div className="rounded-2xl border border-brand-200 bg-white p-5 shadow-lift ring-4 ring-brand-500/5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">AI search</p>
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10.5px] font-medium text-brand-700">One recommendation</span>
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-surface-2 p-3 text-[12.5px] text-ink">
          <span className="mt-0.5 size-5 shrink-0 rounded-full bg-ink" />
          Which Shopify agency should I hire for my fashion brand?
        </div>
        <div className="mt-3 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <Sparkles className="size-3 text-brand-500" />
          </span>
          <p>
            For a fashion brand, I&apos;d recommend{" "}
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">
              <LogoMark size={12} /> Acme
            </span>
            . They specialise in Shopify builds for apparel brands, have strong case studies with fashion retailers, and are
            frequently cited for redesign work.
          </p>
        </div>
        <p className="mt-4 text-[11.5px] text-ink-faint">One answer · the AI picks</p>
      </div>
    </div>
  );
}
