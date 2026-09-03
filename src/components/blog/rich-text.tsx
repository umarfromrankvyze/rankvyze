import { Fragment } from "react";
import Link from "next/link";

/**
 * A deliberately tiny inline syntax for post copy: `[label](href)`, `**bold**`
 * and `` `code` ``.
 *
 * Parsed into React nodes rather than injected as HTML — post content is
 * trusted, but `dangerouslySetInnerHTML` on a content pipeline is the kind of
 * shortcut that stops being safe the moment someone adds a CMS.
 */

const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const external = /^https?:\/\//.test(href);
          return external ? (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] transition-colors hover:decoration-brand-500"
            >
              {label}
            </a>
          ) : (
            <Link
              key={i}
              href={href}
              className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] transition-colors hover:decoration-brand-500"
            >
              {label}
            </Link>
          );
        }

        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {bold[1]}
            </strong>
          );
        }

        const code = /^`([^`]+)`$/.exec(part);
        if (code) {
          return (
            <code
              key={i}
              className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.87em] text-ink"
            >
              {code[1]}
            </code>
          );
        }

        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Plain text for the same syntax — for metadata, JSON-LD and OG images. */
export function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
