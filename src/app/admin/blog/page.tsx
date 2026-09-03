import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { allPosts, splitTargets } from "@/lib/blog";
import { createDraft } from "@/server/actions/blog";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataNote } from "@/components/admin/console-ui";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

function blockCount(json: string) {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await allPosts();

  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const drafts = posts.length - published;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Posts"
        description={`${published} published · ${drafts} draft${drafts === 1 ? "" : "s"}. Publishing updates the sitemap, RSS feed and llms.txt straight away.`}
        actions={
          <form action={createDraft}>
            <Button type="submit" size="sm">
              <Plus /> New post
            </Button>
          </form>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Blocks</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-[14px] font-medium text-ink">No posts yet.</p>
                  <p className="mt-1 text-[13px] text-ink-muted">Start one and it appears on /blog the moment you publish.</p>
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => {
              const targets = splitTargets(post.targets);
              const blocks = blockCount(post.blocksJson);
              return (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <Link href={`/admin/blog/${post.id}`} className="font-medium text-ink hover:text-brand-600">
                        {post.title}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-faint">
                        /blog/{post.slug}
                        {post.status === "PUBLISHED" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${post.title} on the site`}
                            className="hover:text-ink"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.status === "PUBLISHED" ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                    {post.featured && (
                      <Badge variant="brand" className="ml-1.5">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px] text-ink-muted">{post.category}</TableCell>
                  <TableCell className="max-w-[280px] text-[12.5px] text-ink-muted">
                    {targets.length === 0 ? (
                      <span className="text-ink-faint">None declared</span>
                    ) : (
                      <span className="line-clamp-2">{targets.join(" · ")}</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-[13px] text-ink-muted">
                    {blocks === 0 ? <span className="text-amber-700">0</span> : blocks}
                  </TableCell>
                  <TableCell className="text-right text-[12.5px] text-ink-muted">
                    {post.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <DataNote>
          Posts are stored in the database and rendered by the same block components as before, so structured data
          (Article, FAQPage, BreadcrumbList) is still derived from the content rather than maintained beside it. A block
          count of <strong>0</strong> means the body failed to parse — open the post and re-add its blocks rather than
          publishing it empty.
        </DataNote>
      </div>
    </>
  );
}
