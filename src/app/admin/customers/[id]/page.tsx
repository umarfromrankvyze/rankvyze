import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, FlaskConical, ShieldAlert } from "lucide-react";
import { getAdminCustomer } from "@/server/admin-queries";
import { getEngines } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { StatTile } from "@/components/dashboard/score-card";
import { IntegrationToggle, PlanSelect } from "@/components/admin/customer-controls";
import { NewSessionDialog } from "@/components/admin/new-session-dialog";
import { AuditFormDialog } from "@/components/admin/audit-form-dialog";
import { IssueFormDialog } from "@/components/admin/issue-form-dialog";
import { formatDate, formatRelative, parseJsonArray, titleCase } from "@/lib/utils";
import { DELIVERY_MODE_LABELS, findRoute, getPlaybook, platformName } from "@/content/platforms";
import type { DeliveryMode, PlatformKey } from "@/lib/enums";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [org, engines] = await Promise.all([getAdminCustomer(id), getEngines()]);
  if (!org) notFound();
  const websiteOptions = org.websites.map((w) => ({ id: w.id, name: w.name, domain: w.domain, organization: { name: org.name } }));

  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All customers
      </Link>
      <PageHeader
        eyebrow={`Customer since ${formatDate(org.createdAt)}`}
        title={org.name}
        description={org.onboardingCompletedAt ? `Onboarding completed ${formatDate(org.onboardingCompletedAt)}.` : "Onboarding not completed yet."}
        actions={
          <>
            <NewSessionDialog websites={websiteOptions} defaultWebsiteId={org.websites[0]?.id} />
            <AuditFormDialog websites={websiteOptions} defaultWebsiteId={org.websites[0]?.id} />
            <IssueFormDialog websites={websiteOptions} defaultWebsiteId={org.websites[0]?.id} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Plan</CardTitle>
              <CardDescription>Changes apply immediately.</CardDescription>
            </div>
            <StatusBadge status={org.subscription?.status ?? "TRIALING"} />
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <PlanSelect orgId={org.id} plan={org.plan} />
            <span className="text-[12px] text-ink-faint">{org.subscription?.periodEnd ? `Period ends ${formatDate(org.subscription.periodEnd)}` : ""}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>{org.members.length} user{org.members.length === 1 ? "" : "s"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {org.members.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <Avatar name={m.user.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink">{m.user.name}</span>
                  <span className="block truncate text-[11.5px] text-ink-faint">{m.user.email}</span>
                </span>
                <Badge variant="outline">{titleCase(m.role)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Jump into this customer&apos;s data.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { href: "/admin/research", label: "Research", icon: FlaskConical },
              { href: "/admin/audits", label: "Audits", icon: BarChart3 },
              { href: "/admin/issues", label: "Issues", icon: ShieldAlert },
              { href: "/admin/code-changes", label: "Code changes", icon: ArrowRight },
            ].map((l) => (
              <Button key={l.label} variant="outline" size="sm" asChild className="justify-start">
                <Link href={l.href}>
                  <l.icon /> {l.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {org.websites.map((w) => (
        <section key={w.id} className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-[17px] font-semibold text-ink">
                {w.name} <span className="font-normal text-ink-faint">· {w.domain}</span>
              </h2>
              <p className="text-[13px] text-ink-muted">
                {w.industry ?? "No industry"} · {parseJsonArray(w.targetLocations).join(", ") || "Global"}
              </p>
            </div>
            <Badge variant="outline" className="font-mono">
              {w.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <StatTile label="AI Visibility" value={w.visibility ?? "—"} sub={`${w.resultCount} results`} accent />
            <StatTile label="AEO Score" value={w.audits[0]?.overallScore ?? "—"} sub={w.audits[0] ? formatDate(w.audits[0].createdAt) : "no audit"} />
            <StatTile label="Prompts" value={w._count.prompts} sub={`× ${engines.length} engines`} />
            <StatTile label="Competitors" value={w.competitors.length} />
            <StatTile label="Issues" value={w._count.issues} />
            <StatTile label="Code changes" value={w._count.codeChanges} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Description</p>
                  <p className="text-ink">{w.description ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Audience</p>
                  <p className="text-ink">{w.targetAudience ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Products / services</p>
                  <p className="text-ink">{w.productsService ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>How fixes reach this site</CardTitle>
                  <CardDescription>
                    Read this before writing an optimization. It decides whether a fix can be a pull request, an edit in
                    their builder, or a change pack they apply themselves.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-line bg-surface-2 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Platform</p>
                  <p className="mt-0.5 text-[13.5px] font-medium text-ink">
                    {platformName(w.platform ?? "OTHER")}
                    {w.platformConfirmedAt ? (
                      <span className="ml-2 text-[11.5px] font-normal text-success">confirmed by customer</span>
                    ) : w.platformConfidence !== null ? (
                      <span className="ml-2 text-[11.5px] font-normal text-ink-faint">
                        detected, {w.platformConfidence}% confidence — unconfirmed
                      </span>
                    ) : (
                      <span className="ml-2 text-[11.5px] font-normal text-ink-faint">not detected</span>
                    )}
                  </p>
                  {parseJsonArray(w.platformSignals).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {parseJsonArray(w.platformSignals).map((sig) => (
                        <li key={sig} className="font-mono text-[11px] text-ink-faint">
                          {sig}
                        </li>
                      ))}
                    </ul>
                  )}
                  <ul className="mt-3 space-y-1 border-t border-line pt-2">
                    {getPlaybook((w.platform as PlatformKey | null) ?? "OTHER").hardLimits.map((limit) => (
                      <li key={limit} className="text-[11.5px] leading-relaxed text-ink-muted">
                        ⚠ {limit}
                      </li>
                    ))}
                  </ul>
                </div>

                {w.integrations.filter((i) => i.status !== "NOT_CONNECTED").length === 0 && (
                  <p className="text-[13px] text-ink-muted">No delivery route chosen yet.</p>
                )}
                {w.integrations
                  .filter((i) => i.status !== "NOT_CONNECTED")
                  .map((i) => {
                    const route = findRoute((w.platform as PlatformKey | null) ?? "OTHER", i.provider, i.mode);
                    return (
                      <div key={i.id} className="rounded-lg border border-line p-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <span className="block text-[13px] font-medium text-ink">
                              {route?.title ?? titleCase(i.provider)}
                            </span>
                            <span className="block text-[11.5px] text-ink-faint">
                              {DELIVERY_MODE_LABELS[i.mode as DeliveryMode] ?? i.mode}
                            </span>
                            {i.label && <span className="block font-mono text-[11px] text-ink-faint">{i.label}</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            <StatusBadge status={i.status} />
                            <IntegrationToggle id={i.id} status={i.status} />
                          </span>
                        </div>
                        {route && route.weNeed.length > 0 && (
                          <div className="mt-2.5 border-t border-line pt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                              Access to obtain
                            </p>
                            <ul className="mt-1 space-y-1">
                              {route.weNeed.map((need) => (
                                <li key={need} className="text-[11.5px] leading-relaxed text-ink-muted">
                                  {need}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {i.mode === "API" && (
                          <p className="mt-2 text-[11.5px] text-ink-faint">
                            {i.secretCiphertext
                              ? `Credential held ${i.secretHint ?? ""} · last verified ${i.verifiedAt ? formatRelative(i.verifiedAt) : "never"}`
                              : "No credential stored yet — the customer hasn't connected."}
                          </p>
                        )}
                        {i.lastError && (
                          <p className="mt-2 rounded border border-danger/25 bg-danger-soft p-2 text-[11.5px] leading-relaxed text-ink">
                            <span className="font-semibold">Last failure: </span>
                            {i.lastError}
                          </p>
                        )}
                        {i.accessNote && (
                          <p className="mt-2 rounded border border-line bg-surface-2 p-2 text-[11.5px] leading-relaxed text-ink">
                            <span className="font-semibold">Customer note: </span>
                            {i.accessNote}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Research sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {w.sessions.length === 0 ? (
                  <p className="border-t border-line px-5 py-5 text-[13px] text-ink-muted">No sessions yet. Create one to start research.</p>
                ) : (
                  <ul className="divide-y divide-line border-t border-line">
                    {w.sessions.map((s) => (
                      <li key={s.id}>
                        <Link href={`/admin/research/${s.id}`} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-2">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-ink">{s.title}</span>
                            <span className="block text-[11.5px] text-ink-faint">
                              {s._count.results} results · {formatRelative(s.startedAt)}
                            </span>
                          </span>
                          <StatusBadge status={s.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      ))}
    </>
  );
}
