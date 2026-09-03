"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { flattenErrors } from "@/lib/validation";
import { fail, succeed, type ActionResult } from "@/server/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  company: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Tell us a little more").max(3000),
});

export async function submitContact(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  await db.contactMessage.create({ data: { ...parsed.data, company: parsed.data.company || null } });
  return succeed(undefined, "Thanks — we'll reply within one business day.");
}
