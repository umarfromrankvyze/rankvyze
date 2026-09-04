import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Contact RankVyze",
  description:
    "Questions about answer engine optimization, the 45-day guarantee, or whether your site is a fit? Email hello@rankvyze.com and we'll reply.",
  alternates: { canonical: "/contact" },
};

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

      {/* Answering the three questions people actually write in with, so the
          page is useful before anyone sends anything — and so it isn't 140
          words of boilerplate to a crawler that doesn't run JavaScript. */}
      <div className="container-x mt-16 md:mt-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface-2 p-8 md:p-10">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">Before you write</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
            Most messages ask one of these three. If yours is here, the answer is a click away rather than a day away.
          </p>
          <dl className="mt-7 space-y-6">
            <div>
              <dt className="text-[15.5px] font-semibold text-ink">&ldquo;Will this work for my business?&rdquo;</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.7] text-ink-muted">
                The test is whether your buyers ask comparative questions before choosing — &ldquo;best X for Y&rdquo;,
                &ldquo;X vs Y&rdquo;, &ldquo;how much does X cost&rdquo;. If they do, an AI answer is already shaping
                that decision. Run the{" "}
                <Link href="/pricing" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
                  free scan
                </Link>{" "}
                first — it takes about ten seconds and tells you more than we could guess from an email.
              </dd>
            </div>
            <div>
              <dt className="text-[15.5px] font-semibold text-ink">&ldquo;What exactly do I get for {"$99"}?&rdquo;</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.7] text-ink-muted">
                Baseline research across ChatGPT, Perplexity, Gemini and Claude, a full AEO audit scored across six
                categories, implementation of the fixes as reviewable changes, and a re-measurement at the end. The full
                list is on the{" "}
                <Link href="/answer-engine-optimization" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
                  services page
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="text-[15.5px] font-semibold text-ink">&ldquo;How does the refund actually work?&rdquo;</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.7] text-ink-muted">
                If your business isn&rsquo;t mentioned on at least two of the four engines within 45 days, on the prompt
                set agreed at day zero, you get the whole {"$99"} back. The conditions that void it are published in
                advance on the{" "}
                <Link href="/guarantee" className="font-medium text-ink underline decoration-brand-500/40 underline-offset-[3px] hover:decoration-brand-500">
                  guarantee page
                </Link>{" "}
                — there are no others.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
