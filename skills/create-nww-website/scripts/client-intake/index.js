#!/usr/bin/env node

/**
 * Client Intake Brief Validator for NWW Website Generator
 *
 * Inspects client-context/answers/batch-* /answers.md and reports completeness
 * against the Stage 0 client intake specification.
 *
 * Usage:
 *   node skills/create-nww-website/scripts/client-intake/index.js [projectRoot] [--strict]
 */

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const projectRoot = positional[0] ? path.resolve(positional[0]) : process.cwd();
const primaryAnswersDir = path.join(projectRoot, 'client-context', 'answers');
const fallbackAnswersDir = path.join(projectRoot, 'project-docs', 'answers');
const answersDir = fs.existsSync(primaryAnswersDir) ? primaryAnswersDir : fallbackAnswersDir;

const EXPECTED_BATCHES = [
  { batch: 'batch-01-core-identity', required: true, label: 'Core Identity & Project Slug' },
  { batch: 'batch-02-branding-motion', required: true, label: 'Branding & Motion Tier' },
  { batch: 'batch-03-sitemap-copy', required: true, label: 'Sitemap & Content Routing' },
  { batch: 'batch-04-asset-harvesting-generation', required: true, label: 'Asset Harvesting & Generation' },
  { batch: 'batch-05-type-specific-routing', required: true, label: 'Archetype-Specific Deep-Dive' },
  { batch: 'batch-06-legacy-site-migration', required: false, label: 'Legacy Migration & 301 Redirects (Conditional)' },
  { batch: 'batch-07-seo-analytics-governance', required: true, label: 'SEO, Analytics & Governance' }
];

const REQUIRED_SECTIONS = [
  { key: 'Business / Site Name', pattern: /business|site name|brand/i },
  { key: 'Project Name / Vercel Slug', pattern: /project name|technical project|slug|vercel/i },
  { key: 'Target Pages / Sitemap', pattern: /pages|sitemap|routes/i },
  { key: 'CMS Architecture Mode', pattern: /cms|blog mode|content management/i },
  { key: 'Design & Visual Direction', pattern: /design|aesthetic|style|colors/i },
  { key: 'Motion / Interaction Tier', pattern: /motion|gsap|animation/i }
];

async function main() {
  console.log(`Auditing client intake answers in: ${answersDir}`);

  if (!fs.existsSync(answersDir)) {
    console.log('[STATUS] No client-context/answers/ directory found. Stage 0 intake questionnaire is required.');
    console.log('Follow skills/create-nww-website/references/gate-0-intake/client-questionnaire.md to present batches.');
    if (args.includes('--strict')) {
      process.exit(1);
    }
    return;
  }

  // Find all answers.md inside batch subdirectories
  let combinedContent = '';
  let foundBatchesCount = 0;

  for (const item of EXPECTED_BATCHES) {
    const batchAnswerFile = path.join(answersDir, item.batch, 'answers.md');
    if (fs.existsSync(batchAnswerFile)) {
      foundBatchesCount++;
      const text = fs.readFileSync(batchAnswerFile, 'utf-8');
      combinedContent += `\n--- BATCH: ${item.batch} ---\n` + text;
      console.log(`  [FOUND] ${item.batch}/answers.md (${item.label})`);
    } else if (item.required) {
      console.log(`  [MISSING] ${item.batch}/answers.md (${item.label})`);
    } else {
      console.log(`  [OPTIONAL/SKIPPED] ${item.batch}/answers.md (${item.label})`);
    }
  }

  const missing = [];
  const found = [];

  for (const { key, pattern } of REQUIRED_SECTIONS) {
    if (pattern.test(combinedContent)) {
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  console.log(`\n[PASS] Captured brief sections across batches (${found.length}/${REQUIRED_SECTIONS.length}):`);
  for (const item of found) {
    console.log(`  - ${item}`);
  }

  if (missing.length > 0) {
    console.log(`[PENDING] Incomplete brief sections (${missing.length}):`);
    for (const item of missing) {
      console.log(`  - ${item}`);
    }
    if (args.includes('--strict')) {
      process.exit(1);
    }
  } else {
    console.log('[COMPLETE] All core intake categories documented across batch answer files.');
  }

  // Audit companion asset manifest
  const primaryAssetManifest = path.join(projectRoot, 'client-context', 'asset-manifest.md');
  const fallbackAssetManifest = path.join(projectRoot, 'project-docs', 'asset-manifest.md');
  const assetManifestPath = fs.existsSync(primaryAssetManifest) ? primaryAssetManifest : fallbackAssetManifest;

  console.log(`\nAuditing asset manifest: ${assetManifestPath}`);
  if (fs.existsSync(assetManifestPath)) {
    console.log('[COMPLETE] Asset manifest found and documented.');
  } else {
    console.log('[PENDING] No asset-manifest.md found. Batch 04 asset inventory is required before Gate 0 sign-off.');
    if (args.includes('--strict')) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`[ERROR] client-intake failed: ${err.message}`);
  process.exit(1);
});
