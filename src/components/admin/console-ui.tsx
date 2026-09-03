import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Small shared pieces for the analytics and finance consoles.
 *
 * All server components — the range picker is a set of links rather than a
 * client-side control, so changing the window is a normal navigation that
 * survives a refresh and can be bookmarked.
 */

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export function parseRange(value: string | undefined): Range {
  const n = Number(value);
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : 30;
}

export function RangeTabs({ basePath, active, extra }: { basePath: string; active: Range; extra?: Record<string, string> }) {
  const query = (days: number) => {
    const params = new URLSearchParams({ ...extra, days: String(days) });
    return `${basePath}?${params.toString()}`;
  };
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-0.5 shadow-card">
      {RANGES.map((days) => (
        <Link
          key={days}
          href={query(days)}
          aria-current={days === active ? "page" : undefined}
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors",
            days === active ? "bg-ink text-white" : "text-ink-muted hover:text-ink",
          )}
        >
          {days}d
        </Link>
      ))}
    </div>
  );
}

/**
 * A headline number with its change against the previous window.
 *
 * The change is only rendered when there is a previous figure to compare with —
 * "+100%" against a base of zero is noise, not information.
 */
export function Stat({
  label,
  value,
  previous,
  current,
  hint,
  invertDelta = false,
}: {
  label: string;
  value: string;
  /** Raw numbers, used only to compute the change. */
  previous?: number;
  current?: number;
  hint?: string;
  /** For metrics where up is bad — refunds, say. */
  invertDelta?: boolean;
}) {
  const showDelta = typeof previous === "number" && typeof current === "number" && previous > 0;
  const pct = showDelta ? Math.round(((current - previous) / previous) * 100) : 0;
  const good = invertDelta ? pct <= 0 : pct >= 0;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{label}</p>
      <p className="mt-3 font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        {showDelta && (
          <span className={cn("font-semibold tabular-nums", good ? "text-green-700" : "text-red-700")}>
            {pct > 0 ? "+" : ""}
            {pct}%
          </span>
        )}
        {hint && <span className="text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}

export interface BreakdownRow {
  label: string;
  count: number;
}

/** A ranked list with an inline share bar. */
export function Breakdown({
  title,
  rows,
  total,
  empty = "Nothing recorded yet.",
  note,
}: {
  title: string;
  rows: BreakdownRow[];
  total: number;
  empty?: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        {note && <span className="text-[11.5px] text-ink-faint">{note}</span>}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-ink-faint">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((row) => {
            const share = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="truncate text-ink-muted">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-ink">
                    <span className="font-semibold">{row.count}</span>
                    <span className="ml-1.5 text-ink-faint">{share}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(share, 2)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** A factual note about how a number was produced. Not a warning. */
export function DataNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
      {children}
    </div>
  );
}
