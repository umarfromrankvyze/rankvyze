import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/auth-forms";
import { isGoogleAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  const { scan } = await searchParams;
  return <SignupForm googleEnabled={isGoogleAuthConfigured()} scan={scan} />;
}
