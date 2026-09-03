"use client";

import { useState, useTransition } from "react";
import { Code2, GitBranch, ShoppingBag, Upload, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { changePassword, updateIntegration, updateProfile, updateWebsiteSettings } from "@/server/actions/workspace";
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

const PROVIDERS: { key: string; label: string; icon: LucideIcon; text: string; needsUrl?: boolean }[] = [
  { key: "GITHUB", label: "GitHub", icon: GitBranch, text: "Deliver approved fixes as pull requests against your repository.", needsUrl: true },
  { key: "SHOPIFY", label: "Shopify", icon: ShoppingBag, text: "Theme, metafield and structured data updates for Shopify stores." },
  { key: "WORDPRESS", label: "WordPress", icon: Code2, text: "Plugin-based content and schema changes." },
  { key: "UPLOAD", label: "Upload Code", icon: Upload, text: "Share a zip of your site source for manual implementation." },
];

export function ConnectionsPanel({ websiteId, integrations }: { websiteId: string; integrations: { provider: string; status: string; label: string | null; repoUrl: string | null }[] }) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [pending, start] = useTransition();

  const act = (provider: string, action: "connect" | "disconnect") =>
    start(async () => {
      const r = await updateIntegration(websiteId, provider, { action, repoUrl });
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      setConnecting(null);
      setRepoUrl("");
    });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROVIDERS.map((p) => {
          const row = integrations.find((i) => i.provider === p.key);
          const status = row?.status ?? "NOT_CONNECTED";
          return (
            <Card key={p.key} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface-2">
                  <p.icon className="size-[18px] text-ink" />
                </span>
                <StatusBadge status={status} />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">{p.label}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-muted">{p.text}</p>
              {row?.label && <p className="mt-2 font-mono text-[12px] text-ink">{row.label}</p>}
              <div className="mt-4 flex gap-2">
                {status === "NOT_CONNECTED" ? (
                  <Button size="sm" variant="outline" onClick={() => (p.needsUrl ? setConnecting(p.key) : act(p.key, "connect"))} disabled={pending}>
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => act(p.key, "disconnect")} disabled={pending}>
                    Disconnect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
        Automated OAuth connections are being rolled out. Choosing “Connect” records your request and a RankVyze engineer completes the setup with you. Nothing is written to your site without your review.
      </p>

      <Dialog open={Boolean(connecting)} onOpenChange={(o) => !o && setConnecting(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Connect GitHub</DialogTitle>
            <DialogDescription>Which repository should receive pull requests?</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="Repository URL" htmlFor="repoUrl">
              <Input id="repoUrl" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/acme/acme-website" autoFocus />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnecting(null)}>
              Cancel
            </Button>
            <Button onClick={() => connecting && act(connecting, "connect")} loading={pending} disabled={!repoUrl.trim()}>
              Request connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
