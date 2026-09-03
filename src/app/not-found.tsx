import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container-x flex h-16 items-center">
        <Logo />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-4 font-display text-[2.4rem] font-bold leading-tight tracking-[-0.03em] text-ink">This page isn&apos;t the answer.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft /> Back home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
