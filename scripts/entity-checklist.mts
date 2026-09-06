/**
 * Prints the profiles to create and the exact copy to paste into each.
 *
 * The copy matters more than the count. An engine confirms an entity by
 * finding agreement across independent sources — so four profiles saying the
 * same sentence is a stronger signal than nine profiles each improvising. That
 * is why this prints the text rather than telling you to write some.
 *
 * Run: npx tsx scripts/entity-checklist.mts
 */
import { ENTITY, PROFILE_TARGETS } from "../src/content/entity-profile";
import { SITE } from "../src/lib/site";

const done = new Set(SITE.sameAs.map((u) => new URL(u).hostname.replace(/^www\./, "")));
const line = (n = 74) => console.log("─".repeat(n));

console.log("\nCANONICAL COPY — paste verbatim, do not improvise per site\n");
line();
console.log(`Name            ${ENTITY.name}`);
console.log(`URL             ${ENTITY.url}`);
console.log(`Email           ${ENTITY.email}`);
console.log(`Founded         ${ENTITY.foundingDate}`);
console.log(`Categories      ${ENTITY.categories.join(" · ")}`);
console.log(`Logo            ${ENTITY.logo}`);
line();
console.log(`\nTagline (<60 chars, ${ENTITY.tagline.length} used)\n  ${ENTITY.tagline}`);
console.log(`\nShort — one sentence\n  ${ENTITY.short}`);
console.log(`\nMedium — profile "about" fields\n${wrap(ENTITY.medium, 74, "  ")}`);
console.log(`\nLong — full description fields\n${wrap(ENTITY.long, 74, "  ")}`);

console.log("\n\nPROFILES TO CREATE\n");
for (const priority of [1, 2, 3] as const) {
  const group = PROFILE_TARGETS.filter((t) => t.priority === priority);
  if (group.length === 0) continue;
  console.log(
    priority === 1
      ? "── Do these four first. They carry most of the corroboration. ──"
      : priority === 2
        ? "── Worth having. Not what decides whether you get named. ──"
        : "── Only if they genuinely apply. ──",
  );
  for (const t of group) {
    const hostname = new URL(t.url).hostname.replace(/^www\./, "");
    const linked = [...done].some((d) => d.includes(hostname.split(".")[0]));
    console.log(`\n  ${linked ? "[x]" : "[ ]"} ${t.name}`);
    console.log(`      ${t.url}`);
    console.log(`      Paste the ${t.use} description.`);
    console.log(wrap(t.why, 68, "      "));
  }
  console.log("");
}

console.log(`\nsameAs currently holds ${SITE.sameAs.length} URL${SITE.sameAs.length === 1 ? "" : "s"}.`);
if (SITE.sameAs.length === 0) {
  console.log("Nothing is asserted in the structured data yet, which is correct while");
  console.log("no profiles exist — an unresolvable sameAs is worse than none.");
}
console.log("\nWhen a profile is live, add its URL to SITE.sameAs in src/lib/site.ts,");
console.log("then run: npx tsx scripts/check-sameas.mts\n");

function wrap(text: string, width: number, indent: string) {
  return text
    .split("\n")
    .map((para) => {
      if (!para.trim()) return "";
      const words = para.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const w of words) {
        if ((current + " " + w).trim().length > width) {
          lines.push(indent + current.trim());
          current = w;
        } else {
          current += ` ${w}`;
        }
      }
      if (current.trim()) lines.push(indent + current.trim());
      return lines.join("\n");
    })
    .join("\n");
}
