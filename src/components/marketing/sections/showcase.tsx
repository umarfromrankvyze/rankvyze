import { Section, SectionHeading } from "@/components/marketing/section";
import { ShowcaseDashboard } from "@/components/marketing/mocks/showcase-dashboard";
import { Reveal } from "@/components/shared/reveal";

const POINTS = [
  { label: "AI Visibility Score", text: "One number that tracks how recommendable you are across engines." },
  { label: "Engine breakdown", text: "ChatGPT, Perplexity, Gemini and Claude — measured separately." },
  { label: "Tracked prompts", text: "The exact questions your buyers ask, checked on a schedule." },
  { label: "Competitors & citations", text: "Who gets named instead of you, and which pages AI trusts." },
];

export function Showcase() {
  return (
    <Section>
      <div className="container-x">
        <SectionHeading
          eyebrow="The dashboard"
          title="See how AI sees your business."
          description="Every metric in RankVyze comes from real AI answers to real buyer questions — not proxies, not guesses."
        />

        <Reveal delay={120} className="relative mt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -bottom-8 top-10 -z-10 rounded-[40px] bg-[radial-gradient(70%_60%_at_50%_100%,rgb(252_93_44/0.14),transparent_70%)]"
          />
          <ShowcaseDashboard />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p, i) => (
            <Reveal key={p.label} delay={i * 70} className="border-t-2 border-ink pt-4">
              <p className="font-display text-[15px] font-semibold text-ink">{p.label}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
