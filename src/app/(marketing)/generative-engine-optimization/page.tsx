import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { COMPARISON, GEO_ANSWER, GEO_FAQ, LEVERS, ORIGIN, SAME_THING } from "@/content/geo";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

const PATH = "/generative-engine-optimization";
const TITLE = "Generative Engine Optimization (GEO)";
const DESCRIPTION =
  "What GEO is, where the term actually came from, and why it describes the same work as AEO. The levers that move visibility in generated answers, and how it's measured.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article", images: ["/opengraph-image"] },
};

export default function GeoPage() {
  return (
    <>
      <PageJsonLd path={PATH} name={TITLE} description={DESCRIPTION} />
      <FaqJsonLd path={PATH} items={GEO_FAQ} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Generative engine optimization", path: PATH },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="GEO"
            title="Generative engine optimization."
            description="Getting named inside the answer an AI assistant generates, rather than ranked in a list of links underneath it. Here is what the work is, where the term came from, and why it is the same thing as AEO."
            align="left"
            className="max-w-3xl"
          />

          <Reveal delay={60} className="mt-8 max-w-3xl">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 md:p-7">
              <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">{GEO_ANSWER.question}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.75] text-ink">{GEO_ANSWER.answer}</p>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-8 max-w-xl">
            <ScanForm size="md" />
          </Reveal>
        </div>
      </Section>

      {/* The origin — cited precisely, because nearly every page on this topic
          gestures at "research" without naming it. */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="Where the term came from"
            title="A 2023 paper, not a marketing campaign."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <Reveal>
              <ul className="space-y-3">
                {ORIGIN.what.map((w) => (
                  <li key={w} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-muted">
                    <Check className="mt-1 size-4 shrink-0 text-brand-500" />
                    {w}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[14px] leading-relaxed text-ink-faint">{ORIGIN.caveat}</p>
            </Reveal>

            <Reveal delay={80}>
              <Card className="p-6">
                <BookOpen className="size-5 text-brand-500" />
                <h3 className="mt-3 font-display text-[16px] font-semibold leading-snug text-ink">{ORIGIN.title}</h3>
                <dl className="mt-4 space-y-3 text-[13.5px] leading-relaxed">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Authors</dt>
                    <dd className="mt-0.5 text-ink-muted">{ORIGIN.authors}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Affiliations</dt>
                    <dd className="mt-0.5 text-ink-muted">{ORIGIN.affiliations}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Published</dt>
                    <dd className="mt-0.5 text-ink-muted">{ORIGIN.published}</dd>
                  </div>
                </dl>
                <a
                  href={ORIGIN.url}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink underline-offset-4 hover:underline"
                >
                  Read the paper <ArrowRight className="size-3.5" />
                </a>
              </Card>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* GEO vs AEO vs SEO */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The comparison people actually want"
            title="GEO, AEO and SEO side by side."
            description="Two of these three are the same discipline. The one that differs, differs in what it is aiming at — which changes what success even looks like."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint" />
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Competes for
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Unit of success
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Winning means
                  </th>
                  <th className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Timescale</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((d) => (
                  <tr key={d.label} className="border-b border-line align-top last:border-0">
                    <td className="py-4 pr-4">
                      <span
                        className={
                          d.isUs
                            ? "inline-block rounded-md bg-brand-500/12 px-2.5 py-1 font-display text-[14px] font-bold text-brand-700"
                            : "inline-block px-0.5 py-1 font-display text-[14px] font-bold text-ink"
                        }
                      >
                        {d.label}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[14px] leading-relaxed text-ink-muted">{d.target}</td>
                    <td className="py-4 pr-4 text-[14px] leading-relaxed text-ink-muted">{d.unit}</td>
                    <td className="py-4 pr-4 text-[14px] leading-relaxed text-ink-muted">{d.wins}</td>
                    <td className="py-4 text-[14px] leading-relaxed text-ink-muted">{d.timescale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* The position most vendors won't take */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="Say it plainly" title={SAME_THING.heading} align="left" className="max-w-2xl" />
          <div className="mt-6 max-w-3xl space-y-4">
            {SAME_THING.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-[15.5px] leading-[1.75] text-ink-muted">
                {p}
              </p>
            ))}
          </div>
          <Reveal delay={80} className="mt-8">
            <div className="flex flex-wrap gap-2.5">
              {SAME_THING.labels.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-line bg-white px-4 py-2 font-mono text-[13px] text-ink-muted"
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-2xl border-l-2 border-brand-500 pl-5 text-[16px] font-medium leading-relaxed text-ink">
              {SAME_THING.punchline}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* The actual work */}
      <Section className="py-14 md:py-18">
        <div className="container-x">
          <SectionHeading
            eyebrow="The work"
            title="Six levers, in rough order of leverage."
            description="Nothing here is specific to the GEO label. It is what moves visibility in a generated answer, whatever you call the discipline."
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {LEVERS.map((l, i) => (
              <Reveal key={l.title} delay={(i % 2) * 70}>
                <Card className="h-full p-6">
                  <span className="font-mono text-[12px] font-medium text-brand-500">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-[16px] font-semibold text-ink">{l.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{l.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-surface-2 py-14 md:py-18">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="GEO questions." align="left" className="max-w-2xl" />
          <dl className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
            {GEO_FAQ.map((f) => (
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

      <Section className="py-14 md:py-18">
        <div className="container-x">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Where to go next</h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink-muted">
            We sell this as a fixed engagement: {PRICE_LABEL} once, {GUARANTEE_DAYS} days, refunded in full if at least{" "}
            {GUARANTEE_MIN_ENGINES} of the four engines still don&apos;t mention you.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { href: "/answer-engine-optimization", label: "The AEO engagement" },
              { href: "/ai-brand-mentions", label: "Tracking AI brand mentions" },
              { href: "/rank-in/chatgpt", label: "How to get ranked on ChatGPT" },
              { href: "/rank-in", label: "All engine guides" },
              { href: "/glossary/generative-engine-optimization", label: "GEO, defined in one sentence" },
              { href: "/guarantee", label: "How the guarantee is judged" },
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
              What it costs <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
