import { Check, GitPullRequest } from "lucide-react";
import { cn } from "@/lib/utils";

const LINES: { type: "context" | "add" | "del"; text: string }[] = [
  { type: "context", text: "export const metadata = {" },
  { type: "del", text: '  description: "Welcome to our website.",' },
  { type: "add", text: '  description: "Acme is a Shopify agency that designs, builds and' },
  { type: "add", text: '    scales ecommerce stores for fashion & lifestyle brands.",' },
  { type: "context", text: "};" },
  { type: "context", text: "" },
  { type: "add", text: "<OrganizationSchema" },
  { type: "add", text: '  name="Acme"' },
  { type: "add", text: '  sameAs={["https://linkedin.com/company/acme"]}' },
  { type: "add", text: "/>" },
  { type: "add", text: '<ServiceSchema name="Shopify Development" areaServed="Global" />' },
  { type: "add", text: "<FAQSection items={faq} />" },
];

const SUMMARY = [
  { del: true, text: "Generic homepage description" },
  { add: true, text: "Clear company entity definition" },
  { add: true, text: "Organization schema" },
  { add: true, text: "Service schema" },
  { add: true, text: "FAQ structure" },
  { add: true, text: "Internal links" },
];

export function CodeDiffPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-float">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-brand-500/15 px-2 py-0.5 font-mono text-[11px] font-medium text-brand-400">#104</span>
          <p className="font-display text-[14px] font-semibold text-white">Improve homepage entity definition</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-green-400">+38</span>
          <span className="text-red-400">−4</span>
          <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-amber-300">Awaiting review</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_260px]">
        <div className="min-w-0 border-b border-white/10 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-white/50">
            <span className="text-white/80">app/layout.tsx</span>
            <span>·</span>
            <span>components/OrganizationSchema.tsx</span>
          </div>
          <pre className="overflow-x-auto p-0 font-mono text-[12px] leading-[1.7] scrollbar-thin">
            {LINES.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  l.type === "add" && "bg-green-500/[0.09]",
                  l.type === "del" && "bg-red-500/[0.10]",
                )}
              >
                <span className="w-10 shrink-0 select-none pr-2 text-right text-white/25">{i + 12}</span>
                <span
                  className={cn(
                    "w-5 shrink-0 select-none text-center",
                    l.type === "add" && "text-green-400",
                    l.type === "del" && "text-red-400",
                    l.type === "context" && "text-white/20",
                  )}
                >
                  {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
                </span>
                <span
                  className={cn(
                    "whitespace-pre pr-4",
                    l.type === "add" && "text-green-100",
                    l.type === "del" && "text-red-200/80 line-through decoration-red-300/40",
                    l.type === "context" && "text-white/60",
                  )}
                >
                  {l.text}
                </span>
              </div>
            ))}
          </pre>
        </div>

        <div className="flex flex-col p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Change summary</p>
          <ul className="mt-3 space-y-2 font-mono text-[12px]">
            {SUMMARY.map((s) => (
              <li key={s.text} className="flex items-start gap-2">
                <span className={cn("w-3 shrink-0", s.add ? "text-green-400" : "text-red-400")}>{s.add ? "+" : "−"}</span>
                <span className={cn(s.add ? "text-white/85" : "text-white/40 line-through")}>{s.text}</span>
              </li>
            ))}
          </ul>

          {/*
            Divs, not buttons. This panel is a picture of the product, and these
            two do nothing when pressed. As <button> they were focusable, were
            announced to screen readers as available actions, and failed the
            44px touch-target check for controls that were never real.
          */}
          <div aria-hidden className="mt-auto space-y-2 pt-6">
            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] text-[13px] font-medium text-white">
              <Check className="size-4" /> Review Changes
            </div>
            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-[13px] font-medium text-white shadow-brand">
              <GitPullRequest className="size-4" /> Create Pull Request
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
