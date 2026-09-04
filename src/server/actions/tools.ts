"use server";

import { checkCrawlers, type CrawlerReport } from "@/lib/tools/crawlers";
import { checkDomainAge, type DomainAgeReport } from "@/lib/tools/domain-age";
import { checkMeta, type MetaReport } from "@/lib/tools/meta";
import { checkSchema, type SchemaReport } from "@/lib/tools/schema";
import { checkVisibility, type VisibilityReport } from "@/lib/tools/visibility";
import { ToolError } from "@/lib/tools/http";
import { fail, succeed, type ActionResult } from "@/server/types";

/**
 * The free tools, as server actions.
 *
 * Each fetches a URL supplied by an anonymous visitor, so the SSRF guard in
 * src/lib/tools/http.ts runs before any connection is made. `ToolError` carries
 * messages written for a visitor; anything else is logged and reported
 * generically, so an internal failure can't leak a stack trace into the page.
 */

export type ToolReport = CrawlerReport | SchemaReport | MetaReport | DomainAgeReport | VisibilityReport;

async function run<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return succeed(await work());
  } catch (error) {
    if (error instanceof ToolError) return fail(error.message);
    console.error("[tools] unexpected failure", error);
    return fail("Something went wrong running that check. Try again in a moment.");
  }
}

function inputFrom(formData: FormData) {
  return String(formData.get("url") ?? "").slice(0, 500);
}

export async function runCrawlerCheck(_prev: ActionResult<CrawlerReport>, formData: FormData) {
  return run(() => checkCrawlers(inputFrom(formData)));
}

export async function runSchemaCheck(_prev: ActionResult<SchemaReport>, formData: FormData) {
  return run(() => checkSchema(inputFrom(formData)));
}

export async function runMetaCheck(_prev: ActionResult<MetaReport>, formData: FormData) {
  return run(() => checkMeta(inputFrom(formData)));
}

export async function runVisibilityCheck(_prev: ActionResult<VisibilityReport>, formData: FormData) {
  return run(() => checkVisibility(inputFrom(formData)));
}

export async function runDomainAgeCheck(_prev: ActionResult<DomainAgeReport>, formData: FormData) {
  return run(() => checkDomainAge(inputFrom(formData)));
}
