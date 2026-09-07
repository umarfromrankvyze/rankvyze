import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { BENCHMARK } from "@/content/benchmark";

const TITLE = "RankVyze Research";
const DESCRIPTION =
  "Original measurement on how AI answer engines find and describe businesses. Published with the corpus and method so anyone can check the numbers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/research" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/research", type: "website", images: ["/opengraph-image"] },
};

const STUDIES = [
  {
    href: "/research/aeo-benchmark",
    title: "The 2026 AEO Benchmark",
    date: BENCHMARK.ranAt,
    blurb: `${BENCHMARK.attempted} well-known websites scanned for the signals answer engines rely on. Median ${BENCHMARK.median}/100, and not one had an explicit AI crawler policy.`,
  },
];

export default function ResearchPage() {
  return (
    <>
      <PageJsonLd path="/research" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Research", path: "/research" },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Research"
            title="Measurement, not opinion."
            description="There is a great deal written about AI search and very little measured. What we publish here comes with the corpus, the method and the limitations attached, so you can disagree with it on the evidence rather than on the vibe."
            align="left"
            className="max-w-3xl"
          />
        </div>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-2">
            {STUDIES.map((s) => (
              <Reveal key={s.href}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    {new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h2 className="mt-3 font-display text-[21px] font-bold tracking-tight text-ink">{s.title}</h2>
                  <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-ink-muted">{s.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                    Read the study <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
