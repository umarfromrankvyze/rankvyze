import { CONTENT_UPDATED, SITE, SITE_URL } from "@/lib/site";
import { stripInline } from "@/components/blog/rich-text";
import { ENTITY } from "@/content/entity-profile";
import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_CENTS } from "@/lib/guarantee";

/**
 * Structured data.
 *
 * Everything here restates something a human can already read on the page —
 * no invented ratings, review counts or awards. Schema that outruns the visible
 * content is the fastest way to get the whole block discounted.
 *
 * Nodes are @id-linked so crawlers resolve one organization across the site
 * rather than inferring a new entity per page.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/#founder`;

function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Content is authored above, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization + WebSite. Rendered once, in the marketing layout. */
export function SiteJsonLd() {
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    logo: { "@type": "ImageObject", url: SITE.logo, width: 512, height: 512 },
    image: SITE.logo,
    // Both are facts an engine uses to place the entity: when it started
    // existing, and where it will actually take customers.
    foundingDate: SITE.foundingDate,
    areaServed: SITE.areaServed,
    // Topics with real published coverage behind them. This is the one entity
    // signal that doesn't depend on a third party existing, so it is worth
    // getting right while the sameAs profiles are still being created.
    knowsAbout: ENTITY.knowsAbout,
    // A named, checkable founder. Linked by @id rather than inlined so the
    // person resolves as one entity across every page that mentions them.
    founder: { "@id": FOUNDER_ID },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: "English",
    },
  };
  // Only assert profiles that actually exist.
  if (SITE.sameAs.length > 0) organization.sameAs = SITE.sameAs;

  const website = {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.shortDescription,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };

  const founder = {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: SITE.founder.name,
    jobTitle: SITE.founder.jobTitle,
    url: `${SITE_URL}/about`,
    worksFor: { "@id": ORG_ID },
  };

  // The founder's other company, so the two entities resolve as connected
  // rather than as a coincidence of names. Only the relationship is asserted —
  // nothing is claimed about that business beyond who founded it.
  const alsoFounded = {
    "@type": "Organization",
    "@id": `${SITE.founder.alsoFounded.url}/#organization`,
    name: SITE.founder.alsoFounded.name,
    url: SITE.founder.alsoFounded.url,
    founder: { "@id": FOUNDER_ID },
  };

  return (
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [organization, website, founder, alsoFounded] }} />
  );
}

/**
 * Per-page WebPage node. `dateModified` is the freshness signal crawlers look
 * for; it tracks real content revisions, not deploy time.
 */
export function PageJsonLd({
  path,
  name,
  description,
  updated,
}: {
  path: string;
  name: string;
  description?: string;
  updated?: string;
}) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name,
        ...(description ? { description } : {}),
        isPartOf: { "@id": SITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en",
        dateModified: updated ?? CONTENT_UPDATED,
      }}
    />
  );
}

/** The thing actually being sold, with its real price and guarantee. */
export function ServiceJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${SITE_URL}/#service`,
        name: "AI Visibility Sprint",
        serviceType: "Answer Engine Optimization",
        provider: { "@id": ORG_ID },
        areaServed: "Worldwide",
        description: `A ${GUARANTEE_DAYS}-day engagement covering AI visibility research across ChatGPT, Perplexity, Gemini and Claude, a full AEO audit, and implementation of the fixes. Refunded in full if the business is not mentioned on at least ${GUARANTEE_MIN_ENGINES} engines within ${GUARANTEE_DAYS} days.`,
        offers: {
          "@type": "Offer",
          price: (PRICE_CENTS / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
          category: "OneTimePayment",
        },
      }}
    />
  );
}

/** FAQPage. Questions and answers must match what's rendered on the page. */
export function FaqJsonLd({ path, items }: { path: string; items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${SITE_URL}${path}#faq`,
        isPartOf: { "@id": SITE_ID },
        // Answers are authored with the same inline syntax as body copy, so the
        // markup has to be stripped here. An engine that lifts an answer
        // verbatim would otherwise quote "[the checker](/tools/x)" at a reader,
        // which is worse than having published no FAQ markup at all.
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: stripInline(item.q),
          acceptedAnswer: { "@type": "Answer", text: stripInline(item.a) },
        })),
      }}
    />
  );
}

/**
 * Article node for blog posts.
 *
 * Author and publisher are both the organization. We could invent a named
 * byline for E-E-A-T, but a fabricated person with fabricated credentials is
 * exactly the kind of unverifiable claim this markup is supposed to avoid.
 */
export function ArticleJsonLd({
  path,
  headline,
  description,
  published,
  modified,
  section,
  keywords,
}: {
  path: string;
  headline: string;
  description: string;
  published: string;
  modified?: string;
  section?: string;
  keywords?: string[];
}) {
  const url = `${SITE_URL}${path}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
        datePublished: published,
        dateModified: modified ?? published,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        // No `image` here: the generated OG card lives at a build-hashed URL we
        // can't name from this component, and a guessed URL that 404s is worse
        // than omitting an optional property. The og:image meta tag is correct.
        inLanguage: "en",
        ...(section ? { articleSection: section } : {}),
        ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
      }}
    />
  );
}

/** Breadcrumbs for the content pages, so crawlers see the hierarchy. */
/**
 * HowTo node for the engine guides.
 *
 * "How do I get ranked on ChatGPT" is a procedural query, and HowTo is the
 * schema type built for exactly that shape. Every step below is rendered on
 * the page — markup describing steps a visitor cannot see is a violation, not
 * a shortcut.
 */
export function HowToJsonLd({
  path,
  name,
  description,
  steps,
}: {
  path: string;
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        "@id": `${SITE_URL}${path}#howto`,
        name,
        description,
        isPartOf: { "@id": SITE_ID },
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${SITE_URL}${path}#step-${i + 1}`,
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}
