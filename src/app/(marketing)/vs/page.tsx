import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { COMPARED_ON, COMPARISONS } from "@/content/comparisons";

const TITLE = "RankVyze Compared";
const DESCRIPTION =
  "Head-to-head with Otterly.AI, Profound and Rank Prompt. Verified pricing, and a named case for buying each of them instead of us.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vs" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/vs", type: "website", images: ["/opengraph-image"] },
};

export default function ComparisonsHub() {
  return (
    <>
      <PageJsonLd path="/vs" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Comparisons", path: "/vs" },
        ]}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Comparisons"
            title="How we compare, including where we lose."
            description={`Written by us, so read them knowing that. Each one names something the other product does better and a specific reader who should buy it instead — a comparison with a foregone conclusion tells you nothing. Checked ${COMPARED_ON}.`}
            align="left"
            className="max-w-3xl"
          />
        </div>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-3">
            {COMPARISONS.map((c, i) => (
              <Reveal key={c.slug} delay={i * 60}>
                <Link
                  href={`/vs/${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">
                    {c.name} <span className="text-ink-faint">vs</span> RankVyze
                  </h2>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-muted">{c.realDifference.heading}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                    Read it <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Button variant="outline" className="mt-8" asChild>
            <Link href="/ai-visibility-tools">
              Or see all nine tools compared <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
