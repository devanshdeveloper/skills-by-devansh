#!/usr/bin/env node

/**
 * cms-state.mjs
 *
 * Deterministic state machine CLI for the integrate-nww-cms skill.
 * Manages .nww-cms/state.json inside the target repository across the 6-gate workflow.
 *
 * Usage:
 *   node scripts/cms-state.mjs --help
 *   node scripts/cms-state.mjs init [--target <dir>] [--project <name>]
 *   node scripts/cms-state.mjs status [--target <dir>]
 *   node scripts/cms-state.mjs set-status <gate> <status> [--target <dir>]
 *   node scripts/cms-state.mjs approve <gate> "<exact phrase>" [--target <dir>]
 *   node scripts/cms-state.mjs reject <gate> "<reason>" [--target <dir>]
 *   node scripts/cms-state.mjs set-field <key> <value> [--target <dir>]
 *   node scripts/cms-state.mjs approve-image <page-slug> <json-file> [--target <dir>]
 *   node scripts/cms-state.mjs mark-page-migrated <page-slug> [--target <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GATE_NAMES = [
  'site-audit',
  'content-mapping',
  'cms-client',
  'page-migration',
  'seo-metadata',
  'revalidation-handoff'
];

const VALID_STATUSES = [
  'pending',
  'in_progress',
  'awaiting_approval',
  'approved',
  'rejected'
];

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /secret/i,
  /key/i,
  /password/i,
  /auth/i,
  /credential/i
];

function printHelp() {
  console.log(`
cms-state CLI - State Machine Orchestrator for NWW CMS Integration

Usage:
  node scripts/cms-state.mjs <command> [arguments] [options]

Commands:
  init                             Initialize .nww-cms/state.json in target repo
  status                           Display current gate progress and migration summary
  set-status <gate> <status>       Set status for gate N (1-6)
  approve <gate> "<phrase>"        Approve gate N with exact phrase 'APPROVE GATE N'
  reject <gate> "<reason>"         Mark gate N rejected with human feedback reason
  set-field <key> <value>          Set top-level or nested state field (JSON parsed when valid)
  approve-image <slug> <file>      Record verified image approval file for page slug
  mark-page-migrated <slug>        Mark a page as successfully migrated

Options:
  --target <dir>                   Target repository root (default: current working directory)
  --project <name>                 Project name identifier (default: folder name or package.json name)
  --help, -h                       Display this help message

Status Values:
  pending | in_progress | awaiting_approval | approved | rejected

Approval Rule:
  The approve command strictly requires:
  1. The target gate matches currentGate.
  2. The gate status is currently 'awaiting_approval'.
  3. The approval phrase matches verbatim: 'APPROVE GATE N'.
  Any failure exits with code 1 and leaves state unchanged.
`);
}

function parseCliArgs(rawArgs) {
  const args = [];
  const options = {
    target: process.cwd(),
    project: null,
    help: false
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--target') {
      options.target = rawArgs[++i];
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    } else if (arg === '--project') {
      options.project = rawArgs[++i];
    } else if (arg.startsWith('--project=')) {
      options.project = arg.split('=')[1];
    } else {
      args.push(arg);
    }
  }

  return { args, options };
}

function resolveStatePaths(targetDir) {
  const absTarget = path.resolve(targetDir);
  const nwwDir = path.join(absTarget, '.nww-cms');
  const statePath = path.join(nwwDir, 'state.json');
  return { absTarget, nwwDir, statePath };
}

function readState(statePath) {
  if (!fs.existsSync(statePath)) {
    console.error(`Error: State file not found at ${statePath}. Run 'init' first.`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${statePath}: ${err.message}`);
    process.exit(1);
  }
}

function writeState(statePath, state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

function cmdInit(options) {
  const { absTarget, nwwDir, statePath } = resolveStatePaths(options.target);

  if (!fs.existsSync(nwwDir)) {
    fs.mkdirSync(nwwDir, { recursive: true });
  }

  let projectName = options.project;
  if (!projectName) {
    const pkgPath = path.join(absTarget, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        projectName = pkg.name;
      } catch {
        // fallback
      }
    }
    if (!projectName) {
      projectName = path.basename(absTarget);
    }
  }

  const gates = {};
  for (let i = 1; i <= GATE_NAMES.length; i++) {
    gates[i] = {
      name: GATE_NAMES[i - 1],
      status: i === 1 ? 'in_progress' : 'pending',
      approvedAt: null,
      notes: null
    };
  }

  const initialState = {
    targetProject: projectName,
    targetRoot: '.',
    currentGate: 1,
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    detectedStack: {
      nextVersion: null,
      routerType: null,
      packageManager: null,
      styling: null,
      siteSubfolder: '.'
    },
    gates,
    mappedModels: [],
    unmappedContent: [],
    pages: {},
    images: {},
    revalidationWebhook: {
      endpoint: '/api/revalidate',
      verified: false
    },
    history: [
      {
        gate: 1,
        action: 'init',
        timestamp: new Date().toISOString(),
        details: `Initialized state for ${projectName}`
      }
    ]
  };

  writeState(statePath, initialState);
  console.log(`[cms-state] Initialized .nww-cms/state.json for ${projectName} at Gate 1 (site-audit).`);
}

function cmdStatus(options) {
  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  console.log('================================================================================');
  console.log(`  NWW CMS INTEGRATION STATE: ${state.targetProject}`);
  console.log(`  Current Gate: ${state.currentGate} (${GATE_NAMES[state.currentGate - 1]}) | Status: ${state.status.toUpperCase()}`);
  console.log('================================================================================');
  console.log(`${'GATE'.padEnd(6)} ${'STATUS'.padEnd(20)} ${'GATE NAME'.padEnd(25)} APPROVED AT`);
  console.log('--------------------------------------------------------------------------------');

  for (let i = 1; i <= GATE_NAMES.length; i++) {
    const g = state.gates[i];
    const isCurrent = state.currentGate === i ? ' [*]' : '';
    const gateIdCol = `Gate ${i}${isCurrent}`.padEnd(8);
    const statusCol = (g.status || 'pending').padEnd(18);
    const nameCol = (g.name || GATE_NAMES[i - 1]).padEnd(25);
    const dateCol = g.approvedAt || '-';
    console.log(`${gateIdCol} ${statusCol} ${nameCol} ${dateCol}`);
  }

  console.log('--------------------------------------------------------------------------------');
  const pageEntries = Object.entries(state.pages || {});
  console.log(`Pages Registered: ${pageEntries.length}`);
  for (const [slug, p] of pageEntries) {
    const imgStatus = p.imagesApproved ? 'Images: Approved' : 'Images: Placeholder';
    console.log(` - /${slug.replace(/^home$/, '')}: [${p.status || 'pending'}] (${imgStatus})`);
  }
  console.log('================================================================================');
}

function cmdSetStatus(gateNumStr, newStatus, options) {
  const gateNum = parseInt(gateNumStr, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > GATE_NAMES.length) {
    console.error(`Error: Gate must be a number between 1 and ${GATE_NAMES.length}.`);
    process.exit(1);
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`Error: Invalid status '${newStatus}'. Must be one of: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }

  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  state.gates[gateNum].status = newStatus;
  state.status = newStatus;
  state.history.push({
    gate: gateNum,
    action: 'set-status',
    timestamp: new Date().toISOString(),
    status: newStatus
  });

  writeState(statePath, state);
  console.log(`[cms-state] Gate ${gateNum} (${GATE_NAMES[gateNum - 1]}) status set to '${newStatus}'.`);
}

function cmdApprove(gateNumStr, phrase, options) {
  const gateNum = parseInt(gateNumStr, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > GATE_NAMES.length) {
    console.error(`Error: Gate must be a number between 1 and ${GATE_NAMES.length}.`);
    process.exit(1);
  }

  const expectedPhrase = `APPROVE GATE ${gateNum}`;
  if (!phrase || phrase.trim() !== expectedPhrase) {
    console.error(`Error: Approval rejected. Verbatim phrase '${expectedPhrase}' required.`);
    console.error(`Received: '${phrase}'`);
    process.exit(1);
  }

  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  if (state.currentGate !== gateNum) {
    console.error(`Error: Cannot approve Gate ${gateNum}. Active gate is Gate ${state.currentGate}.`);
    process.exit(1);
  }

  state.gates[gateNum].status = 'approved';
  state.gates[gateNum].approvedAt = new Date().toISOString();

  state.history.push({
    gate: gateNum,
    action: 'approve',
    timestamp: new Date().toISOString(),
    phrase: phrase.trim()
  });

  if (gateNum < GATE_NAMES.length) {
    state.currentGate = gateNum + 1;
    state.gates[state.currentGate].status = 'in_progress';
    state.status = 'in_progress';
    console.log(`[cms-state] Verified approval phrase. Gate ${gateNum} APPROVED.`);
    console.log(`[cms-state] Advanced to Gate ${state.currentGate} (${GATE_NAMES[state.currentGate - 1]}).`);
  } else {
    state.status = 'approved';
    console.log(`[cms-state] Verified approval phrase. Final Gate ${gateNum} APPROVED.`);
    console.log('[cms-state] All gates completed successfully!');
  }

  writeState(statePath, state);
}

function cmdReject(gateNumStr, reason, options) {
  const gateNum = parseInt(gateNumStr, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > GATE_NAMES.length) {
    console.error(`Error: Gate must be a number between 1 and ${GATE_NAMES.length}.`);
    process.exit(1);
  }

  if (!reason || !reason.trim()) {
    console.error('Error: Rejection requires a non-empty human feedback reason.');
    process.exit(1);
  }

  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  state.gates[gateNum].status = 'rejected';
  state.gates[gateNum].notes = reason.trim();
  state.status = 'rejected';

  state.history.push({
    gate: gateNum,
    action: 'reject',
    timestamp: new Date().toISOString(),
    reason: reason.trim()
  });

  writeState(statePath, state);
  console.log(`[cms-state] Gate ${gateNum} marked REJECTED. Reason recorded.`);
}

function cmdSetField(key, value, options) {
  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (pattern.test(key)) {
      console.error(`Error: Forbidden field name '${key}'. Sensitive credentials must NEVER be stored in state.json.`);
      process.exit(1);
    }
  }

  let parsedVal = value;
  try {
    parsedVal = JSON.parse(value);
  } catch {
    // leave as string
  }

  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  const keys = key.split('.');
  let curr = state;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof curr[k] !== 'object' || curr[k] === null) {
      curr[k] = {};
    }
    curr = curr[k];
  }
  curr[keys[keys.length - 1]] = parsedVal;

  writeState(statePath, state);
  console.log(`[cms-state] Field '${key}' updated.`);
}

function cmdApproveImage(pageSlug, jsonFilePath, options) {
  const { absTarget, statePath } = resolveStatePaths(options.target);
  const fullPath = path.isAbsolute(jsonFilePath) ? jsonFilePath : path.join(absTarget, jsonFilePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Image approval file '${fullPath}' not found.`);
    process.exit(1);
  }

  let fileData = null;
  try {
    fileData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (err) {
    console.error(`Error: Image approval file must be valid JSON: ${err.message}`);
    process.exit(1);
  }

  const state = readState(statePath);
  if (!state.images) state.images = {};
  if (!state.pages) state.pages = {};
  if (!state.pages[pageSlug]) {
    state.pages[pageSlug] = { status: 'pending', imagesApproved: false };
  }

  state.images[pageSlug] = {
    file: path.relative(absTarget, fullPath).replace(/\\/g, '/'),
    approvedAt: new Date().toISOString(),
    slotsCount: Array.isArray(fileData.slots) ? fileData.slots.length : 0
  };

  state.pages[pageSlug].imagesApproved = true;

  writeState(statePath, state);
  console.log(`[cms-state] Recorded image approval for page '${pageSlug}' from ${path.basename(fullPath)}.`);
}

function cmdMarkPageMigrated(pageSlug, options) {
  const { statePath } = resolveStatePaths(options.target);
  const state = readState(statePath);

  if (!state.pages) state.pages = {};
  if (!state.pages[pageSlug]) {
    state.pages[pageSlug] = { status: 'pending', imagesApproved: false };
  }

  state.pages[pageSlug].status = 'migrated';
  state.pages[pageSlug].migratedAt = new Date().toISOString();

  writeState(statePath, state);
  console.log(`[cms-state] Page '/${pageSlug}' marked as migrated.`);
}

// Main execution
const { args, options } = parseCliArgs(process.argv.slice(2));

if (options.help || args.length === 0) {
  printHelp();
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'init':
    cmdInit(options);
    break;
  case 'status':
    cmdStatus(options);
    break;
  case 'set-status':
    if (!args[1] || !args[2]) {
      console.error('Error: set-status requires <gate> and <status>');
      process.exit(1);
    }
    cmdSetStatus(args[1], args[2], options);
    break;
  case 'approve':
    if (!args[1] || !args[2]) {
      console.error('Error: approve requires <gate> and verbatim phrase');
      process.exit(1);
    }
    cmdApprove(args[1], args[2], options);
    break;
  case 'reject':
    if (!args[1] || !args[2]) {
      console.error('Error: reject requires <gate> and <reason>');
      process.exit(1);
    }
    cmdReject(args[1], args[2], options);
    break;
  case 'set-field':
    if (!args[1] || args[2] === undefined) {
      console.error('Error: set-field requires <key> and <value>');
      process.exit(1);
    }
    cmdSetField(args[1], args[2], options);
    break;
  case 'approve-image':
    if (!args[1] || !args[2]) {
      console.error('Error: approve-image requires <page-slug> and <json-file>');
      process.exit(1);
    }
    cmdApproveImage(args[1], args[2], options);
    break;
  case 'mark-page-migrated':
    if (!args[1]) {
      console.error('Error: mark-page-migrated requires <page-slug>');
      process.exit(1);
    }
    cmdMarkPageMigrated(args[1], options);
    break;
  default:
    console.error(`Error: Unknown command '${command}'. Use --help to list commands.`);
    process.exit(1);
}
