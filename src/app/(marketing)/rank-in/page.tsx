import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { EngineIcon } from "@/components/ui/engine-icon";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { ENGINE_GUIDES } from "@/content/engines";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";

const TITLE = "How to Rank in AI Search Engines";
const DESCRIPTION =
  "Engine-by-engine guides to getting your business named in ChatGPT, Perplexity, Google AI Overviews, Claude and Microsoft Copilot — how each retrieves, and what actually moves it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/rank-in" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/rank-in", type: "website", images: ["/opengraph-image"] },
};

export default function RankInHubPage() {
  return (
    <>
      <PageJsonLd path="/rank-in" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Rank in AI engines", path: "/rank-in" },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Engine guides"
            title="How to rank in AI search engines."
            description="The engines do not work the same way. One retrieves on every query and cites everything; another answers largely from training data and names businesses sparingly; a third is generated from Google's ordinary Search index. What moves each one differs accordingly."
            align="left"
            className="max-w-3xl"
          />
        </div>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-2">
            {ENGINE_GUIDES.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 2) * 70}>
                <Link
                  href={`/rank-in/${e.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2">
                    <EngineIcon engine={e.key} size={20} />
                  </span>
                  <h2 className="mt-5 font-display text-[19px] font-bold tracking-tight text-ink">{e.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-ink-faint">{e.vendor}</p>
                  <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-muted">{e.metaDescription}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                    Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10 rounded-2xl border border-line bg-surface-2 p-8">
            <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">
              Work them in parallel, not in sequence.
            </h2>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              Most of the underlying work — entity clarity, retrievable content, corroboration — helps every engine at
              once. The engine-specific parts are smaller than they look. That is why the guarantee is set at{" "}
              {GUARANTEE_MIN_ENGINES}+ engines within {GUARANTEE_DAYS} days rather than one engine at a time.
            </p>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
