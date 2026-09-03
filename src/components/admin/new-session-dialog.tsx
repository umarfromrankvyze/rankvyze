"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebsiteSelect, type WebsiteOption } from "@/components/admin/website-select";
import { createResearchSession } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

export function NewSessionDialog({ websites, defaultWebsiteId }: { websites: WebsiteOption[]; defaultWebsiteId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <FlaskConical /> New research session
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            action={(f) =>
              start(async () => {
                const r = await createResearchSession({ websiteId: String(f.get("websiteId") ?? ""), title: String(f.get("title") ?? ""), notes: String(f.get("notes") ?? "") });
                if (!r.ok) {
                  setErrors(r.fieldErrors ?? {});
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setOpen(false);
                if (r.data?.id) router.push(`/admin/research/${r.data.id}`);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>New research session</DialogTitle>
              <DialogDescription>A session groups the manual checks for one website. Results become visible to the customer as soon as they&apos;re saved.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field label="Website" htmlFor="websiteId" error={errors.websiteId}>
                <WebsiteSelect id="websiteId" name="websiteId" websites={websites} defaultValue={defaultWebsiteId ?? ""} invalid={Boolean(errors.websiteId)} />
              </Field>
              <Field label="Title" htmlFor="title" error={errors.title}>
                <Input id="title" name="title" defaultValue={`Monthly research — ${month}`} invalid={Boolean(errors.title)} />
              </Field>
              <Field label="Notes" htmlFor="notes" hint="Method, account used, anything the next researcher should know.">
                <Textarea id="notes" name="notes" placeholder="Checked in a signed-out session; screenshots in the shared drive." className="min-h-[80px]" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Create session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
