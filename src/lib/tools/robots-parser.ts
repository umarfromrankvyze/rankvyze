/**
 * robots.txt parsing and rule matching.
 *
 * Deliberately free of `server-only` and of any I/O: these are pure functions
 * over a string, which is what makes them testable directly
 * (scripts/test-robots.mjs). The fetching lives in crawlers.ts.
 *
 * Follows RFC 9309: consecutive User-agent lines share one rule group, the most
 * specific matching group wins, and within it the longest matching path rule
 * wins with Allow breaking a tie.
 */

export interface RobotsGroup {
  agents: string[];
  allow: string[];
  disallow: string[];
}

export function parseRobots(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let expectingAgents = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      // A User-agent line directly after another extends the same group.
      if (!current || !expectingAgents) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      expectingAgents = true;
    } else if (field === "allow" || field === "disallow") {
      if (!current) {
        current = { agents: ["*"], allow: [], disallow: [] };
        groups.push(current);
      }
      expectingAgents = false;
      if (field === "allow") current.allow.push(value);
      else current.disallow.push(value);
    }
  }
  return groups;
}

/**
 * robots.txt globbing: `*` is any run of characters, `$` anchors the end.
 *
 * The trailing `$` has to be recognised *before* escaping, not after. Escaping
 * first turns it into `\$`, which still ends in a `$` character — so a naive
 * `endsWith("$")` check then strips the backslash instead of the anchor and
 * leaves a dangling escape, producing an invalid regex that silently matches
 * nothing. That made rules like `Disallow: /*.pdf$` report as not blocking.
 */
export function matchesRule(pattern: string, path: string) {
  if (pattern === "") return false;
  const anchoredEnd = pattern.endsWith("$");
  const body = anchoredEnd ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  try {
    return new RegExp(`^${escaped}${anchoredEnd ? "$" : ""}`).test(path);
  } catch {
    return false;
  }
}

export interface AllowVerdict {
  allowed: boolean;
  rule: string | null;
  source: "named" | "wildcard" | "no rule";
}

/**
 * Agent matching is on the group's token being a substring of the agent name,
 * per the spec's "case-insensitive substring" rule — `User-agent: ClaudeBot`
 * matches an agent identifying as `ClaudeBot/1.0`.
 *
 * The comparison runs token-inside-agent, not the reverse. Getting this
 * backwards makes `User-agent: *` groups appear to match every named crawler
 * and reports everything as covered by a wildcard.
 */
export function isAllowed(groups: RobotsGroup[], agent: string, path = "/"): AllowVerdict {
  const lower = agent.toLowerCase();
  const specific = groups.filter((g) => g.agents.some((a) => a !== "*" && a.length > 0 && lower.includes(a)));
  const wildcard = groups.filter((g) => g.agents.includes("*"));
  const applicable = specific.length > 0 ? specific : wildcard;
  const source: AllowVerdict["source"] = specific.length > 0 ? "named" : "wildcard";

  if (applicable.length === 0) return { allowed: true, rule: null, source: "no rule" };

  let best: { allowed: boolean; rule: string; length: number } | null = null;

  for (const group of applicable) {
    for (const rule of group.disallow) {
      if (matchesRule(rule, path) && (!best || rule.length > best.length)) {
        best = { allowed: false, rule: `Disallow: ${rule}`, length: rule.length };
      }
    }
    for (const rule of group.allow) {
      // >= so an equally specific Allow wins the tie, per the standard.
      if (matchesRule(rule, path) && (!best || rule.length >= best.length)) {
        best = { allowed: true, rule: `Allow: ${rule}`, length: rule.length };
      }
    }
  }

  if (!best) return { allowed: true, rule: null, source };
  return { allowed: best.allowed, rule: best.rule, source };
}
