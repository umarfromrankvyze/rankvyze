import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { getAdminStats } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/score-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EngineIcon } from "@/components/ui/engine-icon";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  const s = await getAdminStats();
  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Admin dashboard"
        description="Operations overview: research queue, audits and implementation jobs across all customers."
        actions={
          <Button asChild>
            <Link href="/admin/research">
              <FlaskConical /> Open research queue
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Customers" value={s.customers} sub={`${s.websites} websites`} />
        <StatTile label="Research results" value={s.results} sub="prompt × engine checks entered" accent />
        <StatTile label="Open sessions" value={s.activeSessions.length} sub="research in progress" />
        <StatTile label="Open issues" value={s.openIssues} sub="across all websites" />
        <StatTile label="Jobs needing action" value={s.pendingChanges} sub="ready for Claude or review" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active research sessions</CardTitle>
              <CardDescription>Sessions that still have prompts to check.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {s.activeSessions.length === 0 ? (
              <p className="border-t border-line px-5 py-6 text-[13px] text-ink-muted">No sessions in progress.</p>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {s.activeSessions.map((x) => (
                  <li key={x.id}>
                    <Link href={`/admin/research/${x.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium text-ink">{x.title}</span>
                        <span className="block text-[12px] text-ink-faint">
                          {x.website.name} · {x.website.domain} · started {formatRelative(x.startedAt)}
                        </span>
                      </span>
                      <Badge variant="info">{x._count.results} results</Badge>
                      <ArrowRight className="size-3.5 text-ink-faint" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent audits</CardTitle>
              <CardDescription>Latest published AEO audits.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-line border-t border-line">
              {s.recentAudits.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="font-display text-[20px] font-bold tabular-nums text-ink">{a.overallScore}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-ink">{a.website.name}</span>
                    <span className="block truncate text-[12px] text-ink-faint">{a.summary ?? "—"}</span>
                  </span>
                  <span className="text-[12px] text-ink-faint">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Latest research entries</CardTitle>
            <CardDescription>Most recent results entered by the team.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <ul className="divide-y divide-line border-t border-line">
            {s.recentResults.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <EngineIcon engine={r.engine.key} size={14} />
                <span className="w-32 shrink-0 truncate font-medium text-ink">{r.website.name}</span>
                <span className="min-w-0 flex-1 truncate text-ink-muted">{r.prompt.text}</span>
                {r.mentioned ? <Badge variant="success">#{r.position ?? "?"}</Badge> : <Badge variant="danger">Not mentioned</Badge>}
                <span className="hidden text-[12px] text-ink-faint sm:inline">
                  {r.enteredBy?.name ?? "—"} · {formatRelative(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
