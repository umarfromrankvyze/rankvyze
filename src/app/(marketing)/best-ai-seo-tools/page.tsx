import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { FAQ, PRICES_VERIFIED, SECTIONS, TOOLS_COMPARED } from "@/content/ai-seo-tools";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * One page for a seven-keyword cluster: "best AI SEO tools", "best GEO tools",
 * "best AI visibility tools", "best tools to rank on ChatGPT", "best ChatGPT
 * SEO tools", "best AI search optimization tools", "best software for AI search
 * visibility".
 *
 * One page rather than seven, because they are the same question in different
 * vocabulary. Seven near-identical pages would compete with each other and read
 * as doorway pages; instead each phrasing gets its own H2 answering that exact
 * sub-question, which is what a passage extractor pulls from.
 *
 * We are in the comparison and we are not at the top of it by assertion — the
 * table is ordered by price, every entry carries a caveat including ours, and
 * the honest reason to pick us (one-time, implements) is stated as a category
 * difference rather than a claim of superiority. A listicle that concludes its
 * author wins every axis is discounted by readers and models alike.
 */

const TITLE = "Best AI SEO & GEO Tools (2026)";
const DESCRIPTION = `Every AI visibility tool compared, with real prices from $29–$800/mo. Most only measure. We rank your business on ChatGPT for ${PRICE_LABEL} in ${GUARANTEE_DAYS} days, or refund it.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/best-ai-seo-tools" },
  keywords: [
    "best AI SEO tools",
    "best GEO tools",
    "best AI visibility tools",
    "best tools to rank on ChatGPT",
    "best ChatGPT SEO tools",
    "best AI search optimization tools",
    "best software for AI search visibility",
  ],
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/best-ai-seo-tools", type: "article", images: ["/opengraph-image"] },
};

const SOURCE_LABEL = {
  vendor: "vendor's own pricing page",
  semrush: "Semrush's GEO tools comparison",
} as const;

export default function BestAiSeoToolsPage() {
  const path = "/best-ai-seo-tools";

  return (
    <>
      <PageJsonLd path={path} name={TITLE} description={DESCRIPTION} updated="2026-09-06" />
      <FaqJsonLd path={path} items={FAQ} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Best AI SEO tools", path },
        ]}
      />
      {/* An ItemList of the tools, so the comparison is machine-readable as a
          list of products rather than prose an engine has to parse. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${SITE_URL}${path}#tools`,
            name: "AI SEO and GEO tools compared",
            numberOfItems: TOOLS_COMPARED.length,
            itemListElement: TOOLS_COMPARED.map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "SoftwareApplication",
                name: tool.name,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                description: `${tool.kind}. ${tool.bestFor}.`,
                url: tool.url.startsWith("http") ? tool.url : `${SITE_URL}${tool.url}`,
              },
            })),
          }),
        }}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Comparison</p>
            <h1 className="mt-4 text-balance font-display text-[2.2rem] font-bold leading-[1.06] tracking-[-0.03em] text-ink md:text-[3rem]">
              The best AI SEO and GEO tools, compared honestly.
            </h1>

            {/* Answer box: the passage an engine can lift whole. */}
            <div className="mt-8 rounded-2xl border border-brand-500/30 bg-brand-50/50 p-6">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">
                What is the best AI SEO tool?
              </h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">
                It depends on whether you want to <strong className="font-semibold">measure</strong> or to be{" "}
                <strong className="font-semibold">found</strong>. Almost every tool in this category is a monthly
                subscription that tracks whether AI engines mention you — from $29/mo (Otterly.AI) to $800/mo
                (Evertune), with most clustering at $95–$99/mo. None of them changes your site. RankVyze is the
                exception on this list: {PRICE_LABEL} once for a {GUARANTEE_DAYS}-day sprint that measures, implements
                the fixes and re-measures — refunded in full if you aren&rsquo;t mentioned on {GUARANTEE_MIN_ENGINES}+
                engines.
              </p>
            </div>

            <p className="mt-6 text-[16.5px] leading-[1.75] text-ink-muted">
              Prices below were read from each vendor&rsquo;s own page or from Semrush&rsquo;s published comparison, and
              the source is named next to every figure. Verified {PRICES_VERIFIED}. Nothing here is estimated — where a
              vendor publishes no price, the table says so.
            </p>
          </div>
        </div>
      </Section>

      {/* The table */}
      <Section className="py-10 md:py-14">
        <div className="container-x">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-ink md:text-[30px]">
              Every AI visibility tool, side by side
            </h2>
            <p className="mt-2 text-[15px] text-ink-muted">
              Ordered by published starting price. The column that matters most is the first one.
            </p>

            <div className="mt-7 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-2">
                    {["Tool", "Measures or fixes", "Price", "Engines", "Worth knowing"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-line px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOOLS_COMPARED.map((tool) => (
                    <tr key={tool.name} className={cn("border-b border-line last:border-0", tool.us && "bg-brand-50/40")}>
                      <td className="px-4 py-4 align-top">
                        <span className="block font-semibold text-ink">{tool.name}</span>
                        {tool.us && (
                          <span className="mt-1 inline-block rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">
                            That&rsquo;s us
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={cn(
                            "inline-block rounded-md border px-2 py-0.5 text-[11.5px] font-semibold",
                            tool.kind === "Measures + fixes"
                              ? "border-green-200 bg-success-soft text-green-700"
                              : "border-line bg-surface-3 text-ink-muted",
                          )}
                        >
                          {tool.kind}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="block font-medium tabular-nums text-ink">{tool.price}</span>
                        <span className="mt-0.5 block text-[11.5px] text-ink-faint">{SOURCE_LABEL[tool.source]}</span>
                      </td>
                      <td className="px-4 py-4 align-top text-[13.5px] leading-relaxed text-ink-muted">{tool.engines}</td>
                      <td className="px-4 py-4 align-top text-[13.5px] leading-relaxed text-ink-muted">
                        <span className="block text-ink">{tool.bestFor}</span>
                        <span className="mt-1 block text-ink-faint">{tool.caveat}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-ink-faint">
              Every row carries a caveat, including ours. A comparison whose author wins every column is discounted by
              readers and by the engines reading it — so the honest version is that eight of these nine tools do a job
              we don&rsquo;t do, and we do a job they don&rsquo;t.
            </p>
          </div>
        </div>
      </Section>

      {/* The keyword-variant sections, each answering its own sub-question. */}
      <Section className="bg-surface-2 py-14 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <h2
                  id={section.id}
                  className="scroll-mt-28 font-display text-[24px] font-bold tracking-[-0.025em] text-ink md:text-[28px]"
                >
                  {section.heading}
                </h2>
                <p className="mt-4 text-[16.5px] leading-[1.78] text-ink-muted">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Where we fit — stated as a category difference, not a superlative. */}
      <Section className="py-14 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-ink md:text-[28px]">
              Where RankVyze fits, and where it doesn&rsquo;t
            </h2>
            <p className="mt-4 text-[16.5px] leading-[1.78] text-ink-muted">
              We are not a tracker, and if a tracker is what you need we are the wrong purchase. Everything above sells
              you a dashboard on a monthly subscription. RankVyze is {PRICE_LABEL} once for a {GUARANTEE_DAYS}-day
              engagement: we measure across four engines, audit the site, implement the fixes as changes you review, and
              re-measure against the day-zero baseline.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                `${PRICE_LABEL} once, not per month — the whole engagement`,
                "Implementation included, not a list of recommendations",
                "Research by analysts in signed-out sessions, not through an API that behaves differently",
                `Refunded in full if you aren't mentioned on ${GUARANTEE_MIN_ENGINES}+ engines in ${GUARANTEE_DAYS} days`,
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-6">
              <p className="text-[15px] font-semibold text-ink">Pick a tracker instead if…</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                …you need daily monitoring across hundreds of prompts indefinitely, you already have a team who will act
                on the data, or your site&rsquo;s technical basics are already sound and you only want instrumentation.
                Those are real cases, and a subscription serves them better than we do.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  Analyze my website free <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tools/ai-visibility-checker">Try the free visibility checker</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ — every pair below is also in the FAQPage markup above. */}
      <Section className="bg-surface-2 py-14 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-ink md:text-[28px]">
              Frequently asked questions
            </h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {FAQ.map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{item.q}</dt>
                  <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* Sources, because every price above is a checkable claim. */}
      <Section className="py-12">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">Sources</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Otterly.AI pricing", href: "https://otterly.ai/pricing/", note: "Read directly; $29 / $189 / $489 per month." },
                {
                  label: "Semrush — best generative engine optimization tools",
                  href: "https://www.semrush.com/blog/best-generative-engine-optimization-tools/",
                  note: "Published starting prices for Profound, Peec, Scrunch, Writesonic, Evertune and Conductor.",
                },
                { label: "Peec AI pricing", href: "https://www.peec.ai/pricing", note: "Four tiers listed, no figures published." },
              ].map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink/25 hover:bg-surface-2"
                  >
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand-500" />
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-semibold text-ink">{s.label}</span>
                      <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-muted">{s.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-ink-faint">
              Prices verified {PRICES_VERIFIED}. This category changes quickly — check the vendor before committing.
            </p>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
