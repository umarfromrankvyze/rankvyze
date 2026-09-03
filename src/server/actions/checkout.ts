"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ScanError, scanUrl } from "@/lib/scanner";
import { paymentProvider, paymentsAreLive } from "@/lib/payments";
import { PRICE_CENTS } from "@/lib/guarantee";
import { activateEngagement } from "@/server/engagement";
import { normalizeUrl } from "@/lib/utils";
import { flattenErrors } from "@/lib/validation";
import { fail, succeed, type ActionResult } from "@/server/types";

const urlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(3, "Enter your website address")
    .transform((v) => normalizeUrl(v))
    .pipe(z.string().url("That doesn't look like a valid URL")),
});

/** Crude abuse guard: a handful of scans per IP per hour is plenty. */
const SCAN_LIMIT_PER_HOUR = 8;

export async function startScan(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = urlSchema.safeParse({ url: formData.get("url") });
  if (!parsed.success) return fail("Enter a valid website address.", flattenErrors(parsed.error));

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  const since = new Date(Date.now() - 3_600_000);
  const recent = await db.scanRequest.count({ where: { ipHash, createdAt: { gte: since } } });
  if (recent >= SCAN_LIMIT_PER_HOUR) {
    return fail("That's a lot of scans in one hour. Give it a few minutes and try again.");
  }

  let result;
  try {
    result = await scanUrl(parsed.data.url);
  } catch (e) {
    if (e instanceof ScanError) return fail(e.message, { url: e.message });
    console.error("[scan] failed", e);
    return fail("We couldn't scan that site right now. Try again in a moment.");
  }

  const scan = await db.scanRequest.create({
    data: {
      url: result.url,
      domain: result.domain,
      score: result.score,
      resultJson: JSON.stringify(result),
      ipHash,
      userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
    },
  });

  redirect(`/scan/${scan.id}`);
}

/**
 * Creates the order + engagement shell and hands back a checkout URL.
 * The engagement clock does not start here — only a confirmed payment starts it.
 */
export async function beginCheckout(scanId?: string): Promise<ActionResult<{ redirectUrl: string }>> {
  const user = await requireUser("/checkout");
  const membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: { organization: { include: { websites: { take: 1 }, orders: { where: { status: "PAID" }, take: 1 } } } },
  });
  if (!membership) return fail("No workspace found for this account.");

  const org = membership.organization;
  if (org.orders.length > 0) return fail("This workspace has already been paid for.");

  const scan = scanId ? await db.scanRequest.findUnique({ where: { id: scanId } }) : null;
  const websiteUrl = scan?.url ?? org.websites[0]?.url ?? "";

  // Reuse an unpaid order rather than littering the table on every retry.
  const existing = await db.order.findFirst({
    where: { organizationId: org.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const order =
    existing ??
    (await db.order.create({
      data: {
        organizationId: org.id,
        amount: PRICE_CENTS,
        currency: "USD",
        provider: paymentProvider().id,
        email: user.email,
        scanId: scan?.id ?? null,
        engagement: { create: { organizationId: org.id, status: "PENDING_PAYMENT" } },
      },
    }));

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  try {
    const session = await paymentProvider().createCheckout({
      orderId: order.id,
      amountCents: order.amount,
      currency: order.currency,
      email: user.email,
      customerName: user.name,
      websiteUrl,
      successUrl: `${appUrl}/checkout/success?order=${order.id}`,
      cancelUrl: `${appUrl}/checkout/cancelled?order=${order.id}`,
    });

    await db.order.update({ where: { id: order.id }, data: { providerCheckoutId: session.providerCheckoutId } });
    return succeed({ redirectUrl: session.redirectUrl });
  } catch (e) {
    console.error("[checkout] provider error", e);
    return fail(e instanceof Error ? e.message : "Checkout is unavailable right now.");
  }
}

/**
 * Test-mode only. Mirrors exactly what the Dodo webhook will do, so the funnel
 * downstream of payment is the same code path in both modes.
 */
export async function confirmTestPayment(orderId: string): Promise<ActionResult> {
  await requireUser("/checkout");
  if (paymentsAreLive()) return fail("Test payments are disabled once a live payment provider is configured.");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return fail("Order not found.");
  if (order.status === "PAID") return succeed(undefined, "Already paid.");

  await activateEngagement({ orderId: order.id, providerPaymentId: `dev_pi_${order.id.slice(-8)}` });
  revalidatePath("/dashboard", "layout");
  return succeed(undefined, "Test payment recorded.");
}
