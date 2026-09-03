import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { liveVisitors } from "@/lib/analytics";

/**
 * Polled by the live-visitors panel on /admin/analytics.
 *
 * A route handler rather than a server action because the panel refreshes on a
 * timer and never mutates anything — this stays a plain cacheable-shaped GET
 * that returns 401 to anyone who isn't an admin.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const live = await liveVisitors();
  return NextResponse.json(live, { headers: { "cache-control": "no-store" } });
}
