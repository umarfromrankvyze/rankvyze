import "server-only";
import { CONNECT_SPECS } from "@/content/connect-specs";
import { applyFailure, failure, scrub, type ApplyResult, type DeliveryClient, type DeliveryTarget, type VerifyResult } from "./types";

/**
 * Webflow delivery over the v2 Data API.
 *
 * Scope is deliberately page SEO metadata, because that is what the API can
 * change cleanly and reliably. Layout lives in the Designer and is not
 * reachable from any API, which the playbook says out loud rather than
 * discovering mid-sprint.
 *
 * We write to the site but never publish. Publishing is the customer's action
 * in Webflow, so nothing we do reaches their live domain on its own.
 */

const API = "https://api.webflow.com/v2";
const TIMEOUT_MS = 20_000;

interface WfError {
  message?: string;
}

async function wf<T>(
  path: string,
  secret: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${secret}`,
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

export const webflowClient: DeliveryClient = {
  provider: "WEBFLOW",
  ...CONNECT_SPECS.WEBFLOW,

  async verify(target: DeliveryTarget): Promise<VerifyResult> {
    const siteId = target.config.siteId?.trim();
    if (!siteId) return failure("Enter the Webflow Site ID from Site settings → General.");

    try {
      const site = await wf<{ displayName?: string; workspaceId?: string } & WfError>(`/sites/${siteId}`, target.secret);
      if (site.status === 401) return failure("Webflow rejected that token. Check it hasn't been revoked.");
      if (site.status === 404) return failure("Webflow can't find a site with that ID for this token.");
      if (!site.ok) return failure(scrub(site.data.message ?? `Webflow returned ${site.status}.`, target.secret));

      // Read the page list too: a token can pass /sites and still lack the
      // pages permission, which is the one every fix here depends on.
      const pages = await wf<{ pages?: unknown[] } & WfError>(`/sites/${siteId}/pages?limit=1`, target.secret);
      if (!pages.ok) {
        return failure("The token can see the site but not its pages. Regenerate it with Pages read & write permission.");
      }

      return {
        ok: true,
        account: site.data.displayName ?? siteId,
        confirmed: [`Connected to "${site.data.displayName ?? siteId}"`, "Can read and write page SEO fields", "Publishing stays with you"],
      };
    } catch (e) {
      return failure(scrub(e instanceof Error ? e.message : "Could not reach Webflow.", target.secret));
    }
  },

  async apply(target: DeliveryTarget, change): Promise<ApplyResult> {
    const siteId = target.config.siteId?.trim();
    const edits = change.fields ?? [];
    if (!siteId) return applyFailure("No Webflow site is configured for this website.");
    if (edits.length === 0) return applyFailure("This change has no page edits, so there is nothing to apply.");

    const rollback: Record<string, unknown> = {};
    const touched: string[] = [];

    try {
      for (const edit of edits) {
        const before = await wf<{ seo?: { title?: string; description?: string }; slug?: string } & WfError>(
          `/pages/${edit.resourceId}`,
          target.secret,
        );
        if (!before.ok) return applyFailure(`Could not read Webflow page ${edit.resourceId}.`);
        rollback[edit.resourceId] = { seo: before.data.seo ?? {} };

        const seo: Record<string, string> = {};
        if (edit.title) seo.title = edit.title;
        if (edit.metaDescription) seo.description = edit.metaDescription;
        if (Object.keys(seo).length === 0) continue;

        const res = await wf<WfError>(`/pages/${edit.resourceId}`, target.secret, {
          method: "PATCH",
          body: { seo: { ...before.data.seo, ...seo } },
        });
        if (!res.ok) {
          return {
            ok: false,
            live: false,
            rollback,
            detail: touched.length ? `Updated ${touched.join(", ")} before failing.` : "No change was made.",
            error: scrub(res.data.message ?? `Webflow rejected the update to page ${edit.resourceId}.`, target.secret),
          };
        }
        touched.push(before.data.slug ?? edit.resourceId);
      }

      return {
        ok: true,
        reviewUrl: `https://webflow.com/dashboard/sites/${siteId}`,
        live: false,
        rollback,
        detail: `Updated SEO fields on ${touched.join(", ")}. Nothing reaches your live domain until you publish in Webflow.`,
      };
    } catch (e) {
      return applyFailure(scrub(e instanceof Error ? e.message : "Could not reach Webflow.", target.secret));
    }
  },
};
