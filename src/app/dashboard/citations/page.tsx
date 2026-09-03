import type { Metadata } from "next";
import { dashboardContext } from "@/server/context";
import { getCitations, getEngines } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/score-card";
import { CitationTable } from "@/components/dashboard/citation-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";

export const metadata: Metadata = { title: "Citations" };

export default async function CitationsPage() {
  const { website } = await dashboardContext();
  const [citations, engines] = await Promise.all([getCitations(website.id), getEngines()]);
  const own = citations.filter((c) => c.isOwnDomain);
  const rival = citations.filter((c) => !c.isOwnDomain);

  const topPages = Object.entries(
    own.reduce<Record<string, number>>((acc, c) => {
      const k = c.pagePath ?? c.url;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const rivalPages = Object.entries(
    rival.reduce<Record<string, { count: number; name: string }>>((acc, c) => {
      const k = c.url.replace(/^https?:\/\//, "");
      acc[k] = { count: (acc[k]?.count ?? 0) + 1, name: c.competitor?.name ?? "Competitor" };
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const share = citations.length ? Math.round((own.length / citations.length) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow={website.domain} title="Citations" description="The pages AI engines link to when they answer your tracked prompts — yours and your competitors'." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Your citations" value={own.length} sub="answers that linked to your site" accent />
        <StatTile label="Competitor citations" value={rival.length} sub="in the same answers" />
        <StatTile label="Citation share" value={`${share}%`} sub="of all citations across tracked prompts" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Your most-cited pages</CardTitle>
              <CardDescription>These are the pages AI engines trust. Protect and expand them.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {topPages.length ? (
              <ul className="space-y-3">
                {topPages.map(([path, count]) => (
                  <li key={path}>
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <code className="truncate font-mono text-[12px] text-ink">{path}</code>
                      <span className="shrink-0 tabular-nums text-ink-muted">{count}</span>
                    </div>
                    <ProgressBar value={(count / (topPages[0][1] || 1)) * 100} tone="brand" size="xs" className="mt-1.5" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-muted">No pages cited yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Competitor pages winning citations</CardTitle>
              <CardDescription>The content you&apos;re competing against.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {rivalPages.length ? (
              <ul className="space-y-3">
                {rivalPages.map(([url, v]) => (
                  <li key={url}>
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{v.name}</span>
                        <code className="block truncate font-mono text-[11.5px] text-ink-faint">{url}</code>
                      </span>
                      <span className="shrink-0 tabular-nums text-ink-muted">{v.count}</span>
                    </div>
                    <ProgressBar value={(v.count / (rivalPages[0][1].count || 1)) * 100} tone="ink" size="xs" className="mt-1.5" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-muted">No competitor citations recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <CitationTable rows={citations} engines={engines.map((e) => ({ key: e.key, name: e.name }))} />
      </div>
    </>
  );
}
