#!/usr/bin/env node

/**
 * Universal Website Fetcher & Offline Mirror Engine
 *
 * Fetches, crawls, and mirrors websites for:
 * 1. Stage 0 Site Migration: Crawls legacy site before Gate 1 into `previous-site/`
 *    as a full working offline mirror:
 *    - Root `previous-site/index.html` (works as it is when opened in a browser).
 *    - Subpages in `previous-site/<path>/index.html` with `content.md` and `screenshot.png`.
 *    - All assets (images, stylesheets, scripts, fonts, icons, PDFs) placed in their original source paths.
 *    - Relativized asset references and links so the site works offline out-of-the-box.
 *    - Complete route and asset catalog in `previous-site/manifest.json` for Gate 0 Batch 4 and Stage 4 301 redirects.
 *    - Zero `legacy.xml` or separate `media/` folder.
 * 2. Stage 2 Design References: Captures benchmark examples into `project-docs/design-references/<domain>/<slug>/`
 *    and compiles `sources.md`.
 *
 * Usage:
 *   # Migrate previous website into full working mirror:
 *   node skills/create-nww-website/scripts/site-fetch/index.js --url https://legacy.com --out previous-site --mode migration
 *
 *   # Capture design reference examples from batch-02-branding-motion/answers.md:
 *   node skills/create-nww-website/scripts/site-fetch/index.js --brief client-context/answers/batch-02-branding-motion/answers.md --out project-docs/design-references --mode references
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');
const { URL } = require('node:url');

// Resolve Playwright Chromium
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
Universal Website Fetcher & Offline Mirror Engine (skills-by-devansh)

Usage:
  node site-fetch/index.js [options]

Options:
  --url <url>           Target website URL to crawl and capture.
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
  --serve <dir>         Launch zero-dependency local HTTP preview server for captured site (e.g. --serve previous-site).
  --port <number>       Port for local preview server (default: 3000).
  --timeout <ms>        Navigation timeout in milliseconds (default: 25000).
  --help                Show this help message.

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

// Simple HTTP/HTTPS GET text helper
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

// HTTP/HTTPS GET binary buffer helper
function fetchBuffer(targetUrl, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        timeout: timeoutMs
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return resolve(fetchBuffer(redirectUrl, timeoutMs));
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`));
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || '' }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Buffer download timeout')); });
    } catch (e) {
      reject(e);
    }
  });
}

// Lightweight pure-JS image dimension reader from buffer headers
function getImageDimensionsFromBuffer(buffer) {
  if (!buffer || buffer.length < 24) return null;
  try {
    // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height, format: 'png' };
    }
    // 2. GIF: GIF87a or GIF89a
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height, format: 'gif' };
    }
    // 3. WebP: RIFF ... WEBP
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      const type = buffer.toString('ascii', 12, 16);
      if (type === 'VP8 ' && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height, format: 'webp' };
      }
      if (type === 'VP8L' && buffer.length >= 25) {
        const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height, format: 'webp' };
      }
      if (type === 'VP8X' && buffer.length >= 30) {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height, format: 'webp' };
      }
    }
    // 4. JPEG: FF D8
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) { offset++; continue; }
        const marker = buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, format: 'jpeg' };
        }
        const len = buffer.readUInt16BE(offset + 2);
        offset += 2 + len;
      }
    }
    // 5. SVG
    const snippet = buffer.toString('utf-8', 0, Math.min(2048, buffer.length));
    if (snippet.includes('<svg')) {
      const vbMatch = snippet.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
      if (vbMatch) {
        return { width: Math.round(parseFloat(vbMatch[1])), height: Math.round(parseFloat(vbMatch[2])), format: 'svg' };
      }
      const wMatch = snippet.match(/width\s*=\s*["'](\d+)(?:px)?["']/i);
      const hMatch = snippet.match(/height\s*=\s*["'](\d+)(?:px)?["']/i);
      if (wMatch && hMatch) {
        return { width: parseInt(wMatch[1], 10), height: parseInt(hMatch[1], 10), format: 'svg' };
      }
      return { width: null, height: null, format: 'svg' };
    }
  } catch {}
  return null;
}

// Generate standard sitemap.xml for legacy site routes
function generateSitemapXml(urls, outputPath) {
  const xmlItems = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>\n`;
  fs.writeFileSync(outputPath, xml, 'utf-8');
}

// Clean URL string helper
function cleanUrlString(parsedUrl) {
  return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.replace(/\/+$/, '') || '/'}`;
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

// Convert URL pathname to clean slug and local relative HTML file path
function urlToPageMapping(urlString, baseUrl) {
  try {
    const u = new URL(urlString);
    const cleanPath = u.pathname.replace(/^\/+|\/+$/g, '');
    if (!cleanPath) {
      return { slug: 'home', relHtmlPath: 'index.html', dirPath: '' };
    }
    const slug = cleanPath.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'page';
    // Subpages become <slug>/index.html so opening <slug>/index.html works cleanly in a directory structure
    const relHtmlPath = path.posix.join(cleanPath, 'index.html');
    return { slug, relHtmlPath, dirPath: cleanPath };
  } catch {
    return { slug: 'page', relHtmlPath: 'page/index.html', dirPath: 'page' };
  }
}

// Cluster URLs by path pattern to ensure we sample at least each distinct page type
function clusterAndSamplePageTypes(urlList, baseUrl, maxPages = 15) {
  const baseParsed = new URL(baseUrl);
  const homeUrl = cleanUrlString(baseParsed);
  const selected = new Map(); // slug -> item

  const homeMapping = urlToPageMapping(homeUrl, baseUrl);
  selected.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

  const patternBuckets = new Map();

  for (const raw of urlList) {
    try {
      const u = new URL(raw);
      if (u.origin !== baseParsed.origin) continue;
      const clean = cleanUrlString(u);
      if (clean === homeUrl) continue;

      const segments = u.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      if (segments.length === 0) continue;

      let patternKey = segments.length === 1 ? `static:${segments[0]}` : `collection:${segments[0]}`;
      if (!patternBuckets.has(patternKey)) patternBuckets.set(patternKey, []);
      patternBuckets.get(patternKey).push(clean);
    } catch {}
  }

  // 1. Prioritize top-level static pages (About, Services, Contact, Pricing, etc.)
  for (const [key, urls] of patternBuckets.entries()) {
    if (key.startsWith('static:') && selected.size < maxPages) {
      const mapping = urlToPageMapping(urls[0], baseUrl);
      if (!selected.has(mapping.slug)) selected.set(mapping.slug, { ...mapping, url: urls[0] });
    }
  }

  // 2. Sample representative items from collections (e.g. 1 blog post, 1 product)
  for (const [key, urls] of patternBuckets.entries()) {
    if (key.startsWith('collection:') && selected.size < maxPages) {
      const sampleCount = Math.min(2, urls.length);
      for (let i = 0; i < sampleCount && selected.size < maxPages; i++) {
        const mapping = urlToPageMapping(urls[i], baseUrl);
        let slugKey = mapping.slug;
        if (selected.has(slugKey)) slugKey = `${slugKey}-${i + 1}`;
        selected.set(slugKey, { ...mapping, slug: slugKey, url: urls[i] });
      }
    }
  }

  // 3. Fill remaining quota
  for (const [, urls] of patternBuckets.entries()) {
    for (const u of urls) {
      if (selected.size >= maxPages) break;
      const mapping = urlToPageMapping(u, baseUrl);
      if (!selected.has(mapping.slug)) selected.set(mapping.slug, { ...mapping, url: u });
    }
  }

  return Array.from(selected.values());
}

// Select pages to crawl based on the user-specified limit mode
function selectPagesToCapture(urlList, baseUrl, options = {}) {
  const limitMode = (options.limitMode || 'max-sampled').toLowerCase();
  const maxPages = options.maxPages !== undefined ? options.maxPages : 15;
  const selectedPages = options.selectedPages || [];

  const baseParsed = new URL(baseUrl);
  const homeUrl = cleanUrlString(baseParsed);
  const homeMapping = urlToPageMapping(homeUrl, baseUrl);

  // 1. Limit Mode: only homepage
  if (limitMode === 'homepage' || limitMode === 'only-homepage' || limitMode === 'home') {
    return [{ ...homeMapping, url: homeUrl }];
  }

  // 2. Limit Mode: selected pages
  if (limitMode === 'selected' || limitMode === 'selected-pages') {
    let rawList = [];
    if (typeof selectedPages === 'string') {
      rawList = selectedPages.split(/[\s,]+/).filter(Boolean);
    } else if (Array.isArray(selectedPages)) {
      rawList = selectedPages.filter(Boolean);
    }

    const pages = new Map();
    // Always include home as the root anchor
    pages.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

    for (const item of rawList) {
      try {
        let fullUrl = item.startsWith('http') ? item : new URL(item.replace(/^\/+/, ''), baseParsed.origin + '/').href;
        const u = new URL(fullUrl);
        if (u.origin === baseParsed.origin) {
          const clean = cleanUrlString(u);
          const mapping = urlToPageMapping(clean, baseUrl);
          if (!pages.has(mapping.slug)) {
            pages.set(mapping.slug, { ...mapping, url: clean });
          }
        }
      } catch {}
    }
    return Array.from(pages.values());
  }

  // 3. Limit Mode: no limits (crawl all discovered pages)
  if (limitMode === 'no-limits' || limitMode === 'unlimited' || limitMode === 'all') {
    const pages = new Map();
    pages.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

    for (const raw of urlList) {
      try {
        const u = new URL(raw);
        if (u.origin !== baseParsed.origin) continue;
        const clean = cleanUrlString(u);
        if (clean === homeUrl) continue;
        const mapping = urlToPageMapping(clean, baseUrl);
        let slugKey = mapping.slug;
        let counter = 1;
        while (pages.has(slugKey) && pages.get(slugKey).url !== clean) {
          slugKey = `${mapping.slug}-${counter++}`;
        }
        if (!pages.has(slugKey)) {
          pages.set(slugKey, { ...mapping, slug: slugKey, url: clean });
        }
      } catch {}
    }
    return Array.from(pages.values());
  }

  // 4. Limit Mode: max 15 pages [any pages] (discovery order / FIFO without clustering)
  if (limitMode === 'max-any' || limitMode === 'any' || limitMode === 'fifo') {
    const pages = new Map();
    pages.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

    for (const raw of urlList) {
      if (pages.size >= maxPages) break;
      try {
        const u = new URL(raw);
        if (u.origin !== baseParsed.origin) continue;
        const clean = cleanUrlString(u);
        if (clean === homeUrl) continue;
        const mapping = urlToPageMapping(clean, baseUrl);
        if (!pages.has(mapping.slug)) {
          pages.set(mapping.slug, { ...mapping, url: clean });
        }
      } catch {}
    }
    return Array.from(pages.values());
  }

  // 5. Limit Mode: max 15 pages [at least one per page type] (Default: intelligent clustering)
  return clusterAndSamplePageTypes(urlList, baseUrl, maxPages);
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
            return u.origin === orig && !u.pathname.match(/\.(pdf|zip|png|jpg|jpeg|svg|webp|mp4|css|js)$/i);
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

// Extract all visual and downloadable asset references directly from the rendered DOM
async function extractAssetsFromPageDom(page, pageUrl, baseUrl) {
  try {
    return await page.evaluate((context) => {
      const assets = [];
      const baseOrigin = new URL(context.baseUrl).origin;

      // 1. <img> tags (including lazy, data-src, and srcset)
      document.querySelectorAll('img').forEach((img) => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
        if (!src || src.startsWith('data:')) return;
        assets.push({
          url: src,
          alt: img.alt || '',
          naturalWidth: img.naturalWidth || 0,
          naturalHeight: img.naturalHeight || 0,
          type: 'image',
          tagName: 'img'
        });

        // Parse srcset candidates
        const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (srcset) {
          srcset.split(',').forEach((part) => {
            const candidateUrl = part.trim().split(/\s+/)[0];
            if (candidateUrl && !candidateUrl.startsWith('data:')) {
              assets.push({ url: candidateUrl, alt: img.alt || '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'srcset' });
            }
          });
        }
      });

      // 2. <picture><source> elements
      document.querySelectorAll('picture source').forEach((srcEl) => {
        const srcset = srcEl.getAttribute('srcset');
        if (srcset) {
          srcset.split(',').forEach((part) => {
            const candidateUrl = part.trim().split(/\s+/)[0];
            if (candidateUrl && !candidateUrl.startsWith('data:')) {
              assets.push({ url: candidateUrl, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'picture-source' });
            }
          });
        }
      });

      // 3. Stylesheets & Favicons & Meta Images
      document.querySelectorAll('link[rel*="stylesheet"], link[rel*="icon"]').forEach((link) => {
        if (link.href && !link.href.startsWith('data:')) {
          assets.push({ url: link.href, alt: '', naturalWidth: 0, naturalHeight: 0, type: link.rel.includes('stylesheet') ? 'stylesheet' : 'icon', tagName: 'link' });
        }
      });

      document.querySelectorAll('meta[property*="image"], meta[name*="image"]').forEach((meta) => {
        const content = meta.getAttribute('content');
        if (content && !content.startsWith('data:')) {
          assets.push({ url: content, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'meta-image' });
        }
      });

      // 4. Scripts
      document.querySelectorAll('script[src]').forEach((script) => {
        if (script.src && !script.src.startsWith('data:')) {
          assets.push({ url: script.src, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'script', tagName: 'script' });
        }
      });

      // 5. Downloadable documents (PDFs, docs) & SVG anchors
      document.querySelectorAll('a[href]').forEach((a) => {
        const href = a.href;
        if (!href) return;
        if (/\.(pdf|docx?|xlsx?|pptx?)$/i.test(href)) {
          assets.push({ url: href, alt: a.innerText.trim(), naturalWidth: 0, naturalHeight: 0, type: 'document', tagName: 'a-doc' });
        } else if (/\.svg$/i.test(href)) {
          assets.push({ url: href, alt: a.innerText.trim(), naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'a-svg' });
        }
      });

      // 6. Background images in inline styles
      document.querySelectorAll('[style*="background"]').forEach((el) => {
        const style = el.getAttribute('style') || '';
        const match = style.match(/url\(['"]?(.*?)['"]?\)/i);
        if (match && match[1] && !match[1].startsWith('data:')) {
          assets.push({ url: match[1], alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'bg-style' });
        }
      });

      return assets;
    }, { baseUrl, pageUrl });
  } catch {
    return [];
  }
}

// Map any asset URL to its source-mirrored destination path relative to outDir
function resolveAssetSourceRelativePath(assetUrl, baseOrigin) {
  try {
    const u = new URL(assetUrl);
    let p = decodeURIComponent(u.pathname);
    // Remove query params or hash
    p = p.replace(/^\/+/, '');
    if (!p) p = 'index-asset';

    // If on same origin or subdomains of same root: place directly at source pathname
    const isSameHost = u.origin === baseOrigin || u.hostname.endsWith(new URL(baseOrigin).hostname);
    if (isSameHost) {
      return p;
    }

    // If external CDN/third-party: mirror under original hostname directory
    return path.posix.join('_cdn', u.hostname, p);
  } catch {
    return path.posix.join('assets', path.basename(assetUrl).split('?')[0] || 'asset.bin');
  }
}

// Convert absolute URLs and root-relative URLs in rendered HTML to relative paths so index.html works offline
function relativizeHtmlForOfflineMirror(html, pageRelHtmlPath, assetMap, baseOrigin) {
  let updated = html;

  // 1. Remove existing <base> tags and restrictive Content-Security-Policy headers that break local file:// loading in Chrome
  updated = updated.replace(/<base\s+[^>]*>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');

  const pageDepth = pageRelHtmlPath === 'index.html' ? 0 : pageRelHtmlPath.split('/').length - 1;
  const prefix = pageDepth === 0 ? './' : '../'.repeat(pageDepth);

  // 2. Replace harvested asset URLs with their local relative path
  for (const [rawUrl, localRelPath] of assetMap.entries()) {
    const relativeTarget = prefix + localRelPath.replace(/^\/+/, '');
    // Replace verbatim URL occurrences
    const escapedUrl = rawUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updated = updated.replace(new RegExp(escapedUrl, 'g'), relativeTarget);

    // Also replace root-relative variant of same-origin URLs
    try {
      const u = new URL(rawUrl);
      if (u.origin === baseOrigin) {
        const rootRel = u.pathname;
        if (rootRel && rootRel !== '/') {
          const escapedRootRel = rootRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Match inside attribute quotes
          updated = updated.replace(new RegExp(`(["'])${escapedRootRel}(["'\\?])`, 'g'), `$1${relativeTarget}$2`);
        }
      }
    } catch {}
  }

  // 3. Relativize remaining root-relative href and src attributes pointing to internal paths
  updated = updated.replace(/(href|src)=["']\/([^"'#?]+)(["'#?])/gi, (match, attr, rootPath, closer) => {
    // If it's already an external scheme, ignore
    if (rootPath.startsWith('//') || rootPath.startsWith('http')) return match;
    const rel = prefix + rootPath;
    return `${attr}="${rel}${closer}`;
  });

  // 4. Ensure internal navigation links point to <path>/index.html for seamless direct file:// browsing in Chrome
  updated = updated.replace(/href=["'](\.\/|\.\.\/)?([a-zA-Z0-9_\-\/]+)\/?(["'#?])/gi, (match, relPrefix, pathPart, closer) => {
    // Skip if pointing to file with an extension, hash link, or mailto/tel
    if (pathPart.includes('.') || pathPart.startsWith('#') || pathPart.startsWith('mailto:') || pathPart.startsWith('tel:')) return match;
    const p = (relPrefix || '') + pathPart.replace(/\/+$/, '') + '/index.html';
    return `href="${p}${closer}`;
  });

  // 5. Neutralize type="module" on local scripts to prevent Chrome's origin 'null' CORS block from aborting page execution
  updated = updated.replace(/<script\s+([^>]*?)type=["']module["']([^>]*?)>/gi, '<script $1data-offline-module=""$2>');

  // 6. Inject offline hardening shim (suppresses runtime crashes on file:// and ensures body/html visibility if preloader hangs)
  const offlineShim = `
  <script>
    /* Offline Mirror Guard: Suppress file:// CORS and framework hydration crashes in Chrome */
    window.onerror = function() { return true; };
    window.onunhandledrejection = function(e) { if (e && e.preventDefault) e.preventDefault(); };
  </script>
  <style id="antigravity-offline-reset">
    /* Force page visibility and dismiss blocking preloaders in local Chrome offline browsing */
    html, body {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    }
    #preloader, .preloader, [class*="preloader"], [id*="preloader"],
    [class*="loading-screen"], [id*="loading-screen"], [class*="loader-wrapper"],
    .page-loader, #page-loader {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  </style>`;

  if (updated.includes('</head>')) {
    updated = updated.replace('</head>', `${offlineShim}\n</head>`);
  } else if (updated.includes('<body')) {
    updated = updated.replace('<body', `${offlineShim}\n<body`);
  } else {
    updated = `${offlineShim}\n${updated}`;
  }

  return updated;
}

