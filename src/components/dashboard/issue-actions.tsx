"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { requestIssueFix, setIssueStatus } from "@/server/actions/workspace";
import type { IssueStatus } from "@/lib/enums";

export function IssueActions({ websiteId, issueId, status, hasActiveFix }: { websiteId: string; issueId: string; status: string; hasActiveFix: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<IssueStatus | null>(null);

  const fix = () =>
    start(async () => {
      const r = await requestIssueFix(websiteId, issueId);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message);
      if (r.data?.codeChangeId) router.push(`/dashboard/code-changes/${r.data.codeChangeId}`);
    });

  const update = (next: IssueStatus) =>
    start(async () => {
      const r = await setIssueStatus(websiteId, issueId, next);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setConfirm(null);
    });

  const resolved = status === "FIXED" || status === "DISMISSED";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!resolved && (
        <Button onClick={fix} loading={pending} disabled={hasActiveFix}>
          <Sparkles /> {hasActiveFix ? "Fix in progress" : "Fix with AI"}
        </Button>
      )}
      {!resolved && (
        <Button variant="outline" onClick={() => setConfirm("FIXED")} disabled={pending}>
          <Check /> Mark as fixed
        </Button>
      )}
      {status === "OPEN" && (
        <Button variant="ghost" onClick={() => setConfirm("DISMISSED")} disabled={pending}>
          <XCircle /> Dismiss
        </Button>
      )}
      {resolved && (
        <Button variant="outline" onClick={() => update("OPEN")} loading={pending}>
          Reopen issue
        </Button>
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "FIXED" ? "Mark this issue as fixed?" : "Dismiss this issue?"}
        description={confirm === "FIXED" ? "It will count toward your completed optimizations. The next audit will verify the fix." : "Dismissed issues are hidden from the active list but kept for the record."}
        confirmLabel={confirm === "FIXED" ? "Mark fixed" : "Dismiss"}
        destructive={confirm === "DISMISSED"}
        loading={pending}
        onConfirm={() => {
          if (confirm) update(confirm);
        }}
      />
    </div>
  );
}
