import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageJsonLd } from "@/components/seo/json-ld";
import {
  CLAIM_WINDOW_DAYS,
  GUARANTEE_DAYS,
  GUARANTEE_MIN_ENGINES,
  ONBOARDING_GRACE_DAYS,
  PRICE_LABEL,
  VOID_REASONS,
} from "@/lib/guarantee";

export const metadata: Metadata = {
  title: "The 45-day guarantee",
  description: `Mentioned on ${GUARANTEE_MIN_ENGINES}+ AI engines within ${GUARANTEE_DAYS} days, or RankVyze refunds you 100%.`,
};

const STEPS = [
  {
    n: "01",
    title: "Your prompts are locked on day 0",
    body: "Before any work starts we run baseline research across ChatGPT, Perplexity, Gemini and Claude, and freeze the set of prompts the guarantee will be judged on. Neither side can move the goalposts afterwards.",
  },
  {
    n: "02",
    title: "Every check is recorded",
    body: "Each prompt is asked on each engine and the answer is recorded — whether you were named, in what position, and which pages were cited. You can see every record in your dashboard as it lands.",
  },
  {
    n: `0${GUARANTEE_MIN_ENGINES + 1}`,
    title: `Mentioned on ${GUARANTEE_MIN_ENGINES}+ engines = met`,
    body: `If your brand is named on at least ${GUARANTEE_MIN_ENGINES} of the four engines at any point inside the ${GUARANTEE_DAYS} days, the guarantee is met. The evidence is shown on your Guarantee page.`,
  },
  {
    n: "04",
    title: "Otherwise you get everything back",
    body: `If day ${GUARANTEE_DAYS} arrives and the bar wasn't cleared, one click claims the full ${PRICE_LABEL} back to your original payment method. You keep the audit, the fixes and the data.`,
  },
];

export default function GuaranteePage() {
  return (
    <div className="container-x py-16 md:py-24">
      <PageJsonLd path="/guarantee" name={`The ${GUARANTEE_DAYS}-day guarantee`} description={`Mentioned on ${GUARANTEE_MIN_ENGINES}+ AI engines within ${GUARANTEE_DAYS} days, or RankVyze refunds you 100%.`} />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-2">
          <ShieldCheck className="size-4" /> The guarantee
        </p>
        <h1 className="mt-4 text-balance font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.4rem]">
          Mentioned in {GUARANTEE_DAYS} days, or you pay nothing.
        </h1>
        <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-muted md:text-lg">
          We charge {PRICE_LABEL} once. If your business isn&apos;t mentioned by at least {GUARANTEE_MIN_ENGINES} of the four
          major AI engines within {GUARANTEE_DAYS} days,{" "}
          <span className="font-semibold text-ink">we refund you 100%</span>. No forms to chase, no partial credits.
        </p>

        <div className="mt-12 space-y-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="flex gap-5 p-6">
              <span className="font-mono text-[13px] font-medium text-brand-500">{s.n}</span>
              <div>
                <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">{s.title}</h2>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">The fine print, in plain words</h2>
          <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-ink-muted">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">What counts as a mention</h3>
              <p className="mt-1">
                Your brand named in the engine&apos;s answer to one of your locked prompts, in a normal signed-out session.
                Position doesn&apos;t matter for the guarantee — being named at all is the bar. A citation of your site
                counts as a mention too.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">The claim window</h3>
              <p className="mt-1">
                From day {GUARANTEE_DAYS} you have {CLAIM_WINDOW_DAYS} days to claim. We review within two business days and
                refund to your original payment method.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">When it doesn&apos;t apply</h3>
              <p className="mt-1">The guarantee assumes we can actually do the work. It doesn&apos;t apply if:</p>
              <ul className="mt-2.5 space-y-2">
                {Object.values(VOID_REASONS).map((r) => (
                  <li key={r} className="flex items-start gap-3">
                    <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5">
                You have {ONBOARDING_GRACE_DAYS} days from purchase to complete onboarding. We&apos;ll remind you before
                anything lapses.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">What we don&apos;t promise</h3>
              <p className="mt-1">
                AI engines are run by other companies and change without notice. We don&apos;t promise a specific position,
                a specific engine, or that any result will last. We promise to get you named on{" "}
                {GUARANTEE_MIN_ENGINES} of them inside {GUARANTEE_DAYS} days — or to give your money back.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-line bg-surface-2 p-8 md:p-10">
          <p className="font-display text-[22px] font-bold tracking-tight text-ink">See where you stand first.</p>
          <p className="mt-2 text-[15px] text-ink-muted">The scan is free and takes about ten seconds.</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/#top">
              Analyze My Website <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
