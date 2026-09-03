/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ACME_CITED_PAGES,
  ACME_CODE_CHANGES,
  ACME_COMPETITORS,
  ACME_CONTENT,
  ACME_ISSUES,
  ACME_OPTIMIZATIONS,
  ACME_PROMPTS,
  ANSWER_SUMMARIES,
  CITATION_PLAN,
  COMPETITOR_CITED_PAGES,
  ENGINES,
  MENTION_PLAN,
  PREVIOUS_CITATION_PLAN,
  PREVIOUS_MENTION_PLAN,
} from "./seed-data";

const db = new PrismaClient();

// Deterministic PRNG so the demo looks identical on every machine.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260902);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(rand() * 50), 0, 0);
  return d;
};

// Mirrors src/lib/metrics.ts — duplicated here so the seed has no runtime
// dependency on the app's path aliases.
function positionScore(position: number | null) {
  if (!position || position < 1) return 0;
  return [1, 0.85, 0.7, 0.55, 0.4][position - 1] ?? 0.25;
}
function score(rows: { mentioned: boolean; position: number | null; cited: boolean }[]) {
  if (!rows.length) return { score: 0, mentionRate: 0, citationRate: 0, avgPosition: null as number | null };
  let m = 0,
    c = 0,
    pf = 0,
    pt = 0,
    pc = 0;
  for (const r of rows) {
    if (r.mentioned) {
      m++;
      pf += positionScore(r.position);
      if (r.position) {
        pt += r.position;
        pc++;
      }
    }
    if (r.cited) c++;
  }
  const n = rows.length;
  return {
    score: Math.round(100 * (0.5 * (m / n) + 0.3 * (c / n) + 0.2 * (pf / n))),
    mentionRate: Math.round((m / n) * 100),
    citationRate: Math.round((c / n) * 100),
    avgPosition: pc ? Math.round((pt / pc) * 10) / 10 : null,
  };
}

async function reset() {
  // Order matters for SQLite without cascading FK enforcement in some paths.
  await db.$transaction([
    db.refundRequest.deleteMany(),
    db.engagement.deleteMany(),
    db.order.deleteMany(),
    db.webhookEvent.deleteMany(),
    db.scanRequest.deleteMany(),
    db.citation.deleteMany(),
    db.competitorMention.deleteMany(),
    db.aIResearchResult.deleteMany(),
    db.researchSession.deleteMany(),
    db.visibilitySnapshot.deleteMany(),
    db.codeChangeFile.deleteMany(),
    db.codeChange.deleteMany(),
    db.optimization.deleteMany(),
    db.aEOIssue.deleteMany(),
    db.aEOAudit.deleteMany(),
    db.contentOpportunity.deleteMany(),
    db.report.deleteMany(),
    db.prompt.deleteMany(),
    db.competitor.deleteMany(),
    db.integration.deleteMany(),
    db.website.deleteMany(),
    db.subscription.deleteMany(),
    db.membership.deleteMany(),
    db.organization.deleteMany(),
    db.verificationToken.deleteMany(),
    db.session.deleteMany(),
    db.account.deleteMany(),
    db.user.deleteMany(),
    db.aIEngine.deleteMany(),
  ]);
}

