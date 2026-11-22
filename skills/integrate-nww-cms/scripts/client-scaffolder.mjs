#!/usr/bin/env node

/**
 * client-scaffolder.mjs
 *
 * Scaffolds a zero-dependency, typed NWW CMS data-access client layer into an existing Next.js repo.
 * Dynamically outputs TypeScript or JSDoc-annotated JavaScript matching the target site's stack,
 * and configures caching according to the detected router (App Router fetch tags vs Pages Router).
 * Updates .env.example with variable NAMES only.
 *
 * Usage:
 *   node scripts/client-scaffolder.mjs [--target <dir>] [--audit <file>] [--dest <dir>] [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function printHelp() {
  console.log(`
client-scaffolder CLI - Scaffolds Typed NWW CMS Client Layer

Usage:
  node scripts/client-scaffolder.mjs [options]

Options:
  --target <dir>     Target repository directory (default: current working directory)
  --audit <file>     Path to audit.json (default: .nww-cms/audit.json)
  --dest <dir>       Relative data-access folder (default: src/lib/cms or lib/cms)
  --dry-run          Preview files to be generated without writing to disk
  --help, -h         Display this help message
`);
}

function parseCliArgs(rawArgs) {
  const options = {
    target: process.cwd(),
    audit: null,
    dest: null,
    dryRun: false,
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
    } else if (arg === '--audit') {
      options.audit = rawArgs[++i];
    } else if (arg.startsWith('--audit=')) {
      options.audit = arg.split('=')[1];
    } else if (arg === '--dest') {
      options.dest = rawArgs[++i];
    } else if (arg.startsWith('--dest=')) {
      options.dest = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// Main execution
const options = parseCliArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const baseDir = path.resolve(options.target);
const auditPath = options.audit
  ? path.resolve(options.audit)
  : path.join(baseDir, '.nww-cms', 'audit.json');

let audit = {
  framework: { isTypeScript: true, routerType: 'app' },
  siteSubfolder: '.'
};

if (fs.existsSync(auditPath)) {
  try {
    audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
  } catch {
    // fallback
  }
}

const isTypeScript = audit.framework?.isTypeScript ?? true;
const routerType = audit.framework?.routerType ?? 'app';
const siteDir = path.join(baseDir, audit.siteSubfolder || '.');

let defaultDest = 'lib/cms';
if (fs.existsSync(path.join(siteDir, 'src'))) {
  defaultDest = 'src/lib/cms';
}
const relativeDest = options.dest || defaultDest;
const targetCmsDir = path.join(siteDir, relativeDest);

const ext = isTypeScript ? 'ts' : 'js';

// Code templates
const errorModule = `/**
 * Sanitized CMS Error Class
 * Strips confidential tokens and API secrets from logs and traces.
 */
export class CMSError extends Error {
  ${isTypeScript ? 'public status: number;\n  public cause?: unknown;' : ''}
  constructor(message${isTypeScript ? ': string' : ''}, status${isTypeScript ? ': number = 500' : ' = 500'}, cause${isTypeScript ? '?: unknown' : ''}) {
    // Redact Bearer tokens and sensitive query parameters
    const sanitized = String(message)
      .replace(/Bearer\\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]')
      .replace(/key=[a-zA-Z0-9._-]+/gi, 'key=[REDACTED]');
    super(sanitized);
    this.name = 'CMSError';
    this.status = status;
    if (cause) this.cause = cause;
  }
}
`;

const revalidationModule = `/**
 * NWW CMS Revalidation Protocol
 */
export const ALLOWED_RESOURCES = [
  'page-config',
  'blog',
  'service',
  'portfolio',
  'testimonial',
  'faq',
  'case-study',
  'tool',
  'tag'
]${isTypeScript ? ' as const' : ''};

${isTypeScript ? 'export type AllowedResource = (typeof ALLOWED_RESOURCES)[number];\n' : ''}
export const REVALIDATE_SECONDS = 60;

/**
 * Generates a canonical Next.js cache tag for a CMS resource.
 */
