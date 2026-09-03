/**
 * Static demo content for the seed. Kept separate from the seed logic so the
 * copy is easy to review and edit without touching database code.
 */

export const ENGINES = [
  { key: "chatgpt", name: "ChatGPT", vendor: "OpenAI", color: "#10a37f", sortkey: 1 },
  { key: "perplexity", name: "Perplexity", vendor: "Perplexity AI", color: "#20808d", sortkey: 2 },
  { key: "gemini", name: "Gemini", vendor: "Google", color: "#4e7cf0", sortkey: 3 },
  { key: "claude", name: "Claude", vendor: "Anthropic", color: "#d97757", sortkey: 4 },
] as const;

export const ACME_COMPETITORS = [
  { name: "Northwind Digital", domain: "northwind.digital", notes: "Largest Shopify Plus partner in the segment. Heavy content output." },
  { name: "Halcyon Studio", domain: "halcyon.studio", notes: "Design-led agency, strong fashion case studies." },
  { name: "Vertex Commerce", domain: "vertexcommerce.co", notes: "Dev-heavy shop, lots of technical guides." },
  { name: "Oakline Labs", domain: "oakline.io", notes: "Smaller boutique; competes on price." },
];

export const ACME_PROMPTS: { text: string; category: string; intent: string; priority: string }[] = [
  { text: "Best Shopify agencies", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Best Shopify agencies for fashion brands", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Best ecommerce agencies in India", category: "Local", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Best website redesign agencies", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Best Shopify developers", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Which Shopify agency should I hire for a DTC apparel brand?", category: "Recommendation", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Shopify Plus agency for scaling fashion brands", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Top Shopify design agencies 2026", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "How much does a Shopify agency cost?", category: "Pricing", intent: "INFORMATIONAL", priority: "MEDIUM" },
  { text: "Shopify vs custom ecommerce build for a fashion brand", category: "Comparison", intent: "INFORMATIONAL", priority: "MEDIUM" },
  { text: "Best agencies for Shopify store migration", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Shopify redesign checklist", category: "Guide", intent: "INFORMATIONAL", priority: "LOW" },
  { text: "Best Shopify agencies for startups", category: "Discovery", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Who builds the best Shopify stores for luxury brands?", category: "Recommendation", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Best ecommerce CRO agencies", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Shopify headless commerce agency", category: "Discovery", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Best Shopify agencies in London", category: "Local", intent: "COMMERCIAL", priority: "MEDIUM" },
  { text: "Compare Northwind Digital vs Acme for Shopify", category: "Comparison", intent: "COMMERCIAL", priority: "HIGH" },
  { text: "Shopify development company reviews", category: "Trust", intent: "COMMERCIAL", priority: "LOW" },
  { text: "Best agencies for Shopify theme customization", category: "Discovery", intent: "COMMERCIAL", priority: "LOW" },
];

/**
 * Which prompt indexes each engine mentions Acme on, for the *current*
 * research session. Chosen to land the overall score around 42.
 */
export const MENTION_PLAN: Record<string, number[]> = {
  chatgpt: [0, 1, 2, 3, 5, 7, 8, 12, 14, 17, 19],
  claude: [0, 1, 2, 3, 4, 6, 8, 9, 12, 15, 17, 18],
  perplexity: [0, 1, 3, 5, 8, 11, 12, 14, 17],
  gemini: [0, 2, 3, 6, 8, 12, 15, 17],
};

/** Prompt indexes where Acme is cited (must be a subset of the mention plan). */
export const CITATION_PLAN: Record<string, number[]> = {
  chatgpt: [0, 1, 5, 8, 12, 17],
  claude: [0, 1, 2, 8, 9, 12, 17],
  perplexity: [0, 1, 8, 11, 12, 17],
  gemini: [0, 3, 8, 12],
};

/** Prior session (4 weeks earlier) — noticeably weaker, so the trend is real. */
export const PREVIOUS_MENTION_PLAN: Record<string, number[]> = {
  chatgpt: [0, 1, 5, 8, 12, 17],
  claude: [0, 1, 2, 8, 12, 17, 18],
  perplexity: [0, 1, 8, 12],
  gemini: [0, 8, 12],
};

export const PREVIOUS_CITATION_PLAN: Record<string, number[]> = {
  chatgpt: [0, 8],
  claude: [0, 8, 12],
  perplexity: [0, 8],
  gemini: [8],
};

/** Own-domain pages that get cited, keyed by prompt index. */
export const ACME_CITED_PAGES: Record<number, { path: string; title: string }> = {
  0: { path: "/", title: "Acme — Shopify agency for fashion & lifestyle brands" },
  1: { path: "/work/fashion", title: "Shopify builds for fashion brands — Acme case studies" },
  2: { path: "/locations/india", title: "Shopify agency in India — Acme" },
  3: { path: "/services/redesign", title: "Shopify store redesign — Acme" },
  5: { path: "/work/fashion", title: "Shopify builds for fashion brands — Acme case studies" },
  8: { path: "/guides/shopify-agency-cost", title: "How much does a Shopify agency cost? (2026 guide)" },
  9: { path: "/guides/shopify-vs-custom", title: "Shopify vs custom ecommerce: which is right for you?" },
  11: { path: "/guides/shopify-redesign-checklist", title: "The Shopify redesign checklist" },
  12: { path: "/services/startups", title: "Shopify for startups — launch packages" },
  17: { path: "/compare/northwind-vs-acme", title: "Northwind Digital vs Acme — an honest comparison" },
};

export const COMPETITOR_CITED_PAGES: Record<string, { path: string; title: string }[]> = {
  "northwind.digital": [
    { path: "/blog/best-shopify-agencies", title: "The 15 best Shopify agencies (ranked)" },
    { path: "/services/shopify-plus", title: "Shopify Plus development — Northwind" },
    { path: "/case-studies", title: "Case studies — Northwind Digital" },
  ],
  "halcyon.studio": [
    { path: "/work", title: "Selected work — Halcyon Studio" },
    { path: "/journal/fashion-ecommerce-design", title: "Designing fashion ecommerce that converts" },
  ],
  "vertexcommerce.co": [
    { path: "/guides/headless-shopify", title: "Headless Shopify: the complete guide" },
    { path: "/pricing", title: "Agency pricing — Vertex Commerce" },
  ],
  "oakline.io": [{ path: "/", title: "Oakline Labs — affordable Shopify development" }],
};

export const ANSWER_SUMMARIES: Record<string, string> = {
  mentioned_top:
    "Named as a top recommendation, with a short description of the fashion specialisation and a pointer to case studies.",
  mentioned_mid:
    "Listed among several options after the market leaders; description is generic and does not mention the fashion focus.",
  mentioned_low: "Mentioned briefly near the end of the list with no differentiating detail.",
  not_mentioned:
    "Acme is not mentioned. The answer recommends Northwind Digital and Halcyon Studio, citing their ranked lists and case study pages.",
};

export interface IssueSeed {
  title: string;
  category: string;
  severity: string;
  impactScore: number;
  status: string;
  description: string;
  whyItMatters: string;
  currentImplementation: string;
  recommendedImplementation: string;
  affectedPages: string[];
}

export const ACME_ISSUES: IssueSeed[] = [
  {
    title: "Weak entity definition",
    category: "ENTITY",
    severity: "CRITICAL",
    impactScore: 9.4,
    status: "IN_PROGRESS",
    description:
      "Your homepage does not clearly communicate what your business does in a way that can be easily understood by AI systems. The hero copy is a slogan, and the first descriptive sentence appears below the fold.",
    whyItMatters:
      "AI engines build an internal model of who you are from the first few hundred words of your key pages. Without a plain-language definition (what you do, for whom, where), they can't confidently match you to buyer questions — so they recommend a competitor they understand better.",
    currentImplementation:
      '<h1>We build beautiful things.</h1>\n<p>Design. Development. Growth.</p>',
    recommendedImplementation:
      '<h1>Acme is a Shopify agency for fashion and lifestyle brands.</h1>\n<p>We design, build and scale Shopify and Shopify Plus stores for apparel, footwear and accessories brands in the US, UK and India.</p>',
    affectedPages: ["/", "/about"],
  },
  {
    title: "Missing comparison content",
    category: "CONTENT",
    severity: "HIGH",
    impactScore: 8.7,
    status: "OPEN",
    description:
      "There is no content on your site that compares you with alternatives, or compares the approaches buyers are weighing (Shopify vs custom, agency vs freelancer).",
    whyItMatters:
      "Comparison prompts are the highest-intent questions AI engines receive. Engines answer them by citing pages that already frame the comparison. Right now, those pages belong to Northwind Digital.",
    currentImplementation: "No comparison pages exist. /blog contains only company news.",
    recommendedImplementation:
      "Publish 3–5 comparison pages targeting tracked prompts, e.g. “Shopify vs custom ecommerce for fashion brands”, “Northwind Digital vs Acme”, “Agency vs in-house Shopify team”. Each should have a clear verdict, a comparison table, and FAQ schema.",
    affectedPages: ["/blog", "/services"],
  },
  {
    title: "No Organization schema",
    category: "STRUCTURED_DATA",
    severity: "HIGH",
    impactScore: 8.2,
    status: "FIXED",
    description: "The site ships no Organization JSON-LD, so there is no machine-readable statement of your name, logo, locations, or social profiles.",
    whyItMatters:
      "Organization schema is the cheapest way to make your entity unambiguous. It links your name to your domain and your sameAs profiles, which engines use to reconcile mentions across the web.",
    currentImplementation: "No JSON-LD present in <head>.",
    recommendedImplementation:
      '{\n  "@type": "Organization",\n  "name": "Acme",\n  "url": "https://acme.com",\n  "logo": "https://acme.com/logo.png",\n  "sameAs": ["https://linkedin.com/company/acme", "https://www.shopify.com/partners/acme"],\n  "areaServed": ["US", "GB", "IN"]\n}',
    affectedPages: ["/"],
  },
  {
    title: "Service pages lack Service schema",
    category: "STRUCTURED_DATA",
    severity: "HIGH",
    impactScore: 7.6,
    status: "IN_PROGRESS",
    description: "Your five service pages are plain HTML with no Service or Offer markup.",
    whyItMatters:
      "Service schema tells engines exactly which services you offer and where — which is what “best X agency for Y” prompts ask about.",
    currentImplementation: "Service pages use a generic page template with no structured data.",
    recommendedImplementation:
      "Add a Service JSON-LD block per page with name, description, provider (Organization), areaServed and serviceType. Reuse one <ServiceSchema /> component.",
    affectedPages: ["/services/shopify-development", "/services/redesign", "/services/shopify-plus", "/services/cro", "/services/migration"],
  },
  {
    title: "Weak topical coverage for “Shopify for fashion brands”",
    category: "CONTENT",
    severity: "HIGH",
    impactScore: 7.4,
    status: "OPEN",
    description:
      "Fashion is your differentiator, but only one page (/work/fashion) discusses it. There is no guide, no FAQ, and no service page framed around fashion.",
    whyItMatters:
      "Engines infer specialisation from depth. A single page reads as a project category; a cluster of pages reads as expertise.",
    currentImplementation: "/work/fashion lists four projects with one paragraph each.",
    recommendedImplementation:
      "Create a fashion hub: a service page (“Shopify for fashion brands”), a buyer's guide, 2–3 detailed case studies with outcomes, and an FAQ. Interlink them.",
    affectedPages: ["/work/fashion", "/services"],
  },
  {
    title: "FAQ content is not structured",
    category: "STRUCTURED_DATA",
    severity: "MEDIUM",
    impactScore: 6.8,
    status: "OPEN",
    description: "Your FAQ section on /services uses an accordion rendered from JavaScript, with no FAQPage markup.",
    whyItMatters: "Question-and-answer pairs are the most directly reusable format for answer engines. Structured FAQs are frequently lifted verbatim.",
    currentImplementation: "<Accordion items={faqs} /> — content injected client-side.",
    recommendedImplementation:
      "Render FAQs server-side as <details>/<summary> or plain headings, and add FAQPage JSON-LD with the same question/answer text.",
    affectedPages: ["/services", "/pricing"],
  },
  {
    title: "No third-party mentions or reviews surfaced",
    category: "AUTHORITY",
    severity: "HIGH",
    impactScore: 7.9,
    status: "OPEN",
    description: "Your site doesn't reference the Shopify Partner directory listing, Clutch profile, or press coverage that already exist.",
    whyItMatters:
      "Engines weigh corroboration. If the only source describing Acme as a fashion Shopify agency is acme.com, the claim carries less weight than a competitor described the same way on five domains.",
    currentImplementation: "No external references or review widgets.",
    recommendedImplementation:
      "Add a “Recognition” section linking to Shopify Partners, Clutch and press. Include sameAs links in Organization schema. Encourage reviews on the directories engines cite.",
    affectedPages: ["/", "/about"],
  },
  {
    title: "Case studies lack outcome data",
    category: "AUTHORITY",
    severity: "MEDIUM",
    impactScore: 6.5,
    status: "OPEN",
    description: "Case studies describe the design process but do not state measurable results.",
    whyItMatters: "Engines prefer to recommend businesses they can justify. “+38% conversion rate after redesign” is a justification; “a beautiful new store” is not.",
    currentImplementation: "Each case study: hero image, three paragraphs on process, gallery.",
    recommendedImplementation:
      "Add a results block to every case study (metric, before/after, timeframe) and a one-line summary at the top. Mark up with a consistent heading so it's easy to extract.",
    affectedPages: ["/work/lumen", "/work/kestrel", "/work/solstice", "/work/meridian"],
  },
  {
    title: "Thin internal linking between services and case studies",
    category: "TECHNICAL",
    severity: "MEDIUM",
    impactScore: 6.1,
    status: "OPEN",
    description: "Service pages don't link to relevant case studies, and case studies don't link back to the service they demonstrate.",
    whyItMatters: "Internal links tell crawlers which pages belong together. Without them, the fashion case studies aren't associated with the Shopify development service.",
    currentImplementation: "Navigation-only linking; no contextual links in body copy.",
    recommendedImplementation:
      "Add “Related work” to each service page and “Service used” to each case study. Use descriptive anchor text (“Shopify redesign for Lumen”), not “Learn more”.",
    affectedPages: ["/services/*", "/work/*"],
  },
  {
    title: "Pricing and cost information absent",
    category: "CONTENT",
    severity: "MEDIUM",
    impactScore: 6.3,
    status: "OPEN",
    description: "There is no page that answers “how much does it cost” in any form — not ranges, not starting prices, not factors.",
    whyItMatters:
      "“How much does a Shopify agency cost?” is one of your tracked prompts, and engines can only cite pages that address it. Vertex Commerce's pricing page is cited on 3 of 4 engines.",
    currentImplementation: "/pricing redirects to /contact.",
    recommendedImplementation:
      "Publish a pricing guide with typical ranges by project type, the factors that move price, and a starting-from figure. It does not need to be a rate card.",
    affectedPages: ["/pricing"],
  },
  {
    title: "Homepage H1 is a slogan, not a description",
    category: "AI_UNDERSTANDING",
    severity: "MEDIUM",
    impactScore: 5.9,
    status: "OPEN",
    description: "The H1 “We build beautiful things.” contains no nouns an engine can map to a category.",
    whyItMatters: "H1 text is weighted heavily when engines summarise a page. A category-bearing H1 removes ambiguity in one line.",
    currentImplementation: "<h1>We build beautiful things.</h1>",
    recommendedImplementation: "<h1>Shopify agency for fashion &amp; lifestyle brands</h1>",
    affectedPages: ["/"],
  },
  {
    title: "Work pages render client-side only",
    category: "TECHNICAL",
    severity: "MEDIUM",
    impactScore: 5.6,
    status: "OPEN",
    description: "/work and its children fetch project data after load; the server-rendered HTML contains an empty grid.",
    whyItMatters: "Most AI crawlers do not execute JavaScript. To them, your portfolio is empty.",
    currentImplementation: "useEffect(() => fetch('/api/projects')…) in the page component.",
    recommendedImplementation: "Fetch project data in the server component (or at build time) so the HTML contains the projects.",
    affectedPages: ["/work", "/work/*"],
  },
  {
    title: "Inconsistent brand naming",
    category: "ENTITY",
    severity: "MEDIUM",
    impactScore: 6.6,
    status: "FIXED",
    description: "The site alternates between “Acme”, “Acme Studio” and “ACME Digital” across pages, footer and metadata.",
    whyItMatters: "Engines reconcile entities by name. Three names look like three small companies rather than one credible one.",
    currentImplementation: "Footer: “ACME Digital”. Title tags: “Acme Studio”. Body copy: “Acme”.",
    recommendedImplementation: "Standardise on “Acme” everywhere; add the alternates as alternateName in Organization schema for a transition period.",
    affectedPages: ["/", "/about", "/contact"],
  },
  {
    title: "Missing author and expertise signals on guides",
    category: "AUTHORITY",
    severity: "LOW",
    impactScore: 4.8,
    status: "OPEN",
    description: "Guides are published without an author, date or credentials.",
    whyItMatters: "Attribution helps engines decide how much to trust a page. Anonymous guides are cited less.",
    currentImplementation: "Posts show a title and body only.",
    recommendedImplementation: "Add author byline with role, publish/update dates, and Person schema linked from the Organization.",
    affectedPages: ["/guides/*"],
  },
  {
    title: "No AI crawler policy",
    category: "TECHNICAL",
    severity: "LOW",
    impactScore: 4.2,
    status: "OPEN",
    description: "robots.txt does not address GPTBot, PerplexityBot, Google-Extended or ClaudeBot, and there is no llms.txt.",
    whyItMatters: "Explicitly allowing AI crawlers and pointing them to your key pages removes doubt about whether your content may be used.",
    currentImplementation: "robots.txt: User-agent: * / Allow: /",
    recommendedImplementation: "Add explicit Allow rules for the major AI crawlers and publish /llms.txt summarising the business and linking the pages you want cited.",
    affectedPages: ["/robots.txt", "/llms.txt"],
  },
];

export interface OptimizationSeed {
  title: string;
  description: string;
  type: string;
  status: string;
  impactScore: number;
  effort: string;
  issueTitle?: string;
}

export const ACME_OPTIMIZATIONS: OptimizationSeed[] = [
  {
    title: "Improve homepage entity definition",
    description: "Rewrite the hero and the first section to state clearly what Acme is, who it serves and where.",
    type: "ENTITY",
    status: "APPROVED",
    impactScore: 9.4,
    effort: "LOW",
    issueTitle: "Weak entity definition",
  },
  {
    title: "Add Organization schema",
    description: "Ship Organization JSON-LD with logo, sameAs and areaServed on every page.",
    type: "SCHEMA",
    status: "COMPLETED",
    impactScore: 8.2,
    effort: "LOW",
    issueTitle: "No Organization schema",
  },
  {
    title: "Add Service schema",
    description: "Add a reusable <ServiceSchema /> component and render it on all five service pages.",
    type: "SCHEMA",
    status: "IN_PROGRESS",
    impactScore: 7.6,
    effort: "MEDIUM",
    issueTitle: "Service pages lack Service schema",
  },
  {
    title: "Improve FAQ structure",
    description: "Server-render FAQs and add FAQPage schema on /services and /pricing.",
    type: "SCHEMA",
    status: "SUGGESTED",
    impactScore: 6.8,
    effort: "LOW",
    issueTitle: "FAQ content is not structured",
  },
  {
    title: "Improve internal linking",
    description: "Cross-link services and case studies with descriptive anchors.",
    type: "INTERNAL_LINKS",
    status: "SUGGESTED",
    impactScore: 6.1,
    effort: "MEDIUM",
    issueTitle: "Thin internal linking between services and case studies",
  },
  {
    title: "Create comparison content",
    description: "Publish “Shopify vs custom ecommerce for fashion brands” and “Northwind Digital vs Acme”.",
    type: "CONTENT",
    status: "SUGGESTED",
    impactScore: 8.7,
    effort: "HIGH",
    issueTitle: "Missing comparison content",
  },
  {
    title: "Add outcome metrics to case studies",
    description: "Add a results block with before/after metrics to the four fashion case studies.",
    type: "CONTENT",
    status: "SUGGESTED",
    impactScore: 6.5,
    effort: "MEDIUM",
    issueTitle: "Case studies lack outcome data",
  },
  {
    title: "Standardise brand name",
    description: "Replace “Acme Studio” and “ACME Digital” with “Acme” across templates and metadata.",
    type: "ENTITY",
    status: "COMPLETED",
    impactScore: 6.6,
    effort: "LOW",
    issueTitle: "Inconsistent brand naming",
  },
];

export interface CodeChangeSeed {
  number: number;
  title: string;
  summary: string;
  status: string;
  branch: string;
  prUrl?: string;
  instructions: string;
  optimizationTitle: string;
  files: { path: string; language: string; diff: string }[];
}

export const ACME_CODE_CHANGES: CodeChangeSeed[] = [
  {
    number: 101,
    title: "Add Organization schema",
    summary: "Adds a reusable OrganizationSchema component and renders it from the root layout.",
    status: "MERGED",
    branch: "aeo/organization-schema",
    prUrl: "https://github.com/acme/acme-website/pull/212",
    instructions:
      "Add Organization JSON-LD to every page. Include name, url, logo, sameAs (LinkedIn, Shopify Partners) and areaServed (US, GB, IN). Render from app/layout.tsx.",
    optimizationTitle: "Add Organization schema",
    files: [
      {
        path: "components/OrganizationSchema.tsx",
        language: "tsx",
        diff: `@@ -0,0 +1,24 @@
+export function OrganizationSchema() {
+  const data = {
+    "@context": "https://schema.org",
+    "@type": "Organization",
+    name: "Acme",
+    url: "https://acme.com",
+    logo: "https://acme.com/logo.png",
+    sameAs: [
+      "https://www.linkedin.com/company/acme",
+      "https://www.shopify.com/partners/acme",
+    ],
+    areaServed: ["US", "GB", "IN"],
+    description:
+      "Shopify agency that designs, builds and scales ecommerce stores for fashion and lifestyle brands.",
+  };
+
+  return (
+    <script
+      type="application/ld+json"
+      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
+    />
+  );
+}
+`,
      },
      {
        path: "app/layout.tsx",
        language: "tsx",
        diff: `@@ -1,4 +1,5 @@
 import "./globals.css";
+import { OrganizationSchema } from "@/components/OrganizationSchema";

 export const metadata = {
   title: "Acme",
@@ -10,6 +11,7 @@ export default function RootLayout({ children }) {
   return (
     <html lang="en">
       <body>
+        <OrganizationSchema />
         {children}
       </body>
     </html>`,
      },
    ],
  },
  {
    number: 102,
    title: "Standardise brand name",
    summary: "Replaces “Acme Studio” and “ACME Digital” with “Acme” in templates and metadata.",
    status: "MERGED",
    branch: "aeo/brand-name",
    prUrl: "https://github.com/acme/acme-website/pull/214",
    instructions: "Use the single brand name “Acme” in all titles, footer copy and metadata.",
    optimizationTitle: "Standardise brand name",
    files: [
      {
        path: "components/Footer.tsx",
        language: "tsx",
        diff: `@@ -22,7 +22,7 @@ export function Footer() {
       <div className="footer-bottom">
-        <p>© 2026 ACME Digital. All rights reserved.</p>
+        <p>© 2026 Acme. All rights reserved.</p>
       </div>`,
      },
      {
        path: "app/layout.tsx",
        language: "tsx",
        diff: `@@ -4,7 +4,7 @@ import { OrganizationSchema } from "@/components/OrganizationSchema";
 export const metadata = {
-  title: "Acme Studio",
+  title: { default: "Acme", template: "%s · Acme" },
   description: "Welcome to our website.",
 };`,
      },
    ],
  },
  {
    number: 103,
    title: "Add Service schema to service pages",
    summary: "Introduces <ServiceSchema /> and renders it on all five service routes.",
    status: "AWAITING_REVIEW",
    branch: "aeo/service-schema",
    instructions:
      "Create a ServiceSchema component that accepts name, description, serviceType and areaServed. Render it on each page under app/services/*.",
    optimizationTitle: "Add Service schema",
    files: [
      {
        path: "components/ServiceSchema.tsx",
        language: "tsx",
        diff: `@@ -0,0 +1,26 @@
+interface ServiceSchemaProps {
+  name: string;
+  description: string;
+  serviceType: string;
+  areaServed?: string[];
+}
+
+export function ServiceSchema({ name, description, serviceType, areaServed = ["US", "GB", "IN"] }: ServiceSchemaProps) {
+  const data = {
+    "@context": "https://schema.org",
+    "@type": "Service",
+    name,
+    description,
+    serviceType,
+    areaServed,
+    provider: { "@type": "Organization", name: "Acme", url: "https://acme.com" },
+  };
+
+  return (
+    <script
+      type="application/ld+json"
+      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
+    />
+  );
+}
+`,
      },
      {
        path: "app/services/shopify-development/page.tsx",
        language: "tsx",
        diff: `@@ -1,8 +1,15 @@
+import { ServiceSchema } from "@/components/ServiceSchema";
 import { ServiceHero } from "@/components/ServiceHero";

 export default function ShopifyDevelopmentPage() {
   return (
     <>
+      <ServiceSchema
+        name="Shopify Development"
+        serviceType="Ecommerce development"
+        description="Custom Shopify and Shopify Plus store development for fashion and lifestyle brands."
+      />
       <ServiceHero title="Shopify Development" />`,
      },
    ],
  },
  {
    number: 104,
    title: "Improve homepage entity definition",
    summary: "Replaces the slogan hero with a plain-language definition of Acme, and updates the site description.",
    status: "AWAITING_REVIEW",
    branch: "aeo/homepage-entity",
    instructions:
      "Rewrite the homepage H1 and intro to say what Acme is (Shopify agency), who it serves (fashion & lifestyle brands) and where (US, UK, India). Update the metadata description to match. Keep the visual design unchanged.",
    optimizationTitle: "Improve homepage entity definition",
    files: [
      {
        path: "app/page.tsx",
        language: "tsx",
        diff: `@@ -8,10 +8,14 @@ export default function HomePage() {
     <main>
       <section className="hero">
-        <h1>We build beautiful things.</h1>
-        <p>Design. Development. Growth.</p>
+        <h1>Shopify agency for fashion &amp; lifestyle brands.</h1>
+        <p>
+          Acme designs, builds and scales Shopify and Shopify Plus stores for
+          apparel, footwear and accessories brands in the US, UK and India.
+        </p>
         <Link href="/contact">Start a project</Link>
       </section>`,
      },
      {
        path: "app/layout.tsx",
        language: "tsx",
        diff: `@@ -5,7 +5,8 @@ import { OrganizationSchema } from "@/components/OrganizationSchema";
 export const metadata = {
   title: { default: "Acme", template: "%s · Acme" },
-  description: "Welcome to our website.",
+  description:
+    "Acme is a Shopify agency that designs, builds and scales ecommerce stores for fashion and lifestyle brands.",
 };`,
      },
    ],
  },
  {
    number: 105,
    title: "Server-render FAQs with FAQPage schema",
    summary: "Moves FAQ content to the server and emits FAQPage JSON-LD.",
    status: "READY_FOR_CLAUDE",
    branch: "aeo/faq-schema",
    instructions:
      "On /services and /pricing, render the FAQ list server-side (no client fetch). Add FAQPage JSON-LD containing the same questions and answers. Keep the accordion interaction as a progressive enhancement.",
    optimizationTitle: "Improve FAQ structure",
    files: [],
  },
  {
    number: 106,
    title: "Cross-link services and case studies",
    summary: "Adds “Related work” and “Service used” blocks with descriptive anchors.",
    status: "DRAFT",
    branch: "aeo/internal-links",
    instructions:
      "Add a RelatedWork component to service pages that lists case studies tagged with that service, and a ServiceUsed link on each case study. Anchor text must describe the project, e.g. “Shopify redesign for Lumen”.",
    optimizationTitle: "Improve internal linking",
    files: [],
  },
];

export const ACME_CONTENT: {
  title: string;
  targetPrompt: string;
  potential: string;
  intent: string;
  contentType: string;
  status: string;
  estimatedLift: number;
  briefing: string;
}[] = [
  {
    title: "Best Shopify agencies for fashion brands",
    targetPrompt: "Best Shopify agencies for fashion brands",
    potential: "HIGH",
    intent: "COMMERCIAL",
    contentType: "COMPARISON",
    status: "PLANNED",
    estimatedLift: 12,
    briefing:
      "A ranked, honest comparison of 8–10 agencies (including Acme) for fashion brands. Comparison table on: Shopify Plus experience, fashion case studies, pricing model, locations. Include Acme's verdict and a clear “who it's for”.",
  },
  {
    title: "Shopify redesign checklist",
    targetPrompt: "Shopify redesign checklist",
    potential: "MEDIUM",
    intent: "INFORMATIONAL",
    contentType: "GUIDE",
    status: "IDEA",
    estimatedLift: 5,
    briefing: "A 25-point checklist across UX, performance, SEO/AEO, and launch. Downloadable, with FAQ schema.",
  },
  {
    title: "Shopify vs custom ecommerce",
    targetPrompt: "Shopify vs custom ecommerce build for a fashion brand",
    potential: "HIGH",
    intent: "INFORMATIONAL",
    contentType: "COMPARISON",
    status: "IDEA",
    estimatedLift: 9,
    briefing: "Cost, time-to-launch, flexibility and total cost of ownership over three years. Verdict by brand stage.",
  },
  {
    title: "Best ecommerce agencies",
    targetPrompt: "Best ecommerce agencies in India",
    potential: "MEDIUM",
    intent: "COMMERCIAL",
    contentType: "LISTICLE",
    status: "IDEA",
    estimatedLift: 6,
    briefing: "Region-aware list with India-specific strengths. Include Acme's India office and local clients.",
  },
  {
    title: "Shopify development cost",
    targetPrompt: "How much does a Shopify agency cost?",
    potential: "HIGH",
    intent: "INFORMATIONAL",
    contentType: "GUIDE",
    status: "IN_PROGRESS",
    estimatedLift: 10,
    briefing: "Typical ranges by project type (theme customisation, full build, Plus migration), factors that move price, and what's included. Starting-from figures for Acme.",
  },
  {
    title: "Best Shopify agencies for startups",
    targetPrompt: "Best Shopify agencies for startups",
    potential: "HIGH",
    intent: "COMMERCIAL",
    contentType: "COMPARISON",
    status: "IDEA",
    estimatedLift: 8,
    briefing: "Agencies with launch packages, fixed pricing and fast timelines. Position Acme's startup package.",
  },
  {
    title: "Northwind Digital vs Acme",
    targetPrompt: "Compare Northwind Digital vs Acme for Shopify",
    potential: "HIGH",
    intent: "COMMERCIAL",
    contentType: "COMPARISON",
    status: "IDEA",
    estimatedLift: 7,
    briefing: "Fair head-to-head: size, specialisation, pricing, process. Say plainly when Northwind is the better fit.",
  },
  {
    title: "How to choose a Shopify Plus agency",
    targetPrompt: "Shopify Plus agency for scaling fashion brands",
    potential: "MEDIUM",
    intent: "INFORMATIONAL",
    contentType: "GUIDE",
    status: "IDEA",
    estimatedLift: 5,
    briefing: "Evaluation criteria, questions to ask, red flags. Include a printable scorecard.",
  },
  {
    title: "Fashion ecommerce FAQ",
    targetPrompt: "Which Shopify agency should I hire for a DTC apparel brand?",
    potential: "MEDIUM",
    intent: "COMMERCIAL",
    contentType: "FAQ",
    status: "IDEA",
    estimatedLift: 4,
    briefing: "20 questions fashion founders ask before hiring an agency, answered directly. FAQPage schema.",
  },
  {
    title: "Lumen: +38% conversion after Shopify redesign",
    targetPrompt: "Best website redesign agencies",
    potential: "MEDIUM",
    intent: "COMMERCIAL",
    contentType: "CASE_STUDY",
    status: "PLANNED",
    estimatedLift: 6,
    briefing: "Rewrite the Lumen case study around outcomes: baseline, changes, results, timeframe, quote from the client.",
  },
];
