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
 *   --stage=<0-11>       Stage number (auto-detected from router-state.md if omitted)
 *   --gate=<name>        Gate identifier (auto-detected if omitted)
 *   --to=<email>         Client email address (parsed from client-answers.md or prompt)
 *   --client=<name>      Client name (parsed from client-answers.md or prompt)
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
  if (!fs.existsSync(routerPath)) return { stage: 2, gate: 'Gate 2', status: 'In Review' };
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
  const answersPath = path.join(projDocs, 'client-answers.md');
  if (!fs.existsSync(answersPath)) {
    return { name: 'Client', email: '', company: '' };
  }
  const content = fs.readFileSync(answersPath, 'utf-8');

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
      deliverable: 'Project Discovery Brief & Scope Summary',
      summary: `We have codified your discovery answers, branding preferences, reference sites, and CMS scope into the initial Project Brief. Please review the scope details to ensure full alignment before we generate the technical architecture.`
    },
    1: {
      gate: 'Gate 1',
      name: 'Tech Stack Specification',
      subject: `[${projectName}] Milestone Review: Tech Stack & System Architecture`,
      action: 'Review and approve the technology stack, framework conventions, and rendering strategy.',
      deliverable: 'project-docs/tech-stack.md',
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
      deliverable: reviewUrl ? `${reviewUrl} (Sitemap Section)` : 'project-docs/client-review/index.html',
      summary: `We have finalized the complete route hierarchy and master page inventory. Please confirm the pages and URLs before we lock the SEO strategy.`
    },
    4: {
      gate: 'Gate 4',
      name: 'SEO Strategy & Structured Data',
      subject: `[${projectName}] Milestone Review: SEO Keywords & JSON-LD Schemas`,
      action: 'Approve the keyword mapping, meta title/description rules, and structured data.',
      deliverable: 'project-docs/seo-strategy.md',
      summary: `The SEO architecture has been established—covering unique meta tags per route, OpenGraph preview cards, search indexing rules, and rich JSON-LD schemas.`
    },
    5: {
      gate: 'Gate 5',
      name: 'Layout Theory & Section Blueprints',
      subject: `[${projectName}] Milestone Review: Section Layouts & Responsive Blueprints`,
      action: 'Approve the section flow, responsive phone behavior, and content placements in your layout preview hub.',
      deliverable: reviewUrl ? `${reviewUrl}/pages/index.html` : 'project-docs/client-review/pages/index.html',
      summary: `Every page has been deconstructed into visual, responsive section blueprints with defined content capacity and visual hierarchies. Please review the visual layouts in the portal.`
    },
    6: {
      gate: 'Gate 6',
      name: 'Content & Asset Sourcing',
      subject: `[${projectName}] Milestone Review: Production Copy & Imagery Inventory`,
      action: 'Review and approve page copy, technical case studies, and sourced media assets.',
      deliverable: reviewUrl ? `${reviewUrl} (or Client Review Portal)` : 'project-docs/client-review/index.html',
      summary: `All page copy, case studies, technical summaries, and licensed image assets have been assembled and verified against your voice & tone guidelines.`
    },
    7: {
      gate: 'Gate 7',
      name: 'CMS Schema & Seed Data',
      subject: `[${projectName}] Milestone Review: CMS Content Models & Seed Data`,
      action: 'Confirm CMS field schemas, model structures, and webhook endpoints.',
      deliverable: 'project-docs/cms-schema.md',
      summary: `Custom post types, field schemas, and on-demand ISR revalidation endpoints for your CMS backend have been configured and verified.`
    },
    8: {
      gate: 'Gate 8',
      name: 'Page Checklist & Taste Audit',
      subject: `[${projectName}] Milestone Review: Master Static Checklist & Taste Sign-Off`,
      action: 'Approve the final static checklist and design polish before code construction starts.',
      deliverable: 'project-docs/page-checklist.md',
      summary: `Our visual quality checklist is complete. All styling tokens, motion limits, and typography contrasts have been audited.`
    },
    9: {
      gate: 'Gate 9',
      name: 'Foundation Build & Base Shell',
      subject: `[${projectName}] Milestone Review: Core Shell & Component Primitives`,
      action: 'Review the base Next.js shell, responsive navigation, footer, and motion system.',
      deliverable: 'site/ directory & base build preview',
      summary: `The foundational Next.js codebase is operational with responsive navigation, footer shell, optimized assets, and passing build diagnostics.`
    },
    10: {
      gate: 'Gate 10',
      name: 'Page Build Loop & Binary QA',
      subject: `[${projectName}] Milestone Review: Page Build Preview & Acceptance QA`,
      action: 'Preview the interactive pages and provide feedback or sign-off.',
      deliverable: 'site/app routes',
      summary: `The interactive website routes have been constructed with full animations, responsive layouts, and CMS integrations ready for acceptance testing.`
    },
    11: {
      gate: 'Gate 11',
      name: 'Final Verification & Handover',
      subject: `[${projectName}] Final Milestone: Production Verification & Handover`,
      action: 'Complete final sign-off, verify live production deployment, and receive handover assets.',
      deliverable: 'project-docs/structure-audit.md & Production URL',
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

  const context = {
    projectName: routerInfo.projectName,
    clientName,
    reviewUrl
  };

  const template = getStageTemplate(stage, context);
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

  // Generate mailto link
  const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.text)}`;

  if (flags['dry-run']) {
    console.log('\n[Dry-Run Mode Active] Email was NOT sent.');
    console.log(`Clickable Mailto Link (opens default mail app):\n${mailtoUrl}\n`);
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
    console.log(`Clickable Mailto Link to send manually:\n${mailtoUrl}\n`);
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
      console.log(`Fallback Mailto Link:\n${mailtoUrl}\n`);
    }
  } else {
    console.log(`✓ Approval confirmed!`);
    console.log(`Use this direct Mailto Link to dispatch via your desktop mail app:\n${mailtoUrl}\n`);
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

module.exports = { run, getStageTemplate, buildEmailDraft };
