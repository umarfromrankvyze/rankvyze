"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { engineMeta } from "@/components/ui/engine-icon";
import type { TrendPoint } from "@/server/queries";

const AXIS = { fontSize: 11, fill: "#8f8f99" } as const;
const BRAND = "#FC5D2C";
const INK = "#0B0B0F";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TooltipBox({ active, payload, label, suffix = "" }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] shadow-lift">
      <p className="mb-1 font-medium text-ink">{label && label.includes("T") ? fmtDate(label) : label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-ink-muted">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold tabular-nums text-ink">{p.value}{suffix}</span>
        </p>
      ))}
    </div>
  );
}

/** Area trend of the overall AI Visibility score. */
export function VisibilityChart({ data, height = 220 }: { data: TrendPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="vis-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={AXIS} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox />} />
        <Area type="monotone" dataKey="score" name="AI Visibility" stroke={BRAND} strokeWidth={2.25} fill="url(#vis-fill)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} isAnimationActive animationDuration={900} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Multi-line comparison per engine. */
export function EngineTrendChart({ series, height = 240 }: { series: Record<string, TrendPoint[]>; height?: number }) {
  const keys = Object.keys(series);
  const dates = series[keys[0]]?.map((p) => p.date) ?? [];
  const data = dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const k of keys) row[k] = series[k][i]?.score ?? 0;
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={AXIS} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox />} />
        {keys.map((k) => (
          <Line key={k} type="monotone" dataKey={k} name={engineMeta(k).name} stroke={engineMeta(k).color} strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} isAnimationActive animationDuration={900} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Horizontal competitor comparison; the customer's own brand in orange. */
export function CompetitorBarChart({ data, height }: { data: { name: string; score: number; isYou: boolean }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height ?? Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }} barCategoryGap={10}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="name" tick={{ ...AXIS, fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(11,11,15,0.03)" }} />
        <Bar dataKey="score" name="AI Visibility" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800} label={{ position: "right", fontSize: 12, fill: INK, fontWeight: 600 }}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.isYou ? BRAND : "rgba(11,11,15,0.32)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Small mention/citation rate history for a single engine. */
export function RateChart({ data, height = 180 }: { data: TrendPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={AXIS} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipBox suffix="%" />} />
        <Line type="monotone" dataKey="mentionRate" name="Mention rate" stroke={INK} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="citationRate" name="Citation rate" stroke={BRAND} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
