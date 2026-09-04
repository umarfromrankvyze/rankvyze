import type { DeliveryMode, IntegrationProvider, PlatformKey } from "@/lib/enums";

/**
 * How a fix physically reaches a customer's site, per platform.
 *
 * The temptation here is to write "connect your site and we'll handle it" for
 * every platform and sort it out later. That would be a lie on four of the
 * eight: Framer, Wix and Squarespace have no public write API for site content
 * at all, and Webflow's is real but narrower than people assume. So each
 * platform below lists only routes that actually exist, says plainly what each
 * one cannot do, and names the credential or invite it needs.
 *
 * `limits` is the important field. It is the thing a customer would otherwise
 * discover three weeks into a 45-day guarantee.
 */

export interface DeliveryRoute {
  provider: IntegrationProvider;
  mode: DeliveryMode;
  title: string;
  /** One line for the option card. */
  summary: string;
  /** Ranked: the first available route is the one we recommend. */
  recommended?: boolean;
  /** Exactly what the customer has to give us, in their words not ours. */
  weNeed: string[];
  /** What happens after they give it. */
  howItWorks: string[];
  /** What this route genuinely cannot do. Never empty for a reason. */
  limits: string[];
  /** Typical time from approved change to live, once access exists. */
  turnaround: string;
}

export interface PlatformPlaybook {
  key: PlatformKey;
  name: string;
  /** Shown when detection picks this platform. */
  blurb: string;
  /** What we can change on this platform at all, whichever route is used. */
  weCanChange: string[];
  /** Platform-level ceilings that no route gets around. */
  hardLimits: string[];
  routes: DeliveryRoute[];
}

const GUIDED_ROUTE = (platformName: string, where: string): DeliveryRoute => ({
  provider: "GUIDED",
  mode: "GUIDED",
  title: "Guided change pack",
  summary: "Fallback: we write the exact change, you paste it in. No access needed.",
  weNeed: ["Nothing. You keep full control of your site."],
  howItWorks: [
    `We produce the exact code and copy for each fix, with the ${where} it belongs in ${platformName}.`,
    "You apply it — usually a paste, occasionally a field edit — and mark the change as applied.",
    "We re-fetch the live page and verify the signal is actually there. If it isn't, we tell you what's still missing.",
  ],
  limits: [
    "This is the one route that needs work from you on every single fix. If you'd rather not do that, use the route above.",
    "Nothing lands until you apply it, so the clock depends on your turnaround.",
    "We can verify the result but we cannot fix a mis-paste for you.",
  ],
  turnaround: "Same day once you apply it",
});

const EDITOR_ROUTE = (
  provider: IntegrationProvider,
  platformName: string,
  roleName: string,
  steps: string[],
  limits: string[],
  recommended = false,
): DeliveryRoute => ({
  recommended,
  // Named after the platform rather than filed under GUIDED, so an admin
  // reading "Wix · we implement in your editor" knows which login to go find.
  provider,
  mode: "EDITOR",
  title: `Invite us to your ${platformName} project`,
  summary: `You add us as a ${roleName}. We make the changes in your editor.`,
  weNeed: [`A ${roleName} invite to implementation@rankvyze.com on the ${platformName} project for this site.`],
  howItWorks: [
    ...steps,
    "Every change is listed in your dashboard before we make it, and you can revoke the invite at any time.",
    "After publishing we re-fetch the live page and verify the signal is present.",
  ],
  limits,
  turnaround: "1–2 business days per batch",
});

