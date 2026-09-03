"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { POST_CATEGORIES, POST_STATUSES, splitTargets } from "@/lib/blog";
import { flattenErrors } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { fail, succeed, type ActionResult } from "@/server/types";
import type { PostBlock } from "@/content/blog/types";

/**
 * Writing side of the blog.
 *
 * Publishing revalidates every surface a post appears on. Missing one would
 * mean the sitemap, the RSS feed or llms.txt disagreeing with the site about
 * what exists — exactly the kind of inconsistency this product sells a fix for.
 */
const AFFECTED_PATHS = ["/blog", "/resources", "/sitemap.xml", "/llms.txt", "/blog/rss.xml"];

function revalidateBlog(slug?: string) {
  for (const path of AFFECTED_PATHS) revalidatePath(path);
  if (slug) revalidatePath(`/blog/${slug}`);
}

const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug needs at least 3 characters")
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only"),
  title: z.string().trim().min(4, "Give the post a title").max(140),
  seoTitle: z.string().trim().max(140).optional(),
  description: z.string().trim().min(20, "Write a description — it becomes the meta description").max(320),
  excerpt: z.string().trim().min(20, "Write an excerpt for the index card").max(400),
  category: z.enum(POST_CATEGORIES),
  targets: z.string().trim().max(1000),
  status: z.enum(POST_STATUSES),
  featured: z.boolean(),
  position: z.number().int().min(0).max(9999),
  blocksJson: z.string(),
});

/**
 * Blocks arrive as JSON from the editor. Validate the shape enough to be sure
 * the renderer won't be handed something it can't switch on — a bad `type`
 * would silently render nothing, which looks like data loss.
 */
const VALID_BLOCK_TYPES = new Set([
  "p",
  "h2",
  "h3",
  "ul",
  "ol",
  "callout",
  "code",
  "table",
  "quote",
  "steps",
  "faq",
  "links",
]);

function validateBlocks(json: string): { ok: true; value: string } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "The post body could not be read. Try reloading the editor." };
  }
  if (!Array.isArray(parsed)) return { ok: false, error: "The post body must be a list of blocks." };

  for (const block of parsed as PostBlock[]) {
    if (!block || typeof block !== "object" || !VALID_BLOCK_TYPES.has(block.type)) {
      return { ok: false, error: `Unknown block type: ${String((block as { type?: string })?.type)}` };
    }
  }
  return { ok: true, value: JSON.stringify(parsed) };
}

function readForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    category: String(formData.get("category") ?? "Guides"),
    targets: String(formData.get("targets") ?? ""),
    status: String(formData.get("status") ?? "DRAFT"),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    position: Number(formData.get("position") ?? 100),
    blocksJson: String(formData.get("blocksJson") ?? "[]"),
  };
}

export async function savePost(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse(readForm(formData));
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const blocks = validateBlocks(parsed.data.blocksJson);
  if (!blocks.ok) return fail(blocks.error);

  const clash = await db.blogPost.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (clash && clash.id !== id) return fail("That slug is already taken.", { slug: "Another post already uses this slug." });

  const previous = id ? await db.blogPost.findUnique({ where: { id }, select: { slug: true, status: true } }) : null;
  if (id && !previous) return fail("That post no longer exists.");

  const data = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    seoTitle: parsed.data.seoTitle ?? null,
    description: parsed.data.description,
    excerpt: parsed.data.excerpt,
    category: parsed.data.category,
    // Stored as typed, normalised on read.
    targets: splitTargets(parsed.data.targets).join(", "),
    status: parsed.data.status,
    featured: parsed.data.featured,
    position: parsed.data.position,
    blocksJson: blocks.value,
  };

  const post = id
    ? await db.blogPost.update({
        where: { id },
        data: {
          ...data,
          // publishedAt is the first time it went live and never moves after
          // that — re-publishing an edited post is not a new publication date.
          ...(parsed.data.status === "PUBLISHED" && previous?.status !== "PUBLISHED"
            ? { publishedAt: new Date() }
            : {}),
        },
      })
    : await db.blogPost.create({
        data: { ...data, publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null },
      });

  revalidateBlog(post.slug);
  // A rename leaves the old URL cached; clear it too.
  if (previous && previous.slug !== post.slug) revalidatePath(`/blog/${previous.slug}`);

  return succeed(undefined, parsed.data.status === "PUBLISHED" ? "Published." : "Saved as draft.");
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<ActionResult> {
  await requireAdmin();

  const existing = await db.blogPost.findUnique({ where: { id }, select: { slug: true, status: true } });
  if (!existing) return fail("That post no longer exists.");

  await db.blogPost.update({
    where: { id },
    data: {
      status,
      ...(status === "PUBLISHED" && existing.status !== "PUBLISHED" ? { publishedAt: new Date() } : {}),
    },
  });

  revalidateBlog(existing.slug);
  return succeed(undefined, status === "PUBLISHED" ? "Published." : "Moved back to draft.");
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireAdmin();

  const existing = await db.blogPost.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return fail("That post no longer exists.");

  await db.blogPost.delete({ where: { id } });
  revalidateBlog(existing.slug);
  return succeed(undefined, "Post deleted.");
}

/** Create an empty draft and open it. Keeps "New post" one click, not a form. */
export async function createDraft() {
  await requireAdmin();

  const stamp = new Date().toISOString().slice(0, 10);
  let slug = `untitled-${stamp}`;
  for (let i = 2; await db.blogPost.findUnique({ where: { slug } }); i++) slug = `untitled-${stamp}-${i}`;

  const last = await db.blogPost.findFirst({ orderBy: { position: "desc" }, select: { position: true } });

  const post = await db.blogPost.create({
    data: {
      slug,
      title: "Untitled post",
      description: "",
      excerpt: "",
      category: "Guides",
      status: "DRAFT",
      position: (last?.position ?? 0) + 10,
      blocksJson: JSON.stringify([{ type: "p", text: "" }]),
    },
  });

  redirect(`/admin/blog/${post.id}`);
}

/** Suggest a slug from a title, without clobbering one already typed. */
export async function suggestSlug(title: string) {
  return slugify(title).slice(0, 90);
}
