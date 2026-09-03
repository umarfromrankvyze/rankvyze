import type { Metadata } from "next";
import { getAdminAudits, getWebsiteOptions } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoreRing } from "@/components/ui/score-ring";
import { AuditFormDialog } from "@/components/admin/audit-form-dialog";
import { DeleteAuditButton } from "@/components/admin/delete-buttons";
import { AUDIT_CATEGORY_KEYS, AUDIT_CATEGORY_LABELS } from "@/lib/enums";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "AEO Audits" };

export default async function AdminAuditsPage() {
  const [audits, websites] = await Promise.all([getAdminAudits(), getWebsiteOptions()]);
  return (
    <>
      <PageHeader eyebrow="Internal" title="AEO Audits" description="Every published audit. Customers see the latest audit for their website." actions={<AuditFormDialog websites={websites} />} />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Website</TableHead>
              <TableHead>Overall</TableHead>
              {AUDIT_CATEGORY_KEYS.map((k) => (
                <TableHead key={k} className="text-center">
                  {AUDIT_CATEGORY_LABELS[k].split(" ")[0]}
                </TableHead>
              ))}
              <TableHead>Issues</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <span className="block font-semibold text-ink">{a.website.name}</span>
                  <span className="block text-[12px] text-ink-faint">{a.website.domain}</span>
                </TableCell>
                <TableCell>
                  <ScoreRing value={a.overallScore} size={44} stroke={5} animate={false} label={<span className="text-[12px] font-bold">{a.overallScore}</span>} />
                </TableCell>
                {AUDIT_CATEGORY_KEYS.map((k) => (
                  <TableCell key={k} className="text-center tabular-nums">
                    {a[k]}
                  </TableCell>
                ))}
                <TableCell className="tabular-nums">{a._count.issues}</TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">
                  {formatDate(a.createdAt)}
                  <span className="block text-[11.5px] text-ink-faint">{a.createdBy?.name ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <DeleteAuditButton id={a.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
