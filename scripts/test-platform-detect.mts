/**
 * Platform detection, checked against real live sites.
 *
 * This one hits the network on purpose. Detection is a claim about what other
 * people's sites actually serve, and a fixture only proves we still parse the
 * fixture. When a platform changes its markup we want to find out here, not
 * from a customer told their Framer site is WordPress.
 *
 * Run: npx tsx --conditions react-server scripts/test-platform-detect.mts
 * (the condition is needed because src/lib/platform.ts imports server-only)
 */

import { detectPlatform } from "../src/lib/platform";

const TARGETS = [
  ["framer.com", "FRAMER"],
  ["webflow.com", "WEBFLOW"],
  ["wordpress.org", "WORDPRESS"],
  ["techcrunch.com", "WORDPRESS"],
  ["wix.com", "WIX"],
  ["allbirds.com", "SHOPIFY"],
  ["squarespace.com", "SQUARESPACE"],
  ["vercel.com", "CODE"],
  ["rankvyze.com", "CODE"],
];

let pass = 0;
for (const [host, expected] of TARGETS) {
  try {
    const d = await detectPlatform(host);
    const ok = d.platform === expected;
    if (ok) pass++;
    console.log(
      `${ok ? "PASS" : "MISS"}  ${host.padEnd(20)} -> ${d.platform.padEnd(22)} ${String(d.confidence).padStart(3)}%  (expected ${expected})`,
    );
    if (!ok) console.log(`        signals: ${d.signals.map((s) => s.label).join(" | ") || "none"}`);
  } catch (e) {
    console.log(`ERR   ${host.padEnd(20)} -> ${(e as Error).message}`);
  }
}
console.log(`\n${pass}/${TARGETS.length} correct`);
