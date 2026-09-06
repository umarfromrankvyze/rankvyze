/**
 * Push every public URL to IndexNow.
 *
 * Why this matters more than it looks: ChatGPT's search step is Bing-backed,
 * and Bing is the engine that accepts IndexNow. A page Bing has not indexed
 * cannot be retrieved, summarised or cited — so on a new domain, indexing
 * latency is the actual bottleneck for AI visibility, not content quality.
 * Waiting for an organic crawl can take weeks; this takes seconds.
 *
 * The key is public by design. Ownership is proved by serving it at
 * /<key>.txt, which is why it lives in public/ and is read from there rather
 * than from an environment variable — one source of truth, and no way for the
 * hosted key and the submitted key to drift apart.
 *
 * Run: npx tsx scripts/indexnow.mts [--dry]
 */
import { readdirSync } from "node:fs";

const HOST = "rankvyze.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const dry = process.argv.includes("--dry");

const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{16,128}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file found in public/. Expected <hex>.txt");
const key = keyFile.replace(/\.txt$/, "");

// The sitemap is already the canonical list of what should be indexed, so
// reading it means this can never fall out of step with what we publish.
const xml = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) throw new Error("Sitemap returned no URLs.");

// Verify the key is actually reachable before submitting — IndexNow rejects
// the whole batch on a key it can't fetch, and a 403 there is silent.
const keyCheck = await fetch(`https://${HOST}/${keyFile}`);
const served = keyCheck.ok ? (await keyCheck.text()).trim() : "";
console.log(`key file: ${keyCheck.status} ${served === key ? "matches" : `MISMATCH (served "${served.slice(0, 12)}…")`}`);
if (served !== key) throw new Error("The hosted key does not match the key file. Deploy first.");

console.log(`submitting ${urls.length} URLs from the sitemap${dry ? " (dry run)" : ""}`);
if (dry) {
  urls.slice(0, 5).forEach((u) => console.log(`  ${u}`));
  console.log(`  … and ${urls.length - 5} more`);
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls }),
});

// 200 accepted, 202 accepted but key validation pending. Both are successes.
console.log(`IndexNow: ${res.status} ${res.statusText}`);
if (res.status === 200 || res.status === 202) {
  console.log(`${urls.length} URLs submitted. Bing, Yandex and Seznam share the same submission.`);
} else {
  console.log(await res.text());
  process.exit(1);
}
