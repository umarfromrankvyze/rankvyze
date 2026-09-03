import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getIssues } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { IssuesList } from "@/components/dashboard/issues-list";
import { StatTile } from "@/components/dashboard/score-card";

export const metadata: Metadata = { title: "Issues" };

export default async function IssuesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { website } = await dashboardContext();
  const { category } = await searchParams;
  const issues = await getIssues(website.id);
  const open = issues.filter((i) => i.status === "OPEN");
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS");
  const fixed = issues.filter((i) => i.status === "FIXED");
  const highImpact = issues.filter((i) => (i.status === "OPEN" || i.status === "IN_PROGRESS") && (i.severity === "CRITICAL" || i.severity === "HIGH"));

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Issues" description="Everything holding your AI visibility back, ranked by impact. Each issue explains what's wrong, why it matters, and how to fix it." />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatTile label="Open" value={open.length} sub="waiting for action" />
        <StatTile label="High impact" value={highImpact.length} sub="critical or high severity" accent />
        <StatTile label="In progress" value={inProgress.length} sub="fix underway" />
        <StatTile label="Fixed" value={fixed.length} sub="resolved so far" />
      </div>
      <IssuesList issues={issues} initialCategory={category} />
    </>
  );
}
