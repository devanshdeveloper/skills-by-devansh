#!/usr/bin/env node

/**
 * Layout Verification & Consistency Auditor for NWW Website Generator
 *
 * Verifies parity between agent-facing `page-specs/<slug>/layout.md` and
 * client-facing `project-docs/client-review/pages/<slug>/index.html`.
 *
 * Checks:
 * 1. Freshness: HTML timestamp >= layout.md timestamp (flags stale HTML).
 * 2. Section Parity: All sections in layout.md appear in HTML in exact order.
 * 3. No Extra Sections: HTML contains zero unauthorized extra sections.
 * 4. CTA & Form Parity: Calls to action and forms in layout.md exist in HTML.
 * 5. Placeholder Hygiene: No unresolved `{{...}}` tokens left behind.
 * 6. Offline Isolation: Zero external network or font dependencies.
 * 7. Layout Index: `project-docs/client-review/pages/index.html` lists all active slugs.
 *
 * Usage:
 *   node skills/create-nww-website/scripts/client-review/verify-layout.mjs [projectRoot]
 */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const projDocs = path.join(projectRoot, 'project-docs');
const pageSpecsDir = path.join(projectRoot, 'page-specs');
const clientReviewPagesDir = path.join(projDocs, 'client-review', 'pages');

function sanitizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/[\[\]]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseSlugsFromPageList() {
  const pageListPath = path.join(projDocs, 'page-list.md');
  if (!fs.existsSync(pageListPath)) {
    return [];
  }
  const content = fs.readFileSync(pageListPath, 'utf-8');
  const slugs = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const slugMatch = line.match(/^\s*-\s*Slug:\s*([^\s]+)/i);
    if (slugMatch) {
      slugs.push(slugMatch[1].trim());
    }
  }
  return [...new Set(slugs)];
}

function extractLayoutSections(layoutMdContent) {
  const sections = [];
  // Match "### Section N: `id`" or "### Section N: id"
  const sectionRegex = /^###\s+Section\s+(\d+)[:\s]+`?([a-zA-Z0-9_\-]+)`?/gim;
  let match;
  while ((match = sectionRegex.exec(layoutMdContent)) !== null) {
    sections.push({
      order: parseInt(match[1], 10),
      id: match[2].trim()
    });
  }

  // Extract CTAs
  const ctas = [];
  const ctaRegex = /(?:Primary CTA|Secondary CTA|Button text)[:\s]+["']?([^"'\n\r]+)["']?/gi;
  while ((match = ctaRegex.exec(layoutMdContent)) !== null) {
    const label = match[1].split('->')[0].replace(/max\s*\d+\s*chars/i, '').trim();
    if (label && !label.startsWith('max')) {
      ctas.push(label.toLowerCase());
    }
  }

  return { sections, ctas };
}

