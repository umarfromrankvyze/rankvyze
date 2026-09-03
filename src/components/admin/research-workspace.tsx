"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EngineIcon } from "@/components/ui/engine-icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, formatRelative } from "@/lib/utils";
import { SENTIMENTS } from "@/lib/enums";
import { completeResearchSession, deleteResearchResult, reopenResearchSession, saveResearchResult } from "@/server/actions/admin";
import type { FieldErrors } from "@/lib/validation";

export interface WorkspaceResult {
  id: string;
  promptId: string;
  engineId: string;
  mentioned: boolean;
  position: number | null;
  cited: boolean;
  citationUrl: string | null;
  sentiment: string | null;
  answerSummary: string | null;
  notes: string | null;
  screenshotUrl: string | null;
  checkedAt: Date;
  engine: { key: string; name: string };
  prompt: { id: string; text: string };
  rivals: { name: string; position: number | null }[];
}

interface Props {
  session: { id: string; title: string; status: string; notes: string | null; startedAt: Date; websiteId: string; ownerName: string | null };
  website: { id: string; name: string; domain: string; url: string };
  prompts: { id: string; text: string; category: string | null; priority: string }[];
  competitors: { id: string; name: string; domain: string }[];
  engines: { id: string; key: string; name: string }[];
  results: WorkspaceResult[];
}

