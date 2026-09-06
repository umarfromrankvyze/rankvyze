/**
 * Verifies every sameAs URL before it is allowed to ship.
 *
 * The rule this enforces is one we tell customers: a sameAs pointing at a page
 * that doesn't exist is worse than no sameAs at all. It asserts a corroborating
 * source and then fails to produce one, which is precisely the inconsistency
 * the property exists to resolve — and nobody notices, because structured data
 * has no visible failure mode.
 *
 * Checks each URL resolves, and that the page actually mentions the brand, so
 * a typo'd profile belonging to someone else is caught too.
 *
 * Run: npx tsx scripts/check-sameas.mts
 * Exits non-zero on any failure, so it can gate a deploy.
 */
import { ENTITY } from "../src/content/entity-profile";
import { SITE } from "../src/lib/site";

const TIMEOUT_MS = 15_000;

if (SITE.sameAs.length === 0) {
  console.log("sameAs is empty. Nothing is asserted, which is correct while no profiles exist.");
  console.log("Run `npx tsx scripts/entity-checklist.mts` for what to create.");
  process.exit(0);
}

let failures = 0;

for (const url of SITE.sameAs) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.log(`FAIL  ${url}\n      Not a valid URL.`);
    failures++;
    continue;
  }
  if (parsed.protocol !== "https:") {
    console.log(`FAIL  ${url}\n      Must be https. An http profile link is a downgrade signal.`);
    failures++;
    continue;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      // Some profile hosts serve a stub to unknown agents; identify honestly
      // and accept that a few will still need a manual look.
      headers: { "user-agent": "RankVyzeEntityCheck/1.0 (+https://rankvyze.com)", accept: "text/html,*/*" },
    });

    if (!res.ok) {
      console.log(`FAIL  ${url}\n      Returned ${res.status}. Remove it or fix the profile.`);
      failures++;
      continue;
    }

    const body = await res.text();
    const mentionsBrand = body.toLowerCase().includes(ENTITY.name.toLowerCase());
    // A 200 from a profile that never names us usually means a typo pointing
    // at somebody else's page — the worst possible sameAs.
    if (!mentionsBrand) {
      console.log(`WARN  ${url}\n      Resolves, but the page never mentions "${ENTITY.name}".`);
      console.log(`      Check it is the right profile. Some sites render behind JS, so verify by hand.`);
    } else {
      console.log(`PASS  ${url}`);
    }
  } catch (e) {
    console.log(`FAIL  ${url}\n      ${e instanceof Error ? e.message : "Unreachable."}`);
    failures++;
  } finally {
    clearTimeout(timer);
  }
}

console.log(`\n${SITE.sameAs.length} checked, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