export function tagFor(resource${isTypeScript ? ': string' : ''})${isTypeScript ? ': string' : ''} {
  const clean = String(resource || 'global').trim().toLowerCase();
  return \`cms:\${clean}\`;
}
`;

const clientModule = `import { CMSError } from './error';
import { tagFor, REVALIDATE_SECONDS } from './revalidation';

export interface CmsFetchOptions {
  resource?: string;
  init?: RequestInit;
  timeoutMs?: number;
}

/**
 * Universal NWW CMS HTTP Data Access Client
 */
export async function cmsFetch${isTypeScript ? '<T = any>' : ''}(
  endpoint${isTypeScript ? ': string' : ''},
  options${isTypeScript ? ': CmsFetchOptions = {}' : ' = {}'}
)${isTypeScript ? ': Promise<T | null>' : ''} {
  const { resource = 'global', init = {}, timeoutMs = 10000 } = options;
  const rawUrl = (process.env.SERVER_URL || 'https://prod-server.nextwebworks.com').trim();
  const token = (process.env.CMS_TOKEN || '').trim();

  const serverUrl = rawUrl.replace(/\\/+$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : \`/\${endpoint}\`;
  const url = \`\${serverUrl}\${cleanPath}\`;
  const tag = tagFor(resource);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers${isTypeScript ? ': Record<string, string>' : ''} = {
      Accept: 'application/json',
      'User-Agent': 'NWW-CMS-NextJS-Client/1.0',
      ...((init.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = \`Bearer \${token}\`;
      headers['x-site-key'] = token;
    }

    ${routerType === 'app' || routerType === 'hybrid' ? `
    const fetchInit: RequestInit = {
      ...init,
      signal: controller.signal,
      headers,
      next: {
        tags: [tag],
        revalidate: REVALIDATE_SECONDS,
      },
    };
    ` : `
    const fetchInit: RequestInit = {
      ...init,
      signal: controller.signal,
      headers,
    };
    `}

    const res = await fetch(url, fetchInit);

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new CMSError(
        \`Request failed with HTTP \${res.status} \${res.statusText} at \${endpoint}\`,
        res.status
      );
    }

    return (await res.json()) as T;
  } catch (err${isTypeScript ? ': any' : ''}) {
    if (err instanceof CMSError) throw err;
    if (err.name === 'AbortError') {
      throw new CMSError(\`Request timed out after \${timeoutMs}ms at \${endpoint}\`, 504, err);
    }
    throw new CMSError(err.message || 'Network error occurred', 500, err);
  } finally {
    clearTimeout(timer);
  }
}
`;

const siteConfigModule = `/**
 * Site Identity & Origin Domain Resolver
 */
export class SiteConfig {
  static getName()${isTypeScript ? ': string' : ''} {
    return process.env.SITE_NAME || 'Default Site';
  }

  static getUrl()${isTypeScript ? ': string' : ''} {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\\/+$/, '');
  }
}
`;

const pageConfigModule = `import { cmsFetch } from './client';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PageConfigData {
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: string;
  showCTA?: boolean;
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaSecondaryButtonText?: string;
  ctaSecondaryButtonLink?: string;
  faqs?: FAQItem[];
  heroBadge?: string;
  heroHeadline?: string;
  heroSubtext?: string;
  headerVariant?: 'default' | 'transparent' | 'minimal' | 'hidden';
  showFooter?: boolean;
  banner?: { enabled: boolean; text?: string; link?: string };
  metadata?: Record<string, any>;
}

export class PageConfig {
  static async readOne(slug${isTypeScript ? ': string' : ''})${isTypeScript ? ': Promise<PageConfigData | null>' : ''} {
    try {
      const res = await cmsFetch<{ body: PageConfigData } | PageConfigData>(
        \`/api/website-page-config/read-one-by-slug/\${slug}\`,
        { resource: 'page-config' }
      );
      if (!res) return null;
      return ('body' in res ? res.body : res) as PageConfigData;
    } catch {
      return null;
    }
  }

  static async paginate()${isTypeScript ? ': Promise<PageConfigData[]>' : ''} {
    try {
      const res = await cmsFetch<{ items: PageConfigData[] } | PageConfigData[]>(
        '/api/website-page-config/paginate',
        { resource: 'page-config' }
      );
      if (!res) return [];
      return Array.isArray(res) ? res : res.items || [];
    } catch {
      return [];
    }
  }
}
`;

const blogModule = `import { cmsFetch } from './client';

export interface BlogPost {
  title: string;
  slug: string;
  content: string;
  image?: string;
  cover_image?: string;
  postedAt?: string;
  lastUpdatedAt?: string;
  author_name?: string;
  author_image?: string;
  author_id?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: Array<{ name: string; slug: string }>;
  status: 'draft' | 'published' | 'archived';
}

export class Blog {
  static async readOne(slug${isTypeScript ? ': string' : ''})${isTypeScript ? ': Promise<BlogPost | null>' : ''} {
    try {
      const res = await cmsFetch<{ body: BlogPost } | BlogPost>(
        \`/api/blog/read-one-by-slug/\${slug}\`,
        { resource: 'blog' }
      );
      if (!res) return null;
      return ('body' in res ? res.body : res) as BlogPost;
    } catch {
      return null;
    }
  }

  static async paginate(query${isTypeScript ? ': Record<string, any> = {}' : ' = {}'})${isTypeScript ? ': Promise<BlogPost[]>' : ''} {
    try {
      const params = new URLSearchParams(query);
      const res = await cmsFetch<{ items: BlogPost[] } | BlogPost[]>(
        \`/api/blog/paginate?\${params.toString()}\`,
        { resource: 'blog' }
      );
      if (!res) return [];
      return Array.isArray(res) ? res : res.items || [];
    } catch {
      return [];
    }
  }
}
`;

const seoHelperModule = `import { SiteConfig } from './site-config';
import type { PageConfigData } from './page-config';

/**
 * SEO & Schema.org Structured Data Helper
 */
export class SEOHelper {
  static generateMetadata(pageConfig${isTypeScript ? '?: PageConfigData | null' : ''}, fallbackTitle = '') {
    const siteName = SiteConfig.getName();
    const siteUrl = SiteConfig.getUrl();

    const title = pageConfig?.metaTitle || pageConfig?.title || fallbackTitle || siteName;
    const description = pageConfig?.metaDescription || \`Welcome to \${siteName}\`;
    const canonical = pageConfig?.canonicalUrl || siteUrl;

    return {
      title: \`\${title} | \${siteName}\`,
      description,
      alternates: {
        canonical,
      },
      robots: {
        index: !pageConfig?.noIndex,
        follow: !pageConfig?.noFollow,
      },
      openGraph: {
        title: pageConfig?.ogTitle || title,
        description: pageConfig?.ogDescription || description,
        url: canonical,
        siteName,
        images: pageConfig?.ogImage ? [{ url: pageConfig.ogImage }] : [],
        type: 'website',
      },
      twitter: {
        card: pageConfig?.twitterCard || 'summary_large_image',
        title: pageConfig?.ogTitle || title,
        description: pageConfig?.ogDescription || description,
        images: pageConfig?.ogImage ? [pageConfig.ogImage] : [],
      },
    };
  }

  static safeJsonLd(rawJson${isTypeScript ? ': string' : ''})${isTypeScript ? ': string' : ''} {
    try {
      const parsed = JSON.parse(rawJson);
      return JSON.stringify(parsed).replace(/</g, '\\\\u003c');
    } catch {
      return '';
    }
  }
}
`;

const indexBarrel = `export * from './client';
export * from './error';
export * from './revalidation';
export * from './site-config';
export * from './page-config';
export * from './blog';
export * from './seo-helper';
`;

const filesToCreate = [
  { name: `error.${ext}`, content: errorModule },
  { name: `revalidation.${ext}`, content: revalidationModule },
  { name: `client.${ext}`, content: clientModule },
  { name: `site-config.${ext}`, content: siteConfigModule },
  { name: `page-config.${ext}`, content: pageConfigModule },
  { name: `blog.${ext}`, content: blogModule },
  { name: `seo-helper.${ext}`, content: seoHelperModule },
  { name: `index.${ext}`, content: indexBarrel },
];

if (options.dryRun) {
  console.log(`[DRY-RUN] Would generate ${filesToCreate.length} client files in ${path.relative(baseDir, targetCmsDir).replace(/\\/g, '/')}:`);
  for (const f of filesToCreate) {
    console.log(` - ${f.name} (${f.content.length} bytes)`);
  }
  process.exit(0);
}

// Write client files
if (!fs.existsSync(targetCmsDir)) {
  fs.mkdirSync(targetCmsDir, { recursive: true });
}

for (const f of filesToCreate) {
  const destPath = path.join(targetCmsDir, f.name);
  fs.writeFileSync(destPath, f.content, 'utf-8');
}

// Update .env.example
const envExamplePath = path.join(siteDir, '.env.example');
const envVarsToAdd = [
  '# NWW CMS Backend Configuration',
  'SERVER_URL=https://prod-server.nextwebworks.com',
  'CMS_TOKEN=',
  'REVALIDATE_SECRET=',
  'SITE_NAME=',
  'NEXT_PUBLIC_SITE_URL=http://localhost:3000'
];

let existingEnv = '';
if (fs.existsSync(envExamplePath)) {
  existingEnv = fs.readFileSync(envExamplePath, 'utf-8');
}

let updatedEnv = existingEnv;
for (const line of envVarsToAdd) {
  const keyMatch = line.match(/^([A-Z_]+)=/);
  if (keyMatch) {
    const key = keyMatch[1];
    if (!existingEnv.includes(`${key}=`)) {
      updatedEnv += `\n${line}`;
    }
  } else if (!existingEnv.includes(line)) {
    updatedEnv += `\n${line}`;
  }
}

fs.writeFileSync(envExamplePath, updatedEnv.trim() + '\n', 'utf-8');

// Write client specification doc
const nwwDir = path.join(baseDir, '.nww-cms');
if (!fs.existsSync(nwwDir)) {
  fs.mkdirSync(nwwDir, { recursive: true });
}

const specLines = [
  '# NWW CMS Client Layer Specification',
  '',
  `> **Location:** \`${path.relative(baseDir, targetCmsDir).replace(/\\/g, '/')}\``,
  `> **Language:** ${isTypeScript ? 'TypeScript' : 'JavaScript (ESM with JSDoc)'}`,
  `> **Router Mode:** ${routerType.toUpperCase()}`,
  `> **Generated:** ${new Date().toISOString()}`,
  '',
  '---',
  '',
  '## 1. Modules Scaffolding Summary',
  '',
  `- \`client.${ext}\`: Universal cached fetch client injecting Bearer token & \`cms:<resource>\` tags.`,
  `- \`error.${ext}\`: Sanitized \`CMSError\` class redacting secrets.`,
  `- \`revalidation.${ext}\`: Resource cache tags and constant \`REVALIDATE_SECONDS = 60\`.`,
  `- \`site-config.${ext}\`: Brand name & canonical URL resolver.`,
  `- \`page-config.${ext}\`: Page configuration model (\`readOne\`, \`paginate\`).`,
  `- \`blog.${ext}\`: Blog model helper (\`readOne\`, \`paginate\`).`,
  `- \`seo-helper.${ext}\`: Metadata & XSS-safe JSON-LD structured data generator.`,
  `- \`index.${ext}\`: Unified barrel export.`,
  '',
  '---',
  '',
  '## 2. Environment Variables Contract (.env.example)',
  '',
  '```env',
  'SERVER_URL=https://prod-server.nextwebworks.com',
  'CMS_TOKEN=your-cms-website-token',
  'REVALIDATE_SECRET=your-revalidation-shared-secret',
  'SITE_NAME=Your Brand Name',
  'NEXT_PUBLIC_SITE_URL=https://example.com',
  '```',
  '',
  '---',
  '',
  '## 3. Human Approval Checklist',
  '',
  '- [ ] Client files generated in approved single data-access directory.',
  '- [ ] Zero external dependencies added to package.json.',
  '- [ ] Environment variable names added to `.env.example` without secret values.',
  '- [ ] Error logging verifies no credentials leak in stack traces.'
];

fs.writeFileSync(path.join(nwwDir, 'client-spec.md'), specLines.join('\n') + '\n', 'utf-8');

console.log('================================================================================');
console.log('  NWW CMS CLIENT LAYER SCAFFOLDED');
console.log('================================================================================');
console.log(`Directory:     ${path.relative(baseDir, targetCmsDir).replace(/\\/g, '/')}`);
console.log(`Language:      ${isTypeScript ? 'TypeScript' : 'JavaScript'}`);
console.log(`Files Created: ${filesToCreate.length}`);
console.log(`Env Example:   ${path.relative(baseDir, envExamplePath).replace(/\\/g, '/')}`);
console.log(`Client Spec:   .nww-cms/client-spec.md`);
console.log('================================================================================');
