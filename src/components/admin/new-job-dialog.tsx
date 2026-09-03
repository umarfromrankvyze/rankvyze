"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebsiteSelect, type WebsiteOption } from "@/components/admin/website-select";
import { createCodeChange } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

export function NewJobDialog({ websites, optimizations }: { websites: WebsiteOption[]; optimizations: { id: string; websiteId: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [websiteId, setWebsiteId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const g = (f: FormData, k: string) => String(f.get(k) ?? "");

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Code2 /> New Claude job
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <form
            action={(f) =>
              start(async () => {
                const r = await createCodeChange({ websiteId: g(f, "websiteId"), optimizationId: g(f, "optimizationId"), title: g(f, "title"), summary: g(f, "summary"), repository: g(f, "repository"), branch: g(f, "branch"), instructions: g(f, "instructions") });
                if (!r.ok) {
                  setErrors(r.fieldErrors ?? {});
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setOpen(false);
                if (r.data?.id) router.push(`/admin/code-changes/${r.data.id}`);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>New Claude optimization job</DialogTitle>
              <DialogDescription>Scope the implementation task. You can attach files and diffs on the next screen.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Website" htmlFor="websiteId" error={errors.websiteId}>
                  <WebsiteSelect id="websiteId" name="websiteId" websites={websites} value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} invalid={Boolean(errors.websiteId)} />
                </Field>
                <Field label="Optimization" htmlFor="optimizationId" hint="Optional link">
                  <Select id="optimizationId" name="optimizationId" defaultValue="">
                    <option value="">None</option>
                    {optimizations.filter((o) => !websiteId || o.websiteId === websiteId).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Title" htmlFor="title" error={errors.title}>
                <Input id="title" name="title" placeholder="Improve Organization schema" invalid={Boolean(errors.title)} />
              </Field>
              <Field label="Summary" htmlFor="summary">
                <Input id="summary" name="summary" placeholder="What the change does, in one line" />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Repository" htmlFor="repository">
                  <Input id="repository" name="repository" placeholder="acme/acme-website" />
                </Field>
                <Field label="Branch" htmlFor="branch">
                  <Input id="branch" name="branch" placeholder="aeo/organization-schema" />
                </Field>
              </div>
              <Field label="Task instructions" htmlFor="instructions" hint="Written for the implementing agent: what to change, where, and constraints.">
                <Textarea id="instructions" name="instructions" className="min-h-[120px]" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Create job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
