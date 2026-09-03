import { Radar, Search, TrendingUp, Wrench } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  {
    n: "01",
    title: "Analyze",
    icon: Search,
    text: "We analyze your website, content, technical structure and current AI visibility across every major engine.",
  },
  {
    n: "02",
    title: "Discover",
    icon: Radar,
    text: "Identify exactly where AI engines understand you, ignore you, or recommend competitors instead.",
  },
  {
    n: "03",
    title: "Optimize",
    icon: Wrench,
    text: "Find the highest-impact AEO opportunities across content, structure, entities and technical signals.",
  },
  {
    n: "04",
    title: "Improve",
    icon: TrendingUp,
    text: "Implement the changes — with AI-assisted code and content — and measure visibility over time.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="soft">
      <div className="container-x">
        <SectionHeading
          eyebrow="How RankVyze works"
          title="From invisible to recommended."
          description="A repeatable loop that turns AI search from a black box into a channel you can actually manage."
        />

        <ol className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-5">
          <div aria-hidden className="absolute left-0 right-0 top-[38px] hidden h-px bg-line-strong md:block" />
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <Reveal delay={i * 90}>
              <div className="relative rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-ink text-white">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-[13px] font-bold tracking-[0.1em] text-brand-500">{s.n}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.text}</p>
              </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
