import "server-only";
import { randomBytes } from "node:crypto";
import type { CheckoutInput, CheckoutSession, NormalizedEvent, PaymentProvider, RefundInput, RefundResult } from "./provider";

/**
 * Local stand-in used only while no payment provider is configured.
 *
 * It takes no money and pretends nothing: `isLive` is false, and every surface
 * that uses it shows an explicit test-mode banner. It exists so the funnel,
 * the guarantee clock and the admin flows can be exercised end to end before
 * Dodo credentials arrive.
 */
export const devProvider: PaymentProvider = {
  id: "dev",
  isLive: false,

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const id = `dev_${randomBytes(8).toString("hex")}`;
    // Routes to an in-app page that states plainly that no charge is made.
    return { redirectUrl: `/checkout/test?order=${input.orderId}&session=${id}`, providerCheckoutId: id };
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    return { refundId: `dev_re_${randomBytes(6).toString("hex")}`, amountCents: input.amountCents };
  },

  async parseWebhook(rawBody: string): Promise<NormalizedEvent> {
    // This provider performs no signature verification, so it must never be
    // reachable in production. The route also guards this; belt and braces.
    if (process.env.NODE_ENV === "production") {
      throw new Error("The test payment provider cannot process webhooks in production.");
    }
    const body = JSON.parse(rawBody) as Record<string, string>;
    return {
      eventId: body.eventId ?? `dev_evt_${randomBytes(6).toString("hex")}`,
      type: "payment.succeeded",
      providerCheckoutId: body.providerCheckoutId,
      providerPaymentId: body.providerPaymentId ?? `dev_pi_${randomBytes(6).toString("hex")}`,
      raw: body,
    };
  },
};
