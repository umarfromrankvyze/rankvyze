import "server-only";
import { PaymentError, type CheckoutInput, type CheckoutSession, type NormalizedEvent, type PaymentProvider, type RefundInput, type RefundResult } from "./provider";

/**
 * Dodo Payments.
 *
 * NOT YET WIRED UP. The four marked sections below are the only places that
 * touch Dodo; everything else in the app already works against the
 * PaymentProvider interface. Filling these in — with the real endpoint paths,
 * request/response shapes and signature scheme from the Dodo docs — is the
 * whole integration.
 *
 * Required environment:
 *   DODO_API_KEY
 *   DODO_WEBHOOK_SECRET
 *   DODO_PRODUCT_ID        (the $99 one-time product)
 *   DODO_API_BASE          (optional; defaults to the live base below)
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- the parameters below
   are the integration surface; they are consumed once the marked sections are
   filled in against the Dodo API. */

const API_BASE = process.env.DODO_API_BASE ?? "https://live.dodopayments.com";

function notWired(what: string): never {
  throw new PaymentError(
    `Dodo Payments is not wired up yet (${what}). Add DODO_API_KEY, DODO_WEBHOOK_SECRET and DODO_PRODUCT_ID, then complete src/lib/payments/dodo.ts.`,
  );
}

export function dodoConfigured() {
  return Boolean(process.env.DODO_API_KEY && process.env.DODO_WEBHOOK_SECRET && process.env.DODO_PRODUCT_ID);
}

export const dodoProvider: PaymentProvider = {
  id: "dodo",
  isLive: true,

  async createCheckout(_input: CheckoutInput): Promise<CheckoutSession> {
    // ── DODO INTEGRATION POINT 1 ───────────────────────────────────────────
    // POST a checkout/payment-link request to Dodo with:
    //   product_id      = process.env.DODO_PRODUCT_ID
    //   customer        = { email: _input.email, name: _input.customerName }
    //   metadata        = { orderId: _input.orderId, websiteUrl: _input.websiteUrl }
    //   return_url      = _input.successUrl
    //   cancel_url      = _input.cancelUrl
    // Return { redirectUrl, providerCheckoutId } from the response.
    //
    // `metadata.orderId` is what ties the webhook back to our Order row, so it
    // must round-trip — don't drop it.
    void API_BASE;
    notWired("createCheckout");
  },

  async refund(_input: RefundInput): Promise<RefundResult> {
    // ── DODO INTEGRATION POINT 2 ───────────────────────────────────────────
    // POST a refund for _input.providerPaymentId of _input.amountCents.
    // Return { refundId, amountCents }.
    notWired("refund");
  },

  async parseWebhook(_rawBody: string, _headers: Headers): Promise<NormalizedEvent> {
    // ── DODO INTEGRATION POINT 3 ───────────────────────────────────────────
    // Verify the signature header against DODO_WEBHOOK_SECRET over the RAW
    // body (never the parsed object) and throw PaymentError if it fails.
    //
    // ── DODO INTEGRATION POINT 4 ───────────────────────────────────────────
    // Map Dodo's event type onto NormalizedEvent["type"] and pull out
    // metadata.orderId, the payment id, the customer id and the amount.
    notWired("parseWebhook");
  },
};
