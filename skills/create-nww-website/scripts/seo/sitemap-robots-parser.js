#!/usr/bin/env node

/**
 * Robots.txt & Sitemap XML Parser CLI Helper
 * Validates robots.txt directives and crawls/parses XML sitemaps without external dependencies.
 *
 * Usage:
 *   node sitemap-robots-parser.js --url https://example.com
 *   node sitemap-robots-parser.js --url https://example.com --robots-only
 *   node sitemap-robots-parser.js --url https://example.com --sitemap-only
 *   node sitemap-robots-parser.js --url https://example.com --json
 */

'use strict';

function printHelp() {
  console.log(`
Robots.txt & Sitemap Parser CLI Helper (skills-by-devansh)

Usage:
  node sitemap-robots-parser.js --url <domain-or-url> [options]

Options:
  --url <url>           Required. Target website base URL or sitemap/robots URL.
  --robots-only         Only fetch and parse robots.txt.
  --sitemap-only        Only fetch and parse sitemap.xml.
  --max <number>        Max sample URLs to display (default: 25).
  --json                Output structured JSON.
  --help                Show this help message.

Examples:
  node sitemap-robots-parser.js --url https://example.com
  node sitemap-robots-parser.js --url https://example.com --robots-only
  node sitemap-robots-parser.js --url https://example.com/sitemap.xml --sitemap-only
`);
}

function parseRobotsTxt(content) {
  const lines = content.split('\n');
  const directives = {
    userAgents: {},
    sitemaps: [],
    warnings: []
  };

  let currentUserAgent = '*';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'user-agent') {
      currentUserAgent = val;
      if (!directives.userAgents[currentUserAgent]) {
        directives.userAgents[currentUserAgent] = { disallow: [], allow: [] };
      }
    } else if (key === 'disallow') {
      if (!directives.userAgents[currentUserAgent]) {
        directives.userAgents[currentUserAgent] = { disallow: [], allow: [] };
      }
      directives.userAgents[currentUserAgent].disallow.push(val);
      if (currentUserAgent === '*' && val === '/') {
        directives.warnings.push("CRITICAL WARNING: 'Disallow: /' is configured for User-agent '*', blocking all legitimate search bots.");
      }
    } else if (key === 'allow') {
      if (!directives.userAgents[currentUserAgent]) {
        directives.userAgents[currentUserAgent] = { disallow: [], allow: [] };
      }
      directives.userAgents[currentUserAgent].allow.push(val);
    } else if (key === 'sitemap') {
      directives.sitemaps.push(val);
    }
  }

  if (directives.sitemaps.length === 0) {
    directives.warnings.push("Notice: No 'Sitemap:' directive declared in robots.txt.");
  }

  return directives;
}

function parseSitemapXml(content) {
  const isSitemapIndex = content.includes('<sitemapindex');
  const urls = [];
  const sitemaps = [];

  if (isSitemapIndex) {
    const sitemapRegex = /<sitemap>[\s\S]*?<loc>([\s\S]*?)<\/loc>[\s\S]*?<\/sitemap>/gi;
    let match;
    while ((match = sitemapRegex.exec(content)) !== null) {
      sitemaps.push(match[1].trim());
    }
    return {
      type: 'sitemap-index',
      totalEntries: sitemaps.length,
      entries: sitemaps
    };
  }

  const urlRegex = /<url>[\s\S]*?<loc>([\s\S]*?)<\/loc>(?:[\s\S]*?<lastmod>([\s\S]*?)<\/lastmod>)?[\s\S]*?<\/url>/gi;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    urls.push({
      loc: match[1].trim(),
      lastmod: match[2] ? match[2].trim() : null
    });
  }

  return {
    type: 'urlset',
    totalEntries: urls.length,
    entries: urls
  };
}

