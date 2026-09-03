import { Reveal } from "@/components/shared/reveal";

/** Placeholder wordmarks — intentionally fictional, set in distinct type styles. */
const LOGOS = [
  { name: "Northwind", className: "font-display font-extrabold tracking-tight" },
  { name: "Halcyon & Co", className: "font-serif italic tracking-tight" },
  { name: "VERTEX", className: "font-sans font-bold tracking-[0.25em]" },
  { name: "Meridian", className: "font-display font-semibold tracking-[-0.02em]" },
  { name: "oakline", className: "font-mono font-medium lowercase" },
  { name: "Lumen Labs", className: "font-sans font-semibold" },
  { name: "Kestrel", className: "font-display font-bold uppercase tracking-[0.12em]" },
  { name: "Solstice", className: "font-serif font-semibold" },
];

export function SocialProof() {
  return (
    <section className="border-y border-line bg-surface-2 py-12 md:py-14">
      <div className="container-x">
        <Reveal>
          <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Built for businesses that want to be found by AI
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 md:grid-cols-8">
            {LOGOS.map((l) => (
              <div
                key={l.name}
                className={`flex items-center justify-center text-[17px] text-ink/45 transition-colors hover:text-ink ${l.className}`}
              >
                {l.name}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
