import "server-only";

/**
 * Transactional email.
 *
 * Structured as a provider behind an interface for the same reason payments
 * are: the rest of the app should say "tell this person their sprint started"
 * without knowing or caring which vendor carries it.
 *
 * The important property is that a send which did not happen never reports
 * success. Password resets are the case that matters — a caller that assumes
 * delivery leaves a locked-out customer waiting for a mail that was never
 * dispatched.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Always supplied. A message with no text part lands in spam far more often. */
  text: string;
  replyTo?: string;
}

export interface SendResult {
  ok: boolean;
  /** Provider message id, when the provider returns one. */
  id?: string;
  /** Why it didn't send. Safe to log; never contains the recipient's data. */
  error?: string;
  /** True when no provider is configured, so callers can distinguish "off" from "broken". */
  notConfigured?: boolean;
}

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<SendResult>;
}
