'use strict';

const path = require('node:path');
const { URL } = require('node:url');
const { fetchText } = require('./http');

function getNakedHost(urlOrStr) {
  try {
    const u = typeof urlOrStr === 'string' ? new URL(urlOrStr) : urlOrStr;
    return (u.hostname || '').toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isSameSiteUrl(urlA, urlB) {
  const hostA = getNakedHost(urlA);
  const hostB = getNakedHost(urlB);
  return Boolean(hostA && hostB && (hostA === hostB || hostA.endsWith('.' + hostB) || hostB.endsWith('.' + hostA)));
}

function cleanUrlString(parsedUrl) {
  return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.replace(/\/+$/, '') || '/'}`;
}

function extractXmlUrls(xmlContent, baseUrl, urlSet) {
  const locMatches = xmlContent.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi);
  for (const m of locMatches) {
    try {
      const u = new URL(m[1].trim());
      if (isSameSiteUrl(u, baseUrl) && !/\.(xml|rss|atom|gz)$/i.test(u.pathname)) {
        urlSet.add(cleanUrlString(u));
      }
    } catch {}
  }
}

async function discoverSitemapUrls(baseUrl) {
  const discovered = new Set();
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const nakedHost = getNakedHost(parsed);

  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/robots.txt`
  ];

  if (parsed.hostname.startsWith('www.')) {
    candidates.push(`https://${nakedHost}/sitemap.xml`);
    candidates.push(`https://${nakedHost}/sitemap_index.xml`);
  } else {
    candidates.push(`https://www.${nakedHost}/sitemap.xml`);
    candidates.push(`https://www.${nakedHost}/sitemap_index.xml`);
  }

  const visitedSitemaps = new Set();

  async function processSitemapXml(url, depth = 0) {
    if (depth > 2 || visitedSitemaps.has(url)) return;
    visitedSitemaps.add(url);
    try {
      const content = await fetchText(url, 8000);
      if (!content || !content.includes('<')) return;

      const isIndex = /<sitemapindex\b/i.test(content) || /<sitemap>/i.test(content);
      if (isIndex) {
        const subLocs = content.matchAll(/<sitemap>\s*<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi);
        for (const sub of subLocs) {
          const subUrl = sub[1].trim();
          if (isSameSiteUrl(subUrl, baseUrl)) {
            await processSitemapXml(subUrl, depth + 1);
          }
        }
      } else {
        extractXmlUrls(content, baseUrl, discovered);
      }
    } catch {}
  }

  for (const candidate of candidates) {
    try {
      if (candidate.endsWith('.txt')) {
        const content = await fetchText(candidate, 8000);
        const sitemapMatches = content.matchAll(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
        for (const m of sitemapMatches) {
          const sitemapUrl = m[1].trim();
          if (isSameSiteUrl(sitemapUrl, baseUrl)) {
            await processSitemapXml(sitemapUrl, 0);
          }
        }
      } else {
        await processSitemapXml(candidate, 0);
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
      if (!isSameSiteUrl(fullUrl, baseUrl)) continue;
      if (/\.(xml|rss|atom|gz|pdf|zip|png|jpg|jpeg|svg|webp|mp4|css|js)$/i.test(u.pathname)) continue;
      if (/\/(elementskit[-_]content|wp-json|feed)\b/i.test(u.pathname)) continue;
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
      if (!isSameSiteUrl(raw, baseUrl)) continue;
      if (/\.(xml|rss|atom|gz|pdf|zip|png|jpg|jpeg|svg|webp|mp4|css|js)$/i.test(u.pathname)) continue;
      if (/\/(elementskit[-_]content|wp-json|feed)\b/i.test(u.pathname)) continue;
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
    const nakedHost = getNakedHost(baseUrl);
    const links = await page.evaluate((targetHost) => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => {
          try {
            const u = new URL(href);
            const host = (u.hostname || '').toLowerCase().replace(/^www\./, '');
            const isSame = Boolean(host && targetHost && (host === targetHost || host.endsWith('.' + targetHost) || targetHost.endsWith('.' + host)));
            return isSame && !u.pathname.match(/\.(pdf|zip|png|jpg|jpeg|svg|webp|mp4|css|js|xml|rss|atom)$/i);
          } catch {
            return false;
          }
        });
    }, nakedHost);
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
  getNakedHost,
  isSameSiteUrl,
  cleanUrlString,
  discoverSitemapUrls,
  urlToPageMapping,
  clusterAndSamplePageTypes,
  selectPagesToCapture,
  extractInternalLinksFromPage,
  probeSiteRoutes,
  discoverSiteRoutes: probeSiteRoutes
};

