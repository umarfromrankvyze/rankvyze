"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV, DASHBOARD_SECONDARY, type NavItem } from "@/components/dashboard/nav-config";
import { ADMIN_NAV } from "@/components/admin/nav-config";

interface SidebarProps {
  variant: "dashboard" | "admin";
  badges?: Partial<Record<NonNullable<NavItem["badgeKey"]>, number>>;
  onNavigate?: () => void;
  footer?: React.ReactNode;
}

const CONFIG = {
  dashboard: { items: DASHBOARD_NAV, secondary: DASHBOARD_SECONDARY, home: "/dashboard", suffix: undefined },
  admin: { items: ADMIN_NAV, secondary: [] as NavItem[], home: "/admin", suffix: "Admin" },
} as const;

export function SidebarNav({ variant, badges = {}, onNavigate, footer }: SidebarProps) {
  const pathname = usePathname();
  const { items, secondary, home, suffix } = CONFIG[variant];
  const isActive = (href: string) => (href === home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] font-medium transition-colors",
          active ? "bg-white text-ink shadow-card" : "text-ink-muted hover:bg-white/70 hover:text-ink",
        )}
      >
        <item.icon className={cn("size-4 shrink-0", active ? "text-brand-500" : "text-ink-faint group-hover:text-ink-muted")} />
        <span className="flex-1 truncate">{item.label}</span>
        {badge ? (
          <span className={cn("rounded-md px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-brand-50 text-brand-700" : "bg-line text-ink-muted")}>
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href={home} size={26} suffix={suffix} />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 scrollbar-thin" aria-label="Dashboard">
        {items.map(renderItem)}
        {secondary.length > 0 && <div className="my-3 h-px bg-line" />}
        {secondary.map(renderItem)}
      </nav>
      <div className="p-3">{footer}</div>
    </div>
  );
}

export function ResearchCadenceCard({ nextDate, promptCount, engineCount }: { nextDate: string; promptCount: number; engineCount: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3.5 shadow-card">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
        <CalendarClock className="size-3.5 text-brand-500" />
        Next research run
      </div>
      <p className="mt-1 text-[12px] text-ink-muted">
        {nextDate} · {promptCount} prompts × {engineCount} engines
      </p>
      <p className="mt-2 text-[11px] leading-snug text-ink-faint">Results are researched by the RankVyze team and appear here automatically.</p>
    </div>
  );
}
