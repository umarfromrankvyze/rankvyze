import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { getAdminOrders, getCommerceStats, getGuaranteeWatchlist, getRefundQueue } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatTile } from "@/components/dashboard/score-card";
import { RefundDecision } from "@/components/admin/refund-actions";
import { paymentsAreLive } from "@/lib/payments";
import { GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";
import { cn, formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

function daysLeft(endsAt: Date | null) {
  if (!endsAt) return null;
  return Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000);
}

export default async function AdminOrdersPage() {
  const [orders, refunds, watchlist, stats] = await Promise.all([
    getAdminOrders(),
    getRefundQueue(),
    getGuaranteeWatchlist(),
    getCommerceStats(),
  ]);
  const live = paymentsAreLive();

  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Orders & guarantee"
        description="Payments, refund requests, and the engagements whose 45-day window is closing."
      />

      {!live && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-warning-soft p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p className="text-[13px] leading-relaxed text-amber-800">
            <span className="font-semibold">No live payment provider.</span> Orders here were created in test mode and no
            money moved. Add the Dodo credentials and complete <code className="font-mono">src/lib/payments/dodo.ts</code> to
            go live.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Revenue" value={money(stats.revenueCents)} sub={`${stats.paid} paid orders`} accent />
        <StatTile label="Refunded" value={stats.refunded} sub="orders returned in full" />
        <StatTile label="Active sprints" value={stats.active} sub="inside the 45-day window" />
        <StatTile label="Guarantee met" value={stats.met} sub={`${GUARANTEE_MIN_ENGINES}+ engines`} />
        <StatTile label="Free scans" value={stats.scans} sub="top of funnel" />
      </div>

      {/* Refund queue */}
      <Card className="mt-8">
        <CardHeader>
          <div>
            <CardTitle>Refund requests</CardTitle>
            <CardDescription>Review against the published guarantee terms, then decide.</CardDescription>
          </div>
          {refunds.length > 0 && <Badge variant="warning">{refunds.length} pending</Badge>}
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {refunds.length === 0 ? (
            <p className="border-t border-line px-5 py-8 text-center text-[13.5px] text-ink-muted">Nothing waiting.</p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {refunds.map((r) => (
                <li key={r.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">
                      {r.engagement.organization.name}
                      <span className="ml-2 font-normal text-ink-faint">{r.engagement.website?.domain ?? "—"}</span>
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">
                      Reached {r.engagement.metEngineCount} of {GUARANTEE_MIN_ENGINES} engines · requested{" "}
                      {formatRelative(r.requestedAt)} · {money(r.engagement.order.amount, r.engagement.order.currency)}
                    </p>
                    {r.reason && <p className="mt-2 rounded-lg bg-surface-2 p-2.5 text-[13px] text-ink">“{r.reason}”</p>}
                  </div>
                  <div className="shrink-0">
                    <RefundDecision requestId={r.id} amountLabel={money(r.engagement.order.amount, r.engagement.order.currency)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-500" /> Guarantee watchlist
            </CardTitle>
            <CardDescription>
              Windows closing within 10 days that haven&apos;t cleared {GUARANTEE_MIN_ENGINES} engines. Get research done
              before these expire.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {watchlist.length === 0 ? (
            <p className="border-t border-line px-5 py-8 text-center text-[13.5px] text-ink-muted">
              Nothing at risk in the next 10 days.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {watchlist.map((e) => {
                const left = daysLeft(e.endsAt) ?? 0;
                return (
                  <li key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border text-center",
                        left <= 3 ? "border-red-200 bg-danger-soft text-red-700" : "border-amber-200 bg-warning-soft text-amber-700",
                      )}
                    >
                      <span className="font-display text-[15px] font-bold leading-none">{left}</span>
                      <span className="text-[9px] uppercase tracking-wider">days</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={`/admin/customers/${e.organization.id}`} className="block text-[14px] font-semibold text-ink hover:underline">
                        {e.organization.name}
                      </Link>
                      <span className="block text-[12.5px] text-ink-muted">
                        {e.website?.domain ?? "no website"} · window ends {formatDate(e.endsAt)} ·{" "}
                        {money(e.order.amount, e.order.currency)} at risk
                      </span>
                    </span>
                    <Badge variant={e.baselineSessionId ? "neutral" : "danger"}>
                      {e.baselineSessionId ? "baseline done" : "no baseline"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* All orders */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-[15px] font-semibold text-ink">All orders</h2>
        {orders.length === 0 ? (
          <EmptyState icon={CreditCard} title="No orders yet" description="Payments appear here as customers buy." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guarantee</TableHead>
                  <TableHead>Window ends</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/admin/customers/${o.organization.id}`} className="block font-semibold text-ink hover:underline">
                        {o.organization.name}
                      </Link>
                      <span className="text-[12px] text-ink-faint">{o.engagement?.website?.domain ?? o.email ?? "—"}</span>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">{money(o.amount, o.currency)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell>{o.engagement ? <StatusBadge status={o.engagement.status} /> : <span className="text-ink-faint">—</span>}</TableCell>
                    <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(o.engagement?.endsAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(o.paidAt)}</TableCell>
                    <TableCell className="font-mono text-[11.5px] text-ink-faint">
                      {o.providerPaymentId ?? o.providerCheckoutId ?? o.id.slice(-10)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}
