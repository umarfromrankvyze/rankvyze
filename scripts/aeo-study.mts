/**
 * Runs the RankVyze scanner across a fixed corpus of real websites and writes
 * an aggregate result file.
 *
 * The point is to have something original to publish. Every other page in this
 * category explains AEO; almost none of them measure anything. A dataset with
 * a named, reproducible corpus and a published methodology is the sort of thing
 * an answer engine cites, and being cited is the whole objective.
 *
 * Two deliberate constraints:
 *
 *  - Results are aggregated. Per-site scores are never published, because
 *    "these named companies fail check X" is a different and worse kind of
 *    page, and nobody consented to being an example.
 *  - The corpus is published in full so anyone can re-run it. A statistic
 *    nobody can reproduce is an assertion.
 *
 * Politeness: one page plus robots.txt and llms.txt per site, a self-
 * identifying user agent, a small concurrency limit and a pause between
 * batches. This is lighter than a single visit from a real browser.
 *
 * Run: npx tsx --conditions react-server scripts/aeo-study.mts
 */
import { writeFileSync } from "node:fs";
import { scanUrl, type ScanResult } from "../src/lib/scanner";
import { CORPUS } from "../src/content/study-corpus";

const CONCURRENCY = 6;
const PAUSE_MS = 400;

interface Row {
  domain: string;
  sector: string;
  score: number;
  checks: { key: string; status: string }[];
}

const rows: Row[] = [];
const failures: { domain: string; reason: string }[] = [];

async function scanOne(entry: { domain: string; sector: string }) {
  try {
    const result: ScanResult = await scanUrl(`https://${entry.domain}`);
    rows.push({
      domain: entry.domain,
      sector: entry.sector,
      score: result.score,
      checks: result.checks.map((c) => ({ key: c.key, status: c.status })),
    });
    process.stdout.write(`  ${String(result.score).padStart(3)}  ${entry.domain}\n`);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown";
    failures.push({ domain: entry.domain, reason });
    process.stdout.write(`  ---  ${entry.domain} — ${reason}\n`);
  }
}

console.log(`Scanning ${CORPUS.length} sites at concurrency ${CONCURRENCY}…\n`);

for (let i = 0; i < CORPUS.length; i += CONCURRENCY) {
  await Promise.all(CORPUS.slice(i, i + CONCURRENCY).map(scanOne));
  if (i + CONCURRENCY < CORPUS.length) await new Promise((r) => setTimeout(r, PAUSE_MS));
}

// ---- aggregate ------------------------------------------------------------
const checkKeys = [...new Set(rows.flatMap((r) => r.checks.map((c) => c.key)))];
const byCheck = checkKeys.map((key) => {
  const all = rows.map((r) => r.checks.find((c) => c.key === key)?.status).filter(Boolean) as string[];
  const pass = all.filter((s) => s === "pass").length;
  const warn = all.filter((s) => s === "warn").length;
  const fail = all.filter((s) => s === "fail").length;
  return { key, pass, warn, fail, total: all.length, passRate: Math.round((pass / all.length) * 100) };
});

const scores = rows.map((r) => r.score).sort((a, b) => a - b);
const median = scores.length % 2 ? scores[(scores.length - 1) / 2] : Math.round((scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2);
const mean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

const bands = [
  { label: "0–39", min: 0, max: 39 },
  { label: "40–59", min: 40, max: 59 },
  { label: "60–79", min: 60, max: 79 },
  { label: "80–100", min: 80, max: 100 },
].map((b) => ({ ...b, count: scores.filter((s) => s >= b.min && s <= b.max).length }));

const sectors = [...new Set(rows.map((r) => r.sector))].map((sector) => {
  const s = rows.filter((r) => r.sector === sector).map((r) => r.score);
  return { sector, n: s.length, median: [...s].sort((a, b) => a - b)[Math.floor(s.length / 2)] };
});

const out = {
  ranAt: new Date().toISOString(),
  attempted: CORPUS.length,
  scanned: rows.length,
  failed: failures.length,
  failures,
  mean,
  median,
  min: scores[0],
  max: scores[scores.length - 1],
  bands,
  byCheck: byCheck.sort((a, b) => a.passRate - b.passRate),
  sectors: sectors.sort((a, b) => b.median - a.median),
};

writeFileSync("src/content/aeo-benchmark-result.json", JSON.stringify(out, null, 2));

console.log(`\nScanned ${rows.length}/${CORPUS.length}. Median ${median}, mean ${mean}, range ${out.min}–${out.max}.`);
console.log("\nPass rate by check (worst first):");
for (const c of out.byCheck) console.log(`  ${String(c.passRate).padStart(3)}%  ${c.key}  (pass ${c.pass} / warn ${c.warn} / fail ${c.fail})`);
console.log("\nWritten to src/content/aeo-benchmark-result.json");
