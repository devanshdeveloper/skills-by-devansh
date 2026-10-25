#!/usr/bin/env node

/**
 * Client Milestone Notification Engine for NWW Website Generator
 *
 * Sends or drafts stage-by-stage milestone review and approval emails to the client.
 * Enforces explicit human approval before dispatching any email.
 *
 * Usage:
 *   node scripts/client-notify/index.js [projectRoot] [options]
 *
 * Options:
 *   --stage=<0-8>        Stage number (auto-detected from router-state.md if omitted)
 *   --batch=<1-8>        Gate 0 batch number or slug (1-7 for batches, 8 for open questions)
 *   --type=<questions|approval> Mode of email: 'questions' to send batch intake questionnaire, 'approval' (default) for milestone review
 *   --questions          On-demand flag to draft or send email with questions (20 open questions if batch omitted, or batch-specific questionnaire)
 *   --open               Automatically open the local HTML email dispatcher in browser (Default: true in mailto mode)
 *   --no-open            Disable automatic browser launch
 *   --to=<email>         Client email address (parsed from batch answers or prompt)
 *   --client=<name>      Client name (parsed from batch-01 answers or prompt)
 *   --link=<url>         Review URL (auto-detected from GitHub Pages / local portal)
 *   --confirm            Grant approval to send (otherwise prompts interactively)
 *   --dry-run            Only display the draft without prompting or sending
 *   --provider=<type>    resend | sendgrid | smtp | mailto (default: auto-detect)
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const readline = require('node:readline');

const args = process.argv.slice(2);
const positionalArgs = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.join('=') || true];
  })
);

const projectRoot = positionalArgs[0] ? path.resolve(positionalArgs[0]) : process.cwd();
const projDocs = path.join(projectRoot, 'project-docs');

function parseRouterState() {
  const routerPath = path.join(projDocs, 'router-state.md');
  if (!fs.existsSync(routerPath)) return { stage: 2, gate: 'Gate 2', status: 'In Review', projectName: 'Website Project' };
  const content = fs.readFileSync(routerPath, 'utf-8');

  const stageMatch = content.match(/Current Stage:[\s*_]*Stage\s*(\d+)/i);
  const gateMatch = content.match(/Gate Status:[\s*_]*([^(\n]+)/i);
  const projectMatch = content.match(/Project:[\s*_]*([^\n]+)/i);

  // Check for live URL (prioritize GitHub Pages review URL over CMS backend)
  const ghPagesMatch = content.match(/https?:\/\/[a-zA-Z0-9.-]+\.github\.io[^\s)\],`"*<>]*/i);
  const fallbackUrlMatch = content.match(/https?:\/\/[^\s)\],`"*<>]+/i);
  const urlMatch = ghPagesMatch || fallbackUrlMatch;

  return {
    stage: stageMatch ? parseInt(stageMatch[1], 10) : 2,
    gate: gateMatch ? gateMatch[1].trim() : 'Gate 2',
    projectName: projectMatch ? projectMatch[1].replace(/[*_]/g, '').trim() : 'Website Project',
    liveUrl: urlMatch ? urlMatch[0] : null
  };
}

function parseClientDetails() {
  const batch01Path = path.join(projectRoot, 'client-context', 'answers', 'batch-01-core-identity', 'answers.md');
  const batch07Path = path.join(projectRoot, 'client-context', 'answers', 'batch-07-seo-analytics-governance', 'answers.md');
  let content = '';
  if (fs.existsSync(batch01Path)) content += fs.readFileSync(batch01Path, 'utf-8') + '\n';
  if (fs.existsSync(batch07Path)) content += fs.readFileSync(batch07Path, 'utf-8');

  if (!content) {
    return { name: 'Client', email: '', company: '' };
  }

  const nameMatch = content.match(/Client Name:\s*([^\n]+)/i) ||
                    content.match(/Project Name:\s*([^\n—\-]+)/i);
  const emailMatch = content.match(/(?:Email|Contact Email):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

  const rawName = nameMatch ? nameMatch[1].replace(/[*_]/g, '').trim() : 'Client';

  return {
    name: rawName,
    email: emailMatch ? emailMatch[1].trim() : '',
    company: ''
  };
}

function getGate2OptionsSummary(projRoot) {
  try {
    const gate2Dir = path.join(projRoot, 'project-docs', 'client-review', 'gate-2-design-theory');
    if (fs.existsSync(gate2Dir)) {
      const dirs = fs.readdirSync(gate2Dir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
        .map(d => d.name);
      if (dirs.length > 0) {
        const conceptList = dirs.map(dir => {
          const htmlPath = path.join(gate2Dir, dir, 'index.html');
          let title = dir;
          let desc = '';
          let order = 999;
          if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf-8');
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            const leadMatch = html.match(/<p class="lead">([^<]+)<\/p>/i);
            const rawTitle = titleMatch ? titleMatch[1].trim() : (h1Match ? h1Match[1].trim() : dir);
            title = rawTitle;
            if (leadMatch) desc = ` (${leadMatch[1].trim().replace(/\.$/, '')})`;
            const numMatch = rawTitle.match(/(?:concept|option)[-\s]*(\d+)/i) || dir.match(/(?:concept|option)[-\s]*(\d+)/i);
            if (numMatch) order = parseInt(numMatch[1], 10);
          }
          return { title, desc, order, dir };
        });

        conceptList.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.dir.localeCompare(b.dir);
        });

        return conceptList.map(c => `  • ${c.title}${c.desc}`).join('\n');
      }
    }
  } catch (_) {}

  return `  • Variation 1: The Modernist Architect (Grounded asymmetric grid and bold editorial headlines)\n` +
         `  • Variation 2: The Technical Minimalist (High-density clean structure and focused conversion cues)\n` +
         `  • Variation 3: The Editorial Storyteller (Warm tactile palette, serif display, and progressive narrative arc)`;
}

function getStageTemplate(stage, context) {
  const { projectName, clientName, reviewUrl } = context;

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
               `${getGate2OptionsSummary(projectRoot)}\n\n` +
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
      name: 'Final Verification & Handover',
      subject: `[${projectName}] Final Milestone: Production Verification & Handover`,
      action: 'Complete final sign-off, verify live production deployment, and receive handover assets.',
      deliverable: 'project-docs/client-review/gate-8-final-verification/structure-audit.md & Production URL',
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

const BATCH_MAP = {
  '1': 'batch-01-core-identity',
  '01': 'batch-01-core-identity',
  'batch-01': 'batch-01-core-identity',
  'batch-01-core-identity': 'batch-01-core-identity',
  '2': 'batch-02-branding-motion',
  '02': 'batch-02-branding-motion',
  'batch-02': 'batch-02-branding-motion',
  'batch-02-branding-motion': 'batch-02-branding-motion',
  '3': 'batch-03-sitemap-copy',
  '03': 'batch-03-sitemap-copy',
  'batch-03': 'batch-03-sitemap-copy',
  'batch-03-sitemap-copy': 'batch-03-sitemap-copy',
  '4': 'batch-04-asset-harvesting-generation',
  '04': 'batch-04-asset-harvesting-generation',
  'batch-04': 'batch-04-asset-harvesting-generation',
  'batch-04-asset-harvesting-generation': 'batch-04-asset-harvesting-generation',
  '5': 'batch-05-type-specific-routing',
  '05': 'batch-05-type-specific-routing',
  'batch-05': 'batch-05-type-specific-routing',
  'batch-05-type-specific-routing': 'batch-05-type-specific-routing',
  '6': 'batch-06-legacy-site-migration',
  '06': 'batch-06-legacy-site-migration',
  'batch-06': 'batch-06-legacy-site-migration',
  'batch-06-legacy-site-migration': 'batch-06-legacy-site-migration',
  '7': 'batch-07-seo-analytics-governance',
  '07': 'batch-07-seo-analytics-governance',
  'batch-07': 'batch-07-seo-analytics-governance',
  'batch-07-seo-analytics-governance': 'batch-07-seo-analytics-governance',
  '8': 'batch-08-open-questions',
  '08': 'batch-08-open-questions',
  'batch-08': 'batch-08-open-questions',
  'batch-08-open-questions': 'batch-08-open-questions',
  'questions': 'batch-08-open-questions',
  'open-questions': 'batch-08-open-questions'
};

function getOpenQuestionsSummary(projRoot) {
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
  const { projectName } = context;
  const canonical = BATCH_MAP[String(batchKey).toLowerCase().trim()] || 'batch-01-core-identity';

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
      summary: getOpenQuestionsSummary(projectRoot)
    }
  };

  return templates[canonical] || templates['batch-01-core-identity'];
}

function getBatchQuestionnaireTemplate(batchKey, context) {
  const { projectName } = context;
  const canonical = BATCH_MAP[String(batchKey).toLowerCase().trim()] || 'batch-01-core-identity';

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
Q1b (Technical Project Name / Slug): What is the technical project name / slug for this build? (Lowercase alphanumeric and hyphens only, e.g. minit-charger, devanshkhetwani).
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
      summary: getOpenQuestionsSummary(context.projectRoot || process.cwd())
    }
  };

  return templates[canonical] || templates['batch-01-core-identity'];
}

function buildEmailDraft(template, context) {
  const { projectName, clientName, reviewUrl } = context;

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

function writeMailtoPortal(projRoot, recipient, subject, bodyText) {
  const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const outDir = path.join(projRoot, 'client-context');
  if (!fs.existsSync(outDir)) {
    try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
  }
  const htmlPath = path.join(outDir, 'send-email.html');
  const escapeHtml = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Send Email: ${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 24px; background: #0f172a; color: #f8fafc; line-height: 1.6; }
    .card { background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; font-size: 22px; color: #38bdf8; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 12px; margin-bottom: 24px; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #0369a1; }
    .meta { background: #0f172a; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #334155; font-size: 14px; }
    .copy-box { background: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; margin: 12px 0; max-height: 380px; overflow-y: auto; color: #cbd5e1; }
    .copy-btn { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
    .copy-btn:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Milestone Email Dispatcher</h1>
    <div class="meta">
      <div><strong>To:</strong> ${escapeHtml(recipient || '[Recipient Email Needed]')}</div>
      <div style="margin-top: 6px;"><strong>Subject:</strong> ${escapeHtml(subject)}</div>
    </div>
    <a class="btn" href="${mailtoUrl}">Open in Desktop Mail App (Outlook / Mail)</a>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; color: #94a3b8; font-size: 14px;">Webmail Quick Copy (Gmail / Outlook Web):</h3>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('body-text').innerText); this.innerText='Copied to Clipboard!'; setTimeout(() => this.innerText='Copy Email Body', 2000);">Copy Email Body</button>
    </div>
    <div id="body-text" class="copy-box">${escapeHtml(bodyText)}</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf-8');
  return htmlPath;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function sendViaResend(apiKey, from, to, subject, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from,
      to: [to],
      subject,
      text
    });

    const req = https.request({
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Resend API returned ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function recordNotificationInRouterState(stage, gate, recipient, subject) {
  const routerPath = path.join(projDocs, 'router-state.md');
  if (!fs.existsSync(routerPath)) return;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const logEntry = `\n- **${timestamp}** — Sent milestone notification for **${gate}** to \`${recipient}\`: *"${subject}"*`;

  let content = fs.readFileSync(routerPath, 'utf-8');
  if (content.includes('## Client Notifications Log')) {
    content = content.replace(/(## Client Notifications Log[\s\S]*?)(\n##|$)/, `$1${logEntry}$2`);
  } else {
    content += `\n\n## Client Notifications Log\n${logEntry}\n`;
  }

  fs.writeFileSync(routerPath, content, 'utf-8');
  console.log(`✓ Notification logged to router-state.md`);
}

async function run() {
  console.log('=================================================================');
  console.log('  NWW CLIENT MILESTONE NOTIFICATION ENGINE');
  console.log('=================================================================');

  const routerInfo = parseRouterState();
  const clientInfo = parseClientDetails();

  const stage = flags.stage !== undefined ? parseInt(flags.stage, 10) : routerInfo.stage;
  const clientName = flags.client || clientInfo.name;
  let recipient = flags.to || clientInfo.email;
  const reviewUrl = flags.link || routerInfo.liveUrl || null;
  if (reviewUrl && (reviewUrl.includes('localhost') || reviewUrl.includes('127.0.0.1'))) {
    console.warn('\n[WARNING] Review URL points to localhost/127.0.0.1. Clients cannot access localhost!');
    console.warn('Deploy variations or showcases to a public URL (e.g. GitHub Pages preview) before sending to client.\n');
  }

  const context = {
    projectName: flags.project || routerInfo.projectName || 'Website Project',
    clientName,
    reviewUrl
  };

  const isQuestionType = flags.type === 'questions' || flags.type === 'question' || Boolean(flags.questions) || Boolean(flags.question);

  let template;
  if (flags.batch) {
    const isBatch8 = flags.batch === '8' || flags.batch === '08' || flags.batch === 'batch-08' || flags.batch === 'questions' || flags.batch === 'open-questions';
    if (isBatch8) {
      template = getBatchQuestionnaireTemplate('batch-08-open-questions', context);
    } else if (isQuestionType) {
      template = getBatchQuestionnaireTemplate(flags.batch, context);
    } else {
      template = getBatchTemplate(flags.batch, context);
    }
  } else if (isQuestionType) {
    template = getBatchQuestionnaireTemplate('batch-08-open-questions', context);
  } else {
    template = getStageTemplate(stage, context);
  }
  const draft = buildEmailDraft(template, context);

  // If no recipient found, ask interactively
  if (!recipient && !flags['dry-run']) {
    recipient = await promptUser(`Enter client email recipient (or press Enter to view mailto preview): `);
  }

  console.log(`\n-----------------------------------------------------------------`);
  console.log(`  Target Stage: Stage ${stage} (${template.gate}: ${template.name})`);
  console.log(`  Recipient:    ${recipient || '[Not configured — mailto mode]'}`);
  console.log(`  Subject:      ${draft.subject}`);
  console.log(`-----------------------------------------------------------------`);
  console.log(`\nEmail Body Preview:\n`);
  console.log(draft.text);
  console.log(`-----------------------------------------------------------------`);

  // Generate mailto link and local HTML portal
  const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.text)}`;
  const htmlPortalPath = writeMailtoPortal(projectRoot, recipient, draft.subject, draft.text);
  const fileUrl = `file:///${htmlPortalPath.replace(/\\/g, '/')}`;

  // Check available provider
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || 'updates@nextwebworks.in';

  let sendMethod = 'mailto';
  if (resendApiKey && recipient) {
    sendMethod = 'resend';
  }

  // Automatic browser launch for desktop mail mode (Method 2)
  const shouldOpenBrowser = flags['no-open'] ? false : (Boolean(flags.open) || sendMethod === 'mailto');
  if (shouldOpenBrowser && (!flags['dry-run'] || flags.open)) {
    try {
      if (process.platform === 'win32') {
        require('node:child_process').exec(`powershell -command "Start-Process '${htmlPortalPath}'"`);
      } else if (process.platform === 'darwin') {
        require('node:child_process').exec(`open "${htmlPortalPath}"`);
      } else {
        require('node:child_process').exec(`xdg-open "${htmlPortalPath}"`);
      }
      console.log(`\n✓ Automatically opened email dispatcher in your default browser.`);
    } catch (e) {}
  }

  if (flags['dry-run']) {
    console.log('\n[Dry-Run Mode Active] Email was NOT sent.');
    console.log(`Clickable Dispatcher Portal (opens in browser with 1-click mail button):\n${fileUrl}`);
    console.log(`Direct Mailto URI:\n${mailtoUrl}\n`);
    process.exit(0);
  }

  console.log(`\nDelivery Method: ${sendMethod === 'resend' ? 'Direct API (Resend)' : 'Desktop Mail Client (mailto link)'}`);

  // Strict Approval Protocol: Always confirm before sending
  let approved = Boolean(flags.confirm);
  if (!approved) {
    const answer = await promptUser(`\nApprove sending this milestone email to ${recipient || 'client'}? [yes/N]: `);
    approved = answer.toLowerCase() === 'yes';
  }

  if (!approved) {
    console.log('\nEmail sending aborted by user. Zero emails dispatched.');
    console.log(`Clickable Dispatcher Portal:\n${fileUrl}`);
    console.log(`Direct Mailto URI:\n${mailtoUrl}\n`);
    process.exit(0);
  }

  // Execution upon explicit approval
  console.log('\n[Approved] Dispatching milestone notification...');
  if (sendMethod === 'resend') {
    try {
      const res = await sendViaResend(resendApiKey, resendFrom, recipient, draft.subject, draft.text);
      console.log(`✓ Email sent successfully via Resend API! ID: ${res.id}`);
      recordNotificationInRouterState(stage, template.gate, recipient, draft.subject);
    } catch (err) {
      console.error(`✗ Failed to send via Resend: ${err.message}`);
      console.log(`Fallback Dispatcher Portal:\n${fileUrl}`);
      console.log(`Fallback Mailto URI:\n${mailtoUrl}\n`);
    }
  } else {
    console.log(`✓ Approval confirmed!`);
    console.log(`Open Dispatcher Portal (recommended):\n${fileUrl}`);
    console.log(`Direct Mailto URI:\n${mailtoUrl}\n`);
    if (recipient) {
      recordNotificationInRouterState(stage, template.gate, recipient, draft.subject);
    }
  }

  console.log('=================================================================');
}

if (require.main === module) {
  run().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { run, getStageTemplate, getBatchTemplate, buildEmailDraft };
