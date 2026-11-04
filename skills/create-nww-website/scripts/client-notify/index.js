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
 *   --stage=<0-9>        Stage number (auto-detected from router-state.md if omitted)
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

const path = require('node:path');

const {
  parseRouterState,
  parseClientDetails
} = require('./lib/context');

const {
  getStageTemplate,
  getBatchTemplate,
  resolveTemplate,
  buildEmailDraft
} = require('./lib/templates');

const {
  writeMailtoPortal,
  promptUser,
  sendViaResend,
  recordNotificationInRouterState,
  openDispatcherInBrowser
} = require('./lib/dispatch');

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

async function run() {
  console.log('=================================================================');
  console.log('  NWW CLIENT MILESTONE NOTIFICATION ENGINE');
  console.log('=================================================================');

  const routerInfo = parseRouterState(projDocs);
  const clientInfo = parseClientDetails(projectRoot);

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
    reviewUrl,
    projectRoot
  };

  const template = resolveTemplate(flags, stage, context);
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
    openDispatcherInBrowser(htmlPortalPath);
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
      recordNotificationInRouterState(projDocs, stage, template.gate, recipient, draft.subject);
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
      recordNotificationInRouterState(projDocs, stage, template.gate, recipient, draft.subject);
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

module.exports = {
  run,
  getStageTemplate,
  getBatchTemplate,
  buildEmailDraft
};
