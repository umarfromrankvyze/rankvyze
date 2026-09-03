"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { LIVE_WINDOW_SECONDS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface Breakdown {
  label: string;
  count: number;
}
interface Live {
  count: number;
  pages: Breakdown[];
  countries: Breakdown[];
}

const POLL_MS = 10_000;

/**
 * "Right now" panel.
 *
 * Seeded with a server-rendered snapshot so the number is correct on first
 * paint rather than flashing zero, then polled. The poll pauses while the tab
 * is hidden — an admin console left open on a second monitor shouldn't keep
 * hitting the database all day.
 */
export function LiveVisitors({ initial }: { initial: Live }) {
  const [live, setLive] = useState(initial);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/analytics/live", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Live;
        if (!cancelled) {
          setLive(data);
          setStale(false);
        }
      } catch {
        // Keep showing the last good numbers, but say they may be out of date.
        if (!cancelled) setStale(true);
      }
    };

    const timer = window.setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            <span className="relative flex size-2">
              {live.count > 0 && !stale && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-70" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  stale ? "bg-amber-400" : live.count > 0 ? "bg-green-500" : "bg-ink-faint/40",
                )}
              />
            </span>
            On the site now
          </p>
          <p className="mt-3 font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">
            {live.count}
          </p>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            {stale ? "Reconnecting — showing the last reading." : `Seen in the last ${LIVE_WINDOW_SECONDS} seconds.`}
          </p>
        </div>
        <Radio className="size-4 shrink-0 text-ink-faint" />
      </div>

      {live.count > 0 && (
        <div className="mt-5 grid gap-5 border-t border-line pt-4 sm:grid-cols-2">
          <LiveList title="Pages" rows={live.pages} empty="No pages recorded" />
          <LiveList title="Countries" rows={live.countries} empty="No country data" />
        </div>
      )}
    </div>
  );
}

function LiveList({ title, rows, empty }: { title: string; rows: Breakdown[]; empty: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-[13px] text-ink-faint">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-ink-muted">{r.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
