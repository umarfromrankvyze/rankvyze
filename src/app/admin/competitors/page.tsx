import type { Metadata } from "next";
import { getAdminCompetitors } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Competitors" };

export default async function AdminCompetitorsPage() {
  const competitors = await getAdminCompetitors();
  return (
    <>
      <PageHeader eyebrow="Internal" title="Competitors" description="Every competitor tracked across customers. Mentions and citations are derived from research results." />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Competitor</TableHead>
              <TableHead>Tracked for</TableHead>
              <TableHead>Mentions</TableHead>
              <TableHead>Citations</TableHead>
              <TableHead>Tracked</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <span className="flex items-center gap-3">
                    <CompanyAvatar name={c.name} size="sm" />
                    <span>
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="block text-[12px] text-ink-faint">{c.domain}</span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink">
                  {c.website.name} <span className="text-ink-faint">· {c.website.domain}</span>
                </TableCell>
                <TableCell className="tabular-nums">{c._count.mentions}</TableCell>
                <TableCell className="tabular-nums">{c._count.citations}</TableCell>
                <TableCell>{c.isTracked ? <Badge variant="success" dot>Yes</Badge> : <Badge variant="neutral" dot>Paused</Badge>}</TableCell>
                <TableCell className="max-w-[260px] truncate text-ink-muted">{c.notes ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
