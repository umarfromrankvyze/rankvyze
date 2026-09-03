"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { CompanyAvatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";
import { EngineIcon } from "@/components/ui/engine-icon";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { addCompetitor, removeCompetitor } from "@/server/actions/workspace";
import type { CompetitorStanding } from "@/server/queries";
import type { FieldErrors } from "@/lib/validation";

interface CompetitorTableProps {
  websiteId: string;
  rows: CompetitorStanding[];
  engines: { key: string; name: string }[];
}

export function CompetitorTable({ websiteId, rows, engines }: CompetitorTableProps) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<CompetitorStanding | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();

  const submit = (form: FormData) => {
    const input = { name: String(form.get("name") ?? ""), domain: String(form.get("domain") ?? "") };
    start(async () => {
      const r = await addCompetitor(websiteId, input);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error);
        return;
      }
      toast.success(r.message);
      setErrors({});
      setAdding(false);
    });
  };

  const remove = () => {
    if (!removing?.id) return;
    start(async () => {
      const r = await removeCompetitor(websiteId, removing.id!);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setRemoving(null);
    });
  };

  const competitorsOnly = rows.filter((r) => !r.isYou);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">{competitorsOnly.length} tracked · ranked by AI Visibility</p>
        <Button onClick={() => setAdding(true)}>
          <Plus /> Add competitor
        </Button>
      </div>

      {competitorsOnly.length === 0 ? (
        <EmptyState icon={Users} title="No competitors tracked" description="Add the businesses AI engines might recommend instead of you." action={<Button onClick={() => setAdding(true)}><Plus /> Add competitor</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">#</TableHead>
                <TableHead className="min-w-[220px]">Company</TableHead>
                <TableHead className="min-w-[180px]">AI Visibility</TableHead>
                <TableHead>Mention rate</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead>Avg. position</TableHead>
                <TableHead>
                  <span className="inline-flex gap-1">
                    {engines.map((e) => (
                      <EngineIcon key={e.key} engine={e.key} size={12} />
                    ))}
                  </span>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.id ?? "you"} className={cn(r.isYou && "bg-brand-50/50 hover:bg-brand-50/70")}>
                  <TableCell className="font-semibold tabular-nums text-ink-faint">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={r.name} accent={r.isYou} />
                      <div className="min-w-0">
                        <p className={cn("truncate font-semibold", r.isYou ? "text-brand-700" : "text-ink")}>
                          {r.name}
                          {r.isYou && <span className="ml-1.5 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">You</span>}
                        </p>
                        <a href={`https://${r.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-ink-faint hover:text-ink">
                          {r.domain} <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className={cn("w-8 font-display text-[18px] font-bold tabular-nums", r.isYou ? "text-brand-600" : "text-ink")}>{r.summary.score}</span>
                      <ProgressBar value={r.summary.score} tone={r.isYou ? "brand" : "ink"} className="flex-1" />
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{r.summary.mentionRate}%</TableCell>
                  <TableCell className="tabular-nums">{r.citations}</TableCell>
                  <TableCell className="tabular-nums">{r.summary.avgPosition ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {engines.map((e) => (
                        <span key={e.key} title={`${e.name}: ${r.byEngine[e.key]?.score ?? 0}`} className="w-8 rounded-md bg-surface-3 py-0.5 text-center text-[11px] font-medium tabular-nums text-ink-muted">
                          {r.byEngine[e.key]?.score ?? 0}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!r.isYou && (
                      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${r.name}`} onClick={() => setRemoving(r)}>
                        <Trash2 />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent size="sm">
          <form action={submit}>
            <DialogHeader>
              <DialogTitle>Add a competitor</DialogTitle>
              <DialogDescription>We&apos;ll track when AI engines name them for your prompts.</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field label="Company name" htmlFor="name" error={errors.name}>
                <Input id="name" name="name" placeholder="Northwind Digital" invalid={Boolean(errors.name)} autoFocus />
              </Field>
              <Field label="Website" htmlFor="domain" error={errors.domain}>
                <Input id="domain" name="domain" placeholder="northwind.digital" invalid={Boolean(errors.domain)} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Add competitor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} title={`Stop tracking ${removing?.name}?`} description="Their mentions and citations will no longer be counted in comparisons." confirmLabel="Remove" destructive loading={pending} onConfirm={remove} />
    </>
  );
}
