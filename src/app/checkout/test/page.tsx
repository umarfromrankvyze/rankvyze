import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentsAreLive } from "@/lib/payments";
import { PRICE_LABEL } from "@/lib/guarantee";
import { Card } from "@/components/ui/card";
import { TestPaymentButton } from "@/components/checkout/test-payment-button";

export const metadata: Metadata = { title: "Test checkout" };

/**
 * Stand-in for the provider's hosted checkout while no provider is configured.
 * It says plainly that nothing is charged.
 */
export default async function TestCheckoutPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await requireUser("/checkout");
  if (paymentsAreLive()) redirect("/checkout");

  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await db.order.findFirst({
    where: { id: orderId, organization: { members: { some: { userId: user.id } } } },
  });
  if (!order) notFound();
  if (order.status === "PAID") redirect(`/checkout/success?order=${order.id}`);

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-7">
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-warning-soft p-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p className="text-[12.5px] leading-relaxed text-amber-800">
            <span className="font-semibold">Test mode — no charge.</span> This page stands in for the payment provider&apos;s
            hosted checkout. It does not collect card details and no money moves.
          </p>
        </div>

        <h1 className="mt-6 font-display text-[22px] font-bold tracking-tight text-ink">Confirm your order</h1>
        <dl className="mt-5 space-y-2.5 border-y border-line py-5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">AI visibility sprint</dt>
            <dd className="font-medium text-ink">{PRICE_LABEL}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Billed to</dt>
            <dd className="text-ink">{order.email ?? user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Order</dt>
            <dd className="font-mono text-[12px] text-ink-faint">{order.id}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <TestPaymentButton orderId={order.id} />
        </div>
        <p className="mt-3 text-center text-[12px] text-ink-faint">
          This runs the same activation path the live webhook will run.
        </p>
      </Card>
    </div>
  );
}
