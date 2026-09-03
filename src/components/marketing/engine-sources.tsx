import { ExternalLink } from "lucide-react";
import { EngineIcon } from "@/components/ui/engine-icon";
import { cn } from "@/lib/utils";

/**
 * Primary sources for the claim that these engines crawl and cite the open web.
 *
 * Each link is the operator's own crawler documentation — the thing a sceptical
 * reader would want to check, and the same standard of citation we tell
 * customers to hold their own pages to.
 */
const SOURCES = [
  {
    engine: "chatgpt",
    name: "OpenAI",
    href: "https://platform.openai.com/docs/bots",
    label: "GPTBot & crawler controls",
  },
  {
    engine: "perplexity",
    name: "Perplexity",
    href: "https://docs.perplexity.ai/guides/bots",
    label: "PerplexityBot documentation",
  },
  {
    engine: "gemini",
    name: "Google",
    href: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
    label: "Google-Extended & crawlers",
  },
  {
    engine: "claude",
    name: "Anthropic",
    href: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    label: "ClaudeBot and site owners",
  },
];

export function EngineSources({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface-2 p-6 md:p-7", className)}>
      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">Don&apos;t take our word for it.</span> Every major engine crawls the open
        web to build its answers, and each one publishes exactly how — including the user-agent it sends and the controls
        you have over it.
      </p>
      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {SOURCES.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 transition-colors hover:border-ink/25"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2">
                <EngineIcon engine={s.engine} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-ink">{s.name}</span>
                <span className="block truncate text-[12px] text-ink-faint">{s.label}</span>
              </span>
              <ExternalLink className="size-3.5 shrink-0 text-ink-faint transition-colors group-hover:text-brand-500" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
