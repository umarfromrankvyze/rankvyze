"use client";

import { useState, useTransition } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebsiteSelect, type WebsiteOption } from "@/components/admin/website-select";
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_LABELS, SEVERITIES } from "@/lib/enums";
import { createIssue } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

export function IssueFormDialog({ websites, defaultWebsiteId, audits = [] }: { websites: WebsiteOption[]; defaultWebsiteId?: string; audits?: { id: string; label: string; websiteId: string }[] }) {
  const [open, setOpen] = useState(false);
  const [websiteId, setWebsiteId] = useState(defaultWebsiteId ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const g = (f: FormData, k: string) => String(f.get(k) ?? "");

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ShieldAlert /> New issue
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <form
            action={(f) =>
              start(async () => {
                const r = await createIssue({
                  websiteId: g(f, "websiteId"),
                  auditId: g(f, "auditId"),
                  title: g(f, "title"),
                  category: g(f, "category"),
                  severity: g(f, "severity"),
                  impactScore: Number(g(f, "impactScore") || 5),
                  description: g(f, "description"),
                  whyItMatters: g(f, "whyItMatters"),
                  currentImplementation: g(f, "currentImplementation"),
                  recommendedImplementation: g(f, "recommendedImplementation"),
                  affectedPages: g(f, "affectedPages"),
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
              <DialogTitle>Create an AEO issue</DialogTitle>
              <DialogDescription>Write it for the customer: what&apos;s wrong, why it matters, and exactly what to change.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Website" htmlFor="websiteId" error={errors.websiteId}>
                  <WebsiteSelect id="websiteId" name="websiteId" websites={websites} value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} invalid={Boolean(errors.websiteId)} />
                </Field>
                <Field label="Attach to audit" htmlFor="auditId" hint="Optional">
                  <Select id="auditId" name="auditId" defaultValue="">
                    <option value="">None</option>
                    {audits.filter((a) => !websiteId || a.websiteId === websiteId).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Title" htmlFor="title" error={errors.title}>
                <Input id="title" name="title" placeholder="Weak entity definition" invalid={Boolean(errors.title)} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Category" htmlFor="category" error={errors.category}>
                  <Select id="category" name="category" defaultValue="ENTITY">
                    {ISSUE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {ISSUE_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Severity" htmlFor="severity">
                  <Select id="severity" name="severity" defaultValue="HIGH">
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Impact (0–10)" htmlFor="impactScore" error={errors.impactScore}>
                  <Input id="impactScore" name="impactScore" type="number" step={0.1} min={0} max={10} defaultValue={7.5} />
                </Field>
              </div>
              <Field label="Description" htmlFor="description" error={errors.description}>
                <Textarea id="description" name="description" placeholder="Your homepage does not clearly communicate…" invalid={Boolean(errors.description)} />
              </Field>
              <Field label="Why it matters" htmlFor="whyItMatters">
                <Textarea id="whyItMatters" name="whyItMatters" className="min-h-[80px]" />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Current implementation" htmlFor="currentImplementation" hint="Code or copy as it is today.">
                  <Textarea id="currentImplementation" name="currentImplementation" className="min-h-[100px] font-mono text-[12.5px]" />
                </Field>
                <Field label="Recommended implementation" htmlFor="recommendedImplementation" hint="What it should become.">
                  <Textarea id="recommendedImplementation" name="recommendedImplementation" className="min-h-[100px] font-mono text-[12.5px]" />
                </Field>
              </div>
              <Field label="Affected pages" htmlFor="affectedPages" hint="Comma or newline separated paths, e.g. /, /about">
                <Input id="affectedPages" name="affectedPages" placeholder="/, /about" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Create issue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
