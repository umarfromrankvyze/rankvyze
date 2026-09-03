"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Quote, Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EngineIcon, engineMeta } from "@/components/ui/engine-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";

export interface CitationRow {
  id: string;
  url: string;
  pageTitle: string | null;
  pagePath: string | null;
  isOwnDomain: boolean;
  occurredAt: Date;
  engine: { key: string; name: string };
  prompt: { id: string; text: string } | null;
  competitor: { id: string; name: string; domain: string } | null;
}

export function CitationTable({ rows, engines }: { rows: CitationRow[]; engines: { key: string; name: string }[] }) {
  const [engine, setEngine] = useState("all");
  const [owner, setOwner] = useState<"all" | "own" | "competitor">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (engine === "all" || r.engine.key === engine) &&
        (owner === "all" || (owner === "own" ? r.isOwnDomain : !r.isOwnDomain)) &&
        (!q || r.url.toLowerCase().includes(q) || (r.pageTitle ?? "").toLowerCase().includes(q) || (r.prompt?.text ?? "").toLowerCase().includes(q) || (r.competitor?.name ?? "").toLowerCase().includes(q)),
    );
  }, [rows, engine, owner, query]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-surface-3 p-1">
          {(
            [
              ["all", "All"],
              ["own", "Your pages"],
              ["competitor", "Competitors"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setOwner(k)} className={cn("rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors", owner === k ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink")}>
              {label}
            </button>
          ))}
        </div>
        <div className="w-44">
          <Select value={engine} onChange={(e) => setEngine(e.target.value)} className="h-9">
            <option value="all">All engines</option>
            {engines.map((e) => (
              <option key={e.key} value={e.key}>
                {e.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="relative md:ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search URL, page or prompt" className="h-9 w-full pl-9 md:w-64" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Quote} title="No citations match" description={rows.length ? "Try widening the filters." : "Citations appear once AI answers link to a page — yours or a competitor's."} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Engine</TableHead>
                <TableHead className="min-w-[240px]">Prompt</TableHead>
                <TableHead className="min-w-[260px]">Cited page</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className={cn(!c.isOwnDomain && "bg-surface-2/60")}>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink">
                      <EngineIcon engine={c.engine.key} size={14} /> {engineMeta(c.engine.key).name}
                    </span>
                  </TableCell>
                  <TableCell className="text-ink">{c.prompt?.text ?? <span className="text-ink-faint">—</span>}</TableCell>
                  <TableCell>
                    <a href={c.url} target="_blank" rel="noreferrer" className="group block">
                      <span className="block truncate font-medium text-ink group-hover:underline underline-offset-2">{c.pageTitle ?? c.pagePath ?? c.url}</span>
                      <span className="inline-flex items-center gap-1 truncate text-[11.5px] text-ink-faint">
                        {c.url.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" />
                      </span>
                    </a>
                  </TableCell>
                  <TableCell>{c.isOwnDomain ? <Badge variant="brand">Your site</Badge> : <Badge variant="neutral">{c.competitor?.name ?? "Competitor"}</Badge>}</TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">{formatDate(c.occurredAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-[12px] text-ink-faint">
        Showing {filtered.length} of {rows.length} citations.
      </p>
    </>
  );
}
