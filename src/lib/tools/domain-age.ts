import "server-only";
import { ToolError, TIMEOUT_MS, USER_AGENT, normalizeUrl } from "./http";

/**
 * Domain age checker, over RDAP.
 *
 * RDAP is the IETF replacement for WHOIS (RFC 7482/9083). It is free, public,
 * returns structured JSON rather than free-text, and needs no key — which is
 * why this tool can exist honestly while a backlink or Domain Rating tool
 * cannot: those numbers only exist inside commercial indexes.
 *
 * rdap.org is the bootstrap resolver; it redirects to the authoritative
 * registry for the TLD. Some registries (notably several ccTLDs) publish no
 * RDAP at all, and this reports that rather than guessing an age.
 */

export interface DomainAgeReport {
  domain: string;
  registered: string | null;
  updated: string | null;
  expires: string | null;
  ageDays: number | null;
  ageLabel: string | null;
  registrar: string | null;
  statuses: string[];
  nameservers: string[];
  /** Set when the registry publishes no RDAP, so the UI can say why. */
  unsupported: boolean;
  source: string;
}

/** example.co.uk -> example.co.uk; www.blog.example.com -> example.com */
function registrableDomain(hostname: string) {
  const parts = hostname.toLowerCase().replace(/^www\./, "").split(".");
  if (parts.length <= 2) return parts.join(".");

  // Common two-label public suffixes. Not the full PSL — pulling that in for
  // one tool is not worth the weight, and a wrong guess here just means we
  // query one label too high and the registry tells us.
  const twoLabel = ["co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "org.au", "co.nz", "co.za", "co.jp", "co.in", "com.br", "com.mx", "com.sg"];
  const lastTwo = parts.slice(-2).join(".");
  if (twoLabel.includes(lastTwo)) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

function humanAge(from: Date, to = new Date()) {
  const days = Math.floor((to.getTime() - from.getTime()) / 86_400_000);
  if (days < 0) return null;
  const years = Math.floor(days / 365.25);
  const months = Math.floor((days - years * 365.25) / 30.44);
  if (years === 0 && months === 0) return `${days} day${days === 1 ? "" : "s"}`;
  if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
}

interface RdapEvent {
  eventAction?: string;
  eventDate?: string;
}

interface RdapEntity {
  roles?: string[];
  vcardArray?: unknown;
}

interface RdapResponse {
  events?: RdapEvent[];
  status?: string[];
  entities?: RdapEntity[];
  nameservers?: { ldhName?: string }[];
}

/** Registrar name out of the jCard blob, which is an awkward nested array. */
function registrarFrom(entities: RdapEntity[] | undefined) {
  for (const entity of entities ?? []) {
    if (!entity.roles?.includes("registrar")) continue;
    const vcard = entity.vcardArray;
    if (!Array.isArray(vcard) || vcard.length < 2 || !Array.isArray(vcard[1])) continue;
    for (const field of vcard[1] as unknown[]) {
      if (Array.isArray(field) && field[0] === "fn" && typeof field[3] === "string") return field[3];
    }
  }
  return null;
}

export async function checkDomainAge(rawInput: string): Promise<DomainAgeReport> {
  // Accept a bare domain or a full URL.
  const url = normalizeUrl(rawInput);
  const domain = registrableDomain(url.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let data: RdapResponse;
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: { accept: "application/rdap+json, application/json", "user-agent": USER_AGENT },
    });

    if (res.status === 404) {
      throw new ToolError(`No registration record found for ${domain}. It may be unregistered, or its registry may not publish RDAP.`);
    }
    if (res.status === 501 || res.status === 400) {
      return {
        domain,
        registered: null,
        updated: null,
        expires: null,
        ageDays: null,
        ageLabel: null,
        registrar: null,
        statuses: [],
        nameservers: [],
        unsupported: true,
        source: "rdap.org",
      };
    }
    if (!res.ok) throw new ToolError(`The registry returned HTTP ${res.status} for ${domain}. Try again in a moment.`);

    data = (await res.json()) as RdapResponse;
  } catch (error) {
    if (error instanceof ToolError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ToolError("The registry took too long to respond. Try again in a moment.");
    }
    throw new ToolError(`Couldn't look up ${domain}. The registry may not publish RDAP.`);
  } finally {
    clearTimeout(timer);
  }

  const eventDate = (action: string) =>
    data.events?.find((e) => e.eventAction?.toLowerCase() === action)?.eventDate ?? null;

  const registered = eventDate("registration");
  const registeredAt = registered ? new Date(registered) : null;
  const valid = registeredAt && !Number.isNaN(registeredAt.getTime());

  return {
    domain,
    registered,
    updated: eventDate("last changed") ?? eventDate("last update of rdap database"),
    expires: eventDate("expiration"),
    ageDays: valid ? Math.floor((Date.now() - registeredAt.getTime()) / 86_400_000) : null,
    ageLabel: valid ? humanAge(registeredAt) : null,
    registrar: registrarFrom(data.entities),
    statuses: data.status ?? [],
    nameservers: (data.nameservers ?? []).map((n) => n.ldhName ?? "").filter(Boolean),
    unsupported: false,
    source: "rdap.org",
  };
}
