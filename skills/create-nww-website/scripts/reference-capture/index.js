#!/usr/bin/env node

/**
 * Static Reference Capture Engine for Stage 2 Design Theory
 *
 * Captures landing pages for reference websites:
 * - Rendered HTML (page.html)
 * - Verbatim stripped Markdown (content.md)
 * - Full-page 1440px screenshot (screenshot-full-1440.png)
 * - Structured audit record (capture.json)
 * - Sources index ledger (sources.md)
 *
 * Usage:
 *   node skills/create-nww-website/scripts/reference-capture/index.js [projectRoot]
 */

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const projDocs = path.join(projectRoot, 'project-docs');
const refBase = path.join(projDocs, 'design-references');

// Resolve Playwright from local node_modules, global, or npx cache
let chromium;
try {
  let pw;
  try { pw = require('playwright'); }
  catch { pw = require('../client-review/node_modules/playwright'); }
  chromium = pw.chromium;
} catch {
  try {
    const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
    if (fs.existsSync(npxCache)) {
      const hashes = fs.readdirSync(npxCache);
      for (const h of hashes) {
        const candidate = path.join(npxCache, h, 'node_modules', 'playwright');
        if (fs.existsSync(candidate)) {
          chromium = require(candidate).chromium;
          break;
        }
      }
    }
  } catch {}
}

if (!chromium) {
  console.error('Playwright not found. Install playwright or run via: npx --yes playwright');
}

function parseReferencesFromBrief(answersPath) {
  if (!fs.existsSync(answersPath)) return [];
  const text = fs.readFileSync(answersPath, 'utf-8');
  const q12Match = text.match(/Liked References \(Q12\):([\s\S]*?)(?:##|- \*\*Disliked|\n\n##)/i);
  if (!q12Match) return [];

  const lines = q12Match[1].split('\n');
  const refs = [];

  for (const line of lines) {
    const urlMatch = line.match(/https?:\/\/[^\s\)\],]+/i);
    if (!urlMatch) continue;

    const rawUrl = urlMatch[0];
    const u = new URL(rawUrl);
    const domain = u.hostname.replace(/^www\./i, '').toLowerCase();
    const cleanUrl = `${u.protocol}//${u.hostname}${u.pathname}`;

    // Extract site name
    let name = domain;
    const nameMatch = line.match(/\d+\.\s*([^:]+):/i);
    if (nameMatch) name = nameMatch[1].trim();

    refs.push({
      name,
      requestedUrl: rawUrl,
      cleanUrl,
      domain
    });
  }

  return refs;
}

async function captureReference(browser, ref, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`\nCapturing [${ref.name}] -> ${targetDir}`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    try {
      await page.goto(ref.cleanUrl, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
      await page.goto(ref.cleanUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    }
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.fonts.ready);

    // Let scroll-triggered content settle, retaining viewport evidence where
    // a full-page screenshot cannot represent pinned or virtualized sections.
    const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = Math.min(24, Math.ceil(initialHeight / 650));
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, 650);
      await page.waitForTimeout(650);
      if (i === Math.floor(steps / 2)) {
        await page.screenshot({ path: path.join(targetDir, 'screenshot-mid-1440.png') });
      }
    }
    await page.screenshot({ path: path.join(targetDir, 'screenshot-bottom-1440.png') });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    const pageTitle = await page.title();
    const renderedHtml = await page.content();
    const actualHeight = await page.evaluate(() => document.body.scrollHeight);

    // 1. Write page.html
    const htmlPath = path.join(targetDir, 'page.html');
    fs.writeFileSync(htmlPath, renderedHtml, 'utf-8');
    const htmlSize = fs.statSync(htmlPath).size;

    // 2. Extract stripped verbatim Markdown
    const markdown = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      const toRemove = [
        'script', 'style', 'noscript', 'iframe', 'svg',
        '#onetrust-consent-sdk', '.cookie-banner', '#cookie-notice', '[id*="cookie"]', '[class*="cookie"]'
      ];
      toRemove.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

      const lines = [];
      function walk(node) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const t = node.textContent.trim();
          if (t) lines.push(t);
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const level = '#'.repeat(parseInt(tag[1], 10));
          const txt = node.innerText ? node.innerText.trim() : node.textContent.trim();
          if (txt) lines.push(`\n${level} ${txt}\n`);
          return;
        }
        if (tag === 'p') {
          const txt = node.innerText ? node.innerText.trim() : node.textContent.trim();
          if (txt) lines.push(`\n${txt}\n`);
          return;
        }
        if (tag === 'li') {
          const txt = node.innerText ? node.innerText.trim() : node.textContent.trim();
          if (txt) lines.push(`- ${txt}`);
          return;
        }
        if (tag === 'a' && node.href) {
          const txt = node.innerText ? node.innerText.trim() : node.textContent.trim();
          if (txt && !node.closest('p') && !node.closest('li')) {
            lines.push(`[${txt}](${node.href})`);
            return;
          }
        }
        if (tag === 'img' && node.alt) {
          lines.push(`![${node.alt.trim()}](${node.src || ''})`);
          return;
        }
        for (const c of node.childNodes) walk(c);
      }
      walk(clone);
      return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });

    const mdHeader = `# ${pageTitle || ref.name}\n\n**Source URL:** ${finalUrl}\n**Captured Date:** ${new Date().toISOString().split('T')[0]}\n\n---\n\n`;
    const mdPath = path.join(targetDir, 'content.md');
    fs.writeFileSync(mdPath, mdHeader + markdown + '\n', 'utf-8');
    const mdSize = fs.statSync(mdPath).size;

    // 3. Capture screenshot-full-1440.png
    const screenshotPath = path.join(targetDir, 'screenshot-full-1440.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const ssSize = fs.statSync(screenshotPath).size;

    // 4. Save capture.json
    const record = {
      requestedUrl: ref.requestedUrl,
      finalUrl,
      domain: ref.domain,
      pageTitle,
      capturedAt: new Date().toISOString(),
      viewport: {
        width: 1440,
        height: 900,
        fullPage: true,
        actualRenderedHeight: actualHeight
      },
      tool: 'Playwright / Chromium (headless)',
      files: {
        html: 'page.html',
        htmlSizeBytes: htmlSize,
        markdown: 'content.md',
        markdownSizeBytes: mdSize,
        screenshot: 'screenshot-full-1440.png',
        screenshotSizeBytes: ssSize
      },
      status: 'success',
      visualVerification: 'pending manual screenshot inspection; capture success does not guarantee all animated or virtualized content is visible'
    };
    fs.writeFileSync(path.join(targetDir, 'capture.json'), JSON.stringify(record, null, 2) + '\n', 'utf-8');

    console.log(`  ✓ page.html: ${htmlSize} bytes`);
    console.log(`  ✓ content.md: ${mdSize} bytes`);
    console.log(`  ✓ screenshot-full-1440.png: ${ssSize} bytes`);
    console.log(`  ✓ capture.json: written`);

    return record;
  } catch (err) {
    console.error(`  ✗ Capture failed for ${ref.domain}: ${err.message}`);
    const failRecord = {
      requestedUrl: ref.requestedUrl,
      finalUrl: ref.cleanUrl,
      domain: ref.domain,
      capturedAt: new Date().toISOString(),
      status: 'error',
      error: err.message
    };
    fs.writeFileSync(path.join(targetDir, 'capture.json'), JSON.stringify(failRecord, null, 2) + '\n', 'utf-8');
    return failRecord;
  } finally {
    await page.close();
    await context.close();
  }
}

