import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getContentOpportunities } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/score-card";
import { ContentList } from "@/components/dashboard/content-list";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  const { website } = await dashboardContext();
  const items = await getContentOpportunities(website.id);
  const high = items.filter((i) => i.potential === "HIGH" && i.status !== "PUBLISHED").length;
  const active = items.filter((i) => i.status === "PLANNED" || i.status === "IN_PROGRESS").length;
  const published = items.filter((i) => i.status === "PUBLISHED").length;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Content Opportunities" description="The pages AI engines want to see before they'll recommend you — prioritized by the prompts you're losing." />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="High potential" value={high} sub="gaps where competitors are cited today" accent />
        <StatTile label="In the pipeline" value={active} sub="planned or being written" />
        <StatTile label="Published" value={published} sub="live and tracked" />
      </div>
      <ContentList websiteId={website.id} items={items} />
    </>
  );
}
