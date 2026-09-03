import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { POSTS } from "@/content/blog";
import { readingMinutes } from "@/content/blog/types";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, PageJsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site";

const TITLE = "AEO blog: how to rank in AI search";
const DESCRIPTION =
  "Practical guides on getting recommended by ChatGPT, Perplexity, Gemini and Google AI Overviews — written from what we see in real engine research.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` },
  },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/blog", type: "website" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogIndex() {
  const [lead, ...rest] = POSTS;

  return (
    <div className="container-x py-16 md:py-24">
      <PageJsonLd path="/blog" name={TITLE} description={DESCRIPTION} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      {/* An ItemList of the posts, so the index itself is legible as a collection. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            name: TITLE,
            description: DESCRIPTION,
            url: `${SITE_URL}/blog`,
            blogPost: POSTS.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              description: p.description,
              url: `${SITE_URL}/blog/${p.slug}`,
              datePublished: p.publishedAt,
              dateModified: p.updatedAt ?? p.publishedAt,
            })),
          }),
        }}
      />

      <header className="mx-auto max-w-3xl">
        <p className="eyebrow">Blog</p>
        <h1 className="mt-4 text-balance font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.4rem]">
          How AI engines decide who to recommend.
        </h1>
        <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-muted md:text-lg">
          Guides on answer engine optimization, written from what we actually see when we run buyer questions through
          ChatGPT, Perplexity, Gemini and Claude. No growth-hack listicles.
        </p>
      </header>

      {/* Lead article */}
      <Link
        href={`/blog/${lead.slug}`}
        className="group mt-14 block rounded-3xl border border-line bg-white p-7 transition-colors hover:border-ink/25 md:p-10"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-faint">
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[12px] font-semibold text-brand-600">
            {lead.category}
          </span>
          <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{readingMinutes(lead)} min read</span>
        </div>
        <h2 className="mt-5 text-balance font-display text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-ink md:text-[38px]">
          {lead.title}
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-[16.5px] leading-[1.7] text-ink-muted">{lead.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          Read the guide
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>

      {/* The rest */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-ink/25"
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-faint">
              <span className="font-semibold text-brand-600">{post.category}</span>
              <span aria-hidden>·</span>
              <span>{readingMinutes(post)} min read</span>
            </div>
            <h2 className="mt-3.5 text-balance font-display text-[19px] font-bold leading-[1.25] tracking-[-0.015em] text-ink">
              {post.title}
            </h2>
            <p className="mt-3 flex-1 text-pretty text-[15px] leading-[1.65] text-ink-muted">{post.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
              Read
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-line bg-surface-2 p-8 text-center md:p-10">
        <p className="font-display text-[22px] font-bold tracking-tight text-ink">
          Want to know where you actually stand?
        </p>
        <p className="mt-2 text-[15px] text-ink-muted">
          The scan checks the technical half of everything above in about ten seconds. It&rsquo;s free.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/pricing">
            Analyze My Website <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
