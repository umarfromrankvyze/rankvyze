import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/sections/cta";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { GLOSSARY, getGlossaryTerm, relatedTerms } from "@/content/glossary";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params;
  const data = getGlossaryTerm(term);
  if (!data) return {};
  const path = `/glossary/${data.slug}`;
  // The definition is already a complete sentence, which is exactly what a
  // meta description should be — no need to write a second, worse one.
  return {
    title: `${data.term} — Definition`,
    description: data.definition,
    alternates: { canonical: path },
    openGraph: {
      title: `${data.term} — Definition`,
      description: data.definition,
      url: path,
      type: "article",
      images: ["/opengraph-image"],
    },
  };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const data = getGlossaryTerm(term);
  if (!data) notFound();

  const path = `/glossary/${data.slug}`;
  const related = relatedTerms(data.slug);

  return (
    <>
      <PageJsonLd path={path} name={`${data.term} — Definition`} description={data.definition} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Glossary", path: "/glossary" },
          { name: data.term, path },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            "@id": `${SITE_URL}${path}#term`,
            name: data.term,
            description: data.definition,
            url: `${SITE_URL}${path}`,
            inDefinedTermSet: { "@type": "DefinedTermSet", "@id": `${SITE_URL}/glossary#termset` },
          }),
        }}
      />

      <article className="container-x py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink pointer-coarse:min-h-11"
          >
            <ArrowLeft className="size-3.5" /> Glossary
          </Link>

          <h1 className="mt-5 text-balance font-display text-[2.1rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink md:text-[2.7rem]">
            {data.term}
          </h1>

          {data.aka && data.aka.length > 0 && (
            <p className="mt-2 text-[13.5px] text-ink-faint">Also called: {data.aka.join(", ")}</p>
          )}

          {/* The definition is the thing engines lift. It gets its own block so
              it reads as a complete answer with no surrounding dependency. */}
          <p className="mt-6 border-l-2 border-brand-500 pl-5 text-[17px] font-medium leading-relaxed text-ink md:text-[18px]">
            {data.definition}
          </p>

          <div className="mt-8 space-y-4">
            {data.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-[16px] leading-[1.75] text-ink-muted">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-6">
            <h2 className="font-display text-[16px] font-semibold text-ink">Why it matters</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{data.whyItMatters}</p>
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-[16px] font-semibold text-ink">Related terms</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/glossary/${r.slug}`}
                    className="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-[13.5px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink pointer-coarse:min-h-11"
                  >
                    {r.term}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-2.5">
            <Button asChild>
              <Link href="/answer-engine-optimization">
                How AEO works <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/rank-in">Engine guides</Link>
            </Button>
          </div>
        </div>
      </article>

      <Section className="py-0">
        <FinalCta />
      </Section>
    </>
  );
}
