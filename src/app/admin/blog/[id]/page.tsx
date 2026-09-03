import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PostBlock } from "@/content/blog/types";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

function parseBlocks(json: string): PostBlock[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as PostBlock[]) : [];
  } catch {
    return [];
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        seoTitle: post.seoTitle,
        description: post.description,
        excerpt: post.excerpt,
        category: post.category,
        targets: post.targets,
        status: post.status,
        featured: post.featured,
        position: post.position,
        blocks: parseBlocks(post.blocksJson),
        // Dates are serialised here rather than crossing the boundary as Date
        // objects, so the client component receives plain, stable props.
        publishedAt: post.publishedAt?.toISOString() ?? null,
        updatedAt: post.updatedAt.toISOString(),
      }}
    />
  );
}
