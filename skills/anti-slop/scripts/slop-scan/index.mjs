#!/usr/bin/env node
import path from 'node:path';
import { RuleRegistry } from './registry.mjs';
import { FileScanner } from './scanner.mjs';

// Parses CLI flags: --target=<dir>, --json, --help
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    target: '.',
    json: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--target=')) {
      options.target = arg.slice(9);
    } else if (!arg.startsWith('-')) {
      options.target = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
slop-scan - Modular AST & Pattern Scanner for AI Slop Removal

USAGE:
  node skills/anti-slop/scripts/slop-scan/index.mjs [options] [target-path]

OPTIONS:
  --target=<path>     Target file or directory to scan (default: current directory)
  --json              Output findings as structured JSON
  --help, -h          Show this help message

EXAMPLES:
  node skills/anti-slop/scripts/slop-scan/index.mjs --target=site/src
  node skills/anti-slop/scripts/slop-scan/index.mjs --target=app --json
`);
}

function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const resolvedTarget = path.resolve(process.cwd(), options.target);
  const registry = new RuleRegistry();
  registry.loadProjectConfig(resolvedTarget);

  const scanner = new FileScanner(registry);
  const results = scanner.scan(resolvedTarget);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  }

  // Formatted human-readable output for Plan Mode
  console.log('\n============================================================');
  console.log('              ANTI-SLOP SCANNER - REMOVAL PLAN              ');
  console.log('============================================================\n');
  console.log(`Target Path:   ${results.targetRoot}`);
  console.log(`Files Scanned: ${results.filesScanned}`);
  console.log(`Slop Findings: ${results.totalFindings}\n`);
  console.log(`Category Breakdown:`);
  console.log(`  - Visual Slop:    ${results.summaryByCategory.visual}`);
  console.log(`  - Copy Slop:      ${results.summaryByCategory.copy}`);
  console.log(`  - Structure Slop: ${results.summaryByCategory.structure}`);
  console.log(`  - Code Slop:      ${results.summaryByCategory.code}`);
  if (results.summaryByCategory.custom > 0) {
    console.log(`  - Custom Rules:   ${results.summaryByCategory.custom}`);
  }
  console.log('\n------------------------------------------------------------');
  console.log('CANDIDATE DELETIONS (Awaiting Explicit User Approval):');
  console.log('------------------------------------------------------------');

  if (results.findings.length === 0) {
    console.log('\n✨ Zero AI slop patterns detected! Codebase is clean.');
  } else {
    for (const item of results.findings) {
      const relFile = path.relative(process.cwd(), item.file).replace(/\\/g, '/');
      console.log(`\n[${item.category.toUpperCase()}] ${item.name} (${item.ruleId})`);
      console.log(`  Location: ${relFile}:${item.line}`);
      console.log(`  Match:    "${item.matchText}"`);
      console.log(`  Action:   ${item.action}`);
    }
  }

  console.log('\n============================================================');
  console.log('STATUS: PLAN MODE (Zero files modified)');
  console.log('Explicit human approval required before executing removals.');
  console.log('============================================================\n');
}

main();