// Capture a single page and return its extracted markdown, screenshot, and raw HTML
async function capturePageArtifacts(browser, pageUrl, slug, pageRelHtmlPath, outDir, timeoutMs = 25000) {
  const fullPageHtmlPath = path.join(outDir, pageRelHtmlPath);
  const targetDir = path.dirname(fullPageHtmlPath);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`\n  -> Capturing [${slug}] (${pageUrl})`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Buffer all successful network responses as candidates
  const networkBuffers = new Map();
  page.on('response', async (res) => {
    try {
      const resUrl = res.url();
      if (!resUrl.startsWith('http')) return;
      const status = res.status();
      if (status >= 200 && status < 300) {
        const ct = (res.headers()['content-type'] || '').toLowerCase();
        const isAsset = ct.includes('image') || ct.includes('javascript') || ct.includes('css') ||
                        ct.includes('font') || ct.includes('pdf') || ct.includes('svg') ||
                        /\.(png|jpe?g|svg|webp|gif|css|js|woff2?|ttf|eot|pdf|ico)$/i.test(resUrl.split('?')[0]);
        if (isAsset && !networkBuffers.has(resUrl)) {
          const body = await res.body().catch(() => null);
          if (body && body.length > 0) {
            networkBuffers.set(resUrl, { buffer: body, contentType: ct, url: resUrl });
          }
        }
      }
    } catch {}
  });

  try {
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: timeoutMs });
    } catch {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    }

    await page.waitForTimeout(1500);
    try { await page.evaluate(() => document.fonts.ready); } catch {}

    // Scroll through page to trigger lazy loaded images and animations
    try {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const steps = Math.min(16, Math.ceil(scrollHeight / 700));
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
    } catch {}

    const renderedHtml = await page.content();
    const pageTitle = await page.title();
    const finalUrl = page.url();

    // 1. Extract clean verbatim Markdown
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

    // Write content.md
    const mdHeader = `# ${pageTitle || slug}\n\n**Source URL:** ${finalUrl}\n**Captured Date:** ${new Date().toISOString().split('T')[0]}\n**Page Slug:** \`${slug}\`\n\n---\n\n`;
    const mdPath = path.join(targetDir, 'content.md');
    fs.writeFileSync(mdPath, mdHeader + markdownBody + '\n', 'utf-8');

    // 2. Capture screenshot.png
    const screenshotPath = path.join(targetDir, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 3. Extract DOM assets and internal links
    const domAssets = await extractAssetsFromPageDom(page, pageUrl, pageUrl);
    const internalLinks = await extractInternalLinksFromPage(page, pageUrl);

    console.log(`     ✓ content.md saved (${fs.statSync(mdPath).size} bytes)`);
    console.log(`     ✓ screenshot.png captured (${fs.statSync(screenshotPath).size} bytes)`);
    console.log(`     ✓ Identified ${domAssets.length} asset slot(s) on page`);

    return {
      slug,
      pageUrl,
      finalUrl,
      pageTitle,
      pageRelHtmlPath,
      targetDir,
      renderedHtml,
      domAssets,
      internalLinks,
      networkBuffers,
      status: 'success'
    };
  } catch (err) {
    console.error(`     ✗ Failed to capture ${pageUrl}: ${err.message}`);
    return {
      slug,
      pageUrl,
      pageRelHtmlPath,
      targetDir,
      status: 'error',
      error: err.message,
      domAssets: [],
      internalLinks: [],
      networkBuffers: new Map()
    };
  } finally {
    await page.close();
    await context.close();
  }
}

