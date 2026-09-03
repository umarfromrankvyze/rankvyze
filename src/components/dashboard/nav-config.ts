import {
  BarChart3,
  Code2,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  PenLine,
  Quote,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "issues" | "reviews" | "orders";
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Visibility", href: "/dashboard/visibility", icon: Gauge },
  { label: "Prompts", href: "/dashboard/prompts", icon: MessageSquareText },
  { label: "Competitors", href: "/dashboard/competitors", icon: Users },
  { label: "Citations", href: "/dashboard/citations", icon: Quote },
  { label: "AEO Audit", href: "/dashboard/audit", icon: BarChart3 },
  { label: "Issues", href: "/dashboard/issues", icon: ShieldAlert, badgeKey: "issues" },
  { label: "Opportunities", href: "/dashboard/opportunities", icon: Lightbulb },
  { label: "Optimization", href: "/dashboard/optimization", icon: Wrench },
  { label: "Code Changes", href: "/dashboard/code-changes", icon: Code2, badgeKey: "reviews" },
  { label: "Content", href: "/dashboard/content", icon: PenLine },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
];

export const DASHBOARD_SECONDARY: NavItem[] = [
  { label: "Guarantee", href: "/dashboard/guarantee", icon: ShieldCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
