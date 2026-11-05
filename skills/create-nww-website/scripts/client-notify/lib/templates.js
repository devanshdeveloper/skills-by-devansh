const fs = require('node:fs');
const path = require('node:path');
const { getGate2OptionsSummary } = require('./context');

function getStageTemplate(stage, context) {
  const { projectName, clientName, reviewUrl, projectRoot } = context;
  const root = projectRoot || process.cwd();

  const templates = {
    0: {
      gate: 'Gate 0',
      name: 'Intake Check & Scope Confirmation',
      subject: `[${projectName}] Milestone Review: Intake Brief & CMS Scope Ready`,
      action: 'Confirm the intake answers and CMS mode so technical architecture can begin.',
      deliverable: 'client-context/answers/',
      summary: `We have codified your discovery answers, branding preferences, reference sites, and CMS scope into the initial Project Brief. Please review the scope details to ensure full alignment before we generate the technical architecture.`
    },
    1: {
      gate: 'Gate 1',
      name: 'Tech Stack Specification',
      subject: `[${projectName}] Milestone Review: Tech Stack & System Architecture`,
      action: 'Review and approve the technology stack, framework conventions, and rendering strategy.',
      deliverable: 'project-docs/client-review/gate-1-tech-stack/tech-stack.md',
      summary: `The core technology stack has been defined—including Next.js App Router, Tailwind CSS semantic tokens, motion libraries, and hosting specifications. Please confirm this architecture before we move to visual design theory.`
    },
    2: {
      gate: 'Gate 2',
      name: 'Design Theory & Landing Page Variations',
      subject: `[${projectName}] Action Required: Review 3 Original Landing Page Design Variations`,
      action: 'Experience the 3 full-page design variations and choose your preferred direction (Variation 1, 2, or 3).',
      deliverable: reviewUrl || 'project-docs/client-review/gate-2-design-theory/index.html',
      summary: `We have developed 3 distinct full-page website design variations for your review:\n` +
               `${getGate2OptionsSummary(root)}\n\n` +
               `Each variation explores a distinct spatial layout, typography hierarchy, and visual personality, crafted from your authentic content and pre-audited for originality.`
    },
    3: {
      gate: 'Gate 3',
      name: 'Page List & Sitemap',
      subject: `[${projectName}] Milestone Review: Route Hierarchy & Sitemap Scope`,
      action: 'Review and approve the complete sitemap, route list, and page types.',
      deliverable: reviewUrl ? `${reviewUrl} (Sitemap Section)` : 'project-docs/client-review/gate-3-page-list/page-list.md',
      summary: `We have finalized the complete route hierarchy and master page inventory. Please confirm the pages and URLs before we lock the SEO strategy.`
    },
    4: {
      gate: 'Gate 4',
      name: 'SEO Strategy & Structured Data',
      subject: `[${projectName}] Milestone Review: SEO Keywords & JSON-LD Schemas`,
      action: 'Approve the keyword mapping, meta title/description rules, and structured data.',
      deliverable: 'project-docs/client-review/gate-4-seo-strategy/seo-strategy.md',
      summary: `The SEO architecture has been established—covering unique meta tags per route, OpenGraph preview cards, search indexing rules, and rich JSON-LD schemas.`
    },
    5: {
      gate: 'Gate 5',
      name: 'Page Specifications & CMS Schema',
      subject: `[${projectName}] Milestone Review: Page Specifications & CMS Schema`,
      action: 'Approve the section flow, responsive layout blueprints, verbatim copywriting, media asset slots, and CMS schema (if enabled).',
      deliverable: 'project-docs/client-review/gate-5-page-specs/ & gate-5-cms-schema/cms-schema.md',
      summary: `Every page has been specified in comprehensive markdown documents combining responsive layout blueprints, authentic verbatim copywriting, and media asset slots. When CMS integration is active, backend schemas, field definitions, and seed content are fully specified. Please review the deliverables.`
    },
    6: {
      gate: 'Gate 6',
      name: 'Codebase Scaffolding, Foundation Build & Landing Page Showcase',
      subject: `[${projectName}] Milestone Review: Scaffolding, Foundation Shell & Landing Page Showcase`,
      action: 'Preview the interactive Landing Page showcase, review the Next.js foundation shell, and approve before sub-page construction.',
      deliverable: reviewUrl || 'Public Showcase URL (e.g. GitHub Pages preview)',
      summary: `The Next.js App Router codebase has been scaffolded in site/ with the complete foundation shell (navigation, footer, theme tokens, motion setup, optimized assets) and the master page checklist. In addition, the Landing Page (Home) is fully constructed, deployed to a public review URL, and ready for your showcase review.`
    },
    7: {
      gate: 'Gate 7',
      name: 'Sub-Page Build Loop',
      subject: `[${projectName}] Milestone Review: Sub-Page Build Preview & Acceptance QA`,
      action: 'Preview the interactive sub-pages and provide feedback or sign-off.',
      deliverable: reviewUrl || 'site/app routes',
      summary: `The remaining sub-pages have been constructed one by one with full animations, responsive layouts, and CMS integrations, passing all static checklist items and binary QA.`
    },
    8: {
      gate: 'Gate 8',
      name: 'Additional Features & Modular Integrations',
      subject: `[${projectName}] Milestone Review: Additional Features & Modular Integrations`,
      action: 'Review and approve modular features, NWW Analytics, and custom integrations.',
      deliverable: 'project-docs/client-review/gate-8-additional-features/features-manifest.md',
      summary: `Additional modular site capabilities—including NWW Visitor Identity & Telemetry, specialized components, and third-party integrations—have been incorporated and verified in the codebase. Please review the features manifest before we proceed to final production verification.`
    },
    9: {
      gate: 'Gate 9',
      name: 'Final Verification & Handover',
      subject: `[${projectName}] Final Milestone: Production Verification & Handover`,
      action: 'Complete final sign-off, verify live production deployment, and receive handover assets.',
      deliverable: 'project-docs/client-review/gate-9-final-verification/structure-audit.md & Production URL',
      summary: `All cross-page audits, performance scores, accessibility checks, and production deployments are complete. Your website is ready for handover.`
    }
  };

  return templates[stage] || {
    gate: `Gate ${stage}`,
    name: `Stage ${stage} Milestone`,
    subject: `[${projectName}] Milestone Review: Stage ${stage} Deliverables`,
    action: `Review and approve the Stage ${stage} milestone deliverables.`,
    deliverable: reviewUrl || 'project-docs/client-review/index.html',
    summary: `Stage ${stage} deliverables have been generated and are ready for your review.`
  };
}

