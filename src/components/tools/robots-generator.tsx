"use client";

import { useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * robots.txt generator.
 *
 * Client-side: there is nothing to fetch, and the output is a text file built
 * from choices, not from anyone's site.
 *
 * The angle that makes this ours rather than another generic generator is the
 * AI crawler section. Every other tool in this category emits Googlebot rules
 * and stops. The distinction that actually costs people visibility — a training
 * crawler and a search crawler from the same vendor being separate agents — is
 * surfaced here as two separate toggles, because conflating them is the single
 * most common self-inflicted AEO wound.
 */

interface AgentGroup {
  id: string;
  label: string;
  note: string;
  agents: string[];
  /** Default on. Blocking these is a deliberate choice, not a default. */
  allow: boolean;
}

const INITIAL_GROUPS: AgentGroup[] = [
  {
    id: "ai-search",
    label: "AI search crawlers",
    note: "OAI-SearchBot, PerplexityBot, Claude-SearchBot. Blocking these removes you from AI answers entirely.",
    agents: ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot"],
    allow: true,
  },
  {
    id: "ai-training",
    label: "AI training crawlers",
    note: "GPTBot, ClaudeBot, Google-Extended, Applebot-Extended. Blocking these is legitimate if you don't want your content training models — it does not remove you from AI search.",
    agents: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"],
    allow: true,
  },
  {
    id: "ai-user",
    label: "On-demand fetchers",
    note: "ChatGPT-User, Perplexity-User, Claude-User. These fetch a page only when a person asks about it directly.",
    agents: ["ChatGPT-User", "Perplexity-User", "Claude-User"],
    allow: true,
  },
  {
    id: "search",
    label: "Traditional search",
    note: "Googlebot and Bingbot. Bing also feeds Copilot.",
    agents: ["Googlebot", "Bingbot"],
    allow: true,
  },
];

const COMMON_DISALLOW = ["/admin", "/dashboard", "/api", "/checkout", "/cart", "/account", "/search", "/*?"];

export function RobotsGenerator() {
  const [groups, setGroups] = useState<AgentGroup[]>(INITIAL_GROUPS);
  const [siteUrl, setSiteUrl] = useState("");
  const [disallow, setDisallow] = useState<string[]>(["/admin", "/dashboard", "/api"]);
  const [custom, setCustom] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, allow: !x.allow } : x)));

  const origin = (() => {
    const raw = siteUrl.trim();
    if (!raw) return null;
    try {
      return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
    } catch {
      return null;
    }
  })();

  const paths = disallow.filter(Boolean);

  const lines: string[] = [];
  for (const group of groups) {
    lines.push(`# ${group.label}`);
    for (const agent of group.agents) {
      lines.push(`User-agent: ${agent}`);
    }
    if (group.allow) {
      lines.push("Allow: /");
      for (const p of paths) lines.push(`Disallow: ${p}`);
    } else {
      lines.push("Disallow: /");
    }
    lines.push("");
  }

  lines.push("# Everything else");
  lines.push("User-agent: *");
  lines.push("Allow: /");
  for (const p of paths) lines.push(`Disallow: ${p}`);
  if (crawlDelay.trim()) lines.push(`Crawl-delay: ${crawlDelay.trim()}`);
  lines.push("");

  if (origin) lines.push(`Sitemap: ${origin}/sitemap.xml`);

  const output = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is selectable.
    }
  };

  const blockedSearch = groups.find((g) => g.id === "ai-search" && !g.allow);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Field label="Your site URL" htmlFor="siteUrl" hint="Used for the Sitemap line. Leave blank to omit it.">
          <Input id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="yoursite.com" />
        </Field>

        <div>
          <p className="text-[13px] font-semibold text-ink">Who can crawl you</p>
          <div className="mt-3 space-y-2.5">
            {groups.map((group) => (
              <label
                key={group.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink/20"
              >
                <input
                  type="checkbox"
                  checked={group.allow}
                  onChange={() => toggle(group.id)}
                  className="mt-0.5 size-4 shrink-0 accent-brand-500 pointer-coarse:size-5"
                />
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-ink">
                    {group.allow ? "Allow" : "Block"} {group.label.toLowerCase()}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">{group.note}</span>
                </span>
              </label>
            ))}
          </div>

          {blockedSearch && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-warning-soft p-3.5 text-[13px] leading-relaxed text-amber-900">
              You&rsquo;ve blocked the AI <strong>search</strong> crawlers. That removes you from ChatGPT, Perplexity and
              Claude answers completely — no amount of content or schema work will get you back in. If the intention was
              to keep your writing out of model training, block the training crawlers instead.
            </p>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-ink">Paths to keep out</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Applies to every group above. robots.txt is a request, not access control — anything that must stay private
            needs authentication.
          </p>
          <div className="mt-3 space-y-2">
            {disallow.map((path, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={path}
                  aria-label={`Disallowed path ${i + 1}`}
                  onChange={(e) => setDisallow(disallow.map((p, j) => (j === i ? e.target.value : p)))}
                />
                <button
                  type="button"
                  aria-label="Remove path"
                  onClick={() => setDisallow(disallow.filter((_, j) => j !== i))}
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-ink-faint transition-colors hover:border-red-200 hover:text-red-600 pointer-coarse:size-11"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDisallow([...disallow, ""])}>
              <Plus /> Add path
            </Button>
            {COMMON_DISALLOW.filter((p) => !disallow.includes(p)).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDisallow([...disallow, p])}
                className="inline-flex items-center rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 font-mono text-[12px] text-ink-muted transition-colors hover:border-brand-400 hover:text-brand-600 pointer-coarse:min-h-11"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="Crawl-delay"
          htmlFor="crawlDelay"
          hint="Seconds between requests. Google ignores it; Bing and others honour it. Leave blank unless a crawler is overloading you."
        >
          <Input
            id="crawlDelay"
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder=""
            className="max-w-[140px]"
          />
        </Field>

        <Field label="Extra lines" htmlFor="custom" hint="Appended verbatim. Optional.">
          <Input id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="" />
        </Field>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">Your robots.txt</p>
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className={cn("mt-3 max-h-[32rem] overflow-auto rounded-2xl border border-ink/10 bg-ink p-5")}>
          <pre className="text-[12.5px] leading-[1.7] text-white/90">
            <code>{custom.trim() ? `${output}\n${custom.trim()}` : output}</code>
          </pre>
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Save this as <code className="text-ink-muted">robots.txt</code> at your domain root, served as{" "}
          <code className="text-ink-muted">text/plain</code>. It applies only to that exact host and protocol — a
          subdomain needs its own. Nothing you type here leaves your browser.
        </p>
      </div>
    </div>
  );
}
