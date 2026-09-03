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
}

export function SectionHeading({ eyebrow, title, description, align = "center", className, dark }: SectionHeadingProps) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow mb-4", dark && "text-brand-400")}>{eyebrow}</p>}
      <h2
        className={cn(
          "text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[2.6rem] md:text-[3.1rem]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
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
