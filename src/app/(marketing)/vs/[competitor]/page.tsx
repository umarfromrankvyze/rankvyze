import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { COMPARED_ON, COMPARISONS, getComparison } from "@/content/comparisons";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = getComparison(competitor);
  if (!data) return {};
  const path = `/vs/${data.slug}`;
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

export default async function ComparisonPage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const data = getComparison(competitor);
  if (!data) notFound();

  const path = `/vs/${data.slug}`;
  const others = COMPARISONS.filter((c) => c.slug !== data.slug);

  return (
    <>
      <PageJsonLd path={path} name={data.metaTitle} description={data.metaDescription} />
      <FaqJsonLd path={path} items={data.faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Comparisons", path: "/vs" },
          { name: data.metaTitle, path },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Comparison"
            title={data.h1}
            description={`Checked ${COMPARED_ON}. Written by RankVyze, so read it knowing that — which is why every section below names something ${data.name} does better than us, and who should buy them instead.`}
            align="left"
            className="max-w-3xl"
          />

          {/* Answer-first: the passage an engine lifts for "X vs Y". */}
          <Reveal delay={60} className="mt-8 max-w-3xl">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">
                {data.name} vs RankVyze — the short answer
              </h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{data.verdict}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* The one axis it turns on */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The real difference"
            title={data.realDifference.heading}
            align="left"
            className="max-w-2xl"
          />
          <p className="mt-5 max-w-3xl text-[15.5px] leading-[1.75] text-ink-muted">{data.realDifference.body}</p>
        </div>
      </Section>

      {/* Side by side */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="Side by side" title="The specifics." align="left" className="max-w-2xl" />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint" />
                  <th className="pb-3 pr-4 font-display text-[15px] font-bold text-ink">{data.name}</th>
                  <th className="pb-3 font-display text-[15px] font-bold text-brand-600">RankVyze</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.label} className="border-b border-line align-top last:border-0">
                    <td className="w-40 py-4 pr-4 text-[12.5px] font-semibold uppercase tracking-wider text-ink-faint">
                      {r.label}
                    </td>
                    <td className="py-4 pr-4 text-[14px] leading-relaxed text-ink-muted">{r.them}</td>
                    <td className="py-4 text-[14px] leading-relaxed text-ink">{r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Who should buy which */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Honestly"
            title="Who should buy which."
            description="A comparison whose conclusion is always “choose us” carries no information. Here is when to choose them."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Choose {data.name} if…</h3>
                <ul className="mt-3 space-y-2">
                  {data.chooseThem.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[14.5px] leading-relaxed text-ink-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                      {x}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
            <Reveal delay={70}>
              <Card className="h-full border-brand-200 bg-brand-50/40 p-6">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Choose RankVyze if…</h3>
                <ul className="mt-3 space-y-2">
                  {data.chooseUs.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[14.5px] leading-relaxed text-ink">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                      {x}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-brand-200/70 pt-3 text-[13.5px] text-ink-muted">
                  {PRICE_LABEL} once · {GUARANTEE_DAYS} days · refunded if fewer than {GUARANTEE_MIN_ENGINES} engines
                  mention you.
                </p>
              </Card>
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-6">
            <div className="max-w-3xl border-l-2 border-brand-500 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                <Scale className="size-3.5" /> Credit where it&apos;s due
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">{data.credit}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title={`${data.name} questions.`} align="left" className="max-w-2xl" />
          <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
            {data.faq.map((f) => (
              <Reveal key={f.q}>
                <div className="py-6">
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{f.q}</dt>
                  <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{f.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <div className="mt-10 max-w-xl">
            <p className="mb-3 text-[14.5px] text-ink">
              Either way, start by finding out where you actually stand. Free, no signup.
            </p>
            <ScanForm size="md" />
          </div>
        </div>
      </Section>

      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Other comparisons</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/vs/${o.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
              >
                {o.name} vs RankVyze
              </Link>
            ))}
            <Link
              href="/ai-visibility-tools"
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
            >
              All nine tools compared
            </Link>
          </div>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/pricing">
              What we charge <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
