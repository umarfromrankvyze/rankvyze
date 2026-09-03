import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Invalid link</h1>
        <p className="mt-2 text-[14px] text-ink-muted">This password reset link is missing its token. Request a new one.</p>
        <Button size="lg" className="mt-8 w-full" asChild>
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
