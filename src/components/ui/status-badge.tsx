import { Badge, type BadgeProps } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";

const MAP: Record<string, { variant: BadgeProps["variant"]; label?: string }> = {
  // generic
  OPEN: { variant: "warning" },
  IN_PROGRESS: { variant: "info" },
  FIXED: { variant: "success" },
  DISMISSED: { variant: "neutral" },
  COMPLETED: { variant: "success" },
  ARCHIVED: { variant: "neutral" },
  // optimization
  SUGGESTED: { variant: "neutral" },
  APPROVED: { variant: "success" },
  REJECTED: { variant: "danger" },
  // code changes
  DRAFT: { variant: "neutral" },
  READY_FOR_CLAUDE: { variant: "brand", label: "Ready for Claude" },
  GENERATING: { variant: "info" },
  AWAITING_REVIEW: { variant: "warning" },
  MERGED: { variant: "dark" },
  // content
  IDEA: { variant: "neutral" },
  PLANNED: { variant: "info" },
  PUBLISHED: { variant: "success" },
  // severity
  CRITICAL: { variant: "danger" },
  HIGH: { variant: "danger" },
  MEDIUM: { variant: "warning" },
  LOW: { variant: "neutral" },
  // integrations
  CONNECTED: { variant: "success" },
  NOT_CONNECTED: { variant: "neutral", label: "Not connected" },
  PENDING: { variant: "warning" },
  ERROR: { variant: "danger" },
  // subscriptions / plans
  TRIALING: { variant: "brand" },
  ACTIVE: { variant: "success" },
  PAST_DUE: { variant: "danger" },
  CANCELED: { variant: "neutral" },
  TRIAL: { variant: "brand" },
  STARTER: { variant: "neutral" },
  GROWTH: { variant: "info" },
  SCALE: { variant: "dark" },
  // sentiment
  POSITIVE: { variant: "success" },
  NEUTRAL: { variant: "neutral" },
  NEGATIVE: { variant: "danger" },
  // misc
  READY: { variant: "success" },
  FAILED: { variant: "danger" },
  ADMIN: { variant: "dark" },
  CUSTOMER: { variant: "neutral" },
};

export function StatusBadge({ status, className, dot = true }: { status: string; className?: string; dot?: boolean }) {
  const entry = MAP[status] ?? { variant: "neutral" as const };
  return (
    <Badge variant={entry.variant} className={className} dot={dot}>
      {entry.label ?? titleCase(status)}
    </Badge>
  );
}

export function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === "CRITICAL" || severity === "HIGH"
      ? "bg-danger"
      : severity === "MEDIUM"
        ? "bg-warning"
        : "bg-ink-faint";
  return <span className={`inline-block size-2 shrink-0 rounded-full ${color}`} aria-hidden />;
}
