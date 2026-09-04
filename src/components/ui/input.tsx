import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Field styling.
 *
 * The `pointer-coarse:` pair is not a taste decision.
 *
 * `pointer-coarse:text-base` — iOS Safari zooms the whole page whenever a
 * focused input's font-size is under 16px. Every form here sat at 14px, so
 * tapping the email field on an iPhone yanked the layout and left the reader
 * pinched in with no way back except a manual zoom out.
 *
 * `pointer-coarse:h-11` — 44px is the minimum touch target Apple and Google
 * both publish. The default stays 40px so desktop density is untouched.
 *
 * Keyed on pointer type rather than a width breakpoint deliberately: a phone in
 * landscape is 740px wide and still a thumb. A `sm:` rule would hand it the
 * desktop sizing and reintroduce both problems.
 */
export const inputClassName =
  "flex h-10 w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-70 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 pointer-coarse:h-11 pointer-coarse:text-base";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, invalid, ...props }, ref) => (
  <input
    type={type}
    className={cn(inputClassName, className)}
    ref={ref}
    aria-invalid={invalid || undefined}
    {...props}
  />
));
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
  <textarea
    className={cn(inputClassName, "h-auto min-h-[104px] resize-y py-2.5 leading-relaxed pointer-coarse:h-auto", className)}
    ref={ref}
    aria-invalid={invalid || undefined}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, invalid, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(inputClassName, "appearance-none pr-9", className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

export { Input, Textarea, Select };
