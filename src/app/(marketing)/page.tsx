import { Hero } from "@/components/marketing/sections/hero";
import { SocialProof } from "@/components/marketing/sections/social-proof";
import { Problem } from "@/components/marketing/sections/problem";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { Showcase } from "@/components/marketing/sections/showcase";
import { Features } from "@/components/marketing/sections/features";
import { Audit } from "@/components/marketing/sections/audit";
import { Optimization } from "@/components/marketing/sections/optimization";
import { Competitors } from "@/components/marketing/sections/competitors";
import { FinalCta } from "@/components/marketing/sections/cta";
import { PageJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <PageJsonLd
        path="/"
        name="RankVyze — Rank higher in AI search"
        description="We rank your business in ChatGPT, Gemini and Claude. If you don't show up in 45 days, we refund you 100%."
      />
      <ServiceJsonLd />
      <Hero />
      <SocialProof />
      <Problem />
      <HowItWorks />
      <Showcase />
      <Features />
      <Audit />
      <Optimization />
      <Competitors />
      <FinalCta />
    </>
  );
}
