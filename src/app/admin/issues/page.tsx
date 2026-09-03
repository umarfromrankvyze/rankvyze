import type { Metadata } from "next";
import { getAdminAudits, getAdminIssues, getWebsiteOptions } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, SeverityDot } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { IssueFormDialog } from "@/components/admin/issue-form-dialog";
import { DeleteIssueButton } from "@/components/admin/delete-buttons";
import { ISSUE_CATEGORY_LABELS, type IssueCategory } from "@/lib/enums";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Issues" };

export default async function AdminIssuesPage() {
  const [issues, websites, audits] = await Promise.all([getAdminIssues(), getWebsiteOptions(), getAdminAudits()]);
  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Issues"
        description={`${issues.length} issues across all websites.`}
        actions={<IssueFormDialog websites={websites} audits={audits.map((a) => ({ id: a.id, websiteId: a.website.id, label: `${a.website.name} · ${formatDate(a.createdAt)} (${a.overallScore})` }))} />}
      />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[280px]">Issue</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <SeverityDot severity={i.severity} /> {i.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[12px] text-ink-faint">{i.description}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink">{i.website.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ISSUE_CATEGORY_LABELS[i.category as IssueCategory] ?? i.category}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={i.severity} dot={false} />
                </TableCell>
                <TableCell className="font-semibold tabular-nums">{i.impactScore.toFixed(1)}</TableCell>
                <TableCell>
                  <StatusBadge status={i.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(i.createdAt)}</TableCell>
                <TableCell>
                  <DeleteIssueButton id={i.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
