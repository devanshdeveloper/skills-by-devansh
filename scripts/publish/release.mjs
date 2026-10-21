#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runPreflightChecks, inferLatestTag } from './preflight.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function execCmd(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts
  }).trim();
}

async function promptConfirm(question) {
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

function printSummaryTable(results, isFast) {
  const modeHeader = isFast ? 'FAST MODE (Parallel Gates)' : 'THOROUGH MODE (Sequential)';
  console.log(`================================================================================`);
  console.log(`  SKILLS-BY-DEVANSH RELEASE ORCHESTRATOR [${modeHeader}]`);
  console.log(`  Mode: ${results.mode.toUpperCase()} | Target Tag: ${results.targetTag}`);
  console.log(`================================================================================`);
  console.log(`${'GATE'.padEnd(6)} ${'STATUS'.padEnd(8)} ${'CHECK NAME'.padEnd(30)} DETAILS`);
  console.log(`--------------------------------------------------------------------------------`);

  let failureCount = 0;
  for (const [id, gate] of Object.entries(results.gates)) {
    const status = gate.passed ? 'PASS' : 'FAIL';
    if (!gate.passed) failureCount++;
    const nameCol = (gate.name || id).padEnd(30).slice(0, 30);
    console.log(`${id.padEnd(6)} ${status.padEnd(8)} ${nameCol} ${gate.details}`);
  }

  console.log(`--------------------------------------------------------------------------------`);
  const elapsedSec = (results.elapsedMs / 1000).toFixed(2);
  if (results.passed) {
    console.log(`✓ RESULT: ALL ${Object.keys(results.gates).length} GATES PASSED (Wall-clock: ${elapsedSec}s)`);
  } else {
    console.error(`✗ RESULT: ${failureCount} GATE(S) FAILED (Wall-clock: ${elapsedSec}s)`);
  }
}

export async function runRelease(args = process.argv.slice(2)) {
  const isConfirm = args.includes('--confirm') || args.includes('--mode=confirm') || (args.includes('--mode') && args[args.indexOf('--mode') + 1] === 'confirm');
  const isUnattended = args.includes('--unattended') || args.includes('--mode=unattended');
  const isThorough = args.includes('--thorough');
  const tagArg = args.find(a => a.startsWith('--tag='));
  const targetTag = tagArg ? tagArg.split('=')[1] : inferLatestTag(REPO_ROOT);

  const mode = isUnattended ? 'unattended' : isConfirm ? 'confirm' : 'dry-run';
  const isFast = !isThorough;

  // Step 1: Preflight Verification (Fast parallel by default, sequential with --thorough)
  const preflightResults = await runPreflightChecks({
    mode,
    targetTag,
    parallel: isFast,
    repoRoot: REPO_ROOT
  });

  printSummaryTable(preflightResults, isFast);

  if (!preflightResults.passed) {
    console.error(`\n✗ RELEASE BLOCKED: One or more preflight gates failed.`);
    console.error(`  Action required: Fix the failing item(s) listed in the table above and re-run.`);
    process.exit(1);
  }

  // Step 2: Dry Run Mode
  if (mode === 'dry-run') {
    console.log(`\n[Stage 2/4] Dry-Run Mode Active: Zero Changes Applied.`);
    console.log(`  Planned Release Operations:`);
    console.log(`  - Create or confirm git commit on branch 'main'`);
    console.log(`  - Tag release with annotated tag: '${targetTag}'`);
    console.log(`  - Push commit & tag to approved remote origin (fast-forward only)`);
    console.log(`  - Verify remote publication status`);
    console.log(`\n✓ Dry run complete. To execute real release, run:`);
    console.log(`  node scripts/publish/release.mjs --mode confirm --tag=${targetTag}\n`);
    process.exit(0);
  }

  // Read config for confirm/unattended modes
  const config = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'publish.config.json'), 'utf-8'));

  // Step 3: Unattended Mode Guard
  if (mode === 'unattended') {
    if (!config.allowUnattended) {
      console.error(`\n✗ ERROR: Unattended mode is disabled in publish.config.json.`);
      console.error(`  To publish, use interactive confirm mode: --mode confirm.`);
      process.exit(1);
    }
  }

  // Step 4: Interactive Confirmation (Confirm Mode)
  if (mode === 'confirm') {
    console.log(`\n[Stage 2/4] Release Plan & Pre-Push Confirmation`);
    console.log(`  Repository: ${config.expectedOwner}/${config.expectedRepo}`);
    console.log(`  Target Tag: ${targetTag}`);
    console.log(`  Remote URL: ${execCmd('git remote get-url origin') || 'not set'}`);
    console.log(`  Fast-Forward: Strictly enforced (no --force flags)`);

    const answer = await promptConfirm('\nType "yes" to proceed with committing, tagging, and pushing: ');
    if (answer.toLowerCase() !== 'yes') {
      console.log('Release aborted by maintainer. Zero changes pushed.');
      process.exit(0);
    }
  }

  // Step 5: Execution (Commit, Tag, Push)
  console.log(`\n[Stage 3/4] Executing Release Operations...`);
  try {
    // 1. Stage tracked files
    execCmd('git add .');

    // 2. Commit if there are staged changes
    const diffCached = execCmd('git diff --cached --name-only');
    if (diffCached.length > 0) {
      console.log(`  - Committing ${diffCached.split('\n').length} files for release ${targetTag}...`);
      execCmd(`git commit -m "release: ${targetTag}"`);
    } else {
      console.log('  - Working tree already clean and committed.');
    }

    // 3. Create annotated tag
    console.log(`  - Creating annotated tag ${targetTag}...`);
    execCmd(`git tag -a ${targetTag} -m "Release ${targetTag}"`);

    // 4. Push to remote (strictly fast-forward, zero force)
    console.log(`  - Pushing to remote origin ${config.defaultBranch} with tags...`);
    execCmd(`git push origin ${config.defaultBranch} --tags`);

    console.log('✓ Commit and tag successfully pushed to remote.');
  } catch (err) {
    console.error(`\n✗ RELEASE EXECUTION FAILED: ${err.message}`);
    process.exit(1);
  }

  // Step 6: Post-Publish Verification
  console.log(`\n[Stage 4/4] Post-Publish Remote Verification...`);
  try {
    const remoteTags = execCmd('git ls-remote --tags origin');
    if (remoteTags.includes(targetTag)) {
      console.log(`  ✓ Remote verified: Tag '${targetTag}' confirmed present on remote origin.`);
    } else {
      console.warn(`  ! Remote tag check inconclusive; manual verification recommended.`);
    }

    console.log(`\n=================================================================`);
    console.log(`  RELEASE COMPLETE: ${targetTag}`);
    console.log(`  skills.sh Listing URL: ${config.telemetry.skillsShUrl}`);
    console.log(`  Note: skills.sh activates via anonymous install telemetry.`);
    console.log(`=================================================================`);
  } catch (err) {
    console.warn(`  ! Post-publish remote query failed: ${err.message}`);
  }
}

// CLI runner if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runRelease().catch(err => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}
