import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  tone?: "brand" | "ink" | "success" | "warning" | "danger" | "auto";
  size?: "xs" | "sm" | "md";
  animate?: boolean;
}

const tones = {
  brand: "bg-brand-500",
  ink: "bg-ink",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function toneForScore(value: number): keyof typeof tones {
  if (value >= 70) return "success";
  if (value >= 45) return "warning";
  return "danger";
}

export function ProgressBar({ value, className, tone = "brand", size = "sm", animate = true }: ProgressBarProps) {
  const resolved = tone === "auto" ? toneForScore(value) : tone;
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-3",
        size === "xs" && "h-1",
        size === "sm" && "h-1.5",
        size === "md" && "h-2.5",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full origin-left rounded-full", tones[resolved], animate && "animate-grow-bar")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
