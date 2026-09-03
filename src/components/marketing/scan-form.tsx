"use client";

import { useActionState } from "react";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { startScan } from "@/server/actions/checkout";
import { initialActionState } from "@/server/types";
import { cn } from "@/lib/utils";

/**
 * Corner radii are concentric by construction: the shell and the button are
 * both fully rounded, so the inner radius is always the outer radius minus the
 * shell's padding — no magic numbers to keep in sync if the height changes.
 */
export function ScanForm({ size = "lg", className }: { size?: "lg" | "md"; className?: string }) {
  const [state, action, pending] = useActionState(startScan, initialActionState);
  const error = state.ok ? undefined : state.error;

  const controlHeight = size === "lg" ? "h-13 sm:h-11" : "h-12 sm:h-10";

  return (
    <div className={cn("w-full", className)}>
      <form
        action={action}
        className={cn(
          // mx-auto is what actually centres this: the wrapper is full-width,
          // so a max-width alone would leave the form pinned to the left.
          "mx-auto flex w-full flex-col gap-2.5",
          "sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:border sm:border-line-strong sm:bg-white sm:p-1.5 sm:shadow-lift",
          "sm:focus-within:border-brand-500 sm:focus-within:ring-3 sm:focus-within:ring-brand-500/15",
          size === "lg" ? "sm:max-w-[540px]" : "sm:max-w-[470px]",
        )}
      >
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="yourwebsite.com"
            aria-label="Your website address"
            aria-invalid={Boolean(error) || undefined}
            required
            className={cn(
              "w-full rounded-full border border-line-strong bg-white pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint",
              "focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15",
              "sm:border-transparent sm:shadow-none sm:focus:border-transparent sm:focus:ring-0",
              controlHeight,
            )}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white",
            "shadow-brand transition-all hover:bg-brand-600 hover:shadow-none active:scale-[0.985] disabled:opacity-70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2",
            controlHeight,
            size === "lg" ? "text-[15px]" : "text-sm",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Scanning…
            </>
          ) : (
            <>
              Analyze My Website <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="mt-2.5 text-center text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <p className="mt-2.5 text-center text-[13px] text-ink-faint">
          Fetching your homepage and checking how machines read it…
        </p>
      )}
    </div>
  );
}
