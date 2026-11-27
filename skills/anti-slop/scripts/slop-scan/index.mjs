#!/usr/bin/env node
import path from 'node:path';
import { RuleRegistry } from './registry.mjs';
import { FileScanner } from './scanner.mjs';

const SKILL_VERSION = '1.14.0';

// Parses CLI flags: --target=<dir>, --json, --mode=<script|browser>, --help
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    target: '.',
    mode: 'script',
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
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.slice(7);
    } else if (arg === 'browser') {
      options.mode = 'browser';
    } else if (!arg.startsWith('-')) {
      options.target = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
anti-slop scanner - Read-only AST & Pattern Scanner for AI Slop Detection

USAGE:
  node skills/anti-slop/scripts/slop-scan/index.mjs [options] [target-path]

OPTIONS:
  --target=<path>     Target directory or file to scan (default: current directory)
  --mode=<mode>       Execution mode: 'script' (default) or 'browser'
  --json              Output findings as structured JSON
  --help, -h          Show this help message

EXAMPLES:
  node skills/anti-slop/scripts/slop-scan/index.mjs site/src
  node skills/anti-slop/scripts/slop-scan/index.mjs --target=site/src --json
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
    console.log(JSON.stringify({
      version: SKILL_VERSION,
      mode: options.mode,
      targetRoot: results.targetRoot,
      filesScanned: results.filesScanned,
      totalFindings: results.totalFindings,
      summaryByCategory: results.summaryByCategory,
      findings: results.findings
    }, null, 2));
    process.exit(0);
  }

  // Strict output format: scan line followed by candidate detections
  console.log(`Scan: mode=${options.mode}, version=${SKILL_VERSION}, roots=[${results.targetRoot}], files=${results.filesScanned}, hits=[visual: ${results.summaryByCategory.visual}, copy: ${results.summaryByCategory.copy}, structure: ${results.summaryByCategory.structure}, code: ${results.summaryByCategory.code}]`);

  if (results.findings.length === 0) {
    console.log('No AI slop patterns detected across scanned roots.');
  } else {
    console.log('\nCandidate Removals:');
    for (const item of results.findings) {
      const relFile = path.relative(process.cwd(), item.file).replace(/\\/g, '/');
      console.log(`- ${relFile}:${item.line} -> ${item.ruleId} ("${item.matchText}") [Action: ${item.action}]`);
    }
  }
}

main();
