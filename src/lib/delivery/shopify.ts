import "server-only";
import { CONNECT_SPECS } from "@/content/connect-specs";
import { applyFailure, failure, scrub, type ApplyResult, type DeliveryClient, type DeliveryTarget, type VerifyResult } from "./types";

/**
 * Shopify delivery over the Admin API.
 *
 * Changes are written to an unpublished theme, never the live one. The
 * customer previews that theme in their admin and publishes it themselves —
 * which is both safer and the only version of this that a store owner should
 * ever agree to.
 *
 * Structured data goes into a snippet rather than being spliced into
 * theme.liquid, so removing it later is deleting one file instead of finding
 * our edit inside someone else's template.
 */

const VERSION = "2024-10";
const TIMEOUT_MS = 20_000;
const SNIPPET = "snippets/rankvyze-schema.liquid";

interface ShopifyError {
  errors?: unknown;
}

function shopDomain(raw: string): string | null {
  const host = raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(host) ? host : null;
}

async function shop<T>(
  target: DeliveryTarget,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const host = shopDomain(target.config.shopDomain ?? "");
  if (!host) throw new Error("Enter your .myshopify.com domain, not your custom domain.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://${host}/admin/api/${VERSION}${path}`, {
      method: init.method ?? "GET",
      signal: controller.signal,
      headers: {
        "x-shopify-access-token": target.secret,
        accept: "application/json",
        "user-agent": "RankVyze/1.0",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

interface Theme {
  id: number;
  name: string;
  role: string;
}

export const shopifyClient: DeliveryClient = {
  provider: "SHOPIFY",
  ...CONNECT_SPECS.SHOPIFY,

  async verify(target: DeliveryTarget): Promise<VerifyResult> {
    if (!shopDomain(target.config.shopDomain ?? "")) {
      return failure("Enter your .myshopify.com domain, not your custom domain.");
    }
    try {
      const info = await shop<{ shop?: { name?: string; myshopify_domain?: string } }>(target, "/shop.json");
      if (info.status === 401) return failure("Shopify rejected that token. Check it was copied in full and the app is installed.");
      if (!info.ok) return failure(`Shopify returned ${info.status}. Check the app has read access to store content.`);

      const themes = await shop<{ themes?: Theme[] } & ShopifyError>(target, "/themes.json");
      if (!themes.ok) {
        return failure("The token works but can't list themes. The app needs read_themes and write_themes scopes.");
      }
      const list = themes.data.themes ?? [];
      const draft = list.find((t) => t.role !== "main");
      if (!draft) {
        return failure(
          "There's no unpublished theme to write to. Duplicate your live theme in Online Store → Themes, then reconnect — we never edit the live one.",
        );
      }

      return {
        ok: true,
        account: info.data.shop?.name ?? info.data.shop?.myshopify_domain ?? "your store",
        confirmed: [
          `Connected to ${info.data.shop?.name ?? "your store"}`,
          `Will write to the unpublished theme "${draft.name}"`,
          "Your live theme is never modified",
        ],
      };
    } catch (e) {
      return failure(scrub(e instanceof Error ? e.message : "Could not reach Shopify.", target.secret));
    }
  },

  async apply(target: DeliveryTarget, change): Promise<ApplyResult> {
    const head = change.fields?.map((f) => f.headHtml).filter(Boolean).join("\n") ?? "";
    if (!head) return applyFailure("This change has nothing for Shopify to write.");

    try {
      const themes = await shop<{ themes?: Theme[] }>(target, "/themes.json");
      if (!themes.ok) return applyFailure("Lost theme access. Reconnect Shopify in Settings.");
      const list = themes.data.themes ?? [];

      const configured = target.config.themeId?.trim();
      const target_ = configured ? list.find((t) => String(t.id) === configured) : list.find((t) => t.role !== "main");
      if (!target_) return applyFailure("Could not find an unpublished theme to write to.");
      if (target_.role === "main") {
        // Belt and braces: even a hand-entered theme id must not be the live one.
        return applyFailure("That theme is the live one. We only write to unpublished themes.");
      }

      const before = await shop<{ asset?: { value?: string } }>(
        target,
        `/themes/${target_.id}/assets.json?asset[key]=${encodeURIComponent(SNIPPET)}`,
      );
      const previous = before.ok ? (before.data.asset?.value ?? null) : null;

      const res = await shop<ShopifyError>(target, `/themes/${target_.id}/assets.json`, {
        method: "PUT",
        body: { asset: { key: SNIPPET, value: head } },
      });
      if (!res.ok) return applyFailure(`Shopify rejected the theme asset write (${res.status}).`);

      return {
        ok: true,
        reviewUrl: `https://${shopDomain(target.config.shopDomain ?? "")}/admin/themes/${target_.id}/editor`,
        live: false,
        rollback: { themeId: target_.id, asset: SNIPPET, previous },
        detail: `Written to "${target_.name}" (unpublished). Preview it in your admin, then publish when you're happy. Include it with {% render 'rankvyze-schema' %} in theme.liquid — we add that line as a separate change you approve.`,
      };
    } catch (e) {
      return applyFailure(scrub(e instanceof Error ? e.message : "Could not reach Shopify.", target.secret));
    }
  },
};
