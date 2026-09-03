import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { latestChecks, summarize } from "@/lib/metrics";
import { getResearchRows } from "@/server/queries";

export const getAdminStats = cache(async () => {
  const [customers, websites, results, openIssues, pendingChanges, activeSessions, recentResults, recentAudits] =
    await Promise.all([
      db.organization.count(),
      db.website.count(),
      db.aIResearchResult.count(),
      db.aEOIssue.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.codeChange.count({ where: { status: { in: ["AWAITING_REVIEW", "READY_FOR_CLAUDE"] } } }),
      db.researchSession.findMany({
        where: { status: "IN_PROGRESS" },
        include: { website: { select: { name: true, domain: true } }, _count: { select: { results: true } } },
        orderBy: { startedAt: "desc" },
        take: 5,
      }),
      db.aIResearchResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          website: { select: { name: true } },
          prompt: { select: { text: true } },
          engine: { select: { key: true, name: true } },
          enteredBy: { select: { name: true } },
        },
      }),
      db.aEOAudit.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { website: { select: { name: true } } } }),
    ]);
  return { customers, websites, results, openIssues, pendingChanges, activeSessions, recentResults, recentAudits };
});

export const getAdminCustomers = cache(async () => {
  const orgs = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      members: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" }, take: 1 },
      websites: {
        orderBy: [{ isPrimary: "desc" }],
        include: {
          audits: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true, createdAt: true } },
        },
      },
    },
  });

  return Promise.all(
    orgs.map(async (org) => {
      const primary = org.websites[0];
      let visibility: number | null = null;
      if (primary) {
        const rows = await getResearchRows(primary.id);
        visibility = rows.length ? summarize(latestChecks(rows)).score : null;
      }
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        status: org.subscription?.status ?? "TRIALING",
        owner: org.members[0]?.user ?? null,
        website: primary ? { id: primary.id, name: primary.name, domain: primary.domain } : null,
        websiteCount: org.websites.length,
        aeoScore: primary?.audits[0]?.overallScore ?? null,
        lastAuditAt: primary?.audits[0]?.createdAt ?? null,
        visibility,
        createdAt: org.createdAt,
        onboardingCompletedAt: org.onboardingCompletedAt,
      };
    }),
  );
});

export const getAdminCustomer = cache(async (orgId: string) => {
  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      members: { include: { user: { select: { id: true, name: true, email: true, createdAt: true } } } },
      websites: {
        orderBy: [{ isPrimary: "desc" }],
        include: {
          integrations: true,
          competitors: true,
          _count: { select: { prompts: true, research: true, issues: true, codeChanges: true, opportunities: true } },
          audits: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 1 },
          sessions: { orderBy: { startedAt: "desc" }, take: 5, include: { _count: { select: { results: true } } } },
        },
      },
    },
  });
  if (!org) return null;
  const websites = await Promise.all(
    org.websites.map(async (w) => {
      const rows = await getResearchRows(w.id);
      return { ...w, visibility: rows.length ? summarize(latestChecks(rows)).score : null, resultCount: rows.length };
    }),
  );
  return { ...org, websites };
});

export const getAdminWebsites = cache(async () => {
  const websites = await db.website.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true, plan: true } },
      integrations: { select: { provider: true, status: true } },
      _count: { select: { prompts: true, competitors: true, research: true, issues: true } },
      audits: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 1, select: { overallScore: true } },
    },
  });
  return Promise.all(
    websites.map(async (w) => {
      const rows = await getResearchRows(w.id);
      return { ...w, visibility: rows.length ? summarize(latestChecks(rows)).score : null };
    }),
  );
});

/** Lightweight list for select inputs. */
export const getWebsiteOptions = cache(async () =>
  db.website.findMany({
    orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
    select: { id: true, name: true, domain: true, organization: { select: { name: true } } },
  }),
);

