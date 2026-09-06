import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { CHOOSING, PRICING_CHECKED, TOOLS, TOOLS_ANSWER, WHERE_WE_FIT } from "@/content/tools-compared";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

const PATH = "/ai-visibility-tools";
const TITLE = "AI Visibility Tools Compared";
const DESCRIPTION =
  "Otterly, Profound, Rank Prompt, Peec and Scrunch — what each costs per tracked prompt, which engines they cover, and who each is actually for. Pricing read from the vendors' own pages.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article", images: ["/opengraph-image"] },
};

export default function ToolsPage() {
  return (
    <>
      <PageJsonLd path={PATH} name={TITLE} description={DESCRIPTION} />
      <FaqJsonLd path={PATH} items={CHOOSING.map((c) => ({ q: c.q, a: c.a }))} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "AI visibility tools", path: PATH },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Compared"
            title="AI visibility tools, with the pricing actually checked."
            description="Most comparison pages in this category quote prices copied from each other. Every figure marked verified below was read off that vendor's own pricing page — and where a vendor doesn't publish pricing, that's what it says."
            align="left"
            className="max-w-3xl"
          />

          <Reveal delay={60} className="mt-8 max-w-3xl">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">{TOOLS_ANSWER.question}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{TOOLS_ANSWER.answer}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* The table */}
      <Section className="py-8 md:py-12">
        <div className="container-x">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Tool</th>
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Plans
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Prompts
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Per prompt / mo
                  </th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Engines</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t) => (
                  <tr key={t.name} className="border-b border-line align-top last:border-0">
                    <td className="py-4 pr-4">
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener nofollow"
                        className="font-display text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        {t.name}
                      </a>
                      {t.verified ? (
                        <span className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-success">
                          <BadgeCheck className="size-3.5" /> pricing verified
                        </span>
                      ) : (
                        <span className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-faint">
                          <CircleHelp className="size-3.5" /> not published
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-[13.5px] leading-relaxed text-ink-muted">{t.entry}</td>
                    <td className="py-4 pr-4 text-[13.5px] leading-relaxed text-ink-muted tabular-nums">
                      {t.entryPrompts}
                    </td>
                    <td className="py-4 pr-4 font-mono text-[13px] text-ink tabular-nums">{t.costPerPrompt ?? "—"}</td>
                    <td className="py-4 text-[13.5px] leading-relaxed text-ink-muted">{t.engines}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12.5px] text-ink-faint">
            Checked {PRICING_CHECKED}. Cost per prompt is derived, not quoted — it is the headline price divided by the
            prompts that plan covers, which is the number that actually decides this purchase. Pricing changes; verify
            on the vendor&apos;s page before you budget.
          </p>
        </div>
      </Section>

      {/* Who each is for */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="Fit" title="Who each one is actually for." align="left" className="max-w-2xl" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {TOOLS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 60}>
                <Card className="h-full p-6">
                  <h3 className="font-display text-[16px] font-semibold text-ink">{t.name}</h3>
                  <p className="mt-2.5 flex items-start gap-2 text-[14.5px] leading-relaxed text-ink-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {t.bestFor}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-[14px] leading-relaxed text-ink-faint">
                    <X className="mt-0.5 size-4 shrink-0" />
                    {t.watchOut}
                  </p>
                  {t.pricingUrl && (
                    <a
                      href={t.pricingUrl}
                      target="_blank"
                      rel="noopener nofollow"
                      className="mt-3 inline-block text-[13px] font-medium text-ink underline-offset-4 hover:underline"
                    >
                      Their pricing page
                    </a>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Choosing */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Four questions"
            title="How to choose without overbuying."
            description="Plans are sold on prompt volume, which is where most of the overspending in this category happens."
            align="left"
            className="max-w-2xl"
          />
          <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
            {CHOOSING.map((c) => (
              <Reveal key={c.q}>
                <div className="py-6">
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{c.q}</dt>
                  <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{c.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </Section>

      {/* Where we fit */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Disclosure"
            title="We're not on that list, and here's why."
            align="left"
            className="max-w-2xl"
          />
          <p className="mt-5 max-w-3xl text-[15.5px] leading-[1.75] text-ink-muted">{WHERE_WE_FIT.body}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Buy a tool above if…</h3>
                <ul className="mt-3 space-y-2">
                  {WHERE_WE_FIT.useThemIf.map((x) => (
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
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Buy RankVyze if…</h3>
                <ul className="mt-3 space-y-2">
                  {WHERE_WE_FIT.useUsIf.map((x) => (
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
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Button asChild>
              <Link href="/pricing">
                What we charge <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-search-visibility">How we calculate the score</Link>
            </Button>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
