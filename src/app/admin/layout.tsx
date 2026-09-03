import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { Topbar, type Notification } from "@/components/dashboard/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [openSessions, readyJobs, pendingRefunds, newCustomers] = await Promise.all([
    db.researchSession.count({ where: { status: "IN_PROGRESS" } }),
    db.codeChange.count({ where: { status: "READY_FOR_CLAUDE" } }),
    db.refundRequest.count({ where: { status: "PENDING" } }),
    db.organization.findMany({ where: { onboardingCompletedAt: { not: null } }, orderBy: { onboardingCompletedAt: "desc" }, take: 3, include: { websites: { take: 1 } } }),
  ]);

  const notifications: Notification[] = newCustomers.map((o) => ({
    id: o.id,
    title: `${o.name} completed onboarding`,
    description: o.websites[0] ? `${o.websites[0].domain} needs a first research run and audit.` : "No website added yet.",
    href: `/admin/customers/${o.id}`,
    at: (o.onboardingCompletedAt ?? o.createdAt).toISOString(),
    tone: "brand",
  }));

  const nav = (
    <SidebarNav
      variant="admin"
      badges={{ reviews: openSessions, issues: readyJobs, orders: pendingRefunds }}
      footer={
        <div className="rounded-xl border border-line bg-white p-3.5 text-[11.5px] leading-snug text-ink-muted shadow-card">
          <p className="font-semibold text-ink">Internal console</p>
          <p className="mt-1">Everything entered here is what customers see. Double-check before saving.</p>
        </div>
      }
    />
  );

  return (
    <div className="flex min-h-screen bg-surface-2">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-line bg-surface-2 lg:block">{nav}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} websites={[]} currentWebsiteId={null} notifications={notifications} mobileNav={nav} admin title="RankVyze Admin" />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1320px] animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
