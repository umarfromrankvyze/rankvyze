import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CONTENT_PAGES, getContentPage } from "@/content/pages";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FaqJsonLd, PageJsonLd } from "@/components/seo/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONTENT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getContentPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    // Declaring an openGraph block without `images` suppresses the file-based
  // card from app/opengraph-image.tsx, which is how /blog and the content pages
  // ended up with no og:image at all. Naming it explicitly restores it.
  openGraph: { title: page.title, description: page.description, url: `/${page.slug}`, type: "article", images: ["/opengraph-image"] },
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getContentPage(slug);
  if (!page) notFound();

  // The FAQ page is genuinely a set of question/answer pairs, so it earns
  // FAQPage markup — every entry below is visible on the page itself.
  const faqItems =
    page.slug === "faq"
      ? page.blocks
          .filter((b) => b.heading && b.paragraphs?.length)
          .map((b) => ({ q: b.heading!, a: b.paragraphs!.join(" ") }))
      : [];

  return (
    <article className="container-x py-16 md:py-24">
      <PageJsonLd path={`/${page.slug}`} name={page.title} description={page.description} updated={page.updated} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: page.eyebrow, path: `/${page.slug}` },
        ]}
      />
      {faqItems.length > 0 && <FaqJsonLd path={`/${page.slug}`} items={faqItems} />}

      <header className="mx-auto max-w-3xl">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 className="mt-4 text-balance font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.4rem]">{page.title}</h1>
        <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-muted md:text-lg">{page.description}</p>
        {page.updated && (
          <p className="mt-4 text-[12.5px] text-ink-faint">
            Last updated <time dateTime={new Date(page.updated).toISOString().slice(0, 10)}>{page.updated}</time>
          </p>
        )}
      </header>

      <div className="mx-auto mt-14 max-w-3xl space-y-10">
        {page.blocks.map((b, i) => (
          <section key={i}>
            {b.heading && <h2 className="font-display text-[22px] font-bold tracking-tight text-ink md:text-[26px]">{b.heading}</h2>}
            {b.paragraphs?.map((p, j) => (
              <p key={j} className="mt-4 text-[16px] leading-[1.75] text-ink-muted">
                {p}
              </p>
            ))}
            {b.bullets && (
              <ul className="mt-4 space-y-2.5">
                {b.bullets.map((li) => (
                  <li key={li} className="flex items-start gap-3 text-[16px] leading-relaxed text-ink-muted">
                    <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {li}
                  </li>
                ))}
              </ul>
            )}
            {b.links && (
              <ul className="mt-5 space-y-3">
                {b.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink/25 hover:bg-surface-2"
                    >
                      <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand-500" />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-ink">{l.label}</span>
                        <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-muted">{l.note}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-line bg-surface-2 p-8 md:p-10">
        <p className="font-display text-[22px] font-bold tracking-tight text-ink">See where you stand first.</p>
        <p className="mt-2 text-[15px] text-ink-muted">The scan is free and takes about ten seconds.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/pricing">
            Analyze My Website <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}
