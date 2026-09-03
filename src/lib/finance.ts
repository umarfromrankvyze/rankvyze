import { db } from "@/lib/db";
import { GUARANTEE_DAYS, PRICE_CENTS } from "@/lib/guarantee";
import { recentDays, utcDay } from "@/lib/request-meta";

/**
 * The numbers behind /admin/finance.
 *
 * Every figure is derived from Order and RefundRequest rows — the same records
 * the checkout and refund flows write. Nothing is estimated, projected or
 * annualised: this is a one-time-payment product, so an MRR figure would be an
 * invented metric, and a "projected revenue" line would be a guess dressed up
 * as data.
 *
 * Money is handled in minor units (cents) end to end. It is converted to a
 * display string exactly once, at the edge, by formatMoney.
 */

/** Statuses that represent money actually received. */
const EARNED = ["PAID", "REFUNDED"] as const;

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
}

export interface RevenuePoint {
  day: string;
  gross: number;
  refunded: number;
  net: number;
  orders: number;
}

/**
 * Headline finance figures for a window, against the equally-long window before
 * it so the UI can show a real change.
 *
 * Refunds are attributed to the day the refund happened, not the day of the
 * original order — that's when the money left, and matching a refund back to a
 * prior period would make a closed period's net revenue change retroactively.
 */
export async function financeTotals(days: number) {
  const window = recentDays(days);
  const from = new Date(`${window[0]}T00:00:00.000Z`);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);

  const [paid, prevPaid, refunds, prevRefunds] = await Promise.all([
    db.order.findMany({ where: { status: { in: [...EARNED] }, paidAt: { gte: from } }, select: { amount: true } }),
    db.order.findMany({ where: { status: { in: [...EARNED] }, paidAt: { gte: prevFrom, lt: from } }, select: { amount: true } }),
    db.order.findMany({ where: { status: "REFUNDED", refundedAt: { gte: from } }, select: { amount: true, refundAmount: true } }),
    db.order.findMany({
      where: { status: "REFUNDED", refundedAt: { gte: prevFrom, lt: from } },
      select: { amount: true, refundAmount: true },
    }),
  ]);

  const sum = (rows: { amount: number }[]) => rows.reduce((total, r) => total + r.amount, 0);
  // refundAmount is nullable — a full refund may record only the flag, so the
  // order amount is the fallback rather than treating it as a zero refund.
  const sumRefunds = (rows: { amount: number; refundAmount: number | null }[]) =>
    rows.reduce((total, r) => total + (r.refundAmount ?? r.amount), 0);

  const gross = sum(paid);
  const prevGross = sum(prevPaid);
  const refunded = sumRefunds(refunds);
  const prevRefunded = sumRefunds(prevRefunds);

  return {
    gross: { current: gross, previous: prevGross },
    refunded: { current: refunded, previous: prevRefunded },
    net: { current: gross - refunded, previous: prevGross - prevRefunded },
    orders: { current: paid.length, previous: prevPaid.length },
    averageOrder: paid.length ? Math.round(gross / paid.length) : 0,
    refundRate: paid.length ? refunds.length / paid.length : 0,
  };
}

/** Day-by-day revenue for the window. */
export async function revenueSeries(days: number): Promise<RevenuePoint[]> {
  const window = recentDays(days);
  const from = new Date(`${window[0]}T00:00:00.000Z`);

  const [paid, refunded] = await Promise.all([
    db.order.findMany({ where: { status: { in: [...EARNED] }, paidAt: { gte: from } }, select: { amount: true, paidAt: true } }),
    db.order.findMany({
      where: { status: "REFUNDED", refundedAt: { gte: from } },
      select: { amount: true, refundAmount: true, refundedAt: true },
    }),
  ]);

  const grossByDay = new Map<string, number>();
  const countByDay = new Map<string, number>();
  for (const o of paid) {
    if (!o.paidAt) continue;
    const day = utcDay(o.paidAt);
    grossByDay.set(day, (grossByDay.get(day) ?? 0) + o.amount);
    countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
  }

  const refundByDay = new Map<string, number>();
  for (const o of refunded) {
    if (!o.refundedAt) continue;
    const day = utcDay(o.refundedAt);
    refundByDay.set(day, (refundByDay.get(day) ?? 0) + (o.refundAmount ?? o.amount));
  }

  return window.map((day) => {
    const gross = grossByDay.get(day) ?? 0;
    const refund = refundByDay.get(day) ?? 0;
    return { day, gross, refunded: refund, net: gross - refund, orders: countByDay.get(day) ?? 0 };
  });
}

