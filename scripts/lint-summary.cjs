/* Compact ESLint JSON summariser: node scripts/lint-summary.cjs <report.json> */
const path = require("node:path");
const file = process.argv[2] || ".lint.json";
const report = require(path.resolve(file));

let errors = 0;
let warnings = 0;

for (const entry of report) {
  if (!entry.messages.length) continue;
  const rel = path.relative(process.cwd(), entry.filePath).split(path.sep).join("/");
  for (const m of entry.messages) {
    if (m.severity === 2) errors++;
    else warnings++;
    const line = String(m.message).split("\n")[0].slice(0, 95);
    console.log(`${m.severity === 2 ? "E" : "W"} ${rel}:${m.line} ${m.ruleId ?? ""} — ${line}`);
  }
}
console.log(`errors ${errors} warnings ${warnings}`);
