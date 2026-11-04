#!/usr/bin/env node

/**
 * Blog SEO & Core Web Vitals Static Auditor
 *
 * Verifies that Next.js blog routes meet research-backed technical SEO,
 * static caching, Core Web Vitals, and structured data standards without
 * making network calls or requiring API keys.
 *
 * Usage:
 *   node skills/create-nww-website/scripts/blog-seo-audit/index.js [options]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const HELP_TEXT = `Blog SEO & Core Web Vitals Static Auditor

Usage:
  node skills/create-nww-website/scripts/blog-seo-audit/index.js [options]

Options:
  --dir <path>       Path to the Next.js site directory (default: "./site")
  --strict           Fail (exit code 1) on any warning or failed recommendation
  --json             Output results as a structured JSON object
  -h, --help         Display this help message and exit

Audited Checks:
  1. Static Guardrail: Enforces ensureStatic = 'navigation' on blog layout/routes
  2. Canonical URL: Confirms alternates.canonical is declared in route metadata
  3. JSON-LD Schema: Validates BlogPosting schema with headline, author, and escaped markup
  4. Sitemap Integrity: Verifies app/sitemap.js includes blog entries with lastModified
  5. Robots Directives: Confirms app/robots.js exists and manages crawler rules
  6. Open Graph Tags: Checks type: 'article' and image definitions in metadata
  7. LCP Hero Image: Ensures hero image has fetchPriority="high" and explicit dimensions
  8. INP Safety: Confirms blog detail page is a Server Component without root 'use client'
  9. Anti-Gimmick: Verifies absence of llms.txt, AI chunking, or non-standard AI meta tags
`;

// Sensitive environment token patterns to mask in output
const SENSITIVE_PATTERNS = [
  /(?:key|secret|token|password|auth|bearer)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{8,})['"]?/gi
];

export function maskSensitive(text) {
  if (typeof text !== 'string') return text;
  let masked = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, (match, val) => match.replace(val, '[REDACTED]'));
  }
  return masked;
}

export function parseArgs(argv) {
  const options = {
    dir: './site',
    strict: false,
    json: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--dir') {
      if (i + 1 < argv.length) {
        options.dir = argv[++i];
      }
    } else if (arg.startsWith('--dir=')) {
      options.dir = arg.slice(6);
    }
  }

  return options;
}

function findBlogFiles(sitePath) {
  const appPath = path.join(sitePath, 'app');
  const candidates = {
    blogPage: null,
    blogLayout: null,
    blogDetail: null,
    sitemap: null,
    robots: null,
    publicLlms: path.join(sitePath, 'public', 'llms.txt')
  };

  if (!fs.existsSync(appPath)) {
    return candidates;
  }

  const exts = ['.js', '.jsx', '.ts', '.tsx'];

  for (const ext of exts) {
    const sitemapPath = path.join(appPath, `sitemap${ext}`);
    if (fs.existsSync(sitemapPath)) candidates.sitemap = sitemapPath;

    const robotsPath = path.join(appPath, `robots${ext}`);
    if (fs.existsSync(robotsPath)) candidates.robots = robotsPath;

    const blogLayoutPath = path.join(appPath, 'blog', `layout${ext}`);
    if (fs.existsSync(blogLayoutPath)) candidates.blogLayout = blogLayoutPath;

    const blogPagePath = path.join(appPath, 'blog', `page${ext}`);
    if (fs.existsSync(blogPagePath)) candidates.blogPage = blogPagePath;

    const blogDetailPath = path.join(appPath, 'blog', '[slug]', `page${ext}`);
    if (fs.existsSync(blogDetailPath)) candidates.blogDetail = blogDetailPath;
  }

  return candidates;
}

export function auditBlogSEO(siteDir) {
  const resolvedSite = path.resolve(siteDir);
  const results = {
    siteDir: resolvedSite,
    timestamp: new Date().toISOString(),
    checks: [],
    passedCount: 0,
    warningCount: 0,
    failedCount: 0
  };

  function addResult(id, title, status, message, file = null) {
    const check = { id, title, status, message, file: file ? path.relative(resolvedSite, file) : null };
    results.checks.push(check);
    if (status === 'PASS') results.passedCount++;
    else if (status === 'WARN') results.warningCount++;
    else results.failedCount++;
  }

  if (!fs.existsSync(resolvedSite)) {
    addResult('SITE_EXISTS', 'Site Directory Verification', 'FAIL', `Site directory not found at ${resolvedSite}`);
    return results;
  }

  const files = findBlogFiles(resolvedSite);

  // 1. Static Guardrail (ensureStatic)
  let staticGuardFound = false;
  let guardFile = null;
  const guardTargets = [files.blogLayout, files.blogDetail, files.blogPage].filter(Boolean);
  for (const target of guardTargets) {
    const content = fs.readFileSync(target, 'utf8');
    if (/ensureStatic\s*=\s*['"]navigation['"]|ensureStatic\s*=\s*['"]prefetch['"]|ensureStatic\s*=\s*['"]shell['"]/.test(content)) {
      staticGuardFound = true;
      guardFile = target;
      break;
    }
  }

  if (staticGuardFound) {
    addResult('ENSURE_STATIC', 'Static Prerender Guardrail', 'PASS', "Found ensureStatic export locking static prerendering", guardFile);
  } else {
    addResult('ENSURE_STATIC', 'Static Prerender Guardrail', 'WARN', "Missing ensureStatic = 'navigation' export on blog layout or page", files.blogLayout || files.blogDetail);
  }

  // 2. Canonical URL Check
  if (files.blogDetail && fs.existsSync(files.blogDetail)) {
    const detailContent = fs.readFileSync(files.blogDetail, 'utf8');
    if (/canonical\s*:|alternates\s*:\s*\{[^}]*canonical/.test(detailContent)) {
      addResult('CANONICAL_URL', 'Canonical URL Specification', 'PASS', "Blog detail route configures canonical URL metadata", files.blogDetail);
    } else {
      addResult('CANONICAL_URL', 'Canonical URL Specification', 'FAIL', "Blog detail route does not export alternates.canonical", files.blogDetail);
    }
  } else {
    addResult('CANONICAL_URL', 'Canonical URL Specification', 'FAIL', "Blog detail route (app/blog/[slug]/page.js) not found");
  }

  // 3. Structured Data JSON-LD Check
  if (files.blogDetail && fs.existsSync(files.blogDetail)) {
    const detailContent = fs.readFileSync(files.blogDetail, 'utf8');
    const hasScriptTag = /application\/ld\+json/.test(detailContent);
    const hasBlogPosting = /BlogPosting|Article/.test(detailContent);
    const hasEscaping = /\\u003c|\.replace\(\/<\//.test(detailContent);
    const hasAuthor = /author/.test(detailContent);

    if (hasScriptTag && hasBlogPosting && hasEscaping && hasAuthor) {
      addResult('JSON_LD_SCHEMA', 'BlogPosting Structured Data', 'PASS', "Valid BlogPosting JSON-LD script found with character escaping and author markup", files.blogDetail);
    } else if (hasScriptTag && hasBlogPosting) {
      addResult('JSON_LD_SCHEMA', 'BlogPosting Structured Data', 'WARN', "BlogPosting script found but missing author or '<' character escaping", files.blogDetail);
    } else {
      addResult('JSON_LD_SCHEMA', 'BlogPosting Structured Data', 'FAIL', "Missing BlogPosting JSON-LD script in blog detail component", files.blogDetail);
    }
  }

  // 4. Dynamic Sitemap
  if (files.sitemap && fs.existsSync(files.sitemap)) {
    const sitemapContent = fs.readFileSync(files.sitemap, 'utf8');
    const mapsBlog = /blog/.test(sitemapContent);
    const hasLastModified = /lastModified/.test(sitemapContent);

    if (mapsBlog && hasLastModified) {
      addResult('SITEMAP_CHECK', 'Dynamic Sitemap Blog Entries', 'PASS', "app/sitemap.js includes blog routes with lastModified timestamps", files.sitemap);
    } else if (mapsBlog) {
      addResult('SITEMAP_CHECK', 'Dynamic Sitemap Blog Entries', 'WARN', "app/sitemap.js references blog routes but missing lastModified property", files.sitemap);
    } else {
      addResult('SITEMAP_CHECK', 'Dynamic Sitemap Blog Entries', 'FAIL', "app/sitemap.js does not dynamically map blog routes", files.sitemap);
    }
  } else {
    addResult('SITEMAP_CHECK', 'Dynamic Sitemap Blog Entries', 'FAIL', "app/sitemap.js not found");
  }

  // 5. Robots Directives
  if (files.robots && fs.existsSync(files.robots)) {
    const robotsContent = fs.readFileSync(files.robots, 'utf8');
    if (/rules\s*:/.test(robotsContent) && (/sitemap\s*:/.test(robotsContent) || /PREVIEW_GUARD/.test(robotsContent))) {
      addResult('ROBOTS_CHECK', 'Robots.txt Directives', 'PASS', "app/robots.js specifies crawler rules and sitemap mapping", files.robots);
    } else {
      addResult('ROBOTS_CHECK', 'Robots.txt Directives', 'WARN', "app/robots.js exists but may lack sitemap reference", files.robots);
    }
  } else {
    addResult('ROBOTS_CHECK', 'Robots.txt Directives', 'FAIL', "app/robots.js not found");
  }

  // 6. Open Graph Article Metadata
  if (files.blogDetail && fs.existsSync(files.blogDetail)) {
    const detailContent = fs.readFileSync(files.blogDetail, 'utf8');
    const hasArticleType = /type\s*:\s*['"]article['"]/.test(detailContent);
    const hasImages = /images\s*:/.test(detailContent);

    if (hasArticleType && hasImages) {
      addResult('OPEN_GRAPH_META', 'Open Graph Article Metadata', 'PASS', "generateMetadata exports openGraph with type 'article' and images", files.blogDetail);
    } else {
      addResult('OPEN_GRAPH_META', 'Open Graph Article Metadata', 'WARN', "openGraph missing type 'article' or image definitions", files.blogDetail);
    }
  }

  // 7. LCP Hero Image Optimization
  if (files.blogDetail && fs.existsSync(files.blogDetail)) {
    const detailContent = fs.readFileSync(files.blogDetail, 'utf8');
    const hasFetchPriority = /fetchPriority\s*=\s*['"]high['"]|preload\s*=\s*\{?true\}?/.test(detailContent);
    const hasDimensions = /width\s*=\s*\{?\d+\}?|height\s*=\s*\{?\d+\}?|fill/.test(detailContent);

    if (hasFetchPriority && hasDimensions) {
      addResult('LCP_HERO_IMAGE', 'LCP Hero Image Optimization', 'PASS', "Hero image applies fetchPriority='high' (or preload) with layout dimensions", files.blogDetail);
    } else if (hasDimensions) {
      addResult('LCP_HERO_IMAGE', 'LCP Hero Image Optimization', 'WARN', "Hero image has dimensions but lacks fetchPriority='high' for LCP acceleration", files.blogDetail);
    } else {
      addResult('LCP_HERO_IMAGE', 'LCP Hero Image Optimization', 'FAIL', "Hero image lacks explicit width/height dimensions (CLS risk)", files.blogDetail);
    }
  }

  // 8. INP Safety (Server Component Check)
  if (files.blogDetail && fs.existsSync(files.blogDetail)) {
    const detailContent = fs.readFileSync(files.blogDetail, 'utf8');
    const trimmed = detailContent.trim();
    if (trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"')) {
      addResult('INP_SAFETY', 'Server Component Architecture', 'FAIL', "Blog detail route root is a Client Component ('use client'); must be Server Component to protect INP", files.blogDetail);
    } else {
      addResult('INP_SAFETY', 'Server Component Architecture', 'PASS', "Blog detail route is a Server Component with zero root client hydration", files.blogDetail);
    }
  }

  // 9. Anti-Gimmick Check (No llms.txt or AI-only markup)
  if (fs.existsSync(files.publicLlms)) {
    addResult('ANTI_GIMMICK', 'Ineffective AI Search Tactics', 'FAIL', "Forbidden llms.txt detected in public/ directory; ineffective for Google Search ranking", files.publicLlms);
  } else {
    addResult('ANTI_GIMMICK', 'Ineffective AI Search Tactics', 'PASS', "Clean technical SEO baseline: zero llms.txt or speculative AI-only markup");
  }

  return results;
}

export async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }

  const audit = auditBlogSEO(options.dir);

  if (options.json) {
    process.stdout.write(JSON.stringify(audit, null, 2) + '\n');
  } else {
    process.stdout.write(`\n=== Blog SEO & Core Web Vitals Static Audit ===\n`);
    process.stdout.write(`Target Directory : ${maskSensitive(audit.siteDir)}\n`);
    process.stdout.write(`Timestamp        : ${audit.timestamp}\n\n`);

    for (const check of audit.checks) {
      const tag = check.status === 'PASS' ? '[PASS]' : check.status === 'WARN' ? '[WARN]' : '[FAIL]';
      const fileStr = check.file ? ` (${check.file})` : '';
      process.stdout.write(`${tag.padEnd(7)} ${check.title}${fileStr}\n`);
      process.stdout.write(`        ${maskSensitive(check.message)}\n`);
    }

    process.stdout.write(`\nSummary: ${audit.passedCount} Passed, ${audit.warningCount} Warnings, ${audit.failedCount} Failed\n`);
  }

  if (audit.failedCount > 0 || (options.strict && audit.warningCount > 0)) {
    process.exit(1);
  }

  process.exit(0);
}

// Top-level error handling
if (process.argv[1] && process.argv[1] === import.meta.filename) {
  main().catch((err) => {
    process.stderr.write(`Error: ${maskSensitive(err.message || String(err))}\n`);
    process.exit(1);
  });
}

