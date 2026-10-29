#!/usr/bin/env node

/**
 * Universal Website Fetcher & Offline Mirror Engine (skills-by-devansh)
 *
 * 1. Stage 0 Site Migration: Crawls legacy site into `previous-site/` as a full working offline mirror.
 * 2. Stage 2 Design References: Captures benchmark examples into `project-docs/design-references/<domain>/<slug>/`.
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
  probeSiteRoutes
} = require('./lib/routes');
const { capturePageArtifacts } = require('./lib/capture');
const {
  getImageDimensionsFromBuffer,
  resolveAssetSourceRelativePath,
  harvestAndPlaceAssets
} = require('./lib/assets');
const { relativizeHtmlForOfflineMirror } = require('./lib/relativize');
const {
  generateSitemapXml,
  generateManifest,
  parseReferencesFromBrief,
  generateSourcesMd,
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
  outDir,
  mode = 'migration',
  limitMode = 'max-sampled',
  selectedPages = [],
  maxPages = 15,
  maxAssets = 200,
  skipAssets = false,
  addToGitignore = false,
  cleanExisting = true,
  timeoutMs = 25000
}) {
  const resolvedOut = path.resolve(outDir);
  if (cleanExisting) safeCleanDirectory(resolvedOut);
  else fs.mkdirSync(resolvedOut, { recursive: true });

  console.log(`\n=================================================================`);
  console.log(`  UNIVERSAL SITE FETCHER & OFFLINE MIRROR ENGINE`);
  console.log(`  Target:      ${targetUrl}`);
  console.log(`  Output Dir:  ${outDir}`);
  console.log(`  Mode:        ${mode}`);
  console.log(`  Limit Mode:  ${limitMode}`);
  console.log(`  Max Pages:   ${limitMode === 'no-limits' ? 'Unlimited' : maxPages}`);
  if (limitMode === 'selected' && selectedPages.length > 0) {
    console.log(`  Selected:    ${selectedPages.join(', ')}`);
  }
  console.log(`=================================================================`);

  const baseOrigin = new URL(targetUrl).origin;
  const browser = await launchBrowser();

  // Phase 1 & 2: Discover sitemaps and probe internal links
  console.log(`\n[Phase 1] Discovering sitemaps and route inventory...`);
  const sitemapUrls = await discoverSitemapUrls(targetUrl);
  console.log(`  Discovered ${sitemapUrls.length} URL(s) from XML sitemaps.`);

  console.log(`\n[Phase 2] Probing internal links on homepage...`);
  const { homeLinks, allDiscovered } = await probeSiteRoutes(browser, targetUrl, timeoutMs);
  console.log(`  Found ${homeLinks.length} internal navigation link(s) on Home.`);

  // Phase 3: Sample pages by limit mode
  const pagesToCapture = selectPagesToCapture(allDiscovered, targetUrl, { limitMode, maxPages, selectedPages });
  console.log(`\n[Phase 3] Limit mode: '${limitMode}' — Identified ${pagesToCapture.length} page(s) to mirror:`);
  pagesToCapture.forEach(p => console.log(`  • [${p.slug}] -> ${p.url} => ${p.relHtmlPath}`));

  // Phase 4: Capture each page
  console.log(`\n[Phase 4] Capturing pages, DOM structures, and screenshots...`);
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

  // Phase 5: Harvest and place assets
  let catalog = [];
  let writtenUrlMap = new Map();
  if (!skipAssets) {
    console.log(`\n[Phase 5] Mirroring assets into original source paths...`);
    const harvestResult = await harvestAndPlaceAssets({
      allDomAssets,
      allNetworkBuffers: mergedNetworkBuffers,
      baseOrigin,
      outDir,
      maxAssets
    });
    catalog = harvestResult.catalog;
    writtenUrlMap = harvestResult.writtenUrlMap;
  }

  // Phase 6: Relativize HTML for offline mirror
  console.log(`\n[Phase 6] Writing offline-ready HTML pages...`);
  for (const page of capturedPages) {
    if (page.status !== 'success' || !page.renderedHtml) continue;
    const relativizedHtml = relativizeHtmlForOfflineMirror(page.renderedHtml, page.pageRelHtmlPath, writtenUrlMap, baseOrigin);
    const targetHtmlFile = path.join(outDir, page.pageRelHtmlPath);
    fs.mkdirSync(path.dirname(targetHtmlFile), { recursive: true });
    fs.writeFileSync(targetHtmlFile, relativizedHtml, 'utf-8');
    console.log(`  ✓ Written ${page.pageRelHtmlPath} (${fs.statSync(targetHtmlFile).size} bytes)`);
  }

  // Generate sitemap.xml and manifest.json
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  generateSitemapXml(allDiscovered, sitemapPath);
  console.log(`✓ Generated ${sitemapPath} (${allDiscovered.length} discovered URLs)`);

  const manifestPath = path.join(outDir, 'manifest.json');
  generateManifest({ targetUrl, limitMode, selectedPages, allDiscovered, capturedPages, catalog, manifestPath });
  console.log(`\n✓ Generated ${manifestPath}`);
  console.log(`\n✓ Site mirror completed successfully!`);
  console.log(`  To view the mirrored site:`);
  console.log(`  • Open directly in Chrome: ${path.join(outDir, 'index.html')}`);
  console.log(`  • Or launch local preview server: node skills/create-nww-website/scripts/site-fetch/index.js --serve ${outDir}\n`);

  checkAndAdviseGitignore(outDir, addToGitignore);
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

function printHelp() {
  console.log(`
Universal Website Fetcher & Offline Mirror Engine (skills-by-devansh)

Usage:
  node site-fetch/index.js [options]

Options:
  --url, --target <url> Target website URL to crawl and capture.
  --out <dir>           Output directory (default: 'previous-site').
  --mode <type>         Operation mode: 'migration' (default for --url) or 'references' (for --brief).
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
  --max-assets <number> Max total assets to download during migration (default: 200).
  --skip-assets         Skip downloading media assets (harvests HTML/text only).
  --add-to-gitignore    Append output directory (e.g. previous-site/) to root .gitignore.
  --clean               Delete output directory before crawling if it already exists (default: true).
  --no-clean            Do not delete existing output directory before crawling.
  --serve <dir>         Launch zero-dependency local HTTP preview server for captured site (e.g. --serve previous-site).
  --port <number>       Port for local preview server (default: 3000).
  --timeout <ms>        Navigation timeout in milliseconds (default: 0).
  --brief, --references Design references brief file.
  --help, -h            Show this help message.

Examples:
  # Capture previous site (max 15 pages sampled by page type - Default):
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
    targetUrl: '', outDir: '', mode: '', limitMode: 'max-sampled', selectedPages: [],
    briefPath: '', maxPages: 15, maxAssets: 200, skipAssets: false, addToGitignore: false,
    cleanExisting: true, timeoutMs: 25000, serveDir: '', port: 3000
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i], v = args[i + 1];
    if ((a === '--url' || a === '--target') && v) o.targetUrl = args[++i];
    else if (a === '--out' && v) o.outDir = args[++i];
    else if (a === '--mode' && v) o.mode = args[++i];
    else if (a === '--limit-mode' && v) o.limitMode = args[++i];
    else if (a === '--pages' && v) { o.limitMode = 'selected'; o.selectedPages = args[++i].split(/[\s,]+/).filter(Boolean); }
    else if (a === '--only-homepage') o.limitMode = 'homepage';
    else if (a === '--no-limits') o.limitMode = 'no-limits';
    else if ((a === '--brief' || a === '--references') && v) o.briefPath = args[++i];
    else if (a === '--max-pages' && v) o.maxPages = parseInt(args[++i], 10);
    else if (a === '--max-assets' && v) o.maxAssets = parseInt(args[++i], 10);
    else if (a === '--skip-assets') o.skipAssets = true;
    else if (a === '--add-to-gitignore') o.addToGitignore = true;
    else if (a === '--clean') o.cleanExisting = true;
    else if (a === '--no-clean') o.cleanExisting = false;
    else if (a === '--serve' && v) o.serveDir = args[++i];
    else if (a === '--port' && v) o.port = parseInt(args[++i], 10);
    else if (a === '--timeout' && v) o.timeoutMs = parseInt(args[++i], 10);
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

  if (opts.briefPath) {
    opts.mode = opts.mode || 'references';
    opts.outDir = opts.outDir || path.join(process.cwd(), 'project-docs', 'design-references');
    await crawlReferences({
      briefPath: path.resolve(opts.briefPath),
      outDir: path.resolve(opts.outDir),
      maxPages: opts.maxPages || 3,
      cleanExisting: opts.cleanExisting,
      timeoutMs: opts.timeoutMs
    });
  } else if (opts.targetUrl) {
    opts.mode = opts.mode || 'migration';
    opts.outDir = opts.outDir || path.join(process.cwd(), 'previous-site');
    await crawlSite({
      targetUrl: opts.targetUrl,
      outDir: path.resolve(opts.outDir),
      mode: opts.mode,
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
    const defaultBrief = path.join(process.cwd(), 'client-context', 'answers', 'batch-02-branding-motion', 'answers.md');
    if (fs.existsSync(defaultBrief)) {
      console.log(`No arguments supplied. Found intake brief at ${defaultBrief}. Running references mode...`);
      const defaultOut = path.join(process.cwd(), 'project-docs', 'design-references');
      await crawlReferences({
        briefPath: defaultBrief,
        outDir: defaultOut,
        maxPages: opts.maxPages || 3,
        cleanExisting: opts.cleanExisting,
        timeoutMs: opts.timeoutMs
      });
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

module.exports = {
  crawlSite,
  crawlReferences,
  selectPagesToCapture,
  clusterAndSamplePageTypes,
  discoverSitemapUrls,
  generateSitemapXml,
  startPreviewServer,
  getImageDimensionsFromBuffer,
  resolveAssetSourceRelativePath,
  relativizeHtmlForOfflineMirror,
  parseReferencesFromBrief
};
