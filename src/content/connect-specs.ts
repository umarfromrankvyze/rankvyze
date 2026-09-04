/**
 * The shape of each API connect form.
 *
 * Client-safe on purpose: the browser needs to render these fields, and the
 * delivery clients in src/lib/delivery are `server-only` because they hold
 * outbound fetch logic. Defining the form here and spreading it into the
 * client keeps one definition rather than two that drift.
 *
 * Nothing secret lives in this file — only the labels describing what to paste.
 */

export interface ConnectField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  required: boolean;
}

export interface ConnectSpec {
  secretLabel: string;
  secretHint: string;
  /** Where the customer goes to create the credential. */
  whereToGet: string;
  fields: ConnectField[];
}

export const CONNECT_SPECS: Record<string, ConnectSpec> = {
  GITHUB: {
    secretLabel: "GitHub access token",
    secretHint:
      "A fine-grained token scoped to this one repository, with Contents: read & write and Pull requests: read & write. Not your password.",
    whereToGet: "github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens",
    fields: [
      { key: "repo", label: "Repository", placeholder: "acme/acme-website", hint: "Paste the URL or owner/name.", required: true },
      {
        key: "branch",
        label: "Base branch",
        placeholder: "main",
        hint: "Pull requests target this branch. We never push to it directly.",
        required: false,
      },
    ],
  },
  WORDPRESS: {
    secretLabel: "Application password",
    secretHint:
      "Revocable on its own and separate from the account password. Paste it exactly as WordPress shows it — spaces are fine.",
    whereToGet: "WordPress → Users → Profile → Application Passwords",
    fields: [
      {
        key: "baseUrl",
        label: "WordPress address",
        placeholder: "https://example.com",
        hint: "Where wp-admin lives, if it differs from your site URL.",
        required: true,
      },
      {
        key: "username",
        label: "Username",
        placeholder: "rankvyze",
        hint: "The user the application password belongs to.",
        required: true,
      },
    ],
  },
  SHOPIFY: {
    secretLabel: "Admin API access token",
    secretHint: "Starts with shpat_. Create a custom app with read/write themes and content, install it, then copy the token.",
    whereToGet: "Shopify admin → Settings → Apps and sales channels → Develop apps",
    fields: [
      {
        key: "shopDomain",
        label: "Store domain",
        placeholder: "acme.myshopify.com",
        hint: "The .myshopify.com address, not your custom domain.",
        required: true,
      },
      {
        key: "themeId",
        label: "Draft theme ID",
        placeholder: "Leave blank to pick automatically",
        hint: "We only ever write to an unpublished theme. Blank means we use the newest one that isn't live.",
        required: false,
      },
    ],
  },
  WEBFLOW: {
    secretLabel: "Webflow site API token",
    secretHint: "Generate a token with Pages and CMS permissions. Site tokens are scoped to the one site.",
    whereToGet: "Webflow → Site settings → Apps & integrations → API access",
    fields: [
      {
        key: "siteId",
        label: "Site ID",
        placeholder: "65f0a1b2c3d4e5f6a7b8c9d0",
        hint: "Site settings → General → the Site ID field.",
        required: true,
      },
    ],
  },
};

export function connectSpec(provider: string): ConnectSpec | undefined {
  return CONNECT_SPECS[provider];
}
