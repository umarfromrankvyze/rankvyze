/**
 * The corpus for the AEO benchmark study.
 *
 * Published in full and deliberately so: a statistic nobody can reproduce is
 * an assertion. Anyone can run `npx tsx --conditions react-server
 * scripts/aeo-study.mts` against this list and check our numbers.
 *
 * Selection bias, stated up front because it changes how the results should be
 * read: these are large, well-resourced, mostly well-known organisations —
 * the kind with in-house SEO teams and agency retainers. If anything the
 * findings are optimistic relative to a typical small business. Where this
 * corpus fails a check, the long tail fails it harder.
 *
 * Sectors mirror the industries we publish AEO guides for, so the per-sector
 * medians are comparable to the advice on those pages.
 */

export interface CorpusEntry {
  domain: string;
  sector: string;
}

export const CORPUS: CorpusEntry[] = [
  // SaaS
  { domain: "stripe.com", sector: "SaaS" },
  { domain: "notion.so", sector: "SaaS" },
  { domain: "figma.com", sector: "SaaS" },
  { domain: "linear.app", sector: "SaaS" },
  { domain: "vercel.com", sector: "SaaS" },
  { domain: "intercom.com", sector: "SaaS" },
  { domain: "asana.com", sector: "SaaS" },
  { domain: "airtable.com", sector: "SaaS" },

  // Agencies
  { domain: "ogilvy.com", sector: "Agencies" },
  { domain: "dentsu.com", sector: "Agencies" },
  { domain: "publicisgroupe.com", sector: "Agencies" },
  { domain: "wpp.com", sector: "Agencies" },
  { domain: "rga.com", sector: "Agencies" },

  // Law firms
  { domain: "linklaters.com", sector: "Law firms" },
  { domain: "freshfields.com", sector: "Law firms" },
  { domain: "dlapiper.com", sector: "Law firms" },
  { domain: "cliffordchance.com", sector: "Law firms" },
  { domain: "hoganlovells.com", sector: "Law firms" },

  // Ecommerce
  { domain: "allbirds.com", sector: "Ecommerce" },
  { domain: "glossier.com", sector: "Ecommerce" },
  { domain: "warbyparker.com", sector: "Ecommerce" },
  { domain: "gymshark.com", sector: "Ecommerce" },
  { domain: "everlane.com", sector: "Ecommerce" },
  { domain: "casper.com", sector: "Ecommerce" },

  // Healthcare
  { domain: "mayoclinic.org", sector: "Healthcare" },
  { domain: "clevelandclinic.org", sector: "Healthcare" },
  { domain: "hopkinsmedicine.org", sector: "Healthcare" },
  { domain: "teladoc.com", sector: "Healthcare" },
  { domain: "onemedical.com", sector: "Healthcare" },

  // Accounting
  { domain: "pwc.com", sector: "Accounting" },
  { domain: "deloitte.com", sector: "Accounting" },
  { domain: "kpmg.com", sector: "Accounting" },
  { domain: "ey.com", sector: "Accounting" },
  { domain: "bdo.com", sector: "Accounting" },
  { domain: "grantthornton.com", sector: "Accounting" },

  // Real estate
  { domain: "zillow.com", sector: "Real estate" },
  { domain: "redfin.com", sector: "Real estate" },
  { domain: "compass.com", sector: "Real estate" },
  { domain: "savills.com", sector: "Real estate" },
  { domain: "knightfrank.com", sector: "Real estate" },

  // Home services
  { domain: "angi.com", sector: "Home services" },
  { domain: "thumbtack.com", sector: "Home services" },
  { domain: "houzz.com", sector: "Home services" },
  { domain: "checkatrade.com", sector: "Home services" },

  // Recruitment
  { domain: "indeed.com", sector: "Recruitment" },
  { domain: "roberthalf.com", sector: "Recruitment" },
  { domain: "hays.com", sector: "Recruitment" },
  { domain: "michaelpage.com", sector: "Recruitment" },
  { domain: "kornferry.com", sector: "Recruitment" },

  // Financial services
  { domain: "revolut.com", sector: "Financial services" },
  { domain: "monzo.com", sector: "Financial services" },
  { domain: "wise.com", sector: "Financial services" },
  { domain: "schwab.com", sector: "Financial services" },
  { domain: "fidelity.com", sector: "Financial services" },

  // Education
  { domain: "coursera.org", sector: "Education" },
  { domain: "udemy.com", sector: "Education" },
  { domain: "khanacademy.org", sector: "Education" },
  { domain: "edx.org", sector: "Education" },
  { domain: "duolingo.com", sector: "Education" },
  { domain: "masterclass.com", sector: "Education" },

  // B2B services
  { domain: "salesforce.com", sector: "B2B services" },
  { domain: "zendesk.com", sector: "B2B services" },
  { domain: "docusign.com", sector: "B2B services" },
  { domain: "workday.com", sector: "B2B services" },
  { domain: "servicenow.com", sector: "B2B services" },

  // Hospitality
  { domain: "marriott.com", sector: "Hospitality" },
  { domain: "hilton.com", sector: "Hospitality" },
  { domain: "hyatt.com", sector: "Hospitality" },
  { domain: "ihg.com", sector: "Hospitality" },
  { domain: "airbnb.com", sector: "Hospitality" },

  // Manufacturing
  { domain: "siemens.com", sector: "Manufacturing" },
  { domain: "caterpillar.com", sector: "Manufacturing" },
  { domain: "honeywell.com", sector: "Manufacturing" },
  { domain: "3m.com", sector: "Manufacturing" },
  { domain: "bosch.com", sector: "Manufacturing" },
];
