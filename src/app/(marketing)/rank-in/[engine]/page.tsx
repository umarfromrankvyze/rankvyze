import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bot, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { EngineIcon } from "@/components/ui/engine-icon";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { ENGINE_GUIDES, getEngineGuide } from "@/content/engines";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";

export const dynamicParams = false;

export function generateStaticParams() {
  return ENGINE_GUIDES.map((e) => ({ engine: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ engine: string }> }): Promise<Metadata> {
  const { engine } = await params;
  const data = getEngineGuide(engine);
  if (!data) return {};
  const path = `/rank-in/${data.slug}`;
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: path,
      type: "article",
      images: ["/opengraph-image"],
    },
  };
}

export default async function EngineGuidePage({ params }: { params: Promise<{ engine: string }> }) {
  const { engine } = await params;
  const data = getEngineGuide(engine);
  if (!data) notFound();

  const path = `/rank-in/${data.slug}`;
  const others = ENGINE_GUIDES.filter((e) => e.slug !== data.slug);

  return (
    <>
      <PageJsonLd path={path} name={data.metaTitle} description={data.metaDescription} />
      <FaqJsonLd path={path} items={data.faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Rank in AI engines", path: "/rank-in" },
          { name: data.name, path },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white shadow-card">
              <EngineIcon engine={data.key} size={22} />
            </span>
            <span className="text-[13px] font-medium text-ink-faint">{data.vendor}</span>
          </div>
          <SectionHeading
            level={1}
            title={data.h1}
            description={data.intro}
            align="left"
            className="mt-5 max-w-3xl"
          />
          <Reveal delay={80} className="mt-8 max-w-xl">
            <ScanForm size="md" />
          </Reveal>
        </div>
      </Section>

      {/* Mechanism */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Mechanism"
            title={`How ${data.name} builds an answer.`}
            align="left"
            className="max-w-2xl"
          />
          <ol className="mt-8 max-w-3xl space-y-4">
            {data.howItWorks.map((step, i) => (
              <li key={step}>
                <Reveal delay={i * 60}>
                  <div className="flex gap-4 rounded-xl border border-line bg-white p-5">
                    <span className="font-mono text-[13px] font-medium text-brand-500">0{i + 1}</span>
                    <p className="text-[15px] leading-relaxed text-ink">{step}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Crawlers */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="robots.txt"
            title="Which crawlers to allow."
            description="Training crawlers and search crawlers are different agents with different consequences. Blocking the wrong one removes you from the answers while leaving training access untouched."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white">
            {data.crawlers.map((c) => (
              <div key={c.agent} className="flex flex-col gap-1.5 border-b border-line p-5 last:border-0 sm:flex-row sm:gap-6">
                <code className="w-full shrink-0 font-mono text-[13.5px] font-medium text-ink sm:w-56">
                  <Bot className="mr-1.5 inline size-3.5 text-ink-faint" />
                  {c.agent}
                </code>
                <p className="text-[14px] leading-relaxed text-ink-muted">{c.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Levers */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="What actually moves it"
            title={`What works on ${data.name}.`}
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.levers.map((l, i) => (
              <Reveal key={l.title} delay={(i % 2) * 70}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-success-soft">
                      <Check className="size-3.5 text-success" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{l.title}</h3>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{l.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Mistakes + latency */}
      <Section className="py-14 md:py-18">
        <div className="container-x grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-[24px] font-bold tracking-tight text-ink">Common mistakes</h2>
            <ul className="mt-5 space-y-3">
              {data.mistakes.map((m) => (
                <li key={m} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-ink-muted">
                  <X className="mt-1 size-4 shrink-0 text-danger" />
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <Card className="border-brand-200 bg-brand-50/40 p-6">
              <h2 className="inline-flex items-center gap-2 font-display text-[17px] font-bold tracking-tight text-ink">
                <Clock className="size-4 text-brand-500" /> How fast it moves
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink">{data.latency}</p>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title={`${data.name} questions.`} align="left" className="max-w-2xl" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {data.faq.map((f) => (
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

      <Section className="py-14 md:py-18">
        <div className="container-x">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">The other engines</h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink-muted">
            The guarantee is met at {GUARANTEE_MIN_ENGINES}+ engines within {GUARANTEE_DAYS} days, so these are worked in
            parallel rather than one at a time.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/rank-in/${o.slug}`}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink/25"
              >
                <EngineIcon engine={o.key} size={16} />
                <span className="text-[14px] font-medium text-ink">{o.name}</span>
              </Link>
            ))}
          </div>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/answer-engine-optimization">
              How answer engine optimization works <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
