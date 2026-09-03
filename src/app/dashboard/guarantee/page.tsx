import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, ExternalLink, Info, ShieldCheck, XCircle } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { getEngagement } from "@/server/engagement";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EngineIcon } from "@/components/ui/engine-icon";
import { ClaimRefundButton } from "@/components/dashboard/guarantee-panel";
import {
  GUARANTEE_DAYS,
  GUARANTEE_MIN_ENGINES,
  VOID_REASONS,
  guaranteeHeadline,
} from "@/lib/guarantee";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Guarantee" };

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export default async function GuaranteePage() {
  const { website, organization } = await dashboardContext();
  const engagement = await getEngagement(organization.id);

  if (!engagement) {
    return (
      <>
        <PageHeader eyebrow={website.domain} title="Guarantee" description={`The ${GUARANTEE_DAYS}-day AI visibility guarantee.`} />
        <EmptyState icon={ShieldCheck} title="No active engagement" description="Your guarantee appears here once a sprint is running." />
      </>
    );
  }

  const { evaluation, status } = engagement;
  const amount = money(engagement.order.amount, engagement.order.currency);
  const progress = Math.min(100, (evaluation.engineCount / GUARANTEE_MIN_ENGINES) * 100);

  const tone =
    status === "MET" || status === "REFUNDED"
      ? "success"
      : status === "ELIGIBLE" || status === "REFUND_REQUESTED"
        ? "warning"
        : status === "VOID" || status === "DENIED"
          ? "danger"
          : "brand";

  return (
    <>
      <PageHeader
        eyebrow={website.domain}
        title="Guarantee"
        description={`Mentioned on ${GUARANTEE_MIN_ENGINES}+ AI engines within ${GUARANTEE_DAYS} days, or we refund the full ${amount}.`}
      />

      {/* Status */}
      <Card
        className={cn(
          "p-6 md:p-7",
          tone === "success" && "border-green-200 bg-success-soft/40",
          tone === "warning" && "border-amber-200 bg-warning-soft/50",
          tone === "danger" && "border-red-200 bg-danger-soft/40",
          tone === "brand" && "border-brand-200 bg-brand-50/40",
        )}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {status === "MET" ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : status === "ELIGIBLE" || status === "REFUND_REQUESTED" ? (
                <Clock className="size-5 text-amber-600" />
              ) : status === "VOID" || status === "DENIED" ? (
                <XCircle className="size-5 text-danger" />
              ) : (
                <ShieldCheck className="size-5 text-brand-500" />
              )}
              <Badge variant={tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "danger" ? "danger" : "brand"}>
                {status.replace(/_/g, " ").toLowerCase()}
              </Badge>
            </div>
            <h2 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-tight text-ink md:text-[26px]">
              {guaranteeHeadline(status, evaluation, engagement.daysLeft)}
            </h2>
            {engagement.startsAt && engagement.endsAt && (
              <p className="mt-2 text-[13.5px] text-ink-muted">
                {formatDate(engagement.startsAt)} → {formatDate(engagement.endsAt)}
                {status === "ACTIVE" && ` · ${engagement.daysLeft} days remaining`}
              </p>
            )}
            {engagement.voidReason && <p className="mt-2 text-[13.5px] text-ink">{engagement.voidReason}</p>}
            {engagement.refundRequest?.decisionNote && (
              <p className="mt-2 rounded-lg border border-line bg-white p-3 text-[13.5px] text-ink">
                {engagement.refundRequest.decisionNote}
              </p>
            )}
          </div>

          <div className="shrink-0 text-center">
            <p className="font-display text-[44px] font-extrabold leading-none tracking-tight text-ink">
              {evaluation.engineCount}
              <span className="text-[20px] font-bold text-ink-faint"> / {GUARANTEE_MIN_ENGINES}</span>
            </p>
            <p className="mt-1 text-[11.5px] uppercase tracking-wider text-ink-faint">engines mentioning you</p>
            <ProgressBar value={progress} tone={evaluation.met ? "success" : "brand"} size="md" className="mt-3 w-40" />
          </div>
        </div>

        {engagement.canClaim && (
          <div className="mt-6 border-t border-amber-200 pt-5">
            <ClaimRefundButton engagementId={engagement.id} amountLabel={amount} />
            <p className="mt-2 text-[12.5px] text-ink-muted">
              Claim window closes {formatDate(engagement.claimEndsAt)}.
            </p>
          </div>
        )}
      </Card>

      {/* Evidence */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>The first qualifying mention we recorded on each engine.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {evaluation.evidence.length === 0 ? (
              <p className="border-t border-line px-5 py-8 text-center text-[13.5px] text-ink-muted">
                No qualifying mentions recorded yet. Every research run adds to this.
              </p>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {evaluation.evidence.map((e, i) => (
                  <li key={e.engineKey} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-white">
                      <EngineIcon engine={e.engineKey} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-ink">{e.engineName}</span>
                      <span className="block text-[13px] text-ink-muted">“{e.promptText}”</span>
                      <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                        {formatDate(e.checkedAt)}
                        {e.position ? ` · position #${e.position}` : ""}
                      </span>
                    </span>
                    {i < GUARANTEE_MIN_ENGINES && <Badge variant="success">counts</Badge>}
                  </li>
                ))}
              </ul>
            )}
            {evaluation.missingEngines.length > 0 && (
              <p className="border-t border-line px-5 py-3 text-[12.5px] text-ink-faint">
                Not yet mentioned on: {evaluation.missingEngines.join(", ")}.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>How it&apos;s judged</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[13.5px] leading-relaxed text-ink-muted">
              <p>
                Your brand must be <span className="font-medium text-ink">mentioned on at least {GUARANTEE_MIN_ENGINES} of
                the four AI engines</span>, at any point in the {GUARANTEE_DAYS} days, on a prompt from the set locked when
                your research started.
              </p>
              <p>
                It&apos;s decided by the research records themselves, not by us after the fact — the same rows that drive
                every number in your dashboard.
              </p>
              <Link href="/guarantee" className="inline-flex items-center gap-1 font-medium text-ink hover:underline">
                Full terms <ExternalLink className="size-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>What voids it</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Object.values(VOID_REASONS).map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Amount</span>
                <span className="font-medium text-ink">{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Paid</span>
                <span className="text-ink">{formatDate(engagement.order.paidAt)}</span>
              </div>
              {engagement.order.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Refunded</span>
                  <span className="font-medium text-success">{formatDate(engagement.order.refundedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
