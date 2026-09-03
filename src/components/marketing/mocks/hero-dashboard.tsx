import { ArrowUpRight, Quote, Search, Trophy } from "lucide-react";
import { EngineIcon } from "@/components/ui/engine-icon";
import { Counter } from "@/components/ui/counter";
import { cn } from "@/lib/utils";

const ENGINES = [
  { key: "chatgpt", name: "ChatGPT", value: 87 },
  { key: "perplexity", name: "Perplexity", value: 79 },
  { key: "gemini", name: "Gemini", value: 81 },
  { key: "claude", name: "Claude", value: 76 },
];

const TREND = [38, 41, 40, 47, 52, 55, 61, 58, 66, 71, 74, 82];

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 300;
  const h = 80;
  const min = Math.min(...data) - 6;
  const max = Math.max(...data) + 4;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / (max - min)) * h,
  ]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-20 w-full", className)} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FC5D2C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FC5D2C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={d} fill="none" stroke="#FC5D2C" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#FC5D2C" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function Ring({ value }: { value: number }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1EF" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FC5D2C"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[34px] font-bold leading-none tracking-tight text-ink">
          <Counter value={value} duration={1400} />
        </span>
        <span className="mt-1 text-[11px] font-medium text-ink-faint">/ 100</span>
      </div>
    </div>
  );
}

/**
 * The hero product visual: a RankVyze visibility panel with floating stat
 * cards. Pure markup + SVG so it ships as static HTML.
 */
export function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-[880px]">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-6 -z-10 rounded-[40px] bg-[radial-gradient(60%_50%_at_50%_30%,rgb(252_93_44/0.16),transparent_70%)]"
      />

      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-md border border-line bg-white px-2.5 text-[11px] text-ink-faint">
            app.rankvyze.com/dashboard
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.15fr_1fr]">
          {/* Left: score */}
          <div className="border-b border-line p-6 md:border-b-0 md:border-r md:p-7">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AI Visibility</p>
              <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-[11.5px] font-semibold text-green-700">
                <ArrowUpRight className="size-3" /> 24.8%
              </span>
            </div>

            <div className="mt-5 flex items-center gap-6">
              <Ring value={82} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold text-ink">Your brand visibility</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                  Recommended in <span className="font-semibold text-ink">64%</span> of tracked queries across four AI
                  engines.
                </p>
                <div className="mt-4">
                  <Sparkline data={TREND} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-ink-faint">
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: engines */}
          <div className="p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">By engine</p>
            <ul className="mt-5 space-y-4">
              {ENGINES.map((e, i) => (
                <li key={e.key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="inline-flex items-center gap-2 font-medium text-ink">
                      <EngineIcon engine={e.key} size={15} />
                      {e.name}
                    </span>
                    <span className="font-semibold tabular-nums text-ink">{e.value}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full origin-left rounded-full bg-ink animate-grow-bar"
                      style={{ width: `${e.value}%`, animationDelay: `${300 + i * 120}ms` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-surface-2">
              {[
                { label: "AI Mentions", value: 248 },
                { label: "Citations", value: 91 },
                { label: "Queries Won", value: 64, suffix: "%" },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2.5 text-center">
                  <p className="font-display text-[17px] font-bold tabular-nums text-ink">
                    <Counter value={s.value} suffix={s.suffix ?? ""} />
                  </p>
                  <p className="text-[10.5px] text-ink-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <FloatCard
        className="-left-4 top-[42%] hidden animate-fade-up [animation-delay:500ms] lg:flex"
        icon={<Trophy className="size-4 text-brand-500" />}
        title="Recommended #1"
        subtitle="“Best Shopify agencies for fashion brands” · ChatGPT"
      />
      <FloatCard
        className="-right-6 top-[14%] hidden animate-fade-up [animation-delay:700ms] lg:flex"
        icon={<Quote className="size-4 text-brand-500" />}
        title="New citation"
        subtitle="/guides/shopify-redesign-checklist · Perplexity"
      />
      <FloatCard
        className="-right-2 bottom-[-22px] hidden animate-fade-up [animation-delay:900ms] lg:flex"
        icon={<Search className="size-4 text-brand-500" />}
        title="Prompt tracked"
        subtitle="“Which ecommerce agency should I hire?”"
      />
    </div>
  );
}

function FloatCard({
  icon,
  title,
  subtitle,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 max-w-[250px] items-start gap-3 rounded-xl border border-line bg-white/95 p-3 shadow-lift backdrop-blur",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">{icon}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="truncate text-[11.5px] text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}
