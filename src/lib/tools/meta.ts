import "server-only";
import { ToolError, fetchChecked, metaContent, serverRenderedText, tagText } from "./http";

/**
 * Meta tag and SERP preview checker.
 *
 * Character counts rather than pixel widths. Google truncates on pixels, not
 * characters, so any character limit is an approximation — but a tool that
 * claims pixel precision for a font it is guessing at is precise about the
 * wrong thing. The limits below are the widely-used approximations, and the UI
 * says so.
 */

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

export interface MetaCheck {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface MetaReport {
  url: string;
  finalUrl: string;
  redirected: boolean;
  status: number;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  h1: string[];
  h2Count: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  lang: string | null;
  viewport: string | null;
  favicon: string | null;
  wordCount: number;
  checks: MetaCheck[];
}

export async function checkMeta(rawUrl: string): Promise<MetaReport> {
  const { url, page } = await fetchChecked(rawUrl);
  if (!page.ok) throw new ToolError(`That page returned HTTP ${page.status}. Check the address and try again.`);

  const html = page.body;
  const title = tagText(html, "title");
  const description = metaContent(html, "description");
  const canonical = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1] ?? null;
  const robots = metaContent(html, "robots");
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  );
  const h2Count = [...html.matchAll(/<h2[^>]*>/gi)].length;
  const lang = /<html[^>]+lang=["']([^"']+)["']/i.exec(html)?.[1] ?? null;
  const favicon = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1] ?? null;
  const wordCount = serverRenderedText(html).split(/\s+/).filter(Boolean).length;

  const checks: MetaCheck[] = [];
  const add = (key: string, label: string, status: MetaCheck["status"], detail: string) =>
    checks.push({ key, label, status, detail });

  // --- title ---
  if (!title) add("title", "Title tag", "fail", "No <title>. This is the headline in every search result and browser tab.");
  else if (title.length > TITLE_MAX)
    add("title", "Title tag", "warn", `${title.length} characters — Google will cut it around ${TITLE_MAX}.`);
  else if (title.length < 20) add("title", "Title tag", "warn", `Only ${title.length} characters. There is room to carry the query.`);
  else add("title", "Title tag", "pass", `${title.length} characters.`);

  // --- description ---
  if (!description)
    add("description", "Meta description", "fail", "None. Search engines will write their own from page text, and it usually reads badly.");
  else if (description.length > DESCRIPTION_MAX)
    add("description", "Meta description", "warn", `${description.length} characters — truncates around ${DESCRIPTION_MAX}.`);
  else if (description.length < 70)
    add("description", "Meta description", "warn", `Only ${description.length} characters. Thin for the space available.`);
  else add("description", "Meta description", "pass", `${description.length} characters.`);

  // --- canonical ---
  if (!canonical) add("canonical", "Canonical URL", "warn", "No canonical tag. Duplicate URLs can split ranking signals.");
  else add("canonical", "Canonical URL", "pass", canonical);

  // --- headings ---
  if (h1.length === 0) add("h1", "H1 heading", "fail", "No <h1>. Nothing states what this page is at the top level.");
  else if (h1.length > 1) add("h1", "H1 heading", "warn", `${h1.length} H1 tags. One is the convention; several dilute it.`);
  else add("h1", "H1 heading", "pass", h1[0].slice(0, 90));

  if (h2Count === 0 && wordCount > 400)
    add("h2", "Section headings", "warn", "No H2s on a long page. Answer engines extract passages under question-shaped headings.");
  else add("h2", "Section headings", "pass", `${h2Count} H2 heading${h2Count === 1 ? "" : "s"}.`);

  // --- indexability ---
  if (robots && /noindex/i.test(robots))
    add("indexable", "Indexable", "fail", `The robots meta tag says "${robots}". This page is asking not to be indexed.`);
  else add("indexable", "Indexable", "pass", robots ? `robots: ${robots}` : "No noindex directive.");

  // --- server rendering, the AEO-specific one ---
  if (wordCount < 150)
    add(
      "rendered",
      "Content without JavaScript",
      "fail",
      `Only ${wordCount} words in the raw HTML. Most AI crawlers don't run JavaScript, so this is roughly all they see.`,
    );
  else add("rendered", "Content without JavaScript", "pass", `${wordCount.toLocaleString()} words visible without running scripts.`);

  // --- social ---
  const ogImage = metaContent(html, "og:image");
  if (!ogImage) add("og", "Open Graph image", "warn", "No og:image. Shared links will render without a card.");
  else add("og", "Open Graph image", "pass", ogImage.slice(0, 90));

  if (!lang) add("lang", "Language", "warn", "No lang attribute on <html>.");
  else add("lang", "Language", "pass", lang);

  return {
    url: url.toString(),
    finalUrl: page.finalUrl,
    redirected: page.finalUrl.replace(/\/$/, "") !== url.toString().replace(/\/$/, ""),
    status: page.status,
    title,
    description,
    canonical,
    robots,
    h1,
    h2Count,
    ogTitle: metaContent(html, "og:title"),
    ogDescription: metaContent(html, "og:description"),
    ogImage,
    twitterCard: metaContent(html, "twitter:card"),
    lang,
    viewport: metaContent(html, "viewport"),
    favicon,
    wordCount,
    checks,
  };
}
