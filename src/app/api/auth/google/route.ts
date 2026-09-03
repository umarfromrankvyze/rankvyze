import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isGoogleAuthConfigured } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("rv_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });

  const base = process.env.APP_URL ?? new URL(req.url).origin;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${base}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
