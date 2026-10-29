#!/usr/bin/env node

/**
 * Static Reference Capture Engine for Stage 2 Design Theory
 *
 * Captures benchmark reference landing pages & sub-pages from intake brief (Q12) into:
 *   project-docs/design-references/<domain>/<slug>/
 *
 * Usage:
 *   node skills/create-nww-website/scripts/reference-capture/index.js [projectRoot]
 */

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { URL } = require('node:url');

const { launchBrowser } = require('../site-fetch/lib/browser');
const { probeSiteRoutes, clusterAndSamplePageTypes } = require('../site-fetch/lib/routes');
const { capturePageArtifacts } = require('../site-fetch/lib/capture');

function parseReferencesFromBrief(answersPath) {
  if (!fs.existsSync(answersPath)) return [];
  const text = fs.readFileSync(answersPath, 'utf-8');
  const q12Match = text.match(/Liked References \(Q12\):([\s\S]*?)(?:##|- \*\*Disliked|\n\n##)/i);
  if (!q12Match) return [];

  const refs = [];
  for (const line of q12Match[1].split('\n')) {
    const urlMatch = line.match(/https?:\/\/[^\s\)\],]+/i);
    if (!urlMatch) continue;

    const rawUrl = urlMatch[0];
    const u = new URL(rawUrl);
    const domain = u.hostname.replace(/^www\./i, '').toLowerCase();
    const cleanUrl = `${u.protocol}//${u.hostname}${u.pathname}`;

    const nameMatch = line.match(/\d+\.\s*([^:]+):/i);
    const name = nameMatch ? nameMatch[1].trim() : domain;

    refs.push({ name, requestedUrl: rawUrl, cleanUrl, domain });
  }

  return refs;
}

function generateSourcesMd(allResults, outDir) {
  const rows = allResults.map(({ ref, records }) => {
    const successRecords = records.filter(r => r.status === 'success');
    const filesStr = records.length > 0
      ? records.map(r => r.status === 'success'
        ? `${r.slug}/index.html<br>${r.slug}/content.md<br>${r.slug}/screenshot.png`
        : `${r.slug}: Error (${r.error || 'Failed'})`
      ).join('<br><br>')
      : 'Capture error';
    const statusStr = successRecords.length > 0
      ? `**Captured (${successRecords.length} page type(s))**`
      : '**Capture failed**';
    return `| \`${ref.domain}\` | ${ref.name} | \`${ref.requestedUrl}\` | ${filesStr} | 1440 × 900 px | ${statusStr} |`;
  }).join('\n');

  const sourcesContent = `# Design Reference Sources & Capture Audit

> **Usage Notice:** All third-party HTML, text, and screenshots saved in this directory are external reference material collected solely for internal design analysis and benchmarking. Their text, markup, code, and images must never be reused, copied, or incorporated into the client's website.

**Recorded Date:** ${new Date().toISOString().split('T')[0]}  
**Project:** Client Reference Inventory  
**Scope:** Design References (\`${outDir}/<domain>/<slug>/\`)  

---

## 1. Reference Capture Inventory

| Domain | Site Name | Source URL | Captured Files | Viewport | Status & Notes |
|---|---|---|---|---|---|
${rows}

---

## 2. Capture Environment & Compliance
- **Engine:** Playwright / Headless Chromium
- **Artifacts:** Verbatim post-hydration DOM (\`index.html\`), stripped markdown (\`content.md\`), full screenshot (\`screenshot.png\`)
- **Compliance:** Internal visual & spatial analysis only. Zero copying of text, classes, or code.
`;

  const sourcesPath = path.join(outDir, 'sources.md');
  fs.writeFileSync(sourcesPath, sourcesContent, 'utf-8');
  return sourcesPath;
}

async function crawlReferences({ briefPath, outDir, maxPages = 3, cleanExisting = true, timeoutMs = 20000 }) {
  const refs = parseReferencesFromBrief(briefPath);
  if (refs.length === 0) {
    console.log(`No liked reference URLs found in ${briefPath} (Q12).`);
    return;
  }

  console.log(`Found ${refs.length} design reference site(s) to process.`);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launchBrowser();
  const allResults = [];

  for (const ref of refs) {
    const siteDir = path.join(outDir, ref.domain);
    if (cleanExisting && fs.existsSync(siteDir)) {
      console.log(`\n[Clean Start] Existing reference folder for '${ref.domain}' detected. Removing stale captures...`);
      fs.rmSync(siteDir, { recursive: true, force: true });
    }
    fs.mkdirSync(siteDir, { recursive: true });
    console.log(`\nProcessing reference [${ref.name}] (${ref.cleanUrl})...`);

    const { allDiscovered } = await probeSiteRoutes(browser, ref.cleanUrl, timeoutMs);
    const pagesToCapture = clusterAndSamplePageTypes(allDiscovered, ref.cleanUrl, maxPages);

    console.log(`  Identified ${pagesToCapture.length} page type(s) for ${ref.name}: ${pagesToCapture.map(p => `[${p.slug}]`).join(', ')}`);

    const siteRecords = [];
    for (const item of pagesToCapture) {
      const res = await capturePageArtifacts(browser, item.url, item.slug, path.posix.join(ref.domain, item.slug, 'index.html'), outDir, timeoutMs);
      siteRecords.push(res);
    }
    allResults.push({ ref, records: siteRecords });
  }

  await browser.close();

  generateSourcesMd(allResults, outDir);
  console.log(`\n✓ sources.md compiled at ${path.join(outDir, 'sources.md')}`);
}

async function run() {
  const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const primaryAnswers = path.join(projectRoot, 'client-context', 'answers', 'batch-02-branding-motion', 'answers.md');
  const fallbackAnswers = path.join(projectRoot, 'client-context', 'answers', 'batch-01-core-identity', 'answers.md');
  const briefPath = fs.existsSync(primaryAnswers) ? primaryAnswers : fallbackAnswers;
  const outDir = path.join(projectRoot, 'project-docs', 'design-references');

  console.log('=================================================================');
  console.log('  STATIC REFERENCE CAPTURE ENGINE');
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

module.exports = {
  run,
  crawlReferences,
  parseReferencesFromBrief,
  generateSourcesMd
};
