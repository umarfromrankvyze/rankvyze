import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, isGoogleAuthConfigured } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  if (!isGoogleAuthConfigured()) return fail("google_not_configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("rv_oauth_state")?.value;
  jar.delete("rv_oauth_state");
  if (!code || !state || state !== expected) return fail("oauth_state");

  const base = process.env.APP_URL ?? url.origin;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${base}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("oauth_token");
  const tokens = (await tokenRes.json()) as { access_token: string; refresh_token?: string; expires_in?: number };

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) return fail("oauth_profile");
  const profile = (await profileRes.json()) as { sub: string; email: string; name?: string; picture?: string };
  if (!profile.email) return fail("oauth_profile");

  const email = profile.email.toLowerCase();
  let user = await db.user.findUnique({ where: { email } });
  let isNew = false;

  if (!user) {
    isNew = true;
    user = await db.user.create({
      data: { name: profile.name ?? email.split("@")[0], email, image: profile.picture ?? null, role: "CUSTOMER" },
    });
    const baseSlug = slugify(user.name.split(" ")[0] || "workspace") || "workspace";
    let slug = baseSlug;
    for (let i = 2; await db.organization.findUnique({ where: { slug } }); i++) slug = `${baseSlug}-${i}`;
    await db.organization.create({
      data: {
        name: `${user.name.split(" ")[0]}'s workspace`,
        slug,
        members: { create: { userId: user.id, role: "OWNER" } },
        subscription: { create: { plan: "TRIAL", status: "TRIALING", periodEnd: new Date(Date.now() + 14 * 86400000) } },
      },
    });
  }

  await db.account.upsert({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.sub } },
    create: {
      userId: user.id,
      provider: "google",
      providerAccountId: profile.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
    },
    update: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token ?? undefined },
  });

  await createSession(user.id);

  if (user.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
  if (isNew) return NextResponse.redirect(new URL("/onboarding", req.url));
  const membership = await db.membership.findFirst({ where: { userId: user.id }, include: { organization: true } });
  const dest = membership?.organization.onboardingCompletedAt ? "/dashboard" : "/onboarding";
  return NextResponse.redirect(new URL(dest, req.url));
}
