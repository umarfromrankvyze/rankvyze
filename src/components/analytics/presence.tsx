"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { HEARTBEAT_SECONDS } from "@/lib/analytics";

/**
 * Anonymous presence beacon.
 *
 * Generates a random id once and keeps it in localStorage. It identifies a
 * browser, not a person: no email, no account id, nothing derived from an IP.
 * Clearing site data resets it, which is the point.
 *
 * Pauses while the tab is hidden, so a backgrounded tab left open overnight
 * doesn't register as a live visitor for eight hours.
 */

const STORAGE_KEY = "rv_vid";

function visitorId() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, id);
    return id;
    // Private windows and blocked storage both throw here. Returning null means
    // this visit simply isn't counted — better than breaking the page.
  } catch {
    return null;
  }
}

export function Presence() {
  const pathname = usePathname();

  useEffect(() => {
    const id = visitorId();
    if (!id) return;

    const params = new URLSearchParams(window.location.search);
    const payload = {
      visitorId: id,
      path: pathname,
      referrer: document.referrer || null,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
    };

    let cancelled = false;
    const ping = () => {
      if (cancelled || document.visibilityState !== "visible") return;
      void fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
        // Nothing reads the response; a failure is not worth surfacing.
      }).catch(() => {});
    };

    ping();
    const timer = window.setInterval(ping, HEARTBEAT_SECONDS * 1000);
    document.addEventListener("visibilitychange", ping);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [pathname]);

  return null;
}
