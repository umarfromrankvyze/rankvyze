import "server-only";
import { ToolError, decodeEntities, fetchChecked, metaContent, serverRenderedText, tagText } from "./http";

/**
 * "What AI crawlers see."
 *
 * Fetches the page exactly as a non-JavaScript crawler does and reports what
 * comes back. It does NOT render the page in a browser and then diff the two —
 * that needs a headless Chrome, which will not run in a serverless function,
 * and pretending otherwise would produce a comparison we never actually made.
 *
 * So the honest framing is: here is the half a crawler gets, and here are the
 * signals that the rest of your page depends on JavaScript. Those signals are
 * evidence, reported as evidence, not a verdict dressed up as measurement.
 */

export interface RenderingSignal {
  label: string;
  found: boolean;
  detail: string;
}

export interface RenderingReport {
  url: string;
  finalUrl: string;
  status: number;
  /** Bytes of HTML the server sent. */
  htmlBytes: number;
  /** Words a crawler can read without executing anything. */
  words: number;
  /** Share of the document that is script, as a rough JS-heaviness signal. */
  scriptShare: number;
  title: string | null;
  description: string | null;
  headings: { level: number; text: string }[];
  /** Internal links discoverable without JS — how a crawler finds the rest. */
  internalLinks: number;
  images: { total: number; withoutAlt: number };
  jsonLdBlocks: number;
  /** The text itself, so the visitor can read what the crawler read. */
  text: string;
  signals: RenderingSignal[];
  verdict: "server-rendered" | "partial" | "javascript-dependent";
  summary: string;
}

/** Markers of a page whose content is assembled in the browser. */
function clientRenderSignals(html: string, words: number): RenderingSignal[] {
  const signals: RenderingSignal[] = [];

  const emptyRoot = /<div[^>]+id=["'](root|app|__nuxt|__next)["'][^>]*>\s*<\/div>/i.test(html);
  signals.push({
    label: "Empty mount point",
    found: emptyRoot,
    detail: emptyRoot
      ? "Found an empty <div id=\"root\"> (or equivalent). Everything inside it is built by JavaScript and invisible to a crawler that doesn't run it."
      : "No empty app container — content isn't waiting on a client-side mount.",
  });

  const nextData = /__NEXT_DATA__|self\.__next_f/.test(html);
  const nuxt = /window\.__NUXT__/.test(html);
  const framework = nextData ? "Next.js" : nuxt ? "Nuxt" : /data-reactroot|__vue__|ng-version/.test(html) ? "a client framework" : null;
  signals.push({
    label: "Client framework payload",
    found: Boolean(framework),
    detail: framework
      ? `${framework} hydration data is present. That's normal and fine — what matters is whether the text above it is also in the HTML.`
      : "No client framework payload detected.",
  });

  const noscript = /<noscript[^>]*>[\s\S]{40,}?<\/noscript>/i.test(html);
  signals.push({
    label: "Meaningful <noscript> fallback",
    found: noscript,
    detail: noscript
      ? "A substantial <noscript> block exists, which is a deliberate fallback for non-JS clients."
      : "No <noscript> fallback. Not required, but it's the conventional safety net when content is JS-built.",
  });

  const thin = words < 200;
  signals.push({
    label: "Enough text to work with",
    found: !thin,
    detail: thin
      ? `Only ${words} words reached us. A crawler that doesn't run JavaScript has almost nothing to read, whatever the page looks like in a browser.`
      : `${words.toLocaleString()} words are readable without running any JavaScript.`,
  });

  return signals;
}

export async function checkRendering(rawUrl: string): Promise<RenderingReport> {
  const { url, page } = await fetchChecked(rawUrl);
  if (!page.ok) throw new ToolError(`That page returned HTTP ${page.status}. Check the address and try again.`);

  const html = page.body;
  const text = serverRenderedText(html);
  const words = text.split(/\s+/).filter(Boolean).length;

  const scriptBytes = [...html.matchAll(/<script[\s\S]*?<\/script>/gi)].reduce((sum, m) => sum + m[0].length, 0);
  const scriptShare = html.length > 0 ? scriptBytes / html.length : 0;

  const headings = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ level: Number(m[1]), text: decodeEntities(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) }))
    .filter((h) => h.text.length > 0)
    .slice(0, 25);

  const internalLinks = new Set(
    [...html.matchAll(/href=["'](\/[^"'#?]*)["']/gi)].map((m) => m[1]),
  ).size;

  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  const withoutAlt = imgs.filter((m) => !/\salt=["'][^"']+["']/i.test(m[0])).length;

  const jsonLdBlocks = [...html.matchAll(/<script[^>]*application\/ld\+json/gi)].length;

  const signals = clientRenderSignals(html, words);

  // Verdict from the two signals that actually decide it: is there text, and
  // is the page's body waiting on a mount point.
  const emptyRoot = signals.find((s) => s.label === "Empty mount point")?.found ?? false;
  const verdict: RenderingReport["verdict"] =
    words < 120 || (emptyRoot && words < 400) ? "javascript-dependent" : words < 350 ? "partial" : "server-rendered";

  const summary =
    verdict === "server-rendered"
      ? `An AI crawler reads ${words.toLocaleString()} words here without running any JavaScript. This page is legible to them.`
      : verdict === "partial"
        ? `Only ${words} words reach a crawler that doesn't run JavaScript. Some of the page is there, but it's thin — check the text below against what you see in a browser.`
        : `A crawler that doesn't run JavaScript sees almost nothing here — ${words} words. Whatever this page looks like in a browser, that is not what most AI crawlers get.`;

  return {
    url: url.toString(),
    finalUrl: page.finalUrl,
    status: page.status,
    htmlBytes: html.length,
    words,
    scriptShare,
    title: tagText(html, "title"),
    description: metaContent(html, "description"),
    headings,
    internalLinks,
    images: { total: imgs.length, withoutAlt },
    jsonLdBlocks,
    text: text.slice(0, 6000),
    signals,
    verdict,
    summary,
  };
}
