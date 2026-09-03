"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { GoogleButton } from "@/components/auth/google-button";
import { requestPasswordReset, resetPassword, signIn, signUp } from "@/server/actions/auth";
import { initialActionState, type ActionResult } from "@/server/types";

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[12px] text-ink-faint">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function FormError({ state }: { state: ActionResult }) {
  if (state.ok || !state.error || state.fieldErrors) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-danger-soft px-3.5 py-2.5 text-[13px] text-red-700" role="alert">
      {state.error}
    </div>
  );
}

function PasswordInput({ id, name, autoComplete, invalid, placeholder }: { id: string; name: string; autoComplete: string; invalid?: boolean; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} invalid={invalid} placeholder={placeholder} className="pr-10" required />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function LoginForm({ googleEnabled, next }: { googleEnabled: boolean; next?: string }) {
  const [state, action, pending] = useActionState(signIn, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1.5 text-[14px] text-ink-muted">Log in to see how AI sees your business.</p>

      <div className="mt-8 space-y-5">
        <GoogleButton enabled={googleEnabled} />
        <Divider />
        <form action={action} className="space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          <FormError state={state} />
          <Field label="Email" htmlFor="email" error={errors?.email}>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" invalid={Boolean(errors?.email)} required />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={errors?.password}
          >
            <PasswordInput id="password" name="password" autoComplete="current-password" invalid={Boolean(errors?.password)} placeholder="••••••••" />
          </Field>
          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-[13px] font-medium text-ink-muted hover:text-ink">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={pending}>
            Log in
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        New to RankVyze?{" "}
        <Link href="/signup" className="font-medium text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-line bg-surface-2 p-4 text-[12.5px] text-ink-muted">
        <p className="font-medium text-ink">Demo accounts</p>
        <p className="mt-1">
          Customer: <code className="rounded bg-white px-1 py-0.5 font-mono text-[11.5px]">demo@acme.com</code> /{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-[11.5px]">demo1234</code>
        </p>
        <p className="mt-0.5">
          Admin: <code className="rounded bg-white px-1 py-0.5 font-mono text-[11.5px]">admin@rankvyze.com</code> /{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-[11.5px]">admin1234</code>
        </p>
      </div>
    </div>
  );
}

export function SignupForm({ googleEnabled, scan }: { googleEnabled: boolean; scan?: string }) {
  const [state, action, pending] = useActionState(signUp, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-ink">
        Start optimizing your website for AI search.
      </h1>
      <p className="mt-2 text-[14px] text-ink-muted">Next step is a one-time $99 — refunded in full if we don&apos;t get you mentioned in 45 days.</p>

      <div className="mt-8 space-y-5">
        <GoogleButton enabled={googleEnabled} label="Sign up with Google" />
        <Divider />
        <form action={action} className="space-y-4" noValidate>
          {scan && <input type="hidden" name="scan" value={scan} />}
          <FormError state={state} />
          <Field label="Name" htmlFor="name" error={errors?.name}>
            <Input id="name" name="name" autoComplete="name" placeholder="Jordan Reyes" invalid={Boolean(errors?.name)} required />
          </Field>
          <Field label="Work email" htmlFor="email" error={errors?.email}>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" invalid={Boolean(errors?.email)} required />
          </Field>
          <Field label="Password" htmlFor="password" error={errors?.password} hint="At least 8 characters.">
            <PasswordInput id="password" name="password" autoComplete="new-password" invalid={Boolean(errors?.password)} placeholder="Create a password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={pending}>
            Create account
          </Button>
          <p className="text-center text-[12px] leading-relaxed text-ink-faint">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialActionState as ActionResult<{ devLink?: string }>);
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
  }, [state]);

  if (state.ok) {
    return (
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Check your email</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{state.message}</p>
        {state.data?.devLink && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-warning-soft p-4 text-[12.5px] text-amber-800">
            <p className="font-semibold">Development mode</p>
            <p className="mt-1">No email provider is configured, so here is the link directly:</p>
            <Link href={state.data.devLink} className="mt-2 block break-all font-mono text-[11.5px] underline">
              {state.data.devLink}
            </Link>
          </div>
        )}
        <Button variant="outline" size="lg" className="mt-8 w-full" asChild>
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Reset your password</h1>
      <p className="mt-1.5 text-[14px] text-ink-muted">Enter your email and we&apos;ll send you a reset link.</p>
      <form action={action} className="mt-8 space-y-4" noValidate>
        <FormError state={state} />
        <Field label="Email" htmlFor="email" error={errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" invalid={Boolean(errors?.email)} required />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Send reset link
        </Button>
      </form>
      <p className="mt-8 text-center text-[13.5px] text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Choose a new password</h1>
      <p className="mt-1.5 text-[14px] text-ink-muted">You&apos;ll be logged in right after.</p>
      <form action={action} className="mt-8 space-y-4" noValidate>
        <input type="hidden" name="token" value={token} />
        <FormError state={state} />
        <Field label="New password" htmlFor="password" error={errors?.password} hint="At least 8 characters.">
          <PasswordInput id="password" name="password" autoComplete="new-password" invalid={Boolean(errors?.password)} placeholder="Create a password" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
