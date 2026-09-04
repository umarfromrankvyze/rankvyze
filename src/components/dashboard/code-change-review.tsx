"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, GitPullRequest, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deliverChange, reviewCodeChange } from "@/server/actions/workspace";

export function CodeChangeReview({
  websiteId,
  id,
  status,
  prUrl,
  connectedRoute,
}: {
  websiteId: string;
  id: string;
  status: string;
  prUrl: string | null;
  /** The connected API route's name, or null when there isn't one. */
  connectedRoute: string | null;
}) {
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
      const r = await deliverChange(websiteId, id);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message, { description: r.data?.reviewUrl ?? undefined });
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
        <Button
          onClick={pr}
          loading={pending}
          disabled={!connectedRoute}
          title={connectedRoute ? `Delivered via ${connectedRoute}` : "Connect a delivery route in Settings first"}
        >
          <GitPullRequest /> {connectedRoute ? "Deliver this change" : "No delivery route connected"}
        </Button>
      )}
      {prUrl && (
        <Button variant="outline" asChild>
          <a href={prUrl} target="_blank" rel="noreferrer">
            <ExternalLink /> View the change
          </a>
        </Button>
      )}
      <ConfirmDialog open={confirmReject} onOpenChange={setConfirmReject} title="Reject this change?" description="The optimization goes back to the recommended list. You can ask for a new implementation later." confirmLabel="Reject change" destructive loading={pending} onConfirm={() => review("REJECTED")} />
    </div>
  );
}
