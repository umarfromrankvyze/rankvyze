"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PostBlock } from "@/content/blog/types";
import { POST_CATEGORIES } from "@/lib/blog";
import { deletePost, savePost, setPostStatus } from "@/server/actions/blog";
import { initialActionState } from "@/server/types";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BlockEditor } from "@/components/admin/block-editor";

export interface EditablePost {
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
  blocks: PostBlock[];
  publishedAt: string | null;
  updatedAt: string;
}

/**
 * The post editor.
 *
 * One form covering metadata and body, submitted as a normal form action. The
 * publish state is a field on that form rather than a separate button, so
 * "save" and "publish" can't disagree about what was written.
 */
export function PostEditor({ post }: { post: EditablePost }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(savePost.bind(null, post.id), initialActionState);
  const [status, setStatus] = useState(post.status);
  const [slug, setSlug] = useState(post.slug);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    } else if (!state.ok && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> All posts
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {post.status === "PUBLISHED" ? <Badge variant="success">Live</Badge> : <Badge variant="warning">Draft</Badge>}

          {post.status === "PUBLISHED" && (
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View
              </a>
            </Button>
          )}

          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy}>
            <Trash2 /> Delete
          </Button>

          {post.status === "PUBLISHED" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() =>
                startTransition(async () => {
                  const result = await setPostStatus(post.id, "DRAFT");
                  if (result.ok) {
                    toast.success(result.message ?? "Unpublished.");
                    setStatus("DRAFT");
                    router.refresh();
                  } else toast.error(result.error);
                })
              }
            >
              <Eye /> Unpublish
            </Button>
          )}

          <Button type="submit" size="sm" disabled={pending}>
            <Save /> {pending ? "Saving…" : status === "PUBLISHED" ? "Save & publish" : "Save draft"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Body */}
        <div className="min-w-0 space-y-5">
          <Field label="Title" htmlFor="title" error={errors?.title} required>
            <Input
              id="title"
              name="title"
              defaultValue={post.title}
              placeholder="How to rank on ChatGPT"
              className="h-12 text-[17px] font-semibold"
              onBlur={(e) => {
                // Only fill an untouched slug — never rewrite a published URL.
                if (slug.startsWith("untitled-") && e.target.value.trim()) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .trim()
                      .replace(/\s+/g, "-")
                      .slice(0, 90),
                  );
                }
              }}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            hint="Becomes the meta description and the Article description. Aim for 140–160 characters."
            error={errors?.description}
            required
          >
            <Textarea id="description" name="description" rows={2} defaultValue={post.description} />
          </Field>

          <Field label="Excerpt" htmlFor="excerpt" hint="Shown on the blog index card." error={errors?.excerpt} required>
            <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post.excerpt} />
          </Field>

          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Body</p>
            <BlockEditor name="blocksJson" initial={post.blocks} />
          </div>
        </div>

        {/* Settings */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-[13px] font-semibold text-ink">Publishing</p>

            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </Field>

            <Field label="Slug" htmlFor="slug" hint={`/blog/${slug || "…"}`} error={errors?.slug} required>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </Field>

            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" defaultValue={post.category}>
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Order" htmlFor="position" hint="Lower sorts first on the index.">
              <Input id="position" name="position" type="number" min={0} max={9999} defaultValue={post.position} />
            </Field>

            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Featured</p>
                <p className="text-[12px] text-ink-muted">Higher sitemap priority.</p>
              </div>
              <Switch name="featured" defaultChecked={post.featured} />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-[13px] font-semibold text-ink">Search</p>

            <Field
              label="SEO title"
              htmlFor="seoTitle"
              hint="Used for the browser tab and search result when it should differ from the H1."
            >
              <Input id="seoTitle" name="seoTitle" defaultValue={post.seoTitle ?? ""} placeholder={post.title} />
            </Field>

            <Field
              label="Target queries"
              htmlFor="targets"
              hint="One per line or comma-separated. Recorded as Article keywords — documentation, not stuffing."
            >
              <Textarea id="targets" name="targets" rows={4} defaultValue={post.targets} />
            </Field>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-4 text-[12px] leading-relaxed text-ink-muted">
            {post.publishedAt ? (
              <>
                First published {new Date(post.publishedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}. Saving
                an edit does not change that date.
              </>
            ) : (
              <>Not published yet. Set status to Published and save to put it live.</>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this post?"
        description={`“${post.title}” will be removed from the site, the sitemap and the RSS feed. This can't be undone.`}
        confirmLabel="Delete post"
        destructive
        onConfirm={() =>
          startTransition(async () => {
            const result = await deletePost(post.id);
            if (result.ok) {
              toast.success(result.message ?? "Deleted.");
              router.push("/admin/blog");
            } else toast.error(result.error);
          })
        }
      />
    </form>
  );
}
