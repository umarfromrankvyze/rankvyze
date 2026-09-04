import "server-only";
import { assertPublicHost, normalizeUrl } from "@/lib/tools/http";
import { CONNECT_SPECS } from "@/content/connect-specs";
import { applyFailure, failure, scrub, type ApplyResult, type DeliveryClient, type DeliveryTarget, type VerifyResult } from "./types";

/**
 * WordPress delivery over the REST API, authenticated with an application
 * password — a revocable, per-application credential that is not the user's
 * login password.
 *
 * Honest limitation, and the reason every change here is snapshotted first:
 * the REST API has no "propose a revision for review" concept for an already
 * published page. An update to a live page is live immediately. So we capture
 * the previous values before writing and store them as the rollback, which
 * makes an unwanted change one click to undo rather than something the
 * customer has to reconstruct by hand.
 */

const TIMEOUT_MS = 20_000;

interface WpError {
  message?: string;
  code?: string;
}

function authHeader(target: DeliveryTarget) {
  const user = target.config.username ?? "";
  // Application passwords are displayed with spaces for readability; the API
  // wants them without. Stripping here means a customer pasting exactly what
  // WordPress showed them does not get a confusing 401.
  const password = target.secret.replace(/\s+/g, "");
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

async function wp<T>(
  target: DeliveryTarget,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const base = normalizeUrl(target.config.baseUrl ?? target.websiteUrl);
  await assertPublicHost(base.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base.origin}/wp-json${path}`, {
      method: init.method ?? "GET",
      signal: controller.signal,
      headers: {
        authorization: authHeader(target),
        accept: "application/json",
        "user-agent": "RankVyze/1.0 (+https://rankvyze.com)",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const text = await res.text();
    let data: T;
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T);
    } catch {
      // A security plugin returning an HTML block page is the single most
      // common failure here, and "Unexpected token <" helps nobody.
      throw new Error("The site returned a non-JSON response — the REST API may be disabled or blocked by a plugin.");
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export const wordpressClient: DeliveryClient = {
  provider: "WORDPRESS",
  ...CONNECT_SPECS.WORDPRESS,

  async verify(target: DeliveryTarget): Promise<VerifyResult> {
    if (!target.config.username?.trim()) return failure("Enter the WordPress username the application password belongs to.");
    try {
      const me = await wp<{ name?: string; capabilities?: Record<string, boolean> } & WpError>(
        target,
        "/wp/v2/users/me?context=edit",
      );
      if (me.status === 401 || me.status === 403) {
        return failure("WordPress rejected that username and application password. Check both, and that the user still exists.");
      }
      if (me.status === 404) {
        return failure("No REST API found at that address. Check the URL, and that the REST API isn't disabled.");
      }
      if (!me.ok) return failure(scrub(me.data.message ?? `WordPress returned ${me.status}.`, target.secret));

      const caps = me.data.capabilities ?? {};
      const canEdit = caps.edit_pages || caps.edit_posts || caps.edit_published_pages;
      if (!canEdit) {
        return failure(
          `Connected as ${me.data.name ?? "that user"}, but the account can't edit content. It needs at least the Editor role.`,
        );
      }

      const confirmed = [`Signed in as ${me.data.name ?? target.config.username}`, "Can edit pages and posts"];
      if (caps.manage_options) confirmed.push("Can change site settings");
      return { ok: true, account: me.data.name ?? target.config.username, confirmed };
    } catch (e) {
      return failure(scrub(e instanceof Error ? e.message : "Could not reach the WordPress REST API.", target.secret));
    }
  },

  async apply(target: DeliveryTarget, change): Promise<ApplyResult> {
    const edits = change.fields ?? [];
    if (edits.length === 0) return applyFailure("This change has no page edits, so there is nothing to apply.");

    const rollback: Record<string, unknown> = {};
    const touched: string[] = [];

    try {
      for (const edit of edits) {
        // resourceId is "pages/12" or "posts/34" — the type matters because
        // they are different REST collections.
        const [type, id] = edit.resourceId.includes("/") ? edit.resourceId.split("/") : ["pages", edit.resourceId];
        const path = `/wp/v2/${type}/${id}`;

        const before = await wp<{ title?: { raw?: string }; excerpt?: { raw?: string }; content?: { raw?: string } } & WpError>(
          target,
          `${path}?context=edit`,
        );
        if (!before.ok) return applyFailure(`Could not read ${type}/${id} — check the page still exists.`);

        rollback[edit.resourceId] = {
          title: before.data.title?.raw ?? "",
          excerpt: before.data.excerpt?.raw ?? "",
          content: before.data.content?.raw ?? "",
        };

        const body: Record<string, unknown> = {};
        if (edit.title) body.title = edit.title;
        if (edit.metaDescription) body.excerpt = edit.metaDescription;
        if (edit.headHtml) {
          // Core WordPress exposes no head-injection endpoint. JSON-LD in the
          // body is equally valid to every engine that reads it, so the block
          // is appended to the content and marked so we can find it again.
          const existing = (before.data.content?.raw ?? "").replace(
            /<!--rankvyze:start-->[\s\S]*?<!--rankvyze:end-->/g,
            "",
          );
          body.content = `${existing.trimEnd()}\n<!--rankvyze:start-->\n${edit.headHtml}\n<!--rankvyze:end-->`;
        }
        if (Object.keys(body).length === 0) continue;

        const res = await wp<WpError>(target, path, { method: "POST", body });
        if (!res.ok) {
          return {
            ok: false,
            live: touched.length > 0,
            rollback,
            detail: touched.length ? `Applied ${touched.join(", ")} before failing.` : "No change was made.",
            error: scrub(res.data.message ?? `WordPress rejected the update to ${type}/${id}.`, target.secret),
          };
        }
        touched.push(`${type}/${id}`);
      }

      const base = normalizeUrl(target.config.baseUrl ?? target.websiteUrl);
      return {
        ok: true,
        reviewUrl: base.origin,
        // Said plainly, because the customer's expectation of "reviewable"
        // has to match what WordPress actually does.
        live: true,
        rollback,
        detail: `Updated ${touched.join(", ")}. WordPress publishes edits immediately; the previous content is stored so this can be reverted in one click.`,
      };
    } catch (e) {
      return applyFailure(scrub(e instanceof Error ? e.message : "Could not reach the WordPress REST API.", target.secret));
    }
  },
};
