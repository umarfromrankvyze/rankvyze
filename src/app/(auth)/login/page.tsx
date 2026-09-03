import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";
import { isGoogleAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm googleEnabled={isGoogleAuthConfigured()} next={next} />;
}
