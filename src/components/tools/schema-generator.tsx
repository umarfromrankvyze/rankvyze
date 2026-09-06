"use client";

import { useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Schema markup generator.
 *
 * Entirely client-side: there is nothing to fetch, and a form that produces
 * JSON-LD needs no server round trip. That also means nothing anyone types here
 * leaves their browser, which is worth saying on a tool that asks for a
 * company's details.
 *
 * The four types offered are the ones that decide whether an engine can
 * identify a business. Everything else in schema.org is real but does not move
 * this needle, and offering forty types would bury the four that matter.
 */

type SchemaType = "Organization" | "LocalBusiness" | "Service" | "FAQPage";

const TYPES: { value: SchemaType; label: string; blurb: string }[] = [
  { value: "Organization", label: "Organization", blurb: "Site-wide. The block that tells an engine who you are." },
  { value: "LocalBusiness", label: "Local business", blurb: "Organization plus address and hours, for a physical location." },
  { value: "Service", label: "Service", blurb: "On each offering page. Answers “best X for Y” questions." },
  { value: "FAQPage", label: "FAQ", blurb: "Question and answer pairs — the most quotable format there is." },
];

interface FormState {
  type: SchemaType;
  name: string;
  url: string;
  description: string;
  logo: string;
  email: string;
  telephone: string;
  sameAs: string;
  areaServed: string;
  foundingDate: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  serviceType: string;
  audience: string;
  price: string;
  currency: string;
  faq: { q: string; a: string }[];
}

const EMPTY: FormState = {
  type: "Organization",
  name: "",
  url: "",
  description: "",
  logo: "",
  email: "",
  telephone: "",
  sameAs: "",
  areaServed: "",
  foundingDate: "",
  street: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  serviceType: "",
  audience: "",
  price: "",
  currency: "USD",
  faq: [{ q: "", a: "" }],
};

/** Only emit properties that were actually filled in. */
function build(form: FormState): Record<string, unknown> | null {
  const clean = (v: string) => v.trim();
  const orgId = clean(form.url) ? `${clean(form.url).replace(/\/$/, "")}/#organization` : undefined;

  const base: Record<string, unknown> = { "@context": "https://schema.org" };

  if (form.type === "FAQPage") {
    const items = form.faq.filter((f) => clean(f.q) && clean(f.a));
    if (items.length === 0) return null;
    return {
      ...base,
      "@type": "FAQPage",
      mainEntity: items.map((f) => ({
        "@type": "Question",
        name: clean(f.q),
        acceptedAnswer: { "@type": "Answer", text: clean(f.a) },
      })),
    };
  }

  if (form.type === "Service") {
    if (!clean(form.name)) return null;
    const service: Record<string, unknown> = { ...base, "@type": "Service", name: clean(form.name) };
    if (clean(form.serviceType)) service.serviceType = clean(form.serviceType);
    if (clean(form.description)) service.description = clean(form.description);
    if (orgId) service.provider = { "@id": orgId };
    if (clean(form.areaServed)) service.areaServed = clean(form.areaServed);
    if (clean(form.audience)) {
      service.audience = { "@type": "Audience", audienceType: clean(form.audience) };
    }
    if (clean(form.price)) {
      service.offers = {
        "@type": "Offer",
        price: clean(form.price),
        priceCurrency: form.currency,
        availability: "https://schema.org/InStock",
      };
    }
    return service;
  }

  // Organization / LocalBusiness
  if (!clean(form.name)) return null;
  const node: Record<string, unknown> = { ...base, "@type": form.type };
  if (orgId) node["@id"] = orgId;
  node.name = clean(form.name);
  if (clean(form.url)) node.url = clean(form.url);
  if (clean(form.description)) node.description = clean(form.description);
  if (clean(form.logo)) node.logo = clean(form.logo);
  if (clean(form.email)) node.email = clean(form.email);
  if (clean(form.telephone)) node.telephone = clean(form.telephone);
  if (clean(form.foundingDate)) node.foundingDate = clean(form.foundingDate);
  if (clean(form.areaServed)) node.areaServed = clean(form.areaServed);

  const profiles = form.sameAs
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (profiles.length) node.sameAs = profiles;

  if (form.type === "LocalBusiness" && (clean(form.street) || clean(form.city))) {
    node.address = {
      "@type": "PostalAddress",
      ...(clean(form.street) ? { streetAddress: clean(form.street) } : {}),
      ...(clean(form.city) ? { addressLocality: clean(form.city) } : {}),
      ...(clean(form.region) ? { addressRegion: clean(form.region) } : {}),
      ...(clean(form.postalCode) ? { postalCode: clean(form.postalCode) } : {}),
      ...(clean(form.country) ? { addressCountry: clean(form.country) } : {}),
    };
  }

  return node;
}

export function SchemaGenerator() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const node = build(form);
  const output = node
    ? `<script type="application/ld+json">\n${JSON.stringify(node, null, 2)}\n</script>`
    : null;

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some contexts; the textarea is selectable.
    }
  };

  const isLocal = form.type === "LocalBusiness";
  const isOrg = form.type === "Organization" || isLocal;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <Field label="Schema type" htmlFor="type" hint={TYPES.find((t) => t.value === form.type)?.blurb}>
          <Select id="type" value={form.type} onChange={(e) => set("type", e.target.value as SchemaType)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="mt-5 space-y-5">
          {form.type === "FAQPage" ? (
            <>
              {form.faq.map((item, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface-2 p-4">
                  <div className="flex items-start gap-2">
                    <Input
                      value={item.q}
                      placeholder="Question"
                      aria-label={`Question ${i + 1}`}
                      onChange={(e) => set("faq", form.faq.map((f, j) => (j === i ? { ...f, q: e.target.value } : f)))}
                    />
                    <button
                      type="button"
                      aria-label="Remove question"
                      onClick={() => set("faq", form.faq.filter((_, j) => j !== i))}
                      className="rounded-md border border-line p-2 text-ink-faint transition-colors hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <Textarea
                    rows={3}
                    className="mt-2"
                    value={item.a}
                    placeholder="Answer — must match text visible on the page"
                    aria-label={`Answer ${i + 1}`}
                    onChange={(e) => set("faq", form.faq.map((f, j) => (j === i ? { ...f, a: e.target.value } : f)))}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("faq", [...form.faq, { q: "", a: "" }])}>
                <Plus /> Add question
              </Button>
              <p className="text-[12.5px] leading-relaxed text-ink-faint">
                Every pair must be visible to a human on the page. Marking up hidden FAQs violates search guidelines and
                gains nothing — the visible text is what gets quoted.
              </p>
            </>
          ) : (
            <>
              <Field label={form.type === "Service" ? "Service name" : "Business name"} htmlFor="name" required>
                <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme" />
              </Field>

              <Field label="Website URL" htmlFor="url" hint="Used to build the @id other blocks reference.">
                <Input id="url" value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://acme.com" />
              </Field>

              <Field label="Description" htmlFor="description" hint="Say the category plainly: what you are, for whom.">
                <Textarea
                  id="description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Shopify agency for fashion and lifestyle brands."
                />
              </Field>

              {form.type === "Service" && (
                <>
                  <Field label="Service type" htmlFor="serviceType">
                    <Input id="serviceType" value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)} placeholder="Ecommerce replatforming" />
                  </Field>
                  <Field label="Audience" htmlFor="audience" hint="Who it's for — this is what answers “best X for Y”.">
                    <Input id="audience" value={form.audience} onChange={(e) => set("audience", e.target.value)} placeholder="DTC fashion brands" />
                  </Field>
                  <div className="grid grid-cols-[1fr_120px] gap-3">
                    <Field label="Price" htmlFor="price">
                      <Input id="price" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="18000" />
                    </Field>
                    <Field label="Currency" htmlFor="currency">
                      <Input id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} />
                    </Field>
                  </div>
                </>
              )}

              {isOrg && (
                <>
                  <Field label="Logo URL" htmlFor="logo">
                    <Input id="logo" value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://acme.com/logo.png" />
                  </Field>
                  <Field
                    label="sameAs profiles"
                    htmlFor="sameAs"
                    hint="One per line. Only profiles you control — linking a lookalike teaches engines a wrong association."
                  >
                    <Textarea
                      id="sameAs"
                      rows={3}
                      value={form.sameAs}
                      onChange={(e) => set("sameAs", e.target.value)}
                      placeholder={"https://www.linkedin.com/company/acme\nhttps://x.com/acme"}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Email" htmlFor="email">
                      <Input id="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@acme.com" />
                    </Field>
                    <Field label="Phone" htmlFor="telephone">
                      <Input id="telephone" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Areas served" htmlFor="areaServed">
                      <Input id="areaServed" value={form.areaServed} onChange={(e) => set("areaServed", e.target.value)} placeholder="US" />
                    </Field>
                    <Field label="Founded" htmlFor="foundingDate">
                      <Input id="foundingDate" value={form.foundingDate} onChange={(e) => set("foundingDate", e.target.value)} placeholder="2019" />
                    </Field>
                  </div>
                </>
              )}

              {isLocal && (
                <div className="rounded-xl border border-line bg-surface-2 p-4">
                  <p className="mb-3 text-[13px] font-semibold text-ink">Address</p>
                  <div className="space-y-3">
                    <Input value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Street address" aria-label="Street address" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" aria-label="City" />
                      <Input value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="Region / state" aria-label="Region" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="Postcode" aria-label="Postcode" />
                      <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Country (US, GB…)" aria-label="Country" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink">Your JSON-LD</p>
          {output && (
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>

        <div
          className={cn(
            "mt-3 overflow-x-auto rounded-2xl border p-5 text-[12.5px] leading-[1.7]",
            output ? "border-ink/10 bg-ink text-white/90" : "border-dashed border-line-strong bg-surface-2 text-ink-faint",
          )}
        >
          {output ? (
            <pre>
              <code>{output}</code>
            </pre>
          ) : (
            <p className="text-[13.5px]">
              {form.type === "FAQPage"
                ? "Add a question and answer to see your markup."
                : "Enter a name to see your markup."}
            </p>
          )}
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Paste this into the <code className="text-ink-muted">&lt;head&gt;</code> of the relevant page. It must be
          server-rendered — schema injected after hydration is invisible to crawlers that don&rsquo;t run JavaScript.
          Nothing you type here leaves your browser.
        </p>
      </div>
    </div>
  );
}
