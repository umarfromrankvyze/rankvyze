import { db } from "@/lib/db";
import { recentDays, utcDay } from "@/lib/request-meta";

/**
 * Queries behind /admin/analytics.
 *
 * Every figure here is counted from our own tables — no third-party analytics
 * API is involved. That is a deliberate choice, not a shortcut: GA4's Data API
 * needs a service-account key and a numeric property id (the G-… measurement id
 * on the site is not one), and its reporting is sampled and delayed. Counting
 * our own requests is exact, immediate, and answers questions GA can't — like
 * which source a *paying* signup came from.
 *
 * Nothing here reads an IP. Geography arrives already resolved by Vercel's
 * edge; see src/lib/request-meta.ts.
 */

/** A visitor is "live" if we've heard from their browser within this window. */
export const LIVE_WINDOW_SECONDS = 90;

/** How often the browser beacon fires. Must stay under LIVE_WINDOW_SECONDS. */
export const HEARTBEAT_SECONDS = 30;

export interface Breakdown {
  label: string;
  count: number;
}

export interface DayPoint {
  day: string;
  visitors: number;
  views: number;
  signups: number;
}

/**
 * Visitors whose last heartbeat is inside the live window.
 *
 * Counts distinct visitor ids rather than rows: a session spanning UTC midnight
 * writes a row on each day and would otherwise be counted twice.
 */
export async function liveVisitors() {
  const since = new Date(Date.now() - LIVE_WINDOW_SECONDS * 1000);
  const rows = await db.visit.findMany({
    where: { lastSeenAt: { gte: since } },
    select: { visitorId: true, country: true, lastPath: true, lastSeenAt: true },
    orderBy: { lastSeenAt: "desc" },
    take: 500,
  });

  const seen = new Set<string>();
  const unique = rows.filter((r) => (seen.has(r.visitorId) ? false : seen.add(r.visitorId)));

  const byPath = new Map<string, number>();
  const byCountry = new Map<string, number>();
  for (const r of unique) {
    const path = r.lastPath ?? "/";
    byPath.set(path, (byPath.get(path) ?? 0) + 1);
    const country = r.country ?? "Unknown";
    byCountry.set(country, (byCountry.get(country) ?? 0) + 1);
  }

  return {
    count: unique.length,
    pages: toBreakdown(byPath).slice(0, 8),
    countries: toBreakdown(byCountry).slice(0, 8),
  };
}

function toBreakdown(map: Map<string, number>): Breakdown[] {
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Day-by-day visitors, views and signups across the last `days` UTC days. */
export async function trafficSeries(days: number): Promise<DayPoint[]> {
  const window = recentDays(days);
  const from = new Date(`${window[0]}T00:00:00.000Z`);

  const [visits, signups] = await Promise.all([
    db.visit.findMany({ where: { day: { gte: window[0] } }, select: { day: true, views: true } }),
    db.user.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true } }),
  ]);

  const visitorsByDay = new Map<string, number>();
  const viewsByDay = new Map<string, number>();
  for (const v of visits) {
    visitorsByDay.set(v.day, (visitorsByDay.get(v.day) ?? 0) + 1);
    viewsByDay.set(v.day, (viewsByDay.get(v.day) ?? 0) + v.views);
  }

  const signupsByDay = new Map<string, number>();
  for (const s of signups) {
    const day = utcDay(s.createdAt);
    signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  }

  return window.map((day) => ({
    day,
    visitors: visitorsByDay.get(day) ?? 0,
    views: viewsByDay.get(day) ?? 0,
    signups: signupsByDay.get(day) ?? 0,
  }));
}

/** Traffic breakdowns over the last `days` days. */
export async function trafficBreakdowns(days: number) {
  const window = recentDays(days);
  const rows = await db.visit.findMany({
    where: { day: { gte: window[0] } },
    select: { source: true, country: true, device: true, browser: true, landingPath: true, views: true },
  });

  const bucket = (key: keyof (typeof rows)[number]) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const value = (r[key] as string | null) ?? "Unknown";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return toBreakdown(map);
  };

  return {
    total: rows.length,
    views: rows.reduce((sum, r) => sum + r.views, 0),
    sources: bucket("source").slice(0, 10),
    countries: bucket("country").slice(0, 12),
    devices: bucket("device"),
    browsers: bucket("browser").slice(0, 6),
    landingPages: bucket("landingPath").slice(0, 10),
  };
}

/**
 * Signups over the window, broken down by first-touch attribution.
 *
 * Accounts created before attribution capture shipped have no SignupMeta row,
 * so they land in an explicit "Not captured" bucket rather than being silently
 * folded into "direct" — an unattributed signup and a direct one are different
 * facts and shouldn't share a row.
 */
export async function signupBreakdowns(days: number) {
  const window = recentDays(days);
  const from = new Date(`${window[0]}T00:00:00.000Z`);

  const users = await db.user.findMany({
    where: { createdAt: { gte: from } },
    select: { id: true, createdAt: true, signupMeta: true },
    orderBy: { createdAt: "desc" },
  });

  const bySource = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const byDevice = new Map<string, number>();
  let attributed = 0;

  for (const u of users) {
    if (u.signupMeta) attributed++;
    const source = u.signupMeta ? (u.signupMeta.source ?? "direct") : "Not captured";
    const country = u.signupMeta ? (u.signupMeta.country ?? "Unknown") : "Not captured";
    const device = u.signupMeta ? (u.signupMeta.device ?? "Unknown") : "Not captured";
    bySource.set(source, (bySource.get(source) ?? 0) + 1);
    byCountry.set(country, (byCountry.get(country) ?? 0) + 1);
    byDevice.set(device, (byDevice.get(device) ?? 0) + 1);
  }

  return {
    total: users.length,
    attributed,
    sources: toBreakdown(bySource),
    countries: toBreakdown(byCountry),
    devices: toBreakdown(byDevice),
  };
}

/** The most recent signups, with their attribution, for the activity table. */
export async function recentSignups(take = 25) {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      signupMeta: { select: { source: true, country: true, city: true, device: true, referrer: true, landingPath: true, campaign: true } },
      memberships: {
        take: 1,
        select: { organization: { select: { id: true, name: true, orders: { where: { status: "PAID" }, select: { id: true }, take: 1 } } } },
      },
    },
  });
}

/**
 * Headline counters for the top of the page.
 *
 * `previous` covers the equally-long window immediately before, so the UI can
 * show a real change rather than an unanchored number.
 */
export async function analyticsTotals(days: number) {
  const window = recentDays(days);
  const from = new Date(`${window[0]}T00:00:00.000Z`);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);
  const prevWindowStart = utcDay(prevFrom);

  const [visits, prevVisits, signups, prevSignups] = await Promise.all([
    db.visit.count({ where: { day: { gte: window[0] } } }),
    db.visit.count({ where: { day: { gte: prevWindowStart, lt: window[0] } } }),
    db.user.count({ where: { createdAt: { gte: from } } }),
    db.user.count({ where: { createdAt: { gte: prevFrom, lt: from } } }),
  ]);

  return {
    visitors: { current: visits, previous: prevVisits },
    signups: { current: signups, previous: prevSignups },
  };
}
