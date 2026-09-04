/**
 * Proves the GitHub delivery route end to end against a real repository:
 * verify the credential, open a real pull request, then clean up after itself.
 *
 * A mocked version of this would pass while the API shape was wrong. The whole
 * point of the route is that it works against GitHub, so the test talks to
 * GitHub.
 *
 * Run: GITHUB_TEST_TOKEN=... GITHUB_TEST_REPO=owner/name \
 *      npx tsx --conditions react-server scripts/test-delivery-github.mts
 */
import { githubClient } from "../src/lib/delivery/github";
import { encryptSecret, decryptSecret, secretHint } from "../src/lib/crypto";

const secret = process.env.GITHUB_TEST_TOKEN ?? "";
const repo = process.env.GITHUB_TEST_REPO ?? "";
if (!secret || !repo) throw new Error("Set GITHUB_TEST_TOKEN and GITHUB_TEST_REPO.");

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

// --- credential encryption round-trip -------------------------------------
const cipher = encryptSecret(secret);
check("encrypt produces versioned ciphertext", cipher.startsWith("v1."));
check("ciphertext does not contain the plaintext", !cipher.includes(secret));
check("decrypt round-trips", decryptSecret(cipher) === secret);
check("hint is not the secret", !secretHint(secret).includes(secret.slice(4, 20)));
try {
  // Flip a byte in the auth tag: GCM must refuse rather than return garbage.
  const parts = cipher.split(".");
  parts[2] = parts[2].slice(0, -2) + (parts[2].endsWith("A") ? "B" : "A");
  decryptSecret(parts.join("."));
  check("tampered ciphertext is rejected", false, "it decrypted");
} catch {
  check("tampered ciphertext is rejected", true);
}

// --- verify ---------------------------------------------------------------
const target = { websiteUrl: "https://rankvyze.com", config: { repo }, secret };
const ok = await githubClient.verify(target);
check("verify succeeds on a writable repo", ok.ok, ok.error ?? `as ${ok.account}`);
ok.confirmed.forEach((c) => console.log(`        confirmed: ${c}`));

const badRepo = await githubClient.verify({ ...target, config: { repo: "octocat/definitely-not-a-real-repo-xyz" } });
check("verify fails on an inaccessible repo", !badRepo.ok, badRepo.error);
const badToken = await githubClient.verify({ ...target, secret: "ghp_notarealtoken0000000000000000000000" });
check("verify fails on a bad token", !badToken.ok, badToken.error);
check("errors never echo the credential", !JSON.stringify([badRepo, badToken]).includes(secret));

// --- apply: a real pull request -------------------------------------------
const stamp = new Date().toISOString();
const applied = await githubClient.apply(target, {
  title: "RankVyze delivery smoke test",
  summary: `Automated check that the delivery route can open a pull request. Safe to close. ${stamp}`,
  files: [{ path: ".rankvyze/delivery-smoke-test.txt", content: `RankVyze delivery route verified at ${stamp}\n` }],
});
check("apply opens a pull request", applied.ok, applied.error ?? applied.reviewUrl);
check("apply reports the change as not live", applied.ok && applied.live === false);
console.log(`        ${applied.detail}`);

// --- clean up: close the PR and delete the branch --------------------------
const rb = applied.rollback as { branch?: string; prNumber?: number } | undefined;
if (rb?.prNumber) {
  const close = await fetch(`https://api.github.com/repos/${repo}/pulls/${rb.prNumber}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${secret}`, accept: "application/vnd.github+json" },
    body: JSON.stringify({ state: "closed" }),
  });
  check("cleanup: pull request closed", close.ok);
}
if (rb?.branch) {
  const del = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${rb.branch}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${secret}`, accept: "application/vnd.github+json" },
  });
  check("cleanup: branch deleted", del.ok || del.status === 204);
}

console.log(`\n${failures === 0 ? "all checks passed" : `${failures} FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
