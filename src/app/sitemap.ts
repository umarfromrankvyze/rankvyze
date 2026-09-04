import type { MetadataRoute } from "next";
import { CONTENT_PAGES } from "@/content/pages";
import { publishedSlugs } from "@/lib/blog";
import { CONTENT_UPDATED, SITE_URL } from "@/lib/site";

/**
 * Only public, indexable pages. Dashboard, admin, checkout and scan-result
 * routes are either auth-gated or per-visitor, so they're excluded here and
 * disallowed in robots.txt.
 *
 * `lastModified` doubles as the freshness signal AI crawlers look for, which
 * is why it tracks real content revisions rather than build time.
 */
export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await publishedSlugs();
  const updated = new Date(CONTENT_UPDATED);

  const primary: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/answer-engine-optimization", priority: 0.95, freq: "weekly" },
    { path: "/pricing", priority: 0.9, freq: "weekly" },
    { path: "/guarantee", priority: 0.9, freq: "monthly" },
    { path: "/blog", priority: 0.8, freq: "weekly" },
    { path: "/resources", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "yearly" },
    { path: "/signup", priority: 0.7, freq: "yearly" },
    { path: "/login", priority: 0.3, freq: "yearly" },
  ];

  return [
    ...primary.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: updated,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    ...CONTENT_PAGES.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      // Legal and guide pages carry their own revision date where they have one.
      lastModified: page.updated ? new Date(page.updated) : updated,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
      changeFrequency: "monthly" as const,
      // Cornerstone posts sit above the standard content pages; the rest match.
      priority: post.featured ? 0.8 : 0.7,
    })),
  ];
}
