import Link from "next/link";
import { Logo, LogoMark } from "@/components/ui/logo";
import { EngineIcon } from "@/components/ui/engine-icon";
import { Presence } from "@/components/analytics/presence";

const ENGINES = [
  { key: "chatgpt", value: 87 },
  { key: "perplexity", value: 79 },
  { key: "gemini", value: 81 },
  { key: "claude", value: 76 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      {/* Signup/login are part of the funnel, so they count as site visits. */}
      <Presence />
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center text-[13px] font-medium text-ink-muted transition-colors hover:text-ink pointer-coarse:min-h-11">
            ← Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[400px] animate-fade-up">{children}</div>
        </div>
        <p className="text-center text-[12px] text-ink-faint">© 2026 RankVyze</p>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-brand-500/25 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 size-[420px] rounded-full bg-brand-500/10 blur-[100px]" />

        <div className="relative">
          <p className="eyebrow text-brand-400">Answer Engine Optimization</p>
          <h2 className="mt-4 max-w-md font-display text-[2.4rem] font-bold leading-[1.08] tracking-[-0.03em]">
            Be the answer when customers ask AI what to buy.
          </h2>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">AI Visibility</span>
              <span className="rounded-md bg-green-400/15 px-1.5 py-0.5 text-[11.5px] font-semibold text-green-300">↑ 24.8%</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-[56px] font-bold leading-none tracking-tight">82</span>
              <span className="mb-2 text-white/50">/ 100</span>
            </div>
            <ul className="mt-6 space-y-3">
              {ENGINES.map((e) => (
                <li key={e.key}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="inline-flex items-center gap-2 capitalize text-white/85">
                      <EngineIcon engine={e.key} size={14} />
                      {e.key}
                    </span>
                    <span className="tabular-nums text-white/85">{e.value}%</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${e.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-[13px] text-white/60">
          <LogoMark size={20} />
          Rank higher in AI search.
        </div>
      </aside>
    </div>
  );
}
