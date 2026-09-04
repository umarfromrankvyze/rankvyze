import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/sections/cta";
import { ToolRunner } from "@/components/tools/tool-runner";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { TOOLS, getTool } from "@/content/tools";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const tool = getTool((await params).tool);
  if (!tool) return {};
  return {
    title: tool.seoTitle,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: tool.seoTitle,
      description: tool.description,
      url: `/tools/${tool.slug}`,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const tool = getTool((await params).tool);
  if (!tool) notFound();

  const related = tool.related.map((slug) => getTool(slug)).filter((t) => t !== undefined);

  return (
    <>
      <PageJsonLd path={`/tools/${tool.slug}`} name={tool.seoTitle} description={tool.description} />
      <FaqJsonLd path={`/tools/${tool.slug}`} items={tool.faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools" },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ]}
      />
      {/* The tool itself is the product on this page, so it gets its own node. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": `${SITE_URL}/tools/${tool.slug}#app`,
            name: tool.name,
            description: tool.description,
            url: `${SITE_URL}/tools/${tool.slug}`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          }),
        }}
      />

      <Section className="pb-12 md:pb-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-faint transition-colors hover:text-ink pointer-coarse:min-h-11"
            >
              <ArrowLeft className="size-3.5" /> All free tools
            </Link>

            <h1 className="mt-6 text-balance font-display text-[2.1rem] font-bold leading-[1.06] tracking-[-0.03em] text-ink md:text-[2.9rem]">
              {tool.heading}
            </h1>
            <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-muted">{tool.description}</p>

            <div className="mt-9">
              <ToolRunner
                slug={tool.slug as "ai-crawler-checker" | "schema-markup-checker" | "meta-tag-checker" | "domain-age-checker"}
                placeholder={tool.placeholder}
                action={tool.action}
              />
            </div>

            <ul className="mt-8 space-y-2.5">
              {tool.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] text-ink-faint">
              Free, no signup, no rate limit. Nothing you check is stored.
            </p>
          </div>
        </div>
      </Section>

      {/* FAQ — every pair is also in the FAQPage markup above. */}
      <Section className="bg-surface-2 py-16 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-ink md:text-[28px]">
              Questions about this tool
            </h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {tool.faq.map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{item.q}</dt>
                  <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">Other free tools</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/tools/${r.slug}`}
                  className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/25"
                >
                  <span className="font-display text-[16px] font-bold tracking-tight text-ink">{r.name}</span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-muted">{r.blurb}</span>
                </Link>
              ))}
              <Link
                href="/pricing"
                className="group rounded-2xl border border-brand-500/30 bg-brand-50/50 p-5 transition-colors hover:border-brand-500/60"
              >
                <span className="font-display text-[16px] font-bold tracking-tight text-ink">AEO Scanner</span>
                <span className="mt-1.5 block text-[14px] leading-relaxed text-ink-muted">
                  All ten signals at once, scored out of 100.
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-600">
                  Run a scan <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
