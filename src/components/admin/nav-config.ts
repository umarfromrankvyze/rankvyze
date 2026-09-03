import {
  Activity,
  BarChart3,
  Code2,
  CreditCard,
  FileText,
  FlaskConical,
  Globe,
  LayoutDashboard,
  Newspaper,
  ShieldAlert,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/nav-config";

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: Activity },
  { label: "Finance", href: "/admin/finance", icon: Wallet, badgeKey: "orders" },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: CreditCard },
  { label: "Websites", href: "/admin/websites", icon: Globe },
  { label: "AI Research", href: "/admin/research", icon: FlaskConical, badgeKey: "reviews" },
  { label: "AEO Audits", href: "/admin/audits", icon: BarChart3 },
  { label: "Issues", href: "/admin/issues", icon: ShieldAlert },
  { label: "Competitors", href: "/admin/competitors", icon: UsersRound },
  { label: "Code Changes", href: "/admin/code-changes", icon: Code2, badgeKey: "issues" },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];
