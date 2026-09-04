/**
 * Renders onboarding step 4 for a Framer site and checks that the honest bits
 * actually reach the page — the "no write API" limit, both real routes, and
 * the llms.txt caveat.
 *
 * These are the sentences that stop us promising something Framer cannot do,
 * so they are worth asserting rather than trusting to a props chain.
 *
 * Run against a production build, not `next dev`: a dev server started before
 * the last `prisma generate` holds a stale client and silently drops the new
 * platform columns.
 *   npx next start -p 3210
 *   BASE=http://localhost:3210 npx tsx scripts/test-delivery-step.mts
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const db = new PrismaClient();
const email = `flowtest-${Date.now()}@rankvyze.test`;
const slug = `flowtest-${Date.now()}`;

const user = await db.user.create({
  data: { name: "Flow Test", email, passwordHash: await bcrypt.hash("x".repeat(12), 10), role: "CUSTOMER" },
});
const org = await db.organization.create({
  data: { name: "Flow Test", slug, plan: "TRIAL", members: { create: { userId: user.id, role: "OWNER" } }, onboardingStep: 3 },
});
await db.website.create({
  data: {
    organizationId: org.id, url: "https://framer.com", domain: "framer.com", name: "Framer", isPrimary: true,
    platform: "FRAMER", platformConfidence: 100,
    platformSignals: JSON.stringify(['<meta name="generator" content="Framer">', "framerusercontent.com asset host"]),
  },
});
const token = randomBytes(32).toString("hex");
await db.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 864e5) } });

const html = await fetch(`${BASE}/onboarding`, { headers: { cookie: `rv_session=${token}` } }).then((r) => r.text());
const want = [
  "We detected",
  "Framer",
  "no Framer write API",
  "Invite us to your Framer project",
  "Guided change pack",
  "llms.txt cannot be hosted on a Framer site",
  "Continue to payment",
];
for (const w of want) console.log(`${html.includes(w) ? "PASS" : "MISS"}  ${JSON.stringify(w)}`);
console.log(`\nleaked credential fields on page: ${/type="password"|api[_ ]?key/i.test(html) ? "YES (investigate)" : "none"}`);

await db.$transaction([
  db.session.deleteMany({ where: { userId: user.id } }),
  db.organization.delete({ where: { id: org.id } }),
  db.user.delete({ where: { id: user.id } }),
]);
console.log("cleaned up");
await db.$disconnect();
