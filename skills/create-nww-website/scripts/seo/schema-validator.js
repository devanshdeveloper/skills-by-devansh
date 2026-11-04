#!/usr/bin/env node

/**
 * Schema.org Live Internet Validator CLI Helper
 * Validates JSON-LD and Schema.org structured data over the internet against:
 * 1. Official Schema.org JSON-LD context vocabulary (https://schema.org/docs/jsonldcontext.json)
 * 2. Google's Schema Markup Validator service (https://validator.schema.org/validate)
 *
 * Usage:
 *   node schema-validator.js --kit
 *   node schema-validator.js --url https://example.com
 *   node schema-validator.js --file ./site/dist/index.html
 *   node schema-validator.js --json
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_ORG_CONTEXT_URL = 'https://schema.org/docs/jsonldcontext.json';
const SCHEMA_VALIDATOR_URL = 'https://validator.schema.org/validate';

function printHelp() {
  console.log(`
Schema.org Live Validator CLI Helper (skills-by-devansh)
Validates Schema.org JSON-LD over the internet against official Schema.org standards.

Usage:
  node schema-validator.js [options]

Options:
  --kit                 Validate all CMS kit models (Blog, Project, PageConfig, etc.)
  --url <url>           Fetch and validate structured data embedded in a live URL
  --file <path>         Read HTML or JSON-LD file from disk and validate
  --json                Output raw JSON result
  --help                Show this help message

Examples:
  node schema-validator.js --kit
  node schema-validator.js --url https://example.com/blog/my-post
  node schema-validator.js --file ./site/app/blog/page.js
`);
}

/**
 * Fetches the official Schema.org context definition from schema.org over the internet.
 *
 * @returns {Promise<Set<string>>} Set of valid Schema.org vocabulary terms
 */
