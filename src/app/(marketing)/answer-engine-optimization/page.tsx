import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { ScanForm } from "@/components/marketing/scan-form";
import { FinalCta } from "@/components/marketing/sections/cta";
import { EngineIcon } from "@/components/ui/engine-icon";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { ENGINES_COVERED, SERVICE_FAQ, WHAT_WE_DO } from "@/content/services";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

/**
 * The commercial page for the category's highest-intent queries — "answer
 * engine optimization agency", "AEO services", "ChatGPT SEO agency".
 *
 * Nothing on the site targeted them before: the blog answers how-to questions,
 * and /pricing answers "what does it cost", but a searcher typing "AEO agency"
 * wants to hire someone and was landing on neither.
 *
 * The URL is the term itself rather than /services, because the phrase is the
 * query and a self-describing path is one of the few free signals left.
 */

const TITLE = "Answer Engine Optimization Services";
const DESCRIPTION = `Get recommended by ChatGPT, Perplexity, Gemini and Claude. ${PRICE_LABEL} flat for a ${GUARANTEE_DAYS}-day sprint — refunded in full if you aren't mentioned.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/answer-engine-optimization" },
  // Declaring an openGraph block without `images` suppresses the file-based
  // card from app/opengraph-image.tsx, which is how /blog and the content pages
  // ended up with no og:image at all. Naming it explicitly restores it.
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/answer-engine-optimization", type: "website", images: ["/opengraph-image"] },
};

export default function AnswerEngineOptimizationPage() {
  return (
    <>
      <PageJsonLd path="/answer-engine-optimization" name={TITLE} description={DESCRIPTION} />
      <ServiceJsonLd />
      <FaqJsonLd path="/answer-engine-optimization" items={SERVICE_FAQ} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Answer Engine Optimization", path: "/answer-engine-optimization" },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Answer Engine Optimization"
            title="Get recommended by ChatGPT, not just ranked on Google."
            description={`Answer engine optimization is the work of making a business legible enough that AI systems name it inside an answer. We measure where you stand today, fix what's stopping you, and re-measure — for ${PRICE_LABEL}, refunded in full if it doesn't move.`}
          />

          <Reveal delay={80} className="mx-auto mt-10 max-w-xl">
            <ScanForm />
            <p className="mt-3 text-center text-[13px] text-ink-faint">
              Free instant scan of your homepage. No account, no card.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* What it is — the definitional passage an engine can lift whole. */}
      <Section className="py-12 md:py-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-[26px] font-bold tracking-[-0.025em] text-ink md:text-[32px]">
              What is answer engine optimization?
            </h2>
            <p className="mt-5 text-[17px] leading-[1.75] text-ink-muted">
              <strong className="font-semibold text-ink">
                Answer engine optimization (AEO) is the practice of making a business legible and credible enough that
                AI systems recommend it inside a generated answer
              </strong>{" "}
              — named in a paragraph, rather than ranked in a list of links. You will see the same idea called
              Generative Engine Optimization (GEO), LLM SEO or AI search optimization. The labels differ; the work
              doesn&rsquo;t.
            </p>
            <p className="mt-4 text-[17px] leading-[1.75] text-ink-muted">
              It needed a new name because SEO&rsquo;s model assumes an ordered list of documents and a user who picks
              from it. Answer engines break both halves: there is no list to be positioned in, and increasingly no
              click. That changes the unit of optimization. In SEO you optimize a <em>page</em> for a <em>query</em>. In
              AEO you make an <em>entity</em> legible for a <em>question</em> — which is why sites with excellent Google
              rankings are routinely invisible in an AI answer.
            </p>
            <p className="mt-4 text-[17px] leading-[1.75] text-ink-muted">
              For a longer treatment, read{" "}
              <Link href="/blog/what-is-answer-engine-optimization" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
                what answer engine optimization is
              </Link>{" "}
              or{" "}
              <Link href="/blog/how-to-rank-on-chatgpt" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
                how to rank on ChatGPT
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section className="bg-surface-2 py-16 md:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="The engagement"
            title="What the work actually involves."
            description={`Four steps over ${GUARANTEE_DAYS} days. Nothing ships to your site without your review.`}
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
            {WHAT_WE_DO.map((step, i) => (
              <Reveal key={step.title} delay={i * 70}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-card">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-[19px] font-bold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.7] text-ink-muted">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Engines */}
      <Section className="py-16 md:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Coverage"
            title="Which engines we optimize for."
            description="The four that answer commercial questions today. Each has its own crawler, its own controls and its own idea of who to recommend."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {ENGINES_COVERED.map((engine, i) => (
              <Reveal key={engine.key} delay={i * 60}>
                <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-6 shadow-card">
                  <EngineIcon engine={engine.key} size={22} />
                  <div className="min-w-0">
                    <h3 className="font-display text-[17px] font-bold tracking-tight text-ink">{engine.name}</h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-ink-muted">{engine.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Price */}
      <Section className="bg-surface-2 py-16 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-brand-700">
              <ShieldCheck className="size-3.5" /> {GUARANTEE_DAYS}-day guarantee
            </p>
            <h2 className="mt-5 font-display text-[30px] font-bold tracking-[-0.03em] text-ink md:text-[38px]">
              {PRICE_LABEL} once. Not a retainer.
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
              Most agencies in this category quote $2,000–$10,000 a month and won&rsquo;t publish a number at all. This
              is one flat payment for the whole {GUARANTEE_DAYS}-day sprint — and if your business isn&rsquo;t mentioned
              on {GUARANTEE_MIN_ENGINES} or more engines by the end of it, you get all of it back.
            </p>
            <ul className="mx-auto mt-8 grid max-w-md gap-2.5 text-left">
              {[
                "Baseline research across all four engines",
                "Full AEO audit, scored across six categories",
                "Implementation delivered as reviewable changes",
                "Re-measurement against the day-zero baseline",
                "Full refund if the guarantee isn't met",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  See what&rsquo;s included <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/guarantee">Read the guarantee terms</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ — every pair here is also in the FAQPage markup above. */}
      <Section className="py-16 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Questions people ask before hiring." />
          <dl className="mx-auto mt-12 max-w-3xl divide-y divide-line border-y border-line">
            {SERVICE_FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{item.q}</dt>
                <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
