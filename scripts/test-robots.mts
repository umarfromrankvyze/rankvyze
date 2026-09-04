/**
 * Tests for the robots.txt parser.
 *
 * Written after the AI crawler checker reported "no AI crawler is blocked" for
 * a site that visibly blocks GPTBot. Pure functions with fixtures catch that in
 * a second; driving the UI to find it takes minutes and can show stale state.
 *
 * Run: npx tsx scripts/test-robots.mts
 */

import { isAllowed, parseRobots } from "../src/lib/tools/robots-parser";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (ok) passed++;
  else {
    failed++;
    console.error(`  FAIL  ${name}\n        expected ${expected}, got ${actual}`);
    return;
  }
  console.log(`  ok    ${name}`);
}

// --- the case that exposed the bug ---------------------------------------
console.log("\nNamed crawler blocked (the NYT shape)");
{
  const robots = `
User-agent: anthropic-ai
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
Disallow: /admin
`;
  const groups = parseRobots(robots);
  check("GPTBot is blocked", isAllowed(groups, "GPTBot", "/").allowed, false);
  check("ClaudeBot is not blocked (not named)", isAllowed(groups, "ClaudeBot", "/").allowed, true);
  check("PerplexityBot falls through to wildcard", isAllowed(groups, "PerplexityBot", "/").allowed, true);
  check("GPTBot verdict cites the rule", isAllowed(groups, "GPTBot", "/").rule, "Disallow: /");
  check("GPTBot verdict source is named", isAllowed(groups, "GPTBot", "/").source, "named");
}

// --- wildcard blocking, which is how most sites do it by accident --------
console.log("\nWildcard blocks everything");
{
  const groups = parseRobots("User-agent: *\nDisallow: /");
  check("GPTBot blocked via wildcard", isAllowed(groups, "GPTBot", "/").allowed, false);
  check("source is wildcard", isAllowed(groups, "GPTBot", "/").source, "wildcard");
}

// --- consecutive user-agent lines share a group -------------------------
console.log("\nConsecutive User-agent lines share one group");
{
  const groups = parseRobots("User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n");
  check("one group parsed", groups.length, 1);
  check("GPTBot blocked", isAllowed(groups, "GPTBot", "/").allowed, false);
  check("ClaudeBot blocked too", isAllowed(groups, "ClaudeBot", "/").allowed, false);
}

// --- longest match wins, Allow breaks ties ------------------------------
console.log("\nLongest match wins");
{
  const groups = parseRobots("User-agent: *\nDisallow: /\nAllow: /blog\n");
  check("/blog allowed by the longer rule", isAllowed(groups, "GPTBot", "/blog").allowed, true);
  check("/private still blocked", isAllowed(groups, "GPTBot", "/private").allowed, false);
}

// --- substring matching, per the spec ------------------------------------
console.log("\nAgent token matches as a substring");
{
  const groups = parseRobots("User-agent: ClaudeBot\nDisallow: /\n");
  check("ClaudeBot/1.0 matches ClaudeBot", isAllowed(groups, "ClaudeBot/1.0", "/").allowed, false);
  check("Claude-SearchBot does NOT match ClaudeBot", isAllowed(groups, "Claude-SearchBot", "/").allowed, true);
}

// --- empty and absent files ---------------------------------------------
console.log("\nEmpty or absent robots.txt");
{
  check("no rules means allowed", isAllowed(parseRobots(""), "GPTBot", "/").allowed, true);
  check("source reported as no rule", isAllowed(parseRobots(""), "GPTBot", "/").source, "no rule");
  check("comments ignored", parseRobots("# just a comment\n").length, 0);
}

// --- glob and anchors ----------------------------------------------------
console.log("\nGlobs and anchors");
{
  const groups = parseRobots("User-agent: *\nDisallow: /*.pdf$\n");
  check("/doc.pdf blocked", isAllowed(groups, "GPTBot", "/doc.pdf").allowed, false);
  check("/doc.pdf.html not blocked", isAllowed(groups, "GPTBot", "/doc.pdf.html").allowed, true);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
