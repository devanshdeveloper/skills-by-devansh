#!/usr/bin/env node

/**
 * Universal Website Fetcher & Page-Type Capture Engine
 *
 * Fetches, crawls, and archives complete websites for:
 * 1. Stage 0 Site Migration: Crawls legacy site before Gate 1 into `previous-site/<slug>/`
 *    with `index.html`, `content.md`, `screenshot.png`, and `sitemap-legacy.xml`.
 * 2. Stage 2 Design References: Captures benchmark examples into `project-docs/design-references/<domain>/<slug>/`
 *    and compiles `sources.md`.
 *
 * Usage:
 *   # Migrate previous website (discovers and captures each page type):
 *   node skills/create-nww-website/scripts/site-fetch/index.js --url https://legacy.com --out previous-site --mode migration
 *
 *   # Capture design reference examples from batch-02-branding-motion/answers.md:
 *   node skills/create-nww-website/scripts/site-fetch/index.js --brief client-context/answers/batch-02-branding-motion/answers.md --out project-docs/design-references --mode references
 *
 *   # Standalone site crawl:
 *   node skills/create-nww-website/scripts/site-fetch/index.js --url https://example.com --out captured-site/ --max-pages 15
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');
const { URL } = require('node:url');

// Resolve Playwright from project cwd, local node_modules, companion packages, or npx cache
let chromium;
const candidatePaths = [
  'playwright',
  path.join(process.cwd(), 'node_modules', 'playwright'),
  path.join(process.cwd(), 'site', 'node_modules', 'playwright'),
  path.join(__dirname, '..', 'client-review', 'node_modules', 'playwright')
];

for (const candidate of candidatePaths) {
  try {
    const pw = require(candidate);
    if (pw && pw.chromium) {
      chromium = pw.chromium;
      break;
    }
  } catch {}
}

if (!chromium) {
  try {
    const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
    if (fs.existsSync(npxCache)) {
      const hashes = fs.readdirSync(npxCache);
      for (const h of hashes) {
        const candidate = path.join(npxCache, h, 'node_modules', 'playwright');
        if (fs.existsSync(candidate)) {
          chromium = require(candidate).chromium;
          if (chromium) break;
        }
      }
    }
  } catch {}
}

function printHelp() {
  console.log(`
Universal Website Fetcher (skills-by-devansh)

Usage:
  node site-fetch/index.js [options]

Options:
  --url <url>           Target website URL to crawl and capture.
  --out <dir>           Output directory (e.g. 'previous-site' or 'project-docs/design-references').
  --mode <type>         Operation mode: 'migration' (default for --url) or 'references' (for --brief).
  --brief <file>        Path to batch answers file (e.g. client-context/answers/batch-02-branding-motion/answers.md) to parse liked reference sites.
  --max-pages <number>  Max unique page types to capture per site (default: 15).
  --timeout <ms>        Navigation timeout in milliseconds (default: 20000).
  --help                Show this help message.

Examples:
  # Capture previous site for migration before Gate 1:
  node site-fetch/index.js --url https://old-site.com --out previous-site --mode migration

  # Fetch all design references from intake brief:
  node site-fetch/index.js --brief client-context/answers/batch-02-branding-motion/answers.md --out project-docs/design-references --mode references
`);
}

// Simple HTTP/HTTPS GET helper
function fetchText(targetUrl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return resolve(fetchText(redirectUrl, timeoutMs));
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`));
        }
        let data = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    } catch (e) {
      reject(e);
    }
  });
}

// Discover URLs from sitemap.xml or robots.txt
async function discoverSitemapUrls(baseUrl) {
  const discovered = new Set();
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;

  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/robots.txt`
  ];

  for (const candidate of candidates) {
    try {
      const content = await fetchText(candidate, 8000);
      if (candidate.endsWith('.txt')) {
        const sitemapMatches = content.matchAll(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
        for (const m of sitemapMatches) {
          try {
            const subContent = await fetchText(m[1].trim(), 8000);
            extractXmlUrls(subContent, origin, discovered);
          } catch {}
        }
      } else {
        extractXmlUrls(content, origin, discovered);
      }
    } catch {}
  }

  return Array.from(discovered);
}

function extractXmlUrls(xmlContent, origin, urlSet) {
  const locMatches = xmlContent.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi);
  for (const m of locMatches) {
    try {
      const u = new URL(m[1].trim());
      if (u.origin === origin) {
        urlSet.add(cleanUrlString(u));
      }
    } catch {}
  }
}

function cleanUrlString(parsedUrl) {
  return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.replace(/\/+$/, '') || '/'}`;
}

function urlToSlug(urlString, baseUrl) {
  try {
    const u = new URL(urlString);
    const p = u.pathname.replace(/^\/+|\/+$/g, '');
    if (!p) return 'home';
    return p.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'page';
  } catch {
    return 'page';
  }
}

// Cluster URLs by path pattern to ensure we sample at least each distinct page type
function clusterAndSamplePageTypes(urlList, baseUrl, maxPages = 15) {
  const baseParsed = new URL(baseUrl);
  const homeUrl = cleanUrlString(baseParsed);
  const selected = new Map(); // slug -> url

  // Always include Home
  selected.set('home', homeUrl);

  const patternBuckets = new Map();

  for (const raw of urlList) {
    try {
      const u = new URL(raw);
      if (u.origin !== baseParsed.origin) continue;
      const clean = cleanUrlString(u);
      if (clean === homeUrl) continue;

      const segments = u.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      if (segments.length === 0) continue;

      // Classify page type pattern
      let patternKey;
      if (segments.length === 1) {
        // Top-level static page: /about, /contact, /services, /pricing, etc.
        patternKey = `static:${segments[0]}`;
      } else {
        // Multi-segment dynamic collection: /blog/:slug, /products/:slug, etc.
        patternKey = `collection:${segments[0]}`;
      }

      if (!patternBuckets.has(patternKey)) {
        patternBuckets.set(patternKey, []);
      }
      patternBuckets.get(patternKey).push(clean);
    } catch {}
  }

  // 1. First prioritize all top-level static pages (About, Services, Contact, Pricing, etc.)
  for (const [key, urls] of patternBuckets.entries()) {
    if (key.startsWith('static:') && selected.size < maxPages) {
      const u = urls[0];
      const slug = urlToSlug(u, baseUrl);
      if (!selected.has(slug)) {
        selected.set(slug, u);
      }
    }
  }

  // 2. Then sample 1-2 representative items from each collection pattern (e.g. 1 blog post, 1 product)
  for (const [key, urls] of patternBuckets.entries()) {
    if (key.startsWith('collection:') && selected.size < maxPages) {
      const sampleCount = Math.min(2, urls.length);
      for (let i = 0; i < sampleCount && selected.size < maxPages; i++) {
        const u = urls[i];
        let slug = urlToSlug(u, baseUrl);
        if (selected.has(slug)) slug = `${slug}-${i + 1}`;
        selected.set(slug, u);
      }
    }
  }

  // 3. If still under limit, fill with remaining items
  for (const [key, urls] of patternBuckets.entries()) {
    for (const u of urls) {
      if (selected.size >= maxPages) break;
      const slug = urlToSlug(u, baseUrl);
      if (!selected.has(slug)) {
        selected.set(slug, u);
      }
    }
  }

  return Array.from(selected.entries()).map(([slug, url]) => ({ slug, url }));
}

// Discover internal links from rendered DOM
async function extractInternalLinksFromPage(page, baseUrl) {
  try {
    const origin = new URL(baseUrl).origin;
    const links = await page.evaluate((orig) => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map(a => a.href)
        .filter(href => {
          try {
            const u = new URL(href);
            return u.origin === orig && !u.pathname.match(/\.(pdf|zip|png|jpg|jpeg|svg|webp|mp4)$/i);
          } catch {
            return false;
          }
        });
    }, origin);
    return links.map(l => cleanUrlString(new URL(l)));
  } catch {
    return [];
  }
}

// Capture a single page: index.html, content.md, screenshot.png, capture.json
async function capturePageArtifacts(browser, pageUrl, slug, targetDir, timeoutMs = 20000) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`\n  -> Capturing [${slug}] (${pageUrl})`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: timeoutMs });
    } catch {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    }

    await page.waitForTimeout(1500);
    try { await page.evaluate(() => document.fonts.ready); } catch {}

    // Scroll to bottom to trigger lazy-loaded sections and images
    try {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const steps = Math.min(16, Math.ceil(scrollHeight / 700));
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(200);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);
    } catch {}

    const renderedHtml = await page.content();
    const pageTitle = await page.title();
    const finalUrl = page.url();

    // 1. Write index.html
    const htmlPath = path.join(targetDir, 'index.html');
    fs.writeFileSync(htmlPath, renderedHtml, 'utf-8');
    const htmlSize = fs.statSync(htmlPath).size;

    // 2. Extract clean verbatim Markdown
    const markdownBody = await page.evaluate(() => {
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

    const mdHeader = `# ${pageTitle || slug}\n\n**Source URL:** ${finalUrl}\n**Captured Date:** ${new Date().toISOString().split('T')[0]}\n**Page Slug:** \`${slug}\`\n\n---\n\n`;
    const mdPath = path.join(targetDir, 'content.md');
    fs.writeFileSync(mdPath, mdHeader + markdownBody + '\n', 'utf-8');
    const mdSize = fs.statSync(mdPath).size;

    // 3. Capture screenshot.png
    const screenshotPath = path.join(targetDir, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const ssSize = fs.statSync(screenshotPath).size;

    // 4. Extract any internal links on page to help discovery
    const pageInternalLinks = await extractInternalLinksFromPage(page, pageUrl);

    // 5. Write capture.json
    const record = {
      slug,
      requestedUrl: pageUrl,
      finalUrl,
      pageTitle,
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 900, fullPage: true },
      files: {
        html: 'index.html',
        htmlSizeBytes: htmlSize,
        markdown: 'content.md',
        markdownSizeBytes: mdSize,
        screenshot: 'screenshot.png',
        screenshotSizeBytes: ssSize
      },
      status: 'success'
    };
    fs.writeFileSync(path.join(targetDir, 'capture.json'), JSON.stringify(record, null, 2) + '\n', 'utf-8');

    console.log(`     ✓ index.html: ${htmlSize} bytes`);
    console.log(`     ✓ content.md: ${mdSize} bytes`);
    console.log(`     ✓ screenshot.png: ${ssSize} bytes`);

    return { record, internalLinks: pageInternalLinks };
  } catch (err) {
    console.error(`     ✗ Failed to capture ${pageUrl}: ${err.message}`);
    const failRecord = {
      slug,
      requestedUrl: pageUrl,
      capturedAt: new Date().toISOString(),
      status: 'error',
      error: err.message
    };
    fs.writeFileSync(path.join(targetDir, 'capture.json'), JSON.stringify(failRecord, null, 2) + '\n', 'utf-8');
    return { record: failRecord, internalLinks: [] };
  } finally {
    await page.close();
    await context.close();
  }
}

// Generate sitemap-legacy.xml for migrations
function generateSitemapLegacyXml(urls, outputPath) {
  const xmlItems = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>\n`;
  fs.writeFileSync(outputPath, xml, 'utf-8');
}

// Parse references from batch-02-branding-motion answers (Liked References)
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

    let name = domain;
    const nameMatch = line.match(/\d+\.\s*([^:]+):/i);
    if (nameMatch) name = nameMatch[1].trim();

    refs.push({ name, requestedUrl: rawUrl, cleanUrl, domain });
  }

  return refs;
}

// Main crawling orchestrator
async function crawlSite({ targetUrl, outDir, mode = 'migration', maxPages = 15, timeoutMs = 20000 }) {
  if (!chromium) {
    console.error('Playwright Chromium is required for full-page rendering and screenshots.');
    console.error('Install via: npx --yes playwright install chromium');
    process.exit(1);
  }

  console.log(`\nStarting Universal Site Fetcher...`);
  console.log(`  Target URL: ${targetUrl}`);
  console.log(`  Output Dir: ${outDir}`);
  console.log(`  Mode:       ${mode}`);
  console.log(`  Max Pages:  ${maxPages}`);

  fs.mkdirSync(outDir, { recursive: true });

  // 1. Discover URLs from sitemap / robots
  console.log(`\n[Phase 1] Probing sitemaps and robots.txt...`);
  const sitemapUrls = await discoverSitemapUrls(targetUrl);
  console.log(`  Discovered ${sitemapUrls.length} URL(s) from XML sitemaps.`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 2. Discover Home internal links
  console.log(`\n[Phase 2] Probing internal links on homepage...`);
  const homeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const homePage = await homeContext.newPage();
  let homeLinks = [];
  try {
    await homePage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    homeLinks = await extractInternalLinksFromPage(homePage, targetUrl);
    console.log(`  Found ${homeLinks.length} internal navigation link(s) on Home.`);
  } catch (e) {
    console.log(`  Notice: Initial probe encountered: ${e.message}`);
  } finally {
    await homePage.close();
    await homeContext.close();
  }

  // Combine and sample by page type
  const allDiscovered = Array.from(new Set([cleanUrlString(new URL(targetUrl)), ...sitemapUrls, ...homeLinks]));
  const pagesToCapture = clusterAndSamplePageTypes(allDiscovered, targetUrl, maxPages);

  console.log(`\n[Phase 3] Identified ${pagesToCapture.length} distinct page type(s) to capture:`);
  pagesToCapture.forEach(p => console.log(`  • [${p.slug}] -> ${p.url}`));

  // 3. Capture each page type
  console.log(`\n[Phase 4] Capturing artifacts (index.html, content.md, screenshot.png)...`);
  const results = [];
  for (const item of pagesToCapture) {
    const pageDir = path.join(outDir, item.slug);
    const { record } = await capturePageArtifacts(browser, item.url, item.slug, pageDir, timeoutMs);
    results.push(record);
  }

  await browser.close();

  // 4. Generate post-crawl indexes
  if (mode === 'migration') {
    const sitemapLegacyPath = path.join(outDir, 'sitemap-legacy.xml');
    generateSitemapLegacyXml(allDiscovered, sitemapLegacyPath);
    console.log(`\n✓ Generated ${sitemapLegacyPath} (${allDiscovered.length} legacy URLs recorded for 301 redirects)`);

    const manifestPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({
      targetUrl,
      crawledAt: new Date().toISOString(),
      totalPagesDiscovered: allDiscovered.length,
      pageTypesCaptured: results.length,
      pages: results
    }, null, 2) + '\n', 'utf-8');
    console.log(`✓ Generated ${manifestPath}`);
  }

  console.log(`\n✓ Site fetch completed successfully. Artifacts saved to: ${outDir}\n`);
}

// Orchestrator for references mode
async function crawlReferences({ briefPath, outDir, maxPages = 3, timeoutMs = 20000 }) {
  if (!chromium) {
    console.error('Playwright Chromium is required. Run: npx --yes playwright install chromium');
    process.exit(1);
  }

  const refs = parseReferencesFromBrief(briefPath);
  if (refs.length === 0) {
    console.log(`No liked reference URLs found in ${briefPath} (Q12).`);
    return;
  }

  console.log(`Found ${refs.length} design reference site(s) to process.`);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const allResults = [];

  for (const ref of refs) {
    const siteDir = path.join(outDir, ref.domain);
    console.log(`\nProcessing reference [${ref.name}] (${ref.cleanUrl})...`);

    // 1. Discover sitemap URLs and homepage links for this reference site
    const sitemapUrls = await discoverSitemapUrls(ref.cleanUrl);

    const probeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const probePage = await probeContext.newPage();
    let internalLinks = [];
    try {
      await probePage.goto(ref.cleanUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      internalLinks = await extractInternalLinksFromPage(probePage, ref.cleanUrl);
    } catch (e) {
      console.log(`  Notice: Initial probe encountered: ${e.message}`);
    } finally {
      await probePage.close();
      await probeContext.close();
    }

    const allDiscovered = Array.from(new Set([cleanUrlString(new URL(ref.cleanUrl)), ...sitemapUrls, ...internalLinks]));
    const pagesToCapture = clusterAndSamplePageTypes(allDiscovered, ref.cleanUrl, maxPages);

    console.log(`  Identified ${pagesToCapture.length} page type(s) for ${ref.name}: ${pagesToCapture.map(p => `[${p.slug}]`).join(', ')}`);

    const siteRecords = [];
    for (const item of pagesToCapture) {
      const pageDir = path.join(siteDir, item.slug);
      const { record } = await capturePageArtifacts(browser, item.url, item.slug, pageDir, timeoutMs);
      siteRecords.push(record);
    }
    allResults.push({ ref, records: siteRecords });
  }

  await browser.close();

  // Generate sources.md ledger
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

  fs.writeFileSync(path.join(outDir, 'sources.md'), sourcesContent, 'utf-8');
  console.log(`\n✓ sources.md compiled at ${path.join(outDir, 'sources.md')}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  let targetUrl = '';
  let outDir = '';
  let mode = '';
  let briefPath = '';
  let maxPages = 15;
  let timeoutMs = 20000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) targetUrl = args[++i];
    else if (args[i] === '--out' && args[i + 1]) outDir = args[++i];
    else if (args[i] === '--mode' && args[i + 1]) mode = args[++i];
    else if (args[i] === '--brief' && args[i + 1]) briefPath = args[++i];
    else if (args[i] === '--max-pages' && args[i + 1]) maxPages = parseInt(args[++i], 10);
    else if (args[i] === '--timeout' && args[i + 1]) timeoutMs = parseInt(args[++i], 10);
  }

  // Automatic mode inference if unspecified
  if (briefPath) {
    mode = mode || 'references';
    outDir = outDir || path.join(process.cwd(), 'project-docs', 'design-references');
    await crawlReferences({ briefPath: path.resolve(briefPath), outDir: path.resolve(outDir), maxPages, timeoutMs });
  } else if (targetUrl) {
    mode = mode || 'migration';
    outDir = outDir || (mode === 'migration' ? path.join(process.cwd(), 'previous-site') : path.join(process.cwd(), 'captured-site'));
    await crawlSite({ targetUrl, outDir: path.resolve(outDir), mode, maxPages, timeoutMs });
  } else {
    // Default fallback: check if brief exists in client-context/answers/batch-02-branding-motion/answers.md
    const defaultBrief = path.join(process.cwd(), 'client-context', 'answers', 'batch-02-branding-motion', 'answers.md');
    if (fs.existsSync(defaultBrief)) {
      console.log(`No arguments supplied. Found intake brief at ${defaultBrief}. Running references mode...`);
      const defaultOut = path.join(process.cwd(), 'project-docs', 'design-references');
      await crawlReferences({ briefPath: defaultBrief, outDir: defaultOut, maxPages, timeoutMs });
    } else {
      printHelp();
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error in site-fetch:', err);
    process.exit(1);
  });
}

module.exports = { crawlSite, crawlReferences, clusterAndSamplePageTypes, discoverSitemapUrls };