const BATCH_DEFINITIONS = [
  { num: 1, slug: 'batch-01-core-identity' },
  { num: 2, slug: 'batch-02-branding-motion' },
  { num: 3, slug: 'batch-03-sitemap-copy' },
  { num: 4, slug: 'batch-04-asset-harvesting-generation' },
  { num: 5, slug: 'batch-05-type-specific-routing' },
  { num: 6, slug: 'batch-06-legacy-site-migration' },
  { num: 7, slug: 'batch-07-seo-analytics-governance' },
  { num: 8, slug: 'batch-08-open-questions', extraAliases: ['questions', 'open-questions'] }
];

const BATCH_MAP = Object.fromEntries(
  BATCH_DEFINITIONS.flatMap(({ num, slug, extraAliases = [] }) => {
    const pad = String(num).padStart(2, '0');
    const aliases = [String(num), pad, `batch-${pad}`, slug, ...extraAliases];
    return aliases.map(alias => [alias, slug]);
  })
);

function getOpenQuestionsSummary(projRoot = process.cwd()) {
  const openQuestionsPath = path.join(projRoot, 'client-context', 'open-questions.md');
  if (fs.existsSync(openQuestionsPath)) {
    const raw = fs.readFileSync(openQuestionsPath, 'utf-8');
    const lines = raw.split('\n');
    const questions = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^(?:\d+\.|\-\s*\[\s*\]|\-\s*\*\*\[?Q|###\s*Q)/i.test(trimmed)) {
        questions.push(trimmed.replace(/^-\s*\[\s*\]\s*/, '').replace(/^-\s*\*\*/, '').replace(/\*\*$/, ''));
      }
    }
    if (questions.length > 0) {
      return `We have compiled the current active queue of open discovery and refinement questions (${questions.length} questions):\n\n` +
             questions.join('\n') +
             `\n\nYour answers will directly shape the copywriting, visual assets, and functional specs. Simply reply to this email with your thoughts or answers.`;
    }
    return `We have compiled the current open discovery questions in client-context/open-questions.md. Please review and reply with your answers.`;
  }
  return `We have compiled the current open discovery questions in client-context/open-questions.md. Please review and reply with your answers.`;
}

