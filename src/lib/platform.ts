import "server-only";
import { fetchChecked, type FetchedPage } from "@/lib/tools/http";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/enums";
import type { PlatformDetection, PlatformSignal } from "@/lib/platform-shared";

/**
 * What is this site actually built on?
 *
 * This matters more than it looks: it decides whether we can push a fix
 * ourselves, need editor access, or have to hand the customer a change pack.
 * Getting it wrong means promising a delivery route that doesn't exist.
 *
 * Every signal below is an observable string in the served HTML or a response
 * header — nothing is inferred and nothing is asked of a model. The evidence
 * is returned alongside the verdict so the customer (and the admin) can see
 * exactly why we concluded what we did, and correct us when we're wrong.
 */

export type { PlatformDetection, PlatformSignal } from "@/lib/platform-shared";
export { CONFIDENT_AT } from "@/lib/platform-shared";

type Matcher = {
  label: string;
  weight: number;
  test: (ctx: { html: string; lower: string; headers: Headers }) => boolean;
};

const inHtml = (label: string, weight: number, needle: string): Matcher => ({
  label,
  weight,
  test: ({ lower }) => lower.includes(needle.toLowerCase()),
});

const inHeader = (label: string, weight: number, name: string, value?: string): Matcher => ({
  label,
  weight,
  test: ({ headers }) => {
    const v = headers.get(name);
    if (v === null) return false;
    return value ? v.toLowerCase().includes(value.toLowerCase()) : true;
  },
});

/**
 * Generator meta tags are the strongest single signal, so they're weighted to
 * clear the confidence bar on their own. Asset-host signals are weaker: a site
 * can embed one Framer page or one Shopify buy-button without being either.
 */
const MATCHERS: Record<Exclude<PlatformKey, "OTHER">, Matcher[]> = {
  FRAMER: [
    inHtml('<meta name="generator" content="Framer">', 70, 'content="Framer'),
    inHtml("framerusercontent.com asset host", 35, "framerusercontent.com"),
    inHtml("data-framer-* attributes in the markup", 30, "data-framer-"),
    inHtml("Framer page metadata script", 20, "__framer"),
  ],
  WEBFLOW: [
    inHtml('<meta name="generator" content="Webflow">', 70, 'content="webflow'),
    inHtml("data-wf-site attribute", 45, "data-wf-site"),
    inHtml("data-wf-page attribute", 30, "data-wf-page"),
    inHtml("website-files.com asset host", 25, "website-files.com"),
  ],
  WORDPRESS: [
    inHtml('<meta name="generator" content="WordPress">', 70, 'content="wordpress'),
    inHtml("/wp-content/ asset paths", 45, "/wp-content/"),
    inHtml("/wp-includes/ script paths", 30, "/wp-includes/"),
    inHtml("wp-json REST API link", 25, "/wp-json/"),
    inHeader("WordPress REST API Link header", 20, "link", "wp-json"),
  ],
  WIX: [
    inHtml("parastorage.com asset host", 55, "static.parastorage.com"),
    inHtml("wix-warmup-data bootstrap", 40, "wix-warmup-data"),
    inHeader("X-Wix-Request-Id response header", 60, "x-wix-request-id"),
    inHtml("Wix viewer model", 25, "wixbisession"),
  ],
  SHOPIFY: [
    inHtml("Shopify.theme runtime object", 60, "shopify.theme"),
    inHtml("cdn.shopify.com asset host", 45, "cdn.shopify.com"),
    inHtml("/cdn/shop/ asset paths", 30, "/cdn/shop/"),
    inHeader("x-shopid response header", 65, "x-shopid"),
    inHeader("Shopify-branded powered-by header", 40, "powered-by", "shopify"),
  ],
  SQUARESPACE: [
    inHtml('<meta name="generator" content="Squarespace">', 70, 'content="squarespace'),
    inHtml("squarespace.com asset host", 40, "squarespace.com/universal"),
    inHtml("Static.SQUARESPACE_CONTEXT bootstrap", 45, "squarespace_context"),
  ],
  WEBSITE_BUILDER_OTHER: [
    inHtml("Ghost generator tag", 60, 'content="ghost'),
    inHtml("Duda asset host", 55, "irp.cdn-website.com"),
    inHtml("HubSpot CMS asset host", 55, "hubspotusercontent"),
    inHtml("Bubble app bootstrap", 55, "bubble_page_load_id"),
    inHtml("Carrd bootstrap", 55, "carrd.co"),
  ],
  CODE: [
    // Nothing but Next.js serves this path, and a modern App Router site emits
    // no __NEXT_DATA__ and no x-powered-by behind a CDN — so on its own this
    // has to clear the confidence bar, or every such site gets asked twice.
    inHtml("Next.js build assets (/_next/static/)", 65, "/_next/static/"),
    inHtml("__NEXT_DATA__ payload", 35, "__next_data__"),
    inHeader("x-powered-by: Next.js", 45, "x-powered-by", "next.js"),
    inHtml("Nuxt build assets (/_nuxt/)", 50, "/_nuxt/"),
    inHtml("SvelteKit hydration payload", 50, "__sveltekit"),
    inHtml("Astro island markers", 50, "astro-island"),
    inHtml("Gatsby page data", 45, "___gatsby"),
    inHtml("Vite build assets", 30, "/assets/index-"),
  ],
};

