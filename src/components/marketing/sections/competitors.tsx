import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { CompetitorTable } from "@/components/marketing/mocks/competitor-table";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function Competitors() {
  return (
    <Section id="competitors" tone="soft">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <CompetitorTable />
        </Reveal>

        <Reveal delay={100} className="order-1 lg:order-2">
          <p className="eyebrow mb-4">Competitors</p>
          <h2 className="text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.6rem] md:text-[3rem]">
            See who AI recommends instead.
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
            When an AI engine names a competitor instead of you, that&apos;s a lost customer you never saw. RankVyze
            tracks every competitor mention across every prompt, so you know exactly who&apos;s winning — and why.
          </p>
          <ul className="mt-7 space-y-3 text-[15px] text-ink">
            {[
              "Side-by-side visibility scores per engine",
              "Which competitor pages get cited, and for what",
              "The content gaps that explain the difference",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-500" />
                {t}
              </li>
            ))}
          </ul>
          <Button size="lg" variant="dark" className="mt-9" asChild>
            <Link href="/signup">
              Compare My Brand <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
