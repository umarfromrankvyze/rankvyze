import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiffLine {
  type: "add" | "del" | "context" | "hunk";
  text: string;
  oldNo: number | null;
  newNo: number | null;
}

/** Parses a unified diff hunk body into annotated lines with line numbers. */
export function parseDiff(diff: string): DiffLine[] {
  const out: DiffLine[] = [];
  let oldNo = 0;
  let newNo = 0;
  for (const raw of diff.replace(/\r\n/g, "\n").split("\n")) {
    if (raw.startsWith("@@")) {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
      if (m) {
        oldNo = Number(m[1]);
        newNo = Number(m[2]);
      }
      out.push({ type: "hunk", text: raw, oldNo: null, newNo: null });
    } else if (raw.startsWith("+++") || raw.startsWith("---")) {
      continue;
    } else if (raw.startsWith("+")) {
      out.push({ type: "add", text: raw.slice(1), oldNo: null, newNo: newNo++ });
    } else if (raw.startsWith("-")) {
      out.push({ type: "del", text: raw.slice(1), oldNo: oldNo++, newNo: null });
    } else {
      out.push({ type: "context", text: raw.startsWith(" ") ? raw.slice(1) : raw, oldNo: oldNo++, newNo: newNo++ });
    }
  }
  // Drop a trailing empty context line produced by the final newline.
  if (out.length && out[out.length - 1].type === "context" && out[out.length - 1].text === "") out.pop();
  return out;
}

interface CodeDiffProps {
  path: string;
  diff: string;
  additions?: number;
  deletions?: number;
  className?: string;
  dark?: boolean;
}

export function CodeDiff({ path, diff, additions, deletions, className, dark }: CodeDiffProps) {
  const lines = parseDiff(diff);
  return (
    <div className={cn("overflow-hidden rounded-xl border", dark ? "border-white/10 bg-[#111116]" : "border-line bg-white", className)}>
      <div className={cn("flex items-center gap-2 border-b px-4 py-2.5 font-mono text-[12px]", dark ? "border-white/10 bg-white/[0.03] text-white/80" : "border-line bg-surface-2 text-ink")}>
        <FileCode2 className={cn("size-3.5", dark ? "text-white/40" : "text-ink-faint")} />
        <span className="truncate">{path}</span>
        <span className="ml-auto flex items-center gap-2 text-[11px]">
          {additions !== undefined && <span className="text-green-600">+{additions}</span>}
          {deletions !== undefined && <span className="text-red-600">−{deletions}</span>}
        </span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse font-mono text-[12px] leading-[1.65]">
          <tbody>
            {lines.map((l, i) => (
              <tr
                key={i}
                className={cn(
                  l.type === "add" && (dark ? "bg-green-500/[0.09]" : "bg-green-50"),
                  l.type === "del" && (dark ? "bg-red-500/[0.10]" : "bg-red-50"),
                  l.type === "hunk" && (dark ? "bg-white/[0.04] text-white/40" : "bg-surface-3 text-ink-faint"),
                )}
              >
                <td className={cn("w-10 select-none px-2 text-right tabular-nums", dark ? "text-white/25" : "text-ink-faint/70")}>{l.oldNo ?? ""}</td>
                <td className={cn("w-10 select-none px-2 text-right tabular-nums", dark ? "text-white/25" : "text-ink-faint/70")}>{l.newNo ?? ""}</td>
                <td className={cn("w-5 select-none text-center", l.type === "add" && "text-green-600", l.type === "del" && "text-red-600", l.type === "context" && (dark ? "text-white/20" : "text-ink-faint/50"))}>
                  {l.type === "add" ? "+" : l.type === "del" ? "−" : l.type === "hunk" ? "" : " "}
                </td>
                <td className={cn("whitespace-pre pr-4", l.type === "add" && (dark ? "text-green-100" : "text-green-900"), l.type === "del" && (dark ? "text-red-200/80" : "text-red-800"), l.type === "context" && (dark ? "text-white/60" : "text-ink-muted"), l.type === "hunk" && "py-0.5")}>
                  {l.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
