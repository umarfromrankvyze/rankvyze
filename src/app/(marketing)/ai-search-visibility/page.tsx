import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import {
  COMPONENTS,
  NO_BENCHMARKS,
  POSITION_TABLE,
  VISIBILITY_ANSWER,
  VISIBILITY_FAQ,
  WHY_NOT_TRAFFIC,
  WORKED_EXAMPLE,
} from "@/content/visibility";
import { WEIGHT_TABLE } from "@/lib/metrics-public";

const PATH = "/ai-search-visibility";
const TITLE = "AI Search Visibility: What It Is and How to Measure It";
const DESCRIPTION =
  "AI search visibility can't be measured by traffic — a generated answer sends no click. Here is the arithmetic we use instead, published in full, with a worked example.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article", images: ["/opengraph-image"] },
};

export default function VisibilityPage() {
  return (
    <>
      <PageJsonLd path={PATH} name={TITLE} description={DESCRIPTION} />
      <FaqJsonLd path={PATH} items={VISIBILITY_FAQ} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "AI search visibility", path: PATH },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="AI search visibility"
            title="How to measure something that sends you no traffic."
            description="Every vendor in this category sells a visibility score and almost none of them say how it is calculated, which makes the number impossible to check and useless to compare. Ours is below, in full."
            align="left"
            className="max-w-3xl"
          />

          <Reveal delay={60} className="mt-8 max-w-3xl">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">{VISIBILITY_ANSWER.question}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{VISIBILITY_ANSWER.answer}</p>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-8 max-w-xl">
            <ScanForm size="md" />
          </Reveal>
        </div>
      </Section>

      {/* Why the usual tools report nothing */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why analytics shows zero"
            title="Four reasons your existing tools can't see this."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {WHY_NOT_TRAFFIC.map((r, i) => (
              <Reveal key={r.title} delay={(i % 2) * 70}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-danger-soft">
                      <X className="size-3.5 text-danger" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{r.title}</h3>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{r.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* The formula, published */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The arithmetic"
            title="Our score, in full."
            description="Three components over the same denominator: the total number of prompt × engine checks. Nothing else feeds it."
            align="left"
            className="max-w-2xl"
          />

          <Reveal className="mt-8">
            <div className="overflow-x-auto rounded-xl border border-line bg-ink p-6">
              <code className="block whitespace-nowrap font-mono text-[13.5px] leading-relaxed text-white">
                score = 100 × ( {WEIGHT_TABLE.mention} × mentionRate + {WEIGHT_TABLE.citation} × citationRate +{" "}
                {WEIGHT_TABLE.position} × positionFactor )
              </code>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {COMPONENTS.map((c) => (
              <Reveal key={c.key}>
                <Card className="h-full p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[15.5px] font-semibold text-ink">{c.key}</h3>
                    <span className="font-mono text-[15px] font-medium text-brand-500 tabular-nums">
                      ×{c.weight}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-ink">{c.definition}</p>
                  <p className="mt-2.5 border-t border-line pt-2.5 text-[13.5px] leading-relaxed text-ink-muted">
                    {c.why}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80} className="mt-8">
            <h3 className="font-display text-[16px] font-semibold text-ink">Position credit</h3>
            <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              Being named first is worth full credit. The decay is gentle at the top and flattens into a floor rather
              than falling away, because appearing sixth is still appearing.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[420px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="pb-2 pr-6 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      Named
                    </th>
                    {POSITION_TABLE.map((_, i) => (
                      <th
                        key={i}
                        className="pb-2 pr-6 font-mono text-[13px] font-medium text-ink tabular-nums"
                      >
                        {i + 1}
                        {["st", "nd", "rd", "th", "th"][i]}
                      </th>
                    ))}
                    <th className="pb-2 font-mono text-[13px] font-medium text-ink">6th+</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pt-2 pr-6 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      Credit
                    </td>
                    {POSITION_TABLE.map((v, i) => (
                      <td key={i} className="pt-2 pr-6 font-mono text-[14px] text-ink-muted tabular-nums">
                        {v.toFixed(2)}
                      </td>
                    ))}
                    <td className="pt-2 font-mono text-[14px] text-ink-muted tabular-nums">0.25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Worked example */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="Worked example" title="Run the numbers yourself." align="left" className="max-w-2xl" />
          <Reveal className="mt-8 max-w-2xl">
            <Card className="p-6 md:p-7">
              <p className="text-[14.5px] leading-relaxed text-ink-muted">{WORKED_EXAMPLE.setup}</p>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                {WORKED_EXAMPLE.rows.map((r) => (
                  <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                    <dt className="text-[14px] text-ink">{r.label}</dt>
                    <dd className="flex items-baseline gap-4">
                      <span className="font-mono text-[13px] text-ink-faint">{r.calc}</span>
                      <span className="font-mono text-[15px] font-medium text-ink tabular-nums">{r.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-ink-muted">
                {WORKED_EXAMPLE.formula}
              </p>
              <p className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-brand-500 tabular-nums">
                  {WORKED_EXAMPLE.result}
                </span>
                <span className="text-[14px] text-ink-faint">out of 100</span>
              </p>
              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{WORKED_EXAMPLE.reading}</p>
            </Card>
          </Reveal>

          <Reveal delay={80} className="mt-6 max-w-2xl">
            <div className="rounded-xl border border-line bg-white p-6">
              <h3 className="inline-flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
                <Info className="size-4 text-brand-500" /> {NO_BENCHMARKS.heading}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{NO_BENCHMARKS.body}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Measurement questions." align="left" className="max-w-2xl" />
          <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
            {VISIBILITY_FAQ.map((f) => (
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
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Related</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { href: "/ai-visibility-tools", label: "The tools that measure this, compared" },
              { href: "/ai-brand-mentions", label: "Tracking AI brand mentions" },
              { href: "/answer-engine-optimization", label: "What we actually do about it" },
              { href: "/generative-engine-optimization", label: "GEO explained" },
              { href: "/glossary/share-of-voice", label: "AI share of voice" },
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
          <Button className="mt-7" asChild>
            <Link href="/pricing">
              Get your score measured <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