function getBatchTemplate(batchKey, context) {
  const { projectName, projectRoot } = context;
  const canonical = BATCH_MAP[String(batchKey).toLowerCase().trim()] || 'batch-01-core-identity';
  const root = projectRoot || process.cwd();

  const templates = {
    'batch-01-core-identity': {
      gate: 'Gate 0 (Batch 01)',
      name: 'Core Identity & Technical Slug Confirmation',
      subject: `[${projectName}] Milestone Review: Core Identity & Technical Project Slug Approved`,
      action: 'Confirm your business name, technical project slug, target market, and primary goals.',
      deliverable: 'client-context/answers/batch-01-core-identity/answers.md',
      summary: `We have compiled and verified your Core Identity discovery answers, including the confirmed technical project slug. This slug will govern repository naming, preview variation domains, and Vercel hosting.`
    },
    'batch-02-branding-motion': {
      gate: 'Gate 0 (Batch 02)',
      name: 'Branding, Visual Personality & Motion Tier Confirmation',
      subject: `[${projectName}] Milestone Review: Visual Identity & GSAP Motion Tier Approved`,
      action: 'Review and confirm your brand visual direction, color pairings, typography, and motion tier.',
      deliverable: 'client-context/answers/batch-02-branding-motion/answers.md',
      summary: `We have codified your brand personality, color palette tokens, typography rules, liked design references, and approved motion tier to prepare for Gate 2 design variations.`
    },
    'batch-03-sitemap-copy': {
      gate: 'Gate 0 (Batch 03)',
      name: 'Route Sitemap & Copywriting Scope Confirmation',
      subject: `[${projectName}] Milestone Review: Route Hierarchy & Copywriting Scope Approved`,
      action: 'Confirm the planned route hierarchy, primary conversion calls-to-action, and copywriting source strategy.',
      deliverable: 'client-context/answers/batch-03-sitemap-copy/answers.md',
      summary: `We have outlined your website's route structure, required page inventory, conversion paths, and content sourcing approach.`
    },
    'batch-04-asset-harvesting-generation': {
      gate: 'Gate 0 (Batch 04)',
      name: 'Asset Harvesting & Generation Manifest Confirmation',
      subject: `[${projectName}] Milestone Review: Visual Asset Manifest & Sourcing Strategy Approved`,
      action: 'Review and confirm your media asset inventory, brand assets, custom generation needs, and stock sourcing permissions.',
      deliverable: 'client-context/asset-manifest.md & client-context/answers/batch-04-asset-harvesting-generation/answers.md',
      summary: `We have generated the master visual asset manifest—cataloging all client uploads, legacy media to harvest, custom visual assets to create, and licensed stock photography criteria.`
    },
    'batch-05-type-specific-routing': {
      gate: 'Gate 0 (Batch 05)',
      name: 'Website Archetype & Functional Requirements Confirmation',
      subject: `[${projectName}] Milestone Review: Archetype Deep-Dive & Functional Scope Approved`,
      action: 'Confirm the specialized architectural requirements for your specific website archetype.',
      deliverable: 'client-context/answers/batch-05-type-specific-routing/answers.md',
      summary: `We have documented the specialized architectural requirements tailored to your site type (e-commerce, SaaS, portfolio, booking, corporate, or content publication).`
    },
    'batch-06-legacy-site-migration': {
      gate: 'Gate 0 (Batch 06)',
      name: 'Legacy Site Migration & 301 Redirect Strategy Confirmation',
      subject: `[${projectName}] Milestone Review: Legacy Content Carry-Forward & 301 Redirect Plan Approved`,
      action: 'Confirm legacy content to carry forward, assets to preserve, and SEO redirect mappings.',
      deliverable: 'client-context/answers/batch-06-legacy-site-migration/answers.md',
      summary: `We have audited your legacy website archive, mapped URLs for 301 redirect preservation, and categorized legacy media assets for carry-forward.`
    },
    'batch-07-seo-analytics-governance': {
      gate: 'Gate 0 (Batch 07)',
      name: 'SEO Target Keywords, Analytics & Governance Confirmation',
      subject: `[${projectName}] Milestone Review: SEO Target Keywords & Analytics Governance Approved`,
      action: 'Confirm primary target search queries, analytics measurement platforms, and compliance governance.',
      deliverable: 'client-context/answers/batch-07-seo-analytics-governance/answers.md',
      summary: `We have defined your target search queries, geographic intent, tracking tool integrations, and legal/compliance governance policies.`
    },
    'batch-08-open-questions': {
      gate: 'Discovery & Refinement',
      name: 'Client Open Questions (20 Unanswered Questions Batch)',
      subject: `[${projectName}] Action Requested: Please Review & Answer These Open Questions`,
      action: 'Please reply directly to this email with your answers or notes for these questions.',
      deliverable: 'client-context/open-questions.md',
      summary: getOpenQuestionsSummary(root)
    }
  };

  return templates[canonical] || templates['batch-01-core-identity'];
}

