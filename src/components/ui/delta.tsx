import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatDelta } from "@/lib/utils";

interface DeltaProps {
  value: number;
  className?: string;
  /** when true, a negative delta is good (e.g. average position) */
  invert?: boolean;
  suffix?: string;
  size?: "sm" | "md";
}

export function Delta({ value, className, invert, suffix, size = "md" }: DeltaProps) {
  const positive = invert ? value < 0 : value > 0;
  const neutral = value === 0;
  const Icon = neutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
        size === "sm" ? "text-[11.5px]" : "text-xs",
        neutral && "bg-surface-3 text-ink-muted",
        !neutral && positive && "bg-success-soft text-green-700",
        !neutral && !positive && "bg-danger-soft text-red-700",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {suffix ? `${value > 0 ? "+" : ""}${value}${suffix}` : formatDelta(value)}
    </span>
  );
}
