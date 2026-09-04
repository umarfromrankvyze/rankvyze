import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { GLOSSARY } from "@/content/glossary";
import { SITE_URL } from "@/lib/site";

const TITLE = "AI Search & AEO Glossary";
const DESCRIPTION =
  "Plain definitions of the terms used in AI search and answer engine optimization — AEO, GEO, AI Overviews, llms.txt, grounding, structured data and the rest.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossary" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/glossary", type: "website", images: ["/opengraph-image"] },
};

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <>
      <PageJsonLd path="/glossary" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Glossary", path: "/glossary" },
        ]}
      />
      {/* A DefinedTermSet is the correct type for this page, and it lets an
          engine take the whole vocabulary rather than one term at a time. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            "@id": `${SITE_URL}/glossary#termset`,
            name: TITLE,
            url: `${SITE_URL}/glossary`,
            hasDefinedTerm: sorted.map((t) => ({
              "@type": "DefinedTerm",
              "@id": `${SITE_URL}/glossary/${t.slug}#term`,
              name: t.term,
              description: t.definition,
              url: `${SITE_URL}/glossary/${t.slug}`,
            })),
          }),
        }}
      />

      <Section className="pb-10 md:pb-14">
        <div className="container-x">
          <SectionHeading
            level={1}
            eyebrow="Glossary"
            title="The vocabulary of AI search."
            description="This field has collected an unusual number of names for the same handful of ideas. These are the definitions we use, written to be read rather than to sound impressive."
            align="left"
            className="max-w-3xl"
          />
        </div>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="container-x">
          <dl className="grid gap-4 md:grid-cols-2">
            {sorted.map((t, i) => (
              <Reveal key={t.slug} delay={(i % 2) * 50}>
                <Link
                  href={`/glossary/${t.slug}`}
                  className="group block h-full rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <dt className="font-display text-[17px] font-bold tracking-tight text-ink group-hover:text-brand-600">
                    {t.term}
                  </dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{t.definition}</dd>
                </Link>
              </Reveal>
            ))}
          </dl>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
