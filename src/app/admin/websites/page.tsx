import type { Metadata } from "next";
import Link from "next/link";
import { getAdminWebsites } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Websites" };

export default async function AdminWebsitesPage() {
  const websites = await getAdminWebsites();
  return (
    <>
      <PageHeader eyebrow="Internal" title="Websites" description={`${websites.length} websites under management.`} />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Website</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Prompts</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>AEO</TableHead>
              <TableHead>Connections</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <Link href={`/admin/customers/${w.organization.id}`} className="block font-semibold text-ink hover:underline underline-offset-2">
                    {w.name}
                  </Link>
                  <span className="text-[12px] text-ink-faint">{w.domain}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {w.organization.name} <StatusBadge status={w.organization.plan} dot={false} className="ml-1" />
                </TableCell>
                <TableCell className="text-ink-muted">{w.industry ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{w._count.prompts}</TableCell>
                <TableCell className="tabular-nums">{w._count.research}</TableCell>
                <TableCell className="font-semibold tabular-nums">{w.visibility ?? <span className="font-normal text-ink-faint">—</span>}</TableCell>
                <TableCell className="font-semibold tabular-nums">{w.audits[0]?.overallScore ?? <span className="font-normal text-ink-faint">—</span>}</TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    {w.integrations.filter((i) => i.status !== "NOT_CONNECTED").map((i) => (
                      <Badge key={i.provider} variant={i.status === "CONNECTED" ? "success" : "warning"}>
                        {titleCase(i.provider)}
                      </Badge>
                    ))}
                    {w.integrations.every((i) => i.status === "NOT_CONNECTED") && <span className="text-[12px] text-ink-faint">None</span>}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(w.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
