"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Pencil, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PLATFORM_PLAYBOOKS, getPlaybook, type DeliveryRoute } from "@/content/platforms";
import { CONFIDENT_AT } from "@/lib/platform-shared";
import type { PlatformKey } from "@/lib/enums";

export interface DeliveryChoice {
  platform: PlatformKey;
  provider: string | null;
  mode: string | null;
  repoUrl: string;
  accessNote: string;
}

interface Props {
  value: DeliveryChoice;
  onChange: (next: DeliveryChoice) => void;
  /** Confidence from automatic detection, 0-100. Null when detection failed. */
  detectedConfidence: number | null;
  /** The observable facts detection matched, so the verdict is inspectable. */
  detectedSignals: string[];
  /** What detection originally said, so an override can be labelled as one. */
  detectedPlatform: PlatformKey | null;
}

export function DeliveryStep({ value, onChange, detectedConfidence, detectedSignals, detectedPlatform }: Props) {
  const [editingPlatform, setEditingPlatform] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const playbook = getPlaybook(value.platform);
  const confident = detectedConfidence !== null && detectedConfidence >= CONFIDENT_AT;
  const overridden = detectedPlatform !== null && detectedPlatform !== value.platform;
  const selectedRoute = playbook.routes.find((r) => r.provider === value.provider && r.mode === value.mode) ?? null;

  const pickPlatform = (platform: PlatformKey) => {
    // Routes are platform-specific, so a platform change has to clear the
    // route rather than leave a selection that no longer exists.
    onChange({ ...value, platform, provider: null, mode: null, repoUrl: "", accessNote: "" });
    setEditingPlatform(false);
  };

  const pickRoute = (route: DeliveryRoute) => {
    const same = value.provider === route.provider && value.mode === route.mode;
    onChange({ ...value, provider: same ? null : route.provider, mode: same ? null : route.mode });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* What the site is built on */}
      <div className="rounded-xl border border-line bg-surface-2 p-5">
        {editingPlatform ? (
          <Field label="What is your site built on?" htmlFor="platform">
            <Select
              id="platform"
              value={value.platform}
              onChange={(e) => pickPlatform(e.target.value as PlatformKey)}
            >
              {PLATFORM_PLAYBOOKS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {overridden ? "You told us" : confident ? "We detected" : "Our best guess"}
              </p>
              <p className="mt-1.5 font-display text-[18px] font-bold tracking-tight text-ink">{playbook.name}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{playbook.blurb}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingPlatform(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink pointer-coarse:min-h-11"
            >
              <Pencil className="size-3.5" /> Change
            </button>
          </div>
        )}

        {!editingPlatform && detectedSignals.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted hover:text-ink"
            >
              <ChevronDown className={cn("size-3.5 transition-transform", showEvidence && "rotate-180")} />
              Why we think so
            </button>
            {showEvidence && (
              <ul className="mt-2.5 space-y-1.5">
                {detectedSignals.map((sig) => (
                  <li key={sig} className="flex items-start gap-2 font-mono text-[12px] leading-relaxed text-ink-muted">
                    <Check className="mt-0.5 size-3 shrink-0 text-brand-500" />
                    {sig}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!editingPlatform && detectedConfidence === null && (
          <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            We couldn&apos;t read your site automatically, so nothing here is detected — please pick the platform
            yourself.
          </p>
        )}
      </div>

      {/* What is and isn't possible on that platform */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
            <ShieldCheck className="size-4 text-brand-500" /> What we can change
          </h3>
          <ul className="mt-3 space-y-2">
            {playbook.weCanChange.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
            <TriangleAlert className="size-4 text-amber-600" /> What it can&apos;t do
          </h3>
          <ul className="mt-3 space-y-2">
            {playbook.hardLimits.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
                <X className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delivery routes */}
      <div>
        <h3 className="text-[13px] font-semibold text-ink">How should we deliver fixes?</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Whichever you pick, we verify the result the same way: we re-fetch your live page and check the signal is
          actually there.
        </p>
        <div className="mt-4 space-y-3">
          {playbook.routes.map((route) => {
            const active = value.provider === route.provider && value.mode === route.mode;
            return (
              <div
                key={`${route.provider}-${route.mode}`}
                className={cn(
                  "rounded-xl border transition-all",
                  active ? "border-brand-500 bg-brand-50/40 ring-3 ring-brand-500/15" : "border-line bg-white",
                )}
              >
                <button
                  type="button"
                  onClick={() => pickRoute(route)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border",
                      active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white",
                    )}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-ink">{route.title}</span>
                      {route.recommended && (
                        <span className="rounded-full bg-brand-500/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">{route.summary}</span>
                  </span>
                </button>

                {active && (
                  <div className="border-t border-brand-200/60 px-4 pb-4 pt-3.5">
                    <RouteDetail label="What we need from you" items={route.weNeed} />
                    <RouteDetail label="How it works" items={route.howItWorks} ordered />
                    <RouteDetail label="What this route can't do" items={route.limits} muted />
                    <p className="mt-3 text-[12px] text-ink-faint">Typical turnaround: {route.turnaround}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route-specific inputs */}
      {value.provider === "GITHUB" && (
        <Field
          label="Repository URL"
          htmlFor="repoUrl"
          hint="We'll request collaborator access to this repository. Never paste a token here."
        >
          <Input
            id="repoUrl"
            value={value.repoUrl}
            onChange={(e) => onChange({ ...value, repoUrl: e.target.value })}
            placeholder="https://github.com/acme/acme-website"
          />
        </Field>
      )}

      {selectedRoute && selectedRoute.provider !== "GITHUB" && (
        <Field
          label="Anything we should know about access? (optional)"
          htmlFor="accessNote"
          hint="Who to contact, which plan you're on, whether a developer applies changes. Never passwords or API keys — we ask for those separately over a secure channel, never through this form."
        >
          <Textarea
            id="accessNote"
            rows={3}
            value={value.accessNote}
            onChange={(e) => onChange({ ...value, accessNote: e.target.value })}
            placeholder="Our developer applies changes on Fridays. We're on a Framer Pro plan."
          />
        </Field>
      )}

      <p className="rounded-xl border border-line bg-surface-2 p-4 text-[12.5px] leading-relaxed text-ink-muted">
        Nothing on your site changes without your approval, whichever route you pick. You can change this later in
        Settings, and revoking access takes effect immediately.
      </p>
    </div>
  );
}

function RouteDetail({
  label,
  items,
  ordered,
  muted,
}: {
  label: string;
  items: string[];
  ordered?: boolean;
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{label}</p>
      <ol className="mt-1.5 space-y-1.5">
        {items.map((item, i) => (
          <li
            key={item}
            className={cn("flex items-start gap-2 text-[13px] leading-relaxed", muted ? "text-ink-faint" : "text-ink-muted")}
          >
            <span className="mt-px shrink-0 font-mono text-[11px] text-brand-500">
              {ordered ? `${i + 1}.` : "—"}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}
