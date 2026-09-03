import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = { title: "Contact", description: "Talk to the RankVyze team." };

export default function ContactPage() {
  return (
    <Section>
      <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-balance font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.2rem]">Let&apos;s talk about your AI visibility.</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
            Whether you want a walkthrough, have a question about a plan, or manage many brands and need something custom — we read every message.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              { icon: Mail, title: "Email", text: "hello@rankvyze.com" },
              { icon: MessageSquare, title: "Sales", text: "For Scale plans and agencies: sales@rankvyze.com" },
              { icon: Clock, title: "Response time", text: "Within one business day, usually faster." },
            ].map((it) => (
              <li key={it.title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
                  <it.icon className="size-4 text-ink" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-ink">{it.title}</span>
                  <span className="block text-[14px] text-ink-muted">{it.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
