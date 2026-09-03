"use client";

import { useMemo, useState, useTransition } from "react";
import { Ban, ExternalLink, MoreHorizontal, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EngineIcon, engineMeta } from "@/components/ui/engine-icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { PRIORITIES, PROMPT_INTENTS, type Priority, type PromptIntent } from "@/lib/enums";
import { createPrompt, deletePrompt, togglePrompt, updatePrompt } from "@/server/actions/workspace";
import type { PromptWithResults, ResearchRow } from "@/server/queries";
import type { FieldErrors } from "@/lib/validation";

interface PromptTableProps {
  websiteId: string;
  prompts: PromptWithResults[];
  engines: { key: string; name: string }[];
}

type Filter = "all" | string;

function ResultPill({ r }: { r: ResearchRow | null }) {
  if (!r) return <span className="inline-block rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-ink-faint">Pending</span>;
  if (!r.mentioned) return <span className="inline-block rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-medium text-red-700">Not mentioned</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", r.position === 1 ? "bg-brand-50 text-brand-700" : "bg-success-soft text-green-700")}>
      #{r.position ?? "?"}
      {r.cited && <span className="font-normal opacity-80">· cited</span>}
    </span>
  );
}

export function PromptTable({ websiteId, prompts, engines }: PromptTableProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PromptWithResults | null | "new">(null);
  const [viewing, setViewing] = useState<PromptWithResults | null>(null);
  const [deleting, setDeleting] = useState<PromptWithResults | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => !q || p.text.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q));
  }, [prompts, query]);

  const toggle = (p: PromptWithResults) =>
    start(async () => {
      const r = await togglePrompt(websiteId, p.id, !p.isActive);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
    });

  const remove = () => {
    if (!deleting) return;
    start(async () => {
      const r = await deletePrompt(websiteId, deleting.id);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setDeleting(null);
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-surface-3 p-1 scrollbar-thin">
          {[{ key: "all", name: "All engines" }, ...engines].map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => setFilter(e.key)}
              className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", filter === e.key ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink")}
            >
              {e.key !== "all" && <EngineIcon engine={e.key} size={13} />}
              {e.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompts" className="h-9 w-56 pl-9" />
          </div>
          <Button onClick={() => setEditing("new")} size="md">
            <Plus /> Add Prompt
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title={query ? "No prompts match" : "No prompts tracked yet"} description={query ? "Try a different search." : "Add the questions your buyers ask AI engines. We check each one on every engine."} action={!query && <Button onClick={() => setEditing("new")}><Plus /> Add Prompt</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[280px]">Prompt</TableHead>
                {filter === "all" ? (
                  engines.map((e) => (
                    <TableHead key={e.key}>
                      <span className="inline-flex items-center gap-1.5">
                        <EngineIcon engine={e.key} size={12} /> {e.name}
                      </span>
                    </TableHead>
                  ))
                ) : (
                  <>
                    <TableHead>Engine</TableHead>
                    <TableHead>Mentioned</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Citation</TableHead>
                  </>
                )}
                <TableHead>Last checked</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const r = filter === "all" ? null : p.perEngine[filter];
                return (
                  <TableRow key={p.id} className={cn("cursor-pointer", !p.isActive && "opacity-60")} onClick={() => setViewing(p)}>
                    <TableCell>
                      <p className="font-medium text-ink">{p.text}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
                        {p.category && <span>{p.category}</span>}
                        {p.category && <span>·</span>}
                        <span className="capitalize">{p.intent.toLowerCase()}</span>
                        {p.priority === "HIGH" && <Badge variant="brand" className="ml-1 px-1.5 py-0 text-[10px]">High priority</Badge>}
                      </p>
                    </TableCell>
                    {filter === "all" ? (
                      engines.map((e) => (
                        <TableCell key={e.key}>
                          <ResultPill r={p.perEngine[e.key]} />
                        </TableCell>
                      ))
                    ) : (
                      <>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-ink">
                            <EngineIcon engine={filter} size={14} /> {engineMeta(filter).name}
                          </span>
                        </TableCell>
                        <TableCell>{r ? (r.mentioned ? <Badge variant="success" dot>Yes</Badge> : <Badge variant="danger" dot>No</Badge>) : <span className="text-ink-faint">—</span>}</TableCell>
                        <TableCell className="tabular-nums">{r?.position ? `#${r.position}` : <span className="text-ink-faint">—</span>}</TableCell>
                        <TableCell>
                          {r?.cited && r.citationUrl ? (
                            <a href={r.citationUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[12.5px] text-ink underline-offset-2 hover:underline">
                              {r.citedPagePath ?? "Link"} <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="text-ink-faint">—</span>
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="whitespace-nowrap text-ink-muted">{filter === "all" ? formatRelative(p.lastCheckedAt) : formatRelative(r?.checkedAt)}</TableCell>
                    <TableCell>{p.isActive ? <Badge variant="success" dot>Tracking</Badge> : <Badge variant="neutral" dot>Paused</Badge>}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Prompt actions">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditing(p)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toggle(p)}>{p.isActive ? <><Ban /> Pause tracking</> : <><Play /> Resume tracking</>}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onSelect={() => setDeleting(p)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PromptDialog websiteId={websiteId} prompt={editing === "new" ? null : editing} open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} />
      <PromptDetailDialog prompt={viewing} engines={engines} onOpenChange={(o) => !o && setViewing(null)} />
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete this prompt?" description="Its research history will be removed as well. This can't be undone." confirmLabel="Delete" destructive loading={pending} onConfirm={remove} />
    </>
  );
}

function PromptDialog({ websiteId, prompt, open, onOpenChange }: { websiteId: string; prompt: PromptWithResults | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const key = prompt?.id ?? "new";

  const submit = (form: FormData) => {
    const input = {
      text: String(form.get("text") ?? ""),
      category: String(form.get("category") ?? ""),
      intent: String(form.get("intent") ?? "COMMERCIAL"),
      priority: String(form.get("priority") ?? "MEDIUM"),
    };
    start(async () => {
      const r = prompt ? await updatePrompt(websiteId, prompt.id, input) : await createPrompt(websiteId, input);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error);
        return;
      }
      toast.success(r.message);
      setErrors({});
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={submit} key={key}>
          <DialogHeader>
            <DialogTitle>{prompt ? "Edit prompt" : "Add a prompt"}</DialogTitle>
            <DialogDescription>Write it the way a real buyer would ask an AI assistant.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <Field label="Prompt" htmlFor="text" error={errors.text}>
              <Textarea id="text" name="text" defaultValue={prompt?.text ?? ""} placeholder="Best Shopify agencies for fashion brands" className="min-h-[80px]" invalid={Boolean(errors.text)} autoFocus />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Category" htmlFor="category" error={errors.category}>
                <Input id="category" name="category" defaultValue={prompt?.category ?? ""} placeholder="Discovery" />
              </Field>
              <Field label="Intent" htmlFor="intent">
                <Select id="intent" name="intent" defaultValue={(prompt?.intent as PromptIntent) ?? "COMMERCIAL"}>
                  {PROMPT_INTENTS.map((i) => (
                    <option key={i} value={i}>
                      {i.charAt(0) + i.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority" htmlFor="priority">
                <Select id="priority" name="priority" defaultValue={(prompt?.priority as Priority) ?? "MEDIUM"}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {prompt ? "Save changes" : "Add prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PromptDetailDialog({ prompt, engines, onOpenChange }: { prompt: PromptWithResults | null; engines: { key: string; name: string }[]; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={Boolean(prompt)} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        {prompt && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8">“{prompt.text}”</DialogTitle>
              <DialogDescription>
                Mentioned on {prompt.mentionedOn} of {engines.length} engines · cited on {prompt.citedOn} · best position {prompt.bestPosition ? `#${prompt.bestPosition}` : "—"}
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {engines.map((e) => {
                  const r = prompt.perEngine[e.key];
                  return (
                    <div key={e.key} className="rounded-xl border border-line p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
                          <EngineIcon engine={e.key} size={14} /> {e.name}
                        </span>
                        <ResultPill r={r} />
                      </div>
                      {r ? (
                        <>
                          {r.answerSummary && <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-muted">{r.answerSummary}</p>}
                          {r.rivals.length > 0 && (
                            <p className="mt-2 text-[12px] text-ink-faint">
                              Also named: {r.rivals.map((x) => `${x.name}${x.position ? ` (#${x.position})` : ""}`).join(", ")}
                            </p>
                          )}
                          {r.cited && r.citationUrl && (
                            <a href={r.citationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink underline-offset-2 hover:underline">
                              Cited page: {r.citedPagePath} <ExternalLink className="size-3" />
                            </a>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
                            <span>Checked {formatDate(r.checkedAt)}</span>
                            {r.sentiment && <StatusBadge status={r.sentiment} dot={false} className="px-1.5 py-0 text-[10px]" />}
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-[12.5px] text-ink-faint">Not checked yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {prompt.history.length > engines.length && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">History</p>
                  <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
                    {prompt.history.slice(0, 12).map((h) => (
                      <li key={h.id} className="flex items-center gap-3 px-3 py-2 text-[12.5px]">
                        <EngineIcon engine={h.engineKey} size={13} />
                        <span className="w-24 text-ink-muted">{formatDate(h.checkedAt)}</span>
                        <ResultPill r={h} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
