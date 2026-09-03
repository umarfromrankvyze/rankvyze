"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container-x flex h-16 items-center">
        <Logo />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-4 font-display text-[2rem] font-bold leading-tight tracking-[-0.03em] text-ink">We hit an unexpected error.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{error.message || "Please try again. If it keeps happening, contact us."}</p>
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Back home</Link>
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
