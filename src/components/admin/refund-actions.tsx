"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveRefund, denyRefund } from "@/server/actions/guarantee";

export function RefundDecision({ requestId, amountLabel }: { requestId: string; amountLabel: string }) {
  const [mode, setMode] = useState<"approve" | "deny" | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setMode("approve")}>
          <Check /> Approve refund
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMode("deny")}>
          <X /> Decline
        </Button>
      </div>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <form
            key={mode}
            action={(f) =>
              start(async () => {
                const note = String(f.get("note") ?? "");
                const r = mode === "approve" ? await approveRefund(requestId, note) : await denyRefund(requestId, note);
                if (!r.ok) {
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setMode(null);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>{mode === "approve" ? `Refund ${amountLabel}?` : "Decline this refund request?"}</DialogTitle>
              <DialogDescription>
                {mode === "approve"
                  ? "This issues the refund through the payment provider immediately and closes the engagement."
                  : "The customer sees your note. Only decline when a published void condition genuinely applies."}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field
                label={mode === "approve" ? "Internal note" : "Reason shown to the customer"}
                htmlFor="note"
                hint={mode === "approve" ? "Optional." : "Required."}
              >
                <Textarea id="note" name="note" className="min-h-[100px]" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>
                Cancel
              </Button>
              <Button type="submit" variant={mode === "approve" ? "primary" : "danger"} loading={pending}>
                {mode === "approve" ? `Refund ${amountLabel}` : "Decline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
