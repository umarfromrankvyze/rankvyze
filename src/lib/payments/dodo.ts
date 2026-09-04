import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  PaymentError,
  type CheckoutInput,
  type CheckoutSession,
  type NormalizedEvent,
  type PaymentProvider,
  type RefundInput,
  type RefundResult,
} from "./provider";

/**
 * Dodo Payments.
 *
 * Environment:
 *   DODO_API_KEY          server-side API key
 *   DODO_WEBHOOK_SECRET   whsec_… signing secret for the endpoint
 *   DODO_PRODUCT_ID       the one-time $99 product
 *   DODO_API_BASE         optional; defaults to live
 *
 * Correlation back to our Order is carried in `metadata.orderId`, which Dodo
 * copies from the checkout session onto the resulting payment. The checkout
 * session id is kept as a secondary key in case metadata is ever dropped.
 */

const API_BASE = process.env.DODO_API_BASE ?? "https://live.dodopayments.com";

/** Reject anything older than this to blunt replay attacks. */
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export function dodoConfigured() {
  return Boolean(process.env.DODO_API_KEY && process.env.DODO_WEBHOOK_SECRET && process.env.DODO_PRODUCT_ID);
}

async function dodoFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON body — surface the raw text in the error below.
  }

  if (!res.ok) {
    const b = body as { message?: string; code?: string } | null;
    throw new PaymentError(`Dodo ${path} failed (${res.status}): ${b?.message ?? text.slice(0, 200)}`);
  }
  return body;
}

/**
 * Standard Webhooks verification.
 * Signed content is `{id}.{timestamp}.{body}`; the header may carry several
 * space-separated `v1,<base64>` signatures, any one of which may match.
 */
function verifySignature(rawBody: string, headers: Headers) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");

  if (!id || !timestamp || !signatureHeader) {
    throw new PaymentError("Missing webhook signature headers");
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TIMESTAMP_TOLERANCE_SECONDS) {
    throw new PaymentError("Webhook timestamp outside the allowed tolerance");
  }

  const raw = process.env.DODO_WEBHOOK_SECRET!;
  const key = Buffer.from(raw.startsWith("whsec_") ? raw.slice(6) : raw, "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();

  const provided = signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((v): v is string => Boolean(v));

  const matched = provided.some((sig) => {
    const buf = Buffer.from(sig, "base64");
    return buf.length === expected.length && timingSafeEqual(buf, expected);
  });

  if (!matched) throw new PaymentError("Webhook signature does not match");
}

type DodoEvent = {
  type?: string;
  data?: {
    payment_id?: string;
    refund_id?: string;
    session_id?: string;
    checkout_session_id?: string;
    total_amount?: number;
    amount?: number;
    metadata?: Record<string, string>;
    customer?: { customer_id?: string };
  };
};

function mapEventType(type: string | undefined): NormalizedEvent["type"] {
  switch (type) {
    case "payment.succeeded":
      return "payment.succeeded";
    case "payment.failed":
    case "payment.cancelled":
      return "payment.failed";
    case "refund.succeeded":
      return "refund.succeeded";
    default:
      return "unknown";
  }
}

export const dodoProvider: PaymentProvider = {
  id: "dodo",
  isLive: true,

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const body = await dodoFetch("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        product_cart: [{ product_id: process.env.DODO_PRODUCT_ID, quantity: 1 }],
        customer: { email: input.email, name: input.customerName },
        return_url: input.successUrl,
        // The only durable link back to our Order row — must round-trip.
        metadata: { orderId: input.orderId, websiteUrl: input.websiteUrl },
      }),
    });

    const { checkout_url, session_id } = (body ?? {}) as { checkout_url?: string; session_id?: string };
    if (!checkout_url || !session_id) {
      throw new PaymentError("Dodo did not return a checkout URL");
    }
    return { redirectUrl: checkout_url, providerCheckoutId: session_id };
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const body = await dodoFetch("/refunds", {
      method: "POST",
      body: JSON.stringify({
        payment_id: input.providerPaymentId,
        amount: input.amountCents,
        reason: input.reason,
      }),
    });

    const r = (body ?? {}) as { refund_id?: string; amount?: number };
    if (!r.refund_id) throw new PaymentError("Dodo did not return a refund id");
    return { refundId: r.refund_id, amountCents: r.amount ?? input.amountCents };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedEvent> {
    verifySignature(rawBody, headers);

    let event: DodoEvent;
    try {
      event = JSON.parse(rawBody) as DodoEvent;
    } catch {
      throw new PaymentError("Webhook body is not valid JSON");
    }

    const d = event.data ?? {};
    return {
      // webhook-id is unique per delivery attempt group, which is exactly the
      // idempotency key the route needs.
      eventId: headers.get("webhook-id")!,
      type: mapEventType(event.type),
      orderId: d.metadata?.orderId,
      providerCheckoutId: d.session_id ?? d.checkout_session_id,
      providerPaymentId: d.payment_id,
      providerCustomerId: d.customer?.customer_id,
      amountCents: d.total_amount ?? d.amount,
      raw: event,
    };
  },
};
