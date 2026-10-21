#!/usr/bin/env node

/**
 * Client Intake Brief Validator for NWW Website Generator
 *
 * Inspects project-docs/client-answers.md and reports completeness of answers
 * against the Stage 0 client intake specification.
 *
 * Usage:
 *   node skills/create-nww-website/scripts/client-intake/index.js [projectRoot] [--check]
 */

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const projectRoot = positional[0] ? path.resolve(positional[0]) : process.cwd();
const briefPath = path.join(projectRoot, 'project-docs', 'client-answers.md');

const REQUIRED_SECTIONS = [
  { key: 'Business / Site Name', pattern: /business|site name|brand/i },
  { key: 'Target Pages / Sitemap', pattern: /pages|sitemap|routes/i },
  { key: 'CMS Architecture Mode', pattern: /cms|blog mode|content management/i },
  { key: 'Design & Visual Direction', pattern: /design|aesthetic|style|colors/i }
];

async function main() {
  console.log(`Auditing client intake brief: ${briefPath}`);

  if (!fs.existsSync(briefPath)) {
    console.log('[STATUS] No client-answers.md found. Stage 0 intake questionnaire is required.');
    console.log('Follow skills/create-nww-website/references/client-questionnaire.md to present batches.');
    if (args.includes('--strict')) {
      process.exit(1);
    }
    return;
  }

  const content = fs.readFileSync(briefPath, 'utf-8');
  const missing = [];
  const found = [];

  for (const { key, pattern } of REQUIRED_SECTIONS) {
    if (pattern.test(content)) {
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  console.log(`[PASS] Captured sections (${found.length}/${REQUIRED_SECTIONS.length}):`);
  for (const item of found) {
    console.log(`  - ${item}`);
  }

  if (missing.length > 0) {
    console.log(`[PENDING] Incomplete sections (${missing.length}):`);
    for (const item of missing) {
      console.log(`  - ${item}`);
    }
  } else {
    console.log('[COMPLETE] All core intake categories documented.');
  }
}

main().catch((err) => {
  console.error(`[ERROR] client-intake failed: ${err.message}`);
  process.exit(1);
});
