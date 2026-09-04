/**
 * The stored-credential path end to end: encrypt a real token into the
 * database, verify it through verifyStored(), ship a change through
 * applyChange(), then remove every trace.
 *
 * The GitHub client test covers the API calls. This covers the part that only
 * breaks in production — encryption, storage, and the decrypt on the way back
 * out — which is exactly the seam a mocked test would skip.
 *
 * Run: GITHUB_TEST_TOKEN=... GITHUB_TEST_REPO=owner/name \
 *      npx tsx --conditions react-server scripts/test-delivery-stored.mts
 */
import { PrismaClient } from "@prisma/client";
import { encryptSecret } from "../src/lib/crypto";
import { applyChange, verifyStored } from "../src/lib/delivery";

const secret = process.env.GITHUB_TEST_TOKEN ?? "";
const repo = process.env.GITHUB_TEST_REPO ?? "";
if (!secret || !repo) throw new Error("Set GITHUB_TEST_TOKEN and GITHUB_TEST_REPO.");

const db = new PrismaClient();
let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const org = await db.organization.create({
  data: { name: "Delivery Test", slug: `deliverytest-${Date.now()}`, plan: "TRIAL" },
});
const website = await db.website.create({
  data: {
    organizationId: org.id, url: "https://rankvyze.com", domain: "rankvyze.com",
    name: "Delivery Test", isPrimary: true, platform: "CODE",
  },
});
const integration = await db.integration.create({
  data: {
    websiteId: website.id, provider: "GITHUB", mode: "API", status: "PENDING",
    config: JSON.stringify({ repo, branch: "main" }),
    secretCiphertext: encryptSecret(secret),
    secretHint: "ghp_…test",
  },
});

const stored = await db.integration.findUniqueOrThrow({ where: { id: integration.id } });
check("token is not stored in plaintext", !(stored.secretCiphertext ?? "").includes(secret));

const verified = await verifyStored(integration.id);
check("verifyStored decrypts and authenticates", verified.ok, verified.error ?? verified.account);
const afterVerify = await db.integration.findUniqueOrThrow({ where: { id: integration.id } });
check("status flipped to CONNECTED", afterVerify.status === "CONNECTED", afterVerify.status);
check("verifiedAt was recorded", afterVerify.verifiedAt !== null);

const stamp = new Date().toISOString();
const applied = await applyChange(website.id, {
  title: "RankVyze stored-credential smoke test",
  summary: `Verifies the stored credential can ship a change. Safe to close. ${stamp}`,
  files: [{ path: ".rankvyze/stored-smoke-test.txt", content: `verified ${stamp}\n` }],
});
check("applyChange ships through the stored credential", applied.ok, applied.error ?? applied.reviewUrl);

// A broken credential must be reflected on the connection, not swallowed.
await db.integration.update({
  where: { id: integration.id },
  data: { secretCiphertext: encryptSecret("ghp_definitelynotvalid00000000000000000") },
});
const broken = await verifyStored(integration.id);
check("a dead credential fails verification", !broken.ok, broken.error);
const afterBroken = await db.integration.findUniqueOrThrow({ where: { id: integration.id } });
check("status flipped to ERROR", afterBroken.status === "ERROR", afterBroken.status);
check("lastError was recorded for the customer", Boolean(afterBroken.lastError));

// --- cleanup ---------------------------------------------------------------
const rb = applied.rollback as { branch?: string; prNumber?: number } | undefined;
if (rb?.prNumber) {
  const r = await fetch(`https://api.github.com/repos/${repo}/pulls/${rb.prNumber}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${secret}`, accept: "application/vnd.github+json" },
    body: JSON.stringify({ state: "closed" }),
  });
  check("cleanup: pull request closed", r.ok);
}
if (rb?.branch) {
  const r = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${rb.branch}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${secret}`, accept: "application/vnd.github+json" },
  });
  check("cleanup: branch deleted", r.ok || r.status === 204);
}
await db.organization.delete({ where: { id: org.id } });
check("cleanup: test rows deleted", true);

console.log(`\n${failures === 0 ? "all checks passed" : `${failures} FAILED`}`);
await db.$disconnect();
process.exit(failures === 0 ? 0 : 1);
