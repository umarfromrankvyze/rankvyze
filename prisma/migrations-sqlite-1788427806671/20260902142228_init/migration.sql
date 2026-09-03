-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" INTEGER,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "status" TEXT NOT NULL DEFAULT 'TRIALING',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "periodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "industry" TEXT,
    "description" TEXT,
    "targetAudience" TEXT,
    "productsService" TEXT,
    "targetLocations" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Website_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "label" TEXT,
    "repoUrl" TEXT,
    "config" TEXT,
    "connectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Integration_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "isTracked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Competitor_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIEngine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortkey" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "intent" TEXT NOT NULL DEFAULT 'COMMERCIAL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prompt_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ResearchSession_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResearchSession_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIResearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "sessionId" TEXT,
    "mentioned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,
    "cited" BOOLEAN NOT NULL DEFAULT false,
    "citationUrl" TEXT,
    "citedPagePath" TEXT,
    "sentiment" TEXT,
    "answerSummary" TEXT,
    "notes" TEXT,
    "screenshotUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enteredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIResearchResult_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIResearchResult_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIResearchResult_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "AIEngine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIResearchResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResearchSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AIResearchResult_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorMention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resultId" TEXT NOT NULL,
    "competitorId" TEXT,
    "name" TEXT NOT NULL,
    "position" INTEGER,
    CONSTRAINT "CompetitorMention_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AIResearchResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompetitorMention_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "promptId" TEXT,
    "resultId" TEXT,
    "url" TEXT NOT NULL,
    "pageTitle" TEXT,
    "pagePath" TEXT,
    "isOwnDomain" BOOLEAN NOT NULL DEFAULT true,
    "competitorId" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Citation_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Citation_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "AIEngine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Citation_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Citation_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AIResearchResult" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Citation_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AEOAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "aiUnderstanding" INTEGER NOT NULL,
    "content" INTEGER NOT NULL,
    "structuredData" INTEGER NOT NULL,
    "technical" INTEGER NOT NULL,
    "entitySignals" INTEGER NOT NULL,
    "authority" INTEGER NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "AEOAudit_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AEOAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AEOIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "auditId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "impactScore" REAL NOT NULL DEFAULT 5,
    "description" TEXT NOT NULL,
    "whyItMatters" TEXT,
    "currentImplementation" TEXT,
    "recommendedImplementation" TEXT,
    "affectedPages" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "AEOIssue_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AEOIssue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "AEOAudit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Optimization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "issueId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CONTENT',
    "status" TEXT NOT NULL DEFAULT 'SUGGESTED',
    "impactScore" REAL NOT NULL DEFAULT 5,
    "effort" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "Optimization_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Optimization_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "AEOIssue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodeChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "optimizationId" TEXT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "repository" TEXT,
    "branch" TEXT,
    "instructions" TEXT,
    "contextJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "prUrl" TEXT,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    CONSTRAINT "CodeChange_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CodeChange_optimizationId_fkey" FOREIGN KEY ("optimizationId") REFERENCES "Optimization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CodeChange_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodeChangeFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeChangeId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'tsx',
    "diff" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CodeChangeFile_codeChangeId_fkey" FOREIGN KEY ("codeChangeId") REFERENCES "CodeChange" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "promptId" TEXT,
    "title" TEXT NOT NULL,
    "targetPrompt" TEXT,
    "potential" TEXT NOT NULL DEFAULT 'MEDIUM',
    "intent" TEXT NOT NULL DEFAULT 'COMMERCIAL',
    "contentType" TEXT NOT NULL DEFAULT 'COMPARISON',
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "briefing" TEXT,
    "estimatedLift" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "ContentOpportunity_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentOpportunity_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisibilitySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "engineId" TEXT,
    "capturedOn" DATETIME NOT NULL,
    "visibilityScore" REAL NOT NULL,
    "mentionRate" REAL NOT NULL,
    "citationRate" REAL NOT NULL,
    "avgPosition" REAL,
    "promptsChecked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisibilitySnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VisibilitySnapshot_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "AIEngine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "dataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Website_organizationId_idx" ON "Website"("organizationId");

-- CreateIndex
CREATE INDEX "Website_domain_idx" ON "Website"("domain");

-- CreateIndex
CREATE INDEX "Integration_websiteId_idx" ON "Integration"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_websiteId_provider_key" ON "Integration"("websiteId", "provider");

-- CreateIndex
CREATE INDEX "Competitor_websiteId_idx" ON "Competitor"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_websiteId_domain_key" ON "Competitor"("websiteId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "AIEngine_key_key" ON "AIEngine"("key");

-- CreateIndex
CREATE INDEX "Prompt_websiteId_idx" ON "Prompt"("websiteId");

-- CreateIndex
CREATE INDEX "ResearchSession_websiteId_idx" ON "ResearchSession"("websiteId");

-- CreateIndex
CREATE INDEX "AIResearchResult_websiteId_checkedAt_idx" ON "AIResearchResult"("websiteId", "checkedAt");

-- CreateIndex
CREATE INDEX "AIResearchResult_promptId_idx" ON "AIResearchResult"("promptId");

-- CreateIndex
CREATE INDEX "AIResearchResult_engineId_idx" ON "AIResearchResult"("engineId");

-- CreateIndex
CREATE INDEX "AIResearchResult_websiteId_engineId_checkedAt_idx" ON "AIResearchResult"("websiteId", "engineId", "checkedAt");

-- CreateIndex
CREATE INDEX "CompetitorMention_resultId_idx" ON "CompetitorMention"("resultId");

-- CreateIndex
CREATE INDEX "CompetitorMention_competitorId_idx" ON "CompetitorMention"("competitorId");

-- CreateIndex
CREATE INDEX "Citation_websiteId_occurredAt_idx" ON "Citation"("websiteId", "occurredAt");

-- CreateIndex
CREATE INDEX "Citation_engineId_idx" ON "Citation"("engineId");

-- CreateIndex
CREATE INDEX "AEOAudit_websiteId_createdAt_idx" ON "AEOAudit"("websiteId", "createdAt");

-- CreateIndex
CREATE INDEX "AEOIssue_websiteId_status_idx" ON "AEOIssue"("websiteId", "status");

-- CreateIndex
CREATE INDEX "AEOIssue_auditId_idx" ON "AEOIssue"("auditId");

-- CreateIndex
CREATE INDEX "Optimization_websiteId_status_idx" ON "Optimization"("websiteId", "status");

-- CreateIndex
CREATE INDEX "CodeChange_websiteId_status_idx" ON "CodeChange"("websiteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CodeChange_websiteId_number_key" ON "CodeChange"("websiteId", "number");

-- CreateIndex
CREATE INDEX "CodeChangeFile_codeChangeId_idx" ON "CodeChangeFile"("codeChangeId");

-- CreateIndex
CREATE INDEX "ContentOpportunity_websiteId_status_idx" ON "ContentOpportunity"("websiteId", "status");

-- CreateIndex
CREATE INDEX "VisibilitySnapshot_websiteId_capturedOn_idx" ON "VisibilitySnapshot"("websiteId", "capturedOn");

-- CreateIndex
CREATE UNIQUE INDEX "VisibilitySnapshot_websiteId_engineId_capturedOn_key" ON "VisibilitySnapshot"("websiteId", "engineId", "capturedOn");

-- CreateIndex
CREATE INDEX "Report_websiteId_createdAt_idx" ON "Report"("websiteId", "createdAt");
