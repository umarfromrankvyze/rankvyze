import Link from "next/link";
import Image from "next/image";
import mark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
  /**
   * Describes the image. Safe to leave as the default even inside the linked
   * `Logo` below: that anchor carries its own `aria-label`, which overrides the
   * name computed from descendants, so this text is never announced twice.
   */
  alt?: string;
}

/**
 * RankVyze brand mark.
 *
 * Rendered from the master artwork (assets/logo-source.png) rather than a
 * hand-traced SVG, so it matches the brand exactly. The tile's corners are
 * transparent, so it sits correctly on light, dark and orange surfaces alike —
 * which is why there is no inverted variant.
 *
 * Regenerate every size with `npm run build:icons`.
 */
export function LogoMark({ size = 28, className, alt = "RankVyze logo" }: LogoMarkProps) {
  return (
    <Image
      src={mark}
      alt={alt}
      width={size}
      height={size}
      priority
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}

interface LogoProps {
  href?: string;
  className?: string;
  size?: number;
  /** Light wordmark, for dark or orange surfaces. The mark itself is unchanged. */
  invert?: boolean;
  wordmarkClassName?: string;
  suffix?: string;
}

export function Logo({ href = "/", className, size = 28, invert, wordmarkClassName, suffix }: LogoProps) {
  const content = (
    <>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-display text-[19px] font-bold tracking-[-0.03em]",
          invert ? "text-white" : "text-ink",
          wordmarkClassName,
        )}
      >
        RankVyze
        {suffix && <span className={cn("ml-1.5 font-medium", invert ? "text-white/70" : "text-ink-faint")}>{suffix}</span>}
      </span>
    </>
  );
  if (!href) return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>;
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 pointer-coarse:min-h-11", className)} aria-label="RankVyze home">
      {content}
    </Link>
  );
}
