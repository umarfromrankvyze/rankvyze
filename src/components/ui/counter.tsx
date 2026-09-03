"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animated number that counts up from 0. Starts immediately when the element
 * is already on screen, otherwise the first time it scrolls into view.
 */
export function Counter({ value, duration = 1100, decimals = 0, prefix = "", suffix = "", className }: CounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    let io: IntersectionObserver | null = null;
    if (inView) {
      frame = requestAnimationFrame(run);
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            io?.disconnect();
            run();
          }
        },
        { threshold: 0.2 },
      );
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
