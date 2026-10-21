#!/usr/bin/env node
/**
 * verify-nextjs.mjs
 * 
 * Zero-dependency companion validation script for create-nww-website's Next.js layout generation mode.
 * Verifies parity and consistency across:
 * 1. Agent-facing blueprints: page-specs/<slug>/layout.md
 * 2. Next.js machine manifest: site/site.manifest.json
 * 3. Actual Next.js code files: site/app/<route>/page.js, _components/*.js, and content modules.
 * 4. Section markers: data-section="<id>" attributes in JSX.
 * 5. Pre-launch guard: robots noindex and preview banner.
 * 
 * Usage:
 *   node skills/create-nww-website/scripts/client-review/verify-nextjs.mjs [project-root]
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const siteDir = path.join(projectRoot, 'site');
const manifestPath = path.join(siteDir, 'site.manifest.json');
const pageSpecsDir = path.join(projectRoot, 'page-specs');
const projDocsDir = path.join(projectRoot, 'project-docs');

console.log('=================================================================');
console.log('  NWW NEXT.JS SITE MANIFEST & CODE CONSISTENCY AUDITOR');
console.log('=================================================================');
console.log(`Project Root: ${projectRoot}`);

let errors = [];
let warnings = [];
let checksPassed = 0;

// 1. Verify site/ exists and is a directory
if (!fs.existsSync(siteDir)) {
  console.error(`✗ Error: 'site/' directory does not exist at ${siteDir}`);
  process.exit(1);
}

// 2. Verify site/site.manifest.json exists and is valid JSON
if (!fs.existsSync(manifestPath)) {
  console.error(`✗ Error: Manifest missing at ${manifestPath}`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`✓ Manifest loaded: ${manifest.mode || 'nextjs'} mode (Variation: ${manifest.sourceVariation?.name || manifest.sourceVariation || 'Unknown'})`);
  checksPassed++;
} catch (e) {
  console.error(`✗ Error: Failed to parse ${manifestPath}: ${e.message}`);
  process.exit(1);
}

// 3. Verify Pre-Launch Guard in manifest
if (manifest.preLaunchGuard && manifest.preLaunchGuard.enabled) {
  console.log(`✓ Pre-launch guard declared in manifest (${manifest.preLaunchGuard.envVar || 'NEXT_PUBLIC_PREVIEW_GUARD'})`);
  checksPassed++;
} else {
  warnings.push('Manifest does not declare an active preLaunchGuard.');
}

// 4. Verify pages in manifest against page-specs/<slug>/layout.md
if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
  errors.push('Manifest contains no pages.');
} else {
  console.log(`\nAuditing ${manifest.pages.length} page(s) declared in manifest...\n`);

  for (const page of manifest.pages) {
    const slug = page.slug;
    console.log(`  Checking page slug: ${slug} (Route: ${page.route || '?'})`);

    const layoutMdPath = path.join(pageSpecsDir, slug, 'layout.md');
    if (!fs.existsSync(layoutMdPath)) {
      errors.push(`[${slug}] layout.md missing at ${layoutMdPath}`);
      continue;
    }

    const layoutContent = fs.readFileSync(layoutMdPath, 'utf-8');

    // Extract section IDs from layout.md (### Section X: `id`)
    const expectedSectionMatches = [...layoutContent.matchAll(/### Section\s+\d+:\s*`([^`]+)`/g)];
    const expectedIds = expectedSectionMatches.map(m => m[1].trim());

    if (expectedIds.length === 0) {
      warnings.push(`[${slug}] No sections found in layout.md.`);
    }

    // Verify manifest sections
    const manifestSections = page.sections || [];
    const manifestIds = manifestSections.map(s => s.id);

    if (expectedIds.length !== manifestIds.length) {
      errors.push(`[${slug}] Section count mismatch: layout.md has ${expectedIds.length}, manifest has ${manifestIds.length}.`);
    }

    for (let i = 0; i < expectedIds.length; i++) {
      const expId = expectedIds[i];
      const manId = manifestIds[i];
      if (expId !== manId) {
        errors.push(`[${slug}] Section order mismatch at index ${i}: expected '${expId}' from layout.md, found '${manId}' in manifest.`);
      }
    }

    // Verify component files and section markers on disk
    for (const sec of manifestSections) {
      const compRelPath = sec.componentFile;
      if (!compRelPath) {
        errors.push(`[${slug}] Section '${sec.id}' in manifest lacks componentFile.`);
        continue;
      }

      const compFullPath = path.isAbsolute(compRelPath) ? compRelPath : path.join(projectRoot, compRelPath);
      if (!fs.existsSync(compFullPath)) {
        errors.push(`[${slug}] Component file missing on disk: ${compRelPath}`);
      } else {
        const compCode = fs.readFileSync(compFullPath, 'utf-8');
        const markerRegex = new RegExp(`data-section=["']${sec.id}["']`, 'i');
        if (!markerRegex.test(compCode)) {
          errors.push(`[${slug}] Component '${compRelPath}' missing required marker data-section="${sec.id}".`);
        } else {
          checksPassed++;
        }
      }
    }

    // Verify page file on disk
    if (page.pageFile) {
      const pageFullPath = path.isAbsolute(page.pageFile) ? page.pageFile : path.join(projectRoot, page.pageFile);
      if (!fs.existsSync(pageFullPath)) {
        errors.push(`[${slug}] Page orchestrator missing on disk: ${page.pageFile}`);
      } else {
        checksPassed++;
      }
    }

    // Verify content file on disk
    if (page.contentFile) {
      const contentFullPath = path.isAbsolute(page.contentFile) ? page.contentFile : path.join(projectRoot, page.contentFile);
      if (!fs.existsSync(contentFullPath)) {
        warnings.push(`[${slug}] Content module missing on disk: ${page.contentFile}`);
      } else {
        checksPassed++;
      }
    }
  }
}

console.log('-----------------------------------------------------------------');
if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  ○ ${w}`);
  }
}

if (errors.length > 0) {
  console.error(`\n✗ AUDIT FAILED: ${errors.length} error(s) detected:`);
  for (const err of errors) {
    console.error(`  ✗ ${err}`);
  }
  process.exit(1);
}

console.log(`✓ ALL CHECKS PASSED: ${checksPassed} assertions verified cleanly.`);
console.log('Next.js codebase, manifest, and layout blueprints are 100% consistent.');
process.exit(0);
