"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { PostBlock } from "@/content/blog/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Editor for a post body.
 *
 * Typed blocks rather than a rich-text field: the renderer switches on
 * `type`, and structured data is derived from the same blocks, so an FAQ has to
 * stay an FAQ all the way through rather than becoming a run of headings a
 * parser has to guess at.
 *
 * State is serialised into a hidden input, so the surrounding form posts as a
 * plain form and needs no client-side submit handling.
 */

const BLOCK_LABELS: Record<PostBlock["type"], string> = {
  p: "Paragraph",
  h2: "Heading",
  h3: "Subheading",
  ul: "Bullet list",
  ol: "Numbered list",
  callout: "Callout",
  code: "Code",
  table: "Table",
  quote: "Quote",
  steps: "Steps",
  faq: "FAQ",
  links: "Link list",
};

const ORDER: PostBlock["type"][] = ["p", "h2", "h3", "ul", "ol", "steps", "table", "code", "callout", "quote", "faq", "links"];

function blankBlock(type: PostBlock["type"]): PostBlock {
  switch (type) {
    case "p":
    case "h2":
    case "h3":
      return { type, text: "" };
    case "ul":
    case "ol":
      return { type, items: [""] };
    case "callout":
      return { type, tone: "note", title: "", text: "" };
    case "code":
      return { type, lang: "bash", code: "" };
    case "table":
      return { type, head: ["", ""], rows: [["", ""]] };
    case "quote":
      return { type, text: "" };
    case "steps":
      return { type, items: [{ title: "", text: "" }] };
    case "faq":
      return { type, items: [{ q: "", a: "" }] };
    case "links":
      return { type, title: "Primary sources", items: [{ label: "", href: "", note: "" }] };
  }
}

/** Input and Textarea already carry the shared field styling; these are the
 *  console-density tweaks on top of it. */
const compact = "h-9 text-[13.5px]";
const compactArea = "py-2 text-[13.5px]";

export function BlockEditor({ name, initial }: { name: string; initial: PostBlock[] }) {
  const [blocks, setBlocks] = useState<PostBlock[]>(initial.length ? initial : [{ type: "p", text: "" }]);
  const [adding, setAdding] = useState(false);

  const update = (index: number, next: PostBlock) =>
    setBlocks((current) => current.map((b, i) => (i === index ? next : b)));

  const remove = (index: number) => setBlocks((current) => current.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) =>
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const add = (type: PostBlock["type"]) => {
    setBlocks((current) => [...current, blankBlock(type)]);
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />

      {blocks.map((block, index) => (
        <div key={index} className="rounded-xl border border-line bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                <ChevronUp className="size-3.5" />
              </IconButton>
              <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === blocks.length - 1}>
                <ChevronDown className="size-3.5" />
              </IconButton>
              <IconButton label="Delete block" onClick={() => remove(index)} destructive>
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          </div>
          <BlockFields block={block} onChange={(next) => update(index, next)} />
        </div>
      ))}

      {adding ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-4">
          <p className="mb-3 text-[12.5px] font-medium text-ink-muted">Add a block</p>
          <div className="flex flex-wrap gap-1.5">
            {ORDER.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                {BLOCK_LABELS[type]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink-faint hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus /> Add block
        </Button>
      )}

      <p className="pt-1 text-[12px] leading-relaxed text-ink-faint">
        Paragraph, list and cell text accepts <code className="text-ink-muted">[label](/path)</code> for links,{" "}
        <code className="text-ink-muted">**bold**</code> and <code className="text-ink-muted">`code`</code>. It is parsed
        into elements, never injected as HTML.
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border border-line p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-35",
        destructive ? "text-ink-faint hover:border-red-200 hover:text-red-600" : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Per-type fields. Each branch writes back a complete, valid block. */
function BlockFields({ block, onChange }: { block: PostBlock; onChange: (next: PostBlock) => void }) {
  switch (block.type) {
    case "p":
    case "quote":
      return (
        <Textarea
          rows={3}
          className={compactArea}
          value={block.text}
          placeholder={block.type === "quote" ? "The quoted line" : "Paragraph text"}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      );

    case "h2":
    case "h3":
      return (
        <Input
          className={compact}
          value={block.text}
          placeholder={block.type === "h2" ? "Section heading" : "Subheading"}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      );

    case "ul":
    case "ol":
      return (
        <ListFields
          items={block.items}
          placeholder="List item"
          onChange={(items) => onChange({ ...block, items })}
        />
      );

    case "callout":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(["note", "tip", "warn"] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => onChange({ ...block, tone })}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[12.5px] font-medium capitalize transition-colors",
                  block.tone === tone ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-muted hover:text-ink",
                )}
              >
                {tone}
              </button>
            ))}
          </div>
          <Input
            className={compact}
            value={block.title ?? ""}
            placeholder="Callout title (optional)"
            onChange={(e) => onChange({ ...block, title: e.target.value })}
          />
          <Textarea
            rows={3}
            className={compactArea}
            value={block.text}
            placeholder="Callout body"
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <Input
            className={cn(compact, "max-w-[200px]")}
            value={block.lang}
            placeholder="Language, e.g. bash"
            onChange={(e) => onChange({ ...block, lang: e.target.value })}
          />
          <Textarea
            rows={6}
            className={cn(compactArea, "font-mono text-[12.5px]")}
            value={block.code}
            placeholder="Code"
            onChange={(e) => onChange({ ...block, code: e.target.value })}
          />
          <Input
            className={compactArea}
            value={block.caption ?? ""}
            placeholder="Caption (optional)"
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
          />
        </div>
      );

    case "table":
      return <TableFields block={block} onChange={onChange} />;

    case "steps":
      return (
        <PairFields
          items={block.items.map((i) => [i.title, i.text] as [string, string])}
          placeholders={["Step title", "Step detail"]}
          addLabel="Add step"
          onChange={(pairs) => onChange({ ...block, items: pairs.map(([title, text]) => ({ title, text })) })}
        />
      );

    case "faq":
      return (
        <PairFields
          items={block.items.map((i) => [i.q, i.a] as [string, string])}
          placeholders={["Question", "Answer"]}
          addLabel="Add question"
          onChange={(pairs) => onChange({ ...block, items: pairs.map(([q, a]) => ({ q, a })) })}
        />
      );

    case "links":
      return (
        <div className="space-y-2">
          <Input
            className={compact}
            value={block.title ?? ""}
            placeholder="Section title, e.g. Primary sources"
            onChange={(e) => onChange({ ...block, title: e.target.value })}
          />
          {block.items.map((item, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-line bg-surface-2 p-2.5 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                className={compact}
                value={item.label}
                placeholder="Link label"
                onChange={(e) => {
                  const items = [...block.items];
                  items[i] = { ...item, label: e.target.value };
                  onChange({ ...block, items });
                }}
              />
              <Input
                className={compact}
                value={item.href}
                placeholder="https://…"
                onChange={(e) => {
                  const items = [...block.items];
                  items[i] = { ...item, href: e.target.value };
                  onChange({ ...block, items });
                }}
              />
              <IconButton label="Remove link" destructive onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}>
                <Trash2 className="size-3.5" />
              </IconButton>
              <Input
                className={cn(compact, "sm:col-span-3")}
                value={item.note}
                placeholder="What the reader gets from it"
                onChange={(e) => {
                  const items = [...block.items];
                  items[i] = { ...item, note: e.target.value };
                  onChange({ ...block, items });
                }}
              />
            </div>
          ))}
          <AddRow label="Add link" onClick={() => onChange({ ...block, items: [...block.items, { label: "", href: "", note: "" }] })} />
        </div>
      );
  }
}

