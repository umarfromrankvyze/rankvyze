import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { financeTotals, formatMoney, guaranteeLiability, listOrders, pendingRefunds, revenueSeries } from "@/lib/finance";
import { paymentsAreLive } from "@/lib/payments";
import { PRICE_LABEL } from "@/lib/guarantee";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueChart } from "@/components/admin/analytics-charts";
import { DataNote, RangeTabs, Stat, parseRange } from "@/components/admin/console-ui";
import { RefundDecision } from "@/components/admin/refund-actions";

export const metadata: Metadata = { title: "Finance" };
export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["ALL", "PAID", "PENDING", "REFUNDED", "FAILED", "CANCELED"] as const;

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  REFUNDED: "danger",
  FAILED: "danger",
  CANCELED: "neutral",
};

function formatDate(date: Date | null) {
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const days = parseRange(sp.days);
  const status = ORDER_STATUSES.includes(sp.status as (typeof ORDER_STATUSES)[number]) ? sp.status! : "ALL";
  const query = sp.q?.trim() || undefined;

  const [totals, series, liability, orders, refunds] = await Promise.all([
    financeTotals(days),
    revenueSeries(days),
    guaranteeLiability(),
    listOrders({ status, query }),
    pendingRefunds(),
  ]);

  const live = paymentsAreLive();

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Revenue, refunds and liability"
        description="Counted from Order and RefundRequest rows — the same records checkout writes."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/admin/finance/orders.csv?status=${status}${query ? `&q=${encodeURIComponent(query)}` : ""}`}>
                <Download /> Export CSV
              </a>
            </Button>
            <RangeTabs basePath="/admin/finance" active={days} extra={{ status, ...(query ? { q: query } : {}) }} />
          </div>
        }
      />

      {!live && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-warning-soft px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <div className="text-[13px] leading-relaxed text-amber-900">
            <strong>Test mode.</strong> Dodo Payments is not configured, so checkout is running on the built-in test
            provider and no real money has moved. Every figure on this page is real data from real rows — it is simply
            data about test transactions. Set the Dodo credentials to switch over; nothing on this page changes shape
            when you do.
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={`Gross · ${days}d`}
          value={formatMoney(totals.gross.current)}
          current={totals.gross.current}
          previous={totals.gross.previous}
          hint={`${totals.orders.current} order${totals.orders.current === 1 ? "" : "s"}`}
        />
        <Stat
          label={`Refunded · ${days}d`}
          value={formatMoney(totals.refunded.current)}
          current={totals.refunded.current}
          previous={totals.refunded.previous}
          invertDelta
          hint={`${(totals.refundRate * 100).toFixed(1)}% of orders`}
        />
        <Stat
          label={`Net · ${days}d`}
          value={formatMoney(totals.net.current)}
          current={totals.net.current}
          previous={totals.net.previous}
          hint="Gross less refunds"
        />
        <Stat
          label="Average order"
          value={totals.orders.current ? formatMoney(totals.averageOrder) : "—"}
          hint={`List price ${PRICE_LABEL}`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[13.5px] font-semibold text-ink">Net revenue per day</p>
            <p className="text-[12px] text-ink-faint">Refunds are booked on the day they were issued</p>
          </div>
          <RevenueChart data={series} />
        </div>

        {/* Guarantee exposure — a real liability, not a forecast. */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <p className="text-[13.5px] font-semibold text-ink">Guarantee exposure</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            Engagements that could still be refunded in full under the {liability.windowDays}-day guarantee.
          </p>
          <p className="mt-4 font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">
            {formatMoney(liability.atRiskCents)}
          </p>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            across {liability.atRiskCount} engagement{liability.atRiskCount === 1 ? "" : "s"}
          </p>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[13px]">
            <Row label="In window" value={liability.active} />
            <Row label="Ending within 7 days" value={liability.endingSoon} accent={liability.endingSoon > 0} />
            <Row label="Eligible to claim" value={liability.eligible} accent={liability.eligible > 0} />
            <Row label="Claim submitted" value={liability.requested} accent={liability.requested > 0} />
            <Row label="Guarantee met" value={liability.met} />
            <Row label="Refunded" value={liability.refunded} />
          </dl>

          <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
            {liability.historicRefundRate === null
              ? "No engagement has settled yet, so there is no refund rate to report."
              : `${Math.round(liability.historicRefundRate * 100)}% of settled engagements ended in a refund.`}
          </p>
        </div>
      </div>

      {/* Refund queue */}
      <h2 className="mt-8 flex items-center gap-2.5 font-display text-[17px] font-bold tracking-tight text-ink">
        Refund claims
        {refunds.length > 0 && <Badge variant="warning">{refunds.length} pending</Badge>}
      </h2>

      {refunds.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-white px-5 py-6 text-[13px] text-ink-muted shadow-card">
          No claims waiting. Claims appear here when a customer submits one inside the claim window.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {refunds.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    <Link href={`/admin/customers/${r.engagement.organizationId}`} className="hover:text-brand-600">
                      {r.engagement.organization.name}
                    </Link>
                    <span className="ml-2 text-[13px] font-normal text-ink-faint">
                      {r.engagement.website?.domain ?? "no website"}
                    </span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-ink-muted">
                    Claimed {formatDate(r.requestedAt)} · paid {formatDate(r.engagement.order.paidAt)} ·{" "}
                    {r.engagement.metEngineCount} engine{r.engagement.metEngineCount === 1 ? "" : "s"} mentioned
                  </p>
                  {r.reason && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-muted">“{r.reason}”</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-[20px] font-bold tabular-nums text-ink">
                    {formatMoney(r.engagement.order.amount, r.engagement.order.currency)}
                  </p>
                  <div className="mt-2">
                    <RefundDecision
                      requestId={r.id}
                      amountLabel={formatMoney(r.engagement.order.amount, r.engagement.order.currency)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">Orders</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {ORDER_STATUSES.map((s) => {
            const params = new URLSearchParams({ days: String(days), status: s, ...(query ? { q: query } : {}) });
            return (
              <Link
                key={s}
                href={`/admin/finance?${params.toString()}`}
                aria-current={s === status ? "page" : undefined}
                className={
                  s === status
                    ? "rounded-lg bg-ink px-2.5 py-1 text-[12.5px] font-medium text-white"
                    : "rounded-lg border border-line bg-white px-2.5 py-1 text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
                }
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-[13px] text-ink-faint">
                  {query ? `No orders matching “${query}”.` : "No orders yet."}
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="min-w-0">
                    <Link href={`/admin/customers/${o.organizationId}`} className="truncate font-medium text-ink hover:text-brand-600">
                      {o.organization.name}
                    </Link>
                    <p className="truncate text-[12px] text-ink-faint">{o.email ?? "no email on order"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status.toLowerCase()}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className={o.status === "REFUNDED" ? "text-ink-faint line-through" : "text-ink"}>
                    {formatMoney(o.amount, o.currency)}
                  </span>
                </TableCell>
                <TableCell className="text-[12.5px] text-ink-muted">{o.provider}</TableCell>
                <TableCell className="text-[12.5px] text-ink-muted">
                  {o.engagement ? o.engagement.status.replace(/_/g, " ").toLowerCase() : "—"}
                </TableCell>
                <TableCell className="text-right text-[12.5px] text-ink-muted">
                  {formatDate(o.paidAt ?? o.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <DataNote>
          <strong>What is and isn&rsquo;t here.</strong> Amounts are stored in cents and converted once, for display.
          There is no MRR or ARR figure because this is a one-time purchase — an annualised number would be invented,
          not measured. Refunds are attributed to the day they were issued, so a closed period&rsquo;s net revenue never
          changes retroactively. Guarantee exposure counts engagements that could still be refunded in full; it is a
          liability, not a projection.
        </DataNote>
      </div>
    </>
  );
}

function Row({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={accent ? "font-semibold tabular-nums text-brand-600" : "font-semibold tabular-nums text-ink"}>{value}</dd>
    </div>
  );
}
