import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dashboardContext } from "@/server/context";
import { db } from "@/lib/db";
import { getIntegrations } from "@/server/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectionsPanel, PasswordForm, ProfileForm, WebsiteForm } from "@/components/dashboard/settings-forms";
import { cn, formatDate, parseJsonArray } from "@/lib/utils";
import type { PlatformKey } from "@/lib/enums";

export const metadata: Metadata = { title: "Settings" };

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "website", label: "Website" },
  { key: "connections", label: "Connections" },
  { key: "plan", label: "Plan & team" },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, website, organization } = await dashboardContext();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "profile";

  const [integrations, members, subscription] = await Promise.all([
    getIntegrations(website.id),
    db.membership.findMany({ where: { organizationId: organization.id }, include: { user: { select: { name: true, email: true, image: true } } }, orderBy: { createdAt: "asc" } }),
    db.subscription.findUnique({ where: { organizationId: organization.id } }),
  ]);

  const chosenIntegration = integrations.find((i) => i.status !== "NOT_CONNECTED") ?? null;

  return (
    <>
      <PageHeader eyebrow={organization.name} title="Settings" description="Your account, website profile, connections and plan." />

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line scrollbar-thin" aria-label="Settings sections">
        {TABS.map((t) => (
          <Link key={t.key} href={`/dashboard/settings?tab=${t.key}`} className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors", tab === t.key ? "border-brand-500 text-ink" : "border-transparent text-ink-muted hover:text-ink")}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="max-w-3xl space-y-4">
        {tab === "profile" && (
          <>
            <ProfileForm name={user.name} email={user.email} />
            <PasswordForm />
          </>
        )}

        {tab === "website" && (
          <WebsiteForm
            websiteId={website.id}
            values={{
              name: website.name,
              url: website.url,
              industry: website.industry ?? "",
              description: website.description ?? "",
              targetAudience: website.targetAudience ?? "",
              productsServices: website.productsService ?? "",
              targetLocations: parseJsonArray(website.targetLocations).join(", "),
            }}
          />
        )}

        {tab === "connections" && (
          <ConnectionsPanel
            platform={(website.platform as PlatformKey | null) ?? "OTHER"}
            platformConfidence={website.platformConfidence}
            platformSignals={parseJsonArray(website.platformSignals)}
            chosen={
              chosenIntegration
                ? {
                    provider: chosenIntegration.provider,
                    mode: chosenIntegration.mode,
                    repoUrl: chosenIntegration.repoUrl ?? "",
                    accessNote: chosenIntegration.accessNote ?? "",
                  }
                : null
            }
            connection={
              chosenIntegration
                ? {
                    id: chosenIntegration.id,
                    provider: chosenIntegration.provider,
                    mode: chosenIntegration.mode,
                    status: chosenIntegration.status,
                    secretHint: chosenIntegration.secretHint,
                    label: chosenIntegration.label,
                    lastError: chosenIntegration.lastError,
                  }
                : null
            }
          />
        )}

        {tab === "plan" && (
          <>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Plan</CardTitle>
                  <CardDescription>Billing is managed by the RankVyze team during the early access period.</CardDescription>
                </div>
                <StatusBadge status={subscription?.status ?? "TRIALING"} />
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-[22px] font-bold text-ink">
                    {organization.plan.charAt(0)}
                    {organization.plan.slice(1).toLowerCase()} plan
                  </p>
                  <p className="text-[13px] text-ink-muted">
                    {subscription?.periodEnd ? `${subscription.status === "TRIALING" ? "Trial ends" : "Renews"} ${formatDate(subscription.periodEnd)}` : "No renewal date"} · {subscription?.seats ?? 1} seat
                    {(subscription?.seats ?? 1) === 1 ? "" : "s"}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    Compare plans <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Team</CardTitle>
                  <CardDescription>People with access to {organization.name}. Invitations are handled by support during early access.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <ul className="divide-y divide-line border-t border-line">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={m.user.name} src={m.user.image} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium text-ink">{m.user.name}</span>
                        <span className="block truncate text-[12px] text-ink-faint">{m.user.email}</span>
                      </span>
                      <Badge variant="outline">{m.role.charAt(0) + m.role.slice(1).toLowerCase()}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
