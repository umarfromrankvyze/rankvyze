import type { PlatformKey } from "@/lib/enums";

/**
 * The parts of platform detection that both the server detector and the client
 * UI need. Kept separate from src/lib/platform.ts because that file is
 * `server-only` — it does DNS resolution and outbound fetches — and a client
 * component importing it would fail the build.
 */

export interface PlatformSignal {
  /** Human-readable description of what was found in the served HTML. */
  label: string;
  /** How strongly it implies the platform. */
  weight: number;
}

export interface PlatformDetection {
  platform: PlatformKey;
  /** 0-100. Below CONFIDENT_AT we present it as a guess the customer confirms. */
  confidence: number;
  signals: PlatformSignal[];
  /** Runners-up, so an admin can see what else it nearly matched. */
  alternatives: { platform: PlatformKey; confidence: number }[];
  finalUrl: string;
  detectedAt: string;
}

/**
 * Below this we ask rather than tell.
 *
 * Set where a single definitive signal — a generator meta tag, an x-shopid
 * header — clears it alone, but a pile of circumstantial asset-host hints does
 * not. A site that merely embeds one Framer page is not a Framer site, and
 * telling its owner otherwise would send them down a delivery route that
 * cannot work.
 */
export const CONFIDENT_AT = 60;
