"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { claimRefund } from "@/server/actions/guarantee";

export function ClaimRefundButton({ engagementId, amountLabel }: { engagementId: string; amountLabel: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <ShieldCheck /> Claim my {amountLabel} refund
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            action={(f) =>
              start(async () => {
                const r = await claimRefund(engagementId, String(f.get("reason") ?? ""));
                if (!r.ok) {
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setOpen(false);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>Claim your refund</DialogTitle>
              <DialogDescription>
                We&apos;ll return the full {amountLabel} to your original payment method. Reviewed within two business days.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label="Anything you want us to know?" htmlFor="reason" hint="Optional — but it genuinely helps us improve.">
                <Textarea id="reason" name="reason" placeholder="What you were hoping for, and what actually happened." />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Request refund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
