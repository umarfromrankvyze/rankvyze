"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Product", href: "/#product" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "AEO Services", href: "/answer-engine-optimization" },
  { label: "Pricing", href: "/pricing" },
  // A real crawlable page in the primary nav, rather than a fourth homepage
  // anchor — sitewide internal links are the cheapest signal the blog can get.
  { label: "Free Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
];

export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || open
            ? "border-line bg-white/85 shadow-[0_1px_0_0_rgb(11_11_15/0.02)] backdrop-blur-xl"
            : "border-transparent bg-white/0",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink pointer-coarse:min-h-11",
                  pathname === item.href && "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {signedIn ? (
              <Button variant="dark" asChild>
                <Link href="/dashboard">
                  Open dashboard <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="dark" asChild>
                  <Link href="/signup">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="-mr-1.5 inline-flex size-11 items-center justify-center rounded-lg text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/*
        The mobile panel is deliberately a sibling of <header>, not a child.

        The header carries `backdrop-blur`, and a non-`none` backdrop-filter
        establishes a containing block for fixed-position descendants — exactly
        like `transform` does. Nested inside it, this panel's `top-16 bottom-0`
        resolved against the 65px header rather than the viewport, computing to
        a height of 0: the white background collapsed to a sliver while the menu
        content spilled out over the page behind it.

        `dvh` rather than `bottom-0` so mobile browser chrome collapsing doesn't
        leave a gap, and the panel scrolls internally on short/landscape screens.
      */}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden",
          open
            ? "fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-white"
            : "hidden",
        )}
      >
        <nav className="container-x flex flex-col py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-lg font-semibold text-ink"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-2.5">
            {signedIn ? (
              <Button variant="dark" size="lg" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="primary" size="lg" asChild>
                  <Link href="/signup">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
