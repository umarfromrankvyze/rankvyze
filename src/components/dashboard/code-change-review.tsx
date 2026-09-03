"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, GitPullRequest, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createPullRequest, reviewCodeChange } from "@/server/actions/workspace";

export function CodeChangeReview({ websiteId, id, status, prUrl, githubConnected }: { websiteId: string; id: string; status: string; prUrl: string | null; githubConnected: boolean }) {
  const [pending, start] = useTransition();
  const [confirmReject, setConfirmReject] = useState(false);

  const review = (decision: "APPROVED" | "REJECTED") =>
    start(async () => {
      const r = await reviewCodeChange(websiteId, id, decision);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setConfirmReject(false);
    });

  const pr = () =>
    start(async () => {
      const r = await createPullRequest(websiteId, id);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message, { description: r.data?.prUrl ?? undefined });
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "AWAITING_REVIEW" && (
        <>
          <Button onClick={() => review("APPROVED")} loading={pending}>
            <Check /> Approve
          </Button>
          <Button variant="outline" onClick={() => setConfirmReject(true)} disabled={pending}>
            <X /> Reject
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <Button onClick={pr} loading={pending} title={githubConnected ? undefined : "Connect GitHub in Settings first"}>
          <GitPullRequest /> Create Pull Request
        </Button>
      )}
      {prUrl && (
        <Button variant="outline" asChild>
          <a href={prUrl} target="_blank" rel="noreferrer">
            <ExternalLink /> View pull request
          </a>
        </Button>
      )}
      <ConfirmDialog open={confirmReject} onOpenChange={setConfirmReject} title="Reject this change?" description="The optimization goes back to the recommended list. You can ask for a new implementation later." confirmLabel="Reject change" destructive loading={pending} onConfirm={() => review("REJECTED")} />
    </div>
  );
}
