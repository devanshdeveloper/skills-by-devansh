'use strict';

const path = require('node:path');
const { URL } = require('node:url');
const { fetchText } = require('./http');

function cleanUrlString(parsedUrl) {
  return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.replace(/\/+$/, '') || '/'}`;
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

function urlToPageMapping(urlString, baseUrl) {
  try {
    const u = new URL(urlString);
    const cleanPath = u.pathname.replace(/^\/+|\/+$/g, '').replace(/\.(html?|php|asp|aspx)$/i, '');
    if (!cleanPath) {
      return { slug: 'home', relHtmlPath: 'index.html', dirPath: '' };
    }
    const slug = cleanPath.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'page';
    return { slug, relHtmlPath: path.posix.join(cleanPath, 'index.html'), dirPath: cleanPath };
  } catch {
    return { slug: 'page', relHtmlPath: 'page/index.html', dirPath: 'page' };
  }
}

function collectSameOriginPages(urlList, baseUrl, { maxPages = Infinity, renameCollisions = false } = {}) {
  const baseParsed = new URL(baseUrl);
  const homeUrl = cleanUrlString(baseParsed);
  const pages = new Map();
  const homeMapping = urlToPageMapping(homeUrl, baseUrl);
  pages.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

  for (const raw of urlList) {
    if (pages.size >= maxPages) break;
    try {
      const fullUrl = raw.startsWith('http') ? raw : new URL(raw.replace(/^\/+/, ''), baseParsed.origin + '/').href;
      const u = new URL(fullUrl);
      if (u.origin !== baseParsed.origin) continue;
      const clean = cleanUrlString(u);
      if (clean === homeUrl) continue;
      const mapping = urlToPageMapping(clean, baseUrl);
      let slugKey = mapping.slug;
      if (renameCollisions) {
        let counter = 1;
        while (pages.has(slugKey) && pages.get(slugKey).url !== clean) {
          slugKey = `${mapping.slug}-${counter++}`;
        }
      }
      if (!pages.has(slugKey)) {
        pages.set(slugKey, { ...mapping, slug: slugKey, url: clean });
      }
    } catch {}
  }
  return Array.from(pages.values());
}

function clusterAndSamplePageTypes(urlList, baseUrl, maxPages = 15) {
  const baseParsed = new URL(baseUrl);
  const homeUrl = cleanUrlString(baseParsed);
  const selected = new Map();
  const homeMapping = urlToPageMapping(homeUrl, baseUrl);
  selected.set(homeMapping.slug, { ...homeMapping, url: homeUrl });

  const buckets = new Map();
  for (const raw of urlList) {
    try {
      const u = new URL(raw);
      if (u.origin !== baseParsed.origin) continue;
      const clean = cleanUrlString(u);
      if (clean === homeUrl) continue;

      const segments = u.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      if (!segments.length) continue;

      const key = segments.length === 1 ? `static:${segments[0]}` : `collection:${segments[0]}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(clean);
    } catch {}
  }

  // 1. Top-level static pages
  for (const [key, urls] of buckets) {
    if (key.startsWith('static:') && selected.size < maxPages) {
      const m = urlToPageMapping(urls[0], baseUrl);
      if (!selected.has(m.slug)) selected.set(m.slug, { ...m, url: urls[0] });
    }
  }

  // 2. Representative items from collections
  for (const [key, urls] of buckets) {
    if (key.startsWith('collection:') && selected.size < maxPages) {
      for (let i = 0; i < Math.min(2, urls.length) && selected.size < maxPages; i++) {
        const m = urlToPageMapping(urls[i], baseUrl);
        const slug = selected.has(m.slug) ? `${m.slug}-${i + 1}` : m.slug;
        selected.set(slug, { ...m, slug, url: urls[i] });
      }
    }
  }

  // 3. Fill remaining quota
  for (const [, urls] of buckets) {
    for (const u of urls) {
      if (selected.size >= maxPages) break;
      const m = urlToPageMapping(u, baseUrl);
      if (!selected.has(m.slug)) selected.set(m.slug, { ...m, url: u });
    }
  }

  return Array.from(selected.values());
}

function selectPagesToCapture(urlList, baseUrl, options = {}) {
  const limitMode = (options.limitMode || 'max-sampled').toLowerCase();
  const maxPages = options.maxPages !== undefined ? options.maxPages : 15;
  const selectedPages = options.selectedPages || [];

  if (limitMode === 'homepage' || limitMode === 'only-homepage' || limitMode === 'home') {
    const homeUrl = cleanUrlString(new URL(baseUrl));
    return [{ ...urlToPageMapping(homeUrl, baseUrl), url: homeUrl }];
  }
  if (limitMode === 'selected' || limitMode === 'selected-pages') {
    const list = Array.isArray(selectedPages) ? selectedPages.filter(Boolean) : String(selectedPages).split(/[\s,]+/).filter(Boolean);
    return collectSameOriginPages(list, baseUrl);
  }
  if (limitMode === 'no-limits' || limitMode === 'unlimited' || limitMode === 'all') {
    return collectSameOriginPages(urlList, baseUrl, { renameCollisions: true });
  }
  if (limitMode === 'max-any' || limitMode === 'any' || limitMode === 'fifo') {
    return collectSameOriginPages(urlList, baseUrl, { maxPages });
  }
  return clusterAndSamplePageTypes(urlList, baseUrl, maxPages);
}

async function extractInternalLinksFromPage(page, baseUrl) {
  try {
    const origin = new URL(baseUrl).origin;
    const links = await page.evaluate((orig) => {
      return Array.from(document.querySelectorAll('a[href]'))
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

async function probeSiteRoutes(browser, targetUrl, timeoutMs) {
  const sitemapUrls = await discoverSitemapUrls(targetUrl);
  const homeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const homePage = await homeContext.newPage();
  let homeLinks = [];
  try {
    await homePage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    homeLinks = await extractInternalLinksFromPage(homePage, targetUrl);
  } catch (e) {
    console.log(`  Notice: Initial probe encountered: ${e.message}`);
  } finally {
    await homePage.close();
    await homeContext.close();
  }

  const allDiscovered = Array.from(new Set([cleanUrlString(new URL(targetUrl)), ...sitemapUrls, ...homeLinks]));
  return { sitemapUrls, homeLinks, allDiscovered };
}

module.exports = {
  cleanUrlString,
  discoverSitemapUrls,
  urlToPageMapping,
  clusterAndSamplePageTypes,
  selectPagesToCapture,
  extractInternalLinksFromPage,
  probeSiteRoutes
};
