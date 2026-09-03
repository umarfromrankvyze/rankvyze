"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Code2, GitBranch, Plus, ShoppingBag, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  finishOnboarding,
  saveBusinessStep,
  saveCompetitorsStep,
  saveIntegrationStep,
  saveWebsiteStep,
} from "@/server/actions/onboarding";
import type { FieldErrors } from "@/lib/validation";

const STEPS = [
  { n: 1, title: "Website", question: "What's your website?" },
  { n: 2, title: "Business", question: "Tell us about your business." },
  { n: 3, title: "Competitors", question: "Who are your competitors?" },
  { n: 4, title: "Connect", question: "Connect your website" },
];

const INDUSTRIES = [
  "Ecommerce agency",
  "SaaS",
  "Ecommerce brand",
  "Professional services",
  "Legal services",
  "Healthcare",
  "Financial services",
  "Marketing agency",
  "Real estate",
  "Education",
  "Hospitality",
  "Other",
];

export interface OnboardingInitial {
  step: number;
  website: {
    url: string;
    name: string;
    industry: string;
    description: string;
    targetAudience: string;
    productsServices: string;
    targetLocations: string;
  } | null;
  competitors: { name: string; domain: string }[];
  integration: string | null;
}

export function OnboardingWizard({ initial }: { initial: OnboardingInitial }) {
  const router = useRouter();
  const [step, setStep] = useState(Math.min(Math.max(initial.step + 1, 1), 4));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();

  const [url, setUrl] = useState(initial.website?.url ?? "");
  const [business, setBusiness] = useState({
    companyName: initial.website?.name ?? "",
    industry: initial.website?.industry ?? "",
    description: initial.website?.description ?? "",
    targetAudience: initial.website?.targetAudience ?? "",
    productsServices: initial.website?.productsServices ?? "",
    targetLocations: initial.website?.targetLocations ?? "",
  });
  const [competitors, setCompetitors] = useState<{ name: string; domain: string }[]>(
    initial.competitors.length ? initial.competitors : [{ name: "", domain: "" }, { name: "", domain: "" }, { name: "", domain: "" }],
  );
  const [provider, setProvider] = useState<string | null>(initial.integration);
  const [repoUrl, setRepoUrl] = useState("");

  const next = () => {
    setErrors({});
    start(async () => {
      let result;
      if (step === 1) result = await saveWebsiteStep({ url });
      else if (step === 2) result = await saveBusinessStep(business);
      else if (step === 3) result = await saveCompetitorsStep({ competitors: competitors.filter((c) => c.name || c.domain) });
      else result = await saveIntegrationStep({ provider, repoUrl });

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      if (step < 4) setStep(step + 1);
      else {
        toast.success("You're all set. Welcome to RankVyze.");
        router.push("/dashboard");
      }
    });
  };

  const skipIntegration = () => {
    start(async () => {
      const result = await saveIntegrationStep({ provider: null });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await finishOnboarding();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
      {/* Progress */}
      <aside>
        <ol className="flex gap-2 lg:flex-col lg:gap-0">
          {STEPS.map((s, i) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <li key={s.n} className="flex flex-1 items-start gap-3 lg:flex-none lg:pb-6">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors",
                      done && "border-ink bg-ink text-white",
                      active && "border-brand-500 bg-brand-500 text-white shadow-brand",
                      !done && !active && "border-line-strong bg-white text-ink-faint",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : s.n}
                  </span>
                  {i < STEPS.length - 1 && <span className={cn("mt-1 hidden h-8 w-px lg:block", done ? "bg-ink" : "bg-line")} />}
                </div>
                <div className="hidden pt-1 lg:block">
                  <p className={cn("text-[13px] font-medium", active ? "text-ink" : done ? "text-ink-muted" : "text-ink-faint")}>{s.title}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[12px] text-ink-faint lg:hidden">
          Step {step} of {STEPS.length}
        </p>
      </aside>

      {/* Step body */}
      <div className="min-w-0">
        <p className="eyebrow">Step {step} of 4</p>
        <h1 className="mt-2 font-display text-[30px] font-bold leading-tight tracking-tight text-ink md:text-[36px]">
          {STEPS[step - 1].question}
        </h1>

        <div key={step} className="mt-8 animate-fade-in">
          {step === 1 && (
            <div className="max-w-lg space-y-5">
              <p className="text-[14.5px] leading-relaxed text-ink-muted">
                We&apos;ll use this to analyze your content, structure and how AI engines currently describe you.
              </p>
              <Field label="Website URL" htmlFor="url" error={errors.url}>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  placeholder="https://example.com"
                  className="h-12 text-[15px]"
                  invalid={Boolean(errors.url)}
                  autoFocus
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
              <Field label="Company name" htmlFor="companyName" error={errors.companyName}>
                <Input id="companyName" value={business.companyName} onChange={(e) => setBusiness({ ...business, companyName: e.target.value })} placeholder="Acme" invalid={Boolean(errors.companyName)} />
              </Field>
              <Field label="Industry" htmlFor="industry" error={errors.industry}>
                <Select id="industry" value={business.industry} onChange={(e) => setBusiness({ ...business, industry: e.target.value })} invalid={Boolean(errors.industry)}>
                  <option value="">Choose…</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2" hint="One or two sentences. This is how we'll describe you when checking AI engines.">
                <Textarea id="description" value={business.description} onChange={(e) => setBusiness({ ...business, description: e.target.value })} placeholder="Acme is a Shopify agency that designs, builds and scales stores for fashion brands." invalid={Boolean(errors.description)} />
              </Field>
              <Field label="Target audience" htmlFor="targetAudience" error={errors.targetAudience}>
                <Input id="targetAudience" value={business.targetAudience} onChange={(e) => setBusiness({ ...business, targetAudience: e.target.value })} placeholder="DTC fashion brands doing $1M–$50M" invalid={Boolean(errors.targetAudience)} />
              </Field>
              <Field label="Products / services" htmlFor="productsServices" error={errors.productsServices}>
                <Input id="productsServices" value={business.productsServices} onChange={(e) => setBusiness({ ...business, productsServices: e.target.value })} placeholder="Shopify development, redesigns, CRO" invalid={Boolean(errors.productsServices)} />
              </Field>
              <Field label="Target locations" htmlFor="targetLocations" error={errors.targetLocations} className="sm:col-span-2" hint="Comma-separated. Leave empty if you sell globally.">
                <Input id="targetLocations" value={business.targetLocations} onChange={(e) => setBusiness({ ...business, targetLocations: e.target.value })} placeholder="United States, United Kingdom" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl space-y-4">
              <p className="text-[14.5px] leading-relaxed text-ink-muted">
                Add 3–5 businesses that compete for the same customers. We&apos;ll track when AI engines recommend them instead of you.
              </p>
              {errors.competitors && <p className="text-[13px] text-danger">{errors.competitors}</p>}
              <div className="space-y-3">
                {competitors.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    <Input value={c.name} onChange={(e) => setCompetitors(competitors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={`Competitor ${i + 1}`} invalid={Boolean(errors[`competitors.${i}.name`])} />
                    <Input value={c.domain} onChange={(e) => setCompetitors(competitors.map((x, j) => (j === i ? { ...x, domain: e.target.value } : x)))} placeholder="competitor.com" invalid={Boolean(errors[`competitors.${i}.domain`])} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} disabled={competitors.length <= 1} aria-label="Remove">
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
              {competitors.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setCompetitors([...competitors, { name: "", domain: "" }])}>
                  <Plus /> Add competitor
                </Button>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="max-w-2xl space-y-5">
              <p className="text-[14.5px] leading-relaxed text-ink-muted">
                Connecting lets RankVyze deliver fixes as reviewable code changes. You can also do this later from Settings.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { key: "GITHUB", icon: GitBranch, label: "GitHub", text: "Pull requests against your repository." },
                  { key: "SHOPIFY", icon: ShoppingBag, label: "Shopify", text: "Theme and metafield updates." },
                  { key: "WORDPRESS", icon: Code2, label: "WordPress", text: "Plugin-based content and schema changes." },
                  { key: "UPLOAD", icon: Upload, label: "Upload Code", text: "Send us a zip of your site source." },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setProvider(provider === opt.key ? null : opt.key)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      provider === opt.key ? "border-brand-500 bg-brand-50/60 ring-3 ring-brand-500/15" : "border-line bg-white hover:border-ink/25",
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", provider === opt.key ? "border-brand-200 bg-white text-brand-600" : "border-line bg-surface-2 text-ink")}>
                      <opt.icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-ink">{opt.label}</span>
                      <span className="mt-0.5 block text-[12.5px] text-ink-muted">{opt.text}</span>
                    </span>
                  </button>
                ))}
              </div>
              {provider === "GITHUB" && (
                <Field label="Repository URL" htmlFor="repoUrl" hint="We'll request access to this repository when setting up the connection.">
                  <Input id="repoUrl" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/acme/acme-website" />
                </Field>
              )}
              <div className="rounded-xl border border-line bg-surface-2 p-4 text-[12.5px] leading-relaxed text-ink-muted">
                Automated connections are being rolled out. Your selection is saved and a RankVyze engineer will complete the
                setup with you — nothing is changed on your site without your review.
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
          <Button type="button" variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || pending}>
            <ArrowLeft /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step === 4 && (
              <Button type="button" variant="ghost" onClick={skipIntegration} disabled={pending}>
                Skip for now
              </Button>
            )}
            <Button type="button" size="lg" onClick={next} loading={pending}>
              {step === 4 ? "Go to dashboard" : "Continue"} {step < 4 && <ArrowRight />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