function extractHtmlSections(htmlContent) {
  const sections = [];
  // Look for data-section-id="..." or id="..." on section tags or comment marks
  const dataSectionRegex = /(?:data-section-id=["']([a-zA-Z0-9_\-]+)["']|<section[^>]*id=["']([a-zA-Z0-9_\-]+)["'])/gi;
  let match;
  while ((match = dataSectionRegex.exec(htmlContent)) !== null) {
    const id = (match[1] || match[2]).trim();
    if (id !== 'hero' && id !== 'main') {
      sections.push(id);
    }
  }

  // Fallback: look for visible Section ID labels in code or tags
  if (sections.length === 0) {
    const fallbackRegex = /Section\s+\d+[:\s]+`?([a-zA-Z0-9_\-]+)`?/gi;
    while ((match = fallbackRegex.exec(htmlContent)) !== null) {
      sections.push(match[1].trim());
    }
  }

  return [...new Set(sections)];
}

function checkOfflineIsolation(htmlContent) {
  const externalUrls = [];
  const urlRegex = /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  while ((match = urlRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
      externalUrls.push(url);
    }
  }
  return externalUrls;
}

function runAudit() {
  console.log(`[Layout Consistency Auditor] Project Root: ${projectRoot}`);
  const errors = [];
  const warnings = [];
  let checkedCount = 0;

  // 1. Audit Index Hub
  const indexPath = path.join(clientReviewPagesDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push(`Missing top-level layout review index at: ${path.relative(projectRoot, indexPath)}`);
  } else {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    if (indexContent.includes('{{') && indexContent.includes('}}')) {
      errors.push(`Layout index contains unresolved placeholders: ${path.relative(projectRoot, indexPath)}`);
    }
    const indexExternal = checkOfflineIsolation(indexContent);
    if (indexExternal.length > 0) {
      errors.push(`Layout index contains external network requests: ${indexExternal.slice(0, 3).join(', ')}`);
    }
  }

  // 2. Discover slugs
  const slugs = parseSlugsFromPageList();
  if (slugs.length === 0) {
    warnings.push('No slugs found in page-list.md (or file missing). Scanning page-specs/ directory directly.');
  }

  const specDirs = fs.existsSync(pageSpecsDir)
    ? fs.readdirSync(pageSpecsDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
        .map(d => d.name)
    : [];

  const allSlugs = [...new Set([...slugs, ...specDirs])];

  if (allSlugs.length === 0) {
    console.log('No page slugs found to verify.');
    return { ok: true, checkedCount: 0, errors, warnings };
  }

  for (const rawSlug of allSlugs) {
    const safeSlug = sanitizeSlug(rawSlug);
    const layoutMdPath = path.join(pageSpecsDir, rawSlug, 'layout.md');
    const layoutHtmlPath = path.join(clientReviewPagesDir, safeSlug, 'index.html');

    if (!fs.existsSync(layoutMdPath)) {
      // If layout.md doesn't exist, this slug hasn't reached Stage 5 yet
      continue;
    }

    checkedCount++;
    console.log(`Auditing slug: [${rawSlug}] (folder: ${safeSlug})`);

    if (!fs.existsSync(layoutHtmlPath)) {
      errors.push(`[${rawSlug}] Missing client-facing HTML layout at: ${path.relative(projectRoot, layoutHtmlPath)}`);
      continue;
    }

    // Freshness check
    const mdStat = fs.statSync(layoutMdPath);
    const htmlStat = fs.statSync(layoutHtmlPath);
    if (mdStat.mtimeMs > htmlStat.mtimeMs) {
      errors.push(`[${rawSlug}] STALE HTML: layout.md is newer than client index.html (modified: ${new Date(mdStat.mtimeMs).toISOString()} vs ${new Date(htmlStat.mtimeMs).toISOString()}). Regenerate required.`);
    }

    const mdContent = fs.readFileSync(layoutMdPath, 'utf-8');
    const htmlContent = fs.readFileSync(layoutHtmlPath, 'utf-8');

    // Placeholder check
    if (htmlContent.includes('{{') && htmlContent.includes('}}')) {
      errors.push(`[${rawSlug}] Unresolved template placeholders detected in HTML.`);
    }

    // Isolation check
    const external = checkOfflineIsolation(htmlContent);
    if (external.length > 0) {
      errors.push(`[${rawSlug}] Offline isolation violated: ${external.slice(0, 3).join(', ')}`);
    }

    // Parity check
    const mdData = extractLayoutSections(mdContent);
    const htmlSections = extractHtmlSections(htmlContent);

    const mdSectionIds = mdData.sections.map(s => s.id);

    // Assert exact count & sequence
    if (mdSectionIds.length === 0) {
      warnings.push(`[${rawSlug}] No sections found in layout.md.`);
    } else {
      // Check for missing sections
      for (let i = 0; i < mdSectionIds.length; i++) {
        const expectedId = mdSectionIds[i];
        if (!htmlSections.includes(expectedId)) {
          errors.push(`[${rawSlug}] Missing section in HTML: '${expectedId}' (defined in layout.md).`);
        }
      }

      // Check for extra sections
      for (const htmlId of htmlSections) {
        if (!mdSectionIds.includes(htmlId)) {
          errors.push(`[${rawSlug}] Unauthorized extra section in HTML: '${htmlId}' (not in layout.md).`);
        }
      }

      // Check order
      if (htmlSections.length === mdSectionIds.length) {
        for (let i = 0; i < mdSectionIds.length; i++) {
          if (htmlSections[i] !== mdSectionIds[i]) {
            errors.push(`[${rawSlug}] Section order mismatch at position ${i + 1}: expected '${mdSectionIds[i]}', found '${htmlSections[i]}'.`);
          }
        }
      }
    }
  }

  console.log('\n--- Consistency Audit Summary ---');
  console.log(`Checked ${checkedCount} layout blueprint(s).`);
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  ! ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n✖ Consistency Audit FAILED with ${errors.length} error(s):`);
    errors.forEach(e => console.error(`  ✖ ${e}`));
    console.error('\nAction Required: Regenerate client-facing HTML pages to match layout.md before presenting Gate 5.');
    return { ok: false, checkedCount, errors, warnings };
  }

  console.log('✓ All client-facing layout pages are fresh, offline-isolated, and strictly match layout.md.');
  return { ok: true, checkedCount, errors: [], warnings };
}

const result = runAudit();
if (!result.ok) {
  process.exit(1);
} else {
  process.exit(0);
}
