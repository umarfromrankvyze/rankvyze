/**
 * Blog content model.
 *
 * Typed blocks rather than MDX: it keeps authoring in the same shape as the
 * rest of the codebase, renders through the design system with no per-post
 * styling drift, and means structured data can be derived from the content
 * instead of hand-maintained alongside it.
 *
 * Paragraph and list text supports a small inline syntax — `[label](href)`,
 * `**bold**` and `` `code` `` — parsed into React nodes, never injected as HTML.
 */

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "note" | "warn" | "tip"; title?: string; text: string }
  | { type: "code"; lang: string; code: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "links"; title?: string; items: { label: string; href: string; note: string }[] };

export interface Post {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> when it should differ from the H1 (usually shorter). */
  seoTitle?: string;
  description: string;
  /** Card copy on the index. */
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  category: "Guides" | "Research" | "Technical" | "Strategy";
  /** Queries this post is written to answer. Documented, not stuffed. */
  targets: string[];
  featured?: boolean;
  blocks: PostBlock[];
}

/** Rough reading time from the rendered text. */
export function readingMinutes(post: Post) {
  let words = 0;
  for (const b of post.blocks) {
    if ("text" in b && typeof b.text === "string") words += b.text.split(/\s+/).length;
    if ("items" in b) {
      for (const item of b.items as unknown[]) {
        if (typeof item === "string") words += item.split(/\s+/).length;
        else if (item && typeof item === "object") words += Object.values(item).join(" ").split(/\s+/).length;
      }
    }
    if (b.type === "code") words += b.code.split(/\s+/).length;
  }
  return Math.max(2, Math.round(words / 220));
}

/** Every question/answer pair in a post, for FAQPage markup. */
export function postFaq(post: Post) {
  return post.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
}

/** H2s, for the in-page table of contents. */
export function postSections(post: Post) {
  return post.blocks
    .filter((b): b is Extract<PostBlock, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ text: b.text, id: slugifyHeading(b.text) }));
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
