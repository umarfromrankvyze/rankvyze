"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CodeDiff } from "@/components/dashboard/code-diff";
import { CODE_CHANGE_STATUSES, type CodeChangeStatus } from "@/lib/enums";
import { titleCase } from "@/lib/utils";
import { deleteCodeChangeFile, sendToClaude, updateCodeChange, updateCodeChangeStatus, upsertCodeChangeFile } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

interface JobFile {
  id: string;
  path: string;
  language: string;
  diff: string;
  content: string | null;
  additions: number;
  deletions: number;
}

interface Props {
  job: { id: string; title: string; summary: string | null; instructions: string | null; repository: string | null; branch: string | null; status: string };
  files: JobFile[];
}

const SAMPLE_DIFF = `@@ -1,3 +1,4 @@
 import "./globals.css";
+import { OrganizationSchema } from "@/components/OrganizationSchema";

 export const metadata = {`;

export function SendToClaudeButton({ id, status, disabled }: { id: string; status: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const canSend = status === "DRAFT" || status === "REJECTED";
  return (
    <>
      <Button onClick={() => setConfirm(true)} disabled={!canSend || disabled} loading={pending}>
        <Send /> Send to Claude
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Queue this job for Claude?"
        description="No agent is connected in this version. The job moves to “Ready for Claude” and waits for a human to author the diff. When the integration ships, this same action will start an automated run."
        confirmLabel="Queue job"
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const r = await sendToClaude(id);
            if (r.ok) toast.success(r.message); else toast.error(r.error);
            setConfirm(false);
          })
        }
      />
    </>
  );
}

export function StatusControl({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="w-52">
      <Select
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            const r = await updateCodeChangeStatus(id, e.target.value as CodeChangeStatus);
            if (r.ok) toast.success(r.message); else toast.error(r.error);
          })
        }
        className="h-9"
        aria-label="Status"
      >
        {CODE_CHANGE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === "READY_FOR_CLAUDE" ? "Ready for Claude" : titleCase(s)}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function JobEditor({ job, files }: Props) {
  const [editing, setEditing] = useState(false);
  const [fileDialog, setFileDialog] = useState<JobFile | "new" | null>(null);
  const [deleting, setDeleting] = useState<JobFile | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const g = (f: FormData, k: string) => String(f.get(k) ?? "");

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Task</CardTitle>
            <CardDescription>Instructions handed to the implementing agent.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          {job.instructions ? <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{job.instructions}</p> : <p className="text-[13px] text-ink-muted">No instructions yet — add them before sending.</p>}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Generated changes <span className="text-[13px] font-normal text-ink-faint">({files.length})</span>
        </h2>
        <Button variant="outline" size="sm" onClick={() => setFileDialog("new")}>
          <Plus /> Add file
        </Button>
      </div>
      <div className="mt-3 space-y-4">
        {files.length === 0 && (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-8 text-center text-[13px] text-ink-muted">
            No files yet. Author the finished file here; saving moves the job to “Awaiting review” for the customer, and the connected delivery route can then ship it.
          </div>
        )}
        {files.map((f) => (
          <div key={f.id}>
            <CodeDiff path={f.path} diff={f.diff} additions={f.additions} deletions={f.deletions} />
            <div className="mt-1.5 flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => setFileDialog(f)}>
                <Pencil /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(f)}>
                <Trash2 /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit job */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent size="lg">
          <form
            action={(f) =>
              start(async () => {
                const r = await updateCodeChange(job.id, { title: g(f, "title"), summary: g(f, "summary"), instructions: g(f, "instructions"), repository: g(f, "repository"), branch: g(f, "branch") });
                if (!r.ok) {
                  setErrors(r.fieldErrors ?? {});
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setEditing(false);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>Edit job</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field label="Title" htmlFor="title" error={errors.title}>
                <Input id="title" name="title" defaultValue={job.title} />
              </Field>
              <Field label="Summary" htmlFor="summary">
                <Input id="summary" name="summary" defaultValue={job.summary ?? ""} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Repository" htmlFor="repository">
                  <Input id="repository" name="repository" defaultValue={job.repository ?? ""} />
                </Field>
                <Field label="Branch" htmlFor="branch">
                  <Input id="branch" name="branch" defaultValue={job.branch ?? ""} />
                </Field>
              </div>
              <Field label="Instructions" htmlFor="instructions">
                <Textarea id="instructions" name="instructions" defaultValue={job.instructions ?? ""} className="min-h-[140px]" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* File dialog */}
      <Dialog open={Boolean(fileDialog)} onOpenChange={(o) => !o && setFileDialog(null)}>
        <DialogContent size="xl">
          <form
            key={fileDialog === "new" ? "new" : fileDialog?.id}
            action={(f) =>
              start(async () => {
                const r = await upsertCodeChangeFile({
                  codeChangeId: job.id,
                  fileId: fileDialog && fileDialog !== "new" ? fileDialog.id : undefined,
                  path: g(f, "path"),
                  language: g(f, "language"),
                  diff: g(f, "diff"),
                  content: g(f, "content"),
                });
                if (!r.ok) {
                  setErrors(r.fieldErrors ?? {});
                  toast.error(r.error);
                  return;
                }
                toast.success(r.message);
                setFileDialog(null);
              })
            }
          >
            <DialogHeader>
              <DialogTitle>{fileDialog === "new" ? "Add a file" : "Edit file"}</DialogTitle>
              <DialogDescription>
                The final content is what gets committed to the customer&apos;s site. The diff is only what they read
                during review — leave it blank to show the whole file as added. Saving moves the job to “Awaiting
                review”.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
                <Field label="File path" htmlFor="path" error={errors.path}>
                  <Input id="path" name="path" defaultValue={fileDialog && fileDialog !== "new" ? fileDialog.path : ""} placeholder="app/layout.tsx" className="font-mono" invalid={Boolean(errors.path)} />
                </Field>
                <Field label="Language" htmlFor="language">
                  <Select id="language" name="language" defaultValue={fileDialog && fileDialog !== "new" ? fileDialog.language : "tsx"}>
                    {["tsx", "ts", "jsx", "js", "html", "liquid", "php", "json", "css", "md"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field
                label="Final file content"
                htmlFor="content"
                error={errors.content}
                hint="The complete file after the change. This is the text that is actually written to the repository or site — a change without it cannot be delivered."
              >
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={fileDialog && fileDialog !== "new" ? (fileDialog.content ?? "") : ""}
                  className="min-h-[260px] font-mono text-[12.5px] leading-relaxed"
                  invalid={Boolean(errors.content)}
                  spellCheck={false}
                  placeholder="The whole file, top to bottom."
                />
              </Field>
              <Field label="Diff for review (optional)" htmlFor="diff" error={errors.diff} hint="Unified diff hunks. Blank shows the whole file as added.">
                <Textarea
                  id="diff"
                  name="diff"
                  defaultValue={fileDialog && fileDialog !== "new" ? fileDialog.diff : ""}
                  className="min-h-[160px] font-mono text-[12.5px] leading-relaxed"
                  invalid={Boolean(errors.diff)}
                  spellCheck={false}
                  placeholder={SAMPLE_DIFF}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFileDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Save file
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove ${deleting?.path}?`}
        confirmLabel="Remove"
        destructive
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!deleting) return;
            const r = await deleteCodeChangeFile(deleting.id);
            if (r.ok) toast.success(r.message); else toast.error(r.error);
            setDeleting(null);
          })
        }
      />
    </>
  );
}
