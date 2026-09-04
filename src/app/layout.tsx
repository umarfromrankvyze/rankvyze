import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.APP_URL ?? "https://rankvyze.com";

/** Unset in local dev, so analytics only runs where it's configured. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Datafast, alongside Google Analytics rather than replacing it.
 *
 * The website id is public by design — it ships in the HTML of every page and
 * identifies the site, not the account — so it lives in an env var for
 * configurability, not secrecy. Reading it from the environment means a preview
 * or a fork doesn't silently report into production's numbers.
 */
const DATAFAST_ID = process.env.NEXT_PUBLIC_DATAFAST_ID;
const DATAFAST_DOMAIN = process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ?? "rankvyze.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RankVyze — Rank higher in AI search",
    template: "%s · RankVyze",
  },
  description:
    "We rank your business in ChatGPT, Gemini and Claude. If you don't show up in 45 days, we refund you 100%.",
  openGraph: {
    title: "RankVyze — Rank higher in AI search",
    description:
      "We rank your business in ChatGPT, Gemini and Claude. If you don't show up in 45 days, we refund you 100%.",
    url: SITE_URL,
    siteName: "RankVyze",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankVyze — Rank higher in AI search",
    description: "We rank your business in ChatGPT, Gemini and Claude. Or we refund you 100%.",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-surface text-ink antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-xl !border-line !shadow-lift !font-sans",
              title: "!text-ink !font-medium",
              description: "!text-ink-muted",
            },
          }}
          richColors
          closeButton
        />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      {DATAFAST_ID && (
        // next/script with afterInteractive rather than a raw <script defer>:
        // it keeps the tag out of the critical path and survives client-side
        // navigation, which a hand-written tag in the App Router does not.
        <Script
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
          data-website-id={DATAFAST_ID}
          data-domain={DATAFAST_DOMAIN}
        />
      )}
    </html>
  );
}
