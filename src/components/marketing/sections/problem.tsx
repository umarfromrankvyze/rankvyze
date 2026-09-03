import { Section, SectionHeading } from "@/components/marketing/section";
import { SearchComparison } from "@/components/marketing/mocks/search-comparison";
import { Reveal } from "@/components/shared/reveal";
import { EngineSources } from "@/components/marketing/engine-sources";

const QUESTIONS = [
  "What's the best CRM for a small startup?",
  "Which Shopify agency should I hire?",
  "What's the best accounting software for freelancers?",
  "Which product is better for me?",
];

export function Problem() {
  return (
    <Section id="product">
      <div className="container-x">
        <SectionHeading
          eyebrow="The shift"
          title="Search is changing."
          description="Your customers are no longer only searching Google. They ask AI engines — and AI engines increasingly answer directly, with one recommendation instead of ten links."
        />

        <Reveal delay={120} className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {QUESTIONS.map((q, i) => (
            <div
              key={q}
              className={`flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-card ${i % 2 === 1 ? "sm:translate-y-3" : ""}`}
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-semibold text-ink-muted">
                {i + 1}
              </span>
              <p className="font-display text-[15px] font-medium leading-snug text-ink">“{q}”</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={160} className="mt-20">
          <SearchComparison />
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-16 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink p-8 text-white md:p-10">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-500/25 blur-3xl" />
            <p className="eyebrow text-brand-400">The problem</p>
            <p className="mt-4 font-display text-[1.6rem] font-bold leading-tight tracking-tight md:text-[2rem]">
              Your business might rank on Google…
              <br />
              <span className="text-white/60">…but still be invisible inside AI answers.</span>
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
              AI engines don&apos;t rank pages. They decide which businesses they understand well enough to recommend. If
              your entity is fuzzy, your content thin, or your structure unreadable to models, you don&apos;t get a lower
              position — you get left out.
            </p>
          </div>
        </Reveal>

        <Reveal delay={140} className="mx-auto mt-6 max-w-3xl">
          <EngineSources />
        </Reveal>
      </div>
    </Section>
  );
}
