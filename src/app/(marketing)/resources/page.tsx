import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileQuestion, FileText, PenLine } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { FinalCta } from "@/components/marketing/sections/cta";
import { publishedPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "Resources", description: "Guides, documentation and writing on answer engine optimization." };

const ITEMS = [
  { href: "/aeo-guide", icon: BookOpen, title: "The AEO Guide", text: "A practical introduction to getting recommended by AI engines — seven steps, no jargon." },
  { href: "/docs", icon: FileText, title: "Documentation", text: "How the AI Visibility Score is computed, how research works, and how the optimization workflow fits together." },
  { href: "/blog", icon: PenLine, title: "Blog", text: "Guides on ranking in ChatGPT, Perplexity, Gemini and AI Overviews, written from real engine research." },
  { href: "/faq", icon: FileQuestion, title: "FAQ", text: "Straight answers about what RankVyze does and doesn't do." },
];

export const revalidate = 300;

export default async function ResourcesPage() {
  const posts = await publishedPosts();
  return (
    <>
      <Section>
        <div className="container-x">
          <SectionHeading eyebrow="Resources" title="Learn how AI search works." description="Everything we've learned from researching how AI engines decide who to recommend." />
          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
            {ITEMS.map((it, i) => (
              <Reveal key={it.href} delay={i * 70}>
                <Link href={it.href} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-white">
                    <it.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-[19px] font-bold tracking-tight text-ink">{it.title}</h3>
                  <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-ink-muted">{it.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:text-brand-600">
                    Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">Latest articles</h2>
              <Link href="/blog" className="text-[14px] font-medium text-ink-muted transition-colors hover:text-ink">
                All posts
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {posts.slice(0, 5).map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-4 transition-colors"
                  >
                    <span className="text-[15.5px] font-medium text-ink transition-colors group-hover:text-brand-600">
                      {post.title}
                    </span>
                    <span className="shrink-0 text-[13px] text-ink-faint">{post.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
