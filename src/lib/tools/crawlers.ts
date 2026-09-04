import "server-only";
import { ToolError, USER_AGENT, assertPublicHost, fetchPage, normalizeUrl } from "./http";
import { isAllowed, parseRobots } from "./robots-parser";

/**
 * AI crawler checker.
 *
 * Two independent questions, and most tools only answer the first:
 *
 *  1. What does robots.txt say? A published request, parsed properly —
 *     including the wildcard group, which is how most sites block AI crawlers
 *     without ever naming one.
 *  2. What actually happens when that crawler calls? A CDN or WAF can return
 *     403 to an AI user agent regardless of what robots.txt permits, and
 *     several enable exactly that by default. A permissive file plus an edge
 *     block is the most common invisible failure there is.
 */

export interface CrawlerAgent {
  id: string;
  name: string;
  operator: string;
  purpose: string;
  /** What being blocked actually costs you. */
  cost: string;
  /** Probe agents that identify as this crawler? Only for ones with a real UA. */
  probe?: string;
}

export const AI_CRAWLERS: CrawlerAgent[] = [
  {
    id: "GPTBot",
    name: "GPTBot",
    operator: "OpenAI",
    purpose: "Crawls to train future models",
    cost: "Less likely to be known by ChatGPT by default",
    probe: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
  },
  {
    id: "OAI-SearchBot",
    name: "OAI-SearchBot",
    operator: "OpenAI",
    purpose: "Indexes for ChatGPT search results",
    cost: "Removed from ChatGPT's search-backed answers",
    probe: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
  },
  {
    id: "ChatGPT-User",
    name: "ChatGPT-User",
    operator: "OpenAI",
    purpose: "Fetches a page a user asked about",
    cost: "Users can't pull your page into a conversation",
  },
  {
    id: "PerplexityBot",
    name: "PerplexityBot",
    operator: "Perplexity",
    purpose: "Indexes for Perplexity answers",
    cost: "Removed from general Perplexity answers",
    probe: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot",
  },
  {
    id: "Perplexity-User",
    name: "Perplexity-User",
    operator: "Perplexity",
    purpose: "Fetches a page on user request",
    cost: "Users can't pull your page in directly",
  },
  {
    id: "ClaudeBot",
    name: "ClaudeBot",
    operator: "Anthropic",
    purpose: "Crawls for model training",
    cost: "Less likely to be known by Claude",
    probe: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com",
  },
  {
    id: "Claude-SearchBot",
    name: "Claude-SearchBot",
    operator: "Anthropic",
    purpose: "Indexes for Claude's web search",
    cost: "Removed from Claude's search results",
  },
  {
    id: "Claude-User",
    name: "Claude-User",
    operator: "Anthropic",
    purpose: "Fetches on user request",
    cost: "Users can't pull your page into Claude",
  },
  {
    id: "Google-Extended",
    name: "Google-Extended",
    operator: "Google",
    purpose: "Control token for Gemini and grounding — not a crawler",
    cost: "Content excluded from Gemini; Search ranking unaffected",
  },
  {
    id: "Googlebot",
    name: "Googlebot",
    operator: "Google",
    purpose: "Search crawling, which AI Overviews are built on",
    cost: "Removed from Google Search entirely",
  },
  {
    id: "Bingbot",
    name: "Bingbot",
    operator: "Microsoft",
    purpose: "Search index behind Copilot",
    cost: "Removed from Bing and Copilot",
  },
  {
    id: "Applebot-Extended",
    name: "Applebot-Extended",
    operator: "Apple",
    purpose: "Control token for Apple Intelligence training",
    cost: "Excluded from Apple's models",
  },
];

export interface CrawlerVerdict extends CrawlerAgent {
  allowed: boolean;
  rule: string | null;
  source: "named" | "wildcard" | "no rule";
  /** Result of actually calling the site as this crawler. */
  liveStatus: number | null;
  liveBlocked: boolean;
}

export interface CrawlerReport {
  url: string;
  robotsUrl: string;
  robotsFound: boolean;
  robotsStatus: number;
  robotsText: string;
  sitemaps: string[];
  crawlers: CrawlerVerdict[];
  blockedCount: number;
  /** Reachable per robots.txt but refused at the edge — the invisible failure. */
  edgeBlocked: string[];
}

export async function checkCrawlers(rawUrl: string): Promise<CrawlerReport> {
  const url = normalizeUrl(rawUrl);
  await assertPublicHost(url.hostname);

  const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
  const robots = await fetchPage(robotsUrl, { accept: "text/plain,*/*;q=0.8" });

  // A 404 page returning 200 with HTML in it is not a robots.txt. Treating it
  // as one would report imaginary rules.
  const looksLikeHtml = /^\s*<(!doctype|html)/i.test(robots.body);
  const robotsFound = robots.ok && robots.body.trim().length > 0 && !looksLikeHtml;
  const text = robotsFound ? robots.body : "";

  const groups = parseRobots(text);
  const sitemaps = [...text.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);

  const crawlers: CrawlerVerdict[] = AI_CRAWLERS.map((agent) => {
    const verdict = isAllowed(groups, agent.id, url.pathname || "/");
    return { ...agent, ...verdict, liveStatus: null, liveBlocked: false };
  });

  // Probe the handful with a real user agent, in parallel. Failures here are
  // informational — a probe that errors reports null rather than a false block.
  const probes = crawlers.filter((c) => c.probe);
  await Promise.all(
    probes.map(async (crawler) => {
      try {
        const res = await fetchPage(url.toString(), { userAgent: crawler.probe });
        crawler.liveStatus = res.status;
        // 401/403/429 to a named AI agent, when a normal agent gets through,
        // is edge blocking. 404 is just a missing page.
        crawler.liveBlocked = res.status === 401 || res.status === 403 || res.status === 429;
      } catch {
        crawler.liveStatus = null;
      }
    }),
  );

  const edgeBlocked = crawlers.filter((c) => c.allowed && c.liveBlocked).map((c) => c.name);

  return {
    url: url.toString(),
    robotsUrl,
    robotsFound,
    robotsStatus: robots.status,
    robotsText: text.slice(0, 8000),
    sitemaps,
    crawlers,
    blockedCount: crawlers.filter((c) => !c.allowed).length,
    edgeBlocked,
  };
}

export { ToolError, USER_AGENT };
