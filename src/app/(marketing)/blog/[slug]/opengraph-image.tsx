import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { POSTS, getPost } from "@/content/blog";
import { readingMinutes } from "@/content/blog/types";

/**
 * Per-post social card. Generated from the post itself so a card can never
 * advertise a headline the page no longer has.
 */
export const alt = "RankVyze article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const logo = await readFile(join(process.cwd(), "public/brand/logo-512.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const headline = post?.title ?? "Answer Engine Optimization";
  // Long headlines need to shrink or they overflow the card.
  const fontSize = headline.length > 46 ? 60 : headline.length > 32 ? 70 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain img only */}
          <img src={logoSrc} width={64} height={64} alt="" />
          <span style={{ fontSize: 34, fontWeight: 700, color: "#0b0b0f", letterSpacing: -1 }}>RankVyze</span>
          <span style={{ fontSize: 28, color: "#c4c4cc" }}>/</span>
          <span style={{ fontSize: 28, color: "#8f8f99" }}>{post?.category ?? "Blog"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize,
              fontWeight: 800,
              color: "#0b0b0f",
              letterSpacing: -2.5,
              lineHeight: 1.07,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              width: 96,
              height: 6,
              borderRadius: 99,
              background: "#FC5D2C",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#8f8f99" }}>
          <span style={{ color: "#FC5D2C", fontWeight: 600 }}>rankvyze.com/blog</span>
          {post && (
            <>
              <span>·</span>
              <span>{readingMinutes(post)} min read</span>
            </>
          )}
        </div>
      </div>
    ),
    size,
  );
}
