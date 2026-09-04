"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { changePassword, updateProfile, updateWebsiteSettings } from "@/server/actions/workspace";
import { confirmPlatform, saveIntegrationStep } from "@/server/actions/onboarding";
import { DeliveryStep, type DeliveryChoice, type DeliveryConnection } from "@/components/onboarding/delivery-step";
import { recommendedRoute } from "@/content/platforms";
import type { PlatformKey } from "@/lib/enums";
import type { FieldErrors } from "@/lib/validation";

function useFormAction<T extends Record<string, string>>(action: (input: T) => Promise<{ ok: boolean; error?: string; message?: string; fieldErrors?: FieldErrors }>) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const run = (input: T, onDone?: () => void) =>
    start(async () => {
      const r = await action(input);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        toast.error(r.error ?? "Something went wrong");
        return;
      }
      setErrors({});
      toast.success(r.message ?? "Saved");
      onDone?.();
    });
  return { errors, pending, run };
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const { errors, pending, run } = useFormAction(updateProfile);
  return (
    <Card>
      <form
        action={(f) => run({ name: String(f.get("name") ?? "") })}
      >
        <CardHeader>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name is shown to teammates and in reports.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" defaultValue={name} invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Contact support to change your email.">
            <Input id="email" value={email} disabled />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={pending}>
            Save profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const { errors, pending, run } = useFormAction(changePassword);
  return (
    <Card>
      <form
        action={(f) => {
          const form = document.getElementById("password-form") as HTMLFormElement | null;
          run({ currentPassword: String(f.get("currentPassword") ?? ""), newPassword: String(f.get("newPassword") ?? "") }, () => form?.reset());
        }}
        id="password-form"
      >
        <CardHeader>
          <div>
            <CardTitle>Password</CardTitle>
            <CardDescription>Changing your password signs out other devices.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current password" htmlFor="currentPassword" error={errors.currentPassword}>
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" invalid={Boolean(errors.currentPassword)} />
          </Field>
          <Field label="New password" htmlFor="newPassword" error={errors.newPassword} hint="At least 8 characters.">
            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" invalid={Boolean(errors.newPassword)} />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" variant="outline" loading={pending}>
            Change password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export interface WebsiteFormValues {
  name: string;
  url: string;
  industry: string;
  description: string;
  targetAudience: string;
  productsServices: string;
  targetLocations: string;
}

export function WebsiteForm({ websiteId, values }: { websiteId: string; values: WebsiteFormValues }) {
  const { errors, pending, run } = useFormAction((input: Record<string, string>) => updateWebsiteSettings(websiteId, input));
  const get = (f: FormData, k: keyof WebsiteFormValues) => String(f.get(k) ?? "");
  return (
    <Card>
      <form action={(f) => run({ name: get(f, "name"), url: get(f, "url"), industry: get(f, "industry"), description: get(f, "description"), targetAudience: get(f, "targetAudience"), productsServices: get(f, "productsServices"), targetLocations: get(f, "targetLocations") })}>
        <CardHeader>
          <div>
            <CardTitle>Website profile</CardTitle>
            <CardDescription>This is what the research team and the AI engines are compared against. Keep it precise.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" defaultValue={values.name} invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Website URL" htmlFor="url" error={errors.url}>
            <Input id="url" name="url" defaultValue={values.url} invalid={Boolean(errors.url)} />
          </Field>
          <Field label="Industry" htmlFor="industry" error={errors.industry}>
            <Input id="industry" name="industry" defaultValue={values.industry} />
          </Field>
          <Field label="Target locations" htmlFor="targetLocations" hint="Comma-separated.">
            <Input id="targetLocations" name="targetLocations" defaultValue={values.targetLocations} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2">
            <Textarea id="description" name="description" defaultValue={values.description} />
          </Field>
          <Field label="Target audience" htmlFor="targetAudience" error={errors.targetAudience}>
            <Input id="targetAudience" name="targetAudience" defaultValue={values.targetAudience} />
          </Field>
          <Field label="Products / services" htmlFor="productsServices" error={errors.productsServices}>
            <Input id="productsServices" name="productsServices" defaultValue={values.productsServices} />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={pending}>
            Save website
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


export function ConnectionsPanel({
  platform,
  platformConfidence,
  platformSignals,
  chosen,
  connection,
}: {
  platform: PlatformKey;
  platformConfidence: number | null;
  platformSignals: string[];
  chosen: { provider: string; mode: string; repoUrl: string; accessNote: string } | null;
  connection: DeliveryConnection | null;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState<DeliveryChoice>({
    platform,
    provider: chosen?.provider ?? recommendedRoute(platform)?.provider ?? null,
    mode: chosen?.mode ?? recommendedRoute(platform)?.mode ?? null,
    repoUrl: chosen?.repoUrl ?? "",
    accessNote: chosen?.accessNote ?? "",
  });

  const dirty =
    value.platform !== platform ||
    value.provider !== (chosen?.provider ?? null) ||
    value.mode !== (chosen?.mode ?? null) ||
    value.repoUrl !== (chosen?.repoUrl ?? "") ||
    value.accessNote !== (chosen?.accessNote ?? "");

  const save = () =>
    start(async () => {
      await confirmPlatform({ platform: value.platform });
      const r = await saveIntegrationStep({
        provider: value.provider,
        mode: value.mode,
        repoUrl: value.repoUrl,
        accessNote: value.accessNote,
      });
      if (r.ok) toast.success("Delivery route updated.");
      else toast.error(r.error);
    });

  return (
    <div className="space-y-6">
      {/* Deliberately the same component as onboarding step 4. Two copies of
          this would drift, and the copy that drifted would be the one telling
          a customer we can do something their platform doesn't allow. */}
      <DeliveryStep
        value={value}
        onChange={setValue}
        detectedConfidence={platformConfidence}
        detectedSignals={platformSignals}
        detectedPlatform={platform}
        connection={connection}
      />
      <div className="flex items-center gap-3 border-t border-line pt-5">
        <Button onClick={save} loading={pending} disabled={!dirty}>
          Save delivery route
        </Button>
        {!dirty && <p className="text-[13px] text-ink-faint">No unsaved changes.</p>}
      </div>
    </div>
  );
}
