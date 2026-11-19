#!/usr/bin/env node

/**
 * poc-state.mjs
 *
 * Deterministic state machine CLI for the poc-to-proposal skill.
 * Manages poc/<project>/state.json across the 8-gate workflow.
 *
 * Usage:
 *   node scripts/poc-state.mjs --help
 *   node scripts/poc-state.mjs init <project> [--path <dir>]
 *   node scripts/poc-state.mjs status [--project <name>] [--path <dir>]
 *   node scripts/poc-state.mjs set-status <gate> <status> [--project <name>] [--path <dir>]
 *   node scripts/poc-state.mjs approve <gate> "<exact phrase>" [--project <name>] [--path <dir>]
 *   node scripts/poc-state.mjs reject <gate> "<reason>" [--project <name>] [--path <dir>]
 *   node scripts/poc-state.mjs set-field <key> <value> [--project <name>] [--path <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GATE_NAMES = [
  'freeze-scope',
  'manual-test',
  'complete-and-hosted',
  'landing-page-leads',
  'demo-subdomain',
  'walkthrough',
  'case-study',
  'proposal-pdf'
];

const VALID_STATUSES = [
  'pending',
  'in_progress',
  'awaiting_approval',
  'approved',
  'rejected'
];

const FORBIDDEN_FIELD_PATTERNS = [
  /key/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /auth/i
];

function printHelp() {
  console.log(`
poc-state CLI - State Machine Orchestrator for PoC-to-Proposal

Usage:
  node scripts/poc-state.mjs <command> [arguments] [options]

Commands:
  init <project>                  Initialize poc/<project>/state.json
  status                          Display current state and gate progress
  set-status <gate> <status>      Set status for gate N (1-8)
  approve <gate> "<phrase>"       Approve gate N with exact phrase 'APPROVE GATE N'
  reject <gate> "<reason>"        Mark gate N rejected with human feedback reason
  set-field <key> <value>         Update top-level or nested field in state.json

Options:
  --project <name>                Target project slug (default: auto-detected from poc/*)
  --path <dir>                    Working directory root (default: current working directory)
  --help, -h                      Display this help message

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
    project: null,
    path: process.cwd()
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--project') {
      options.project = rawArgs[++i];
    } else if (arg.startsWith('--project=')) {
      options.project = arg.split('=')[1];
    } else if (arg === '--path') {
      options.path = rawArgs[++i];
    } else if (arg.startsWith('--path=')) {
      options.path = arg.split('=')[1];
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else {
      args.push(arg);
    }
  }

  return { args, options };
}

function resolveStateFilePath(options, projectFromArg = null) {
  const baseDir = path.resolve(options.path || process.cwd());
  const pocRoot = path.join(baseDir, 'poc');

  let project = projectFromArg || options.project;

  if (!project) {
    if (fs.existsSync(pocRoot)) {
      const entries = fs.readdirSync(pocRoot, { withFileTypes: true });
      const projects = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      if (projects.length === 1) {
        project = projects[0];
      } else if (projects.length > 1) {
        console.error(`Multiple PoC projects found in ${pocRoot}: [${projects.join(', ')}]. Specify --project <name>.`);
        process.exit(1);
      }
    }
  }

  if (!project) {
    return {
      baseDir,
      pocRoot,
      project: null,
      stateFile: null
    };
  }

  const projectDir = path.join(pocRoot, project);
  const stateFile = path.join(projectDir, 'state.json');

  return {
    baseDir,
    pocRoot,
    project,
    projectDir,
    stateFile
  };
}

function readState(stateFile) {
  if (!fs.existsSync(stateFile)) {
    console.error(`State file not found at: ${stateFile}`);
    console.error(`Run 'poc-state init <project>' first.`);
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(stateFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse state file: ${err.message}`);
    process.exit(1);
  }
}

function writeState(stateFile, state) {
  const dir = path.dirname(stateFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

function createDefaultState(projectName) {
  const gates = GATE_NAMES.map((name, index) => {
    const n = index + 1;
    return {
      n,
      name,
      status: n === 1 ? 'in_progress' : 'pending',
      approvedAt: null,
      approvalPhrase: null,
      evidencePath: `poc/${projectName}/gate-${n}-${name}/evidence.md`,
      notes: null
    };
  });

  return {
    project: projectName,
    createdAt: new Date().toISOString(),
    currentGate: 1,
    nwwWebsiteRepo: null,
    urls: {
      prod: null,
      demo: null,
      landing: null,
      caseStudy: null,
      video: null,
      proposal: null
    },
    gates
  };
}

function handleInit(projectArg, options) {
  if (!projectArg) {
    console.error('Error: Project name required. Usage: poc-state init <project>');
    process.exit(1);
  }

  const safeProject = projectArg.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const target = resolveStateFilePath(options, safeProject);

  if (fs.existsSync(target.stateFile)) {
    console.log(`State file already exists at: ${target.stateFile}`);
    return;
  }

  const newState = createDefaultState(safeProject);
  writeState(target.stateFile, newState);
  console.log(`✓ Initialized PoC state for '${safeProject}' at ${target.stateFile}`);
  console.log(`  Current Gate: 1 (${GATE_NAMES[0]}) [in_progress]`);
}

function handleStatus(options) {
  const target = resolveStateFilePath(options);
  if (!target.stateFile) {
    console.error('Error: No PoC project specified or detected. Pass --project <name> or initialize one first.');
    process.exit(1);
  }

  const state = readState(target.stateFile);

  console.log('================================================================================');
  console.log(`  PoC PROJECT: ${state.project.toUpperCase()}`);
  console.log(`  Current Gate: Gate ${state.currentGate} (${GATE_NAMES[state.currentGate - 1] || 'complete'})`);
  console.log(`  Created At:   ${state.createdAt}`);
  if (state.nwwWebsiteRepo) {
    console.log(`  NWW Repo:     ${state.nwwWebsiteRepo}`);
  }
  console.log('--------------------------------------------------------------------------------');
  console.log('  URLs:');
  for (const [key, val] of Object.entries(state.urls || {})) {
    console.log(`    ${(key + ':').padEnd(12)} ${val || '(not set)'}`);
  }
  console.log('--------------------------------------------------------------------------------');
  console.log(`${'GATE'.padEnd(6)} ${'NAME'.padEnd(24)} ${'STATUS'.padEnd(20)} NOTES / APPROVAL`);
  console.log('--------------------------------------------------------------------------------');

  for (const g of state.gates) {
    const isCurrent = g.n === state.currentGate ? ' *' : '  ';
    const tag = `G${g.n}${isCurrent}`.padEnd(6);
    const name = g.name.padEnd(24);
    const status = g.status.padEnd(20);
    const extra = g.approvedAt ? `Approved at ${g.approvedAt.slice(0, 19)}` : (g.notes || '');
    console.log(`${tag} ${name} ${status} ${extra}`);
  }
  console.log('================================================================================');
}

function handleSetStatus(gateArg, statusArg, options) {
  const gateNum = parseInt(gateArg, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > 8) {
    console.error(`Error: Gate must be a number between 1 and 8. Got: '${gateArg}'`);
    process.exit(1);
  }

  if (!VALID_STATUSES.includes(statusArg)) {
    console.error(`Error: Invalid status '${statusArg}'. Valid: [${VALID_STATUSES.join(', ')}]`);
    process.exit(1);
  }

  const target = resolveStateFilePath(options);
  const state = readState(target.stateFile);
  const gate = state.gates.find((g) => g.n === gateNum);

  if (!gate) {
    console.error(`Error: Gate ${gateNum} not found in state.`);
    process.exit(1);
  }

  gate.status = statusArg;
  if (statusArg === 'in_progress' || statusArg === 'awaiting_approval') {
    state.currentGate = gateNum;
  }

  writeState(target.stateFile, state);
  console.log(`✓ Set Gate ${gateNum} (${gate.name}) status to: ${statusArg}`);
}

function handleApprove(gateArg, phraseArg, options) {
  const gateNum = parseInt(gateArg, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > 8) {
    console.error(`Error: Gate must be an integer between 1 and 8. Got: '${gateArg}'`);
    process.exit(1);
  }

  const target = resolveStateFilePath(options);
  const state = readState(target.stateFile);

  if (state.currentGate !== gateNum) {
    console.error(`✗ Approval Refused: Target gate (${gateNum}) does not match active currentGate (${state.currentGate}).`);
    console.error(`  Gates must be approved in strict sequential order. Cannot jump or skip gates.`);
    process.exit(1);
  }

  const gate = state.gates.find((g) => g.n === gateNum);
  if (!gate) {
    console.error(`Error: Gate ${gateNum} not found in state.`);
    process.exit(1);
  }

  if (gate.status !== 'awaiting_approval') {
    console.error(`✗ Approval Refused: Gate ${gateNum} is '${gate.status}', not 'awaiting_approval'.`);
    console.error(`  The gate work and evidence.md must be completed before human sign-off.`);
    process.exit(1);
  }

  const expectedPhrase = `APPROVE GATE ${gateNum}`;
  if (phraseArg !== expectedPhrase) {
    console.error(`✗ Approval Refused: Phrase mismatch.`);
    console.error(`  Expected exact verbatim string: "${expectedPhrase}"`);
    console.error(`  Received: "${phraseArg}"`);
    console.error(`  Colloquial phrases like 'looks good', 'approved', or 'proceed' are strictly invalid.`);
    process.exit(1);
  }

  gate.status = 'approved';
  gate.approvedAt = new Date().toISOString();
  gate.approvalPhrase = phraseArg;
  gate.notes = `Approved with '${phraseArg}'`;

  if (gateNum < 8) {
    state.currentGate = gateNum + 1;
    const nextGate = state.gates.find((g) => g.n === gateNum + 1);
    if (nextGate && nextGate.status === 'pending') {
      nextGate.status = 'in_progress';
    }
    console.log(`✓ SUCCESS: Gate ${gateNum} (${gate.name}) approved.`);
    console.log(`  Advanced active gate to Gate ${state.currentGate} (${GATE_NAMES[state.currentGate - 1]}).`);
  } else {
    console.log(`✓ SUCCESS: Final Gate 8 (${gate.name}) approved.`);
    console.log(`  PoC-to-Proposal pipeline 100% complete!`);
  }

  writeState(target.stateFile, state);
}

function handleReject(gateArg, reasonArg, options) {
  const gateNum = parseInt(gateArg, 10);
  if (isNaN(gateNum) || gateNum < 1 || gateNum > 8) {
    console.error(`Error: Gate must be an integer between 1 and 8. Got: '${gateArg}'`);
    process.exit(1);
  }

  if (!reasonArg || reasonArg.trim().length === 0) {
    console.error('Error: Rejection reason required. Usage: poc-state reject <gate> "<reason>"');
    process.exit(1);
  }

  const target = resolveStateFilePath(options);
  const state = readState(target.stateFile);
  const gate = state.gates.find((g) => g.n === gateNum);

  if (!gate) {
    console.error(`Error: Gate ${gateNum} not found in state.`);
    process.exit(1);
  }

  gate.status = 'rejected';
  gate.notes = `Rejection feedback: ${reasonArg.trim()} (at ${new Date().toISOString()})`;
  state.currentGate = gateNum;

  writeState(target.stateFile, state);
  console.log(`! Gate ${gateNum} (${gate.name}) marked rejected.`);
  console.log(`  Feedback logged: "${reasonArg.trim()}"`);
  console.log(`  Current gate remains at Gate ${gateNum} for in-place remediation.`);
}

function handleSetField(keyArg, valueArg, options) {
  if (!keyArg || valueArg === undefined) {
    console.error('Error: Key and value required. Usage: poc-state set-field <key> <value>');
    process.exit(1);
  }

  for (const pattern of FORBIDDEN_FIELD_PATTERNS) {
    if (pattern.test(keyArg)) {
      console.error(`✗ Security Block: Field name '${keyArg}' matches secret pattern (${pattern}).`);
      console.error(`  Never store secrets, passwords, tokens, or credentials in state.json.`);
      process.exit(1);
    }
  }

  const target = resolveStateFilePath(options);
  const state = readState(target.stateFile);

  if (keyArg.startsWith('urls.')) {
    const urlKey = keyArg.slice(5);
    if (!state.urls) state.urls = {};
    state.urls[urlKey] = valueArg;
  } else if (keyArg in state) {
    state[keyArg] = valueArg;
  } else {
    if (!state.metadata) state.metadata = {};
    state.metadata[keyArg] = valueArg;
  }

  writeState(target.stateFile, state);
  console.log(`✓ Set field '${keyArg}' = '${valueArg}'`);
}

function main() {
  const { args, options } = parseCliArgs(process.argv.slice(2));

  if (options.help || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'init':
      handleInit(args[1], options);
      break;
    case 'status':
      handleStatus(options);
      break;
    case 'set-status':
      handleSetStatus(args[1], args[2], options);
      break;
    case 'approve':
      handleApprove(args[1], args[2], options);
      break;
    case 'reject':
      handleReject(args[1], args[2], options);
      break;
    case 'set-field':
      handleSetField(args[1], args[2], options);
      break;
    default:
      console.error(`Error: Unknown command '${command}'. Run 'poc-state --help' for usage.`);
      process.exit(1);
  }
}

main();
