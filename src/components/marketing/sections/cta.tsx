import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-500 py-24 text-white md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_10%,transparent_100%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[3.2rem] md:text-[4rem]">
            Ready to become the answer?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-white/85 md:text-lg">
            Free scan in ten seconds. $99 to fix it — refunded in full if we don&apos;t.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="xl" variant="white" asChild className="w-full text-brand-600 sm:w-auto">
              <Link href="/pricing">
                Analyze My Website <ArrowRight />
              </Link>
            </Button>
            <Button size="xl" variant="ghost" asChild className="w-full border border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto">
              <Link href="/guarantee">See the guarantee</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
