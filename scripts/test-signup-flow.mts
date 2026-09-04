/**
 * Integration test for the signup → onboarding → checkout → dashboard order.
 *
 * Creates a throwaway customer with a real session row, curls each guarded
 * route at three stages of setup, and deletes everything at the end. The
 * redirects are the product decision, so they are worth checking against a
 * running server rather than by reading the source.
 *
 * It writes to whatever DATABASE_URL points at, which is currently the live
 * database — hence the throwaway @rankvyze.test address and the delete at the
 * end. Run: BASE=http://localhost:3100 npx tsx scripts/test-signup-flow.mts
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const db = new PrismaClient();
const email = `flowtest-${Date.now()}@rankvyze.test`;

async function where(path: string, cookie: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" });
  const loc = res.headers.get("location");
  return `${res.status}${loc ? ` -> ${new URL(loc, BASE).pathname}` : " (rendered)"}`;
}

const user = await db.user.create({
  data: { name: "Flow Test", email, passwordHash: await bcrypt.hash("test-password-123", 10), role: "CUSTOMER" },
});
const org = await db.organization.create({
  data: {
    name: "Flow Test workspace",
    slug: `flowtest-${Date.now()}`,
    plan: "TRIAL",
    members: { create: { userId: user.id, role: "OWNER" } },
  },
});
const token = randomBytes(32).toString("hex");
await db.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 864e5) } });
const cookie = `rv_session=${token}`;

console.log("STAGE 1 — signed up, nothing set up yet");
console.log("  /dashboard ", await where("/dashboard", cookie));
console.log("  /checkout  ", await where("/checkout", cookie));
console.log("  /onboarding", await where("/onboarding", cookie));

await db.website.create({
  data: { organizationId: org.id, url: "https://example.com", domain: "example.com", name: "Example", isPrimary: true },
});
await db.organization.update({ where: { id: org.id }, data: { onboardingStep: 4, onboardingCompletedAt: new Date() } });

console.log("\nSTAGE 2 — onboarding complete, not paid");
console.log("  /dashboard ", await where("/dashboard", cookie));
console.log("  /checkout  ", await where("/checkout", cookie));

await db.order.create({
  data: {
    organizationId: org.id, email, amount: 9900, currency: "USD",
    status: "PAID", provider: "test", paidAt: new Date(),
  },
});

console.log("\nSTAGE 3 — paid");
console.log("  /dashboard ", await where("/dashboard", cookie));
console.log("  /checkout  ", await where("/checkout", cookie));

await db.$transaction([
  db.order.deleteMany({ where: { organizationId: org.id } }),
  db.session.deleteMany({ where: { userId: user.id } }),
  db.organization.delete({ where: { id: org.id } }),
  db.user.delete({ where: { id: user.id } }),
]);
console.log("\ncleaned up:", email);
await db.$disconnect();
