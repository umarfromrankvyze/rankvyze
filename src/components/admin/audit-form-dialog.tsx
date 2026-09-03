"use client";

import { useState, useTransition } from "react";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebsiteSelect, type WebsiteOption } from "@/components/admin/website-select";
import { AUDIT_CATEGORY_KEYS, AUDIT_CATEGORY_LABELS } from "@/lib/enums";
import { createAudit } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

export function AuditFormDialog({ websites, defaultWebsiteId }: { websites: WebsiteOption[]; defaultWebsiteId?: string }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(AUDIT_CATEGORY_KEYS.map((k) => [k, 50])));
  const [pending, start] = useTransition();
  const average = Math.round(AUDIT_CATEGORY_KEYS.reduce((n, k) => n + scores[k], 0) / AUDIT_CATEGORY_KEYS.length);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <BarChart3 /> New audit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <form
            action={(f) =>
              start(async () => {
                const overall = Number(f.get("overallScore") || average);
                const r = await createAudit({
                  websiteId: String(f.get("websiteId") ?? ""),
                  overallScore: overall,
                  ...Object.fromEntries(AUDIT_CATEGORY_KEYS.map((k) => [k, scores[k]])),
                  summary: String(f.get("summary") ?? ""),
                });
                if (!r.ok) {
                  setErrors(r.fieldErrors ?? {});
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setOpen(false);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>Publish an AEO audit</DialogTitle>
              <DialogDescription>Score each category 0–100. The audit is visible to the customer immediately.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-5">
              <Field label="Website" htmlFor="websiteId" error={errors.websiteId}>
                <WebsiteSelect id="websiteId" name="websiteId" websites={websites} defaultValue={defaultWebsiteId ?? ""} invalid={Boolean(errors.websiteId)} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {AUDIT_CATEGORY_KEYS.map((k) => (
                  <div key={k}>
                    <div className="flex items-center justify-between text-[13px]">
                      <label htmlFor={k} className="font-medium text-ink">
                        {AUDIT_CATEGORY_LABELS[k]}
                      </label>
                      <span className="font-semibold tabular-nums text-ink">{scores[k]}</span>
                    </div>
                    <input id={k} type="range" min={0} max={100} value={scores[k]} onChange={(e) => setScores({ ...scores, [k]: Number(e.target.value) })} className="mt-1.5 w-full accent-brand-500" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
                <Field label="Overall score" htmlFor="overallScore" hint={`Average is ${average}`} error={errors.overallScore}>
                  <Input id="overallScore" name="overallScore" type="number" min={0} max={100} key={average} defaultValue={average} />
                </Field>
                <Field label="Summary" htmlFor="summary" hint="One or two sentences the customer sees at the top of the audit.">
                  <Textarea id="summary" name="summary" className="min-h-[72px]" />
                </Field>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Publish audit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
