import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, MessageSquareQuote, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import {
  ANSWER,
  APPROACHES,
  FAQ,
  HOW_WE_DIFFER,
  RESEARCHED_ON,
  STEPS,
  VENDORS,
} from "@/content/brand-mentions";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

const PATH = "/ai-brand-mentions";
const TITLE = "AI Brand Mentions: How to Track Them in ChatGPT, Perplexity, Gemini & Claude";
const DESCRIPTION =
  "Yes, you can track brand mentions in AI search — three ways, with honest trade-offs. What an AI brand mention is, why analytics can't see it, the tools that measure it, and what actually moves the number.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article", images: ["/opengraph-image"] },
};

export default function BrandMentionsPage() {
  return (
    <>
      <PageJsonLd path={PATH} name={TITLE} description={DESCRIPTION} />
      <FaqJsonLd path={PATH} items={FAQ} />
      <HowToJsonLd
        path={PATH}
        name="How to track brand mentions in AI search"
        description={ANSWER.short}
        steps={STEPS}
      />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "AI brand mentions", path: PATH },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="AI brand mentions"
            title="How to track brand mentions in AI search."
            description="An AI brand mention is any time an assistant names your business inside an answer. It sends no traffic, produces no referrer and appears in no analytics tool — which is why most businesses have no idea whether it is happening."
            align="left"
            className="max-w-3xl"
          />

          {/* Answer-first: this is the passage an engine lifts for the query. */}
          <Reveal delay={60} className="mt-8 max-w-3xl">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">{ANSWER.question}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{ANSWER.short}</p>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-muted">{ANSWER.long}</p>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-8 max-w-xl">
            <ScanForm size="md" />
          </Reveal>
        </div>
      </Section>

      {/* Mention vs citation — the distinction everything else depends on */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="First, a distinction"
            title="A mention is not a citation."
            description="These get used interchangeably and they measure different things. Conflating them is how people end up optimising for the wrong number."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <MessageSquareQuote className="size-5 text-brand-500" />
                <h3 className="mt-3 font-display text-[16px] font-semibold text-ink">Brand mention</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                  Your name appears in the generated answer. The user reads it. There may be no link at all, and usually
                  there is no click — but the recommendation has already happened.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={70}>
              <Card className="h-full p-6">
                <ExternalLink className="size-5 text-brand-500" />
                <h3 className="mt-3 font-display text-[16px] font-semibold text-ink">Citation</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                  A page of yours is listed as a source the engine used. Citations are easier to measure and tell you
                  which page earned the reference — they often move before mention rate does.
                </p>
              </Card>
            </Reveal>
          </div>
          <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
            You can be mentioned without being cited, and cited without being mentioned. Track both, but understand that
            the mention is the thing that wins the customer.{" "}
            <Link href="/glossary/brand-mention" className="font-medium text-ink underline underline-offset-2">
              Full definition
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* The three approaches */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Three ways to do it"
            title="Pick the one that matches what you'll actually maintain."
            description="All three work. They differ in cost, in how quickly they go stale, and in how closely they resemble what a real buyer sees."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 space-y-4">
            {APPROACHES.map((a, i) => (
              <Reveal key={a.name} delay={i * 60}>
                <Card className="p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-[17px] font-bold tracking-tight text-ink">{a.name}</h3>
                    <span className="text-[13px] text-ink-faint">{a.cost}</span>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{a.summary}</p>
                  <p className="mt-3 text-[14px] text-ink">
                    <span className="font-semibold">Good for: </span>
                    {a.goodFor}
                  </p>
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {a.limits.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-faint">
                        <X className="mt-0.5 size-3.5 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Steps — rendered because HowTo markup describes them */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Do it yourself"
            title="Tracking AI brand mentions by hand, in six steps."
            description="This is exactly what a monitoring tool does on your behalf. Running it once yourself is the fastest way to understand what any of them are actually measuring."
            align="left"
            className="max-w-2xl"
          />
          <ol className="mt-8 max-w-3xl space-y-3">
            {STEPS.map((step, i) => (
              <li key={step.name} id={`step-${i + 1}`}>
                <Reveal delay={(i % 3) * 50}>
                  <div className="flex gap-4 rounded-xl border border-line bg-white p-5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 font-mono text-[12px] font-semibold text-brand-600">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-[15.5px] font-semibold text-ink">{step.name}</h3>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-ink-muted">{step.text}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* The tools, named honestly */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The tools"
            title="Who else measures this."
            description="Named because a comparison that pretends the alternatives don't exist is worth nothing to the person reading it. Details are from each vendor's own site."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-3 pr-4 text-[12px] font-semibold uppercase tracking-wider text-ink-faint">Tool</th>
                  <th className="pb-3 pr-4 text-[12px] font-semibold uppercase tracking-wider text-ink-faint">Engines</th>
                  <th className="pb-3 pr-4 text-[12px] font-semibold uppercase tracking-wider text-ink-faint">Model</th>
                  <th className="pb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-faint">
                    Stronger than us at
                  </th>
                </tr>
              </thead>
              <tbody>
                {VENDORS.map((v) => (
                  <tr key={v.name} className="border-b border-line align-top">
                    <td className="py-4 pr-4">
                      <a
                        href={v.url}
                        rel="noopener nofollow"
                        target="_blank"
                        className="font-display text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        {v.name}
                      </a>
                      <span className="mt-1 block max-w-xs text-[13px] leading-relaxed text-ink-faint">
                        {v.positioning}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[13.5px] leading-relaxed text-ink-muted">{v.engines}</td>
                    <td className="py-4 pr-4 text-[13.5px] leading-relaxed text-ink-muted">{v.model}</td>
                    <td className="py-4 text-[13.5px] leading-relaxed text-ink-muted">{v.strongerAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12.5px] text-ink-faint">
            Checked {RESEARCHED_ON}. Pricing is only quoted where a vendor publishes it.{" "}
            <Link href="/ai-visibility-tools" className="font-medium text-ink underline underline-offset-2">
              Full comparison with verified pricing and cost per tracked prompt
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Where we fit, including where we don't */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="RankVyze" title={HOW_WE_DIFFER.heading} align="left" className="max-w-2xl" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {HOW_WE_DIFFER.weAre.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 70}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-success-soft">
                      <Check className="size-3.5 text-success" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{item.title}</h3>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{item.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={140} className="mt-6">
            <Card className="border-amber-200 bg-warning-soft/50 p-6">
              <h3 className="inline-flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
                <TriangleAlert className="size-4 text-amber-700" /> Don&apos;t buy RankVyze if
              </h3>
              <ul className="mt-3 space-y-2">
                {HOW_WE_DIFFER.notFor.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-[14.5px] leading-relaxed text-ink">
                    <X className="mt-0.5 size-4 shrink-0 text-amber-700" />
                    {n}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="AI brand mention questions." align="left" className="max-w-2xl" />
          <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <Reveal key={f.q}>
                <div className="py-6">
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{f.q}</dt>
                  <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{f.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </Section>

      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Keep reading</h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink-muted">
            Tracking tells you where you stand. These cover what actually moves the number — and the guarantee is{" "}
            {GUARANTEE_MIN_ENGINES}+ engines within {GUARANTEE_DAYS} days for {PRICE_LABEL}, refunded if it doesn&apos;t
            happen.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { href: "/rank-in/chatgpt", label: "How to get ranked on ChatGPT" },
              { href: "/rank-in/perplexity", label: "How to get cited by Perplexity" },
              { href: "/rank-in", label: "All engine guides" },
              { href: "/answer-engine-optimization", label: "What answer engine optimization is" },
              { href: "/glossary/brand-mention", label: "Brand mention, defined" },
              { href: "/glossary/share-of-voice", label: "AI share of voice" },
              { href: "/glossary/prompt-tracking", label: "Prompt tracking" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/guarantee">
              How the guarantee is judged <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
