import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import {
  BENCHMARK,
  BENCHMARK_ANSWER,
  CHECK_LABELS,
  EXCLUDED_SECTORS,
  FINDINGS,
  METHODOLOGY,
  REPORTABLE_SECTORS,
} from "@/content/benchmark";
import { CORPUS } from "@/content/study-corpus";
import { SITE_URL } from "@/lib/site";

const PATH = "/research/aeo-benchmark";
const TITLE = "The 2026 AEO Benchmark";
const DESCRIPTION = `We scanned ${BENCHMARK.attempted} well-known websites for the signals AI answer engines rely on. Median score ${BENCHMARK.median}/100, and not one had an explicit AI crawler policy. Full method and corpus published.`;
const RAN = new Date(BENCHMARK.ranAt);

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article", images: ["/opengraph-image"] },
};

const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function BenchmarkPage() {
  const maxBand = Math.max(...BENCHMARK.bands.map((b) => b.count));

  return (
    <>
      <PageJsonLd path={PATH} name={TITLE} description={DESCRIPTION} />
      <FaqJsonLd path={PATH} items={METHODOLOGY} />
      <ArticleJsonLd
        path={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        published={RAN.toISOString()}
        modified={RAN.toISOString()}
        section="Research"
      />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Research", path: "/research" },
          { name: "The 2026 AEO Benchmark", path: PATH },
        ]}
      />
      {/* Dataset markup: this page exists to be cited, and Dataset is the type
          that says "there is data here", not just prose about data. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "@id": `${SITE_URL}${PATH}#dataset`,
            name: TITLE,
            description: DESCRIPTION,
            url: `${SITE_URL}${PATH}`,
            datePublished: RAN.toISOString().slice(0, 10),
            creator: { "@id": `${SITE_URL}/#organization` },
            license: "https://creativecommons.org/licenses/by/4.0/",
            variableMeasured: Object.values(CHECK_LABELS).map((c) => c.label),
            measurementTechnique: "Automated HTTP scan of homepage, robots.txt and llms.txt",
          }),
        }}
      />

      <article>
        <Section className="pb-10 md:pb-14">
          <div className="container-x">
            <SectionHeading
              level={1}
              eyebrow={`Original research · ${fmtDate(RAN)}`}
              title="The 2026 AEO benchmark."
              description={`We pointed our scanner at ${BENCHMARK.attempted} well-known websites and recorded which signals answer engines rely on were actually present. Here is what came back, with the corpus and the method published so you can check it.`}
              align="left"
              className="max-w-3xl"
            />

            <Reveal delay={60} className="mt-8 max-w-3xl">
              <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
                <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">
                  {BENCHMARK_ANSWER.question}
                </h2>
                <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{BENCHMARK_ANSWER.answer}</p>
              </div>
            </Reveal>

            {/* Headline figures */}
            <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {[
                { v: String(BENCHMARK.median), l: "median score /100" },
                { v: `${BENCHMARK.min}–${BENCHMARK.max}`, l: "full range" },
                { v: String(BENCHMARK.scanned), l: `sites scanned of ${BENCHMARK.attempted}` },
                { v: "0", l: "with an AI crawler policy" },
              ].map((s) => (
                <div key={s.l} className="bg-white p-5">
                  <p className="font-display text-[30px] font-extrabold leading-none tracking-tight text-ink tabular-nums">
                    {s.v}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-ink-faint">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Findings */}
        <Section className="bg-surface-2 py-14 md:py-18">
          <div className="container-x">
            <SectionHeading eyebrow="What stood out" title="Four findings." align="left" className="max-w-2xl" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {FINDINGS.map((f, i) => (
                <Reveal key={f.headline} delay={(i % 2) * 70}>
                  <Card className="h-full p-6">
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-[38px] font-extrabold leading-none tracking-tight text-brand-500 tabular-nums">
                        {f.stat}
                      </span>
                      {f.unit && <span className="text-[13px] text-ink-faint">{f.unit}</span>}
                    </p>
                    <h3 className="mt-2 font-display text-[16px] font-semibold text-ink">{f.headline}</h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{f.body}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* Per-check results */}
        <Section className="py-14 md:py-18">
          <div className="container-x">
            <SectionHeading
              eyebrow="Every check"
              title="Pass rate by signal, worst first."
              description="Warn means partially present — a robots.txt that exists but names no AI crawler, an H1 that reads as a slogan. Fail means absent."
              align="left"
              className="max-w-2xl"
            />
            <div className="mt-8 space-y-3">
              {BENCHMARK.byCheck.map((c) => {
                const meta = CHECK_LABELS[c.key];
                return (
                  <Reveal key={c.key}>
                    <div className="rounded-xl border border-line bg-white p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-display text-[15.5px] font-semibold text-ink">
                          {meta?.label ?? c.key}
                        </h3>
                        <span className="font-mono text-[15px] font-medium text-ink tabular-nums">
                          {c.passRate}% pass
                        </span>
                      </div>
                      {/* Single stacked bar: one scale, three segments, labels
                          on the row rather than floating over the bar. */}
                      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface-3">
                        <div className="bg-success" style={{ width: `${(c.pass / c.total) * 100}%` }} />
                        <div className="bg-amber-400" style={{ width: `${(c.warn / c.total) * 100}%` }} />
                        <div className="bg-danger/70" style={{ width: `${(c.fail / c.total) * 100}%` }} />
                      </div>
                      <p className="mt-2 font-mono text-[12px] text-ink-faint tabular-nums">
                        {c.pass} pass · {c.warn} warn · {c.fail} fail
                      </p>
                      {meta && <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{meta.what}</p>}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Distribution + sectors */}
        <Section className="bg-surface-2 py-14 md:py-18">
          <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">Score distribution</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                {BENCHMARK.bands[0].count + BENCHMARK.bands[1].count} of {BENCHMARK.scanned} scored under 60.
              </p>
              <div className="mt-5 space-y-2.5">
                {BENCHMARK.bands.map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 font-mono text-[12.5px] text-ink-faint tabular-nums">{b.label}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-surface-3">
                      <div
                        className="h-full rounded bg-brand-500/80"
                        style={{ width: `${Math.max(2, (b.count / maxBand) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-[13px] text-ink tabular-nums">
                      {b.count}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">Median by sector</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                Directional only — four to eight sites each. A hint about where to look, not a league table.
              </p>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                {REPORTABLE_SECTORS.map((s) => (
                  <div key={s.sector} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-[14px] text-ink">
                      {s.sector} <span className="text-[12px] text-ink-faint">n={s.n}</span>
                    </dt>
                    <dd className="font-mono text-[14px] font-medium text-ink tabular-nums">{s.median}</dd>
                  </div>
                ))}
              </dl>
              {EXCLUDED_SECTORS.length > 0 && (
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
                  Excluded for too few results: {EXCLUDED_SECTORS.map((s) => `${s.sector} (n=${s.n})`).join(", ")}.
                </p>
              )}
            </Reveal>
          </div>
        </Section>

        {/* Method */}
        <Section className="py-14 md:py-18">
          <div className="container-x">
            <SectionHeading
              eyebrow="Method"
              title="How this was run, and what's wrong with it."
              description="Published in full, including the limitations. A statistic nobody can reproduce is an assertion."
              align="left"
              className="max-w-2xl"
            />
            <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
              {METHODOLOGY.map((m) => (
                <Reveal key={m.q}>
                  <div className="py-6">
                    <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{m.q}</dt>
                    <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{m.a}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={80} className="mt-8">
              <Card className="p-6">
                <h3 className="inline-flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
                  <Download className="size-4 text-brand-500" /> The corpus
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                  All {CORPUS.length} domains, in the order they were scanned. Per-site scores are deliberately not
                  published — the point is the aggregate, and nobody here agreed to be an example.
                </p>
                <div className="mt-4 max-h-56 overflow-y-auto rounded-lg border border-line bg-surface-2 p-4">
                  <p className="font-mono text-[12px] leading-relaxed text-ink-muted">
                    {CORPUS.map((c) => c.domain).join(" · ")}
                  </p>
                </div>
              </Card>
            </Reveal>
          </div>
        </Section>

        {/* Reuse */}
        <Section className="bg-surface-2 py-14 md:py-18">
          <div className="container-x">
            <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Citing this</h2>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              Free to quote with attribution (CC BY 4.0). If you use a figure, please link the page so readers can see
              the method it came from.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white p-5">
              <p className="font-mono text-[12.5px] leading-relaxed text-ink-muted">
                RankVyze, “The 2026 AEO Benchmark”, {fmtDate(RAN)}. {SITE_URL}
                {PATH}
              </p>
            </div>

            <div className="mt-8 max-w-xl">
              <p className="mb-3 text-[14.5px] text-ink">Curious where your own site sits against that median?</p>
              <ScanForm size="md" />
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button variant="outline" asChild>
                <Link href="/ai-search-visibility">
                  How we score <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/answer-engine-optimization">What to do about it</Link>
              </Button>
            </div>
          </div>
        </Section>
      </article>

      <FinalCta />
    </>
  );
}
