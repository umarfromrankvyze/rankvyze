import { POSTS } from "@/content/blog";
import { SITE, SITE_URL } from "@/lib/site";

/**
 * RSS 2.0 feed for the blog.
 *
 * Cheap syndication surface: aggregators, newsletter tools and a few AI
 * crawlers all read feeds, and it costs one route to be readable by them.
 */

export const dynamic = "force-static";

function escape(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = POSTS.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(post.description)}</description>
      <category>${escape(post.category)}</category>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — Answer Engine Optimization</title>
    <link>${SITE_URL}/blog</link>
    <description>Practical guides on getting recommended by ChatGPT, Perplexity, Gemini and Google AI Overviews.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
