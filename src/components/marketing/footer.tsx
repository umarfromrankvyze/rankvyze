import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "AI Visibility", href: "/#product" },
      { label: "AEO Audit", href: "/#audit" },
      { label: "Competitors", href: "/#competitors" },
      { label: "Citations", href: "/#features" },
      { label: "Optimization", href: "/#optimization" },
      { label: "Reports", href: "/#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Pricing", href: "/pricing" },
      { label: "Guarantee", href: "/guarantee" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "AEO Guide", href: "/aeo-guide" },
      { label: "Blog", href: "/blog" },
      { label: "Documentation", href: "/docs" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="container-x py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)] md:gap-8">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted">
              RankVyze helps your business get discovered, understood, and recommended by AI engines.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink-muted">
              <span className="size-1.5 rounded-full bg-success" />
              All systems operational
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans text-[12px] font-semibold uppercase tracking-wider text-ink">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="inline-flex items-center text-[13.5px] text-ink-muted transition-colors hover:text-ink pointer-coarse:min-h-11">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 RankVyze. All rights reserved.</p>
          <p>Rank higher in AI search.</p>
        </div>
      </div>
    </footer>
  );
}
