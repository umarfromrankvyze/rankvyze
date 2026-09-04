import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentProvider, paymentsAreLive } from "@/lib/payments";
import { activateEngagement } from "@/server/engagement";

/**
 * Payment webhook — the source of truth for activation.
 *
 * The browser redirect after checkout is only a hint; an engagement starts
 * because a verified provider event says the money moved. Events are stored
 * before processing and keyed by provider event id, so redelivery is a no-op.
 */
export async function POST(req: Request) {
  // Without a configured provider the only implementation available is the
  // test one, which verifies nothing. Refuse outright rather than accept an
  // unsigned body that could mark an order paid.
  if (!paymentsAreLive() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "payments not configured" }, { status: 503 });
  }

  const raw = await req.text();

  let event;
  try {
    event = await paymentProvider().parseWebhook(raw, req.headers);
  } catch (e) {
    console.error("[webhook] rejected", e);
    // 400, not 500 — the provider should not retry an untrusted payload.
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const provider = paymentProvider().id;
  const existing = await db.webhookEvent.findUnique({
    where: { provider_eventId: { provider, eventId: event.eventId } },
  });
  if (existing?.processedAt) return NextResponse.json({ ok: true, deduped: true });

  const record =
    existing ??
    (await db.webhookEvent.create({
      data: { provider, eventId: event.eventId, type: event.type, payload: raw.slice(0, 20_000) },
    }));

  /** metadata.orderId is the durable link; the session id is a fallback. */
  const findOrder = async () => {
    if (event.orderId) {
      const byId = await db.order.findUnique({ where: { id: event.orderId } });
      if (byId) return byId;
    }
    if (event.providerCheckoutId) {
      return db.order.findFirst({ where: { providerCheckoutId: event.providerCheckoutId } });
    }
    return null;
  };

  try {
    if (event.type === "payment.succeeded") {
      const order = await findOrder();

      if (!order) {
        // Keep the event; a missing order is an operational problem, not a
        // reason to make the provider retry forever.
        await db.webhookEvent.update({
          where: { id: record.id },
          data: { processedAt: new Date(), error: "No matching order for this event" },
        });
        return NextResponse.json({ ok: true, warning: "no matching order" });
      }

      await activateEngagement({
        orderId: order.id,
        providerPaymentId: event.providerPaymentId,
        providerCustomerId: event.providerCustomerId,
      });
    } else if (event.type === "payment.failed") {
      const order = await findOrder();
      if (order) await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    } else if (event.type === "refund.succeeded") {
      // Covers refunds issued from the Dodo dashboard rather than our admin UI.
      const order = await findOrder();
      if (order && order.status !== "REFUNDED") {
        await db.$transaction([
          db.order.update({
            where: { id: order.id },
            data: { status: "REFUNDED", refundedAt: new Date(), refundAmount: event.amountCents ?? order.amount },
          }),
          db.engagement.updateMany({ where: { orderId: order.id }, data: { status: "REFUNDED" } }),
        ]);
      }
    }

    await db.webhookEvent.update({ where: { id: record.id }, data: { processedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook] processing failed", e);
    await db.webhookEvent.update({
      where: { id: record.id },
      data: { error: e instanceof Error ? e.message.slice(0, 500) : "unknown" },
    });
    // 500 so the provider retries; the dedupe key makes that safe.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
