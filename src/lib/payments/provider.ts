import "server-only";

/**
 * Payment provider seam.
 *
 * Everything in the app talks to this interface, never to a vendor SDK. Dodo
 * Payments implements it in `dodo.ts`; until its credentials are present the
 * app falls back to `dev.ts`, which is clearly labelled as test mode in the UI
 * and never touches a card.
 */

export interface CheckoutInput {
  orderId: string;
  amountCents: number;
  currency: string;
  email: string;
  customerName: string;
  websiteUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  /** Where to send the browser to pay */
  redirectUrl: string;
  providerCheckoutId: string;
}

export interface RefundInput {
  providerPaymentId: string;
  amountCents: number;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  amountCents: number;
}

/** A payment event, normalised away from the provider's own envelope. */
export interface NormalizedEvent {
  eventId: string;
  type: "payment.succeeded" | "payment.failed" | "refund.succeeded" | "unknown";
  /** Our own Order id, round-tripped through provider metadata. Primary key. */
  orderId?: string;
  providerCheckoutId?: string;
  providerPaymentId?: string;
  providerCustomerId?: string;
  amountCents?: number;
  raw: unknown;
}

export interface PaymentProvider {
  readonly id: string;
  /** false when the provider is a stand-in and the UI must say so */
  readonly isLive: boolean;
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  refund(input: RefundInput): Promise<RefundResult>;
  /** Verify the signature and normalise the payload. Throws if untrusted. */
  parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedEvent>;
}

export class PaymentError extends Error {}
