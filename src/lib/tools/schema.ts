import "server-only";
import { ToolError, fetchChecked, jsonLdNodes } from "./http";

/**
 * Structured data checker.
 *
 * Reports what is on the page and what a search or answer engine would look for
 * and not find. It deliberately does not claim to "validate" against the full
 * schema.org vocabulary — that is what validator.schema.org is for, and we link
 * to it. What this answers is the question that actually matters for AEO: can a
 * machine tell what this business is from the markup?
 */

export interface SchemaFinding {
  type: string;
  /** Properties present on the node, for the detail view. */
  keys: string[];
  /** Properties an engine looks for on this type that are absent. */
  missing: string[];
  id: string | null;
}

export interface SchemaReport {
  url: string;
  finalUrl: string;
  blocks: number;
  malformed: number;
  findings: SchemaFinding[];
  types: string[];
  /** The AEO-critical checks, in priority order. */
  checks: { key: string; label: string; status: "pass" | "warn" | "fail"; detail: string }[];
  serverRendered: boolean;
}

/**
 * Properties worth having per type.
 *
 * Not schema.org's `required` list — most of these are optional in the
 * vocabulary. They are the ones that carry identity, which is what an answer
 * engine reads the markup for.
 */
const EXPECTED: Record<string, string[]> = {
  Organization: ["name", "url", "logo", "description", "sameAs"],
  LocalBusiness: ["name", "url", "address", "telephone", "openingHours"],
  Service: ["name", "serviceType", "provider", "areaServed"],
  Product: ["name", "description", "offers"],
  Article: ["headline", "datePublished", "author", "publisher"],
  BlogPosting: ["headline", "datePublished", "author", "publisher"],
  FAQPage: ["mainEntity"],
  WebSite: ["url", "name"],
  BreadcrumbList: ["itemListElement"],
  Person: ["name"],
};

function typeOf(node: Record<string, unknown>): string {
  const t = node["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && typeof t[0] === "string") return t[0];
  return "Unknown";
}

export async function checkSchema(rawUrl: string): Promise<SchemaReport> {
  const { url, page } = await fetchChecked(rawUrl);
  if (!page.ok) throw new ToolError(`That page returned HTTP ${page.status}. Check the address and try again.`);

  const { nodes, malformed } = jsonLdNodes(page.body);

  const findings: SchemaFinding[] = nodes.map((node) => {
    const type = typeOf(node);
    const keys = Object.keys(node).filter((k) => !k.startsWith("@"));
    const expected = EXPECTED[type] ?? [];
    const missing = expected.filter((k) => {
      const v = node[k];
      return v === undefined || v === null || (Array.isArray(v) && v.length === 0) || v === "";
    });
    return { type, keys, missing, id: typeof node["@id"] === "string" ? (node["@id"] as string) : null };
  });

  const types = [...new Set(findings.map((f) => f.type))];
  const has = (t: string) => types.includes(t);

  const checks: SchemaReport["checks"] = [];

  checks.push(
    nodes.length === 0
      ? { key: "present", label: "Structured data present", status: "fail", detail: "No JSON-LD found. An engine has to infer everything about this business from prose." }
      : { key: "present", label: "Structured data present", status: "pass", detail: `${nodes.length} node${nodes.length === 1 ? "" : "s"} across ${types.length} type${types.length === 1 ? "" : "s"}.` },
  );

  if (malformed > 0) {
    checks.push({ key: "valid", label: "JSON parses", status: "fail", detail: `${malformed} block${malformed === 1 ? "" : "s"} could not be parsed. Malformed JSON-LD is ignored entirely.` });
  }

  const org = findings.find((f) => f.type === "Organization" || f.type === "LocalBusiness");
  checks.push(
    org
      ? org.missing.length === 0
        ? { key: "identity", label: "Business identity", status: "pass", detail: `${org.type} is complete.` }
        : { key: "identity", label: "Business identity", status: "warn", detail: `${org.type} is present but missing: ${org.missing.join(", ")}.` }
      : { key: "identity", label: "Business identity", status: "fail", detail: "No Organization or LocalBusiness node. This is the block that tells an engine who you are." },
  );

  const sameAs = nodes.find((n) => Array.isArray(n.sameAs) && (n.sameAs as unknown[]).length > 0);
  checks.push(
    sameAs
      ? { key: "sameas", label: "sameAs profiles", status: "pass", detail: `${(sameAs.sameAs as unknown[]).length} linked profiles — this is how an engine corroborates you.` }
      : { key: "sameas", label: "sameAs profiles", status: "warn", detail: "No sameAs array. Nothing connects this domain to profiles an engine already knows." },
  );

  checks.push(
    has("Service") || has("Product")
      ? { key: "offering", label: "What you sell", status: "pass", detail: `${has("Service") ? "Service" : "Product"} markup found.` }
      : { key: "offering", label: "What you sell", status: "warn", detail: "No Service or Product node. These answer “best X for Y” questions." },
  );

  checks.push(
    has("FAQPage")
      ? { key: "faq", label: "FAQ markup", status: "pass", detail: "FAQPage found — the most quotable format there is." }
      : { key: "faq", label: "FAQ markup", status: "warn", detail: "No FAQPage. Question and answer pairs are what answer engines lift verbatim." },
  );

  const linked = findings.some((f) => f.id) && nodes.some((n) => JSON.stringify(n).includes('"@id"'));
  checks.push(
    linked
      ? { key: "linked", label: "Nodes are @id-linked", status: "pass", detail: "Blocks reference each other, so a parser resolves one entity rather than several." }
      : { key: "linked", label: "Nodes are @id-linked", status: "warn", detail: "No @id references. Unlinked blocks read as unrelated things rather than one business described several ways." },
  );

  // Schema injected after hydration is invisible to crawlers that don't run JS,
  // and this tool reads the same raw HTML they do — so finding any at all here
  // is itself the proof.
  const serverRendered = /application\/ld\+json/i.test(page.body);

  return {
    url: url.toString(),
    finalUrl: page.finalUrl,
    blocks: nodes.length,
    malformed,
    findings,
    types,
    checks,
    serverRendered,
  };
}
