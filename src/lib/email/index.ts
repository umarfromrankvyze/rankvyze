import "server-only";
import { resendProvider } from "./resend";
import type { EmailMessage, SendResult } from "./provider";

export type { EmailMessage, SendResult } from "./provider";
export * from "./templates";

/**
 * One entry point for every outbound email.
 *
 * With no provider configured this logs and returns `notConfigured: true`
 * rather than throwing or silently succeeding. Silent success is the dangerous
 * option: it would let a password reset appear to work while the customer
 * waits for a mail nobody sent.
 */

const FROM = process.env.EMAIL_FROM ?? "RankVyze <hello@rankvyze.com>";

export function emailIsLive(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // Development and any deploy without a key. The subject and recipient are
    // logged so a flow can still be exercised end to end locally.
    console.info(`[email] not configured — would have sent "${message.subject}" to ${message.to}`);
    return { ok: false, notConfigured: true, error: "No email provider is configured." };
  }

  const result = await resendProvider(key, FROM).send(message);
  if (!result.ok) console.error(`[email] failed to send "${message.subject}": ${result.error}`);
  return result;
}
