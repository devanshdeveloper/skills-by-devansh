#!/usr/bin/env node

/**
 * model-mapper.mjs
 *
 * Maps audited Next.js pages, routes, and sections to NWW CMS models and fields.
 * Applies standing NWW decisions:
 *   - No 'path' on page config (slug-only resolution)
 *   - No 'structuredDataType' on page config (replaced by validated jsonLd field)
 *   - 'jsonLd' field accepts only valid JSON-LD
 *   - 'tags' in content models reference the website tags model
 *   - 'icon' is an image upload URL
 * Identifies unmapped content and generates a structured mapping table in .nww-cms/content-mapping.md.
 *
 * Usage:
 *   node scripts/model-mapper.mjs [--target <dir>] [--audit <file>] [--out <file>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function printHelp() {
  console.log(`
model-mapper CLI - Content to NWW CMS Model Mapping Helper

Usage:
  node scripts/model-mapper.mjs [options]

Options:
  --target <dir>     Target repository directory (default: current working directory)
  --audit <file>     Path to audit.json (default: .nww-cms/audit.json)
  --out <file>       Output markdown path (default: .nww-cms/content-mapping.md)
  --help, -h         Display this help message
`);
}

function parseCliArgs(rawArgs) {
  const options = {
    target: process.cwd(),
    audit: null,
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
    } else if (arg === '--audit') {
      options.audit = rawArgs[++i];
    } else if (arg.startsWith('--audit=')) {
      options.audit = arg.split('=')[1];
    } else if (arg === '--out') {
      options.out = rawArgs[++i];
    } else if (arg.startsWith('--out=')) {
      options.out = arg.split('=')[1];
    }
  }

  return options;
}

const AUTHORITATIVE_MODELS = {
  'page-config': {
    name: 'WebsitePageConfig',
    endpoint: '/api/website-page-config',
    fields: [
      'title', 'slug', 'status', 'metaTitle', 'metaDescription', 'keywords',
      'canonicalUrl', 'noIndex', 'noFollow', 'ogTitle', 'ogDescription', 'ogImage',
      'twitterCard', 'jsonLd', 'showCTA', 'ctaHeadline', 'ctaSubtext',
      'ctaButtonText', 'ctaButtonLink', 'ctaSecondaryButtonText', 'ctaSecondaryButtonLink',
      'faqs', 'heroBadge', 'heroHeadline', 'heroSubtext', 'headerVariant', 'showFooter', 'banner', 'metadata'
    ],
    rules: [
      'No "path" field (resolved by slug)',
      'No "structuredDataType" field',
      '"jsonLd" accepts valid JSON-LD string only',
      '"faqs" array embeds question/answer pairs directly'
    ]
  },
  'blog': {
    name: 'Blog',
    endpoint: '/api/blog',
    fields: [
      'title', 'slug', 'content', 'image', 'cover_image', 'status',
      'postedAt', 'lastUpdatedAt', 'author_name', 'author_image', 'author_id',
      'metaTitle', 'metaDescription', 'tags', 'metadata'
    ],
    rules: [
      '"tags" array references WebsiteTag model',
      '"cover_image" is banner image; "image" is thumbnail',
      '"content" is HTML rendered from rich text editor'
    ]
  },
  'portfolio': {
    name: 'WebsitePortfolio',
    endpoint: '/api/website-portfolio',
    fields: [
      'title', 'slug', 'client', 'description', 'content', 'image', 'gallery',
      'services', 'tags', 'featured', 'liveUrl', 'completedAt', 'status',
      'metaTitle', 'metaDescription'
    ],
    rules: [
      '"tags" array references WebsiteTag model',
      '"gallery" is array of image upload URLs'
    ]
  },
  'service': {
    name: 'WebsiteService',
    endpoint: '/api/website-service',
    fields: [
      'title', 'slug', 'tagline', 'description', 'content', 'icon', 'image',
      'features', 'benefits', 'pricing', 'tags', 'status', 'metaTitle', 'metaDescription'
    ],
    rules: [
      '"icon" is an image upload URL (not SVG string or raw class)',
      '"tags" array references WebsiteTag model'
    ]
  },
  'case-study': {
    name: 'WebsiteCaseStudy',
    endpoint: '/api/website-case-study',
    fields: [
      'title', 'slug', 'client', 'industry', 'summary', 'challenge', 'solution',
      'results', 'testimonial', 'image', 'tags', 'status', 'metaTitle', 'metaDescription'
    ],
    rules: [
      '"tags" references WebsiteTag model',
      '"results" is array of { metric, label } objects'
    ]
  },
  'testimonial': {
    name: 'Testimonial',
    endpoint: '/api/testimonial',
    fields: ['name', 'role', 'company', 'content', 'image', 'rating', 'featured', 'status'],
    rules: ['"image" is reviewer avatar photo upload URL']
  },
  'faq': {
    name: 'WebsiteFAQ',
    endpoint: '/api/website-faq',
    fields: ['question', 'answer', 'category', 'order', 'status'],
    rules: ['Can be standalone model or embedded in WebsitePageConfig.faqs']
  },
  'tool': {
    name: 'WebsiteTool',
    endpoint: '/api/website-tool',
    fields: ['title', 'slug', 'tagline', 'description', 'icon', 'url', 'category', 'tags', 'pricingModel', 'status'],
    rules: ['"icon" is image upload URL', '"category" references WebsiteToolCategory', '"tags" references WebsiteTag']
  },
  'contact-us': {
    name: 'WebsiteContactUs',
    endpoint: '/api/website-contact-us/:id/submit',
    fields: ['firstName', 'lastName', 'email', 'phone', 'message', 'status'],
    rules: ['POST only form submission endpoint']
  },
  'tag': {
    name: 'WebsiteTag',
    endpoint: '/api/website-tag',
    fields: ['name', 'slug', 'color', 'type', 'status'],
    rules: ['"type" enum: blog | portfolio | service | tool']
  }
};

function inferRouteModel(routePath) {
  const clean = routePath.replace(/^\//, '').toLowerCase();

  if (clean === '' || clean === 'home') {
    return { model: 'page-config', slug: 'home', notes: 'Homepage configuration, hero, CTA, and page metadata' };
  }
  if (clean === 'about' || clean === 'company' || clean === 'story') {
    return { model: 'page-config', slug: clean, notes: 'About Us page configuration, story, mission' };
  }
  if (clean === 'contact' || clean === 'get-in-touch') {
    return { model: 'contact-us', slug: clean, notes: 'Contact page with WebsiteContactUs form submission' };
  }
  if (clean.startsWith('blog') || clean.startsWith('posts') || clean.startsWith('articles')) {
    if (clean.includes('[') || clean.includes(':')) {
      return { model: 'blog', slug: '[slug]', notes: 'Dynamic Blog detail post' };
    }
    return { model: 'blog', slug: 'index', notes: 'Blog index listing and category feeds' };
  }
  if (clean.startsWith('portfolio') || clean.startsWith('projects') || clean.startsWith('work')) {
    if (clean.includes('[') || clean.includes(':')) {
      return { model: 'portfolio', slug: '[slug]', notes: 'Portfolio project showcase detail' };
    }
    return { model: 'portfolio', slug: 'index', notes: 'Portfolio listing index' };
  }
  if (clean.startsWith('services')) {
    if (clean.includes('[') || clean.includes(':')) {
      return { model: 'service', slug: '[slug]', notes: 'Individual service offering detail' };
    }
    return { model: 'service', slug: 'index', notes: 'Services list index' };
  }
  if (clean.startsWith('case-studies')) {
    if (clean.includes('[') || clean.includes(':')) {
      return { model: 'case-study', slug: '[slug]', notes: 'Enterprise case study detail' };
    }
    return { model: 'case-study', slug: 'index', notes: 'Case studies archive' };
  }
  if (clean === 'faq' || clean === 'faqs') {
    return { model: 'faq', slug: 'faq', notes: 'Dedicated FAQ directory or page config FAQs' };
  }
  if (clean.startsWith('tools')) {
    return { model: 'tool', slug: clean.includes('[') ? '[slug]' : 'index', notes: 'Interactive tools directory' };
  }

  // Fallback to page-config for any generic static page
  const safeSlug = clean.replace(/[^a-z0-9-]+/g, '-');
  return { model: 'page-config', slug: safeSlug, notes: 'Standard page-level configuration and metadata' };
}

function mapSectionToField(sectionType, modelName) {
  switch (sectionType) {
    case 'Hero':
      return { field: 'heroBadge, heroHeadline, heroSubtext', model: 'page-config', notes: 'Dynamic copy overrides' };
    case 'FAQ':
      return { field: 'faqs', model: 'page-config', notes: 'Array of { question, answer }' };
    case 'CTA Banner':
      return { field: 'showCTA, ctaHeadline, ctaSubtext, ctaButtonText, ctaButtonLink', model: 'page-config', notes: 'Call-to-action block' };
    case 'Testimonials':
      return { field: 'Testimonial.paginate()', model: 'testimonial', notes: 'Paginated customer reviews' };
    case 'Features':
      return { field: 'metadata.features or Service.features', model: 'service/page-config', notes: 'Feature highlights' };
    case 'Contact Form':
      return { field: 'ContactUs.submit()', model: 'contact-us', notes: 'Submission endpoint' };
    case 'Pricing / Plans':
      return { field: 'WebsitePlan.paginate() (Proposed)', model: 'unmapped-plan', notes: 'Requires WebsitePlan or metadata' };
    case 'Process / Steps':
      return { field: 'metadata.processSteps', model: 'page-config', notes: 'Stored in pageConfig.metadata Map' };
    case 'Stats / Metrics':
      return { field: 'metadata.stats', model: 'page-config', notes: 'Stored in pageConfig.metadata Map' };
    case 'Bento Grid':
      return { field: 'metadata.bentoCards', model: 'page-config', notes: 'Stored in pageConfig.metadata Map' };
    default:
      return { field: `metadata.${sectionType.toLowerCase().replace(/[^a-z0-9]/g, '')}`, model: 'page-config', notes: 'Custom page section' };
  }
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

if (!fs.existsSync(auditPath)) {
  console.error(`Error: Audit file not found at ${auditPath}. Run 'site-audit' first.`);
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
const routes = audit.routes || [];

const mappings = [];
const unmappedSections = new Set();
const modelSet = new Set();

for (const r of routes) {
  const inferred = inferRouteModel(r.route);
  modelSet.add(inferred.model);

  const sectionMappings = (r.detectedSections || []).map(sec => {
    const secMap = mapSectionToField(sec, inferred.model);
    if (secMap.model.startsWith('unmapped')) {
      unmappedSections.add(sec);
    }
    return { section: sec, ...secMap };
  });

  mappings.push({
    route: r.route,
    file: r.file,
    model: inferred.model,
    slug: inferred.slug,
    notes: inferred.notes,
    sections: sectionMappings
  });
}

// Generate Markdown
const lines = [
  '# NWW CMS Content-to-Model Mapping Specification',
  '',
  `> **Target Project:** ${audit.targetDirectory}`,
  `> **Audited Routes:** ${routes.length}`,
  `> **Generated:** ${new Date().toISOString()}`,
  '',
  '---',
  '',
  '## 1. Standing NWW CMS Architecture Decisions',
  '',
  '- **Zero `path` on `WebsitePageConfig`:** Next.js routes resolve config documents strictly by `slug`. The `path` field is omitted.',
  '- **Zero `structuredDataType`:** The deprecated enum is replaced by the arbitrary, validated `jsonLd` string field.',
  '- **Valid JSON-LD Invariant:** `WebsitePageConfig.jsonLd` accepts only valid JSON-LD strings validated before render.',
  '- **WebsiteTag Taxonomy Reference:** Any content model with tags references `WebsiteTag` (`name`, `slug`, `color`, `type`).',
  '- **Icons as Image Uploads:** All icon fields (`WebsiteService.icon`, `WebsiteTool.icon`) store hosted image URLs, never raw SVG markup or CSS classes.',
  '',
  '---',
  '',
  '## 2. Route & Page-Level Model Mapping',
  '',
  '| Route | Source File | NWW Model | CMS Slug | Mapping Notes |',
  '| :--- | :--- | :--- | :--- | :--- |'
];

for (const m of mappings) {
  lines.push(`| \`${m.route}\` | \`${m.file}\` | **\`${m.model}\`** | \`${m.slug}\` | ${m.notes} |`);
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## 3. Page Section Breakdown & Field Assignments');
lines.push('');

for (const m of mappings) {
  lines.push(`### Route: \`${m.route}\` (\`${m.model}\`)`);
  if (m.sections.length === 0) {
    lines.push('_No semantic section patterns detected in file._');
  } else {
    lines.push('| Section Type | Target Field / Helper | Model | Implementation Notes |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const s of m.sections) {
      lines.push(`| ${s.section} | \`${s.field}\` | \`${s.model}\` | ${s.notes} |`);
    }
  }
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## 4. Unmapped Content & Proposed Schema Extensions');
lines.push('');

if (unmappedSections.size === 0) {
  lines.push('All detected sections map cleanly into standard NWW models or `WebsitePageConfig.metadata`.');
} else {
  lines.push('The following content sections do not have a dedicated 1:1 NWW backend collection and will map into `WebsitePageConfig.metadata` or require future backend schemas:');
  for (const u of unmappedSections) {
    lines.push(`- **${u}:** Recommended mapping is ` + '`WebsitePageConfig.metadata`' + ' or proposing a backend model.');
  }
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## 5. Human Sign-Off Checklist');
lines.push('');
lines.push('- [ ] All primary routes correctly identified and assigned to CMS models.');
lines.push('- [ ] Dynamic routes (`[slug]`) verified against backend slug indexing.');
lines.push('- [ ] Standing NWW rules approved (no `path`, no `structuredDataType`, validated `jsonLd`).');
lines.push('- [ ] Unmapped sections approved to use `metadata` map.');

const outPath = options.out
  ? path.resolve(options.out)
  : path.join(baseDir, '.nww-cms', 'content-mapping.md');

const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');

// Update state.json if present
const statePath = path.join(baseDir, '.nww-cms', 'state.json');
if (fs.existsSync(statePath)) {
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    state.mappedModels = Array.from(modelSet);
    state.unmappedContent = Array.from(unmappedSections);
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
  } catch {
    // continue
  }
}

console.log('================================================================================');
console.log('  NWW CMS MODEL MAPPING COMPLETED');
console.log('================================================================================');
console.log(`Mapped Models:     ${Array.from(modelSet).join(', ')}`);
console.log(`Unmapped Sections: ${Array.from(unmappedSections).join(', ') || 'None'}`);
console.log(`Mapping Table:     ${path.relative(baseDir, outPath).replace(/\\/g, '/')}`);
console.log('================================================================================');
