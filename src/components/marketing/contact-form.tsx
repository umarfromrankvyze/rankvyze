"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { submitContact } from "@/server/actions/contact";
import { initialActionState } from "@/server/types";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  if (state.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="size-10 text-success" />
        <p className="mt-4 font-display text-[20px] font-bold text-ink">Message received</p>
        <p className="mt-1 text-[14px] text-ink-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-card md:p-8" noValidate>
      {!state.ok && state.error && !state.fieldErrors && <p className="rounded-lg border border-red-200 bg-danger-soft px-3.5 py-2.5 text-[13px] text-red-700">{state.error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors?.name}>
          <Input id="name" name="name" autoComplete="name" invalid={Boolean(errors?.name)} required />
        </Field>
        <Field label="Work email" htmlFor="email" error={errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" invalid={Boolean(errors?.email)} required />
        </Field>
      </div>
      <Field label="Company" htmlFor="company" error={errors?.company}>
        <Input id="company" name="company" autoComplete="organization" />
      </Field>
      <Field label="How can we help?" htmlFor="message" error={errors?.message}>
        <Textarea id="message" name="message" placeholder="Tell us about your website and what you're trying to achieve." className="min-h-[140px]" invalid={Boolean(errors?.message)} required />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
