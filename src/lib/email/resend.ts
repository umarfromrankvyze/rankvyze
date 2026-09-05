import "server-only";
import type { EmailMessage, EmailProvider, SendResult } from "./provider";

/**
 * Resend transport. Chosen because it needs one API key and one DNS record set
 * rather than an account review, which matters for a product that has to be
 * able to send a password reset on day one.
 *
 * Written against the HTTP API directly rather than the SDK: it is one POST,
 * and a dependency that exists to build one JSON body is a dependency to
 * upgrade forever.
 */

const API = "https://api.resend.com/emails";
const TIMEOUT_MS = 15_000;

export function resendProvider(apiKey: string, from: string): EmailProvider {
  return {
    name: "resend",
    async send(message: EmailMessage): Promise<SendResult> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(API, {
          method: "POST",
          signal: controller.signal,
          headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
          body: JSON.stringify({
            from,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
            ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          }),
        });

        const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
        if (!res.ok) {
          // Resend's own message is the useful part — it says things like
          // "domain is not verified", which is the failure everyone hits first.
          return { ok: false, error: body.message ?? body.name ?? `Resend returned ${res.status}` };
        }
        return { ok: true, id: body.id };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Could not reach Resend." };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
