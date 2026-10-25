#!/usr/bin/env node

/**
 * Static Reference Capture Engine for Stage 2 Design Theory
 *
 * Backwards-compatible CLI wrapper delegating to universal site-fetch:
 *   node skills/create-nww-website/scripts/site-fetch/index.js
 *
 * Usage:
 *   node skills/create-nww-website/scripts/reference-capture/index.js [projectRoot]
 */

const path = require('node:path');
const fs = require('node:fs');
const { crawlReferences, parseReferencesFromBrief } = require('../site-fetch/index.js');

async function run() {
  const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const primaryAnswers = path.join(projectRoot, 'client-context', 'answers', 'batch-02-branding-motion', 'answers.md');
  const fallbackAnswers = path.join(projectRoot, 'client-context', 'answers', 'batch-01-core-identity', 'answers.md');
  const briefPath = fs.existsSync(primaryAnswers) ? primaryAnswers : fallbackAnswers;
  const outDir = path.join(projectRoot, 'project-docs', 'design-references');

  console.log('=================================================================');
  console.log('  STATIC REFERENCE CAPTURE ENGINE (via site-fetch)');
  console.log(`  Target Project: ${projectRoot}`);
  console.log('=================================================================');

  await crawlReferences({ briefPath, outDir, maxPages: 5 });
}

if (require.main === module) {
  run().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { run, parseReferencesFromBrief };
