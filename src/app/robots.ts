import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * The AI crawlers are named explicitly rather than left to the `*` rule.
 * Both say "allowed", but an explicit Allow is an unambiguous statement of
 * intent — and it's the first thing our own audit checks for.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
];

/** Signed-in surfaces: no public content, nothing to index. */
const PRIVATE = ["/dashboard/", "/admin/", "/checkout/", "/onboarding/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
