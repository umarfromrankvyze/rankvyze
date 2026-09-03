/**
 * Generates the app icons from the master logo artwork.
 *
 *   node scripts/build-icons.mjs
 *
 * Source of truth is assets/logo-source.png (1254x1254, artwork on white).
 * This crops to the tile, knocks the corners transparent so the mark doesn't
 * sit in a white box on dark surfaces, and writes the sizes Next.js picks up
 * by file convention.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets/logo-source.png";
// Measured from the artwork, not guessed — see scripts/measure notes in git log.
const CROP = { left: 119, top: 101, width: 1015, height: 1015 };
const RADIUS_RATIO = 189 / 1015;

const roundedMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(
      size * RADIUS_RATIO,
    )}" fill="#fff"/></svg>`,
  );

/** Square tile, corners knocked out. */
async function rounded(size, out) {
  await sharp(SRC)
    .extract(CROP)
    .resize(size, size, { fit: "fill", kernel: "lanczos3" })
    .composite([{ input: roundedMask(size), blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${out} (${size}x${size}, rounded)`);
}

/** iOS applies its own mask, so the apple icon keeps square corners. */
async function square(size, out) {
  await sharp(SRC)
    .extract(CROP)
    .resize(size, size, { fit: "fill", kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${out} (${size}x${size}, square for iOS)`);
}

await mkdir("public/brand", { recursive: true });
await mkdir("src/assets", { recursive: true });

await rounded(512, "src/app/icon.png");        // favicon + PWA
await square(180, "src/app/apple-icon.png");   // iOS home screen
await rounded(512, "public/brand/logo-512.png"); // OG / press use
// Statically imported by the Logo component so next/image gets intrinsic dims.
await rounded(128, "src/assets/logo-mark.png");
