import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { PRICING_FAQ } from "@/content/faq";

/**
 * The homepage FAQ.
 *
 * Added because our own scanner flagged the homepage for having no FAQPage
 * structured data — and the only honest way to fix that is to put the answers
 * on the page. Marking up questions a visitor cannot see is schema spam, so
 * this section and the FAQPage node in page.tsx read from the same array and
 * cannot drift apart.
 *
 * It earns its place beyond the markup too: these are the five objections that
 * decide a $99 purchase, and answering them above the final call to action is
 * where they belong.
 */
export function Faq() {
  return (
    <Section className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="FAQ"
          title="Before you buy."
          description="The questions people actually ask. If yours isn't here, reply to any email and a person answers."
        />
        <dl className="mx-auto mt-12 max-w-3xl divide-y divide-line border-y border-line">
          {PRICING_FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <div className="py-6">
                <dt className="font-display text-[17px] font-bold tracking-tight text-ink">{item.q}</dt>
                <dd className="mt-2.5 text-[15.5px] leading-[1.7] text-ink-muted">{item.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
