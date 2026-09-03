import { ExternalLink, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { PostBlock } from "@/content/blog/types";
import { slugifyHeading } from "@/content/blog/types";
import { RichText } from "./rich-text";
import { cn } from "@/lib/utils";

const CALLOUT = {
  note: { icon: Info, ring: "border-line bg-surface-2", mark: "text-ink-faint" },
  tip: { icon: Lightbulb, ring: "border-brand-500/25 bg-brand-500/[0.06]", mark: "text-brand-600" },
  warn: { icon: TriangleAlert, ring: "border-amber-300/60 bg-amber-50", mark: "text-amber-700" },
} as const;

function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[16.5px] leading-[1.78] text-ink-muted">
          <RichText text={block.text} />
        </p>
      );

    case "h2":
      return (
        <h2
          id={slugifyHeading(block.text)}
          className="scroll-mt-28 pt-6 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[28px]"
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3 className="pt-2 font-display text-[18px] font-bold tracking-[-0.01em] text-ink md:text-[20px]">
          {block.text}
        </h3>
      );

    case "ul":
      return (
        <ul className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[16.5px] leading-[1.7] text-ink-muted">
              <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-brand-500" />
              <span className="min-w-0">
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[16.5px] leading-[1.7] text-ink-muted">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const { icon: Icon, ring, mark } = CALLOUT[block.tone];
      return (
        <aside className={cn("flex gap-4 rounded-2xl border p-5", ring)}>
          <Icon className={cn("mt-0.5 size-[18px] shrink-0", mark)} />
          <div className="min-w-0">
            {block.title && <p className="text-[15px] font-semibold text-ink">{block.title}</p>}
            <p className={cn("text-[15.5px] leading-[1.65] text-ink-muted", block.title && "mt-1.5")}>
              <RichText text={block.text} />
            </p>
          </div>
        </aside>
      );
    }

    case "code":
      return (
        <figure>
          <pre className="overflow-x-auto rounded-2xl border border-ink/10 bg-ink p-5 text-[13.5px] leading-[1.65] text-white/90">
            <code className="font-mono">{block.code}</code>
          </pre>
          {block.caption && <figcaption className="mt-2.5 text-[13.5px] text-ink-faint">{block.caption}</figcaption>}
        </figure>
      );

    case "table":
      return (
        <figure>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="bg-surface-2">
                  {block.head.map((h, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="border-b border-line px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-faint"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-4 py-3.5 align-top text-[15px] leading-[1.6] text-ink-muted",
                          j === 0 && "font-medium text-ink",
                        )}
                      >
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption className="mt-2.5 text-[13.5px] text-ink-faint">{block.caption}</figcaption>}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="border-l-2 border-brand-500 pl-5">
          <p className="font-display text-[19px] leading-[1.55] text-ink md:text-[21px]">{block.text}</p>
          {block.cite && <cite className="mt-2 block text-[14px] not-italic text-ink-faint">— {block.cite}</cite>}
        </blockquote>
      );

    case "steps":
      return (
        <ol className="space-y-4">
          {block.items.map((step, i) => (
            <li key={i} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start gap-3.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-[12.5px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[15.5px] font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-[15.5px] leading-[1.65] text-ink-muted">
                    <RichText text={step.text} />
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      );

    case "faq":
      return (
        <section className="rounded-2xl border border-line bg-surface-2 p-6 md:p-8">
          <h2 id="faq" className="scroll-mt-28 font-display text-[22px] font-bold tracking-[-0.02em] text-ink">
            Frequently asked questions
          </h2>
          <dl className="mt-6 divide-y divide-line">
            {block.items.map((item, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <dt className="text-[16px] font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 text-[15.5px] leading-[1.7] text-ink-muted">
                  <RichText text={item.a} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "links":
      return (
        <section>
          {block.title && (
            <h2
              id={slugifyHeading(block.title)}
              className="scroll-mt-28 font-display text-[20px] font-bold tracking-[-0.02em] text-ink"
            >
              {block.title}
            </h2>
          )}
          <ul className="mt-4 space-y-3">
            {block.items.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink/25 hover:bg-surface-2"
                >
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand-500" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-ink">{l.label}</span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-muted">{l.note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      );
  }
}

export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
