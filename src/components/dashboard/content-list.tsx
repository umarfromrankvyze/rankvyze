"use client";

import { useState, useTransition } from "react";
import { FileText, PenLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, titleCase } from "@/lib/utils";
import { CONTENT_STATUSES, type ContentStatus } from "@/lib/enums";
import { generateContentBrief, setContentStatus } from "@/server/actions/workspace";

export interface ContentRow {
  id: string;
  title: string;
  targetPrompt: string | null;
  potential: string;
  intent: string;
  contentType: string;
  status: string;
  briefing: string | null;
  estimatedLift: number;
}

export function ContentList({ websiteId, items }: { websiteId: string; items: ContentRow[] }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<ContentRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();

  const generate = (row: ContentRow) => {
    setBusy(row.id);
    start(async () => {
      const r = await generateContentBrief(websiteId, row.id);
      setBusy(null);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message);
      setOpen({ ...row, briefing: r.data?.brief ?? row.briefing, status: row.status === "IDEA" ? "PLANNED" : row.status });
    });
  };

  const setStatus = (row: ContentRow, status: ContentStatus) => {
    setBusy(row.id);
    start(async () => {
      const r = await setContentStatus(websiteId, row.id, status);
      setBusy(null);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
    });
  };

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);

  if (items.length === 0) {
    return <EmptyState icon={PenLine} title="No content opportunities yet" description="Content gaps are identified from prompts where competitors are cited and you're not." />;
  }

  return (
    <>
      <div className="mb-5 flex items-center gap-1 overflow-x-auto rounded-lg bg-surface-3 p-1 scrollbar-thin">
        {["all", ...CONTENT_STATUSES].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", filter === s ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink")}>
            {s === "all" ? "All" : titleCase(s)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((row) => (
          <Card key={row.id} className="flex flex-col p-5 transition-shadow hover:shadow-lift">
            <div className="flex items-start justify-between gap-2">
              <Badge variant={row.potential === "HIGH" ? "brand" : row.potential === "MEDIUM" ? "warning" : "neutral"} dot>
                {titleCase(row.potential)} potential
              </Badge>
              <StatusBadge status={row.status} />
            </div>
            <h3 className="mt-3 font-display text-[16px] font-semibold leading-snug tracking-tight text-ink">{row.title}</h3>
            {row.targetPrompt && <p className="mt-1.5 text-[12.5px] text-ink-muted">Targets “{row.targetPrompt}”</p>}
            <dl className="mt-4 grid grid-cols-3 gap-2 text-[11.5px]">
              <div>
                <dt className="text-ink-faint">Intent</dt>
                <dd className="font-medium capitalize text-ink">{row.intent.toLowerCase()}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Type</dt>
                <dd className="font-medium text-ink">{titleCase(row.contentType)}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Est. lift</dt>
                <dd className="font-medium tabular-nums text-ink">+{row.estimatedLift} pts</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
              {row.briefing ? (
                <Button variant="outline" size="sm" onClick={() => setOpen(row)}>
                  <FileText /> View brief
                </Button>
              ) : (
                <Button size="sm" onClick={() => generate(row)} loading={busy === row.id}>
                  <Sparkles /> Generate Content
                </Button>
              )}
              <div className="ml-auto w-32">
                <Select value={row.status} onChange={(e) => setStatus(row, e.target.value as ContentStatus)} className="h-8 text-[12px]" disabled={busy === row.id} aria-label="Status">
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent size="lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>Content brief · {titleCase(open.contentType)} · {open.intent.toLowerCase()} intent</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-ink">{open.briefing}</pre>
                <p className="mt-4 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-ink-muted">
                  This brief is assembled from your website profile and the research data. A writer (or a future model integration) turns it into the finished page.
                </p>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => generate(open)} loading={busy === open.id}>
                  <Sparkles /> Regenerate
                </Button>
                <Button onClick={() => setOpen(null)}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