/**
 * Money still at risk under the guarantee.
 *
 * An engagement inside its window that hasn't yet been judged MET is money we
 * may have to give back. This is a real liability, not a forecast — every
 * pending engagement either meets the guarantee or is refundable in full.
 */
export async function guaranteeLiability() {
  const now = new Date();

  const [active, eligible, requested, refundedCount, metCount] = await Promise.all([
    db.engagement.count({ where: { status: "ACTIVE", endsAt: { gte: now } } }),
    db.engagement.count({ where: { status: "ELIGIBLE" } }),
    db.engagement.count({ where: { status: "REFUND_REQUESTED" } }),
    db.engagement.count({ where: { status: "REFUNDED" } }),
    db.engagement.count({ where: { status: "MET" } }),
  ]);

  // Engagements ending inside the next week, so a claim spike isn't a surprise.
  const endingSoon = await db.engagement.count({
    where: { status: "ACTIVE", endsAt: { gte: now, lte: new Date(now.getTime() + 7 * 86_400_000) } },
  });

  const atRisk = active + eligible + requested;
  const settled = metCount + refundedCount;

  return {
    active,
    eligible,
    requested,
    endingSoon,
    met: metCount,
    refunded: refundedCount,
    atRiskCount: atRisk,
    atRiskCents: atRisk * PRICE_CENTS,
    /** Share of settled engagements that ended in a refund. Null until any settle. */
    historicRefundRate: settled ? refundedCount / settled : null,
    windowDays: GUARANTEE_DAYS,
  };
}

export interface OrderFilters {
  status?: string;
  query?: string;
  take?: number;
}

/** Orders for the finance table, newest first. */
export async function listOrders({ status, query, take = 100 }: OrderFilters = {}) {
  return db.order.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" as const } },
              { id: { contains: query } },
              { providerPaymentId: { contains: query } },
              { organization: { name: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      engagement: { select: { id: true, status: true, endsAt: true, metEngineCount: true } },
    },
  });
}

/** Pending refund claims, oldest first — the queue is worked front to back. */
export async function pendingRefunds() {
  return db.refundRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      engagement: {
        include: {
          order: { select: { id: true, amount: true, currency: true, email: true, paidAt: true } },
          organization: { select: { id: true, name: true } },
          website: { select: { domain: true } },
        },
      },
    },
  });
}

/** Every order as CSV. Amounts stay in cents — spreadsheets round currency. */
export function ordersToCsv(
  orders: {
    id: string;
    createdAt: Date;
    paidAt: Date | null;
    refundedAt: Date | null;
    status: string;
    amount: number;
    refundAmount: number | null;
    currency: string;
    provider: string;
    email: string | null;
    organization: { name: string };
  }[],
) {
  const header = [
    "order_id",
    "created_at",
    "paid_at",
    "refunded_at",
    "status",
    "amount_cents",
    "refund_cents",
    "currency",
    "provider",
    "email",
    "organization",
  ];
  const escape = (value: string | number | null) => {
    const s = value === null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = orders.map((o) =>
    [
      o.id,
      o.createdAt.toISOString(),
      o.paidAt?.toISOString() ?? "",
      o.refundedAt?.toISOString() ?? "",
      o.status,
      o.amount,
      o.refundAmount ?? "",
      o.currency,
      o.provider,
      o.email ?? "",
      o.organization.name,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