function getBatchQuestionnaireTemplate(batchKey, context) {
  const { projectName, projectRoot } = context;
  const canonical = BATCH_MAP[String(batchKey).toLowerCase().trim()] || 'batch-01-core-identity';
  const root = projectRoot || process.cwd();

  const templates = {
    'batch-01-core-identity': {
      gate: 'Gate 0 (Batch 01)',
      name: 'Batch 01: Core Identity, Project Slug & Scope Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 01 Discovery Questions (Core Identity & Scope)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-01-core-identity/questionnaire.md',
      summary:
`Please review and answer the Batch 01 discovery questions below so we can establish your project identity and technical scope:

Q1a (Business & Brand Name): What is the official name of your business or organization as it should appear across the website?
Q1b (Technical Project Name / Slug): What is the technical project name / slug for this build? (Lowercase alphanumeric and hyphens only; defaults to current directory name).
Q2 (Core Offering & Value Proposition): What does your business do, and what is your primary product or service offering in 1–2 sentences?
Q3 (Target Audience & Visitor Intent): Who is your ideal customer or visitor (demographics, profession, problem they want to solve when landing on the site)?
Q4 (Primary Conversion Action): What is the single #1 action you want a visitor to take on the site (e.g. Book a Discovery Call, Buy a Product, View Work, Submit an Inquiry)?
Q5 (Website Type): What type of website are we building? (1: Business/Corporate, 2: E-commerce, 3: Blog/Publication, 4: Portfolio, 5: Booking/Service, 6: Web App/SaaS, 7: Redesign/Migration)
Q6 (Build Origin): Are we building this website from scratch, or redesigning/migrating an existing website?
Q7 (CMS Operational Mode): Will this website use the NWW CMS for dynamic blog publishing and lead form handling (cms), or is it a 100% static Markdown site (none)?
Q8 (Timeline & Target Launch Date): What is your target launch date, and are there any hard deadlines?

Your answers will directly shape the technical architecture, branding, and page specifications. Simply reply to this email with your answers.`
    },
    'batch-02-branding-motion': {
      gate: 'Gate 0 (Batch 02)',
      name: 'Batch 02: Branding, Design Direction & Motion Tier Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 02 Discovery Questions (Branding & Motion)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-02-branding-motion/questionnaire.md',
      summary:
`Please review and answer the Batch 02 discovery questions below so we can establish your visual direction and motion tier:

Q9 (Brand Vectors & Logo Assets): Do you have vector logo files (SVG, AI, EPS) in full-color, monochrome dark, and reversed light-on-dark variants (yes-all / partial / none-create)?
Q10 (Brand Palette & Color Tokens): Do you have established brand colors (hex codes for Primary, Secondary, Accent, Background), or should the agency curate a cohesive modern palette?
Q11 (Typography Selection): Do you have licensed brand fonts, or should we select high-quality Google Fonts (e.g. Plus Jakarta Sans + Inter)?
Q12 (Brand Personality Scale): Where does your brand sit across these 1-to-5 spectrums: Minimal ↔ Maximal, Corporate ↔ Playful, Luxury ↔ Accessible, Modern ↔ Classic?
Q13a (Liked Design References & Principles): Please share 2–3 live website URLs you admire, and what specific design principles you like on each.
Q13b (Reference Anti-Patterns to Avoid): Is there anything specific you dislike, find confusing, or want to strictly avoid?
Q13c (Gate 2 Variation Count): How many distinct landing page variations would you like to review at Gate 2 (2, 3, or 4)?
Q13d (Reference Adherence Mode): Should variations use "principles-only" (extract abstract principles; 100% original layout) or "loose-inspiration"?
Q14 (Disliked Websites): Share 1–2 website URLs whose overall design or aesthetic vibe you dislike, and explain why.
Q15 (GSAP Animation Tier): What level of motion should be implemented (disabled, low, medium, high, max, ultra)?

Your answers will directly drive the visual design and variation generation at Gate 2. Simply reply to this email with your answers.`
    },
    'batch-03-sitemap-copy': {
      gate: 'Gate 0 (Batch 03)',
      name: 'Batch 03: Sitemap, Navigation & Copywriting Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 03 Discovery Questions (Sitemap & Copywriting)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-03-sitemap-copy/questionnaire.md',
      summary:
`Please review and answer the Batch 03 discovery questions below so we can map your page routes and content strategy:

Q16 (Core Page Inventory & Sitemap): Which pages do you need at launch (e.g. Home, About, Services, Projects, Blog, Contact, Privacy, Terms)?
Q17 (Key Page Section Needs): Are there specific interactive sections or modules required on key pages (e.g. pricing table, filter grid, FAQ accordion)?
Q18 (Copywriting Ownership Strategy): Which copywriting strategy should we use: "agency-draft" (complete verbatim copy by agency), "client-ready" (supplied by client), or "hybrid"?
Q19 (Brand Voice, Tone & Prohibited Vocabulary): How should your brand speak (authoritative, friendly, direct)? Are there specific buzzwords or clichés to avoid?
Q20 (Navigation Structure): What specific navigation links, action buttons, social profile icons, or legal links must appear in the header and footer?
Q21 (Lead Capture & Forms): What forms do you require on the website (e.g. Contact inquiry, Request a Quote, Book a Demo)?

Your answers will directly govern the sitemap in Stage 3 and verbatim page copy in Stage 5. Simply reply to this email with your answers.`
    },
    'batch-04-asset-harvesting-generation': {
      gate: 'Gate 0 (Batch 04)',
      name: 'Batch 04: Visual Asset Harvesting & Generation Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 04 Discovery Questions (Visual Assets)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-04-asset-harvesting-generation/questionnaire.md',
      summary:
`Please review and answer the Batch 04 discovery questions below so we can audit and prepare all required visual assets:

Q22a (Legacy Asset Harvesting & Reuse): Which specific assets from your previous site are approved to carry forward (reuse-all-high-res, selective-reuse, fresh-assets-only)?
Q22b (Retina Resolution Audit): Do you have original high-resolution master files, or should the agency audit and upscale/replace sub-1200px images?
Q22c (Obsolete Assets): Are there specific assets from the old site that are obsolete, discontinued, or strictly forbidden?
Q23 (Per-Entity Asset Inventory): For each product, project, service, or team member, do you have dedicated high-resolution photography, screenshots, or mockups?
Q24a (Primary Imagery Strategy): What is the overarching imagery sourcing strategy (client-photos, stock-licensed, hybrid, photoshoot-planned)?
Q24b (Stock Photography Authorization & Attribution): Do you authorize licensed stock photography (Unsplash, Pexels, Pixabay) with attribution on a /credits page?
Q24c (Stock Image Ceiling Count): What is the maximum stock image count ceiling for this project (default: 20)?
Q24d (Custom Graphics & Icons): How should technical graphics, icons, and textures be generated (lucide-icons, bespoke-vectors, ai-generation)?

Your answers will compile the master visual asset manifest. Simply reply to this email with your answers.`
    },
    'batch-05-type-specific-routing': {
      gate: 'Gate 0 (Batch 05)',
      name: 'Batch 05: Type-Specific Architecture Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 05 Discovery Questions (Archetype Deep-Dive)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-05-type-specific-routing/questionnaire.md',
      summary:
`Please review and answer the specialized archetype questions below for your website:

Portfolio / Case Study Deep-Dive:
- Q25-PF1 (Case Study Count & Showcase Priority): How many projects or case studies will be featured at launch, and what are the titles/clients of your top 3 flagship works?
- Q25-PF2 (Case Study Structure & Presentation Depth): How in-depth should each project page be ("visual-gallery" or "in-depth-case-study")?
- Q25-PF3 (Visual Deliverables & Media Formats): What visual media formats are available for each project (mockups, video embeds, before/after sliders)?
- Q25-PF4 (Bio, Credentials & Inquiries): What should be featured on the About / Creator page (creator bio, client logos, awards, inquiry form)?

Your answers will shape the specialized project and case study architecture. Simply reply to this email with your answers.`
    },
    'batch-06-legacy-site-migration': {
      gate: 'Gate 0 (Batch 06)',
      name: 'Batch 06: Legacy Site Migration Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 06 Discovery Questions (Legacy Migration)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-06-legacy-site-migration/questionnaire.md',
      summary:
`Please review and answer the legacy website migration questions below so we can preserve your SEO equity and content continuity:

Q26a (Legacy Page Disposition & Route Action): Reviewing the pages on your legacy site, what is the disposition for each (carry-verbatim, rewrite-modernize, merge-consolidate, retire-delete)?
Q26b (Content Carry-Forward Deep Dive): Which specific text, mission stories, project descriptions, testimonials, and legal policies should transfer?
Q26c (High-Equity SEO URLs & 301 Redirects): Are there specific legacy URLs that receive organic search traffic and must have 1-to-1 301 redirects?
Q26d (Legacy Media & Downloadable PDFs): Are there downloadable whitepapers, PDFs, or forms that must remain accessible?
Q26e (Content Freeze & Cutover Timeline): When will content updates on the old website be frozen?

Your answers will build the 301 redirect map and content migration plan. Simply reply to this email with your answers.`
    },
    'batch-07-seo-analytics-governance': {
      gate: 'Gate 0 (Batch 07)',
      name: 'Batch 07: SEO, Analytics & Governance Questionnaire',
      subject: `[${projectName}] Action Requested: Please Answer Batch 07 Discovery Questions (SEO & Governance)`,
      action: 'Please reply directly to this email with your answers to the questions below.',
      deliverable: 'skills/create-nww-website/references/gate-0-intake/batch-07-seo-analytics-governance/questionnaire.md',
      summary:
`Please review and answer the SEO, analytics, and governance questions below:

Q27 (Search Queries & Target Keywords): What 5–10 searches, queries, or topics do you most want this website to rank for on Google?
Q28 (Geographic Market Focus): What is your primary geographic market (local-regional, national, global-online)?
Q29 (Top Competitors in Search): Who are your top 2–3 competitors in organic search results?
Q30 (Production Domain & Canonical URL): What is the official production domain or primary URL for the site (e.g. https://example.com)?
Q31 (Analytics & Measurement ID): Will you provide a Google Analytics 4 (GA4) Measurement ID under NEXT_PUBLIC_GA_ID?
Q32 (Legal Entity Details): What is your official registered legal entity name, jurisdiction/country, and contact email/address for Privacy Policy and Terms pages?
Q33 (Primary Language & Regional Locales): What is the primary language and locale (default: en-US)?
Q34a (Client Review Deployment Format): Confirm public review deployments (GitHub Pages for Gate 2 variations, Vercel for Next.js preview/staging; zero localhost client forwarding).
Q34b (Codebase Destination Folder): Confirm the directory at the project root for the Next.js codebase (default: site/).
Q34c (Technical Defaults if Unset): Confirm language (javascript/typescript) and package manager (pnpm/npm).
Q35 (Sole Sign-Off Approver): Who is the sole point of contact and final approver for pipeline gates?

Your answers will configure the environment contract, legal documentation, and review pipeline. Simply reply to this email with your answers.`
    },
    'batch-08-open-questions': {
      gate: 'Discovery & Refinement',
      name: 'Client Open Questions (20 Unanswered Questions Batch)',
      subject: `[${projectName}] Action Requested: Please Review & Answer These Open Questions`,
      action: 'Please reply directly to this email with your answers or notes for these questions.',
      deliverable: 'client-context/open-questions.md',
      summary: getOpenQuestionsSummary(root)
    }
  };

  return templates[canonical] || templates['batch-01-core-identity'];
}

