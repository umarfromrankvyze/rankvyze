import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  tone?: "brand" | "auto" | "ink" | "white";
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  animate?: boolean;
}

function colorFor(value: number, tone: ScoreRingProps["tone"]) {
  if (tone === "brand") return "var(--color-brand-500)";
  if (tone === "ink") return "var(--color-ink)";
  if (tone === "white") return "#fff";
  if (value >= 70) return "var(--color-success)";
  if (value >= 45) return "var(--color-warning)";
  return "var(--color-danger)";
}

/**
 * Circular score gauge. The fill animates purely in CSS (see `ring-fill`
 * keyframes in globals.css), so it works in server components too.
 */
export function ScoreRing({ value, size = 120, stroke = 9, className, tone = "auto", label, sublabel, animate = true }: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const color = colorFor(value, tone);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone === "white" ? "rgba(255,255,255,0.2)" : "var(--color-surface-3)"} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={animate ? "animate-ring-fill" : undefined}
          style={{ "--ring-c": c } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? (
          <span className="font-display font-bold tabular-nums tracking-tight" style={{ fontSize: size * 0.24 }}>
            {value}
          </span>
        )}
        {sublabel && <span className="text-[11px] text-ink-faint">{sublabel}</span>}
      </div>
    </div>
  );
}
