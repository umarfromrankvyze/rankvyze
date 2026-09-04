import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentsAreLive } from "@/lib/payments";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";
import { DELIVERY_MODE_LABELS, findRoute } from "@/content/platforms";
import type { PlatformKey } from "@/lib/enums";
import { Card } from "@/components/ui/card";
import { PayButton } from "@/components/checkout/pay-button";

export const metadata: Metadata = { title: "Checkout" };

const INCLUDED = [
  "Baseline research across ChatGPT, Perplexity, Gemini and Claude",
  "Full AEO audit of your site across six categories",
  "Prioritized issues with the exact fix for each",
  "Implementation delivered as reviewable changes",
  "Competitor and citation tracking for 45 days",
  "A final report you can share",
];

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  const user = await requireUser("/checkout");
  const { scan: scanId } = await searchParams;

  const membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          orders: { where: { status: { in: ["PAID", "REFUNDED"] } }, take: 1 },
          websites: {
            orderBy: [{ isPrimary: "desc" }],
            take: 1,
            include: { competitors: true, integrations: { where: { status: "PENDING" }, take: 1 } },
          },
        },
      },
    },
  });
  if (!membership) redirect("/signup");
  if (membership.organization.orders.length > 0) redirect("/dashboard");
  // Nobody reaches payment before setup: the price buys a 45-day sprint, and
  // a sprint needs a site, a business description and a prompt set to run on.
  if (!membership.organization.onboardingCompletedAt) redirect("/onboarding");

  const website = membership.organization.websites[0] ?? null;
  // Show what they chose in setup, so the price is attached to a concrete plan
  // for their specific site rather than to a generic feature list.
  const chosen = website?.integrations[0] ?? null;
  const route = chosen
    ? findRoute((website?.platform as PlatformKey | null) ?? "OTHER", chosen.provider, chosen.mode)
    : undefined;

  // The scan id used to arrive as a query param straight from the results
  // page. Onboarding now sits in between, so fall back to the most recent scan
  // of this domain — otherwise the score vanishes from the summary and the
  // scan-to-order attribution breaks.
  const scan = scanId
    ? await db.scanRequest.findUnique({ where: { id: scanId } })
    : website
      ? await db.scanRequest.findFirst({ where: { domain: website.domain }, orderBy: { createdAt: "desc" } })
      : null;
  const live = paymentsAreLive();

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
      <div>
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 font-display text-[2rem] font-bold leading-tight tracking-tight text-ink md:text-[2.5rem]">
          Start your 45-day sprint.
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
          One payment. We research how AI engines answer your buyers&apos; questions, fix what&apos;s holding you back, and
          prove the result.
        </p>

        <Card className="mt-7 border-brand-200 bg-brand-50/40 p-5">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">
            <ShieldCheck className="size-4" /> The guarantee
          </p>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink">
            If {website?.domain ?? scan?.domain ?? "your business"} isn&apos;t mentioned by at least{" "}
            <span className="font-semibold">{GUARANTEE_MIN_ENGINES} of the four AI engines</span> within{" "}
            {GUARANTEE_DAYS} days, <span className="font-semibold">we refund you 100%</span>.
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Judged on the prompts locked when your research starts, with the answer evidence shown in your dashboard.{" "}
            <Link href="/guarantee" className="font-medium text-ink underline underline-offset-2">
              Full terms
            </Link>
            .
          </p>
        </Card>

        <ul className="mt-7 space-y-2.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Card className="sticky top-8 p-6">
          <h2 className="font-display text-[16px] font-semibold text-ink">Order summary</h2>

          <div className="mt-5 space-y-3 border-b border-line pb-5 text-[14px]">
            <div className="flex items-start justify-between gap-4">
              <span className="text-ink">
                AI visibility sprint
                <span className="block text-[12.5px] text-ink-faint">45 days · {GUARANTEE_DAYS}-day guarantee</span>
              </span>
              <span className="font-medium text-ink">{PRICE_LABEL}</span>
            </div>
            {website && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-ink-muted">
                    Website
                    <span className="block font-mono text-[12.5px] text-ink">{website.domain}</span>
                  </span>
                  {scan && <span className="text-[12.5px] text-ink-faint">scan {scan.score}/100</span>}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-ink-muted">Competitors tracked</span>
                  <span className="text-[12.5px] text-ink">{website.competitors.length}</span>
                </div>
                {route && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-ink-muted">
                      Fix delivery
                      <span className="block text-[12.5px] text-ink">{route.title}</span>
                    </span>
                    <span className="text-[12.5px] text-ink-faint">{DELIVERY_MODE_LABELS[route.mode]}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between py-5">
            <span className="text-[15px] font-semibold text-ink">Total due today</span>
            <span className="font-display text-[28px] font-bold tracking-tight text-ink">{PRICE_LABEL}</span>
          </div>

          {!live && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-warning-soft p-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <p className="text-[12.5px] leading-relaxed text-amber-800">
                <span className="font-semibold">Test mode.</span> No payment provider is configured, so no card is charged
                and no money moves. The rest of the flow behaves exactly as it will in production.
              </p>
            </div>
          )}

          <PayButton scanId={scan?.id} label={live ? `Pay ${PRICE_LABEL}` : `Continue in test mode`} />

          <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-faint">
            Billed once to {user.email}. Refundable in full under the {GUARANTEE_DAYS}-day guarantee.
          </p>
        </Card>
      </div>
    </div>
  );
}
