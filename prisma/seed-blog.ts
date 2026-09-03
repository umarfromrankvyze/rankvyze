/**
 * Move the file-authored posts into the database, once.
 *
 * Upserts by slug, so running it twice is safe and re-running it after editing
 * a source file re-syncs that post. It deliberately does NOT delete anything:
 * posts written in the admin console have no file behind them, and a
 * delete-then-insert seed would wipe them.
 *
 * Run with: npx tsx prisma/seed-blog.ts
 */

import { PrismaClient } from "@prisma/client";
import { POSTS } from "../src/content/blog";

const db = new PrismaClient();

async function main() {
  console.info(`Seeding ${POSTS.length} posts…`);

  for (const [index, post] of POSTS.entries()) {
    const publishedAt = new Date(`${post.publishedAt}T09:00:00.000Z`);
    const data = {
      title: post.title,
      seoTitle: post.seoTitle ?? null,
      description: post.description,
      excerpt: post.excerpt,
      category: post.category,
      targets: post.targets.join(", "),
      status: "PUBLISHED",
      featured: post.featured ?? false,
      // Array order in the registry was the editorial ranking; keep it.
      position: (index + 1) * 10,
      blocksJson: JSON.stringify(post.blocks),
      publishedAt,
    };

    const row = await db.blogPost.upsert({
      where: { slug: post.slug },
      update: data,
      create: { slug: post.slug, ...data },
    });
    console.info(`  ${row.slug} — ${post.blocks.length} blocks`);
  }

  const total = await db.blogPost.count();
  console.info(`Done. ${total} posts in the database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
