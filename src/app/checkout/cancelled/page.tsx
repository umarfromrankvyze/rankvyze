import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <Card className="p-8 md:p-10">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Checkout cancelled</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
          Nothing was charged. Your account is still here — pick up where you left off whenever you&apos;re ready.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft /> Back to site
            </Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Return to checkout</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
