# RankVyze

**We rank your business in ChatGPT, Gemini & Claude.** RankVyze is an Answer Engine Optimization (AEO) platform. A visitor scans their site for free, pays $99 once, and gets a 45-day sprint: research across every major AI engine, a full audit, and the fixes implemented. **If they aren't mentioned on at least 2 of the 4 engines in 45 days, they get 100% back.**

## Stack

- Next.js 16 (App Router, server actions, `proxy.ts`) · TypeScript · Tailwind CSS v4
- Prisma ORM · SQLite for local/demo, PostgreSQL for production (same schema)
- Cookie-based sessions (bcrypt + server-side session table) with optional Google OAuth
- Radix primitives, Recharts, Sonner, lucide-react

## Run it locally

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npm run db:seed          # demo data (Acme + two more customers)
npm run dev
```

Open http://localhost:3000.

| Role                      | Email                     | Password    | Shows                                    |
| ------------------------- | ------------------------- | ----------- | ---------------------------------------- |
| Customer — guarantee met  | `demo@acme.com`           | `demo1234`  | Full dashboard, 4/2 engines, guarantee MET |
| Customer — mid-sprint     | `priya@northstarlegal.com` | `demo1234`  | Day 9 of 45, research partly done          |
| Customer — brand new      | `sam@bloomdental.co`      | `demo1234`  | Empty states, sprint just started          |
| Customer — refund pending | `dana@harborfreight.io`   | `demo1234`  | Window missed, refund requested            |
| Admin                     | `admin@rankvyze.com`      | `admin1234` | Internal console + refund queue            |

## Switching to PostgreSQL

The schema avoids native enums and scalar lists so it runs unchanged on both databases.

1. In `prisma/schema.prisma` change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Delete `prisma/migrations` (they were generated for SQLite) and run `npx prisma migrate dev --name init`.
4. `npm run db:seed`.

## What's real and what's staged

Everything the customer can click works against the database. These are deliberately staged in V1 and say so in the UI:

- **AI engine research is manual.** Admins enter what each engine said in `/admin/research`. Results are stored as `AIResearchResult` rows with `source = MANUAL`; an API integration writes the same rows, so every metric (`src/lib/metrics.ts`) keeps working.
- **Claude implementation is future infrastructure.** "Fix with AI" / "Send to Claude" create and queue a `CodeChange` job with task, repository, files, instructions, diff, status, review and PR URL. A human authors the diff in V1; the job record is what an agent run will consume.
- **GitHub / Shopify / WordPress connections** are recorded as requests and completed by staff. "Create Pull Request" records a PR URL only when a GitHub connection is marked connected.
- **Payments run through a stand-in provider** until Dodo credentials exist. Checkout, activation, the guarantee clock and refunds all work end to end, and every screen that touches money says "test mode — no charge" until it's live.

## The commerce flow

```
hero URL field → free scan (/scan/[id]) → signup → /checkout → provider
                                                                   ↓
                             webhook /api/webhooks/dodo ── activates ──→ onboarding
                                                                   ↓
                              45-day window · guarantee evaluated on every read
                                                                   ↓
                      MET  ·  or ELIGIBLE → customer claims → admin refunds via provider
```

The **free scan** (`src/lib/scanner.ts`) is real: it fetches the homepage, robots.txt and llms.txt and runs ten objective checks — Organization/Service/FAQ schema, a category-bearing H1, content present without JavaScript, AI-crawler policy, sameAs corroboration. No AI engines are consulted, and the results page says so plainly. Private and loopback addresses are rejected before the fetch (SSRF guard).

The **guarantee** (`src/lib/guarantee.ts`) is a pure function over `AIResearchResult` rows: mentioned on ≥ 2 distinct engines, inside the window, on the prompt set locked when baseline research began. Status transitions (ACTIVE → MET / ELIGIBLE) are derived on read and persisted — never hand-set.

### Wiring up Dodo Payments

The app only ever talks to the `PaymentProvider` interface in `src/lib/payments/provider.ts`. To go live:

1. Set `DODO_API_KEY`, `DODO_WEBHOOK_SECRET` and `DODO_PRODUCT_ID` (the $99 one-time product).
2. Complete the four marked integration points in `src/lib/payments/dodo.ts` — create checkout, refund, verify webhook signature, normalise the event.
3. Point the Dodo webhook at `/api/webhooks/dodo`.

Nothing else changes: `paymentProvider()` switches from the test stand-in to Dodo the moment those variables are present. `metadata.orderId` must round-trip through checkout — it's what ties the webhook back to the `Order` row.

Google sign-in is fully implemented but stays disabled until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Password reset works end-to-end; without an email provider the link is logged server-side and shown inline in development.

## Layout

```
prisma/schema.prisma        data model (User, Organization, Website, Integration, Competitor, Prompt,
                            AIEngine, AIResearchResult, ResearchSession, CompetitorMention, Citation,
                            AEOAudit, AEOIssue, Optimization, CodeChange, CodeChangeFile,
                            ContentOpportunity, VisibilitySnapshot, Report, Subscription, …)
prisma/seed.ts              deterministic demo data
src/app/(marketing)         landing page, pricing, resources, contact, content pages
src/app/(auth)              login, signup, forgot/reset password
src/app/onboarding          4-step wizard
src/app/dashboard           customer app (13 sections)
src/app/admin               internal console (research, audits, issues, Claude jobs, …)
src/server/queries.ts       customer data access + metric derivation
src/server/admin-queries.ts admin data access
src/server/actions/*        server actions (auth, onboarding, workspace, admin, contact)
src/lib/metrics.ts          AI Visibility Score computation
src/lib/guarantee.ts        45-day guarantee evaluation (pure)
src/lib/scanner.ts          free pre-purchase site scan
src/lib/payments/           provider interface + Dodo seam + test stand-in
src/server/engagement.ts    payment → engagement activation, guarantee sync
src/components/ui           design-system primitives
src/components/dashboard    ScoreCard, EngineCard, charts, PromptTable, CompetitorTable, CitationTable,
                            AuditScore, IssueCard, CodeDiff, …
```

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck` · `npm run lint`
- `npm run db:migrate` · `npm run db:seed` · `npm run db:reset` · `npm run db:studio`
