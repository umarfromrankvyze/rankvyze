import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11.5px] font-medium leading-5 tracking-[0.005em]",
  {
    variants: {
      variant: {
        neutral: "border-line bg-surface-3 text-ink-muted",
        brand: "border-brand-200 bg-brand-50 text-brand-700",
        solid: "border-brand-500 bg-brand-500 text-white",
        dark: "border-ink bg-ink text-white",
        success: "border-green-200 bg-success-soft text-green-700",
        warning: "border-amber-200 bg-warning-soft text-amber-700",
        danger: "border-red-200 bg-danger-soft text-red-700",
        info: "border-blue-200 bg-info-soft text-blue-700",
        outline: "border-line-strong bg-white text-ink",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
