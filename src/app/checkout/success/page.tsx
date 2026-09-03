import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment received" };

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await requireUser("/checkout");
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await db.order.findFirst({
    where: { id: orderId, organization: { members: { some: { userId: user.id } } } },
    include: { engagement: true, organization: true },
  });
  if (!order) notFound();

  const pending = order.status !== "PAID";
  const nextHref = order.organization.onboardingCompletedAt ? "/dashboard" : "/onboarding";

  return (
    <div className="mx-auto max-w-lg text-center">
      <Card className="p-8 md:p-10">
        {pending ? (
          <>
            <Clock className="mx-auto size-11 text-amber-600" />
            <h1 className="mt-5 font-display text-[24px] font-bold tracking-tight text-ink">Confirming your payment…</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
              Your payment is going through. This page updates as soon as the provider confirms it — usually within a few
              seconds. You can safely refresh.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto size-11 text-success" />
            <h1 className="mt-5 font-display text-[24px] font-bold tracking-tight text-ink">You&apos;re in.</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
              Your {GUARANTEE_DAYS}-day sprint has started
              {order.engagement?.endsAt ? ` and runs until ${formatDate(order.engagement.endsAt)}` : ""}. Next: tell us
              about your business so we can research the right questions.
            </p>

            <div className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-left">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-faint">What happens now</p>
              <ol className="mt-2.5 space-y-2 text-[13.5px] text-ink">
                <li className="flex gap-2.5">
                  <span className="font-mono text-[11px] text-brand-600">01</span> You complete onboarding — website,
                  business, competitors.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-[11px] text-brand-600">02</span> We run baseline research across all four
                  engines and lock your prompt set.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-[11px] text-brand-600">03</span> We audit, fix, and track for{" "}
                  {GUARANTEE_DAYS} days.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-[11px] text-brand-600">04</span> Mentioned on {GUARANTEE_MIN_ENGINES}+
                  engines, or you get every cent back.
                </li>
              </ol>
            </div>

            <Button size="lg" className="mt-7 w-full" asChild>
              <Link href={nextHref}>
                Continue <ArrowRight />
              </Link>
            </Button>
          </>
        )}
        <p className="mt-4 font-mono text-[11.5px] text-ink-faint">Order {order.id}</p>
      </Card>
    </div>
  );
}
