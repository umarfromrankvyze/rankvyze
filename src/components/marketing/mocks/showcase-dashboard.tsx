import {
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  Gauge,
  LayoutDashboard,
  MessageSquare,
  Quote,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { EngineIcon } from "@/components/ui/engine-icon";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Gauge, label: "AI Visibility" },
  { icon: MessageSquare, label: "Prompts" },
  { icon: Users, label: "Competitors" },
  { icon: Quote, label: "Citations" },
  { icon: BarChart3, label: "AEO Audit" },
  { icon: Sparkles, label: "Opportunities" },
  { icon: Wrench, label: "Optimization" },
  { icon: FileText, label: "Reports" },
];

const ENGINES = [
  { key: "chatgpt", name: "ChatGPT", value: 87, delta: "+6.2" },
  { key: "perplexity", name: "Perplexity", value: 79, delta: "+3.8" },
  { key: "gemini", name: "Gemini", value: 81, delta: "+9.1" },
  { key: "claude", name: "Claude", value: 76, delta: "+2.4" },
];

const PROMPTS = [
  { text: "Best Shopify agencies for fashion brands", engine: "chatgpt", pos: 1, cited: true },
  { text: "Which ecommerce agency should I hire?", engine: "perplexity", pos: 2, cited: true },
  { text: "Best website redesign agencies", engine: "gemini", pos: 3, cited: false },
  { text: "Top Shopify developers 2026", engine: "claude", pos: 1, cited: true },
  { text: "Shopify vs custom ecommerce build", engine: "chatgpt", pos: null, cited: false },
];

const COMPETITORS = [
  { name: "Your brand", value: 82, you: true },
  { name: "Northwind Digital", value: 74 },
  { name: "Halcyon Studio", value: 61 },
  { name: "Vertex Commerce", value: 55 },
];

const SERIES = {
  you: [34, 38, 41, 40, 46, 52, 55, 61, 66, 71, 74, 82],
  a: [62, 63, 65, 64, 68, 70, 69, 72, 71, 73, 74, 74],
  b: [58, 57, 59, 60, 58, 61, 60, 62, 61, 60, 61, 61],
};

function line(data: number[], w: number, h: number) {
  const min = 25;
  const max = 90;
  return data
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (data.length - 1)) * w).toFixed(1)} ${(h - ((v - min) / (max - min)) * h).toFixed(1)}`)
    .join(" ");
}

export function ShowcaseDashboard() {
  const w = 520;
  const h = 150;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float">
      <div className="flex min-h-[560px]">
        {/* Sidebar */}
        <aside className="hidden w-[196px] shrink-0 flex-col border-r border-line bg-surface-2 p-4 md:flex">
          <div className="flex items-center gap-2 px-1">
            <LogoMark size={22} />
            <span className="font-display text-[15px] font-bold tracking-tight">RankVyze</span>
          </div>
          <nav className="mt-6 space-y-0.5">
            {NAV.map((n) => (
              <div
                key={n.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium",
                  n.active ? "bg-white text-ink shadow-card" : "text-ink-muted",
                )}
              >
                <n.icon className={cn("size-3.5", n.active ? "text-brand-500" : "text-ink-faint")} />
                {n.label}
              </div>
            ))}
          </nav>
          <div className="mt-auto rounded-lg border border-line bg-white p-3">
            <p className="text-[11px] font-semibold text-ink">Next research</p>
            <p className="mt-0.5 text-[10.5px] text-ink-muted">Sep 9 · 20 prompts × 4 engines</p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1 text-[12px] font-medium text-ink">
              <span className="size-4 rounded bg-ink text-center text-[9px] font-bold leading-4 text-white">A</span>
              acme.com
              <ChevronDown className="size-3.5 text-ink-faint" />
            </div>
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-ink-faint" />
              <span className="size-7 rounded-full bg-ink text-center text-[10px] font-semibold leading-7 text-white">JD</span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {/* Top row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]">
              <div className="rounded-xl border border-line p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AI Visibility Score</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-display text-[44px] font-bold leading-none tracking-tight text-ink">82</span>
                  <span className="mb-1.5 text-[13px] text-ink-faint">/ 100</span>
                  <span className="mb-2 ml-auto rounded-md bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-green-700">
                    ↑ 24.8%
                  </span>
                </div>
                <p className="mt-2 text-[11.5px] text-ink-muted">vs. previous 30 days</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["248", "AI mentions"],
                    ["91", "Citations"],
                    ["64%", "Queries won"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-lg bg-surface-2 px-2.5 py-2">
                      <p className="font-display text-[15px] font-bold text-ink">{v}</p>
                      <p className="text-[10px] text-ink-faint">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Visibility trend</p>
                  <div className="flex items-center gap-3 text-[10.5px] text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-3 rounded-full bg-brand-500" /> You
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-3 rounded-full bg-ink/60" /> Northwind
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-3 rounded-full bg-line-strong" /> Halcyon
                    </span>
                  </div>
                </div>
                <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-[150px] w-full" preserveAspectRatio="none" aria-hidden>
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#ECECEA" strokeDasharray="3 4" />
                  ))}
                  <path d={line(SERIES.b, w, h)} fill="none" stroke="#D6D6D1" strokeWidth="2" />
                  <path d={line(SERIES.a, w, h)} fill="none" stroke="#0B0B0F" strokeOpacity="0.55" strokeWidth="2" />
                  <path d={line(SERIES.you, w, h)} fill="none" stroke="#FC5D2C" strokeWidth="2.5" strokeLinejoin="round" />
                  <circle cx={w} cy={h - ((82 - 25) / 65) * h} r="4" fill="#FC5D2C" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Engines */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {ENGINES.map((e) => (
                <div key={e.key} className="rounded-xl border border-line p-3.5">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
                    <EngineIcon engine={e.key} size={14} />
                    {e.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-[22px] font-bold tabular-nums text-ink">{e.value}%</span>
                    <span className="text-[10.5px] font-semibold text-green-700">{e.delta}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${e.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5">
                  <p className="text-[11px] font-semibold text-ink">Tracked prompts</p>
                  <p className="text-[10.5px] text-ink-faint">20 active</p>
                </div>
                <ul className="divide-y divide-line">
                  {PROMPTS.map((p) => (
                    <li key={p.text} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                      <EngineIcon engine={p.engine} size={13} />
                      <span className="min-w-0 flex-1 truncate text-ink">{p.text}</span>
                      {p.pos ? (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                            p.pos === 1 ? "bg-brand-50 text-brand-700" : "bg-surface-3 text-ink-muted",
                          )}
                        >
                          #{p.pos}
                        </span>
                      ) : (
                        <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-red-700">
                          Not mentioned
                        </span>
                      )}
                      <span className={cn("w-11 text-right text-[10.5px]", p.cited ? "text-ink-muted" : "text-ink-faint")}>
                        {p.cited ? "Cited" : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-line p-4">
                <p className="text-[11px] font-semibold text-ink">Competitor position</p>
                <ul className="mt-3 space-y-3">
                  {COMPETITORS.map((c) => (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className={cn("font-medium", c.you ? "text-brand-700" : "text-ink")}>{c.name}</span>
                        <span className="font-semibold tabular-nums text-ink">{c.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={cn("h-full rounded-full", c.you ? "bg-brand-500" : "bg-ink/25")}
                          style={{ width: `${c.value}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