function resolveTemplate(flags, stage, context) {
  const isQuestionType = flags.type === 'questions' || flags.type === 'question' || Boolean(flags.questions) || Boolean(flags.question);

  if (flags.batch) {
    const isBatch8 = flags.batch === '8' || flags.batch === '08' || flags.batch === 'batch-08' || flags.batch === 'questions' || flags.batch === 'open-questions';
    if (isBatch8) {
      return getBatchQuestionnaireTemplate('batch-08-open-questions', context);
    }
    if (isQuestionType) {
      return getBatchQuestionnaireTemplate(flags.batch, context);
    }
    return getBatchTemplate(flags.batch, context);
  }

  if (isQuestionType) {
    return getBatchQuestionnaireTemplate('batch-08-open-questions', context);
  }

  return getStageTemplate(stage, context);
}

function buildEmailDraft(template, context) {
  const { clientName, reviewUrl } = context;

  const urlText = reviewUrl
    ? `\n\nReview Portal Link:\n${reviewUrl}\n`
    : `\n\nDeliverable Reference:\n${template.deliverable}\n`;

  const bodyText =
`Hi ${clientName},

${template.summary}
${urlText}
Action Requested:
${template.action}

To provide your approval or feedback, simply reply to this email.

Best regards,
Next Web Works
`;

  return {
    subject: template.subject,
    text: bodyText
  };
}

module.exports = {
  getStageTemplate,
  BATCH_DEFINITIONS,
  BATCH_MAP,
  getOpenQuestionsSummary,
  getBatchTemplate,
  getBatchQuestionnaireTemplate,
  resolveTemplate,
  buildEmailDraft
};

