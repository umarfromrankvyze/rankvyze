import { z } from "zod";
import { CONTENT_TYPES, DELIVERY_MODES, EFFORTS, INTEGRATION_PROVIDERS, ISSUE_CATEGORIES, OPTIMIZATION_TYPES, PLATFORM_KEYS, PRIORITIES, PROMPT_INTENTS, SENTIMENTS, SEVERITIES } from "@/lib/enums";

const url = z
  .string()
  .trim()
  .min(3, "Enter a website URL")
  .transform((v) => (v.startsWith("http") ? v : `https://${v}`))
  .pipe(z.string().url("Enter a valid URL"));

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const onboardingWebsiteSchema = z.object({
  url,
});

export const onboardingBusinessSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name").max(120),
  industry: z.string().trim().min(2, "Choose an industry").max(80),
  description: z.string().trim().min(20, "Give us at least a sentence").max(1200),
  targetAudience: z.string().trim().min(3, "Who do you sell to?").max(400),
  productsServices: z.string().trim().min(3, "What do you offer?").max(600),
  targetLocations: z.string().trim().max(300).optional().default(""),
});

export const onboardingCompetitorsSchema = z.object({
  competitors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name required").max(80),
        domain: z.string().trim().min(3, "Domain required").max(120),
      }),
    )
    .min(1, "Add at least one competitor")
    .max(5, "Up to five competitors for now"),
});

export const onboardingIntegrationSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS).nullable(),
  mode: z.enum(DELIVERY_MODES).nullable(),
  repoUrl: z.string().trim().max(300).optional().default(""),
  // Free text about how we'll get access — never a credential. Secrets are
  // exchanged out of band, so there is nowhere in this app to type one.
  accessNote: z.string().trim().max(1000).optional().default(""),
});

export const platformSchema = z.object({
  platform: z.enum(PLATFORM_KEYS),
});

export const promptSchema = z.object({
  text: z.string().trim().min(5, "Prompt is too short").max(300),
  category: z.string().trim().max(60).optional().default(""),
  intent: z.enum(PROMPT_INTENTS).default("COMMERCIAL"),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
});

export const competitorSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  domain: z.string().trim().min(3, "Domain required").max(120),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const websiteSettingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url,
  industry: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().max(1200).optional().default(""),
  targetAudience: z.string().trim().max(400).optional().default(""),
  productsServices: z.string().trim().max(600).optional().default(""),
  targetLocations: z.string().trim().max(300).optional().default(""),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Use at least 8 characters").max(128),
});

export const researchResultSchema = z.object({
  websiteId: z.string().min(1),
  promptId: z.string().min(1),
  engineId: z.string().min(1),
  sessionId: z.string().optional().default(""),
  mentioned: z.boolean(),
  position: z.number().int().min(1).max(20).nullable(),
  cited: z.boolean(),
  citationUrl: z.string().trim().max(500).optional().default(""),
  sentiment: z.enum(SENTIMENTS).nullable().default(null),
  answerSummary: z.string().trim().max(2000).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  screenshotUrl: z.string().trim().max(500).optional().default(""),
  competitors: z.array(z.object({ name: z.string().trim().min(1), position: z.number().int().nullable() })).default([]),
});

export const auditSchema = z.object({
  websiteId: z.string().min(1),
  overallScore: z.number().int().min(0).max(100),
  aiUnderstanding: z.number().int().min(0).max(100),
  content: z.number().int().min(0).max(100),
  structuredData: z.number().int().min(0).max(100),
  technical: z.number().int().min(0).max(100),
  entitySignals: z.number().int().min(0).max(100),
  authority: z.number().int().min(0).max(100),
  summary: z.string().trim().max(2000).optional().default(""),
});

export const issueSchema = z.object({
  websiteId: z.string().min(1),
  auditId: z.string().optional().default(""),
  title: z.string().trim().min(3).max(160),
  category: z.enum(ISSUE_CATEGORIES),
  severity: z.enum(SEVERITIES),
  impactScore: z.number().min(0).max(10),
  description: z.string().trim().min(10).max(2000),
  whyItMatters: z.string().trim().max(2000).optional().default(""),
  currentImplementation: z.string().trim().max(4000).optional().default(""),
  recommendedImplementation: z.string().trim().max(4000).optional().default(""),
  affectedPages: z.string().trim().max(1000).optional().default(""),
});

export const optimizationSchema = z.object({
  websiteId: z.string().min(1),
  issueId: z.string().optional().default(""),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional().default(""),
  type: z.enum(OPTIMIZATION_TYPES),
  impactScore: z.number().min(0).max(10),
  effort: z.enum(EFFORTS),
});

export const codeChangeSchema = z.object({
  websiteId: z.string().min(1),
  optimizationId: z.string().optional().default(""),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(2000).optional().default(""),
  repository: z.string().trim().max(200).optional().default(""),
  branch: z.string().trim().max(120).optional().default(""),
  instructions: z.string().trim().max(6000).optional().default(""),
});

export const contentOpportunitySchema = z.object({
  websiteId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  targetPrompt: z.string().trim().max(300).optional().default(""),
  potential: z.enum(PRIORITIES),
  intent: z.enum(PROMPT_INTENTS),
  contentType: z.enum(CONTENT_TYPES),
  briefing: z.string().trim().max(3000).optional().default(""),
});

export type FieldErrors = Record<string, string>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
