import { CONTENT_UPDATED, SITE, SITE_URL } from "@/lib/site";
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

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [organization, website] }} />;
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
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
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
