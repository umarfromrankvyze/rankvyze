/**
 * Email templates and the not-configured path.
 *
 * The thing worth asserting is that a send which did not happen reports
 * failure. A helper that silently "succeeds" with no provider would leave a
 * locked-out customer waiting for a reset mail nobody dispatched.
 *
 * Run: npx tsx --conditions react-server scripts/test-email.mts
 */
import { sendEmail } from "../src/lib/email";
import { passwordResetEmail, sprintStartedEmail, changeAwaitingReviewEmail, refundIssuedEmail } from "../src/lib/email/templates";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const link = "https://rankvyze.com/reset-password?token=abc123";
const messages = [
  ["password reset", passwordResetEmail("a@example.com", link)],
  ["sprint started", sprintStartedEmail("a@example.com", { domain: "acme.com", endsOn: new Date("2026-10-20") })],
  ["awaiting review", changeAwaitingReviewEmail("a@example.com", { title: "Add Organization schema", number: 4, changeId: "cc1", domain: "acme.com" })],
  ["refund issued", refundIssuedEmail("a@example.com", { domain: "acme.com", amountLabel: "$99" })],
] as const;

for (const [name, m] of messages) {
  check(`${name}: has a subject`, m.subject.length > 5 && m.subject.length < 90, m.subject);
  check(`${name}: has a text part`, m.text.trim().length > 40);
  check(`${name}: html is balanced`, (m.html.match(/<div/g) ?? []).length === (m.html.match(/<\/div>/g) ?? []).length);
  check(`${name}: no unreplaced template holes`, !m.html.includes("undefined") && !m.text.includes("undefined"));
}

check("reset email carries the link in both parts", passwordResetEmail("a@example.com", link).html.includes(link) && passwordResetEmail("a@example.com", link).text.includes(link));
check("sprint email states the guarantee deadline", sprintStartedEmail("a@example.com", { domain: "acme.com", endsOn: new Date("2026-10-20") }).text.includes("20 October 2026"));

// The important one.
delete process.env.RESEND_API_KEY;
const result = await sendEmail(passwordResetEmail("a@example.com", link));
check("no provider reports failure, not success", result.ok === false);
check("and flags it as not configured rather than broken", result.notConfigured === true);

console.log(`\n${failures === 0 ? "all checks passed" : `${failures} FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