// Download and save legacy assets directly in their original source paths inside previous-site/
async function harvestAndPlaceAssets({ allDomAssets, allNetworkBuffers, baseOrigin, outDir, maxAssets = 200 }) {
  console.log(`\n[Harvesting] Processing all page assets into source paths inside ${outDir}/...`);

  // Deduplicate discovered URLs
  const assetMap = new Map(); // rawUrl -> { url, localRelPath, alt, naturalWidth, naturalHeight, type }
  for (const item of allDomAssets) {
    try {
      const u = new URL(item.url, baseOrigin).href;
      // Skip tracking and telemetry
      if (/google-analytics|googletagmanager|facebook\.com\/tr|doubleclick|clarity\.ms/i.test(u)) continue;
      if (!assetMap.has(u)) {
        const localRelPath = resolveAssetSourceRelativePath(u, baseOrigin);
        assetMap.set(u, {
          url: u,
          localRelPath,
          alt: item.alt || '',
          naturalWidth: item.naturalWidth || 0,
          naturalHeight: item.naturalHeight || 0,
          type: item.type || 'image',
          foundOnPages: [item.pageSlug || 'home']
        });
      } else {
        const existing = assetMap.get(u);
        if (item.naturalWidth > existing.naturalWidth) existing.naturalWidth = item.naturalWidth;
        if (item.naturalHeight > existing.naturalHeight) existing.naturalHeight = item.naturalHeight;
        if (item.alt && !existing.alt) existing.alt = item.alt;
        if (item.pageSlug && !existing.foundOnPages.includes(item.pageSlug)) existing.foundOnPages.push(item.pageSlug);
      }
    } catch {}
  }

  // Also include any intercepted network buffers not explicitly found in DOM (e.g. fonts, background images, CSS)
  for (const [netUrl, item] of allNetworkBuffers.entries()) {
    try {
      const u = new URL(netUrl, baseOrigin).href;
      if (/google-analytics|googletagmanager|facebook\.com\/tr|doubleclick|clarity\.ms/i.test(u)) continue;
      if (!assetMap.has(u)) {
        const localRelPath = resolveAssetSourceRelativePath(u, baseOrigin);
        assetMap.set(u, {
          url: u,
          localRelPath,
          alt: '',
          naturalWidth: 0,
          naturalHeight: 0,
          type: item.contentType.includes('image') ? 'image' : (item.contentType.includes('css') ? 'stylesheet' : 'asset'),
          foundOnPages: ['global']
        });
      }
    } catch {}
  }

  const assetList = Array.from(assetMap.values()).slice(0, maxAssets);
  console.log(`  Identified ${assetList.length} unique asset file(s) to place into source locations.`);

  const catalog = [];
  let assetCounter = 1;
  const writtenUrlMap = new Map(); // rawUrl -> localRelPath

  for (const asset of assetList) {
    const fullDiskPath = path.join(outDir, asset.localRelPath);
    fs.mkdirSync(path.dirname(fullDiskPath), { recursive: true });

    let buffer = null;
    let contentType = '';

    // Check if intercepted in network buffer
    if (allNetworkBuffers.has(asset.url)) {
      const cached = allNetworkBuffers.get(asset.url);
      buffer = cached.buffer;
      contentType = cached.contentType;
    } else {
      // Download directly
      try {
        const res = await fetchBuffer(asset.url, 12000);
        buffer = res.buffer;
        contentType = res.contentType;
      } catch (err) {
        // Silently skip unresolvable external 404s
      }
    }

    if (!buffer || buffer.length === 0) continue;

    try {
      fs.writeFileSync(fullDiskPath, buffer);
      writtenUrlMap.set(asset.url, asset.localRelPath);
    } catch (writeErr) {
      continue;
    }

    // Determine dimensions
    let dims = { width: asset.naturalWidth, height: asset.naturalHeight };
    if (!dims.width || !dims.height) {
      const headerDims = getImageDimensionsFromBuffer(buffer);
      if (headerDims) dims = headerDims;
    }

    const isSvg = asset.url.endsWith('.svg') || (contentType && contentType.includes('svg'));
    const isPdf = asset.url.endsWith('.pdf') || (contentType && contentType.includes('pdf'));
    const isDoc = isPdf || /\.(docx?|xlsx?)$/i.test(asset.url);

    let qualityStatus = 'high-res';
    let dimensionStr = '';

    if (isSvg) {
      qualityStatus = 'vector';
      dimensionStr = 'vector';
    } else if (isDoc) {
      qualityStatus = 'document';
      dimensionStr = 'document';
    } else if (dims.width && dims.height) {
      dimensionStr = `${dims.width}x${dims.height}`;
      qualityStatus = dims.width >= 1200 ? 'high-res' : 'needs-replacement';
    } else {
      dimensionStr = 'unspecified';
      qualityStatus = 'needs-replacement';
    }

    const id = `leg-${String(assetCounter++).padStart(2, '0')}`;
    catalog.push({
      id,
      url: asset.url,
      path: asset.localRelPath,
      sizeBytes: buffer.length,
      dimensions: dims.width && dims.height ? { width: dims.width, height: dims.height } : null,
      dimensionStr,
      qualityStatus,
      alt: asset.alt,
      foundOnPages: asset.foundOnPages
    });
  }

  console.log(`  ✓ Successfully wrote ${catalog.length} asset(s) to source locations in ${outDir}/`);
  return { catalog, writtenUrlMap };
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

// Advisory helper to verify or add output directory to .gitignore
function checkAndAdviseGitignore(outDir, autoAppend = false) {
  try {
    const resolvedOut = path.resolve(outDir);
    const targetDirName = path.basename(resolvedOut);
    const candidatePaths = [
      path.join(process.cwd(), '.gitignore'),
      path.join(path.dirname(resolvedOut), '.gitignore')
    ];
    let gitignorePath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        gitignorePath = p;
        break;
      }
    }

    const relGitignore = gitignorePath ? path.relative(process.cwd(), gitignorePath) || '.gitignore' : '.gitignore';

    if (gitignorePath) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      const isIgnored = lines.some(function(l) {
        const trimmed = l.trim();
        return trimmed === targetDirName || trimmed === `${targetDirName}/` || trimmed === `/${targetDirName}/` || trimmed === `/${targetDirName}`;
      });

      if (!isIgnored) {
        if (autoAppend) {
          const appendText = (content.endsWith('\n') ? '' : '\n') + `\n# Legacy site offline mirror & harvested assets\n${targetDirName}/\n`;
          fs.appendFileSync(gitignorePath, appendText, 'utf-8');
          console.log(`  ✓ [Git Hygiene] Automatically added '${targetDirName}/' to ${relGitignore}`);
        } else {
          console.log(`  • [Git Hygiene] Advice: Add '${targetDirName}/' to ${relGitignore} to prevent committing large legacy assets.`);
        }
      } else {
        console.log(`  ✓ [Git Hygiene] Confirmed: '${targetDirName}/' is ignored in ${relGitignore}`);
      }
    } else {
      console.log(`  • [Git Hygiene] Advice: Create a .gitignore and add '${targetDirName}/' to keep large scraped assets out of git.`);
    }
    console.log('');
  } catch {
    // Non-fatal advisory check
  }
}