function ListFields({
  items,
  placeholder,
  onChange,
}: {
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <Textarea
            rows={2}
            className={compactArea}
            value={item}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <IconButton label="Remove item" destructive onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      ))}
      <AddRow label="Add item" onClick={() => onChange([...items, ""])} />
    </div>
  );
}

function PairFields({
  items,
  placeholders,
  addLabel,
  onChange,
}: {
  items: [string, string][];
  placeholders: [string, string];
  addLabel: string;
  onChange: (items: [string, string][]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map(([first, second], i) => (
        <div key={i} className="rounded-lg border border-line bg-surface-2 p-2.5">
          <div className="flex items-start gap-2">
            <Input
              className={compact}
              value={first}
              placeholder={placeholders[0]}
              onChange={(e) => onChange(items.map((pair, j) => (j === i ? [e.target.value, pair[1]] : pair)))}
            />
            <IconButton label="Remove" destructive onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 className="size-3.5" />
            </IconButton>
          </div>
          <Textarea
            rows={3}
            className={cn(compactArea, "mt-2")}
            value={second}
            placeholder={placeholders[1]}
            onChange={(e) => onChange(items.map((pair, j) => (j === i ? [pair[0], e.target.value] : pair)))}
          />
        </div>
      ))}
      <AddRow label={addLabel} onClick={() => onChange([...items, ["", ""]])} />
    </div>
  );
}

function TableFields({
  block,
  onChange,
}: {
  block: Extract<PostBlock, { type: "table" }>;
  onChange: (next: PostBlock) => void;
}) {
  const columns = block.head.length;

  const setCell = (row: number, col: number, value: string) => {
    const rows = block.rows.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r));
    onChange({ ...block, rows });
  };

  const addColumn = () =>
    onChange({ ...block, head: [...block.head, ""], rows: block.rows.map((r) => [...r, ""]) });

  const removeColumn = (col: number) => {
    if (columns <= 1) return;
    onChange({
      ...block,
      head: block.head.filter((_, i) => i !== col),
      rows: block.rows.map((r) => r.filter((_, i) => i !== col)),
    });
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="min-w-[420px] space-y-2">
          <div className="flex gap-2">
            {block.head.map((cell, col) => (
              <div key={col} className="flex flex-1 items-center gap-1">
                <Input
                  className={cn(compact, "font-semibold")}
                  value={cell}
                  placeholder={`Column ${col + 1}`}
                  onChange={(e) => onChange({ ...block, head: block.head.map((h, i) => (i === col ? e.target.value : h)) })}
                />
                <IconButton label="Remove column" destructive disabled={columns <= 1} onClick={() => removeColumn(col)}>
                  <Trash2 className="size-3" />
                </IconButton>
              </div>
            ))}
          </div>

          {block.rows.map((row, r) => (
            <div key={r} className="flex gap-2">
              {row.map((cell, c) => (
                <Input
                  key={c}
                  className={cn(compact, "flex-1")}
                  value={cell}
                  placeholder="Cell"
                  onChange={(e) => setCell(r, c, e.target.value)}
                />
              ))}
              <IconButton label="Remove row" destructive onClick={() => onChange({ ...block, rows: block.rows.filter((_, i) => i !== r) })}>
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AddRow label="Add row" onClick={() => onChange({ ...block, rows: [...block.rows, Array<string>(columns).fill("")] })} />
        <AddRow label="Add column" onClick={addColumn} />
      </div>

      <Input
        className={compactArea}
        value={block.caption ?? ""}
        placeholder="Caption (optional)"
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
      />
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-brand-400 hover:text-brand-600"
    >
      <Plus className="size-3.5" />
      {label}
    </button>
  );
}
