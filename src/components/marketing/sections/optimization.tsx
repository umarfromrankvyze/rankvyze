import { Section, SectionHeading } from "@/components/marketing/section";
import { CodeDiffPanel } from "@/components/marketing/mocks/code-diff-panel";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  { title: "Issue detected", text: "The audit flags a weak entity definition on your homepage." },
  { title: "Fix proposed", text: "RankVyze drafts the exact content, schema and structural changes needed." },
  { title: "You review", text: "Every change is a readable diff. Approve it, edit it, or reject it." },
  { title: "Ship it", text: "Approved changes become a pull request for your team to merge." },
];

export function Optimization() {
  return (
    <Section id="optimization" tone="dark" className="overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="container-x">
        <SectionHeading
          dark
          eyebrow="AI Optimization"
          title="Don't just get recommendations. Fix them."
          description="RankVyze identifies AEO opportunities and turns them into actionable website improvements — as reviewable code and content, not another PDF of advice."
        />

        <Reveal delay={120} className="mt-14">
          <CodeDiffPanel />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <p className="font-mono text-[12px] text-brand-400">0{i + 1}</p>
              <p className="mt-2 font-display text-[16px] font-semibold text-white">{s.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{s.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-10 text-center">
          <p className="text-[12.5px] text-white/45">
            AI-assisted implementation. Nothing is written to your site without your review.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