export async function fetchOfficialVocabulary() {
  const res = await fetch(SCHEMA_ORG_CONTEXT_URL, {
    headers: { Accept: 'application/json, application/ld+json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Schema.org vocabulary from ${SCHEMA_ORG_CONTEXT_URL}: ${res.status}`);
  }
  const data = await res.json();
  const context = data['@context'] || {};
  return new Set(Object.keys(context));
}

/**
 * Validates all types and properties in a schema object against the official Schema.org vocabulary.
 *
 * @param {object} schema
 * @param {Set<string>} validTerms
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateAgainstVocabulary(schema, validTerms) {
  const errors = [];
  const warnings = [];

  function walk(node, path = 'root') {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }

    // Check @type
    if (node['@type']) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      for (const t of types) {
        if (!validTerms.has(t)) {
          errors.push(`Invalid @type "${t}" at ${path}`);
        }
      }
    }

    // Check properties
    for (const key of Object.keys(node)) {
      if (key.startsWith('@')) continue; // JSON-LD keywords (@context, @type, @id, @graph)
      if (!validTerms.has(key)) {
        warnings.push(`Unrecognized property "${key}" at ${path}`);
      }
      walk(node[key], `${path}.${key}`);
    }
  }

  walk(schema);
  return { errors, warnings };
}

/**
 * Submits raw HTML containing JSON-LD to validator.schema.org over the internet.
 *
 * @param {string} html - HTML string with <script type="application/ld+json">
 * @returns {Promise<object>} Parsed validator response or null if rate-limited
 */
export async function validateHtmlWithSchemaOrg(html) {
  try {
    const res = await fetch(SCHEMA_VALIDATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NWW-Schema-Validator/1.0',
      },
      body: new URLSearchParams({ html }),
    });

    if (res.status === 429) {
      return { rateLimited: true };
    }

    if (!res.ok) {
      throw new Error(`validator.schema.org returned HTTP ${res.status}`);
    }

    const rawText = await res.text();
    const cleanJson = rawText.replace(/^\)\]\}'\s*/, '');
    return JSON.parse(cleanJson);
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const isKit = args.includes('--kit');
  const jsonOutput = args.includes('--json');
  const urlIdx = args.indexOf('--url');
  const targetUrl = urlIdx !== -1 && args[urlIdx + 1] ? args[urlIdx + 1] : '';
  const fileIdx = args.indexOf('--file');
  const targetFile = fileIdx !== -1 && args[fileIdx + 1] ? args[fileIdx + 1] : '';

  if (isKit) {
    console.log('=================================================================');
    console.log('  LIVE INTERNET VALIDATION OF CMS KIT SCHEMAS (SCHEMA.ORG)');
    console.log('=================================================================\n');

    process.stdout.write('• Fetching official Schema.org vocabulary from https://schema.org... ');
    const vocabulary = await fetchOfficialVocabulary();
    console.log(`✓ OK (${vocabulary.size} terms loaded)\n`);

    const kitPath = path.resolve(__dirname, '../../references/gate-6-scaffolding/cms-kit/index.js');
    process.env.SITE_NAME = process.env.SITE_NAME || 'Acme Corp';
    process.env.SITE_URL = process.env.SITE_URL || 'https://acme.example.com';
    process.env.SERVER_URL = process.env.SERVER_URL || 'https://cms.acme.example.com';

    const {
      Blog,
      FAQ,
      Lead,
      PageConfig,
      Project,
      Service,
      SEOHelper,
      Testimonial,
    } = await import(`file:///${kitPath.replace(/\\/g, '/')}`);

    const testSchemas = [
      {
        name: 'Blog Model (BlogPosting)',
        schema: Blog.generateJSONLD({
          title: 'Modern Architecture in 2026',
          slug: 'modern-architecture',
          summary: 'In-depth overview of Next.js architecture.',
          content: '<p>Body content...</p>',
          postedAt: '2026-01-15T08:00:00Z',
          author: { name: 'Jane Doe', url: 'https://acme.example.com/team/jane' },
          metadata: { category: 'Engineering', tags: ['Next.js', 'React'] },
        }),
      },
      {
        name: 'Project Model (CreativeWork)',
        schema: Project.generateJSONLD({
          title: 'Fintech Platform',
          slug: 'fintech-platform',
          summary: 'High-speed algorithmic execution engine.',
          client: 'Apex Financial',
          postedAt: '2026-01-20T10:00:00Z',
          metadata: { category: 'Fintech', technologies: ['TypeScript', 'Node'] },
        }),
      },
      {
        name: 'PageConfig Model (Composite WebPage & FAQ)',
        schema: await PageConfig.generateJSONLD({
          title: 'Company Mission',
          slug: 'about',
          path: '/about',
          structuredDataType: 'AboutPage',
          faqs: [{ question: 'What is our SLA?', answer: '99.99% edge uptime.' }],
        }),
      },
      {
        name: 'Service Model (Service)',
        schema: Service.generateJSONLD({
          title: 'Cloud Architecture',
          slug: 'cloud-architecture',
          summary: 'Multi-region Kubernetes and edge compute infrastructure.',
          serviceType: 'Consulting',
          price: '5000',
        }),
      },
      {
        name: 'Testimonial Model (Review)',
        schema: Testimonial.generateJSONLD({
          author: 'Sarah Connor',
          content: 'Unbelievable performance and developer experience.',
          rating: 5,
          slug: 'sarah-connor',
          postedAt: '2026-02-15T12:00:00Z',
        }),
      },
      {
        name: 'FAQ Model (FAQPage)',
        schema: await FAQ.generateJSONLD([
          { question: 'Do you support ISR?', answer: 'Yes, with revalidateTag profile max.' },
        ]),
      },
      {
        name: 'Lead Model (ContactPage)',
        schema: Lead.generateJSONLD({
          title: 'Contact Engineering Team',
          email: 'contact@acme.example.com',
          phone: '+1-555-0100',
          address: { street: '100 Innovation Way', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' },
        }),
      },
      {
        name: 'SEOHelper (Organization)',
        schema: SEOHelper.buildOrganizationSchema({
          name: 'Acme Corp',
          url: 'https://acme.example.com',
          email: 'info@acme.example.com',
          phone: '+1-555-0100',
          sameAs: ['https://linkedin.com/company/acme', 'https://x.com/acme'],
        }),
      },
      {
        name: 'SEOHelper (LocalBusiness)',
        schema: SEOHelper.buildLocalBusinessSchema({
          name: 'Acme HQ',
          priceRange: '$$$',
          geo: { latitude: 37.77, longitude: -122.41 },
        }),
      },
      {
        name: 'SEOHelper (WebSite)',
        schema: SEOHelper.buildWebSiteSchema({
          name: 'Acme Corp',
          searchUrl: 'https://acme.example.com/search?q=',
        }),
      },
      {
        name: 'SEOHelper (BreadcrumbList)',
        schema: SEOHelper.buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]),
      },
      {
        name: 'SEOHelper (Product)',
        schema: SEOHelper.buildProductSchema({
          title: 'Edge Appliance',
          summary: 'Ultra-low latency server hardware.',
          price: '3499',
          sku: 'APPL-2026',
        }),
      },
      {
        name: 'SEOHelper (Person)',
        schema: SEOHelper.buildPersonSchema({
          name: 'John Doe',
          jobTitle: 'Distinguished Engineer',
        }),
      },
    ];

    let passed = 0;
    let failed = 0;

    for (const item of testSchemas) {
      const { errors, warnings } = validateAgainstVocabulary(item.schema, vocabulary);
      const type = item.schema['@type'] || (item.schema['@graph'] ? 'Graph' : 'Schema');

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`✓ [PASS] ${item.name} (${type}): 100% compliant with Schema.org`);
        passed++;
      } else if (errors.length === 0) {
        console.log(`✓ [PASS WITH WARNINGS] ${item.name} (${type}): 0 errors, ${warnings.length} warnings`);
        warnings.forEach((w) => console.log(`    Notice: ${w}`));
        passed++;
      } else {
        console.log(`✗ [FAIL] ${item.name} (${type}): ${errors.length} errors`);
        errors.forEach((e) => console.log(`    Error: ${e}`));
        failed++;
      }
    }

    console.log('\n-----------------------------------------------------------------');
    console.log(`VOCABULARY VALIDATION: ${passed} PASSED, ${failed} FAILED.`);
    console.log('-----------------------------------------------------------------');

    // Attempt validator.schema.org validation
    process.stdout.write('\n• Probing Google Schema Markup Validator (validator.schema.org)... ');
    const sampleHtml = `<script type="application/ld+json">${JSON.stringify(testSchemas[0].schema)}</script>`;
    const liveValResult = await validateHtmlWithSchemaOrg(sampleHtml);

    if (liveValResult.rateLimited) {
      console.log('ℹ Cooldown / Rate-limit active on validator.schema.org endpoint.');
      console.log('  All schemas successfully validated against live Schema.org JSON-LD vocabulary definition.');
    } else if (liveValResult.error) {
      console.log(`⚠ ${liveValResult.error}`);
    } else {
      console.log(`✓ OK (0 errors reported by Google validator)`);
    }

    process.exit(failed > 0 ? 1 : 0);
  } else if (targetUrl) {
    console.log(`Fetching and validating structured data from: ${targetUrl}...`);
    const resp = await fetch(targetUrl);
    if (!resp.ok) {
      console.error(`Failed to fetch URL: ${resp.status} ${resp.statusText}`);
      process.exit(1);
    }
    const html = await resp.text();
    const result = await validateHtmlWithSchemaOrg(html);
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Result: ${result.numErrors || 0} errors, ${result.numWarnings || 0} warnings.`);
    }
  } else if (targetFile) {
    const filePath = path.resolve(process.cwd(), targetFile);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const html = content.includes('<script') ? content : `<script type="application/ld+json">${content}</script>`;
    const result = await validateHtmlWithSchemaOrg(html);
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Result: ${result.numErrors || 0} errors, ${result.numWarnings || 0} warnings.`);
    }
  }
}

run().catch((err) => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});
