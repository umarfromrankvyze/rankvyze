/**
 * Union types + option lists for every enum-like column in prisma/schema.prisma.
 * Kept in one place so the schema stays portable across SQLite and PostgreSQL.
 */

export const USER_ROLES = ["CUSTOMER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PLANS = ["TRIAL", "STARTER", "GROWTH", "SCALE"] as const;
export type Plan = (typeof PLANS)[number];

/**
 * What the customer's site is built on. Detected from the served HTML by
 * src/lib/platform.ts, then confirmed by the customer — detection is good but
 * it is not a substitute for the person who owns the site telling us.
 */
export const PLATFORM_KEYS = [
  "FRAMER",
  "WEBFLOW",
  "WORDPRESS",
  "WIX",
  "SHOPIFY",
  "SQUARESPACE",
  "WEBSITE_BUILDER_OTHER",
  "CODE",
  "OTHER",
] as const;
export type PlatformKey = (typeof PLATFORM_KEYS)[number];

/**
 * How a fix physically reaches the customer's site. This is the honest core of
 * the whole delivery story: we can only push changes ourselves where a write
 * API exists, so the other two modes are named rather than pretended away.
 *
 * API    — we hold a scoped credential and write the change ourselves.
 * EDITOR — the customer invites us into their site builder and we make the
 *          change in their editor, because that builder has no write API.
 * GUIDED — we produce the exact change and the customer applies it. Used where
 *          neither of the above is available or wanted.
 *
 * Every mode ends the same way: we re-fetch the live URL and verify the signal
 * is actually present. That check does not care which mode produced it.
 */
export const DELIVERY_MODES = ["API", "EDITOR", "GUIDED"] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export const INTEGRATION_PROVIDERS = [
  "GITHUB",
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "FRAMER",
  "WIX",
  "SQUARESPACE",
  "UPLOAD",
  "GUIDED",
] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export const INTEGRATION_STATUSES = ["NOT_CONNECTED", "PENDING", "CONNECTED", "ERROR"] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export const ENGINE_KEYS = ["chatgpt", "perplexity", "gemini", "claude"] as const;
export type EngineKey = (typeof ENGINE_KEYS)[number];

export const PROMPT_INTENTS = ["INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL", "NAVIGATIONAL"] as const;
export type PromptIntent = (typeof PROMPT_INTENTS)[number];

export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const SENTIMENTS = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export const ISSUE_CATEGORIES = [
  "AI_UNDERSTANDING",
  "CONTENT",
  "STRUCTURED_DATA",
  "TECHNICAL",
  "ENTITY",
  "AUTHORITY",
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  AI_UNDERSTANDING: "AI Understanding",
  CONTENT: "Content",
  STRUCTURED_DATA: "Structured Data",
  TECHNICAL: "Technical Accessibility",
  ENTITY: "Entity Signals",
  AUTHORITY: "Authority",
};

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const ISSUE_STATUSES = ["OPEN", "IN_PROGRESS", "FIXED", "DISMISSED"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const OPTIMIZATION_TYPES = ["CONTENT", "SCHEMA", "TECHNICAL", "INTERNAL_LINKS", "ENTITY"] as const;
export type OptimizationType = (typeof OPTIMIZATION_TYPES)[number];

export const OPTIMIZATION_STATUSES = ["SUGGESTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"] as const;
export type OptimizationStatus = (typeof OPTIMIZATION_STATUSES)[number];

export const EFFORTS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Effort = (typeof EFFORTS)[number];

export const CODE_CHANGE_STATUSES = [
  "DRAFT",
  "READY_FOR_CLAUDE",
  "GENERATING",
  "AWAITING_REVIEW",
  "APPROVED",
  "REJECTED",
  "MERGED",
] as const;
export type CodeChangeStatus = (typeof CODE_CHANGE_STATUSES)[number];

export const CONTENT_TYPES = ["COMPARISON", "GUIDE", "LISTICLE", "FAQ", "CASE_STUDY", "LANDING_PAGE"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_STATUSES = ["IDEA", "PLANNED", "IN_PROGRESS", "PUBLISHED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const RESEARCH_SESSION_STATUSES = ["IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;
export type ResearchSessionStatus = (typeof RESEARCH_SESSION_STATUSES)[number];

export const AUDIT_CATEGORY_KEYS = [
  "aiUnderstanding",
  "content",
  "structuredData",
  "technical",
  "entitySignals",
  "authority",
] as const;
export type AuditCategoryKey = (typeof AUDIT_CATEGORY_KEYS)[number];

export const AUDIT_CATEGORY_LABELS: Record<AuditCategoryKey, string> = {
  aiUnderstanding: "AI Understanding",
  content: "Content",
  structuredData: "Structured Data",
  technical: "Technical Accessibility",
  entitySignals: "Entity Signals",
  authority: "Authority",
};

export const AUDIT_CATEGORY_TO_ISSUE_CATEGORY: Record<AuditCategoryKey, IssueCategory> = {
  aiUnderstanding: "AI_UNDERSTANDING",
  content: "CONTENT",
  structuredData: "STRUCTURED_DATA",
  technical: "TECHNICAL",
  entitySignals: "ENTITY",
  authority: "AUTHORITY",
};
