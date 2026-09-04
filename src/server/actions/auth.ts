"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { flattenErrors, forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { fail, succeed, type ActionResult } from "@/server/types";
import { recordSignupMeta } from "@/server/signup-meta";

function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

export async function signUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return fail("An account with this email already exists.", { email: "Already registered — try logging in." });

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, role: "CUSTOMER" },
  });

  await recordSignupMeta(user.id);

  // Every customer gets an organization; onboarding fills in the website.
  const baseSlug = slugify(name.split(" ")[0] || "workspace") || "workspace";
  let slug = baseSlug;
  for (let i = 2; await db.organization.findUnique({ where: { slug } }); i++) slug = `${baseSlug}-${i}`;

  await db.organization.create({
    data: {
      name: `${name.split(" ")[0]}'s workspace`,
      slug,
      plan: "TRIAL",
      members: { create: { userId: user.id, role: "OWNER" } },
      subscription: { create: { plan: "TRIAL", status: "TRIALING", periodEnd: new Date(Date.now() + 14 * 86400000) } },
    },
  });

  await createSession(user.id);

  // Setup comes before payment. The 45-day clock starts at purchase, so it
  // must not start while we still don't know the site, the business or the
  // competitors — that would spend guarantee days on questions we hadn't asked
  // yet. Onboarding first, checkout at the end of it.
  const scanId = String(formData.get("scan") ?? "");
  if (scanId) {
    // They already told us the URL to get their free scan. Asking for it a
    // second time on the next screen is the kind of small insult that loses
    // people mid-signup, so carry it across.
    const scan = await db.scanRequest.findUnique({ where: { id: scanId } });
    if (scan) {
      const org = await db.membership.findFirst({ where: { userId: user.id }, select: { organizationId: true } });
      if (org) {
        await db.website.create({
          data: {
            organizationId: org.organizationId,
            url: scan.url,
            domain: scan.domain,
            name: scan.domain.split(".")[0].replace(/^\w/, (c) => c.toUpperCase()),
            isPrimary: true,
          },
        });
      }
    }
  }

  redirect("/onboarding");
}

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return fail("Incorrect email or password.");

  await createSession(user.id);

  const fallback = user.role === "ADMIN" ? "/admin" : "/dashboard";
  let next = safeNext(formData.get("next"), fallback);

  if (user.role !== "ADMIN") {
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      include: { organization: { include: { orders: { where: { status: { in: ["PAID", "REFUNDED"] } }, take: 1 } } } },
    });
    if (membership && !next.startsWith("/checkout")) {
      const org = membership.organization;
      // Same order as signup: finish setup, then pay, then the dashboard.
      if (!org.onboardingCompletedAt) next = "/onboarding";
      else if (org.orders.length === 0) next = "/checkout";
    }
  }
  redirect(next);
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}

export async function requestPasswordReset(_prev: ActionResult<{ devLink?: string }>, formData: FormData): Promise<ActionResult<{ devLink?: string }>> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Enter a valid email.", flattenErrors(parsed.error));

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  // Always respond identically so the form doesn't reveal which emails exist.
  if (!user) return succeed({}, "If an account exists for that email, a reset link is on its way.");

  await db.verificationToken.deleteMany({ where: { identifier: email, type: "PASSWORD_RESET" } });
  const token = randomBytes(24).toString("hex");
  await db.verificationToken.create({
    data: { identifier: email, token, type: "PASSWORD_RESET", expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const link = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  // No email provider is wired up in V1: log the link server-side and, in
  // development only, hand it back so the flow can be exercised end-to-end.
  console.info(`[auth] Password reset link for ${email}: ${link}`);
  return succeed(
    { devLink: process.env.NODE_ENV !== "production" ? link : undefined },
    "If an account exists for that email, a reset link is on its way.",
  );
}

export async function resetPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return fail("Please fix the highlighted fields.", flattenErrors(parsed.error));

  const record = await db.verificationToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.type !== "PASSWORD_RESET" || record.expiresAt < new Date()) {
    return fail("This reset link is invalid or has expired. Request a new one.");
  }

  const user = await db.user.findUnique({ where: { email: record.identifier } });
  if (!user) return fail("This reset link is invalid or has expired. Request a new one.");

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    db.verificationToken.deleteMany({ where: { identifier: record.identifier, type: "PASSWORD_RESET" } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);

  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}
