import { SITE, SITE_URL } from "@/lib/site";
import { CLAIM_WINDOW_DAYS, GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";
import type { EmailMessage } from "./provider";

/**
 * Email bodies.
 *
 * Inline styles and no external CSS, because every mail client strips or
 * ignores a stylesheet. Each template returns both HTML and plain text — the
 * text part is not a formality, it is what decides whether the message reaches
 * an inbox or a spam folder.
 *
 * Tone matches the site: say the thing, don't sell it. Someone reading a
 * password reset at 11pm does not want marketing.
 */

const BRAND = "#FC5D2C";
const INK = "#141414";
const MUTED = "#5B5B5B";
const LINE = "#E8E6E3";

function layout(heading: string, body: string, cta?: { label: string; url: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#FAF9F7;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="font-size:17px;font-weight:700;letter-spacing:-0.02em;color:${INK};">
      Rank<span style="color:${BRAND};">Vyze</span>
    </div>
    <div style="margin-top:28px;background:#FFFFFF;border:1px solid ${LINE};border-radius:14px;padding:28px;">
      <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;font-weight:700;letter-spacing:-0.02em;color:${INK};">${heading}</h1>
      ${body}
      ${
        cta
          ? `<div style="margin-top:24px;">
               <a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:999px;">${cta.label}</a>
             </div>
             <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
               If the button doesn't work, paste this into your browser:<br>
               <span style="word-break:break-all;color:${MUTED};">${cta.url}</span>
             </p>`
          : ""
      }
    </div>
    <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
      ${SITE.name} · <a href="${SITE_URL}" style="color:${MUTED};">rankvyze.com</a><br>
      Questions? Reply to this email.
    </p>
  </div>
</body></html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${MUTED};">${text}</p>`;

export function passwordResetEmail(to: string, link: string): EmailMessage {
  return {
    to,
    subject: "Reset your RankVyze password",
    html: layout(
      "Reset your password",
      p("Someone asked to reset the password for this account. If that was you, use the link below — it expires in an hour.") +
        p("If it wasn't you, ignore this email. Nothing has changed and your password still works."),
      { label: "Choose a new password", url: link },
    ),
    text: [
      "Reset your RankVyze password",
      "",
      "Someone asked to reset the password for this account. If that was you, open the link below. It expires in an hour.",
      "",
      link,
      "",
      "If it wasn't you, ignore this email. Nothing has changed and your password still works.",
      "",
      SITE_URL,
    ].join("\n"),
  };
}

export function sprintStartedEmail(to: string, opts: { domain: string; endsOn: Date }): EmailMessage {
  const ends = opts.endsOn.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    to,
    subject: `Your ${GUARANTEE_DAYS}-day sprint for ${opts.domain} has started`,
    html: layout(
      "Your sprint has started",
      p(`We've received your ${PRICE_LABEL} payment and the clock on <strong style="color:${INK};">${opts.domain}</strong> starts today.`) +
        p(
          `What happens next: we ask your tracked prompts on ChatGPT, Perplexity, Gemini and Claude and record what they actually say, audit the site against the signals those engines use, then work through the fixes with you.`,
        ) +
        p(
          `The guarantee: if ${opts.domain} isn't mentioned by at least ${GUARANTEE_MIN_ENGINES} of the four engines by <strong style="color:${INK};">${ends}</strong>, you get every penny back. You have ${CLAIM_WINDOW_DAYS} days after that to claim.`,
        ),
      { label: "Open your dashboard", url: `${SITE_URL}/dashboard` },
    ),
    text: [
      "Your sprint has started",
      "",
      `We've received your ${PRICE_LABEL} payment and the clock on ${opts.domain} starts today.`,
      "",
      "What happens next: we ask your tracked prompts on ChatGPT, Perplexity, Gemini and Claude and record what they actually say, audit the site against the signals those engines use, then work through the fixes with you.",
      "",
      `The guarantee: if ${opts.domain} isn't mentioned by at least ${GUARANTEE_MIN_ENGINES} of the four engines by ${ends}, you get every penny back. You have ${CLAIM_WINDOW_DAYS} days after that to claim.`,
      "",
      `${SITE_URL}/dashboard`,
    ].join("\n"),
  };
}

export function changeAwaitingReviewEmail(
  to: string,
  opts: { title: string; number: number; changeId: string; domain: string },
): EmailMessage {
  return {
    to,
    subject: `A change is ready for your review — ${opts.title}`,
    html: layout(
      "A change is waiting for you",
      p(`We've prepared change #${opts.number} for ${opts.domain}:`) +
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${INK};font-weight:600;">${opts.title}</p>` +
        p("Nothing reaches your site until you approve it. Take a look when you have a moment — the sprint moves at the pace of these reviews."),
      { label: "Review the change", url: `${SITE_URL}/dashboard/code-changes/${opts.changeId}` },
    ),
    text: [
      "A change is waiting for you",
      "",
      `We've prepared change #${opts.number} for ${opts.domain}: ${opts.title}`,
      "",
      "Nothing reaches your site until you approve it.",
      "",
      `${SITE_URL}/dashboard/code-changes/${opts.changeId}`,
    ].join("\n"),
  };
}

export function refundIssuedEmail(to: string, opts: { domain: string; amountLabel: string }): EmailMessage {
  return {
    to,
    subject: `Your ${opts.amountLabel} refund is on its way`,
    html: layout(
      "Refund issued",
      p(`We didn't get ${opts.domain} mentioned on ${GUARANTEE_MIN_ENGINES} engines within ${GUARANTEE_DAYS} days, so your ${opts.amountLabel} has been refunded in full.`) +
        p("It usually lands back on your card within five to ten business days, depending on your bank.") +
        p("Your dashboard stays open — the research, the audit and every fix we made are yours to keep and act on."),
      { label: "Open your dashboard", url: `${SITE_URL}/dashboard` },
    ),
    text: [
      "Refund issued",
      "",
      `We didn't get ${opts.domain} mentioned on ${GUARANTEE_MIN_ENGINES} engines within ${GUARANTEE_DAYS} days, so your ${opts.amountLabel} has been refunded in full.`,
      "",
      "It usually lands back on your card within five to ten business days.",
      "",
      "Your dashboard stays open — the research, the audit and every fix we made are yours to keep.",
      "",
      `${SITE_URL}/dashboard`,
    ].join("\n"),
  };
}