export const PLATFORM_PLAYBOOKS: PlatformPlaybook[] = [
  {
    key: "CODE",
    name: "A code repository",
    blurb:
      "Your site is built from source you control — the best case for this work, because a fix can arrive as a pull request you review like any other.",
    weCanChange: [
      "Anything in the repository: markup, metadata, structured data, routing, new pages",
      "robots.txt, sitemaps, llms.txt and any other static file",
      "Server-rendered content, which is what answer engines actually read",
    ],
    hardLimits: ["Nothing merges without your review and your deploy."],
    routes: [
      {
        provider: "GITHUB",
        mode: "API",
        title: "GitHub pull requests",
        summary: "We open PRs against a branch. You review and merge.",
        recommended: true,
        weNeed: [
          "A GitHub collaborator invite with write access, or a fine-grained token scoped to this one repository (Contents: read & write, Pull requests: read & write).",
          "The branch we should target — usually main.",
        ],
        howItWorks: [
          "Each approved fix becomes one branch and one pull request, scoped to a single change.",
          "The PR description explains what the change does and which AEO issue it closes.",
          "You review and merge on your own schedule; your CI runs as normal.",
          "After your deploy we re-fetch the live URL and verify the signal is present.",
        ],
        limits: [
          "We never merge and never push to your default branch directly.",
          "If your deploy is manual, the fix isn't live until you run it.",
        ],
        turnaround: "PR within 1–2 business days of approval",
      },
      {
        provider: "UPLOAD",
        mode: "GUIDED",
        title: "Send us the source",
        summary: "Upload a zip. We send back a patch.",
        weNeed: ["A zip of the site source, or a link to it.", "No credentials of any kind."],
        howItWorks: [
          "We work against the copy you send and return a unified diff plus the changed files.",
          "You apply the patch and deploy.",
          "We verify against the live URL afterwards.",
        ],
        limits: [
          "A patch can conflict if the repository moved on while we worked.",
          "Slower than a PR, and no CI signal until you apply it.",
        ],
        turnaround: "2–3 business days",
      },
      GUIDED_ROUTE("your codebase", "file and line"),
    ],
  },
  {
    key: "WORDPRESS",
    name: "WordPress",
    blurb:
      "WordPress has a real write API, so this is one of the platforms where we can implement fixes directly rather than handing you instructions.",
    weCanChange: [
      "Page and post content, titles, headings and meta descriptions",
      "JSON-LD structured data, via your SEO plugin's fields or an injected block",
      "robots.txt, llms.txt and other static files",
      "New pages and posts written to close a content gap",
    ],
    hardLimits: [
      "Theme template edits need either file access or a child theme — we'll say which a given fix requires.",
      "Some page builders (Elementor, Divi, WPBakery) store content in their own format, which limits what the REST API can safely change.",
    ],
    routes: [
      {
        provider: "WORDPRESS",
        mode: "API",
        title: "WordPress Application Password",
        summary: "A revocable credential scoped to one user. We publish changes directly.",
        recommended: true,
        weNeed: [
          "A WordPress user for implementation@rankvyze.com with the Editor role (Administrator only if a fix needs plugin settings).",
          "An Application Password for that user — Users → Profile → Application Passwords. It is revocable and separate from your real password.",
          "Your SEO plugin name, if you use one (Yoast, Rank Math, SEOPress).",
        ],
        howItWorks: [
          "We connect over the WordPress REST API using the application password — your actual password is never involved.",
          "You approve each fix in your dashboard before we touch anything.",
          "We capture the current content, apply the change, and store the previous version. WordPress publishes edits immediately, so a change is live as soon as you approve it — and one click puts it back.",
          "We re-fetch the live URL and verify the signal is present.",
        ],
        limits: [
          "WordPress has no review-before-publish step for an already published page, so an approved change goes live at once. The rollback is one click, but it is a rollback, not a preview.",
          "Application passwords are disabled on some managed hosts. If yours blocks them, we use an editor login instead.",
          "Content locked inside a page builder's own storage may need you to edit it in that builder.",
        ],
        turnaround: "Same day once approved",
      },
      EDITOR_ROUTE(
        "WORDPRESS",
        "WordPress",
        "Editor user",
        [
          "We sign in to wp-admin and make each approved change in the normal editor.",
          "WordPress revisions record everything we touch.",
        ],
        [
          "Requires an ordinary login, so use a dedicated account you can delete afterwards.",
          "Slower than the API route for bulk changes.",
        ],
      ),
      GUIDED_ROUTE("WordPress", "screen and field"),
    ],
  },
  {
    key: "SHOPIFY",
    name: "Shopify",
    blurb:
      "Shopify's Admin API gives real write access to theme files and metafields, so most AEO fixes can be implemented directly.",
    weCanChange: [
      "Theme Liquid templates, including the head where structured data belongs",
      "Product, collection and page copy, titles and descriptions",
      "Metafields, and robots.txt via robots.txt.liquid",
      "New pages and blog articles",
    ],
    hardLimits: [
      "Checkout is locked on non-Plus plans and is not something we would touch anyway.",
      "Apps that inject their own schema can conflict with ours; we audit for that first.",
    ],
    routes: [
      {
        provider: "SHOPIFY",
        mode: "API",
        title: "Shopify custom app token",
        summary: "A scoped Admin API token. We edit a duplicated theme, you publish.",
        recommended: true,
        weNeed: [
          "A custom app created in your admin (Settings → Apps → Develop apps) with Admin API scopes: read/write themes, content, products.",
          "The Admin API access token it generates.",
        ],
        howItWorks: [
          "We duplicate your live theme and make every change on the copy, so your storefront is untouched while we work.",
          "You preview the duplicated theme from your admin and compare it side by side with live.",
          "You publish it when you're satisfied. We never publish a theme ourselves.",
          "We verify the live storefront after you publish.",
        ],
        limits: [
          "Theme duplication counts against your theme limit while the work is in progress.",
          "Changes made to the live theme by you or an app during that window need re-merging.",
        ],
        turnaround: "1–2 business days per batch",
      },
      EDITOR_ROUTE(
        "SHOPIFY",
        "Shopify",
        "staff account",
        [
          "We work in the theme editor and admin with a staff account limited to themes and content.",
          "You keep publishing rights.",
        ],
        ["Staff accounts are limited on the Basic plan.", "Slower than the API route for bulk changes."],
      ),
      GUIDED_ROUTE("Shopify", "template and section"),
    ],
  },
  {
    key: "WEBFLOW",
    name: "Webflow",
    blurb:
      "Webflow has a real API, but a narrower one than people expect: it covers page SEO fields, CMS items and custom code injection — not the visual layout, which lives in the Designer.",
    weCanChange: [
      "Page titles, meta descriptions and Open Graph fields, via the Pages API",
      "CMS collection items, including new entries for content gaps",
      "Site-wide and page-level custom code, which is where JSON-LD goes",
      "robots.txt, from Site Settings",
    ],
    hardLimits: [
      "Visual structure — sections, headings, layout — can only be changed in the Designer, so structural fixes need editor access or your designer.",
      "Custom code injection requires a paid Site plan. On a free plan only the guided route works.",
      "Webflow does not serve arbitrary static files, so llms.txt is not available without a proxy in front of the site.",
    ],
    routes: [
      {
        provider: "WEBFLOW",
        mode: "API",
        title: "Webflow API token",
        summary: "We update SEO fields, CMS items and custom code directly.",
        recommended: true,
        weNeed: [
          "A Webflow site API token (Site settings → Apps & integrations → API access) with pages, CMS and custom code permissions.",
          "Confirmation that the site is on a paid Site plan, if you want structured data injected site-wide.",
        ],
        howItWorks: [
          "We write changes to your staging site first, never straight to the published domain.",
          "You review the staging URL and approve in your dashboard.",
          "You publish from Webflow — publishing stays yours.",
          "We verify the published domain afterwards.",
        ],
        limits: [
          "No layout or structural edits: those are Designer-only.",
          "Custom code changes need a paid Site plan.",
          "Publishing is always your action, so nothing goes live without you.",
        ],
        turnaround: "Same day once approved",
      },
      EDITOR_ROUTE(
        "WEBFLOW",
        "Webflow",
        "Workspace member",
        [
          "We make changes in the Designer, including the structural ones the API cannot reach.",
          "Everything happens on staging until you publish.",
        ],
        ["Webflow workspace seats are billed per member on some plans.", "Designer access is broad — use a dedicated seat you can remove."],
      ),
      GUIDED_ROUTE("Webflow", "panel and field"),
    ],
  },
  {
    key: "FRAMER",
    name: "Framer",
    blurb:
      "Framer has no public write API for site content, so we are honest about the two routes that do work: you invite us into the project, or we hand you an exact change pack.",
    weCanChange: [
      "Page SEO titles and descriptions, per page",
      "JSON-LD and other head markup, via Site Settings → Custom Code",
      "Body copy, headings and new pages",
      "CMS collection entries",
      "robots.txt, from Site Settings",
    ],
    hardLimits: [
      "There is no Framer write API, so nothing here can be automated end to end. Any vendor claiming otherwise is describing something else.",
      "Framer does not serve arbitrary static files, so llms.txt cannot be hosted on a Framer site without putting a proxy in front of it.",
      "Custom code requires a paid Framer site plan.",
    ],
    routes: [
      EDITOR_ROUTE(
        "FRAMER",
        "Framer",
        "project Editor",
        [
          "We open the project, apply each approved change, and leave it unpublished.",
          "You review in Framer's preview and hit Publish yourself.",
        ],
        [
          "Framer has no per-change permission model, so an Editor invite gives broad project access. Use a duplicate project first if that concerns you.",
          "Publishing stays with you, so live timing is yours.",
        ],
        true,
      ),
      GUIDED_ROUTE("Framer", "panel and field"),
    ],
  },
  {
    key: "WIX",
    name: "Wix",
    blurb:
      "Wix's public APIs cover stores and bookings rather than general site content, so implementation happens either in your editor with a contributor invite, or as a change pack you apply.",
    weCanChange: [
      "Page SEO titles, descriptions and slugs, via the SEO panel",
      "JSON-LD, via Settings → Custom Code, and Wix's own structured data fields",
      "Page copy, headings and new pages",
      "robots.txt, from the Wix SEO tools",
    ],
    hardLimits: [
      "No general-purpose content write API, so nothing is automated end to end.",
      "Custom code injection requires a Premium plan.",
      "Wix does not serve arbitrary static files, so llms.txt is unavailable without a proxy.",
    ],
    routes: [
      EDITOR_ROUTE(
        "WIX",
        "Wix",
        "site Contributor",
        [
          "You invite us as a Contributor with the Website Manager role — the narrowest role that can edit pages and SEO settings.",
          "We make the approved changes and leave them for you to publish.",
        ],
        [
          "Contributor roles on Wix are coarse; Website Manager is the tightest fit but still broad.",
          "Publishing stays with you.",
        ],
        true,
      ),
      GUIDED_ROUTE("Wix", "panel and field"),
    ],
  },
  {
    key: "SQUARESPACE",
    name: "Squarespace",
    blurb:
      "Squarespace's APIs are commerce-only, so implementation is a contributor invite or a change pack — plus Code Injection, which covers most structured data work.",
    weCanChange: [
      "Page titles, descriptions and URL slugs",
      "JSON-LD, via Settings → Advanced → Code Injection and per-page code injection",
      "Page copy, headings and new pages",
    ],
    hardLimits: [
      "No content write API.",
      "Code Injection requires a Business plan or above.",
      "No arbitrary static files, so llms.txt is unavailable without a proxy.",
    ],
    routes: [
      EDITOR_ROUTE(
        "SQUARESPACE",
        "Squarespace",
        "Website Editor contributor",
        [
          "You invite us with the Website Editor permission, which can edit pages but not billing or domains.",
          "We apply the approved changes; you publish.",
        ],
        ["Contributor permissions do not cover Code Injection on every plan — Administrator does.", "Publishing stays with you."],
        true,
      ),
      GUIDED_ROUTE("Squarespace", "panel and field"),
    ],
  },
  {
    key: "WEBSITE_BUILDER_OTHER",
    name: "Another site builder",
    blurb:
      "We didn't recognise the builder, which usually means a smaller platform. The work is the same; the delivery route is the one that fits what your builder allows.",
    weCanChange: [
      "Whatever your builder exposes — at minimum page titles, descriptions and copy",
      "Structured data, if the builder allows head or body code injection",
    ],
    hardLimits: [
      "We confirm what's possible before your sprint starts, and tell you plainly if something can't be done on your platform.",
    ],
    routes: [
      EDITOR_ROUTE(
        "GUIDED",
        "your site builder",
        "editor-level collaborator",
        ["We apply each approved change in your builder's editor.", "You keep publishing rights."],
        ["Depends entirely on what your builder's permission model allows."],
        true,
      ),
      GUIDED_ROUTE("your site builder", "screen and field"),
    ],
  },
  {
    key: "OTHER",
    name: "Something else",
    blurb:
      "Tell us how your site is built and we'll confirm the delivery route before your sprint starts. If a fix genuinely can't be made on your setup, we say so rather than bill for it.",
    weCanChange: ["Confirmed with you during setup, before the sprint clock starts."],
    hardLimits: ["Unknown until we've looked. We will not guess in writing."],
    routes: [
      EDITOR_ROUTE(
        "GUIDED",
        "your site",
        "editor-level collaborator",
        ["We apply each approved change wherever your site is managed."],
        ["Depends on what your setup allows."],
        true,
      ),
      GUIDED_ROUTE("your site", "location"),
    ],
  },
];

export const PLATFORM_BY_KEY = new Map(PLATFORM_PLAYBOOKS.map((p) => [p.key, p]));

export function getPlaybook(key: PlatformKey): PlatformPlaybook {
  return PLATFORM_BY_KEY.get(key) ?? PLATFORM_BY_KEY.get("OTHER")!;
}

export function platformName(key: string): string {
  return PLATFORM_BY_KEY.get(key as PlatformKey)?.name ?? "Something else";
}

/**
 * The route we open on. Pre-selecting it means the connect form is visible
 * without a click, which matters: the recommended route is the one that needs
 * no work from the customer per fix, and burying it behind an extra
 * interaction nudges people toward the one that does.
 */
export function recommendedRoute(platform: PlatformKey): DeliveryRoute | undefined {
  const routes = getPlaybook(platform).routes;
  return routes.find((r) => r.recommended) ?? routes[0];
}

/** Route lookup for a saved integration row. */
export function findRoute(platform: PlatformKey, provider: string, mode: string): DeliveryRoute | undefined {
  return getPlaybook(platform).routes.find((r) => r.provider === provider && r.mode === mode);
}

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  API: "We implement directly",
  EDITOR: "We implement in your editor",
  GUIDED: "You apply, we verify",
};
