import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getEngines, getPrompts } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { PromptTable } from "@/components/dashboard/prompt-table";

export const metadata: Metadata = { title: "Prompts" };

export default async function PromptsPage() {
  const { website } = await dashboardContext();
  const [prompts, engines] = await Promise.all([getPrompts(website.id), getEngines()]);
  const active = prompts.filter((p) => p.isActive).length;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Prompts" description={`${active} tracked prompts, each checked on ${engines.length} AI engines every research run. Click a row for the full answer breakdown.`} />
      <PromptTable websiteId={website.id} prompts={prompts} engines={engines.map((e) => ({ key: e.key, name: e.name }))} />
    </>
  );
}
