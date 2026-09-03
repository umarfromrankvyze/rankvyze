import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { publishedPost, publishedSlugs, relatedPosts } from "@/lib/blog";
import { postFaq, postSections, readingMinutes } from "@/content/blog/types";
import { PostBody } from "@/components/blog/post-body";
import { Button } from "@/components/ui/button";
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";

/**
 * Posts live in the database now, so a slug published after the last deploy
 * has to render rather than 404 — hence dynamicParams stays on. Known slugs are
 * still prerendered at build time; anything newer is rendered on first request
 * and then cached for the revalidate window.
 */
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await publishedSlugs();
  return rows.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await publishedPost(slug);
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
    twitter: { card: "summary_large_image", title: post.seoTitle ?? post.title, description: post.description },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publishedPost(slug);
  if (!post) notFound();

  const sections = postSections(post);
  const faq = postFaq(post);
  const related = await relatedPosts(post.slug, post.category);

  return (
    <article className="container-x py-12 md:py-20">
      <ArticleJsonLd
        path={`/blog/${post.slug}`}
        headline={post.title}
        description={post.description}
        published={post.publishedAt}
        modified={post.updatedAt}
        section={post.category}
        keywords={post.targets}
      />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      {/* Every pair below is rendered visibly in the FAQ block at the end of the post. */}
      {faq.length > 0 && <FaqJsonLd path={`/blog/${post.slug}`} items={faq} />}

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        All posts
      </Link>

      <header className="mx-auto mt-8 max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-faint">
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[12px] font-semibold text-brand-600">
            {post.category}
          </span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{readingMinutes(post)} min read</span>
        </div>
        <h1 className="mt-5 text-balance font-display text-[2.2rem] font-bold leading-[1.06] tracking-[-0.03em] text-ink md:text-[3.1rem]">
          {post.title}
        </h1>
        <p className="mt-5 text-pretty text-[17px] leading-relaxed text-ink-muted md:text-[19px]">{post.description}</p>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="mx-auto w-full max-w-3xl lg:mx-0">
          <PostBody blocks={post.blocks} />

          <div className="mt-14 rounded-2xl border border-line bg-surface-2 p-8">
            <p className="font-display text-[21px] font-bold tracking-tight text-ink">
              See how AI engines describe you right now.
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              The free scan checks the technical signals in this article against your homepage — schema, rendering,
              crawler access, entity clarity — and scores each one.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/pricing">
                Analyze My Website <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        {sections.length > 1 && (
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">On this page</p>
              <ul className="mt-4 space-y-2.5 border-l border-line">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l border-transparent pl-4 text-[13.5px] leading-snug text-ink-muted transition-colors hover:border-brand-500 hover:text-ink"
                    >
                      {s.text}
                    </a>
                  </li>
                ))}
                {faq.length > 0 && (
                  <li>
                    <a
                      href="#faq"
                      className="-ml-px block border-l border-transparent pl-4 text-[13.5px] leading-snug text-ink-muted transition-colors hover:border-brand-500 hover:text-ink"
                    >
                      Frequently asked questions
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl border-t border-line pt-12">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">Keep reading</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/25"
              >
                <span className="text-[12.5px] font-semibold text-brand-600">{r.category}</span>
                <span className="mt-2.5 text-balance font-display text-[17px] font-bold leading-[1.25] tracking-[-0.015em] text-ink">
                  {r.title}
                </span>
                <span className="mt-2.5 flex-1 text-[14.5px] leading-[1.6] text-ink-muted">{r.excerpt}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
                  Read
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
