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
 *   --batch=<1-8>        Gate 0 batch number or slug (1-7 for milestone confirmations, 8 for open questions)
 *   --questions          On-demand flag to draft or send email with the 20 open questions from open-questions.md
 *   --open               Automatically open the local HTML email dispatcher portal in default browser
 *   --gate=<name>        Gate identifier (auto-detected if omitted)
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

  const isQuestionsMode = Boolean(flags.questions) || flags.batch === '8' || flags.batch === 'questions' || flags.batch === 'open-questions';
  const batchFlag = isQuestionsMode ? 'batch-08-open-questions' : flags.batch;
  const template = batchFlag ? getBatchTemplate(batchFlag, context) : getStageTemplate(stage, context);
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

  if (flags.open) {
    try {
      if (process.platform === 'win32') {
        require('node:child_process').exec(`powershell -command "Start-Process '${htmlPortalPath}'"`);
      } else if (process.platform === 'darwin') {
        require('node:child_process').exec(`open "${htmlPortalPath}"`);
      } else {
        require('node:child_process').exec(`xdg-open "${htmlPortalPath}"`);
      }
    } catch (e) {}
  }

  if (flags['dry-run']) {
    console.log('\n[Dry-Run Mode Active] Email was NOT sent.');
    console.log(`Clickable Dispatcher Portal (opens in browser with 1-click mail button):\n${fileUrl}`);
    console.log(`Direct Mailto URI:\n${mailtoUrl}\n`);
    process.exit(0);
  }

  // Check available provider
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || 'updates@nextwebworks.in';

  let sendMethod = 'mailto';
  if (resendApiKey && recipient) {
    sendMethod = 'resend';
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
