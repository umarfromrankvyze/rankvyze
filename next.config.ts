import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  /**
   * Retired URLs.
   *
   * /best-ai-seo-tools and /ai-visibility-tools were built independently and
   * competed for the same queries, splitting the authority of both. Merged
   * into the latter; this is permanent so Google consolidates rather than
   * keeping two entries alive.
   */
  async redirects() {
    return [{ source: "/best-ai-seo-tools", destination: "/ai-visibility-tools", permanent: true }];
  },
};

export default nextConfig;
