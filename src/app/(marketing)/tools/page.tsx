import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { NOT_BUILT, TOOLS, type ToolGroup } from "@/content/tools";
import { SITE_URL } from "@/lib/site";

const GROUP_NOTE: Record<ToolGroup, string> = {
  Diagnose: "find out what's wrong",
  Generate: "produce the file or markup",
  "Look up": "check a fact",
};

const TITLE = "Free SEO & AEO Tools";
const DESCRIPTION =
  "Free tools for AI search: check which AI crawlers can reach your site, audit structured data, preview meta tags, and look up domain age. No signup, no limits.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/tools", type: "website", images: ["/opengraph-image"] },
};

export default function ToolsHubPage() {
  return (
    <>
      <PageJsonLd path="/tools" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools" },
        ]}
      />
      {/* An ItemList so the hub reads as a collection rather than a page that
          happens to contain links. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${SITE_URL}/tools#tools`,
            name: TITLE,
            itemListElement: TOOLS.map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "SoftwareApplication",
                name: tool.name,
                description: tool.description,
                url: `${SITE_URL}/tools/${tool.slug}`,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
            })),
          }),
        }}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Free tools"
            title="Free SEO and AEO tools."
            description="Everything here runs against your live site and returns what it actually found — no signup, no credit card, no rate limit. Built because we needed them ourselves."
          />
        </div>
      </Section>

      <Section className="pb-16 pt-0 md:pb-20">
        <div className="container-x">
          {/* Grouped by verb. Eight tools in one flat grid stops being
              scannable — the shelf label is what tells someone which half of
              the page to read. */}
          <div className="mx-auto max-w-4xl space-y-12">
            {(["Diagnose", "Generate", "Look up"] as ToolGroup[]).map((group) => {
              const items = TOOLS.filter((t) => t.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    {group}
                    <span className="ml-2 font-normal normal-case tracking-normal text-ink-faint/70">
                      {GROUP_NOTE[group]}
                    </span>
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {items.map((tool, i) => (
                      <Reveal key={tool.slug} delay={i * 60}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                        >
                          <h3 className="font-display text-[19px] font-bold tracking-tight text-ink">{tool.name}</h3>
                          <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-ink-muted">{tool.blurb}</p>
                          <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                            Open tool <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* The full scan sits below the shelves, labelled for what it is. */}
            <Reveal delay={120}>
              <div className="flex flex-col justify-between gap-5 rounded-2xl border border-brand-500/30 bg-brand-50/50 p-7 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">AEO Scanner</h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                    The full check: ten weighted signals across entity clarity, structured data, rendering and crawler
                    access, scored out of 100. Also free.
                  </p>
                </div>
                <Button size="lg" className="shrink-0" asChild>
                  <Link href="/pricing">
                    Run a scan <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <Link
              href="/best-ai-seo-tools"
              className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 transition-colors hover:border-ink/25"
            >
              <span className="min-w-0">
                <span className="block font-display text-[17px] font-bold tracking-tight text-ink">
                  Looking for a paid AI visibility tool?
                </span>
                <span className="mt-1.5 block text-[14.5px] leading-relaxed text-ink-muted">
                  We compared nine of them with sourced prices, from $29/mo to $800/mo — including where we&rsquo;re the
                  wrong choice.
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                Read the comparison <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>

          {/* Saying plainly what we did not build, and why. */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="rounded-2xl border border-line bg-surface-2 p-7">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-ink">Two tools we haven&rsquo;t built, on purpose</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
                    Both get asked for constantly. Neither can be done honestly without paying for someone else&rsquo;s
                    index, and a checker that returns numbers we invented would be worse than not having one.
                  </p>
                  <dl className="mt-5 space-y-4">
                    {NOT_BUILT.map((item) => (
                      <div key={item.name}>
                        <dt className="text-[14px] font-semibold text-ink">{item.name}</dt>
                        <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{item.reason}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
