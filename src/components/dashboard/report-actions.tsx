"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteReport, generateReport } from "@/server/actions/workspace";

export function GenerateReportButton({ websiteId }: { websiteId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      onClick={() =>
        start(async () => {
          const r = await generateReport(websiteId);
          if (!r.ok) return void toast.error(r.error);
          toast.success(r.message);
          if (r.data?.reportId) router.push(`/dashboard/reports/${r.data.reportId}`);
        })
      }
      loading={pending}
    >
      <FilePlus2 /> Generate Report
    </Button>
  );
}

export function ReportToolbar({ websiteId, reportId }: { websiteId: string; reportId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer /> Print / Save PDF
      </Button>
      <Button variant="ghost" onClick={() => setConfirm(true)} disabled={pending}>
        <Trash2 /> Delete
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this report?"
        description="The frozen snapshot will be removed. You can generate a new one any time."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const r = await deleteReport(websiteId, reportId);
            if (!r.ok) return void toast.error(r.error);
            toast.success(r.message);
            router.push("/dashboard/reports");
          })
        }
      />
    </div>
  );
}
