"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Charts for /admin/analytics and /admin/finance.
 *
 * Separate from the customer-facing dashboard/charts.tsx: those are typed
 * against visibility TrendPoints, and widening them to cover money and traffic
 * would make one component serve three unrelated shapes.
 */

const AXIS = { fontSize: 11, fill: "#8f8f99" } as const;
const BRAND = "#FC5D2C";
const INK = "#0B0B0F";

function shortDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function Box({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] shadow-lift">
      <p className="mb-1 font-medium text-ink">{label ? shortDay(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-ink-muted">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}:{" "}
          <span className="font-semibold tabular-nums text-ink">
            {format ? format(p.value ?? 0) : (p.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  );
}

export interface TrafficPoint {
  day: string;
  visitors: number;
  views: number;
  signups: number;
}

/** Visitors and signups on one scale — signups are rare, so they're a line. */
export function TrafficChart({ data, height = 260 }: { data: TrafficPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#EFEFF2" vertical={false} />
        <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={shortDay} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
        <Tooltip content={<Box />} />
        <Area type="monotone" dataKey="visitors" name="Visitors" stroke={BRAND} strokeWidth={2} fill="url(#visitorsFill)" />
        <Line type="monotone" dataKey="signups" name="Signups" stroke={INK} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export interface RevenuePoint {
  day: string;
  gross: number;
  refunded: number;
  net: number;
  orders: number;
}

/**
 * Daily net revenue.
 *
 * Bars rather than an area: revenue on a one-time product arrives in discrete
 * chunks on the days orders land, and a smoothed curve between them would
 * imply a continuous stream that doesn't exist.
 */
export function RevenueChart({ data, height = 260 }: { data: RevenuePoint[]; height?: number }) {
  const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
        <CartesianGrid stroke="#EFEFF2" vertical={false} />
        <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={shortDay} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => money(v)} />
        <Tooltip content={<Box format={money} />} cursor={{ fill: "#F7F7F8" }} />
        <Bar dataKey="net" name="Net revenue" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}
