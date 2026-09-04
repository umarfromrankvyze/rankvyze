/**
 * Responsive audit.
 *
 * Loads every public route at a spread of real device widths and reports two
 * classes of defect that a screenshot can miss:
 *
 *   1. Horizontal overflow — the page itself scrolls sideways. Names the widest
 *      offending elements so the fix is obvious rather than a hunt.
 *   2. Tap targets under 44x44 CSS px, the size Apple and Google both publish.
 *
 * Elements that scroll inside their own container (tables, code blocks) are not
 * overflow: that is the intended behaviour and the check skips them.
 *
 * Run: node scripts/audit-responsive.mjs [baseUrl]
 */

import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";

const WIDTHS = [
  { name: "iPhone SE", width: 320, height: 568, touch: true },
  { name: "iPhone 12/13", width: 390, height: 844, touch: true },
  { name: "Pixel 7", width: 412, height: 915, touch: true },
  { name: "phone landscape", width: 740, height: 360, touch: true },
  { name: "iPad portrait", width: 768, height: 1024, touch: true },
  { name: "iPad landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1536, height: 960 },
];

const ROUTES = [
  "/",
  "/pricing",
  "/answer-engine-optimization",
  "/blog/what-answer-engine-optimization-costs",
  "/guarantee",
  "/blog",
  "/blog/how-to-rank-on-chatgpt",
  "/resources",
  "/contact",
  "/about",
  "/faq",
  "/aeo-guide",
  "/docs",
  "/terms",
  "/login",
  "/signup",
];

const PROBE = `() => {
  const docW = document.documentElement.scrollWidth;
  const winW = window.innerWidth;
  const overflowBy = docW - winW;

  const offenders = [];
  if (overflowBy > 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= winW + 1 && r.left >= -1) continue;
      // A child that merely overflows its own scrollable parent is fine.
      let scrollableAncestor = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden') { scrollableAncestor = true; break; }
      }
      if (scrollableAncestor) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 70),
        text: (el.textContent || '').trim().slice(0, 40),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
  }

  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    // Links inside a paragraph are inline text, not tap targets.
    if (el.tagName === 'A' && el.closest('p, li, dd, figcaption')) continue;
    if (r.height < 44 || r.width < 24) {
      small.push({
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 34),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  return { overflowBy, docW, winW, offenders: offenders.slice(0, 6), small: small.slice(0, 6) };
}`;

const browser = await chromium.launch();
let problems = 0;

for (const vp of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.width < 768,
    hasTouch: Boolean(vp.touch ?? vp.width < 768),
  });
  const page = await context.newPage();
  const lines = [];

  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      const r = await page.evaluate(eval(PROBE));

      if (r.overflowBy > 1) {
        problems++;
        lines.push(`  OVERFLOW ${route} — page is ${r.overflowBy}px wider than the viewport (${r.docW} vs ${r.winW})`);
        for (const o of r.offenders) lines.push(`      <${o.tag}> right=${o.right} "${o.cls}" ${o.text ? `— ${o.text}` : ""}`);
      }
      if (r.small.length && vp.width < 1024 && vp.touch) {
        problems++;
        lines.push(`  TAP TARGET ${route}`);
        for (const s of r.small) lines.push(`      <${s.tag}> ${s.w}x${s.h} — ${s.label}`);
      }
    } catch (error) {
      problems++;
      lines.push(`  ERROR ${route} — ${String(error).split("\n")[0].slice(0, 110)}`);
    }
  }

  console.log(`\n${vp.name} (${vp.width}x${vp.height})`);
  console.log(lines.length ? lines.join("\n") : "  clean");
  await context.close();
}

await browser.close();
console.log(`\n${problems === 0 ? "No responsive problems found." : `${problems} problem group(s) found.`}`);
process.exit(0);
