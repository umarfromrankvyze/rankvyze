"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Info, Loader2, TriangleAlert, X } from "lucide-react";
import type { CrawlerReport } from "@/lib/tools/crawlers";
import type { DomainAgeReport } from "@/lib/tools/domain-age";
import type { MetaReport } from "@/lib/tools/meta";
import type { SchemaReport } from "@/lib/tools/schema";
import type { VisibilityReport } from "@/lib/tools/visibility";
import { runCrawlerCheck, runDomainAgeCheck, runMetaCheck, runSchemaCheck, runVisibilityCheck } from "@/server/actions/tools";
import { initialActionState, type ActionResult } from "@/server/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Shared shell for every tool: one input, one action, one result region.
 *
 * The result is rendered by a per-tool component below rather than a generic
 * table, because the useful shape differs — a crawler report is a matrix, a
 * domain lookup is a record, a meta check is a preview.
 */

type Slug = "ai-visibility-checker" | "ai-crawler-checker" | "schema-markup-checker" | "meta-tag-checker" | "domain-age-checker";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- one map, four differently-shaped reports
const ACTIONS: Record<Slug, any> = {
  "ai-visibility-checker": runVisibilityCheck,
  "ai-crawler-checker": runCrawlerCheck,
  "schema-markup-checker": runSchemaCheck,
  "meta-tag-checker": runMetaCheck,
  "domain-age-checker": runDomainAgeCheck,
};

export function ToolRunner({ slug, placeholder, action }: { slug: Slug; placeholder: string; action: string }) {
  const [state, formAction, pending] = useActionState<ActionResult<unknown>, FormData>(ACTIONS[slug], initialActionState);

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          required
          placeholder={placeholder}
          aria-label="Website address"
          className="h-12 text-[15px] sm:flex-1"
        />
        <Button type="submit" size="lg" className="h-12 shrink-0" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> Checking…
            </>
          ) : (
            <>
              {action} <ArrowRight />
            </>
          )}
        </Button>
      </form>

      {!state.ok && state.error && (
        <p className="mt-3 flex items-start gap-2 text-[14px] text-danger" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      {state.ok && state.data !== undefined && (
        <div className="mt-8">
          {slug === "ai-visibility-checker" && <VisibilityResult report={state.data as VisibilityReport} />}
          {slug === "ai-crawler-checker" && <CrawlerResult report={state.data as CrawlerReport} />}
          {slug === "schema-markup-checker" && <SchemaResult report={state.data as SchemaReport} />}
          {slug === "meta-tag-checker" && <MetaResult report={state.data as MetaReport} />}
          {slug === "domain-age-checker" && <DomainAgeResult report={state.data as DomainAgeReport} />}
        </div>
      )}
    </div>
  );
}

// --- shared bits ---------------------------------------------------------

function StatusPill({ status }: { status: "pass" | "warn" | "fail" }) {
  const map = {
    pass: { label: "Pass", className: "border-green-200 bg-success-soft text-green-700" },
    warn: { label: "Check", className: "border-amber-200 bg-warning-soft text-amber-700" },
    fail: { label: "Fail", className: "border-red-200 bg-danger-soft text-red-700" },
  } as const;
  const { label, className } = map[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11.5px] font-semibold", className)}>
      {label}
    </span>
  );
}

