import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deriveSource, geoFromHeaders, uaFromHeaders, utcDay } from "@/lib/request-meta";
import { ATTRIBUTION_COOKIE, attributionCookieOptions, serializeAttribution } from "@/lib/attribution";

/**
 * The presence beacon.
 *
 * Called on load and then every HEARTBEAT_SECONDS while the tab is visible.
 * One row per browser per UTC day, upserted — a visitor who stays an hour costs
 * one row, not 120.
 *
 * Fail-open throughout: analytics must never break a real visit. Every failure
 * path returns 200 with `{ ok: false }` and the page carries on.
 */

export const dynamic = "force-dynamic";

const MAX = { path: 300, referrer: 300, utm: 80, visitorId: 64 };

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ ok: false });
    const input = body as Record<string, unknown>;

    const visitorId = clean(input.visitorId, MAX.visitorId);
    // A client-generated id is the only thing identifying the row. Without one
    // there is nothing to upsert against, so the beacon is a no-op.
    if (!visitorId) return NextResponse.json({ ok: false });

    const path = clean(input.path, MAX.path) ?? "/";
    const referrer = clean(input.referrer, MAX.referrer);
    const utmSource = clean(input.utmSource, MAX.utm);
    const utmMedium = clean(input.utmMedium, MAX.utm);
    const utmCampaign = clean(input.utmCampaign, MAX.utm);

    const selfHost = (() => {
      try {
        return new URL(request.url).hostname;
      } catch {
        return null;
      }
    })();

    const source = deriveSource(utmSource, referrer, selfHost);
    const geo = geoFromHeaders(request.headers);
    const ua = uaFromHeaders(request.headers);
    const day = utcDay();
    const now = new Date();

    await db.visit.upsert({
      where: { visitorId_day: { visitorId, day } },
      // Only the fields that legitimately change during a session are updated.
      // landingPath, source and the UTM trio stay as first written, so a
      // mid-session navigation can't rewrite where the visit came from.
      update: {
        lastSeenAt: now,
        lastPath: path,
        views: { increment: 1 },
        ...(geo.country ? { country: geo.country, region: geo.region, city: geo.city } : {}),
      },
      create: {
        visitorId,
        day,
        firstSeenAt: now,
        lastSeenAt: now,
        views: 1,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        landingPath: path,
        lastPath: path,
        referrer,
        source,
        medium: utmMedium,
        campaign: utmCampaign,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
      },
    });

    const response = NextResponse.json({ ok: true });

    // First touch wins: written only when the cookie is absent. This tests for
    // presence rather than parsing, because the stored value is URL-encoded on
    // the wire — parsing the raw header would fail every time and silently turn
    // first-touch attribution into last-touch.
    const alreadyAttributed = new RegExp(`(?:^|;\\s*)${ATTRIBUTION_COOKIE}=`).test(request.headers.get("cookie") ?? "");
    if (!alreadyAttributed) {
      response.cookies.set(
        ATTRIBUTION_COOKIE,
        serializeAttribution({
          source,
          medium: utmMedium ?? undefined,
          campaign: utmCampaign ?? undefined,
          referrer: referrer ?? undefined,
          landingPath: path,
          at: now.toISOString(),
        }),
        attributionCookieOptions,
      );
    }

    return response;
  } catch {
    return NextResponse.json({ ok: false });
  }
}
