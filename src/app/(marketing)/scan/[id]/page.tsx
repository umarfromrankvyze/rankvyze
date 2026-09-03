import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Check, Info, ShieldCheck, X } from "lucide-react";
import { db } from "@/lib/db";
import type { ScanResult } from "@/lib/scanner";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { Card } from "@/components/ui/card";
import { EngineIcon } from "@/components/ui/engine-icon";
import { PRICE_LABEL, GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your AI readiness scan" };

const STATUS_META = {
  pass: { icon: Check, cls: "border-green-200 bg-success-soft text-green-700", label: "Pass" },
  warn: { icon: AlertTriangle, cls: "border-amber-200 bg-warning-soft text-amber-700", label: "Needs work" },
  fail: { icon: X, cls: "border-red-200 bg-danger-soft text-red-700", label: "Missing" },
} as const;

export default async function ScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await db.scanRequest.findUnique({ where: { id } });
  if (!scan) notFound();

  const result = JSON.parse(scan.resultJson) as ScanResult;
  const failed = result.checks.filter((c) => c.status === "fail");
  const warned = result.checks.filter((c) => c.status === "warn");
  const problems = failed.length + warned.length;

  return (
    <div className="container-x py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">Free scan · {formatDate(scan.createdAt)}</p>
        <h1 className="mt-3 text-balance font-display text-[2.2rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink md:text-[2.9rem]">
          {result.domain}
        </h1>

        {/* Score */}
        <Card className="mt-8 flex flex-col items-center gap-7 p-7 sm:flex-row sm:p-8">
          <ScoreRing value={result.score} size={132} stroke={10} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">AI readiness</p>
            <p className="mt-1.5 font-display text-[15px] font-semibold text-ink">
              {problems === 0
                ? "Your site is well structured for AI engines."
                : `${problems} ${problems === 1 ? "thing is" : "things are"} making you harder for AI engines to understand.`}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              These are objective checks on your homepage — schema, rendering and crawler policy. They measure whether a
              model <em>can</em> understand you.
            </p>
          </div>
        </Card>

        {/* The honest limit of a free scan */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
          <p className="text-[13.5px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">What this scan can&apos;t tell you:</span> whether ChatGPT, Perplexity,
            Gemini or Claude actually mention {result.domain} when your buyers ask. That takes real prompts run against
            each engine — it&apos;s the first thing we do when you start.
          </p>
        </div>

        {/* Checks */}
        <div className="mt-8 space-y-3">
          {result.checks.map((c) => {
            const meta = STATUS_META[c.status];
            return (
              <Card key={c.key} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] font-semibold", meta.cls)}>
                    <meta.icon className="size-3.5" />
                    {meta.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[15px] font-semibold text-ink">{c.label}</h3>
                    <p className="mt-1 break-words text-[13.5px] text-ink-muted">{c.detail}</p>
                    {c.status !== "pass" && (
                      <p className="mt-2 border-l-2 border-brand-200 pl-3 text-[13px] leading-relaxed text-ink-muted">{c.why}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Offer */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-lift ring-4 ring-brand-500/5">
          <div className="border-b border-line bg-brand-50/50 px-7 py-5">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              <ShieldCheck className="size-4" /> {GUARANTEE_DAYS}-day guarantee
            </p>
            <h2 className="mt-2 font-display text-[24px] font-bold tracking-tight text-ink md:text-[28px]">
              Get {result.domain} recommended by AI engines.
            </h2>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
              We research how every major engine answers your buyers&apos; questions, fix what&apos;s holding you back, and
              track it for {GUARANTEE_DAYS} days. If you aren&apos;t mentioned on at least {GUARANTEE_MIN_ENGINES} engines by
              then, <span className="font-semibold text-ink">we refund you 100%</span>.
            </p>
          </div>
          <div className="flex flex-col gap-5 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-ink">{PRICE_LABEL}</span>
              <span className="text-[14px] text-ink-faint">one-time</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                {["chatgpt", "perplexity", "gemini", "claude"].map((e) => (
                  <span key={e} className="flex size-7 items-center justify-center rounded-md border border-line bg-white">
                    <EngineIcon engine={e} size={14} />
                  </span>
                ))}
              </div>
              <Button size="lg" asChild>
                <Link href={`/signup?scan=${scan.id}`}>
                  Get started <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-faint">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(`/checkout?scan=${scan.id}`)}`} className="font-medium text-ink underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
