import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  tone?: "white" | "soft" | "dark" | "brand";
  bleed?: boolean;
}

export function Section({ id, tone = "white", className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-16 py-20 md:py-28",
        tone === "soft" && "bg-surface-2",
        tone === "dark" && "bg-ink text-white",
        tone === "brand" && "bg-brand-500 text-white",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  dark?: boolean;
  /**
   * Heading level. Defaults to 2, because most uses are a section inside a page
   * that already has an h1.
   *
   * Pass 1 when this heading opens the page. /pricing and /resources shipped
   * with no h1 at all for exactly this reason: they lead with a SectionHeading,
   * which was hard-coded to h2, so the most commercially important page on the
   * site had no top-level heading for Google or an answer engine to read.
   */
  level?: 1 | 2;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className, dark, level = 2 }: SectionHeadingProps) {
  const headingClass = cn(
    "text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[2.6rem] md:text-[3.1rem]",
    dark ? "text-white" : "text-ink",
  );
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow mb-4", dark && "text-brand-400")}>{eyebrow}</p>}
      {level === 1 ? <h1 className={headingClass}>{title}</h1> : <h2 className={headingClass}>{title}</h2>}
      {description && (
        <p
          className={cn(
            "mt-5 text-pretty text-base leading-relaxed md:text-[17px]",
            align === "center" && "mx-auto max-w-2xl",
            dark ? "text-white/70" : "text-ink-muted",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
