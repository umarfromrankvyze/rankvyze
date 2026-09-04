import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Shared fetching for the free tools.
 *
 * Every tool takes a URL from an anonymous visitor and fetches it from our
 * server, which is textbook SSRF exposure: without a guard, someone can point
 * a "checker" at 169.254.169.254 and read cloud instance metadata through our
 * response. `assertPublicHost` resolves the name first and refuses anything in
 * private, loopback, link-local or carrier-grade NAT space.
 *
 * Extracted from src/lib/scanner.ts, which had the only copy. One guard used by
 * every tool is the point — a second implementation is a second thing to get
 * wrong.
 */

export class ToolError extends Error {}

const MAX_BYTES = 2_000_000;
export const TIMEOUT_MS = 12_000;

/** Honest identification. Some sites legitimately vary output by agent. */
export const USER_AGENT = "RankVyzeTools/1.0 (+https://rankvyze.com/tools)";

/** Accepts "example.com", adds https, and rejects anything that isn't http(s). */
export function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new ToolError("Enter a website address.");
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new ToolError("That doesn't look like a valid address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ToolError("Only http and https addresses can be checked.");
  }
  if (!url.hostname.includes(".")) throw new ToolError("Enter a full domain, like example.com.");
  return url;
}

export async function assertPublicHost(hostname: string) {
  const blocked = ["localhost", "metadata.google.internal"];
  if (blocked.includes(hostname.toLowerCase()) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new ToolError("That address can't be checked.");
  }

  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new ToolError("We couldn't resolve that domain. Check the spelling and try again.");

  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new ToolError("That address can't be checked.");
  }
}

export function isPrivateAddress(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

export interface FetchedPage {
  ok: boolean;
  status: number;
  body: string;
  /** Final URL after redirects — tools report it so a redirect isn't invisible. */
  finalUrl: string;
  headers: Headers;
  elapsedMs: number;
}

/**
 * Fetch with a byte ceiling and a timeout.
 *
 * The body is read through the stream reader rather than `res.text()` so a
 * hostile or merely enormous response can't exhaust memory — we stop at
 * MAX_BYTES regardless of what Content-Length claimed.
 */
export async function fetchPage(
  url: string,
  options: { userAgent?: string; accept?: string; signal?: AbortSignal } = {},
): Promise<FetchedPage> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const signal = options.signal ?? controller.signal;

  try {
    const res = await fetch(url, {
      signal,
      redirect: "follow",
      headers: {
        "user-agent": options.userAgent ?? USER_AGENT,
        accept: options.accept ?? "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    const reader = res.body?.getReader();
    if (!reader) {
      return { ok: res.ok, status: res.status, body: "", finalUrl: res.url || url, headers: res.headers, elapsedMs: Date.now() - started };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    await reader.cancel().catch(() => {});

    return {
      ok: res.ok,
      status: res.status,
      body: new TextDecoder().decode(Buffer.concat(chunks)),
      finalUrl: res.url || url,
      headers: res.headers,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ToolError("That site took too long to respond. Try again in a moment.");
    }
    throw new ToolError("We couldn't reach that site. Check the address and try again.");
  } finally {
    clearTimeout(timer);
  }
}

/** Normalize, guard, fetch. The opening move of every tool. */
export async function fetchChecked(rawUrl: string, options?: Parameters<typeof fetchPage>[1]) {
  const url = normalizeUrl(rawUrl);
  await assertPublicHost(url.hostname);
  const page = await fetchPage(url.toString(), options);
  return { url, page };
}

// --- small HTML helpers, shared by several tools -------------------------

export function tagText(html: string, name: string) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(html);
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) : null;
}

export function metaContent(html: string, nameOrProperty: string) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${nameOrProperty}["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${nameOrProperty}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m) return decodeEntities(m[1].trim());
  }
  return null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1]?.toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/** Text a crawler sees without running JavaScript. */
export function serverRenderedText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Every JSON-LD block, flattened through @graph. */
export function jsonLdNodes(html: string): { nodes: Record<string, unknown>[]; malformed: number } {
  const nodes: Record<string, unknown>[] = [];
  let malformed = 0;
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed: unknown = JSON.parse(m[1].trim());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const graph = record["@graph"];
        if (Array.isArray(graph)) {
          for (const g of graph) if (g && typeof g === "object") nodes.push(g as Record<string, unknown>);
        } else {
          nodes.push(record);
        }
      }
    } catch {
      malformed++;
    }
  }
  return { nodes, malformed };
}
