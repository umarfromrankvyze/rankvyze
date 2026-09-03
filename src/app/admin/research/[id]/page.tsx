import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getResearchSession } from "@/server/admin-queries";
import { getEngines } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ResearchWorkspace } from "@/components/admin/research-workspace";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Research session" };

export default async function AdminResearchSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, engines] = await Promise.all([getResearchSession(id), getEngines()]);
  if (!session) notFound();

  return (
    <>
      <Link href="/admin/research" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All sessions
      </Link>
      <PageHeader
        eyebrow={`${session.website.name} · ${session.website.domain}`}
        title={session.title}
        description={`Started ${formatDate(session.startedAt)} by ${session.owner?.name ?? "unassigned"}. ${session.website.prompts.length} active prompts × ${engines.length} engines.`}
      />
      <ResearchWorkspace
        session={{ id: session.id, title: session.title, status: session.status, notes: session.notes, startedAt: session.startedAt, websiteId: session.websiteId, ownerName: session.owner?.name ?? null }}
        website={{ id: session.website.id, name: session.website.name, domain: session.website.domain, url: session.website.url }}
        prompts={session.website.prompts.map((p) => ({ id: p.id, text: p.text, category: p.category, priority: p.priority }))}
        competitors={session.website.competitors.map((c) => ({ id: c.id, name: c.name, domain: c.domain }))}
        engines={engines.map((e) => ({ id: e.id, key: e.key, name: e.name }))}
        results={session.results.map((r) => ({
          id: r.id,
          promptId: r.promptId,
          engineId: r.engineId,
          mentioned: r.mentioned,
          position: r.position,
          cited: r.cited,
          citationUrl: r.citationUrl,
          sentiment: r.sentiment,
          answerSummary: r.answerSummary,
          notes: r.notes,
          screenshotUrl: r.screenshotUrl,
          checkedAt: r.checkedAt,
          engine: r.engine,
          prompt: r.prompt,
          rivals: r.rivals.map((x) => ({ name: x.name, position: x.position })),
        }))}
      />
    </>
  );
}
