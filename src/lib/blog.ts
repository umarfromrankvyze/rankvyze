import { db } from "@/lib/db";
import type { Post, PostBlock } from "@/content/blog/types";

/**
 * Blog posts, read from the database.
 *
 * Posts used to be TypeScript modules under src/content/blog/posts. They moved
 * here so they can be written and published from the admin console without a
 * deploy. What did *not* change is the shape: `blocksJson` holds the same
 * PostBlock[] the renderer has always taken, so the move is a change of storage
 * only — the same components render the same structures, and structured data is
 * still derived from the content rather than maintained beside it.
 *
 * The block types themselves still live in src/content/blog/types.ts, which is
 * the one place the content model is defined.
 */

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  description: string;
  excerpt: string;
  category: string;
  targets: string;
  status: string;
  featured: boolean;
  position: number;
  blocksJson: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const POST_CATEGORIES = ["Guides", "Research", "Technical", "Strategy"] as const;
export const POST_STATUSES = ["DRAFT", "PUBLISHED"] as const;

function parseBlocks(json: string): PostBlock[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as PostBlock[]) : [];
    // A post whose blocks failed to parse renders as an empty body rather than
    // crashing the route. The admin list flags it by showing a zero block count.
  } catch {
    return [];
  }
}

export function splitTargets(value: string) {
  return value
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Database row to the shape the renderer and metadata helpers expect. */
export function toPost(row: PostRow): Post {
  const published = row.publishedAt ?? row.createdAt;
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seoTitle ?? undefined,
    description: row.description,
    excerpt: row.excerpt,
    publishedAt: published.toISOString().slice(0, 10),
    // Only surface an update date once it's meaningfully after publication —
    // a "last updated" one minute after publishing is noise, and repeating it
    // in Article markup is the kind of false freshness signal that gets
    // discounted.
    updatedAt:
      row.updatedAt.getTime() - published.getTime() > 86_400_000 ? row.updatedAt.toISOString().slice(0, 10) : undefined,
    category: row.category as Post["category"],
    targets: splitTargets(row.targets),
    featured: row.featured,
    blocks: parseBlocks(row.blocksJson),
  };
}

const ORDER = [{ position: "asc" as const }, { publishedAt: "desc" as const }];

/** Published posts in editorial order. */
export async function publishedPosts(): Promise<Post[]> {
  const rows = await db.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: ORDER });
  return rows.map(toPost);
}

/** Slugs only — for generateStaticParams and the sitemap. */
export async function publishedSlugs() {
  const rows = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: ORDER,
    select: { slug: true, publishedAt: true, updatedAt: true, createdAt: true, featured: true },
  });
  return rows;
}

export async function publishedPost(slug: string): Promise<Post | null> {
  const row = await db.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
  return row ? toPost(row) : null;
}

/** Up to `limit` other published posts, preferring the same category. */
export async function relatedPosts(slug: string, category: string, limit = 3): Promise<Post[]> {
  const rows = await db.blogPost.findMany({
    where: { status: "PUBLISHED", slug: { not: slug } },
    orderBy: ORDER,
  });
  const posts = rows.map(toPost);
  const same = posts.filter((p) => p.category === category);
  const rest = posts.filter((p) => p.category !== category);
  return [...same, ...rest].slice(0, limit);
}

/** Everything, drafts included. Admin only. */
export async function allPosts() {
  return db.blogPost.findMany({ orderBy: [{ status: "asc" }, ...ORDER] });
}
