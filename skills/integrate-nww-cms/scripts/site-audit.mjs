#!/usr/bin/env node

/**
 * site-audit.mjs
 *
 * Read-only static analyzer for existing Next.js websites.
 * Audits framework version, router type, styling, package manager, content sources,
 * route inventory, section types per page, SEO/JSON-LD, env files, and deploy targets.
 * Outputs a machine-readable audit file to .nww-cms/audit.json.
 *
 * Usage:
 *   node scripts/site-audit.mjs [--target <dir>] [--out <file>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function printHelp() {
  console.log(`
site-audit CLI - Read-Only Next.js Architectural Static Analyzer

Usage:
  node scripts/site-audit.mjs [options]

Options:
  --target <dir>     Target repository directory (default: current working directory)
  --out <file>       Path for machine-readable output JSON (default: .nww-cms/audit.json)
  --help, -h         Display this help message
`);
}

function parseCliArgs(rawArgs) {
  const options = {
    target: process.cwd(),
    out: null,
    help: false
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--target') {
      options.target = rawArgs[++i];
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    } else if (arg === '--out') {
      options.out = rawArgs[++i];
    } else if (arg.startsWith('--out=')) {
      options.out = arg.split('=')[1];
    }
  }

  return options;
}

function findSiteRoot(baseDir) {
  // If baseDir has package.json with next, that's it
  const rootPkg = path.join(baseDir, 'package.json');
  if (fs.existsSync(rootPkg)) {
    try {
      const data = JSON.parse(fs.readFileSync(rootPkg, 'utf-8'));
      if (data.dependencies?.next || data.devDependencies?.next) {
        return { siteDir: baseDir, relativeSubfolder: '.' };
      }
    } catch {
      // continue
    }
  }

  // Common subfolders in monorepos
  const candidates = ['site', 'frontend', 'web', 'apps/web', 'apps/site'];
  for (const cand of candidates) {
    const subPkg = path.join(baseDir, cand, 'package.json');
    if (fs.existsSync(subPkg)) {
      try {
        const data = JSON.parse(fs.readFileSync(subPkg, 'utf-8'));
        if (data.dependencies?.next || data.devDependencies?.next) {
          return { siteDir: path.join(baseDir, cand), relativeSubfolder: cand };
        }
      } catch {
        // continue
      }
    }
  }

  return { siteDir: baseDir, relativeSubfolder: '.' };
}

function detectPackageManager(dir) {
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(dir, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(dir, 'bun.lockb')) || fs.existsSync(path.join(dir, 'bun.lock'))) return 'bun';
  return 'unknown';
}

function detectStyling(pkg, siteDir) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const frameworks = [];

  if (deps['tailwindcss']) frameworks.push('tailwind');
  if (deps['styled-components']) frameworks.push('styled-components');
  if (deps['@emotion/react']) frameworks.push('emotion');
  if (deps['@mantine/core']) frameworks.push('mantine');
  if (deps['sass']) frameworks.push('sass');

  // Check tailwind config
  const tailwindConfigs = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs',
    'tailwind.config.cjs'
  ];
  const hasTailwindFile = tailwindConfigs.some(f => fs.existsSync(path.join(siteDir, f)));
  if (hasTailwindFile && !frameworks.includes('tailwind')) {
    frameworks.push('tailwind');
  }

  return frameworks.length > 0 ? frameworks : ['css-modules/vanilla'];
}

function detectRouter(siteDir) {
  const hasApp = fs.existsSync(path.join(siteDir, 'app')) || fs.existsSync(path.join(siteDir, 'src', 'app'));
  const hasPages = fs.existsSync(path.join(siteDir, 'pages')) || fs.existsSync(path.join(siteDir, 'src', 'pages'));

  if (hasApp && hasPages) return 'hybrid';
  if (hasApp) return 'app';
  if (hasPages) return 'pages';
  return 'unknown';
}

function detectTypeScript(siteDir) {
  return fs.existsSync(path.join(siteDir, 'tsconfig.json'));
}

function findAppRoutes(appDir) {
  const routes = [];
  if (!fs.existsSync(appDir)) return routes;

  function traverse(currentDir, routePrefix = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const seg = entry.name;
        // Skip route group parens e.g. (marketing) in route path but traverse inside
        const nextPrefix = seg.startsWith('(') && seg.endsWith(')')
          ? routePrefix
          : `${routePrefix}/${seg}`;
        traverse(path.join(currentDir, entry.name), nextPrefix);
      } else if (entry.isFile() && /^page\.(jsx?|tsx?)$/.test(entry.name)) {
        const routePath = routePrefix === '' ? '/' : routePrefix;
        routes.push({
          route: routePath,
          file: path.relative(appDir, path.join(currentDir, entry.name)).replace(/\\/g, '/'),
          fullPath: path.join(currentDir, entry.name)
        });
      }
    }
  }

  traverse(appDir, '');
  return routes;
}

function findPagesRoutes(pagesDir) {
  const routes = [];
  if (!fs.existsSync(pagesDir)) return routes;

  function traverse(currentDir, routePrefix = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === 'api') continue;
        traverse(path.join(currentDir, entry.name), `${routePrefix}/${entry.name}`);
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        const base = entry.name.replace(/\.(jsx?|tsx?)$/, '');
        if (base.startsWith('_')) continue; // skip _app, _document, _error

        let routePath = routePrefix;
        if (base === 'index') {
          routePath = routePrefix === '' ? '/' : routePrefix;
        } else {
          routePath = `${routePrefix}/${base}`;
        }

        routes.push({
          route: routePath,
          file: path.relative(pagesDir, path.join(currentDir, entry.name)).replace(/\\/g, '/'),
          fullPath: path.join(currentDir, entry.name)
        });
      }
    }
  }

  traverse(pagesDir, '');
  return routes;
}

const SECTION_PATTERNS = [
  { type: 'Hero', regex: /hero/i },
  { type: 'Features', regex: /feature/i },
  { type: 'Testimonials', regex: /testimonial|review|quote/i },
  { type: 'FAQ', regex: /faq|question|accordion/i },
  { type: 'CTA Banner', regex: /cta|calltoaction|banner/i },
  { type: 'Bento Grid', regex: /bento/i },
  { type: 'Stats / Metrics', regex: /stat|metric|counter|number/i },
  { type: 'Process / Steps', regex: /process|step|howitworks|workflow/i },
  { type: 'Pricing / Plans', regex: /pricing|plan|tier/i },
  { type: 'Case Studies / Work', regex: /casestudy|case-study|portfolio|project/i },
  { type: 'Services', regex: /service/i },
  { type: 'Contact Form', regex: /contact|inquiry|form/i }
];

function analyzePageSections(filePath) {
  const sections = new Set();
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const { type, regex } of SECTION_PATTERNS) {
      if (regex.test(content)) {
        sections.add(type);
      }
    }
  } catch {
    // continue
  }
  return Array.from(sections);
}

function detectContentSources(siteDir) {
  const sources = [];
  const candidateFolders = ['content', 'data', 'posts', 'blogs', '_posts'];

  for (const f of candidateFolders) {
    const p = path.join(siteDir, f);
    if (fs.existsSync(p)) {
      const files = fs.readdirSync(p, { recursive: true });
      const hasMdx = files.some(file => typeof file === 'string' && /\.(md|mdx)$/.test(file));
      const hasJson = files.some(file => typeof file === 'string' && /\.json$/.test(file));
      if (hasMdx) sources.push(`local-mdx:${f}`);
      if (hasJson) sources.push(`local-json:${f}`);
    }
  }

  // Check dependencies for external CMS
  const pkgPath = path.join(siteDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
      if (deps.includes('@sanity/client')) sources.push('external-cms:sanity');
      if (deps.includes('contentful')) sources.push('external-cms:contentful');
      if (deps.includes('@strapi/strapi') || deps.includes('strapi-sdk-js')) sources.push('external-cms:strapi');
      if (deps.includes('@prismicio/client')) sources.push('external-cms:prismic');
    } catch {
      // continue
    }
  }

  if (sources.length === 0) {
    sources.push('hardcoded-jsx');
  }

  return sources;
}

function detectSeoStructure(siteDir, routerType) {
  const seoDetails = {
    hasMetadataExport: false,
    hasGenerateMetadata: false,
    hasHeadComponent: false,
    hasJsonLd: false,
    hasSitemap: false,
    hasRobots: false
  };

  const filesToCheck = [];
  function collectFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        collectFiles(path.join(dir, ent.name));
      } else if (/\.(jsx?|tsx?)$/.test(ent.name)) {
        filesToCheck.push(path.join(dir, ent.name));
      }
    }
  }

  if (routerType === 'app' || routerType === 'hybrid') {
    collectFiles(path.join(siteDir, 'app'));
    collectFiles(path.join(siteDir, 'src', 'app'));
  }
  if (routerType === 'pages' || routerType === 'hybrid') {
    collectFiles(path.join(siteDir, 'pages'));
    collectFiles(path.join(siteDir, 'src', 'pages'));
  }

  for (const f of filesToCheck.slice(0, 50)) {
    try {
      const text = fs.readFileSync(f, 'utf-8');
      if (text.includes('export const metadata')) seoDetails.hasMetadataExport = true;
      if (text.includes('export async function generateMetadata')) seoDetails.hasGenerateMetadata = true;
      if (text.includes('next/head') || text.includes('<Head>')) seoDetails.hasHeadComponent = true;
      if (text.includes('application/ld+json')) seoDetails.hasJsonLd = true;
    } catch {
      // continue
    }
  }

  // Sitemap & robots files
  const sitemapFiles = [
    'app/sitemap.js', 'app/sitemap.ts', 'src/app/sitemap.js', 'src/app/sitemap.ts',
    'public/sitemap.xml', 'pages/sitemap.xml.js'
  ];
  seoDetails.hasSitemap = sitemapFiles.some(f => fs.existsSync(path.join(siteDir, f)));

  const robotsFiles = [
    'app/robots.js', 'app/robots.ts', 'src/app/robots.js', 'src/app/robots.ts',
    'public/robots.txt'
  ];
  seoDetails.hasRobots = robotsFiles.some(f => fs.existsSync(path.join(siteDir, f)));

  return seoDetails;
}

function scanEnvVariables(siteDir) {
  const envFiles = [
    '.env',
    '.env.local',
    '.env.example',
    '.env.development',
    '.env.production'
  ];

  const detectedFiles = [];
  const variableNames = new Set();

  for (const ef of envFiles) {
    const full = path.join(siteDir, ef);
    if (fs.existsSync(full)) {
      detectedFiles.push(ef);
      try {
        const lines = fs.readFileSync(full, 'utf-8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const varName = trimmed.slice(0, eqIdx).trim();
            if (varName) variableNames.add(varName);
          }
        }
      } catch {
        // continue
      }
    }
  }

  return {
    files: detectedFiles,
    variableNames: Array.from(variableNames).sort()
  };
}

function detectDeployTarget(siteDir) {
  if (fs.existsSync(path.join(siteDir, 'vercel.json'))) return 'vercel';
  if (fs.existsSync(path.join(siteDir, 'netlify.toml'))) return 'netlify';
  if (fs.existsSync(path.join(siteDir, 'Dockerfile'))) return 'docker';
  return 'standard-nextjs';
}

// Main execution
const options = parseCliArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const baseDir = path.resolve(options.target);
const { siteDir, relativeSubfolder } = findSiteRoot(baseDir);

const pkgPath = path.join(siteDir, 'package.json');
let pkg = {};
if (fs.existsSync(pkgPath)) {
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch (err) {
    console.error(`Warning: Could not parse package.json: ${err.message}`);
  }
}

const nextVersion = pkg.dependencies?.next || pkg.devDependencies?.next || 'unknown';
const reactVersion = pkg.dependencies?.react || pkg.devDependencies?.react || 'unknown';
const packageManager = detectPackageManager(baseDir) !== 'unknown'
  ? detectPackageManager(baseDir)
  : detectPackageManager(siteDir);
const routerType = detectRouter(siteDir);
const isTypeScript = detectTypeScript(siteDir);
const styling = detectStyling(pkg, siteDir);
const contentSources = detectContentSources(siteDir);

// Collect routes
let rawRoutes = [];
if (routerType === 'app' || routerType === 'hybrid') {
  const appDir = fs.existsSync(path.join(siteDir, 'app'))
    ? path.join(siteDir, 'app')
    : path.join(siteDir, 'src', 'app');
  rawRoutes = rawRoutes.concat(findAppRoutes(appDir));
}
if (routerType === 'pages' || routerType === 'hybrid') {
  const pagesDir = fs.existsSync(path.join(siteDir, 'pages'))
    ? path.join(siteDir, 'pages')
    : path.join(siteDir, 'src', 'pages');
  rawRoutes = rawRoutes.concat(findPagesRoutes(pagesDir));
}

// Deduplicate routes and analyze sections
const routeMap = new Map();
for (const r of rawRoutes) {
  if (!routeMap.has(r.route)) {
    const sections = analyzePageSections(r.fullPath);
    routeMap.set(r.route, {
      route: r.route,
      file: r.file,
      detectedSections: sections
    });
  }
}

const routes = Array.from(routeMap.values());
const seoStructure = detectSeoStructure(siteDir, routerType);
const envAudit = scanEnvVariables(siteDir);
const deployTarget = detectDeployTarget(siteDir);

const auditReport = {
  timestamp: new Date().toISOString(),
  targetDirectory: baseDir,
  siteSubfolder: relativeSubfolder,
  framework: {
    next: nextVersion,
    react: reactVersion,
    isTypeScript,
    routerType
  },
  packageManager,
  styling,
  contentSources,
  routesCount: routes.length,
  routes,
  seo: seoStructure,
  environment: envAudit,
  deployTarget
};

// Output
const outPath = options.out
  ? path.resolve(options.out)
  : path.join(baseDir, '.nww-cms', 'audit.json');

const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outPath, JSON.stringify(auditReport, null, 2) + '\n', 'utf-8');

console.log('================================================================================');
console.log('  NWW CMS SITE AUDIT COMPLETED');
console.log('================================================================================');
console.log(`Next.js Version:   ${nextVersion}`);
console.log(`Router Type:       ${routerType.toUpperCase()}`);
console.log(`TypeScript:        ${isTypeScript ? 'Yes' : 'No'}`);
console.log(`Package Manager:   ${packageManager}`);
console.log(`Styling Stack:     ${styling.join(', ')}`);
console.log(`Content Sources:   ${contentSources.join(', ')}`);
console.log(`Routes Discovered: ${routes.length}`);
for (const r of routes) {
  const secSummary = r.detectedSections.length > 0 ? `(${r.detectedSections.join(', ')})` : '(No standard sections)';
  console.log(` - ${r.route.padEnd(25)} ${secSummary}`);
}
console.log(`Audit saved to:    ${path.relative(baseDir, outPath).replace(/\\/g, '/')}`);
console.log('================================================================================');