function CheckList({ checks }: { checks: { key: string; label: string; status: "pass" | "warn" | "fail"; detail: string }[] }) {
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
      {checks.map((c) => (
        <li key={c.key} className="flex items-start gap-3.5 p-4">
          <StatusPill status={c.status} />
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold text-ink">{c.label}</p>
            <p className="mt-0.5 break-words text-[13.5px] leading-relaxed text-ink-muted">{c.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-white p-5">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
        {note && <span className="text-[12px] text-ink-faint">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-[13px] text-ink-faint sm:w-40">{label}</dt>
      <dd className="min-w-0 break-words text-[14px] text-ink">{value}</dd>
    </div>
  );
}

// --- AI crawler checker --------------------------------------------------

function CrawlerResult({ report }: { report: CrawlerReport }) {
  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface-2 p-5">
        <p className="text-[15px] font-semibold text-ink">
          {report.blockedCount === 0
            ? "No AI crawler is blocked in robots.txt."
            : `${report.blockedCount} of ${report.crawlers.length} AI crawlers are blocked in robots.txt.`}
        </p>
        <p className="mt-1 break-all text-[13px] text-ink-muted">
          {report.robotsFound ? `Read from ${report.robotsUrl}` : `No robots.txt found at ${report.robotsUrl} (HTTP ${report.robotsStatus}) — everything is allowed by default.`}
        </p>
        {report.sitemaps.length > 0 && (
          <p className="mt-1 break-all text-[13px] text-ink-muted">Sitemap declared: {report.sitemaps.join(", ")}</p>
        )}
      </div>

      {report.edgeBlocked.length > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-danger-soft p-5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />
          <div>
            <p className="text-[14.5px] font-semibold text-red-800">Blocked at the edge, not in robots.txt</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-red-900">
              {report.edgeBlocked.join(", ")} {report.edgeBlocked.length === 1 ? "is" : "are"} permitted by your robots.txt
              but your server refused the request. That is a CDN, WAF or bot-management rule — check Cloudflare or
              equivalent, because no change to robots.txt will fix it.
            </p>
          </div>
        </div>
      )}

      <Panel title="Every AI crawler" note="Live column is a real request as that agent">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {["Crawler", "Operator", "robots.txt", "Live", "If blocked"].map((h) => (
                  <th key={h} className="pb-2 pr-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.crawlers.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3 align-top">
                    <span className="font-mono text-[12.5px] font-medium text-ink">{c.name}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-faint">{c.purpose}</span>
                  </td>
                  <td className="py-2.5 pr-3 align-top text-[13px] text-ink-muted">{c.operator}</td>
                  <td className="py-2.5 pr-3 align-top">
                    <span className={cn("inline-flex items-center gap-1 text-[13px] font-medium", c.allowed ? "text-green-700" : "text-red-700")}>
                      {c.allowed ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      {c.allowed ? "Allowed" : "Blocked"}
                    </span>
                    {c.rule && <span className="mt-0.5 block font-mono text-[11.5px] text-ink-faint">{c.rule}</span>}
                    {!c.rule && c.source === "wildcard" && <span className="mt-0.5 block text-[11.5px] text-ink-faint">via User-agent: *</span>}
                  </td>
                  <td className="py-2.5 pr-3 align-top text-[13px]">
                    {c.liveStatus === null ? (
                      <span className="text-ink-faint">—</span>
                    ) : (
                      <span className={c.liveBlocked ? "font-medium text-red-700" : "text-ink-muted"}>{c.liveStatus}</span>
                    )}
                  </td>
                  <td className="py-2.5 align-top text-[12.5px] leading-snug text-ink-muted">{c.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {report.robotsFound && (
        <Panel title="Your robots.txt">
          <pre className="max-h-80 overflow-auto rounded-xl border border-ink/10 bg-ink p-4 text-[12.5px] leading-relaxed text-white/90">
            <code>{report.robotsText}</code>
          </pre>
        </Panel>
      )}
    </div>
  );
}

// --- schema checker ------------------------------------------------------

function SchemaResult({ report }: { report: SchemaReport }) {
  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface-2 p-5">
        <p className="text-[15px] font-semibold text-ink">
          {report.blocks === 0 ? "No structured data found." : `${report.blocks} node${report.blocks === 1 ? "" : "s"} found: ${report.types.join(", ")}`}
        </p>
        <p className="mt-1 break-all text-[13px] text-ink-muted">{report.finalUrl}</p>
      </div>

      <div className="mt-4">
        <CheckList checks={report.checks} />
      </div>

      {report.findings.length > 0 && (
        <Panel title="Each node" note="Missing = identity properties an engine looks for">
          <ul className="space-y-3">
            {report.findings.map((f, i) => (
              <li key={i} className="rounded-xl border border-line p-3.5">
                <p className="font-mono text-[13px] font-semibold text-ink">{f.type}</p>
                {f.id && <p className="mt-0.5 break-all font-mono text-[11.5px] text-ink-faint">{f.id}</p>}
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                  <span className="text-ink-faint">Present:</span> {f.keys.join(", ") || "nothing"}
                </p>
                {f.missing.length > 0 && (
                  <p className="mt-1 text-[12.5px] leading-relaxed text-amber-700">Missing: {f.missing.join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <p className="mt-4 text-[13px] text-ink-muted">
        For full vocabulary validation, run the same page through{" "}
        <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
          validator.schema.org
        </a>
        .
      </p>
    </div>
  );
}

// --- meta tag checker ----------------------------------------------------

function MetaResult({ report }: { report: MetaReport }) {
  const displayUrl = report.finalUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <div>
      {/* A rough SERP preview. Google renders on pixel width, so this is an
          approximation of placement rather than a pixel-accurate mock. */}
      <Panel title="Search result preview" note="Approximate — Google truncates on pixel width">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="truncate text-[13px] text-[#4d5156]">{displayUrl}</p>
          <p className="mt-0.5 truncate text-[19px] leading-snug text-[#1a0dab]">{report.title ?? "(no title)"}</p>
          <p className="mt-1 line-clamp-2 text-[13.5px] leading-[1.55] text-[#4d5156]">
            {report.description ?? "(no meta description — Google will write one from the page)"}
          </p>
        </div>
      </Panel>

      <div className="mt-4">
        <CheckList checks={report.checks} />
      </div>

      <Panel title="Everything found">
        <dl>
          <Row label="Final URL" value={<span className="break-all">{report.finalUrl}</span>} />
          {report.redirected && <Row label="Redirected" value="Yes — the address you entered redirects here" />}
          <Row label="Title" value={report.title ? `${report.title} (${report.title.length})` : "—"} />
          <Row label="Description" value={report.description ? `${report.description} (${report.description.length})` : "—"} />
          <Row label="Canonical" value={report.canonical ? <span className="break-all">{report.canonical}</span> : "—"} />
          <Row label="Robots" value={report.robots ?? "not set"} />
          <Row label="H1" value={report.h1.length ? report.h1.join(" | ") : "—"} />
          <Row label="H2 count" value={report.h2Count} />
          <Row label="og:title" value={report.ogTitle ?? "—"} />
          <Row label="og:image" value={report.ogImage ? <span className="break-all">{report.ogImage}</span> : "—"} />
          <Row label="twitter:card" value={report.twitterCard ?? "—"} />
          <Row label="Language" value={report.lang ?? "—"} />
          <Row label="Viewport" value={report.viewport ?? "—"} />
          <Row label="Words without JS" value={report.wordCount.toLocaleString()} />
        </dl>
      </Panel>
    </div>
  );
}

// --- domain age ----------------------------------------------------------

function DomainAgeResult({ report }: { report: DomainAgeReport }) {
  if (report.unsupported) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-warning-soft p-5">
        <p className="text-[14.5px] font-semibold text-amber-800">No RDAP record for {report.domain}</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-amber-900">
          That registry doesn&rsquo;t publish RDAP yet — several country-code TLDs still only offer WHOIS. Rather than
          estimate a registration date, this tool reports that it doesn&rsquo;t know.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface-2 p-6 text-center">
        <p className="font-mono text-[13px] text-ink-muted">{report.domain}</p>
        <p className="mt-2 font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-ink">
          {report.ageLabel ?? "Unknown age"}
        </p>
        {report.registered && (
          <p className="mt-2 text-[13.5px] text-ink-muted">
            Registered {new Date(report.registered).toLocaleDateString("en-US", { dateStyle: "long" })}
            {report.ageDays !== null && ` · ${report.ageDays.toLocaleString()} days`}
          </p>
        )}
      </div>

      <Panel title="Registry record" note={`Source: ${report.source} (RDAP)`}>
        <dl>
          <Row label="Registrar" value={report.registrar ?? "—"} />
          <Row label="Registered" value={report.registered ? new Date(report.registered).toISOString().slice(0, 10) : "—"} />
          <Row label="Last changed" value={report.updated ? new Date(report.updated).toISOString().slice(0, 10) : "—"} />
          <Row label="Expires" value={report.expires ? new Date(report.expires).toISOString().slice(0, 10) : "—"} />
          <Row label="Status" value={report.statuses.length ? report.statuses.join(", ") : "—"} />
          <Row
            label="Nameservers"
            value={report.nameservers.length ? <span className="break-all font-mono text-[12.5px]">{report.nameservers.join(", ")}</span> : "—"}
          />
        </dl>
      </Panel>

      <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
        Domain age is not itself a Google ranking factor. What correlates is what an older domain usually accumulated —
        links, history and trust. A ten-year-old domain with no links does not outrank a one-year-old with a real
        reputation.
      </p>
    </div>
  );
}

// --- AI visibility checker -----------------------------------------------

function VisibilityResult({ report }: { report: VisibilityReport }) {
  const { entity } = report;
  const band =
    report.readiness >= 80 ? "Ready" : report.readiness >= 55 ? "Nearly there" : report.readiness >= 30 ? "Gaps" : "Not ready";

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface-2 p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">AI readiness</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="font-display text-[42px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">
            {report.readiness}
          </span>
          <span className="mb-1 text-[15px] text-ink-muted">/ 100 · {band}</span>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          {entity.statement
            ? <>An engine reading this page can tell: <strong className="font-semibold text-ink">“{entity.statement}”</strong></>
            : "An engine reading this page cannot form the sentence “X is a Y for Z”. That is the first thing to fix — everything else depends on it."}
        </p>
      </div>

      {/*
        The single most important thing on this page. Every other free "AI
        visibility" tool implies it queried the engines. This one did not, and
        says so before showing anything that could be mistaken for a result.
      */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
        <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
        <div className="min-w-0 text-[13.5px] leading-relaxed text-ink-muted">
          <p className="font-semibold text-ink">This did not ask ChatGPT anything.</p>
          <p className="mt-1">
            Querying the engines needs paid API keys and costs money per check, so no free tool can honestly claim to
            do it. What you have above is readiness — whether an engine <em>could</em> recommend you. To find out
            whether it currently <em>does</em>, run the questions below yourself.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <CheckList checks={report.checks} />
      </div>

      <Panel title="Test these yourself" note="Signed out, one fresh conversation each">
        <ol className="space-y-3">
          {report.prompts.map((p, i) => (
            <li key={i} className="rounded-xl border border-line bg-surface-2 p-4">
              <p className="font-mono text-[13.5px] leading-relaxed text-ink">{p.text}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">{p.why}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-2">
          {report.engines.map((e) => (
            <a
              key={e.key}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:border-brand-400 hover:text-brand-600 pointer-coarse:min-h-11"
            >
              Open {e.name} <ArrowRight className="size-3.5" />
            </a>
          ))}
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Record whether you were named, in what position, and which pages were cited. Repeat monthly against the same
          list — without a fixed set you can&rsquo;t tell a change that worked from a model update that happened to help.
        </p>
      </Panel>

      <Panel title="What we could read about you">
        <dl>
          <Row label="Name" value={entity.name ?? <span className="text-ink-faint">couldn&rsquo;t determine</span>} />
          <Row label="Category" value={entity.category ?? <span className="text-ink-faint">couldn&rsquo;t determine</span>} />
          <Row label="Audience" value={entity.audience ?? <span className="text-ink-faint">not stated</span>} />
          <Row label="Location" value={entity.location ?? <span className="text-ink-faint">not stated</span>} />
          <Row label="Page checked" value={<span className="break-all">{report.finalUrl}</span>} />
        </dl>
      </Panel>
    </div>
  );
}