/**
 * WordPress and Shopify both commonly sit behind a headless front end, and a
 * WooCommerce store is WordPress. When two platforms tie, the more specific
 * (and more restrictive to deliver into) one should win, because promising the
 * easier route and then discovering the harder one is the expensive mistake.
 */
const TIE_BREAK: PlatformKey[] = [
  "SHOPIFY",
  "WIX",
  "SQUARESPACE",
  "FRAMER",
  "WEBFLOW",
  "WORDPRESS",
  "WEBSITE_BUILDER_OTHER",
  "CODE",
  "OTHER",
];

export function detectFromResponse(page: Pick<FetchedPage, "body" | "headers" | "finalUrl">): PlatformDetection {
  const ctx = { html: page.body, lower: page.body.toLowerCase(), headers: page.headers };

  const scored = (Object.keys(MATCHERS) as Exclude<PlatformKey, "OTHER">[]).map((platform) => {
    const signals: PlatformSignal[] = [];
    for (const m of MATCHERS[platform]) {
      if (m.test(ctx)) signals.push({ label: m.label, weight: m.weight });
    }
    // Diminishing returns rather than a plain sum: three weak hints should not
    // outrank one definitive generator tag.
    const sorted = [...signals].sort((a, b) => b.weight - a.weight);
    const confidence = Math.min(100, Math.round(sorted.reduce((acc, s, i) => acc + s.weight / (i + 1), 0)));
    return { platform, confidence, signals: sorted };
  });

  const ranked = scored
    .filter((s) => s.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || TIE_BREAK.indexOf(a.platform) - TIE_BREAK.indexOf(b.platform));

  const winner = ranked[0];
  return {
    platform: winner?.platform ?? "OTHER",
    confidence: winner?.confidence ?? 0,
    signals: winner?.signals ?? [],
    alternatives: ranked.slice(1, 3).map((r) => ({ platform: r.platform, confidence: r.confidence })),
    finalUrl: page.finalUrl,
    detectedAt: new Date().toISOString(),
  };
}

/** Fetch the URL and work out what it's built on. Throws ToolError on bad input. */
export async function detectPlatform(rawUrl: string): Promise<PlatformDetection> {
  const { page } = await fetchChecked(rawUrl);
  return detectFromResponse(page);
}

export function isPlatformKey(value: string): value is PlatformKey {
  return (PLATFORM_KEYS as readonly string[]).includes(value);
}
