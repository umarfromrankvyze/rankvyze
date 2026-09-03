import { headers } from "next/headers";
import { db } from "@/lib/db";
import { readAttribution } from "@/lib/attribution";
import { requestMeta } from "@/lib/request-meta";

/**
 * Record where a new account came from, once, at creation.
 *
 * Called from every path that can create a user (password signup and Google
 * OAuth) so no account arrives unattributed for want of a hook.
 *
 * Best-effort by design: a failure here must never stop someone signing up. A
 * missing row shows in the console as "Not captured", which is honest — it does
 * not get folded into "direct".
 */
export async function recordSignupMeta(userId: string) {
  try {
    const [attribution, h] = await Promise.all([readAttribution(), headers()]);
    const meta = requestMeta(h);

    await db.signupMeta.create({
      data: {
        userId,
        // First-touch, from the cookie the beacon set on the landing page.
        source: attribution?.source ?? null,
        medium: attribution?.medium ?? null,
        campaign: attribution?.campaign ?? null,
        referrer: attribution?.referrer ?? null,
        landingPath: attribution?.landingPath ?? null,
        // Geography and device are taken from the signup request itself —
        // that's where the person actually is, and Vercel has already resolved
        // it at the edge so no IP reaches this code.
        country: meta.country,
        region: meta.region,
        city: meta.city,
        device: meta.device,
        browser: meta.browser,
        os: meta.os,
      },
    });
  } catch {
    // Intentionally swallowed — see the note above.
  }
}
