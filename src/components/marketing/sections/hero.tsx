import { ShieldCheck } from "lucide-react";
import { EngineIcon } from "@/components/ui/engine-icon";
import { ScanForm } from "@/components/marketing/scan-form";
import { HeroDashboard } from "@/components/marketing/mocks/hero-dashboard";
import { PRICE_LABEL } from "@/lib/guarantee";

const ENGINES = [
  { key: "chatgpt", name: "ChatGPT" },
  { key: "perplexity", name: "Perplexity" },
  { key: "gemini", name: "Gemini" },
  { key: "claude", name: "Claude" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]" />

      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12.5px] font-medium text-ink-muted shadow-card">
            <ShieldCheck className="size-3.5 text-brand-500" />
            45-day AI visibility guarantee
          </p>

          <h1 className="animate-fade-up mt-6 text-balance font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-ink [animation-delay:80ms] sm:text-[3.4rem] md:text-[4.4rem]">
            We rank your business in <span className="text-brand-500">ChatGPT, Gemini &amp; Claude.</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink-muted [animation-delay:160ms] md:text-[19px]">
            If your business doesn&apos;t show up in any of these in 45 days,{" "}
            <span className="relative whitespace-nowrap font-semibold text-ink">
              <span className="relative z-10">we refund you 100%</span>
              <span aria-hidden className="absolute inset-x-0 bottom-0.5 -z-0 h-[0.55em] rounded-sm bg-brand-500/25" />
            </span>
            .
          </p>

          <div className="animate-fade-up mt-9 flex justify-center [animation-delay:240ms]">
            <ScanForm />
          </div>

          <p className="animate-fade-up mt-4 text-[13px] text-ink-faint [animation-delay:300ms]">
            Free instant scan. {PRICE_LABEL} one-time if you continue — refunded in full if we don&apos;t deliver.
          </p>

          <div className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 [animation-delay:340ms]">
            <span className="text-[12.5px] text-ink-faint">Tracked across</span>
            {ENGINES.map((e) => (
              <span key={e.key} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
                <EngineIcon engine={e.key} size={14} />
                {e.name}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-fade-up mt-16 [animation-delay:380ms] md:mt-20">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