async function run() {
  console.log('=================================================================');
  console.log('  STATIC REFERENCE CAPTURE ENGINE');
  console.log(`  Target Project: ${projectRoot}`);
  console.log('=================================================================');

  const answersPath = path.join(projDocs, 'client-answers.md');
  const refs = parseReferencesFromBrief(answersPath);

  if (refs.length === 0) {
    console.log('No liked reference URLs found in client-answers.md (Q12).');
    process.exit(0);
  }

  console.log(`Found ${refs.length} reference site(s) to process.`);
  fs.mkdirSync(refBase, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];

  for (const ref of refs) {
    const targetDir = path.join(refBase, ref.domain);
    const rec = await captureReference(browser, ref, targetDir);
    results.push({ ref, rec });
  }

  await browser.close();

  // Generate sources.md
  console.log('\nCompiling sources.md ledger...');
  const rows = results.map(({ ref, rec }) => {
    const isSuccess = rec.status === 'success';
    const filesStr = isSuccess
      ? `page.html (${Math.round(rec.files.htmlSizeBytes / 1024 * 10) / 10} KB)<br>content.md (${Math.round(rec.files.markdownSizeBytes / 1024 * 10) / 10} KB)<br>screenshot-full-1440.png (${Math.round(rec.files.screenshotSizeBytes / 1024 * 10) / 10} KB)<br>capture.json`
      : 'Error during capture';
    const vpStr = isSuccess ? `1440 × ${rec.viewport.actualRenderedHeight} px` : 'N/A';
    const statusStr = isSuccess ? '**Captured; visual inspection pending**' : `**Failed**: ${rec.error}`;

    return `| \`${ref.domain}\` | ${ref.name} | \`${ref.requestedUrl}\` | ${filesStr} | ${vpStr} | ${statusStr} |`;
  }).join('\n');

  const sourcesContent = `# Design Reference Sources & Capture Audit

> **Usage Notice:** All third-party HTML, text, and screenshots saved in this directory are external reference material collected solely for internal design analysis and benchmarking. Their text, markup, code, and images must never be reused, copied, or incorporated into the client's website.

**Recorded Date:** ${new Date().toISOString().split('T')[0]}  
**Project:** Client Reference Inventory  
**Scope:** Landing Pages Only (\`project-docs/design-references/<domain>/\`)  

---

## 1. Landing-Page Capture Inventory

| Domain | Site Name | Source URL | Captured Files | Viewport | Status & Notes |
|---|---|---|---|---|---|
${rows}

---

## 2. Capture Environment & Compliance

- **Engine:** Playwright / Chromium (Google Chrome channel)
- **Viewport Config:** 1440px desktop width with full-page scroll capture
- **Render Mode:** Rendered DOM post-hydration saved verbatim to \`page.html\`
- **Markdown Mode:** Verbatim stripped text preserving headings and links, excluding scripts/styles/SVGs/tracking
- **Integrity:** Zero faked or fabricated content; zero external assets mirrored
- **Storage Scope:** Confined to \`project-docs/design-references/\` in project repository; never stored in skills catalog
`;

  fs.writeFileSync(path.join(refBase, 'sources.md'), sourcesContent, 'utf-8');
  console.log(`✓ sources.md compiled successfully.`);
  console.log('Capture run complete.');
}

if (require.main === module) {
  run().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { run, parseReferencesFromBrief };
