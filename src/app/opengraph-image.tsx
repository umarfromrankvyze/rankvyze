import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES } from "@/lib/guarantee";

/**
 * Social card. Generated rather than shipped as a static PNG so the guarantee
 * terms in the image can't drift from the ones in the product.
 */
export const alt = "RankVyze — We rank your business in ChatGPT, Gemini and Claude";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-512.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain img only */}
          <img src={logoSrc} width={72} height={72} alt="" />
          <span style={{ fontSize: 40, fontWeight: 700, color: "#0b0b0f", letterSpacing: -1 }}>RankVyze</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#0b0b0f", letterSpacing: -2.5, lineHeight: 1.08 }}>
            We rank your business in
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#FC5D2C", letterSpacing: -2.5, lineHeight: 1.08 }}>
            ChatGPT, Gemini &amp; Claude.
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#5c5c66", lineHeight: 1.35 }}>
            Not mentioned on {GUARANTEE_MIN_ENGINES}+ engines in {GUARANTEE_DAYS} days? We refund you 100%.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", background: "#FC5D2C", color: "#fff", fontSize: 24, fontWeight: 600, padding: "14px 26px", borderRadius: 999 }}>
            rankvyze.com
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#8f8f99" }}>Answer Engine Optimization</div>
        </div>
      </div>
    ),
    size,
  );
}