export function ResearchWorkspace({ session, website, prompts, competitors, engines, results }: Props) {
  const [entry, setEntry] = useState<{ promptId: string; engineId: string } | null>(null);
  const [deleting, setDeleting] = useState<WorkspaceResult | null>(null);
  const [pending, start] = useTransition();

  // Latest result per prompt/engine in this session.
  const latest = useMemo(() => {
    const m = new Map<string, WorkspaceResult>();
    for (const r of results) {
      const k = `${r.promptId}:${r.engineId}`;
      const ex = m.get(k);
      if (!ex || ex.checkedAt < r.checkedAt) m.set(k, r);
    }
    return m;
  }, [results]);

  const total = prompts.length * engines.length;
  const done = latest.size;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggleStatus = () =>
    start(async () => {
      const r = session.status === "COMPLETED" ? await reopenResearchSession(session.id) : await completeResearchSession(session.id);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
    });

  const remove = () => {
    if (!deleting) return;
    start(async () => {
      const r = await deleteResearchResult(deleting.id);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setDeleting(null);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Progress</p>
              <p className="mt-1 font-display text-[26px] font-bold leading-none text-ink">
                {done} <span className="text-[15px] font-medium text-ink-faint">/ {total} checks</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={session.status} />
              <Button variant={session.status === "COMPLETED" ? "outline" : "dark"} size="sm" onClick={toggleStatus} loading={pending}>
                {session.status === "COMPLETED" ? (
                  <>
                    <RotateCcw /> Reopen
                  </>
                ) : (
                  <>
                    <Check /> Mark complete
                  </>
                )}
              </Button>
            </div>
          </div>
          <ProgressBar value={pct} tone="brand" size="md" className="mt-4" />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted">
            {engines.map((e) => {
              const n = prompts.filter((p) => latest.has(`${p.id}:${e.id}`)).length;
              return (
                <span key={e.id} className="inline-flex items-center gap-1.5">
                  <EngineIcon engine={e.key} size={12} /> {e.name} {n}/{prompts.length}
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white p-5 text-[13px] shadow-card lg:w-80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">How to research</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-ink-muted">
            <li>Open the engine in a fresh, signed-out session.</li>
            <li>Ask the prompt exactly as written.</li>
            <li>Record whether <strong className="text-ink">{website.name}</strong> is named, its position, and any link to {website.domain}.</li>
            <li>List every competitor named, in order.</li>
          </ol>
          {session.notes && <p className="mt-3 rounded-lg bg-surface-2 p-2.5 text-[12px] text-ink-muted">{session.notes}</p>}
        </div>
      </div>

      {/* Matrix */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="min-w-[320px] px-4 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-faint">Prompt</th>
                {engines.map((e) => (
                  <th key={e.id} className="min-w-[150px] px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-faint">
                    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                      <EngineIcon engine={e.key} size={13} /> {e.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="text-[13.5px] font-medium text-ink">{p.text}</p>
                    <p className="text-[11.5px] text-ink-faint">
                      {p.category ?? "—"} · {p.priority.toLowerCase()} priority
                    </p>
                  </td>
                  {engines.map((e) => {
                    const r = latest.get(`${p.id}:${e.id}`);
                    return (
                      <td key={e.id} className="px-3 py-2.5">
                        {r ? (
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => setEntry({ promptId: p.id, engineId: e.id })} className="group flex-1 rounded-lg border border-line px-2.5 py-1.5 text-left transition-colors hover:border-ink/25" title="Add a newer check">
                              {r.mentioned ? (
                                <span className={cn("text-[12px] font-semibold", r.position === 1 ? "text-brand-700" : "text-green-700")}>
                                  #{r.position ?? "?"} {r.cited && <span className="font-normal text-ink-muted">· cited</span>}
                                </span>
                              ) : (
                                <span className="text-[12px] font-medium text-red-700">Not mentioned</span>
                              )}
                              <span className="block text-[10.5px] text-ink-faint">
                                {r.rivals.length ? `${r.rivals.length} rival${r.rivals.length === 1 ? "" : "s"} · ` : ""}
                                {formatRelative(r.checkedAt)}
                              </span>
                            </button>
                            <button type="button" onClick={() => setDeleting(r)} className="rounded-md p-1 text-ink-faint hover:bg-danger-soft hover:text-danger" aria-label="Delete result">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full justify-start border-dashed text-ink-muted" onClick={() => setEntry({ promptId: p.id, engineId: e.id })} disabled={session.status === "COMPLETED"}>
                            <Plus /> Enter result
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EntryDialog
        key={entry ? `${entry.promptId}:${entry.engineId}` : "closed"}
        open={Boolean(entry)}
        onOpenChange={(o) => !o && setEntry(null)}
        sessionId={session.id}
        website={website}
        prompt={prompts.find((p) => p.id === entry?.promptId) ?? null}
        engine={engines.find((e) => e.id === entry?.engineId) ?? null}
        competitors={competitors}
        previous={entry ? latest.get(`${entry.promptId}:${entry.engineId}`) ?? null : null}
      />

      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete this result?" description="The customer's metrics recompute immediately. Derived citations and competitor mentions are removed too." confirmLabel="Delete" destructive loading={pending} onConfirm={remove} />
    </>
  );
}

function EntryDialog({
  open,
  onOpenChange,
  sessionId,
  website,
  prompt,
  engine,
  competitors,
  previous,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sessionId: string;
  website: { id: string; name: string; domain: string; url: string };
  prompt: { id: string; text: string } | null;
  engine: { id: string; key: string; name: string } | null;
  competitors: { id: string; name: string; domain: string }[];
  previous: WorkspaceResult | null;
}) {
  const [mentioned, setMentioned] = useState(previous?.mentioned ?? false);
  const [cited, setCited] = useState(previous?.cited ?? false);
  const [rivals, setRivals] = useState<{ name: string; position: number | null }[]>(previous?.rivals.map((r) => ({ name: r.name, position: r.position })) ?? []);
  const [customRival, setCustomRival] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();

  const toggleRival = (name: string) => {
    setRivals((prev) => (prev.some((r) => r.name === name) ? prev.filter((r) => r.name !== name) : [...prev, { name, position: prev.length + 1 + (mentioned ? 1 : 0) }]));
  };

  if (!prompt || !engine) return null;

  const submit = (f: FormData) => {
    const posRaw = String(f.get("position") ?? "");
    start(async () => {
      const r = await saveResearchResult({
        websiteId: website.id,
        promptId: prompt.id,
        engineId: engine.id,
        sessionId,
        mentioned,
        position: mentioned && posRaw ? Number(posRaw) : null,
        cited,
        citationUrl: String(f.get("citationUrl") ?? ""),
        sentiment: mentioned ? (String(f.get("sentiment") ?? "") || null) : null,
        answerSummary: String(f.get("answerSummary") ?? ""),
        notes: String(f.get("notes") ?? ""),
        screenshotUrl: String(f.get("screenshotUrl") ?? ""),
        competitors: rivals,
      });
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error);
        return;
      }
      toast.success(r.message);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <form action={submit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8">
              <EngineIcon engine={engine.key} size={18} /> {engine.name}
            </DialogTitle>
            <DialogDescription>“{prompt.text}”</DialogDescription>
            {previous && (
              <p className="text-[12px] text-ink-faint">
                Previous check {formatRelative(previous.checkedAt)}: {previous.mentioned ? `#${previous.position}` : "not mentioned"}. Saving adds a newer check; the latest one counts.
              </p>
            )}
          </DialogHeader>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mentioned">
                    {website.name} mentioned?
                  </Label>
                  <Switch id="mentioned" checked={mentioned} onCheckedChange={setMentioned} />
                </div>
                {mentioned && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Position" htmlFor="position" error={errors.position} hint="1 = named first">
                      <Input id="position" name="position" type="number" min={1} max={20} defaultValue={previous?.position ?? 1} invalid={Boolean(errors.position)} />
                    </Field>
                    <Field label="Sentiment" htmlFor="sentiment">
                      <Select id="sentiment" name="sentiment" defaultValue={previous?.sentiment ?? "NEUTRAL"}>
                        {SENTIMENTS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cited">Cited a {website.domain} page?</Label>
                  <Switch id="cited" checked={cited} onCheckedChange={setCited} />
                </div>
                {cited && (
                  <Field label="Citation URL" htmlFor="citationUrl" error={errors.citationUrl} className="mt-3">
                    <Input id="citationUrl" name="citationUrl" defaultValue={previous?.citationUrl ?? `${website.url}/`} placeholder={`${website.url}/page`} invalid={Boolean(errors.citationUrl)} />
                  </Field>
                )}
              </div>
            </div>

            <div>
              <Label>Competitors named in the answer</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {competitors.map((c) => {
                  const on = rivals.some((r) => r.name === c.name);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleRival(c.name)} className={cn("rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors", on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30")}>
                      {c.name}
                    </button>
                  );
                })}
                <div className="flex items-center gap-1">
                  <Input value={customRival} onChange={(e) => setCustomRival(e.target.value)} placeholder="Other brand…" className="h-9 w-40" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (customRival.trim()) toggleRival(customRival.trim());
                      setCustomRival("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
              {rivals.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {rivals.map((r, i) => (
                    <li key={r.name} className="flex items-center gap-2 text-[13px]">
                      <span className="w-6 text-ink-faint">#</span>
                      <Input type="number" min={1} max={20} value={r.position ?? ""} onChange={(e) => setRivals(rivals.map((x, j) => (j === i ? { ...x, position: e.target.value ? Number(e.target.value) : null } : x)))} className="h-8 w-16" aria-label={`${r.name} position`} />
                      <span className="flex-1 text-ink">{r.name}</span>
                      <button type="button" onClick={() => toggleRival(r.name)} className="text-ink-faint hover:text-danger" aria-label="Remove">
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Field label="Answer summary" htmlFor="answerSummary" hint="One or two sentences on how the engine described the brand (or who it recommended instead).">
              <Textarea id="answerSummary" name="answerSummary" defaultValue={previous?.answerSummary ?? ""} className="min-h-[80px]" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Screenshot URL" htmlFor="screenshotUrl">
                <Input id="screenshotUrl" name="screenshotUrl" defaultValue={previous?.screenshotUrl ?? ""} placeholder="https://drive…/screenshot.png" />
              </Field>
              <Field label="Internal notes" htmlFor="notes">
                <Input id="notes" name="notes" defaultValue={previous?.notes ?? ""} placeholder="Not shown to the customer" />
              </Field>
            </div>
            {previous?.screenshotUrl && (
              <a href={previous.screenshotUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-ink-muted hover:text-ink">
                Previous screenshot <ExternalLink className="size-3" />
              </a>
            )}
          </DialogBody>
          <DialogFooter>
            <Badge variant="neutral" className="mr-auto self-center">
              Source: manual
            </Badge>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              Save result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
