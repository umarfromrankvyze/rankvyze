import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminCustomers } from "@/server/admin-queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { CompanyAvatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return (
    <>
      <PageHeader eyebrow="Internal" title="Customers" description={`${customers.length} organizations. Click one to open its workspace.`} />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Customer</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>AEO Score</TableHead>
              <TableHead>AI Visibility</TableHead>
              <TableHead>Last audit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                    <CompanyAvatar name={c.name} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="block truncate text-[12px] text-ink-faint">{c.owner?.email ?? "—"}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  {c.website ? (
                    <span>
                      <span className="block text-ink">{c.website.domain}</span>
                      {c.websiteCount > 1 && <span className="text-[11.5px] text-ink-faint">+{c.websiteCount - 1} more</span>}
                    </span>
                  ) : (
                    <span className="text-ink-faint">Not added</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.plan} dot={false} />
                </TableCell>
                <TableCell className="font-semibold tabular-nums">{c.aeoScore ?? <span className="font-normal text-ink-faint">—</span>}</TableCell>
                <TableCell className="font-semibold tabular-nums">{c.visibility ?? <span className="font-normal text-ink-faint">—</span>}</TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">{c.lastAuditAt ? formatDate(c.lastAuditAt) : "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/customers/${c.id}`} className="text-ink-faint hover:text-ink" aria-label="Open">
                    <ArrowRight className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