async function main() {
  console.log("Resetting database…");
  await reset();

  // ---------------------------------------------------------------- engines
  const engines = await Promise.all(
    ENGINES.map((e) => db.aIEngine.create({ data: { ...e } })),
  );
  const engineByKey = Object.fromEntries(engines.map((e) => [e.key, e]));

  // ------------------------------------------------------------------ users
  const [adminHash, demoHash] = await Promise.all([bcrypt.hash("admin1234", 10), bcrypt.hash("demo1234", 10)]);

  const admin = await db.user.create({
    data: { name: "Maya Chen", email: "admin@rankvyze.com", passwordHash: adminHash, role: "ADMIN" },
  });
  const demoUser = await db.user.create({
    data: { name: "Jordan Reyes", email: "demo@acme.com", passwordHash: demoHash, role: "CUSTOMER" },
  });
  const priya = await db.user.create({
    data: { name: "Priya Shah", email: "priya@northstarlegal.com", passwordHash: demoHash, role: "CUSTOMER" },
  });
  const sam = await db.user.create({
    data: { name: "Sam Okafor", email: "sam@bloomdental.co", passwordHash: demoHash, role: "CUSTOMER" },
  });

  // ------------------------------------------------------------------- Acme
  const acmeOrg = await db.organization.create({
    data: {
      name: "Acme",
      slug: "acme",
      plan: "GROWTH",
      onboardingStep: 4,
      onboardingCompletedAt: daysAgo(58),
      members: { create: { userId: demoUser.id, role: "OWNER" } },
      subscription: { create: { plan: "GROWTH", status: "ACTIVE", seats: 3, periodStart: daysAgo(28), periodEnd: daysAgo(-2) } },
    },
  });

  const acme = await db.website.create({
    data: {
      organizationId: acmeOrg.id,
      name: "Acme",
      url: "https://acme.com",
      domain: "acme.com",
      industry: "Ecommerce agency",
      description:
        "Acme is a Shopify agency that designs, builds and scales ecommerce stores for fashion and lifestyle brands. Offices in New York, London and Bangalore.",
      targetAudience: "Founders and ecommerce leads at DTC fashion, footwear and accessories brands doing $1M–$50M/yr.",
      productsService: "Shopify & Shopify Plus development, store redesigns, migrations, CRO, headless builds",
      targetLocations: JSON.stringify(["United States", "United Kingdom", "India"]),
      isPrimary: true,
      integrations: {
        create: [
          {
            provider: "GITHUB",
            status: "CONNECTED",
            label: "acme/acme-website",
            repoUrl: "https://github.com/acme/acme-website",
            connectedAt: daysAgo(55),
          },
          { provider: "SHOPIFY", status: "NOT_CONNECTED" },
          { provider: "WORDPRESS", status: "NOT_CONNECTED" },
          { provider: "UPLOAD", status: "NOT_CONNECTED" },
        ],
      },
    },
  });

  const competitors = await Promise.all(
    ACME_COMPETITORS.map((c) =>
      db.competitor.create({
        data: { websiteId: acme.id, name: c.name, domain: c.domain, url: `https://${c.domain}`, notes: c.notes },
      }),
    ),
  );
  const competitorByDomain = Object.fromEntries(competitors.map((c) => [c.domain, c]));

  const prompts = await Promise.all(
    ACME_PROMPTS.map((p, i) =>
      db.prompt.create({
        data: { websiteId: acme.id, text: p.text, category: p.category, intent: p.intent, priority: p.priority, createdAt: daysAgo(56 - i) },
      }),
    ),
  );

  // ----------------------------------------------------------- research
  // Competitor mention likelihood per engine (Northwind is the market leader).
  const RIVAL_WEIGHTS: Record<string, number> = {
    "northwind.digital": 0.78,
    "halcyon.studio": 0.62,
    "vertexcommerce.co": 0.48,
    "oakline.io": 0.3,
  };

  async function runSession(opts: {
    title: string;
    day: number;
    mentionPlan: Record<string, number[]>;
    citationPlan: Record<string, number[]>;
    positionBias: number; // added to positions for weaker sessions
  }) {
    const session = await db.researchSession.create({
      data: {
        websiteId: acme.id,
        ownerId: admin.id,
        title: opts.title,
        status: "COMPLETED",
        startedAt: daysAgo(opts.day, 9),
        completedAt: daysAgo(opts.day, 17),
        notes: "Checked each prompt in a fresh, signed-out session. Screenshots archived in the shared drive.",
      },
    });

    const rows: { mentioned: boolean; position: number | null; cited: boolean; engineKey: string }[] = [];

    for (const engine of engines) {
      const plan = opts.mentionPlan[engine.key] ?? [];
      const citePlan = opts.citationPlan[engine.key] ?? [];

      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const mentioned = plan.includes(i);
        const cited = mentioned && citePlan.includes(i);

        let position: number | null = null;
        if (mentioned) {
          const base = [0, 1, 17].includes(i) ? 1 : [2, 3, 5, 8, 12].includes(i) ? 2 : 3;
          position = Math.min(6, base + opts.positionBias + (rand() < 0.35 ? 1 : 0));
        }

        const citedPage = cited ? ACME_CITED_PAGES[i] ?? ACME_CITED_PAGES[0] : null;
        const summary = !mentioned
          ? ANSWER_SUMMARIES.not_mentioned
          : position && position <= 2
            ? ANSWER_SUMMARIES.mentioned_top
            : position && position <= 4
              ? ANSWER_SUMMARIES.mentioned_mid
              : ANSWER_SUMMARIES.mentioned_low;

        const checkedAt = daysAgo(opts.day, 9 + Math.floor(rand() * 8));

        const result = await db.aIResearchResult.create({
          data: {
            websiteId: acme.id,
            promptId: prompt.id,
            engineId: engine.id,
            sessionId: session.id,
            mentioned,
            position,
            cited,
            citationUrl: citedPage ? `https://acme.com${citedPage.path}` : null,
            citedPagePath: citedPage?.path ?? null,
            sentiment: mentioned ? (position && position <= 2 ? "POSITIVE" : "NEUTRAL") : null,
            answerSummary: summary,
            source: "MANUAL",
            checkedAt,
            enteredById: admin.id,
          },
        });
        rows.push({ mentioned, position, cited, engineKey: engine.key });

        if (cited && citedPage) {
          await db.citation.create({
            data: {
              websiteId: acme.id,
              engineId: engine.id,
              promptId: prompt.id,
              resultId: result.id,
              url: `https://acme.com${citedPage.path}`,
              pagePath: citedPage.path,
              pageTitle: citedPage.title,
              isOwnDomain: true,
              occurredAt: checkedAt,
            },
          });
        }

        // Competitors named in this answer
        let rivalPos = 1;
        const rivalOrder = [...competitors].sort((a, b) => RIVAL_WEIGHTS[b.domain] - RIVAL_WEIGHTS[a.domain]);
        for (const rival of rivalOrder) {
          const p = RIVAL_WEIGHTS[rival.domain] * (mentioned ? 0.85 : 1);
          if (rand() < p) {
            // Acme occupies one slot; skip it for the rivals' positions.
            if (mentioned && position === rivalPos) rivalPos++;
            await db.competitorMention.create({
              data: { resultId: result.id, competitorId: rival.id, name: rival.name, position: rivalPos },
            });
            // Competitor citations: leader gets cited often, others less.
            const citeChance = rival.domain === "northwind.digital" ? 0.55 : rival.domain === "vertexcommerce.co" ? 0.4 : 0.25;
            if (rand() < citeChance) {
              const page = pick(COMPETITOR_CITED_PAGES[rival.domain]);
              await db.citation.create({
                data: {
                  websiteId: acme.id,
                  engineId: engine.id,
                  promptId: prompt.id,
                  resultId: result.id,
                  url: `https://${rival.domain}${page.path}`,
                  pagePath: page.path,
                  pageTitle: page.title,
                  isOwnDomain: false,
                  competitorId: rival.id,
                  occurredAt: checkedAt,
                },
              });
            }
            rivalPos++;
          }
        }
      }
    }
    return rows;
  }

  console.log("Seeding research sessions…");
  const previousRows = await runSession({
    title: "Baseline research — August",
    day: 29,
    mentionPlan: PREVIOUS_MENTION_PLAN,
    citationPlan: PREVIOUS_CITATION_PLAN,
    positionBias: 1,
  });
  const currentRows = await runSession({
    title: "Monthly research — September",
    day: 1,
    mentionPlan: MENTION_PLAN,
    citationPlan: CITATION_PLAN,
    positionBias: 0,
  });

  // ------------------------------------------------------ snapshots (trend)
  const prev = score(previousRows);
  const curr = score(currentRows);
  console.log(`Acme visibility: ${prev.score} → ${curr.score}`);

  const WEEKS = 12;
  for (let w = WEEKS - 1; w >= 0; w--) {
    const day = w * 7 + 1;
    const t = 1 - w / (WEEKS - 1); // 0 → 1
    const ease = t * t * (3 - 2 * t);
    const wobble = (rand() - 0.5) * 3;
    const startScore = prev.score - 6;
    const overall = w === 0 ? curr.score : Math.max(10, Math.round(startScore + (curr.score - startScore) * ease + wobble));

    await db.visibilitySnapshot.create({
      data: {
        websiteId: acme.id,
        engineId: null,
        capturedOn: daysAgo(day, 0),
        visibilityScore: overall,
        mentionRate: w === 0 ? curr.mentionRate : Math.round(prev.mentionRate - 8 + (curr.mentionRate - prev.mentionRate + 8) * ease),
        citationRate: w === 0 ? curr.citationRate : Math.round(prev.citationRate - 5 + (curr.citationRate - prev.citationRate + 5) * ease),
        avgPosition: w === 0 ? curr.avgPosition : (prev.avgPosition ?? 3.5) - ((prev.avgPosition ?? 3.5) - (curr.avgPosition ?? 2.5)) * ease,
        promptsChecked: prompts.length * engines.length,
      },
    });

    for (const engine of engines) {
      const engineCurr = score(currentRows.filter((r) => r.engineKey === engine.key));
      const enginePrev = score(previousRows.filter((r) => r.engineKey === engine.key));
      const start = enginePrev.score - 5;
      const v = w === 0 ? engineCurr.score : Math.max(8, Math.round(start + (engineCurr.score - start) * ease + (rand() - 0.5) * 4));
      await db.visibilitySnapshot.create({
        data: {
          websiteId: acme.id,
          engineId: engine.id,
          capturedOn: daysAgo(day, 0),
          visibilityScore: v,
          mentionRate: w === 0 ? engineCurr.mentionRate : Math.round(enginePrev.mentionRate - 6 + (engineCurr.mentionRate - enginePrev.mentionRate + 6) * ease),
          citationRate: w === 0 ? engineCurr.citationRate : Math.round(enginePrev.citationRate - 4 + (engineCurr.citationRate - enginePrev.citationRate + 4) * ease),
          avgPosition: engineCurr.avgPosition,
          promptsChecked: prompts.length,
        },
      });
    }
  }

  // ----------------------------------------------------------------- audits
  console.log("Seeding audits, issues, optimizations…");
  await db.aEOAudit.create({
    data: {
      websiteId: acme.id,
      overallScore: 58,
      aiUnderstanding: 74,
      content: 55,
      structuredData: 38,
      technical: 70,
      entitySignals: 41,
      authority: 40,
      status: "PUBLISHED",
      summary: "Baseline audit. Entity clarity and structured data are the biggest gaps.",
      createdById: admin.id,
      createdAt: daysAgo(30),
      publishedAt: daysAgo(30),
    },
  });
  const audit = await db.aEOAudit.create({
    data: {
      websiteId: acme.id,
      overallScore: 67,
      aiUnderstanding: 82,
      content: 61,
      structuredData: 54,
      technical: 73,
      entitySignals: 49,
      authority: 43,
      status: "PUBLISHED",
      summary:
        "Organization schema and brand-name fixes lifted structured data and entity scores. Content depth around the fashion specialisation and third-party authority remain the largest opportunities.",
      createdById: admin.id,
      createdAt: daysAgo(2),
      publishedAt: daysAgo(2),
    },
  });

  const issues = await Promise.all(
    ACME_ISSUES.map((issue, i) =>
      db.aEOIssue.create({
        data: {
          websiteId: acme.id,
          auditId: audit.id,
          title: issue.title,
          category: issue.category,
          severity: issue.severity,
          impactScore: issue.impactScore,
          description: issue.description,
          whyItMatters: issue.whyItMatters,
          currentImplementation: issue.currentImplementation,
          recommendedImplementation: issue.recommendedImplementation,
          affectedPages: JSON.stringify(issue.affectedPages),
          status: issue.status,
          createdAt: daysAgo(30 - (i % 4)),
          resolvedAt: issue.status === "FIXED" ? daysAgo(6 + i) : null,
        },
      }),
    ),
  );
  const issueByTitle = Object.fromEntries(issues.map((i) => [i.title, i]));

  const optimizations = await Promise.all(
    ACME_OPTIMIZATIONS.map((o, i) =>
      db.optimization.create({
        data: {
          websiteId: acme.id,
          issueId: o.issueTitle ? issueByTitle[o.issueTitle]?.id : null,
          title: o.title,
          description: o.description,
          type: o.type,
          status: o.status,
          impactScore: o.impactScore,
          effort: o.effort,
          createdAt: daysAgo(26 - i),
          completedAt: o.status === "COMPLETED" ? daysAgo(8 + i) : null,
        },
      }),
    ),
  );
  const optByTitle = Object.fromEntries(optimizations.map((o) => [o.title, o]));

  for (const cc of ACME_CODE_CHANGES) {
    const additions = cc.files.reduce((n, f) => n + f.diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length, 0);
    const deletions = cc.files.reduce((n, f) => n + f.diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length, 0);
    await db.codeChange.create({
      data: {
        websiteId: acme.id,
        optimizationId: optByTitle[cc.optimizationTitle]?.id,
        number: cc.number,
        title: cc.title,
        summary: cc.summary,
        repository: "acme/acme-website",
        branch: cc.branch,
        instructions: cc.instructions,
        contextJson: JSON.stringify({
          websiteUrl: "https://acme.com",
          pages: issueByTitle[ACME_OPTIMIZATIONS.find((o) => o.title === cc.optimizationTitle)?.issueTitle ?? ""]
            ? JSON.parse(issueByTitle[ACME_OPTIMIZATIONS.find((o) => o.title === cc.optimizationTitle)!.issueTitle!].affectedPages ?? "[]")
            : [],
          framework: "Next.js 15 (App Router)",
          constraints: ["Keep the visual design unchanged", "Do not modify unrelated files"],
        }),
        status: cc.status,
        prUrl: cc.prUrl ?? null,
        additions,
        deletions,
        createdAt: daysAgo(24 - (cc.number - 101) * 3),
        reviewedAt: cc.status === "MERGED" ? daysAgo(12 - (cc.number - 101)) : null,
        reviewedById: cc.status === "MERGED" ? demoUser.id : null,
        files: {
          create: cc.files.map((f) => ({
            path: f.path,
            language: f.language,
            diff: f.diff,
            additions: f.diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length,
            deletions: f.diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length,
          })),
        },
      },
    });
  }

  for (const [i, c] of ACME_CONTENT.entries()) {
    const prompt = prompts.find((p) => p.text === c.targetPrompt);
    await db.contentOpportunity.create({
      data: {
        websiteId: acme.id,
        promptId: prompt?.id,
        title: c.title,
        targetPrompt: c.targetPrompt,
        potential: c.potential,
        intent: c.intent,
        contentType: c.contentType,
        status: c.status,
        briefing: c.briefing,
        estimatedLift: c.estimatedLift,
        createdAt: daysAgo(20 - i),
      },
    });
  }

  // ---------------------------------------------------------------- reports
  const reportData = (s: ReturnType<typeof score>, auditScore: number, label: string) => ({
    label,
    visibilityScore: s.score,
    mentionRate: s.mentionRate,
    citationRate: s.citationRate,
    avgPosition: s.avgPosition,
    aeoScore: auditScore,
  });
  await db.report.create({
    data: {
      organizationId: acmeOrg.id,
      websiteId: acme.id,
      title: "August 2026 — AI Visibility Report",
      periodStart: daysAgo(59),
      periodEnd: daysAgo(30),
      status: "READY",
      dataJson: JSON.stringify(reportData(prev, 58, "August")),
      createdAt: daysAgo(29),
    },
  });

  // ------------------------------------------------- other demo customers
  console.log("Seeding additional customers…");
  const northstarOrg = await db.organization.create({
    data: {
      name: "Northstar Legal",
      slug: "northstar-legal",
      plan: "TRIAL",
      onboardingStep: 4,
      onboardingCompletedAt: daysAgo(9),
      members: { create: { userId: priya.id, role: "OWNER" } },
      subscription: { create: { plan: "TRIAL", status: "TRIALING", periodStart: daysAgo(9), periodEnd: daysAgo(-5) } },
    },
  });
  const northstar = await db.website.create({
    data: {
      organizationId: northstarOrg.id,
      name: "Northstar Legal",
      url: "https://northstarlegal.com",
      domain: "northstarlegal.com",
      industry: "Legal services",
      description: "Boutique immigration law firm serving startups and tech workers in Toronto and Vancouver.",
      targetAudience: "Startup founders and skilled workers relocating to Canada",
      productsService: "Work permits, startup visas, permanent residency",
      targetLocations: JSON.stringify(["Canada"]),
      isPrimary: true,
      integrations: {
        create: [
          { provider: "GITHUB", status: "NOT_CONNECTED" },
          { provider: "SHOPIFY", status: "NOT_CONNECTED" },
          { provider: "WORDPRESS", status: "PENDING", label: "northstarlegal.com" },
          { provider: "UPLOAD", status: "NOT_CONNECTED" },
        ],
      },
      competitors: {
        create: [
          { name: "Maple Immigration", domain: "mapleimmigration.ca", url: "https://mapleimmigration.ca" },
          { name: "Borderline Law", domain: "borderlinelaw.com", url: "https://borderlinelaw.com" },
          { name: "Aurora Legal", domain: "auroralegal.ca", url: "https://auroralegal.ca" },
        ],
      },
    },
  });
  const nsPrompts = await Promise.all(
    [
      "Best immigration lawyer for startup founders in Canada",
      "How to get a Canadian startup visa",
      "Immigration law firm Toronto tech workers",
      "Best immigration lawyers Vancouver",
      "Work permit lawyer for software engineers Canada",
    ].map((text, i) =>
      db.prompt.create({ data: { websiteId: northstar.id, text, category: i === 1 ? "Guide" : "Discovery", intent: i === 1 ? "INFORMATIONAL" : "COMMERCIAL", priority: "HIGH" } }),
    ),
  );
  const nsSession = await db.researchSession.create({
    data: { websiteId: northstar.id, ownerId: admin.id, title: "Onboarding research", status: "IN_PROGRESS", startedAt: daysAgo(3) },
  });
  // Partially completed: only ChatGPT and Perplexity checked so far.
  for (const key of ["chatgpt", "perplexity"]) {
    for (const [i, p] of nsPrompts.entries()) {
      const mentioned = [0, 2].includes(i);
      await db.aIResearchResult.create({
        data: {
          websiteId: northstar.id,
          promptId: p.id,
          engineId: engineByKey[key].id,
          sessionId: nsSession.id,
          mentioned,
          position: mentioned ? 3 : null,
          cited: false,
          answerSummary: mentioned ? "Mentioned as one of several Toronto firms." : "Not mentioned.",
          checkedAt: daysAgo(3),
          enteredById: admin.id,
        },
      });
    }
  }
  await db.aEOAudit.create({
    data: {
      websiteId: northstar.id,
      overallScore: 44,
      aiUnderstanding: 58,
      content: 39,
      structuredData: 22,
      technical: 81,
      entitySignals: 35,
      authority: 30,
      status: "PUBLISHED",
      summary: "Strong technical foundation; almost no structured data and thin content.",
      createdById: admin.id,
      createdAt: daysAgo(5),
      publishedAt: daysAgo(5),
      issues: {
        create: [
          {
            websiteId: northstar.id,
            title: "No LegalService schema",
            category: "STRUCTURED_DATA",
            severity: "HIGH",
            impactScore: 8.1,
            description: "No structured data describes the firm, its practice areas or jurisdictions.",
            whyItMatters: "Engines need to know which jurisdictions you practise in before recommending you for a location-specific prompt.",
            recommendedImplementation: "Add LegalService JSON-LD with areaServed and practice areas.",
            affectedPages: JSON.stringify(["/"]),
          },
          {
            websiteId: northstar.id,
            title: "No startup-visa guide",
            category: "CONTENT",
            severity: "HIGH",
            impactScore: 7.8,
            description: "The most-asked informational prompt has no matching page on the site.",
            recommendedImplementation: "Publish a step-by-step Startup Visa guide with FAQs.",
            affectedPages: JSON.stringify(["/services"]),
          },
          {
            websiteId: northstar.id,
            title: "Lawyer profiles lack credentials",
            category: "AUTHORITY",
            severity: "MEDIUM",
            impactScore: 6.2,
            description: "Team pages omit bar admissions and years of practice.",
            recommendedImplementation: "Add credentials and Person schema for each lawyer.",
            affectedPages: JSON.stringify(["/team"]),
          },
        ],
      },
    },
  });

  // A brand-new customer with nothing researched yet — exercises empty states.
  const bloomOrg = await db.organization.create({
    data: {
      name: "Bloom Dental",
      slug: "bloom-dental",
      plan: "TRIAL",
      onboardingStep: 4,
      onboardingCompletedAt: daysAgo(1),
      members: { create: { userId: sam.id, role: "OWNER" } },
      subscription: { create: { plan: "TRIAL", status: "TRIALING", periodStart: daysAgo(1), periodEnd: daysAgo(-13) } },
    },
  });
  const bloom = await db.website.create({
    data: {
      organizationId: bloomOrg.id,
      name: "Bloom Dental",
      url: "https://bloomdental.co",
      domain: "bloomdental.co",
      industry: "Healthcare",
      description: "Family and cosmetic dentistry practice with three clinics in Austin, Texas.",
      targetAudience: "Families and professionals in Austin looking for a dentist",
      productsService: "General dentistry, Invisalign, whitening, implants",
      targetLocations: JSON.stringify(["Austin, TX"]),
      isPrimary: true,
      integrations: { create: [{ provider: "WORDPRESS", status: "NOT_CONNECTED" }] },
      competitors: { create: [{ name: "Lakeside Dental", domain: "lakesidedental.com" }, { name: "Smile Austin", domain: "smileaustin.com" }] },
      prompts: {
        create: [
          { text: "Best dentist in Austin", category: "Local", intent: "COMMERCIAL", priority: "HIGH" },
          { text: "Invisalign provider Austin TX", category: "Local", intent: "COMMERCIAL", priority: "HIGH" },
          { text: "Family dentist near Round Rock", category: "Local", intent: "COMMERCIAL", priority: "MEDIUM" },
        ],
      },
    },
  });

  // ------------------------------------------------- orders & guarantees
  console.log("Seeding orders and guarantees…");

  async function purchase(opts: {
    organizationId: string;
    websiteId: string;
    email: string;
    ref: string;
    daysSincePurchase: number;
    status: string;
    lockedPromptIds?: string[];
    baselineSessionId?: string;
    metEngineCount?: number;
  }) {
    const order = await db.order.create({
      data: {
        organizationId: opts.organizationId,
        amount: 9900,
        currency: "USD",
        status: "PAID",
        provider: "dodo",
        providerCheckoutId: `seed_chk_${opts.ref}`,
        providerPaymentId: `seed_pay_${opts.ref}`,
        email: opts.email,
        paidAt: daysAgo(opts.daysSincePurchase),
        createdAt: daysAgo(opts.daysSincePurchase),
      },
    });
    await db.engagement.create({
      data: {
        organizationId: opts.organizationId,
        websiteId: opts.websiteId,
        orderId: order.id,
        status: opts.status,
        startsAt: daysAgo(opts.daysSincePurchase),
        endsAt: daysAgo(opts.daysSincePurchase - 45),
        lockedPromptsJson: opts.lockedPromptIds ? JSON.stringify(opts.lockedPromptIds) : null,
        baselineSessionId: opts.baselineSessionId ?? null,
        metEngineCount: opts.metEngineCount ?? 0,
        metAt: opts.status === "MET" ? daysAgo(1) : null,
        evaluatedAt: opts.status === "MET" ? daysAgo(1) : null,
        createdAt: daysAgo(opts.daysSincePurchase),
      },
    });
    return order;
  }

  // Acme — bought 40 days ago, named on all four engines, guarantee met.
  await purchase({
    organizationId: acmeOrg.id,
    websiteId: acme.id,
    email: demoUser.email,
    ref: "acme",
    daysSincePurchase: 40,
    status: "MET",
    lockedPromptIds: prompts.map((p) => p.id),
    metEngineCount: 4,
  });

  // Northstar — 9 days in, research only partly done. The live case.
  await purchase({
    organizationId: northstarOrg.id,
    websiteId: northstar.id,
    email: priya.email,
    ref: "northstar",
    daysSincePurchase: 9,
    status: "ACTIVE",
    lockedPromptIds: nsPrompts.map((p) => p.id),
    baselineSessionId: nsSession.id,
  });

  // Bloom — bought yesterday, nothing researched yet. Exercises empty states.
  await purchase({
    organizationId: bloomOrg.id,
    websiteId: bloom.id,
    email: sam.email,
    ref: "bloom",
    daysSincePurchase: 1,
    status: "ACTIVE",
  });

  // A fourth customer whose window closed without clearing the bar — this is
  // what the refund path looks like, and it gives the admin queue real work.
  const harborUser = await db.user.create({
    data: { name: "Dana Whitfield", email: "dana@harborfreight.io", passwordHash: demoHash, role: "CUSTOMER" },
  });
  const harborOrg = await db.organization.create({
    data: {
      name: "Harbor Supply",
      slug: "harbor-supply",
      plan: "SPRINT",
      onboardingStep: 4,
      onboardingCompletedAt: daysAgo(50),
      members: { create: { userId: harborUser.id, role: "OWNER" } },
    },
  });
  const harbor = await db.website.create({
    data: {
      organizationId: harborOrg.id,
      name: "Harbor Supply",
      url: "https://harborfreight.io",
      domain: "harborfreight.io",
      industry: "Industrial supplies",
      description: "Regional distributor of marine and industrial fasteners, serving boatyards along the US east coast.",
      targetAudience: "Procurement managers at boatyards and marine repair shops",
      productsService: "Marine fasteners, rigging hardware, bulk industrial supply",
      targetLocations: JSON.stringify(["United States"]),
      isPrimary: true,
      prompts: {
        create: [
          { text: "Best marine fastener suppliers on the east coast", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
          { text: "Where to buy bulk rigging hardware", category: "Discovery", intent: "TRANSACTIONAL", priority: "HIGH" },
          { text: "Marine hardware distributor for boatyards", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
        ],
      },
      competitors: { create: [{ name: "Atlantic Rigging", domain: "atlanticrigging.com" }] },
    },
  });
  const harborPrompts = await db.prompt.findMany({ where: { websiteId: harbor.id } });

  // Research was done — the engines simply never named them.
  const harborSession = await db.researchSession.create({
    data: {
      websiteId: harbor.id,
      ownerId: admin.id,
      title: "Baseline research — Harbor Supply",
      status: "COMPLETED",
      startedAt: daysAgo(46),
      completedAt: daysAgo(46),
    },
  });
  for (const engine of engines) {
    for (const p of harborPrompts) {
      await db.aIResearchResult.create({
        data: {
          websiteId: harbor.id,
          promptId: p.id,
          engineId: engine.id,
          sessionId: harborSession.id,
          mentioned: false,
          cited: false,
          answerSummary: "Harbor Supply is not mentioned. The answer names national chains instead.",
          checkedAt: daysAgo(46),
          enteredById: admin.id,
        },
      });
    }
  }

  const harborOrder = await db.order.create({
    data: {
      organizationId: harborOrg.id,
      amount: 9900,
      currency: "USD",
      status: "PAID",
      provider: "dodo",
      providerCheckoutId: "seed_chk_harbor",
      providerPaymentId: "seed_pay_harbor",
      email: harborUser.email,
      paidAt: daysAgo(50),
      createdAt: daysAgo(50),
    },
  });
  const harborEngagement = await db.engagement.create({
    data: {
      organizationId: harborOrg.id,
      websiteId: harbor.id,
      orderId: harborOrder.id,
      status: "REFUND_REQUESTED",
      startsAt: daysAgo(50),
      endsAt: daysAgo(5),
      baselineSessionId: harborSession.id,
      lockedPromptsJson: JSON.stringify(harborPrompts.map((p) => p.id)),
      evaluatedAt: daysAgo(5),
      createdAt: daysAgo(50),
    },
  });
  await db.refundRequest.create({
    data: {
      engagementId: harborEngagement.id,
      reason: "Still not showing up on any engine when I ask about marine fasteners.",
      requestedAt: daysAgo(3),
    },
  });


  console.log("\nSeed complete.");
  console.log("  Customer login:  demo@acme.com / demo1234");
  console.log("  Admin login:     admin@rankvyze.com / admin1234");
  console.log("  Refund demo:     dana@harborfreight.io / demo1234 (guarantee missed)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
