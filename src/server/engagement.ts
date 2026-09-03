import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  daysRemaining,
  evaluateGuarantee,
  windowFor,
  type EngagementStatus,
  type GuaranteeCheck,
  type GuaranteeEvaluation,
} from "@/lib/guarantee";

/**
 * Turns a confirmed payment into a running engagement. Called by the Dodo
 * webhook and, in test mode, by the confirm action — one code path either way.
 * Safe to call twice: a PAID order is a no-op.
 */
export async function activateEngagement(input: {
  orderId: string;
  providerPaymentId?: string;
  providerCustomerId?: string;
}) {
  const order = await db.order.findUnique({ where: { id: input.orderId }, include: { engagement: true } });
  if (!order) throw new Error(`Order ${input.orderId} not found`);
  if (order.status === "PAID") return order;

  const now = new Date();
  const { endsAt } = windowFor(now);
  const website = await db.website.findFirst({ where: { organizationId: order.organizationId }, orderBy: { createdAt: "asc" } });

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: now,
        providerPaymentId: input.providerPaymentId ?? order.providerPaymentId,
        providerCustomerId: input.providerCustomerId ?? order.providerCustomerId,
      },
    });

    if (order.engagement) {
      await tx.engagement.update({
        where: { id: order.engagement.id },
        data: { status: "ACTIVE", startsAt: now, endsAt, websiteId: website?.id ?? null },
      });
    } else {
      await tx.engagement.create({
        data: { organizationId: order.organizationId, orderId: order.id, status: "ACTIVE", startsAt: now, endsAt, websiteId: website?.id ?? null },
      });
    }

    await tx.organization.update({ where: { id: order.organizationId }, data: { plan: "SPRINT" } });
    await tx.subscription.upsert({
      where: { organizationId: order.organizationId },
      create: { organizationId: order.organizationId, plan: "SPRINT", status: "ACTIVE", periodStart: now, periodEnd: endsAt },
      update: { plan: "SPRINT", status: "ACTIVE", periodStart: now, periodEnd: endsAt },
    });
  });

  return db.order.findUnique({ where: { id: order.id } });
}

export interface EngagementView {
  id: string;
  status: EngagementStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  daysLeft: number;
  evaluation: GuaranteeEvaluation;
  voidReason: string | null;
  order: { id: string; amount: number; currency: string; paidAt: Date | null; refundedAt: Date | null };
  refundRequest: { status: string; requestedAt: Date; decisionNote: string | null } | null;
  canClaim: boolean;
  claimEndsAt: Date | null;
}

/**
 * Loads the engagement, re-evaluates the guarantee from research rows, and
 * persists any status transition. Evaluation is derived, never hand-set.
 */
export const getEngagement = cache(async (organizationId: string): Promise<EngagementView | null> => {
  const engagement = await db.engagement.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { order: true, refundRequest: true },
  });
  if (!engagement) return null;

  const engines = await db.aIEngine.findMany({ where: { isActive: true }, orderBy: { sortkey: "asc" } });
  const empty: GuaranteeEvaluation = {
    met: false,
    engineCount: 0,
    enginesNeeded: 2,
    evidence: [],
    missingEngines: engines.map((e) => e.name),
    metAt: null,
  };

  if (!engagement.startsAt || !engagement.endsAt) {
    return {
      id: engagement.id,
      status: engagement.status as EngagementStatus,
      startsAt: null,
      endsAt: null,
      daysLeft: 0,
      evaluation: empty,
      voidReason: engagement.voidReason,
      order: engagement.order,
      refundRequest: engagement.refundRequest,
      canClaim: false,
      claimEndsAt: null,
    };
  }

  const rows = engagement.websiteId
    ? await db.aIResearchResult.findMany({
        where: { websiteId: engagement.websiteId, checkedAt: { gte: engagement.startsAt, lte: engagement.endsAt } },
        include: { engine: { select: { key: true, name: true } }, prompt: { select: { id: true, text: true } } },
      })
    : [];

  const checks: GuaranteeCheck[] = rows.map((r) => ({
    engineKey: r.engine.key,
    engineName: r.engine.name,
    promptId: r.promptId,
    promptText: r.prompt.text,
    mentioned: r.mentioned,
    position: r.position,
    checkedAt: r.checkedAt,
  }));

  const locked: string[] = engagement.lockedPromptsJson ? (JSON.parse(engagement.lockedPromptsJson) as string[]) : [];
  const evaluation = evaluateGuarantee(
    checks,
    { startsAt: engagement.startsAt, endsAt: engagement.endsAt },
    locked,
    engines.map((e) => ({ key: e.key, name: e.name })),
  );

  // Persist transitions that the evidence now supports.
  const now = new Date();
  let status = engagement.status as EngagementStatus;
  if (status === "ACTIVE" && evaluation.met) {
    status = "MET";
    await db.engagement.update({
      where: { id: engagement.id },
      data: {
        status,
        metAt: evaluation.metAt,
        metEngineCount: evaluation.engineCount,
        metEvidenceJson: JSON.stringify(evaluation.evidence),
        evaluatedAt: now,
      },
    });
  } else if (status === "ACTIVE" && now > engagement.endsAt) {
    status = "ELIGIBLE";
    await db.engagement.update({ where: { id: engagement.id }, data: { status, evaluatedAt: now } });
  }

  const { claimEndsAt } = windowFor(engagement.startsAt);

  return {
    id: engagement.id,
    status,
    startsAt: engagement.startsAt,
    endsAt: engagement.endsAt,
    daysLeft: daysRemaining(engagement.endsAt, now),
    evaluation,
    voidReason: engagement.voidReason,
    order: engagement.order,
    refundRequest: engagement.refundRequest,
    canClaim: status === "ELIGIBLE" && now <= claimEndsAt && !engagement.refundRequest,
    claimEndsAt,
  };
});

/** True when the organization has paid — the gate for dashboard access. */
export const hasPaid = cache(async (organizationId: string) => {
  const paid = await db.order.count({ where: { organizationId, status: { in: ["PAID", "REFUNDED"] } } });
  return paid > 0;
});
