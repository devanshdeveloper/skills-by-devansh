#!/usr/bin/env node

/**
 * Universal Website Fetcher & Offline Mirror Engine (skills-by-devansh)
 *
 * Crawls and archives websites into a full working offline mirror:
 * - Root `previous-site/index.html` (works locally out-of-the-box).
 * - Subpages in `previous-site/<path>/index.html` with `content.md` and `screenshot.png`.
 * - All assets placed in their original source paths.
 * - Relativized asset references, links, and offline hardening shim.
 * - Complete route and asset catalog in `previous-site/manifest.json` and `sitemap.xml`.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const { launchBrowser } = require('./lib/browser');
const {
  cleanUrlString,
  discoverSitemapUrls,
  urlToPageMapping,
  clusterAndSamplePageTypes,
  selectPagesToCapture,
  discoverSiteRoutes
} = require('./lib/discovery');
const { capturePageArtifacts } = require('./lib/capture');
const {
  getImageDimensionsFromBuffer,
  resolveAssetSourceRelativePath,
  harvestAndPlaceAssets
} = require('./lib/harvest');
const { hardenAndRelativizeHtml } = require('./lib/hardening');
const {
  generateSitemapXml,
  generateManifest,
  checkAndAdviseGitignore
} = require('./lib/manifest');
const { startPreviewServer } = require('./lib/preview');

function safeCleanDirectory(targetDir) {
  const resolved = path.resolve(targetDir);
  const cwd = process.cwd();
  const rootDir = path.parse(resolved).root;

  if (fs.existsSync(resolved) && resolved !== cwd && resolved !== rootDir) {
    console.log(`\n[Clean Start] Existing '${path.basename(resolved)}' directory detected. Deleting previous files for fresh crawl...`);
    fs.rmSync(resolved, { recursive: true, force: true });
    console.log(`  ✓ Successfully deleted existing '${path.basename(resolved)}' directory.`);
  }
  fs.mkdirSync(resolved, { recursive: true });
}

async function crawlSite({
  targetUrl,
  outDir = 'previous-site',
  limitMode = 'max-sampled',
  selectedPages = [],
  maxPages = 15,
  maxAssets = 1000,
  skipAssets = false,
  addToGitignore = false,
  cleanExisting = true,
  timeoutMs = 25000
}) {
  const resolvedOut = path.resolve(outDir);
  if (cleanExisting) safeCleanDirectory(resolvedOut);
  else fs.mkdirSync(resolvedOut, { recursive: true });

  const effectiveMaxAssets = (limitMode === 'no-limits' && maxAssets === 1000) ? Infinity : maxAssets;

  console.log(`\n=================================================================`);
  console.log(`  UNIVERSAL SITE FETCHER & OFFLINE MIRROR ENGINE`);
  console.log(`  Target:      ${targetUrl}`);
  console.log(`  Output Dir:  ${outDir}`);
  console.log(`  Limit Mode:  ${limitMode}`);
  console.log(`  Max Pages:   ${limitMode === 'no-limits' ? 'Unlimited' : maxPages}`);
  console.log(`  Max Assets:  ${effectiveMaxAssets === Infinity ? 'Unlimited' : effectiveMaxAssets}`);
  if (limitMode === 'selected' && selectedPages.length > 0) {
    console.log(`  Selected:    ${selectedPages.join(', ')}`);
  }
  console.log(`=================================================================`);

  const baseOrigin = new URL(targetUrl).origin;
  const browser = await launchBrowser();

  // Phase 1: Route Discovery (Sitemaps & Internal Links)
  console.log(`\n=================================================================`);
  console.log(`  [PHASE 1] ROUTE & SITEMAP DISCOVERY`);
  console.log(`=================================================================`);
  const sitemapUrls = await discoverSitemapUrls(targetUrl);
  console.log(`  • Discovering XML sitemaps... Found ${sitemapUrls.length} route(s).`);

  const { homeLinks, allDiscovered } = await discoverSiteRoutes(browser, targetUrl, timeoutMs);
  console.log(`  • Probing homepage internal navigation... Found ${homeLinks.length} link(s).`);

  console.log(`\n┌────────────────────────────────────────────────────────┐`);
  console.log(`│ [Phase 1 Report] Route Discovery Complete             │`);
  console.log(`├─────────────────────────┬──────────────────────────────┤`);
  console.log(`│ XML Sitemap Routes      │ ${String(sitemapUrls.length).padEnd(28)} │`);
  console.log(`│ Internal Navigation     │ ${String(homeLinks.length).padEnd(28)} │`);
  console.log(`│ Total Unique Routes     │ ${String(allDiscovered.length).padEnd(28)} │`);
  console.log(`└─────────────────────────┴──────────────────────────────┘`);

  // Phase 2: Page Selection & Strategy
  console.log(`\n=================================================================`);
  console.log(`  [PHASE 2] STRATEGY & PAGE SELECTION`);
  console.log(`=================================================================`);
  const pagesToCapture = selectPagesToCapture(allDiscovered, targetUrl, { limitMode, maxPages, selectedPages });
  pagesToCapture.forEach(p => console.log(`  • [${p.slug}] -> ${p.url} => ${p.relHtmlPath}`));

  console.log(`\n┌────────────────────────────────────────────────────────┐`);
  console.log(`│ [Phase 2 Report] Page Selection Complete              │`);
  console.log(`├─────────────────────────┬──────────────────────────────┤`);
  console.log(`│ Strategy (Limit Mode)   │ ${String(limitMode).padEnd(28)} │`);
  console.log(`│ Pages Targeted          │ ${String(pagesToCapture.length).padEnd(28)} │`);
  console.log(`│ Max Quota               │ ${String(limitMode === 'no-limits' ? 'Unlimited' : maxPages).padEnd(28)} │`);
  console.log(`└─────────────────────────┴──────────────────────────────┘`);

  // Phase 3: DOM, Content & Screenshot Capture
  console.log(`\n=================================================================`);
  console.log(`  [PHASE 3] PAGE CAPTURE (DOM, MARKDOWN, SCREENSHOTS)`);
  console.log(`=================================================================`);
  const capturedPages = [];
  const allDomAssets = [];
  const mergedNetworkBuffers = new Map();

  for (const item of pagesToCapture) {
    const res = await capturePageArtifacts(browser, item.url, item.slug, item.relHtmlPath, outDir, timeoutMs);
    capturedPages.push(res);
    if (res.status === 'success') {
      res.domAssets.forEach(a => allDomAssets.push({ ...a, pageSlug: item.slug }));
      for (const [k, v] of res.networkBuffers) {
        if (!mergedNetworkBuffers.has(k)) mergedNetworkBuffers.set(k, v);
      }
    }
  }

  await browser.close();

  const successfulCaptures = capturedPages.filter(p => p.status === 'success').length;
  console.log(`\n┌────────────────────────────────────────────────────────┐`);
  console.log(`│ [Phase 3 Report] Page Capture Complete                │`);
  console.log(`├─────────────────────────┬──────────────────────────────┤`);
  console.log(`│ Pages Successfully Read │ ${String(`${successfulCaptures} / ${pagesToCapture.length}`).padEnd(28)} │`);
  console.log(`│ Asset Slots Detected    │ ${String(allDomAssets.length).padEnd(28)} │`);
  console.log(`│ Network Buffers Cached  │ ${String(mergedNetworkBuffers.size).padEnd(28)} │`);
  console.log(`└─────────────────────────┴──────────────────────────────┘`);

  // Phase 4: Asset Harvesting & Source Placement
  let catalog = [];
  let writtenUrlMap = new Map();
  let relativizedCssCount = 0;
  if (!skipAssets) {
    console.log(`\n=================================================================`);
    console.log(`  [PHASE 4] ASSET HARVESTING & SOURCE PLACEMENT`);
    console.log(`=================================================================`);
    const harvestResult = await harvestAndPlaceAssets({
      allDomAssets,
      allNetworkBuffers: mergedNetworkBuffers,
      baseOrigin,
      outDir,
      maxAssets: effectiveMaxAssets
    });
    catalog = harvestResult.catalog;
    writtenUrlMap = harvestResult.writtenUrlMap;
    relativizedCssCount = harvestResult.relativizedCssCount || 0;

    const highResCount = catalog.filter(a => a.qualityStatus === 'high-res').length;
    const vectorCount = catalog.filter(a => a.qualityStatus === 'vector').length;

    console.log(`\n┌────────────────────────────────────────────────────────┐`);
    console.log(`│ [Phase 4 Report] Asset Harvesting Complete            │`);
    console.log(`├─────────────────────────┬──────────────────────────────┤`);
    console.log(`│ Assets Written to Disk  │ ${String(catalog.length).padEnd(28)} │`);
    console.log(`│ High-Resolution Media   │ ${String(highResCount).padEnd(28)} │`);
    console.log(`│ Vectors & Icons         │ ${String(vectorCount).padEnd(28)} │`);
    console.log(`│ Stylesheets Relativized │ ${String(relativizedCssCount).padEnd(28)} │`);
    console.log(`└─────────────────────────┴──────────────────────────────┘`);
  }

  // Phase 5: Offline Hardening & HTML Relativization
  console.log(`\n=================================================================`);
  console.log(`  [PHASE 5] OFFLINE HARDENING & HTML RELATIVIZATION`);
  console.log(`=================================================================`);
  let hardenedCount = 0;
  for (const page of capturedPages) {
    if (page.status !== 'success' || !page.renderedHtml) continue;
    const relativizedHtml = hardenAndRelativizeHtml(page.renderedHtml, page.pageRelHtmlPath, writtenUrlMap, baseOrigin);
    const targetHtmlFile = path.join(outDir, page.pageRelHtmlPath);
    fs.mkdirSync(path.dirname(targetHtmlFile), { recursive: true });
    fs.writeFileSync(targetHtmlFile, relativizedHtml, 'utf-8');
    hardenedCount++;
    console.log(`  ✓ Written ${page.pageRelHtmlPath} (${fs.statSync(targetHtmlFile).size} bytes)`);
  }

  console.log(`\n┌────────────────────────────────────────────────────────┐`);
  console.log(`│ [Phase 5 Report] Offline Hardening Complete           │`);
  console.log(`├─────────────────────────┬──────────────────────────────┤`);
  console.log(`│ Offline Pages Written   │ ${String(hardenedCount).padEnd(28)} │`);
  console.log(`│ Hardening Protections   │ ${String('CSP Strip, Eager, Shim').padEnd(28)} │`);
  console.log(`└─────────────────────────┴──────────────────────────────┘`);

  // Phase 6: Catalog & Sitemap Generation
  console.log(`\n=================================================================`);
  console.log(`  [PHASE 6] CATALOG & SITEMAP GENERATION`);
  console.log(`=================================================================`);
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  generateSitemapXml(allDiscovered, sitemapPath);
  console.log(`  ✓ Generated ${sitemapPath} (${allDiscovered.length} discovered URLs)`);

  const manifestPath = path.join(outDir, 'manifest.json');
  generateManifest({ targetUrl, limitMode, selectedPages, allDiscovered, capturedPages, catalog, manifestPath });
  console.log(`  ✓ Generated ${manifestPath}`);

  console.log(`\n┌────────────────────────────────────────────────────────┐`);
  console.log(`│ [Phase 6 Report] Final Catalog Ready                  │`);
  console.log(`├─────────────────────────┬──────────────────────────────┤`);
  console.log(`│ Sitemap XML             │ ${String('sitemap.xml').padEnd(28)} │`);
  console.log(`│ Site Manifest JSON      │ ${String('manifest.json').padEnd(28)} │`);
  console.log(`└─────────────────────────┴──────────────────────────────┘`);

  console.log(`\n=================================================================`);
  console.log(`✓ SITE MIRROR COMPLETED SUCCESSFULLY!`);
  console.log(`  To view the mirrored site:`);
  console.log(`  • Open directly in Chrome: ${path.join(outDir, 'index.html')}`);
  console.log(`  • Or launch local preview server: node skills/create-nww-website/scripts/site-fetch/index.js --serve ${outDir}`);
  console.log(`=================================================================\n`);

  checkAndAdviseGitignore(outDir, addToGitignore);
}

function printHelp() {
  console.log(`
Universal Website Fetcher & Offline Mirror Engine (skills-by-devansh)

Usage:
  node site-fetch/index.js [options]

Options:
  --url, --target <url> Target website URL to crawl and capture.
  --out <dir>           Output directory (default: 'previous-site').
  --limit-mode <mode>   Crawling limit strategy:
                          • max-sampled   : Max 15 pages [at least one per page type] (Default)
                          • no-limits     : No limits [crawls all discovered pages]
                          • max-any       : Max 15 pages [any pages in discovery order]
                          • homepage      : Only homepage [1 page only]
                          • selected      : Selected pages only (provide via --pages)
  --pages <list>        Comma-separated list of routes/URLs for 'selected' mode (e.g. "/,/about,/pricing").
  --max-pages <number>  Max pages to capture for max-sampled / max-any (default: 15).
  --only-homepage       Shortcut alias for --limit-mode homepage.
  --no-limits           Shortcut alias for --limit-mode no-limits.
  --max-assets <number> Max total assets to download (default: 1000, or unlimited for no-limits).
  --skip-assets         Skip downloading media assets (harvests HTML/text only).
  --add-to-gitignore    Append output directory (e.g. previous-site/) to root .gitignore.
  --clean               Delete output directory before crawling if it already exists (default: true).
  --no-clean            Do not delete existing output directory before crawling.
  --serve <dir>         Launch zero-dependency local HTTP preview server for captured site (e.g. --serve previous-site).
  --port <number>       Port for local preview server (default: 3000).
  --timeout <ms>        Navigation timeout in milliseconds (default: 0).
  --help, -h            Show this help message.

Examples:
  # Capture site (max 15 pages sampled by page type - Default):
  node site-fetch/index.js --url https://old-site.com --out previous-site

  # Capture entire site with no page limits:
  node site-fetch/index.js --url https://old-site.com --out previous-site --limit-mode no-limits

  # Capture only homepage:
  node site-fetch/index.js --url https://old-site.com --out previous-site --only-homepage

  # Capture specific selected pages:
  node site-fetch/index.js --url https://old-site.com --out previous-site --limit-mode selected --pages "/,/about,/services,/contact"

  # Preview captured site on local HTTP server:
  node site-fetch/index.js --serve previous-site
`);
}

function parseCliArgs(args) {
  const o = {
    targetUrl: '', outDir: '', limitMode: 'max-sampled', selectedPages: [],
    maxPages: 15, maxAssets: 1000, skipAssets: false, addToGitignore: false,
    cleanExisting: true, timeoutMs: 25000, serveDir: '', port: 3000
  };

  let maxAssetsSet = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i], v = args[i + 1];
    if ((a === '--url' || a === '--target') && v) o.targetUrl = args[++i];
    else if (a === '--out' && v) o.outDir = args[++i];
    else if (a === '--limit-mode' && v) o.limitMode = args[++i];
    else if (a === '--pages' && v) { o.limitMode = 'selected'; o.selectedPages = args[++i].split(/[\s,]+/).filter(Boolean); }
    else if (a === '--only-homepage') o.limitMode = 'homepage';
    else if (a === '--no-limits') o.limitMode = 'no-limits';
    else if (a === '--max-pages' && v) o.maxPages = parseInt(args[++i], 10);
    else if (a === '--max-assets' && v) { o.maxAssets = parseInt(args[++i], 10); maxAssetsSet = true; }
    else if (a === '--skip-assets') o.skipAssets = true;
    else if (a === '--add-to-gitignore') o.addToGitignore = true;
    else if (a === '--clean') o.cleanExisting = true;
    else if (a === '--no-clean') o.cleanExisting = false;
    else if (a === '--serve' && v) o.serveDir = args[++i];
    else if (a === '--port' && v) o.port = parseInt(args[++i], 10);
    else if (a === '--timeout' && v) o.timeoutMs = parseInt(args[++i], 10);
  }

  if (!maxAssetsSet && (o.limitMode === 'no-limits' || o.limitMode === 'unlimited' || o.limitMode === 'all')) {
    o.maxAssets = Infinity;
  }

  return o;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const opts = parseCliArgs(args);

  if (opts.serveDir) {
    startPreviewServer(opts.serveDir, opts.port, true);
    return;
  }

  if (opts.targetUrl) {
    await crawlSite({
      targetUrl: opts.targetUrl,
      outDir: path.resolve(opts.outDir || path.join(process.cwd(), 'previous-site')),
      limitMode: opts.limitMode,
      selectedPages: opts.selectedPages,
      maxPages: opts.maxPages,
      maxAssets: opts.maxAssets,
      skipAssets: opts.skipAssets,
      addToGitignore: opts.addToGitignore,
      cleanExisting: opts.cleanExisting,
      timeoutMs: opts.timeoutMs
    });
  } else {
    printHelp();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error in site-fetch:', err);
    process.exit(1);
  });
}

module.exports = {
  crawlSite,
  selectPagesToCapture,
  clusterAndSamplePageTypes,
  discoverSitemapUrls,
  generateSitemapXml,
  startPreviewServer,
  getImageDimensionsFromBuffer,
  resolveAssetSourceRelativePath,
  relativizeHtmlForOfflineMirror
};
