import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageSquareQuote, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { EngineIcon, engineMeta } from "@/components/ui/engine-icon";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { INDUSTRIES, INDUSTRY_COMMON_FAQ, getIndustry } from "@/content/industries";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const data = getIndustry(industry);
  if (!data) return {};
  const path = `/answer-engine-optimization/${data.slug}`;
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: path,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const data = getIndustry(industry);
  if (!data) notFound();

  const path = `/answer-engine-optimization/${data.slug}`;
  const faq = [...data.faq, ...INDUSTRY_COMMON_FAQ];
  const others = INDUSTRIES.filter((i) => i.slug !== data.slug);

  return (
    <>
      <PageJsonLd path={path} name={data.metaTitle} description={data.metaDescription} />
      <FaqJsonLd path={path} items={faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Answer Engine Optimization", path: "/answer-engine-optimization" },
          { name: data.metaTitle, path },
        ]}
      />

      {/* Hero */}
      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow={`AEO for ${data.name}`}
            title={data.h1}
            description={data.intro}
            align="left"
            className="max-w-3xl"
          />
          <Reveal delay={80} className="mt-8 max-w-xl">
            <ScanForm size="md" />
          </Reveal>
          <Reveal delay={120} className="mt-4">
            <p className="text-[13px] text-ink-faint">
              Free scan. {PRICE_LABEL} one-time if you continue — refunded in full if you aren&apos;t mentioned on{" "}
              {GUARANTEE_MIN_ENGINES}+ engines in {GUARANTEE_DAYS} days.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* The prompts — the most concrete thing on the page */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The questions that decide it"
            title={`What your buyers actually ask.`}
            description={`These are the shapes of question that put a ${data.singular} on a shortlist. Your tracked prompt set is built from the versions your buyers use.`}
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {data.buyerPrompts.map((p, i) => (
              <Reveal key={p} delay={(i % 4) * 60}>
                <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
                  <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  <p className="font-display text-[14.5px] leading-snug text-ink">&ldquo;{p}&rdquo;</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Engine weighting */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Where it matters most"
            title="Not every engine matters equally here."
            description={data.engineNote}
            align="left"
            className="max-w-3xl"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {data.primaryEngines.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium text-ink shadow-card"
              >
                <EngineIcon engine={key} size={15} />
                {engineMeta(key).name}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Failure modes */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we find"
            title={`Why ${data.name} stay invisible.`}
            description="These are the patterns that come up again and again in this vertical — not a generic checklist."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.failures.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 70}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-danger-soft">
                      <X className="size-3.5 text-danger" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{f.title}</h3>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{f.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Schema + proof */}
      <Section className="py-14 md:py-18">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="font-display text-[24px] font-bold tracking-tight text-ink">
              The structured data that matters here
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
              Choosing the most specific applicable type is what turns a generic business into a recognisable{" "}
              {data.singular}.
            </p>
            <ul className="mt-5 space-y-2.5">
              {data.schemaTypes.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-brand-500" />
                  <code className="rounded bg-surface-3 px-2 py-0.5 font-mono text-[13px] text-ink">{t}</code>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-[24px] font-bold tracking-tight text-ink">
              What corroboration looks like
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
              Engines weigh what other sources say about you. In this vertical, these are the sources that carry weight.
            </p>
            <ul className="mt-5 space-y-2.5">
              {data.proofSignals.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-[14.5px] text-ink">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title={`Questions from ${data.name}.`} align="left" className="max-w-2xl" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {faq.map((f) => (
              <Reveal key={f.q}>
                <div className="h-full rounded-2xl border border-line bg-white p-6">
                  <h3 className="font-display text-[16px] font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Internal linking — real navigation, not a footer dump */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">AEO for other industries</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/answer-engine-optimization/${o.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
              >
                {o.name.charAt(0).toUpperCase() + o.name.slice(1)}
              </Link>
            ))}
          </div>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/answer-engine-optimization">
              What answer engine optimization is <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
