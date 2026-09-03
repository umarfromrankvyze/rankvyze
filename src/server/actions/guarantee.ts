"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { paymentProvider } from "@/lib/payments";
import { VOID_REASONS, type VoidReason } from "@/lib/guarantee";
import { fail, succeed, type ActionResult } from "@/server/types";

/** Customer claims the refund inside the claim window. */
export async function claimRefund(engagementId: string, reason: string): Promise<ActionResult> {
  const user = await requireUser();
  const engagement = await db.engagement.findFirst({
    where: { id: engagementId, organization: { members: { some: { userId: user.id } } } },
    include: { refundRequest: true },
  });
  if (!engagement) return fail("Engagement not found.");
  if (engagement.refundRequest) return fail("A refund request is already open for this engagement.");
  if (engagement.status !== "ELIGIBLE") {
    return fail("This engagement isn't eligible for a refund. If you think that's wrong, contact support.");
  }

  await db.$transaction([
    db.refundRequest.create({ data: { engagementId, reason: reason.trim().slice(0, 2000) || null } }),
    db.engagement.update({ where: { id: engagementId }, data: { status: "REFUND_REQUESTED" } }),
  ]);

  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  return succeed(undefined, "Refund requested. We'll review it within two business days.");
}

/** Admin approves — issues the refund through the payment provider. */
export async function approveRefund(requestId: string, note: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const request = await db.refundRequest.findUnique({
    where: { id: requestId },
    include: { engagement: { include: { order: true } } },
  });
  if (!request) return fail("Refund request not found.");
  if (request.status !== "PENDING") return fail("This request has already been decided.");

  const order = request.engagement.order;
  if (!order.providerPaymentId) return fail("This order has no payment reference to refund against.");

  let refundId: string;
  let amount: number;
  try {
    const result = await paymentProvider().refund({
      providerPaymentId: order.providerPaymentId,
      amountCents: order.amount,
      reason: "45-day AI visibility guarantee",
    });
    refundId = result.refundId;
    amount = result.amountCents;
  } catch (e) {
    console.error("[refund] provider error", e);
    return fail(e instanceof Error ? e.message : "The payment provider rejected the refund.");
  }

  await db.$transaction([
    db.refundRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: admin.id, decisionNote: note.trim() || null },
    }),
    db.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED", refundedAt: new Date(), refundId, refundAmount: amount },
    }),
    db.engagement.update({ where: { id: request.engagementId }, data: { status: "REFUNDED" } }),
  ]);

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return succeed(undefined, "Refund issued.");
}

export async function denyRefund(requestId: string, note: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!note.trim()) return fail("Give a reason — the customer sees it.", { note: "Required" });

  const request = await db.refundRequest.findUnique({ where: { id: requestId } });
  if (!request) return fail("Refund request not found.");
  if (request.status !== "PENDING") return fail("This request has already been decided.");

  await db.$transaction([
    db.refundRequest.update({
      where: { id: requestId },
      data: { status: "DENIED", reviewedAt: new Date(), reviewedById: admin.id, decisionNote: note.trim() },
    }),
    db.engagement.update({ where: { id: request.engagementId }, data: { status: "DENIED" } }),
  ]);

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return succeed(undefined, "Request declined.");
}

/** Admin marks a guarantee void against one of the published conditions. */
export async function voidGuarantee(engagementId: string, reason: VoidReason): Promise<ActionResult> {
  await requireAdmin();
  if (!(reason in VOID_REASONS)) return fail("Unknown void reason.");
  await db.engagement.update({
    where: { id: engagementId },
    data: { status: "VOID", voidReason: VOID_REASONS[reason] },
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return succeed(undefined, "Guarantee marked void.");
}

export async function reinstateGuarantee(engagementId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.engagement.update({ where: { id: engagementId }, data: { status: "ACTIVE", voidReason: null } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return succeed(undefined, "Guarantee reinstated.");
}
