import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { ScanForm } from "@/components/marketing/scan-form";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { EngineIcon } from "@/components/ui/engine-icon";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";
import { PRICING_FAQ } from "@/content/faq";
import { FaqJsonLd, PageJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${PRICE_LABEL} once. Mentioned on ${GUARANTEE_MIN_ENGINES}+ AI engines in ${GUARANTEE_DAYS} days, or 100% refunded.`,
};

const INCLUDED = [
  "Baseline research across ChatGPT, Perplexity, Gemini and Claude",
  "Full AEO audit — six categories, scored",
  "Every issue explained, with the exact fix",
  "Implementation delivered as reviewable code and content changes",
  "Competitor and citation tracking for the full 45 days",
  "Prompt tracking with per-engine results",
  "A shareable final report",
  `100% refund if you aren't mentioned on ${GUARANTEE_MIN_ENGINES}+ engines`,
];

export default function PricingPage() {
  return (
    <>
      <PageJsonLd path="/pricing" name="Pricing — RankVyze" description={`${PRICE_LABEL} once. Mentioned on ${GUARANTEE_MIN_ENGINES}+ AI engines in ${GUARANTEE_DAYS} days, or 100% refunded.`} />
      <ServiceJsonLd />
      <FaqJsonLd path="/pricing" items={PRICING_FAQ} />
      <Section className="pb-12 md:pb-16">
        <div className="container-x">
          <SectionHeading
            eyebrow="Pricing"
            title="One price. One promise."
            description={`${PRICE_LABEL} to get your business recommended by AI engines — refunded in full if we don't.`}
          />

          <Reveal delay={80} className="mx-auto mt-14 max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-brand-500 bg-white shadow-float ring-4 ring-brand-500/10">
              <div className="border-b border-line px-8 py-8 text-center">
                <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-brand-700">
                  <ShieldCheck className="size-3.5" /> {GUARANTEE_DAYS}-day guarantee
                </p>
                <h3 className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink">AI Visibility Sprint</h3>
                <p className="mt-4 flex items-end justify-center gap-2">
                  <span className="font-display text-[64px] font-extrabold leading-none tracking-tight text-ink">{PRICE_LABEL}</span>
                  <span className="mb-2 text-[15px] text-ink-faint">one-time</span>
                </p>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                  If your business isn&apos;t mentioned by at least {GUARANTEE_MIN_ENGINES} of the four AI engines in{" "}
                  {GUARANTEE_DAYS} days,{" "}
                  <span className="relative whitespace-nowrap font-semibold text-ink">
                    <span className="relative z-10">we refund you 100%</span>
                    <span aria-hidden className="absolute inset-x-0 bottom-0.5 -z-0 h-[0.55em] rounded-sm bg-brand-500/25" />
                  </span>
                  .
                </p>

                <div className="mx-auto mt-7 flex justify-center">
                  <ScanForm size="md" />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  {["chatgpt", "perplexity", "gemini", "claude"].map((e) => (
                    <span key={e} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                      <EngineIcon engine={e} size={13} />
                      {e === "chatgpt" ? "ChatGPT" : e.charAt(0).toUpperCase() + e.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="grid gap-2.5 px-8 py-7 sm:grid-cols-2">
                {INCLUDED.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={140} className="mt-8 text-center">
            <p className="text-[14px] text-ink-muted">
              Managing several brands or need something custom?{" "}
              <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
                Talk to us
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft" className="py-16 md:py-20">
        <div className="container-x">
          <SectionHeading title="Questions" align="left" className="max-w-xl" />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRICING_FAQ.map((f) => (
              <Reveal key={f.q}>
                <div className="h-full rounded-2xl border border-line bg-white p-6">
                  <h3 className="font-display text-[16px] font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100} className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/guarantee">
                Read the full guarantee terms <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