async function fetchWithTimeout(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditTool/1.0; +https://skills.sh)'
      }
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function run() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  let inputUrl = '';
  let robotsOnly = false;
  let sitemapOnly = false;
  let maxDisplay = 25;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      inputUrl = args[++i];
    } else if (args[i] === '--robots-only') {
      robotsOnly = true;
    } else if (args[i] === '--sitemap-only') {
      sitemapOnly = true;
    } else if (args[i] === '--max' && args[i + 1]) {
      maxDisplay = parseInt(args[++i], 10) || 25;
    } else if (args[i] === '--json') {
      jsonOutput = true;
    }
  }

  if (!inputUrl) {
    console.error('Error: Missing required argument --url <domain-or-url>');
    process.exit(1);
  }

  let parsedOrigin;
  try {
    const u = new URL(inputUrl);
    parsedOrigin = u.origin;
  } catch (err) {
    console.error(`Error: Invalid URL format: '${inputUrl}'. Must include http:// or https://`);
    process.exit(1);
  }

  const result = {
    targetOrigin: parsedOrigin,
    timestamp: new Date().toISOString(),
    robots: null,
    sitemap: null
  };

  // 1. Robots.txt check
  if (!sitemapOnly) {
    const robotsUrl = `${parsedOrigin}/robots.txt`;
    try {
      const res = await fetchWithTimeout(robotsUrl);
      if (res.ok) {
        const text = await res.text();
        result.robots = {
          url: robotsUrl,
          status: res.status,
          contentType: res.headers.get('content-type'),
          directives: parseRobotsTxt(text)
        };
      } else {
        result.robots = {
          url: robotsUrl,
          status: res.status,
          error: `HTTP ${res.status} returned`
        };
      }
    } catch (err) {
      result.robots = {
        url: robotsUrl,
        error: err.message
      };
    }
  }

  // 2. Sitemap check
  if (!robotsOnly) {
    let sitemapUrl = `${parsedOrigin}/sitemap.xml`;
    // If robots.txt discovered a specific sitemap directive, use the first one
    if (result.robots && result.robots.directives && result.robots.directives.sitemaps.length > 0) {
      sitemapUrl = result.robots.directives.sitemaps[0];
    } else if (inputUrl.endsWith('.xml')) {
      sitemapUrl = inputUrl;
    }

    try {
      const res = await fetchWithTimeout(sitemapUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseSitemapXml(text);
        result.sitemap = {
          url: sitemapUrl,
          status: res.status,
          contentType: res.headers.get('content-type'),
          type: parsed.type,
          totalEntries: parsed.totalEntries,
          sampleEntries: parsed.entries.slice(0, maxDisplay)
        };
      } else {
        result.sitemap = {
          url: sitemapUrl,
          status: res.status,
          error: `HTTP ${res.status} returned`
        };
      }
    } catch (err) {
      result.sitemap = {
        url: sitemapUrl,
        error: err.message
      };
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log('\n========================================');
  console.log(`  ROBOTS.TXT & SITEMAP AUDIT: ${parsedOrigin}`);
  console.log(`  Time: ${result.timestamp}`);
  console.log('========================================');

  if (result.robots) {
    console.log('\n[Robots.txt Analysis]');
    console.log(`  URL:    ${result.robots.url}`);
    if (result.robots.error) {
      console.log(`  Status: FAILED (${result.robots.error})`);
    } else {
      console.log(`  Status: HTTP ${result.robots.status} (${result.robots.contentType || 'unknown'})`);
      const agents = Object.keys(result.robots.directives.userAgents);
      console.log(`  User-agents detected: ${agents.length > 0 ? agents.join(', ') : 'None'}`);
      if (result.robots.directives.sitemaps.length > 0) {
        console.log(`  Sitemaps declared:`);
        result.robots.directives.sitemaps.forEach(s => console.log(`    - ${s}`));
      }
      if (result.robots.directives.warnings.length > 0) {
        console.log(`  Warnings:`);
        result.robots.directives.warnings.forEach(w => console.log(`    ! ${w}`));
      }
    }
  }

  if (result.sitemap) {
    console.log('\n[Sitemap.xml Analysis]');
    console.log(`  URL:           ${result.sitemap.url}`);
    if (result.sitemap.error) {
      console.log(`  Status:        FAILED (${result.sitemap.error})`);
    } else {
      console.log(`  Status:        HTTP ${result.sitemap.status} (${result.sitemap.contentType || 'unknown'})`);
      console.log(`  Sitemap Type:  ${result.sitemap.type}`);
      console.log(`  Total Entries: ${result.sitemap.totalEntries}`);
      console.log(`\n  Sample Entries (showing up to ${maxDisplay}):`);
      result.sitemap.sampleEntries.forEach((entry, idx) => {
        if (typeof entry === 'string') {
          console.log(`    ${idx + 1}. [Index] ${entry}`);
        } else {
          console.log(`    ${idx + 1}. ${entry.loc}${entry.lastmod ? ` (lastmod: ${entry.lastmod})` : ''}`);
        }
      });
    }
  }
  console.log('========================================\n');
}

run();
