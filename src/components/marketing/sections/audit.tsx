import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { AuditPanel } from "@/components/marketing/mocks/audit-panel";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

const ISSUES = [
  { tone: "bg-danger", text: "Weak entity definition" },
  { tone: "bg-danger", text: "Missing comparison content" },
  { tone: "bg-warning", text: "Poor structured data" },
  { tone: "bg-warning", text: "Weak topical coverage" },
];

export function Audit() {
  return (
    <Section id="audit">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-4">AEO Audit</p>
          <h2 className="text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.6rem] md:text-[3rem]">
            Find what&apos;s holding your AI visibility back.
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
            The AEO Audit scores your site the way a model reads it: can it tell what you do, who you serve, and why
            you&apos;re credible? Every gap becomes a prioritized, explained issue.
          </p>

          <ul className="mt-8 space-y-2.5">
            {ISSUES.map((i) => (
              <li key={i.text} className="flex items-center gap-3 text-[15px] font-medium text-ink">
                <span className={`size-2.5 rounded-full ${i.tone}`} />
                {i.text}
              </li>
            ))}
          </ul>

          <Button size="lg" variant="dark" className="mt-9" asChild>
            <Link href="/signup">
              View AEO Audit <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={140}>
          <AuditPanel />
        </Reveal>
      </div>
    </Section>
  );
}
