import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge, SeverityDot } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ISSUE_CATEGORY_LABELS, type IssueCategory } from "@/lib/enums";
import { parseJsonArray, cn } from "@/lib/utils";

export interface IssueCardData {
  id: string;
  title: string;
  category: string;
  severity: string;
  impactScore: number;
  description: string;
  recommendedImplementation: string | null;
  affectedPages: string | null;
  status: string;
}

export function IssueCard({ issue, compact }: { issue: IssueCardData; compact?: boolean }) {
  const pages = parseJsonArray(issue.affectedPages);
  const resolved = issue.status === "FIXED" || issue.status === "DISMISSED";
  return (
    <Card className={cn("p-5 transition-shadow hover:shadow-lift", resolved && "opacity-70")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityDot severity={issue.severity} />
            <Badge variant="outline">{ISSUE_CATEGORY_LABELS[issue.category as IssueCategory] ?? issue.category}</Badge>
            <StatusBadge status={issue.status} />
          </div>
          <h3 className="mt-2.5 font-display text-[16px] font-semibold tracking-tight text-ink">
            <Link href={`/dashboard/issues/${issue.id}`} className="hover:underline underline-offset-4">
              {issue.title}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">{issue.description}</p>

          {!compact && (
            <>
              {pages.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11.5px] text-ink-faint">Affected:</span>
                  {pages.slice(0, 4).map((p) => (
                    <code key={p} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-ink">
                      {p}
                    </code>
                  ))}
                  {pages.length > 4 && <span className="text-[11.5px] text-ink-faint">+{pages.length - 4} more</span>}
                </div>
              )}
              {issue.recommendedImplementation && (
                <div className="mt-3 rounded-lg border border-line bg-surface-2 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Recommendation</p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-[13px] leading-relaxed text-ink">{issue.recommendedImplementation}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Impact</p>
            <p className="font-display text-[22px] font-bold leading-none tracking-tight text-ink">
              {issue.impactScore.toFixed(1)}
              <span className="text-[13px] font-medium text-ink-faint"> / 10</span>
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/issues/${issue.id}`}>
              Review Fix <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