export const getResearchSessions = cache(async (websiteId?: string) =>
  db.researchSession.findMany({
    where: websiteId ? { websiteId } : undefined,
    orderBy: { startedAt: "desc" },
    include: {
      website: { select: { id: true, name: true, domain: true } },
      owner: { select: { name: true } },
      _count: { select: { results: true } },
    },
  }),
);

export const getResearchSession = cache(async (id: string) =>
  db.researchSession.findUnique({
    where: { id },
    include: {
      website: {
        include: {
          prompts: { where: { isActive: true }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
          competitors: { orderBy: { createdAt: "asc" } },
        },
      },
      owner: { select: { name: true } },
      results: {
        orderBy: { checkedAt: "desc" },
        include: { engine: { select: { key: true, name: true } }, prompt: { select: { id: true, text: true } }, rivals: true },
      },
    },
  }),
);

export const getAdminAudits = cache(async () =>
  db.aEOAudit.findMany({
    orderBy: { createdAt: "desc" },
    include: { website: { select: { id: true, name: true, domain: true } }, createdBy: { select: { name: true } }, _count: { select: { issues: true } } },
  }),
);

export const getAdminIssues = cache(async () =>
  db.aEOIssue.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { website: { select: { id: true, name: true, domain: true } } },
  }),
);

export const getAdminCompetitors = cache(async () =>
  db.competitor.findMany({
    orderBy: { createdAt: "desc" },
    include: { website: { select: { id: true, name: true, domain: true } }, _count: { select: { mentions: true, citations: true } } },
  }),
);

export const getAdminCodeChanges = cache(async () =>
  db.codeChange.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      website: { select: { id: true, name: true, domain: true } },
      optimization: { select: { title: true } },
      files: { select: { path: true } },
    },
  }),
);

export const getAdminCodeChange = cache(async (id: string) =>
  db.codeChange.findUnique({
    where: { id },
    include: {
      website: { select: { id: true, name: true, domain: true, url: true, integrations: { where: { provider: "GITHUB" } } } },
      optimization: { include: { issue: true } },
      files: true,
      reviewedBy: { select: { name: true } },
    },
  }),
);

export const getAdminReports = cache(async () =>
  db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { website: { select: { id: true, name: true, domain: true } }, organization: { select: { name: true } } },
  }),
);

export const getAdminOptimizations = cache(async (websiteId?: string) =>
  db.optimization.findMany({
    where: websiteId ? { websiteId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { website: { select: { name: true } }, issue: { select: { title: true } } },
  }),
);

// ---------------------------------------------------------------- commerce

export const getAdminOrders = cache(async () =>
  db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true } },
      engagement: { include: { refundRequest: true, website: { select: { domain: true } } } },
    },
  }),
);

export const getRefundQueue = cache(async () =>
  db.refundRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      engagement: {
        include: {
          order: true,
          organization: { select: { id: true, name: true } },
          website: { select: { domain: true } },
        },
      },
    },
  }),
);

/** Engagements whose window closes soon and still haven't cleared the bar. */
export const getGuaranteeWatchlist = cache(async () => {
  const soon = new Date();
  soon.setDate(soon.getDate() + 10);
  return db.engagement.findMany({
    where: { status: "ACTIVE", endsAt: { lte: soon } },
    orderBy: { endsAt: "asc" },
    include: {
      organization: { select: { id: true, name: true } },
      website: { select: { id: true, name: true, domain: true } },
      order: { select: { amount: true, currency: true } },
    },
  });
});

export const getCommerceStats = cache(async () => {
  const [paid, refunded, active, met, pendingRefunds, scans] = await Promise.all([
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "REFUNDED" } }),
    db.engagement.count({ where: { status: "ACTIVE" } }),
    db.engagement.count({ where: { status: "MET" } }),
    db.refundRequest.count({ where: { status: "PENDING" } }),
    db.scanRequest.count(),
  ]);
  const revenue = await db.order.aggregate({ _sum: { amount: true }, where: { status: "PAID" } });
  return { paid, refunded, active, met, pendingRefunds, scans, revenueCents: revenue._sum.amount ?? 0 };
});
