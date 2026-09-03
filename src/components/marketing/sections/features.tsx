import { BarChart3, Code2, FileText, Lightbulb, MessageSquareText, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Prompt tracking",
    text: "Track the buyer questions that matter and see whether you're mentioned, where, and whether you're cited.",
  },
  {
    icon: Quote,
    title: "Citations",
    text: "Know which of your pages AI engines actually reference — and which competitor pages they trust instead.",
  },
  {
    icon: BarChart3,
    title: "AEO Audit",
    text: "Six-category health score covering entity clarity, content depth, structured data, technical access and authority.",
  },
  {
    icon: Lightbulb,
    title: "Content opportunities",
    text: "Find the comparison, guide and FAQ content that AI engines want to see before they'll recommend you.",
  },
  {
    icon: Code2,
    title: "Code changes",
    text: "Schema, entity and structure fixes delivered as reviewable diffs, ready to become pull requests.",
  },
  {
    icon: FileText,
    title: "Reports",
    text: "Board-ready summaries of visibility, health, competitors and completed work — generated in one click.",
  },
];

export function Features() {
  return (
    <Section id="features" tone="soft">
      <div className="container-x">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to be the answer."
          description="From measurement to implementation, in one workspace."
        />
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="group h-full rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                  <f.icon className="size-[18px]" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-bold tracking-tight text-ink">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
