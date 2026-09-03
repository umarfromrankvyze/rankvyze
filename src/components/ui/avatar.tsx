import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-sm" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-ink font-semibold text-white",
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

/** Deterministic brand-tinted avatar for companies/competitors. */
export function CompanyAvatar({ name, size = "md", className, accent }: AvatarProps & { accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-lg border font-display font-bold",
        accent ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface-3 text-ink-muted",
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
