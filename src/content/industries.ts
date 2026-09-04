import { GUARANTEE_DAYS, GUARANTEE_MIN_ENGINES, PRICE_LABEL } from "@/lib/guarantee";

/**
 * Industry pages for /answer-engine-optimization/[industry].
 *
 * These exist because AEO genuinely differs by vertical — a law firm and a
 * SaaS company are judged by different engines, on different prompts, against
 * different schema types. If that weren't true these pages would be doorway
 * pages, and we would deserve the ranking we got for them.
 *
 * Rule for anything added here: every field must say something that is NOT
 * true of the other industries. If a sentence would survive a find-and-replace
 * of the industry name, delete it.
 */

export interface Industry {
  slug: string;
  /** Plural noun as it appears in a sentence: "for {name}" */
  name: string;
  /** Singular, for "a {singular}" */
  singular: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Two or three sentences. The specific commercial reality of this vertical. */
  intro: string;
  /** Real questions buyers in this vertical ask an assistant before choosing. */
  buyerPrompts: string[];
  /** Which engines matter most here, and why — not a generic ranking. */
  engineNote: string;
  primaryEngines: string[];
  /** Failure modes we actually see in this vertical. */
  failures: { title: string; body: string }[];
  /** schema.org types that carry weight for this vertical specifically. */
  schemaTypes: string[];
  /** What third-party corroboration looks like here. */
  proofSignals: string[];
  faq: { q: string; a: string }[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "saas",
    name: "SaaS companies",
    singular: "SaaS company",
    metaTitle: "Answer Engine Optimization for SaaS",
    metaDescription:
      "Get your SaaS recommended when buyers ask ChatGPT, Perplexity, Gemini and Claude for the best tool in your category. Comparison content, docs that render, and category clarity.",
    h1: "Answer engine optimization for SaaS.",
    intro:
      "Software buying starts with a category question, not a brand one. Someone asks for the best tool for a job, gets three names, and evaluates only those. Losing that shortlist is losing the deal before a trial ever starts — and unlike an ad, you cannot buy your way onto it.",
    buyerPrompts: [
      "best project management tool for small teams",
      "cheaper alternative to [incumbent]",
      "what's the best CRM for a B2B startup",
      "[competitor] vs [competitor] which is better",
      "best tool for [job to be done] with a free tier",
      "does [product] integrate with [platform]",
      "is [product] worth it for a 10 person team",
      "open source alternative to [product]",
    ],
    engineNote:
      "ChatGPT and Perplexity dominate software discovery because the buyers are already comfortable there and the questions are comparative rather than local. Perplexity in particular cites heavily, which makes it the fastest engine to move with good comparison content — a well-structured alternatives page can start being cited within weeks.",
    primaryEngines: ["chatgpt", "perplexity", "claude"],
    failures: [
      {
        title: "Documentation renders client-side",
        body: "Docs sites built on JS-heavy frameworks frequently ship an empty shell to crawlers that don't execute JavaScript. Your most substantive, most linkable content — the part that proves the product does what you say — is invisible to the engines you most want reading it.",
      },
      {
        title: "No honest comparison pages",
        body: "The highest-intent software queries are comparative. If you have no page comparing yourself to the incumbent, the engine will use one written by a competitor or an affiliate blog, and inherit its framing of you.",
      },
      {
        title: "Category described in invented language",
        body: "Positioning yourself as a new category is a marketing strategy that reads to a model as an unmappable entity. If nothing on the site says the ordinary category noun buyers actually type, you cannot be retrieved for it.",
      },
      {
        title: "Pricing hidden behind a demo request",
        body: "\"How much does X cost\" is one of the most asked commercial questions. A page with no number cannot answer it, so the engine answers from a review site's stale estimate or a competitor's comparison table.",
      },
    ],
    schemaTypes: ["SoftwareApplication", "Organization", "Offer", "FAQPage"],
    proofSignals: [
      "G2 and Capterra profiles with recent reviews",
      "Integration listings in partner marketplaces",
      "Changelog and status pages that show the product is alive",
      "Independent comparison posts that name you",
    ],
    faq: [
      {
        q: "Will AI recommend a SaaS product with no reviews?",
        a: "Rarely, for a category query. Engines lean on corroboration, and review platforms are the densest source of it in software. A handful of recent, specific reviews on one major platform moves more than a redesign.",
      },
      {
        q: "Should we write comparison pages against competitors?",
        a: "Yes, and honestly. Pages that concede where a competitor is the better fit get cited more, because they read as reference rather than marketing. A page claiming you win on every axis is discounted by both readers and models.",
      },
      {
        q: "Our docs are behind a login. Does that matter?",
        a: "It matters a great deal. Gated docs cannot be retrieved or cited, which removes your most credible technical content from consideration. Publishing even a subset publicly usually produces a measurable change.",
      },
    ],
  },
  {
    slug: "agencies",
    name: "agencies",
    singular: "agency",
    metaTitle: "Answer Engine Optimization for Agencies",
    metaDescription:
      "Get your agency named when clients ask AI who to hire. Specialisation depth, outcome-led case studies and directory corroboration — the three things that decide agency recommendations.",
    h1: "Answer engine optimization for agencies.",
    intro:
      "Agency selection is the purest recommendation question there is: a client describes their situation and asks who should do the work. There is no product to trial and no free tier — the shortlist is the entire funnel. Agencies also compete against directories and listicles that already own the query.",
    buyerPrompts: [
      "best Shopify agency for fashion brands",
      "who should I hire to redesign my website",
      "top B2B marketing agencies for SaaS",
      "best web development agency in [city]",
      "agency vs freelancer for [project type]",
      "how much does a branding agency cost",
      "best agencies for [platform] migration",
      "which agency specialises in [niche]",
    ],
    engineNote:
      "This vertical is unusually spread. ChatGPT and Claude answer the open \"who should I hire\" questions, while Gemini and AI Overviews pull in when the query carries a location. Because agencies are frequently asked about with a city attached, local signals matter more here than in other service businesses.",
    primaryEngines: ["chatgpt", "perplexity", "gemini", "claude"],
    failures: [
      {
        title: "Specialisation stated once, never demonstrated",
        body: "A single portfolio tag saying 'fashion' reads as a project category. Depth is what reads as expertise: a service page, a guide, several case studies and an FAQ all pointing at the same niche.",
      },
      {
        title: "Case studies with no outcomes",
        body: "Process narratives — discovery, wireframes, launch — give a model nothing to justify a recommendation with. A number and a timeframe turns a story into evidence an engine can quote.",
      },
      {
        title: "Slogan homepage",
        body: "\"We build beautiful things\" contains no category noun, no service, no client type and no geography. It is the single most common reason a competent agency is invisible.",
      },
      {
        title: "Losing to directories by default",
        body: "Clutch, DesignRush and 'top 10 agencies' listicles are structured exactly the way engines want. If you are absent from them, the engine answers entirely from sources that rank your competitors.",
      },
    ],
    schemaTypes: ["ProfessionalService", "Organization", "Service", "Review"],
    proofSignals: [
      "Clutch, DesignRush or platform-partner directory listings",
      "Named client logos with linkable case studies",
      "Platform partner badges (Shopify, HubSpot, Webflow)",
      "Speaking, podcasts and press that name the agency",
    ],
    faq: [
      {
        q: "Should we narrow our positioning to get recommended?",
        a: "Narrowing helps considerably, because engines match specific need to specific provider. An agency that credibly owns one niche gets named for that niche; a generalist competes against every agency on earth for a query nobody asks in that shape.",
      },
      {
        q: "Do directory listings still matter?",
        a: "For agencies, more than almost any other signal. Directories are structured, frequently updated and heavily cited, so a listing often reaches an engine faster than anything on your own domain.",
      },
      {
        q: "We do great work but never write about it. Is that fatal?",
        a: "It is the whole problem. Engines cannot recommend work they cannot read. Turning existing projects into outcome-led case studies is usually the highest-return work available to an agency.",
      },
    ],
  },
  {
    slug: "law-firms",
    name: "law firms",
    singular: "law firm",
    metaTitle: "Answer Engine Optimization for Law Firms",
    metaDescription:
      "Get your firm named when people ask AI which lawyer to use. Practice-area depth, jurisdiction clarity and credential signals — built for how engines handle regulated advice.",
    h1: "Answer engine optimization for law firms.",
    intro:
      "Legal questions are among the most frequent things people bring to an assistant, and among the most cautiously answered. Engines hedge on legal advice, which makes the named-firm recommendation rarer and correspondingly more valuable. Jurisdiction is decisive: a firm that cannot be placed geographically is unrecommendable regardless of quality.",
    buyerPrompts: [
      "best immigration lawyer for startup founders",
      "do I need a lawyer for [situation]",
      "employment law firm in [city]",
      "how much does a [practice area] lawyer cost",
      "best firms for startup fundraising",
      "what to look for when hiring a [practice area] attorney",
      "family law solicitor near [area]",
      "which law firm handles [specific matter type]",
    ],
    engineNote:
      "Gemini and AI Overviews carry disproportionate weight because legal queries so often include a location, and Google's local corpus is the deepest. ChatGPT answers the open advisory questions but names firms more sparingly. Expect fewer mentions per query here than in unregulated verticals — the bar is higher and so is the value of clearing it.",
    primaryEngines: ["gemini", "chatgpt", "perplexity"],
    failures: [
      {
        title: "Jurisdiction never stated plainly",
        body: "Bar admissions and the courts you actually practise in are frequently buried in a lawyer bio PDF. If a model cannot determine where you can lawfully act, it will not name you for a location query — which is most legal queries.",
      },
      {
        title: "Practice areas as a navigation list",
        body: "A dropdown with twelve practice areas and one thin page each signals breadth without depth. Firms get recommended for the area they demonstrably own, not the longest list.",
      },
      {
        title: "No credential markup",
        body: "Years in practice, bar admissions, published rulings and recognitions are exactly the authority signals engines weigh for regulated advice, and they are almost never marked up in a machine-readable way.",
      },
      {
        title: "Answering nothing on the site",
        body: "Prospective clients ask process questions long before they ask for a firm. A site that answers none of them forfeits the informational queries that lead to the commercial one.",
      },
    ],
    schemaTypes: ["LegalService", "Attorney", "Person", "FAQPage"],
    proofSignals: [
      "Bar association and law society listings",
      "Chambers, Legal 500 or equivalent rankings",
      "Reported cases and published commentary",
      "Named lawyer profiles with verifiable credentials",
    ],
    faq: [
      {
        q: "Are AI engines even willing to recommend a specific law firm?",
        a: "They are more cautious than in other verticals, and will often answer with selection criteria instead of names. That caution is precisely why being one of the firms named is worth more here — the shortlist is shorter.",
      },
      {
        q: "Does this conflict with legal advertising rules?",
        a: "Nothing in this work involves claims about outcomes or comparative superiority. It is structural: stating your jurisdiction, practice areas and credentials clearly, in a form machines can read. Your existing compliance review applies unchanged.",
      },
      {
        q: "We have many offices. How should that be handled?",
        a: "Each office needs its own location entity with its own jurisdiction, rather than one page listing addresses. Engines resolve location queries against distinct places, not a contact page.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "ecommerce brands",
    singular: "ecommerce brand",
    metaTitle: "Answer Engine Optimization for Ecommerce",
    metaDescription:
      "Get your products recommended when shoppers ask AI what to buy. Product schema, review corroboration and comparison content built for AI shopping surfaces.",
    h1: "Answer engine optimization for ecommerce.",
    intro:
      "Product discovery is moving into the assistant, and the assistant returns two or three options rather than a grid of forty. Ecommerce also has the most structured data of any vertical, which cuts both ways: the baseline is high, so incomplete or stale product markup is a visible deficiency rather than a missing bonus.",
    buyerPrompts: [
      "best [product category] under $100",
      "what's the best [product] for [use case]",
      "[brand] vs [brand] which should I buy",
      "most durable [product category]",
      "best sustainable [product category] brands",
      "is [product] worth the money",
      "alternatives to [popular product]",
      "best [product] for beginners",
    ],
    engineNote:
      "Gemini and AI Overviews lead because they sit on Google's Shopping graph, where your product feed already lives. Perplexity is growing fast for comparison shopping and cites sources visibly, which makes it the best early indicator of whether your product content is being read.",
    primaryEngines: ["gemini", "perplexity", "chatgpt"],
    failures: [
      {
        title: "Product schema present but incomplete",
        body: "Most stores emit Product markup and stop short of the fields that decide retrieval: availability, condition, GTIN, aggregate rating, shipping and returns. Partial markup is treated as unreliable rather than partial.",
      },
      {
        title: "Descriptions written for the brand, not the buyer",
        body: "Evocative copy without materials, dimensions, compatibility or use case gives a model nothing to match against a specific need. \"Best X for Y\" queries are answered from specifications.",
      },
      {
        title: "Reviews trapped in a widget",
        body: "Third-party review apps often inject ratings client-side, so the social proof that would most help you is invisible in the served HTML.",
      },
      {
        title: "No buying guides",
        body: "Comparison and 'best of' queries are answered from guides. With none of your own, engines answer from affiliate content whose incentive is to rank whoever pays the highest commission.",
      },
    ],
    schemaTypes: ["Product", "Offer", "AggregateRating", "BreadcrumbList"],
    proofSignals: [
      "Verified reviews rendered server-side",
      "Marketplace presence with consistent product identity",
      "Independent press and roundup mentions",
      "Consistent GTIN/MPN across every channel",
    ],
    faq: [
      {
        q: "We sell on marketplaces too. Does our own site still matter?",
        a: "Yes, because the marketplace listing rarely carries your brand's full story. The site is where category context, comparison and materials live, and it is what an engine reads when justifying a recommendation.",
      },
      {
        q: "Do AI engines actually drive purchases yet?",
        a: "They increasingly shape the consideration set rather than the checkout. The purchase may still happen on Google or a marketplace, but the two brands the shopper is choosing between were often named by an assistant.",
      },
      {
        q: "How many products should we optimise?",
        a: "Start with the ones that map to real category queries. A hundred perfect product pages nobody asks about is worth less than ten that answer the questions your buyers actually type.",
      },
    ],
  },
  {
    slug: "healthcare",
    name: "healthcare providers",
    singular: "healthcare provider",
    metaTitle: "Answer Engine Optimization for Healthcare",
    metaDescription:
      "Get your practice recommended when patients ask AI where to go. Built for how engines handle health queries: credentials, locations and conservative citation behaviour.",
    h1: "Answer engine optimization for healthcare.",
    intro:
      "Health is the most heavily guarded category in AI answers. Engines apply their strictest source standards, prefer institutional publishers, and hedge toward telling people to see a professional. That conservatism means fewer provider names surface — and the ones that do are chosen on credential and location clarity rather than marketing.",
    buyerPrompts: [
      "best [specialty] clinic near me",
      "should I see a specialist for [symptom]",
      "how much does [procedure] cost without insurance",
      "best [specialty] doctors in [city]",
      "what to expect during [procedure]",
      "is [treatment] covered by insurance",
      "how to choose a [specialty] provider",
      "[specialty] clinic accepting new patients",
    ],
    engineNote:
      "Gemini and AI Overviews dominate, because health queries are overwhelmingly local and Google's health corpus is both the largest and the most curated. ChatGPT answers general health questions extensively but names providers rarely, so treat a ChatGPT mention as a strong outlier rather than the baseline target.",
    primaryEngines: ["gemini", "chatgpt", "perplexity"],
    failures: [
      {
        title: "Clinician credentials unstructured",
        body: "Qualifications, registrations and specialties usually appear as prose in a bio. Without Person and credential markup, a model cannot verify that the practice employs someone qualified for the thing being asked about.",
      },
      {
        title: "Multi-site practices sharing one entity",
        body: "Several locations on a single contact page collapse into one ambiguous place. Location queries need separate entities with their own hours, addresses and accepted insurance.",
      },
      {
        title: "No patient-question content",
        body: "Patients ask about cost, recovery, preparation and insurance long before they choose a clinic. Sites that answer none of it cede every informational query, which is where the relationship starts.",
      },
      {
        title: "Insurance and access details missing",
        body: "Whether you accept a given plan or new patients is often the deciding factor, and is almost never machine-readable — so the engine cannot use it even when it is the answer to the question.",
      },
    ],
    schemaTypes: ["MedicalOrganization", "Physician", "MedicalProcedure", "FAQPage"],
    proofSignals: [
      "Professional register and licensing body listings",
      "Hospital affiliations and accreditations",
      "Named clinicians with verifiable qualifications",
      "Health directory profiles with consistent details",
    ],
    faq: [
      {
        q: "Will an AI engine recommend a specific clinic?",
        a: "For local and practical questions — who is nearby, who accepts a plan, who treats a condition — yes, regularly. For anything resembling diagnosis it will decline and advise seeing a professional, which is appropriate.",
      },
      {
        q: "Is any of this a compliance risk?",
        a: "The work is structural: publishing accurate credentials, locations, services and access information in machine-readable form. It makes no clinical claims. Your usual review process should still cover any patient-facing copy.",
      },
      {
        q: "We're a single practitioner. Can we compete with hospital groups?",
        a: "On broad medical information, no — and you should not try. On specific local and practical questions you compete well, because those are decided by clarity and proximity rather than institutional weight.",
      },
    ],
  },
  {
    slug: "accounting",
    name: "accounting firms",
    singular: "accounting firm",
    metaTitle: "Answer Engine Optimization for Accountants",
    metaDescription:
      "Get your firm recommended when businesses ask AI which accountant to use. Built around specialisation, jurisdiction and the seasonal shape of accounting demand.",
    h1: "Answer engine optimization for accounting firms.",
    intro:
      "Accounting has an unusual property: the informational queries massively outnumber the commercial ones, and they cluster hard around filing deadlines. Firms that answer the tax question well become the source an engine reaches for when someone finally asks who should handle it.",
    buyerPrompts: [
      "best accountant for small business",
      "do I need an accountant or can I use software",
      "how much does a CPA cost",
      "accountant for ecommerce sellers",
      "best accounting firm for startups in [city]",
      "how to choose an accountant",
      "R&D tax credit specialists",
      "accountant who handles [specific situation]",
    ],
    engineNote:
      "ChatGPT and Perplexity handle the heavy informational load — tax rules, thresholds, deadlines — while Gemini answers the local hiring questions. Because so much accounting demand begins as a question rather than a search for a firm, informational depth converts into commercial visibility more directly here than in most verticals.",
    primaryEngines: ["chatgpt", "perplexity", "gemini"],
    failures: [
      {
        title: "Jurisdiction and regime left implicit",
        body: "Tax content is worthless if a model cannot tell which country's rules it describes. Firms routinely publish guidance with no explicit jurisdiction, making it unusable for a location-specific answer.",
      },
      {
        title: "Undated guidance",
        body: "Rates and thresholds change annually. Content without a visible review date is discounted heavily, because a model cannot tell whether it is describing this year's rules or a stale version.",
      },
      {
        title: "Generalist positioning",
        body: "Buyers ask for accountants who know their situation — ecommerce, contractors, a specific relief. Firms that list services rather than client types miss the way the question is actually asked.",
      },
      {
        title: "Qualifications not machine-readable",
        body: "Chartered status and professional body membership are the core trust signal in this category and are almost always plain text in a footer.",
      },
    ],
    schemaTypes: ["AccountingService", "Organization", "FAQPage", "Article"],
    proofSignals: [
      "Professional body membership listings",
      "Software partner directories (Xero, QuickBooks)",
      "Dated, jurisdiction-specific guidance",
      "Client reviews on independent platforms",
    ],
    faq: [
      {
        q: "Should we publish tax guidance when it dates so fast?",
        a: "Yes, but date it explicitly and review it on a schedule. A clearly dated page that is currently accurate outperforms an undated one, and the review date itself is a signal engines use.",
      },
      {
        q: "Which matters more, local or specialist positioning?",
        a: "Specialist, in most cases. Accounting is largely remote now, and buyers ask for someone who understands their situation more often than someone on their street — with the exception of jurisdiction, which is non-negotiable.",
      },
      {
        q: "Can we compete with the large firms?",
        a: "For broad tax information, they have the advantage. For specific client-type questions — a niche relief, a particular business model — a specialist firm is usually the better answer, and engines will name it.",
      },
    ],
  },
  {
    slug: "real-estate",
    name: "real estate businesses",
    singular: "real estate business",
    metaTitle: "Answer Engine Optimization for Real Estate",
    metaDescription:
      "Get named when buyers and sellers ask AI about agents, areas and process. Built for a vertical where portals own the query and local knowledge is the differentiator.",
    h1: "Answer engine optimization for real estate.",
    intro:
      "Real estate is dominated by portals that engines already trust, so competing on listing data is a losing game. The opening is in the questions portals answer badly: what a neighbourhood is actually like, how the process works locally, and who is worth calling.",
    buyerPrompts: [
      "best real estate agent in [area]",
      "is [neighbourhood] a good place to live",
      "how much does it cost to sell a house",
      "should I use an agent or sell myself",
      "best areas to buy in [city] for families",
      "how long does buying a house take in [region]",
      "what do estate agent fees cover",
      "first time buyer advice [region]",
    ],
    engineNote:
      "Gemini and AI Overviews are decisive, because essentially every query carries a location and Google's local data is unmatched. ChatGPT handles process questions well and will name agencies when the site demonstrates genuine area knowledge rather than listing volume.",
    primaryEngines: ["gemini", "chatgpt", "perplexity"],
    failures: [
      {
        title: "Competing with portals on listings",
        body: "Rightmove, Zillow and their equivalents will always win listing queries. Effort spent there is wasted; the winnable ground is the advisory and area content portals do not own.",
      },
      {
        title: "Area pages that are just search results",
        body: "A page titled after a neighbourhood containing only property cards answers nothing about the neighbourhood. Schools, transport, character and price context are what the question actually asks for.",
      },
      {
        title: "Agents with no individual presence",
        body: "People ask for agents, not agencies. Without individual profiles carrying track record and specialisation, there is no person entity for an engine to name.",
      },
      {
        title: "Fees and process undocumented",
        body: "Cost and timeline questions are among the most asked and least answered. A clear fees page captures a query most competitors decline to address.",
      },
    ],
    schemaTypes: ["RealEstateAgent", "Place", "Organization", "FAQPage"],
    proofSignals: [
      "Industry body registrations and redress schemes",
      "Independent review platform profiles",
      "Local press and community involvement",
      "Named agents with verifiable transaction history",
    ],
    faq: [
      {
        q: "Can we outrank the big portals?",
        a: "Not on listings, and you should not try. On area knowledge and process questions you can win comfortably, because portals produce those pages programmatically and thinly.",
      },
      {
        q: "How local should content be?",
        a: "As local as your actual expertise. A genuinely specific neighbourhood page beats a city page written from a template, because engines can tell the difference between knowledge and coverage.",
      },
      {
        q: "Do individual agent profiles really matter?",
        a: "They matter more than the agency page. The query is usually 'best agent in X', and a model needs a person entity with evidence attached to answer it.",
      },
    ],
  },
  {
    slug: "home-services",
    name: "home service businesses",
    singular: "home service business",
    metaTitle: "Answer Engine Optimization for Home Services",
    metaDescription:
      "Get your trade business recommended when people ask AI who to call. Service-area clarity, pricing transparency and review corroboration for plumbers, electricians and contractors.",
    h1: "Answer engine optimization for home services.",
    intro:
      "Home services queries are urgent, local and increasingly asked out loud. The buyer wants someone who covers their postcode, does the specific job, and can be trusted — and they want it resolved in one answer rather than a page of results to sift.",
    buyerPrompts: [
      "emergency plumber near me",
      "how much does it cost to rewire a house",
      "best roofer in [town]",
      "do I need a permit for [job]",
      "how to find a reliable electrician",
      "[trade] who works weekends in [area]",
      "average cost of [home improvement]",
      "best boiler installers [region]",
    ],
    engineNote:
      "Gemini and AI Overviews are close to the whole game, because these queries are local and often voice-initiated on a phone. ChatGPT handles the cost and process questions, which is where a business can build credibility before the urgent query arrives.",
    primaryEngines: ["gemini", "chatgpt"],
    failures: [
      {
        title: "Service area left vague",
        body: "\"We cover the local area\" cannot be matched to a postcode. Named towns and explicit radius are what let a model decide you are the right answer for a specific place.",
      },
      {
        title: "No pricing signal at all",
        body: "Cost is the most asked question in every trade and the least answered. Even a range with the factors that move it captures a query most competitors leave entirely to aggregators.",
      },
      {
        title: "Reviews only on one platform",
        body: "A single Google profile is thin corroboration. Engines cross-reference, and a business present on several review sources with consistent details is materially more recommendable.",
      },
      {
        title: "Certifications not stated",
        body: "Gas Safe, NICEIC, licensing and insurance are the trust signals buyers ask about explicitly. They belong in structured data, not only on a van.",
      },
    ],
    schemaTypes: ["LocalBusiness", "Service", "GeoCircle", "AggregateRating"],
    proofSignals: [
      "Trade body certifications and registration numbers",
      "Checkatrade, Angi or equivalent profiles",
      "Google Business Profile with current hours",
      "Consistent NAP details across every listing",
    ],
    faq: [
      {
        q: "Is this just local SEO?",
        a: "It overlaps heavily and builds on the same foundations. The difference is that an answer engine names one or two businesses rather than showing a map of ten, so the bar for being chosen is higher and clarity matters more.",
      },
      {
        q: "We only work by word of mouth. Why bother?",
        a: "Because word of mouth increasingly gets verified by an assistant before anyone calls. Being absent when someone checks you costs jobs you had already effectively won.",
      },
      {
        q: "Should we publish prices?",
        a: "A range with the factors that move it, rather than a fixed rate. It answers the question honestly, captures a high-intent query, and filters enquiries you did not want anyway.",
      },
    ],
  },
  {
    slug: "recruitment",
    name: "recruitment agencies",
    singular: "recruitment agency",
    metaTitle: "Answer Engine Optimization for Recruitment",
    metaDescription:
      "Get your agency recommended when employers ask AI who to hire for hiring. Sector depth, placement evidence and process transparency for staffing and search firms.",
    h1: "Answer engine optimization for recruitment.",
    intro:
      "Recruitment has two distinct audiences asking different questions of the same engine — employers looking for a partner and candidates looking for a route. Both are worth winning, and the content that serves them barely overlaps, which is where most agency sites come unstuck.",
    buyerPrompts: [
      "best tech recruitment agency in [city]",
      "how much do recruitment agencies charge",
      "should we use a recruiter or hire direct",
      "best executive search firms for [sector]",
      "recruitment agency specialising in [role type]",
      "how to choose a recruitment partner",
      "contingency vs retained search",
      "agencies that place [specific role]",
    ],
    engineNote:
      "ChatGPT and Perplexity handle the employer-side evaluation questions, which are comparative and high value. Gemini picks up the location-specific queries. LinkedIn dominates the candidate side, so the winnable ground for an agency site is firmly the employer question.",
    primaryEngines: ["chatgpt", "perplexity", "gemini"],
    failures: [
      {
        title: "Sector claims with no evidence",
        body: "Listing twelve sectors on a homepage signals none of them. Depth in one — roles placed, salary data, market commentary — is what makes a model treat you as the specialist for it.",
      },
      {
        title: "Fee model undisclosed",
        body: "Employers ask what recruitment costs before they ask who to use. No page addressing percentage, retainer or guarantee terms means no presence in the query that starts the process.",
      },
      {
        title: "No placement evidence",
        body: "Time-to-hire, retention and role types actually filled are the outcome data that justifies a recommendation. Most agency sites publish testimonials instead, which carry far less weight.",
      },
      {
        title: "Candidate content crowding out employer content",
        body: "Job boards fill the site while the employer — the person who pays — finds nothing addressed to them. The commercial query goes unanswered.",
      },
    ],
    schemaTypes: ["EmploymentAgency", "Organization", "Service", "FAQPage"],
    proofSignals: [
      "Industry body membership (REC, APSCo)",
      "Client logos with permission and context",
      "Published salary guides and market reports",
      "Reviews from both employers and placed candidates",
    ],
    faq: [
      {
        q: "Should we target employers or candidates?",
        a: "Employers, for AI visibility. Candidates overwhelmingly start on job boards and LinkedIn, while employers genuinely ask assistants which agency to use — and they are the side that pays.",
      },
      {
        q: "Do salary guides help?",
        a: "Substantially. They are among the most cited artefacts in this sector because they contain data engines want and nobody else publishes with your specificity.",
      },
      {
        q: "How specific should sector positioning be?",
        a: "Specific enough that the claim is defensible with evidence. 'Technology' is too broad to mean anything; 'backend engineering for fintech in London' is a claim a model can match and you can prove.",
      },
    ],
  },
  {
    slug: "financial-services",
    name: "financial services firms",
    singular: "financial services firm",
    metaTitle: "Answer Engine Optimization for Financial Services",
    metaDescription:
      "Get your firm recommended when people ask AI about advice, planning and providers. Built for a regulated vertical where engines apply their strictest source standards.",
    h1: "Answer engine optimization for financial services.",
    intro:
      "Money questions sit alongside health in the tier engines treat most carefully. Regulatory status is the gate: a firm whose authorisation cannot be established is not a candidate for recommendation, no matter how good its content. Clearing that gate is worth a great deal, because most competitors never do.",
    buyerPrompts: [
      "best financial advisor for retirement planning",
      "do I need a financial advisor",
      "how much do financial advisors charge",
      "independent vs restricted advice",
      "best wealth management firms in [city]",
      "how to choose a pension advisor",
      "financial planner for business owners",
      "is [type of advice] worth paying for",
    ],
    engineNote:
      "Engines lean hard on regulator registers and established institutional publishers here. Gemini handles local adviser queries; ChatGPT and Perplexity handle the educational ones. Expect conservative behaviour throughout — named recommendations are rarer and correspondingly more valuable.",
    primaryEngines: ["gemini", "chatgpt", "perplexity"],
    failures: [
      {
        title: "Regulatory status buried",
        body: "Authorisation and reference numbers typically sit in small print. They are the single strongest trust signal available in this vertical and belong in structured data where a model can actually use them.",
      },
      {
        title: "Fee structure unexplained",
        body: "How advisers are paid is the most common question and the most avoided answer. A clear explanation of the model captures a high-intent query and reads as candour.",
      },
      {
        title: "Generic educational content",
        body: "Rewriting what every institution already publishes competes directly against sources engines trust more. Specific situations and client types are the winnable ground.",
      },
      {
        title: "Adviser credentials unstructured",
        body: "Qualifications and specialisms live in bio prose rather than Person markup, so the expertise cannot be matched to the question being asked.",
      },
    ],
    schemaTypes: ["FinancialService", "Organization", "Person", "FAQPage"],
    proofSignals: [
      "Regulator register entries with reference numbers",
      "Professional qualifications and chartered status",
      "Independent review platform profiles",
      "Named advisers with verifiable credentials",
    ],
    faq: [
      {
        q: "Will engines recommend a specific financial firm?",
        a: "For adviser selection and local queries, yes — with visible caution. For anything resembling a product recommendation they will decline and direct people to regulated advice, which is the correct behaviour.",
      },
      {
        q: "How does this interact with financial promotion rules?",
        a: "The work is structural rather than promotional: making authorisation, services and credentials machine-readable. Any customer-facing copy still goes through your existing compliance process unchanged.",
      },
      {
        q: "Should we publish fees?",
        a: "The structure, at minimum. Firms that explain how they charge are treated as more transparent by both engines and readers, and it is among the most asked questions in the category.",
      },
    ],
  },
  {
    slug: "education",
    name: "education providers",
    singular: "education provider",
    metaTitle: "Answer Engine Optimization for Education",
    metaDescription:
      "Get your course, school or training provider recommended when learners ask AI what to study and where. Outcome evidence, accreditation clarity and honest comparison.",
    h1: "Answer engine optimization for education.",
    intro:
      "Learners ask assistants what to study, where, and whether it is worth it — and they ask before they ever see a prospectus. Education also has an unusually strong outcome question attached: engines increasingly want evidence that a programme leads somewhere, not just that it exists.",
    buyerPrompts: [
      "best online course for [skill]",
      "is a [subject] degree worth it",
      "best bootcamp for career changers",
      "[institution] vs [institution] for [subject]",
      "how much does [qualification] cost",
      "accredited [subject] courses online",
      "best universities for [subject] in [country]",
      "can I get a job after [programme type]",
    ],
    engineNote:
      "ChatGPT and Claude carry the advisory questions — what to study, whether it is worthwhile — and they are patient with long, nuanced answers. Gemini handles institutional and location queries. Perplexity is strong for comparison, where accreditation and outcome data get cited directly.",
    primaryEngines: ["chatgpt", "claude", "gemini"],
    failures: [
      {
        title: "Outcomes claimed, never evidenced",
        body: "Employment rates, salary uplift and completion figures are what justify a recommendation. Marketing language without numbers is discounted, and increasingly flagged as unsupported.",
      },
      {
        title: "Accreditation unstructured",
        body: "Recognition and awarding bodies are the trust gate for education queries, and they are usually a logo strip rather than machine-readable data.",
      },
      {
        title: "Curriculum hidden behind a form",
        body: "Gating the syllabus removes the substance a model needs to match your programme to a learner's stated goal. The gate protects a lead and forfeits the recommendation.",
      },
      {
        title: "No honest comparison",
        body: "Learners explicitly ask how options compare. Providers that address alternatives candidly get cited as reference; those that pretend to have no peers get skipped.",
      },
    ],
    schemaTypes: ["EducationalOrganization", "Course", "CourseInstance", "FAQPage"],
    proofSignals: [
      "Accreditation and awarding body listings",
      "Published outcome and completion data",
      "Independent review platforms and alumni evidence",
      "Employer partnerships with named organisations",
    ],
    faq: [
      {
        q: "We're a small provider. Can we compete with universities?",
        a: "On broad subject queries, no. On specific, practical questions — a particular skill, a career change, a defined outcome — you compete well, because specificity beats institutional weight when the question is specific.",
      },
      {
        q: "Should we publish full curricula?",
        a: "Yes. The syllabus is exactly what lets a model match your programme to what a learner said they want. Gating it protects a lead form at the cost of the recommendation.",
      },
      {
        q: "How important is accreditation for AI visibility?",
        a: "Very. It is the clearest external validation available in the category, and engines weigh it heavily precisely because it is verifiable elsewhere.",
      },
    ],
  },
  {
    slug: "b2b-services",
    name: "B2B service providers",
    singular: "B2B service provider",
    metaTitle: "Answer Engine Optimization for B2B Services",
    metaDescription:
      "Get your firm recommended when businesses ask AI who to hire for consulting, IT, logistics or professional services. Built for long, committee-driven buying cycles.",
    h1: "Answer engine optimization for B2B services.",
    intro:
      "B2B services are bought by committees over months, and the assistant is now where the longlist gets assembled — often by someone junior, early, before any vendor knows the deal exists. Being absent at that moment removes you from a process you never learn was running.",
    buyerPrompts: [
      "best managed IT provider for mid-size companies",
      "how to choose a [service] vendor",
      "top [service category] consultancies",
      "[service] provider for [industry] companies",
      "what should [service] cost annually",
      "questions to ask a [service] provider",
      "best [service] companies for enterprise",
      "in-house vs outsourced [function]",
    ],
    engineNote:
      "ChatGPT and Perplexity are where B2B research happens, and Claude is increasingly used inside companies that have standardised on it — which makes it worth more than its consumer share suggests. Location matters far less here than proof of comparable work.",
    primaryEngines: ["chatgpt", "perplexity", "claude"],
    failures: [
      {
        title: "Capability lists instead of problems",
        body: "Buyers describe a problem, not a service taxonomy. Sites organised around internal capability names never match the language of the question.",
      },
      {
        title: "No client-size or sector signal",
        body: "Fit is the first filter in B2B. Without stating who you serve — company size, sector, region — a model cannot judge suitability and defaults to firms that do state it.",
      },
      {
        title: "Case studies under NDA with nothing published",
        body: "Confidentiality is real, but anonymised outcomes with sector and scale still carry weight. Publishing nothing leaves the recommendation entirely to competitors.",
      },
      {
        title: "No commercial model explained",
        body: "Committees need to know roughly what engagements cost and how they are structured. Silence pushes the query to analyst content that names other vendors.",
      },
    ],
    schemaTypes: ["ProfessionalService", "Organization", "Service", "FAQPage"],
    proofSignals: [
      "Analyst mentions and industry reports",
      "Certifications and technology partnerships",
      "Named client references with outcomes",
      "Conference speaking and published expertise",
    ],
    faq: [
      {
        q: "Our sales are all relationship-driven. Does this apply?",
        a: "It applies precisely because of that. Relationships get checked — a name gets passed along, then verified with an assistant. Being invisible at verification undermines an introduction you had already earned.",
      },
      {
        q: "How do we handle client confidentiality?",
        a: "Anonymised case studies with sector, scale and outcome carry most of the weight without naming anyone. 'A mid-market logistics firm, 40% reduction, six months' is usable evidence.",
      },
      {
        q: "Does location matter for B2B services?",
        a: "Much less than in consumer verticals, unless the work requires onsite presence or a regulatory footprint. Proof of comparable work matters far more than proximity.",
      },
    ],
  },
  {
    slug: "hospitality",
    name: "hospitality businesses",
    singular: "hospitality business",
    metaTitle: "Answer Engine Optimization for Hospitality",
    metaDescription:
      "Get your hotel, restaurant or venue recommended when travellers ask AI where to go. Built for a vertical where OTAs and review platforms already own the query.",
    h1: "Answer engine optimization for hospitality.",
    intro:
      "Travel and dining recommendations are among the most common things anyone asks an assistant, and hospitality is unusually exposed: booking platforms and review aggregators sit between you and the traveller, and engines trust them. The winnable ground is specificity — the occasion, the constraint, the local knowledge an aggregator cannot express.",
    buyerPrompts: [
      "best restaurants in [city] for [occasion]",
      "hotels near [landmark] with parking",
      "where to stay in [city] for families",
      "best [cuisine] restaurant in [area]",
      "dog friendly pubs in [region]",
      "hotel with [specific amenity] in [city]",
      "good places to eat near [venue]",
      "best venues for [event type] in [city]",
    ],
    engineNote:
      "Gemini and AI Overviews lead by a wide margin, because Google's local and Maps corpus is the substrate for travel answers. ChatGPT is strong for itinerary and occasion planning, where a distinctive venue can be named if its character is legible from the site.",
    primaryEngines: ["gemini", "chatgpt", "perplexity"],
    failures: [
      {
        title: "Menus and details as images or PDFs",
        body: "A menu in a PDF or an image is unreadable to a model. Dietary options, price band and cuisine — exactly the constraints people ask about — become invisible.",
      },
      {
        title: "Amenities not machine-readable",
        body: "Parking, accessibility, pet policy and family suitability decide these queries and are usually prose on an about page rather than structured data.",
      },
      {
        title: "Ceding everything to OTAs",
        body: "Booking platforms will win generic availability queries. Character, occasion suitability and neighbourhood knowledge are yours to own and they cannot replicate them.",
      },
      {
        title: "Inconsistent details across platforms",
        body: "Hours and addresses that disagree between your site, Maps and aggregators create ambiguity, and ambiguity gets resolved by recommending someone else.",
      },
    ],
    schemaTypes: ["Restaurant", "Hotel", "Menu", "LocalBusiness"],
    proofSignals: [
      "Consistent Google Business Profile and Maps data",
      "Review platform presence with recent reviews",
      "Guides, awards and local press coverage",
      "Structured menus and amenity data",
    ],
    faq: [
      {
        q: "Can we compete with Booking.com and TripAdvisor?",
        a: "Not on inventory or breadth of reviews. On specificity you can — occasion, atmosphere, dietary provision and neighbourhood context are things aggregators flatten and you can express precisely.",
      },
      {
        q: "Does this reduce our OTA commission?",
        a: "It can, over time. Being named directly in an answer creates a path to a direct booking that would otherwise have gone through a platform, though the platforms will still carry most volume.",
      },
      {
        q: "How important is the Google Business Profile?",
        a: "In this vertical it is foundational. It feeds the corpus Gemini and AI Overviews draw on most heavily, and an inaccurate profile undermines everything else you do.",
      },
    ],
  },
  {
    slug: "manufacturing",
    name: "manufacturers and suppliers",
    singular: "manufacturer",
    metaTitle: "Answer Engine Optimization for Manufacturing",
    metaDescription:
      "Get your company named when buyers ask AI to source a supplier. Specification depth, certification clarity and capability data for industrial and B2B suppliers.",
    h1: "Answer engine optimization for manufacturing.",
    intro:
      "Industrial sourcing is a specification problem. A buyer describes a material, a tolerance, a volume and a standard, and needs suppliers who can meet it. That is a question engines can answer well — provided the specifications exist somewhere machine-readable, which on most manufacturer sites they do not.",
    buyerPrompts: [
      "suppliers of [material or component] in [region]",
      "manufacturers who can produce [specification]",
      "[product] manufacturers with ISO certification",
      "minimum order quantity for [product type]",
      "who makes custom [component]",
      "best contract manufacturers for [industry]",
      "[material] suppliers with short lead times",
      "manufacturers meeting [standard]",
    ],
    engineNote:
      "ChatGPT and Perplexity handle sourcing research, and Perplexity's citation habit makes it the clearest early signal that your specification pages are being read. Gemini contributes where the query carries a region. This vertical is unusually winnable because so few competitors publish real specifications.",
    primaryEngines: ["chatgpt", "perplexity", "gemini"],
    failures: [
      {
        title: "Capabilities described qualitatively",
        body: "\"High precision\" is not a specification. Tolerances, materials, volumes and processes in explicit numbers are what allow a model to match you to a requirement.",
      },
      {
        title: "Certifications as logos",
        body: "ISO, industry and safety certifications are frequently a strip of images with no text or markup, so the thing buyers filter on cannot be read at all.",
      },
      {
        title: "Catalogues locked in PDFs",
        body: "Product data trapped in downloadable documents is largely inaccessible. The same data as HTML pages becomes retrievable and citable.",
      },
      {
        title: "No commercial terms",
        body: "Minimum order quantities and lead times are among the first filters a buyer applies, and are almost never published — so the engine cannot use them to qualify you in.",
      },
    ],
    schemaTypes: ["Organization", "Product", "Offer", "QuantitativeValue"],
    proofSignals: [
      "Certification bodies and registration numbers",
      "Industry association memberships",
      "Trade directory and marketplace listings",
      "Published technical specifications and datasheets",
    ],
    faq: [
      {
        q: "Our buyers use trade directories, not AI. Is this premature?",
        a: "Procurement research has already shifted, particularly for the early longlist. The directory still closes the deal; the assistant increasingly decides who is on the list that reaches it.",
      },
      {
        q: "We can't publish detailed specifications for competitive reasons.",
        a: "Ranges and capability envelopes work nearly as well as exact figures. 'Tolerances to ±0.01mm, batch sizes 500–50,000' qualifies you without exposing anything a competitor could use.",
      },
      {
        q: "Does this apply to companies selling through distributors?",
        a: "Yes, and it can be more valuable. Buyers research the manufacturer then approach a distributor, so being the named manufacturer shapes a purchase you never handle directly.",
      },
    ],
  },
];

export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug);

export function getIndustry(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug) ?? null;
}

/** Shared closing FAQ appended to every industry page. */
export const INDUSTRY_COMMON_FAQ = [
  {
    q: "How is this measured?",
    a: `Your prompts are asked on ChatGPT, Perplexity, Gemini and Claude and the answers recorded — whether you were named, in what position, and which pages were cited. The record is what the ${GUARANTEE_DAYS}-day guarantee is judged on, so there is no interpretation involved.`,
  },
  {
    q: "What does it cost?",
    a: `${PRICE_LABEL} once for a ${GUARANTEE_DAYS}-day sprint. If your business isn't mentioned on at least ${GUARANTEE_MIN_ENGINES} of the four engines by the end of it, you are refunded in full.`,
  },
];
