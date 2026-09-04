import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { OnboardingWizard, type OnboardingInitial } from "@/components/onboarding/wizard";
import type { PlatformKey } from "@/lib/enums";
import { signOut } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Set up your workspace" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ restart?: string }> }) {
  const user = await requireUser("/onboarding");
  if (user.role === "ADMIN") redirect("/admin");

  const { restart } = await searchParams;
  const membership = await db.membership.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          websites: { orderBy: [{ isPrimary: "desc" }], include: { competitors: true, integrations: true } },
        },
      },
    },
  });
  if (!membership) redirect("/signup");

  const org = membership.organization;
  if (org.onboardingCompletedAt && !restart) redirect("/dashboard");

  const website = org.websites[0] ?? null;
  const chosen = website?.integrations.find((i) => i.status !== "NOT_CONNECTED") ?? null;
  const initial: OnboardingInitial = {
    step: restart ? 0 : org.onboardingStep,
    website: website
      ? {
          url: website.url,
          name: website.name,
          industry: website.industry ?? "",
          description: website.description ?? "",
          targetAudience: website.targetAudience ?? "",
          productsServices: website.productsService ?? "",
          targetLocations: parseJsonArray(website.targetLocations).join(", "),
        }
      : null,
    competitors: website?.competitors.map((c) => ({ name: c.name, domain: c.domain })) ?? [],
    // Detection ran when they submitted the URL on step 1. If it failed the
    // columns are null, and step 4 asks instead of asserting.
    platform: (website?.platform as PlatformKey | null) ?? "OTHER",
    platformConfidence: website?.platformConfidence ?? null,
    platformSignals: parseJsonArray(website?.platformSignals ?? null),
    detectedPlatform: (website?.platform as PlatformKey | null) ?? null,
    integration: chosen
      ? { provider: chosen.provider, mode: chosen.mode, repoUrl: chosen.repoUrl ?? "", accessNote: chosen.accessNote ?? "" }
      : null,
  };

  return (
    <div className="min-h-screen bg-surface-2">
      <header className="border-b border-line bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4 text-[13px] text-ink-muted">
            <span className="hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="font-medium text-ink-muted hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-x py-10 md:py-16">
        <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-white p-6 shadow-card md:p-10">
          <OnboardingWizard initial={initial} />
        </div>
      </main>
    </div>
  );
}