// Main crawling orchestrator for migration mode
async function crawlSite({ targetUrl, outDir, mode = 'migration', limitMode = 'max-sampled', selectedPages = [], maxPages = 15, maxAssets = 200, skipAssets = false, addToGitignore = false, timeoutMs = 25000 }) {
  if (!chromium) {
    console.error('Playwright Chromium is required for full-page rendering and screenshots.');
    console.error('Install via: npx --yes playwright install chromium');
    process.exit(1);
  }

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

  fs.mkdirSync(outDir, { recursive: true });

  const parsedBase = new URL(targetUrl);
  const baseOrigin = parsedBase.origin;

  // 1. Discover URLs from sitemap / robots
  console.log(`\n[Phase 1] Discovering sitemaps and route inventory...`);
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

  // Combine and sample by requested limit mode
  const allDiscovered = Array.from(new Set([cleanUrlString(new URL(targetUrl)), ...sitemapUrls, ...homeLinks]));
  const pagesToCapture = selectPagesToCapture(allDiscovered, targetUrl, { limitMode, maxPages, selectedPages });

  console.log(`\n[Phase 3] Limit mode: '${limitMode}' — Identified ${pagesToCapture.length} page(s) to mirror:`);
  pagesToCapture.forEach(p => console.log(`  • [${p.slug}] -> ${p.url} => ${p.relHtmlPath}`));

  // 3. Capture each page: DOM, content.md, screenshot.png
  console.log(`\n[Phase 4] Capturing pages, DOM structures, and screenshots...`);
  const capturedPages = [];
  const allDomAssets = [];
  const mergedNetworkBuffers = new Map();

  for (const item of pagesToCapture) {
    const result = await capturePageArtifacts(browser, item.url, item.slug, item.relHtmlPath, outDir, timeoutMs);
    capturedPages.push(result);

    if (result.status === 'success') {
      result.domAssets.forEach(a => allDomAssets.push({ ...a, pageSlug: item.slug }));
      for (const [k, v] of result.networkBuffers.entries()) {
        if (!mergedNetworkBuffers.has(k)) mergedNetworkBuffers.set(k, v);
      }
    }
  }

  await browser.close();

  // 4. Harvest assets into their source paths
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

  // 5. Relativize HTML for each page so opening index.html works offline out-of-the-box
  console.log(`\n[Phase 6] Writing offline-ready HTML pages...`);
  for (const page of capturedPages) {
    if (page.status !== 'success' || !page.renderedHtml) continue;
    const relativizedHtml = relativizeHtmlForOfflineMirror(page.renderedHtml, page.pageRelHtmlPath, writtenUrlMap, baseOrigin);
    const targetHtmlFile = path.join(outDir, page.pageRelHtmlPath);
    fs.mkdirSync(path.dirname(targetHtmlFile), { recursive: true });
    fs.writeFileSync(targetHtmlFile, relativizedHtml, 'utf-8');
    console.log(`  ✓ Written ${page.pageRelHtmlPath} (${fs.statSync(targetHtmlFile).size} bytes)`);
  }

  // 6. Generate sitemap.xml and manifest.json
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  generateSitemapXml(allDiscovered, sitemapPath);
  console.log(`✓ Generated ${sitemapPath} (${allDiscovered.length} discovered URLs)`);

  const manifestPath = path.join(outDir, 'manifest.json');
  const imageAssets = catalog.filter(a => a.qualityStatus === 'high-res' || a.qualityStatus === 'needs-replacement');
  const vectorAssets = catalog.filter(a => a.qualityStatus === 'vector');
  const docAssets = catalog.filter(a => a.qualityStatus === 'document');
  const highResAssets = catalog.filter(a => a.qualityStatus === 'high-res');

  const manifestData = {
    targetUrl,
    crawledAt: new Date().toISOString(),
    limitMode,
    selectedPages: limitMode === 'selected' ? selectedPages : undefined,
    totalPagesDiscovered: allDiscovered.length,
    pagesCaptured: capturedPages.filter(p => p.status === 'success').length,
    routes: allDiscovered,
    pages: capturedPages.map(p => ({
      slug: p.slug,
      url: p.pageUrl,
      htmlFile: p.pageRelHtmlPath,
      title: p.pageTitle || p.slug,
      status: p.status
    })),
    assets: catalog,
    stats: {
      totalAssetsHarvested: catalog.length,
      imagesCount: imageAssets.length,
      vectorsCount: vectorAssets.length,
      documentsCount: docAssets.length,
      highResCount: highResAssets.length,
      needsReplacementCount: imageAssets.length - highResAssets.length
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + '\n', 'utf-8');
  console.log(`\n✓ Generated ${manifestPath}`);
  console.log(`\n✓ Site mirror completed successfully!`);
  console.log(`  To view the mirrored site:`);
  console.log(`  • Open directly in Chrome: ${path.join(outDir, 'index.html')}`);
  console.log(`  • Or launch local preview server: node skills/create-nww-website/scripts/site-fetch/index.js --serve ${outDir}\n`);
  checkAndAdviseGitignore(outDir, addToGitignore);
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
      const res = await capturePageArtifacts(browser, item.url, item.slug, path.posix.join(ref.domain, item.slug, 'index.html'), outDir, timeoutMs);
      siteRecords.push(res);
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

// Lightweight zero-dependency HTTP preview server for offline mirror viewing in Chrome
function startPreviewServer(serveDir, port = 3000, shouldOpen = true) {
  const resolvedDir = path.resolve(serveDir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`Error: Directory '${serveDir}' does not exist.`);
    process.exit(1);
  }

  const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml; charset=utf-8'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(resolvedDir, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The file <code>${reqPath}</code> was not found in <code>${serveDir}</code>.</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n=================================================================`);
    console.log(`  OFFLINE MIRROR PREVIEW SERVER ACTIVE`);
    console.log(`  Serving:   ${resolvedDir}`);
    console.log(`  Local URL: ${url}`);
    console.log(`  Press Ctrl+C to stop.`);
    console.log(`=================================================================\n`);

    if (shouldOpen) {
      const { exec } = require('node:child_process');
      const startCmd = process.platform === 'win32' ? `start "" "${url}"` : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
      exec(startCmd, () => {});
    }
  });

  return server;
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
  let limitMode = 'max-sampled';
  let selectedPages = [];
  let briefPath = '';
  let maxPages = 15;
  let maxAssets = 200;
  let skipAssets = false;
  let addToGitignore = false;
  let timeoutMs = 25000;
  let serveDir = '';
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) targetUrl = args[++i];
    else if (args[i] === '--out' && args[i + 1]) outDir = args[++i];
    else if (args[i] === '--mode' && args[i + 1]) mode = args[++i];
    else if (args[i] === '--limit-mode' && args[i + 1]) limitMode = args[++i];
    else if (args[i] === '--pages' && args[i + 1]) {
      limitMode = 'selected';
      selectedPages = args[++i].split(/[\s,]+/).filter(Boolean);
    }
    else if (args[i] === '--only-homepage') limitMode = 'homepage';
    else if (args[i] === '--no-limits') limitMode = 'no-limits';
    else if (args[i] === '--brief' && args[i + 1]) briefPath = args[++i];
    else if (args[i] === '--max-pages' && args[i + 1]) maxPages = parseInt(args[++i], 10);
    else if (args[i] === '--max-assets' && args[i + 1]) maxAssets = parseInt(args[++i], 10);
    else if (args[i] === '--skip-assets') skipAssets = true;
    else if (args[i] === '--add-to-gitignore') addToGitignore = true;
    else if (args[i] === '--serve' && args[i + 1]) serveDir = args[++i];
    else if (args[i] === '--port' && args[i + 1]) port = parseInt(args[++i], 10);
    else if (args[i] === '--timeout' && args[i + 1]) timeoutMs = parseInt(args[++i], 10);
  }

  if (serveDir) {
    startPreviewServer(serveDir, port, true);
    return;
  }

  if (briefPath) {
    mode = mode || 'references';
    outDir = outDir || path.join(process.cwd(), 'project-docs', 'design-references');
    await crawlReferences({ briefPath: path.resolve(briefPath), outDir: path.resolve(outDir), maxPages, timeoutMs });
  } else if (targetUrl) {
    mode = mode || 'migration';
    outDir = outDir || path.join(process.cwd(), 'previous-site');
    await crawlSite({ targetUrl, outDir: path.resolve(outDir), mode, limitMode, selectedPages, maxPages, maxAssets, skipAssets, addToGitignore, timeoutMs });
  } else {
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
  relativizeHtmlForOfflineMirror
};
