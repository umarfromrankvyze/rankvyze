import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWorkspace } from "@/server/queries";
import { getEngagement, hasPaid } from "@/server/engagement";
import { formatDate } from "@/lib/utils";
import { SidebarNav, ResearchCadenceCard } from "@/components/dashboard/sidebar";
import { Topbar, type Notification } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const workspace = await getWorkspace(user.id);

  if (!workspace) {
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/onboarding");
  }
  // Payment precedes access: the engagement clock starts at purchase.
  if (user.role !== "ADMIN" && !(await hasPaid(workspace.organization.id))) redirect("/checkout");
  if (!workspace.organization.onboardingCompletedAt && user.role !== "ADMIN") redirect("/onboarding");
  if (!workspace.website) redirect("/onboarding?restart=1");

  const websiteId = workspace.website.id;
  const [openIssues, awaitingReview, promptCount, engineCount, lastSession, latestAudit, recentChanges] = await Promise.all([
    db.aEOIssue.count({ where: { websiteId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.codeChange.count({ where: { websiteId, status: "AWAITING_REVIEW" } }),
    db.prompt.count({ where: { websiteId, isActive: true } }),
    db.aIEngine.count({ where: { isActive: true } }),
    db.researchSession.findFirst({ where: { websiteId, status: "COMPLETED" }, orderBy: { completedAt: "desc" } }),
    db.aEOAudit.findFirst({ where: { websiteId, status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
    db.codeChange.findMany({ where: { websiteId, status: "AWAITING_REVIEW" }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const notifications: Notification[] = [];
  if (lastSession?.completedAt) {
    notifications.push({
      id: `session-${lastSession.id}`,
      title: "New AI research results",
      description: `${lastSession.title} finished. Your visibility metrics were updated.`,
      href: "/dashboard/visibility",
      at: lastSession.completedAt.toISOString(),
      tone: "brand",
    });
  }
  for (const c of recentChanges) {
    notifications.push({
      id: `cc-${c.id}`,
      title: `Code change #${c.number} awaits your review`,
      description: c.title,
      href: `/dashboard/code-changes/${c.id}`,
      at: c.createdAt.toISOString(),
      tone: "warning",
    });
  }
  if (latestAudit) {
    notifications.push({
      id: `audit-${latestAudit.id}`,
      title: `AEO audit published — ${latestAudit.overallScore}/100`,
      description: latestAudit.summary ?? "Review the categories and issues.",
      href: "/dashboard/audit",
      at: latestAudit.createdAt.toISOString(),
      tone: "info",
    });
  }
  notifications.sort((a, b) => (a.at < b.at ? 1 : -1));

  const nextRun = nextRunAfter(lastSession?.completedAt ?? null);

  const engagement = await getEngagement(workspace.organization.id);
  if (engagement?.status === "ELIGIBLE" && engagement.canClaim) {
    notifications.unshift({
      id: `guarantee-${engagement.id}`,
      title: "Your guarantee wasn't met",
      description: "You're eligible for a full refund. Claim it from the Guarantee page.",
      href: "/dashboard/guarantee",
      at: (engagement.endsAt ?? new Date()).toISOString(),
      tone: "warning",
    });
  }

  const nav = (
    <SidebarNav
      variant="dashboard"
      badges={{ issues: openIssues, reviews: awaitingReview }}
      footer={<ResearchCadenceCard nextDate={formatDate(nextRun, { month: "short", day: "numeric" })} promptCount={promptCount} engineCount={engineCount} />}
    />
  );

  return (
    <div className="flex min-h-screen bg-surface-2">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-line bg-surface-2 lg:block">{nav}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          websites={workspace.websites.map((w) => ({ id: w.id, name: w.name, domain: w.domain }))}
          currentWebsiteId={websiteId}
          notifications={notifications}
          mobileNav={nav}
          plan={workspace.organization.plan}
        />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1280px] animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Research runs on a 28-day cadence from the last completed session. */
function nextRunAfter(lastCompleted: Date | null) {
  const d = new Date(lastCompleted ?? Date.now());
  d.setDate(d.getDate() + 28);
  return d;
}
