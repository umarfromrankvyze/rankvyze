import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { analyticsTotals, liveVisitors, recentSignups, signupBreakdowns, trafficBreakdowns, trafficSeries } from "@/lib/analytics";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LiveVisitors } from "@/components/admin/live-visitors";
import { TrafficChart } from "@/components/admin/analytics-charts";
import { Breakdown, DataNote, RangeTabs, Stat, parseRange } from "@/components/admin/console-ui";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const days = parseRange((await searchParams).days);

  const [live, totals, series, traffic, signups, latest] = await Promise.all([
    liveVisitors(),
    analyticsTotals(days),
    trafficSeries(days),
    trafficBreakdowns(days),
    signupBreakdowns(days),
    recentSignups(25),
  ]);

  // Only signups we actually tracked go in the numerator. Dividing every
  // account ever created by the visitors seen since tracking started produces
  // nonsense like 500% — the two figures have to cover the same population.
  const conversion = traffic.total > 0 ? (signups.attributed / traffic.total) * 100 : null;

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Traffic and signups"
        description="Counted from our own requests — no third-party analytics, no sampling."
        actions={<RangeTabs basePath="/admin/analytics" active={days} />}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <LiveVisitors initial={live} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label={`Visitors · ${days}d`}
            value={totals.visitors.current.toLocaleString()}
            current={totals.visitors.current}
            previous={totals.visitors.previous}
            hint={`vs previous ${days}d`}
          />
          <Stat
            label={`Signups · ${days}d`}
            value={totals.signups.current.toLocaleString()}
            current={totals.signups.current}
            previous={totals.signups.previous}
            hint={`vs previous ${days}d`}
          />
          <Stat
            label="Visitor → signup"
            value={conversion === null ? "—" : `${conversion.toFixed(1)}%`}
            hint={
              conversion === null
                ? "No visitors recorded yet"
                : `${signups.attributed} tracked signup${signups.attributed === 1 ? "" : "s"} of ${traffic.total} visitor${traffic.total === 1 ? "" : "s"}`
            }
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[13.5px] font-semibold text-ink">Visitors and signups</p>
          <p className="text-[12px] text-ink-faint">
            {traffic.views.toLocaleString()} page views · unique visitors per UTC day
          </p>
        </div>
        <TrafficChart data={series} />
      </div>

      <h2 className="mt-8 font-display text-[17px] font-bold tracking-tight text-ink">Where signups come from</h2>
      <p className="mt-1 text-[13px] text-ink-muted">
        First-touch attribution: the source that brought someone to the site the first time, not the last page they saw
        before signing up.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Breakdown
          title="Signup source"
          rows={signups.sources}
          total={signups.total}
          note={`${signups.total} signups`}
          empty="No signups in this window."
        />
        <Breakdown
          title="Signup country"
          rows={signups.countries}
          total={signups.total}
          note="Resolved at the edge"
          empty="No signups in this window."
        />
        <Breakdown title="Signup device" rows={signups.devices} total={signups.total} empty="No signups in this window." />
      </div>

      {signups.total > signups.attributed && (
        <div className="mt-3">
          <DataNote>
            {signups.total - signups.attributed} of {signups.total} signups show as <strong>Not captured</strong>. Those
            accounts were created before first-touch attribution shipped, or the visitor blocked local storage. They are
            kept in their own bucket rather than counted as direct — an unattributed signup and a direct one are
            different facts.
          </DataNote>
        </div>
      )}

      <h2 className="mt-8 font-display text-[17px] font-bold tracking-tight text-ink">Where traffic comes from</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Breakdown title="Traffic source" rows={traffic.sources} total={traffic.total} empty="No visits in this window." />
        <Breakdown title="Country" rows={traffic.countries} total={traffic.total} empty="No visits in this window." />
        <Breakdown title="Landing page" rows={traffic.landingPages} total={traffic.total} empty="No visits in this window." />
        <div className="grid gap-4">
          <Breakdown title="Device" rows={traffic.devices} total={traffic.total} empty="No visits in this window." />
          <Breakdown title="Browser" rows={traffic.browsers} total={traffic.total} empty="No visits in this window." />
        </div>
      </div>

      <h2 className="mt-8 font-display text-[17px] font-bold tracking-tight text-ink">Latest signups</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead className="text-right">Signed up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latest.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-[13px] text-ink-faint">
                  No accounts yet.
                </TableCell>
              </TableRow>
            )}
            {latest.map((u) => {
              const org = u.memberships[0]?.organization;
              const paid = (org?.orders.length ?? 0) > 0;
              const location = [u.signupMeta?.city, u.signupMeta?.country].filter(Boolean).join(", ");
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{u.name}</p>
                      <p className="truncate text-[12px] text-ink-faint">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.signupMeta ? (
                      <span className="text-ink-muted">
                        {u.signupMeta.source ?? "direct"}
                        {u.signupMeta.campaign && <span className="ml-1 text-ink-faint">· {u.signupMeta.campaign}</span>}
                      </span>
                    ) : (
                      <span className="text-ink-faint">Not captured</span>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-muted">{location || <span className="text-ink-faint">Unknown</span>}</TableCell>
                  <TableCell className="text-ink-muted">
                    {u.signupMeta?.device ?? <span className="text-ink-faint">Unknown</span>}
                  </TableCell>
                  <TableCell>
                    {u.role === "ADMIN" ? (
                      <Badge variant="dark">Staff</Badge>
                    ) : paid ? (
                      <Badge variant="success">Paid</Badge>
                    ) : (
                      <Badge variant="neutral">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[12.5px] text-ink-muted">
                    {org ? (
                      <Link href={`/admin/customers/${org.id}`} className="hover:text-ink">
                        {formatDate(u.createdAt)}
                      </Link>
                    ) : (
                      formatDate(u.createdAt)
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <DataNote>
          <strong>How these numbers are produced.</strong> A small beacon on the marketing and signup pages reports an
          anonymous browser id (random, stored in local storage) every 30 seconds while the tab is visible. One row is
          written per browser per UTC day, so a long session counts once. Country, region and city come from headers
          Vercel resolves at the edge — no IP address reaches the application, and outside Vercel those fields are empty
          and shown as &ldquo;Unknown&rdquo; rather than guessed. Dashboard and admin pages are not counted as visits.
        </DataNote>
      </div>
    </>
  );
}
