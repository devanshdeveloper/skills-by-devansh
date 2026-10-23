#!/usr/bin/env node

/**
 * CMS Seeding Engine for Next Web Works (NWW) Website Generator
 *
 * Reads blog seed JSON files from project-docs/cms-seed/ and seeds them into the NWW CMS backend.
 * Uses the verified backend contract:
 *   - Create Route: POST /api/blog/create-one
 *   - Slug Generator Route: POST /api/blog/generate-slug
 *   - Auth: Bearer JWT token (CMS_SITE_KEY)
 *   - Schema: Mongoose Blog model (metadata.category, metadata.tags, author sugar object)
 *
 * Usage:
 *   node scripts/cms-seed/index.js [projectRoot] [options]
 *
 * Options:
 *   --dir=<path>         Path to directory containing seed JSON files (default: project-docs/cms-seed)
 *   --file=<path>        Seed a specific JSON file instead of the whole directory
 *   --auto-slug          Automatically resolve slug conflicts via POST /api/blog/generate-slug
 *   --status=<status>    Override publication status ('published', 'draft', 'pending')
 *   --env-file=<path>    Custom path to .env file containing SERVER_URL and CMS_SITE_KEY
 *   --dry-run            Validate payloads and preview without sending POST requests
 *   --help               Show this help message
 */

const fs = require('node:fs');
const path = require('node:path');

// Parse CLI flags and arguments
const args = process.argv.slice(2);
const positionalArgs = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.join('=') || true];
  })
);

if (flags.help) {
  console.log(`
NWW CMS Seeding Engine
Usage: node scripts/cms-seed/index.js [projectRoot] [options]

Options:
  --dir=<path>         Path to seed JSON directory (default: project-docs/cms-seed)
  --file=<path>        Seed a specific single JSON file
  --auto-slug          Automatically resolve slug collisions using /api/blog/generate-slug
  --status=<status>    Override post status (e.g. --status=published or --status=draft)
  --env-file=<path>    Custom path to .env file with SERVER_URL and CMS_SITE_KEY
  --dry-run            Validate seed files without executing network writes
  --help               Show this help message
`);
  process.exit(0);
}

const projectRoot = positionalArgs[0] ? path.resolve(positionalArgs[0]) : process.cwd();

/**
 * Loads environment variables from .env files if not already present in process.env
 */
function resolveEnvConfig(projRoot, customEnvPath) {
  let serverUrl = process.env.SERVER_URL;
  let siteKey = process.env.CMS_SITE_KEY;

  const candidatePaths = [
    customEnvPath ? path.resolve(customEnvPath) : null,
    path.join(projRoot, 'site', '.env.local'),
    path.join(projRoot, 'site', '.env'),
    path.join(projRoot, '.env.local'),
    path.join(projRoot, '.env')
  ].filter(Boolean);

  for (const envPath of candidatePaths) {
    if ((!serverUrl || !siteKey) && fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
          if (match) {
            const key = match[1];
            let val = match[2].trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (key === 'SERVER_URL' && !serverUrl) serverUrl = val;
            if (key === 'CMS_SITE_KEY' && !siteKey) siteKey = val;
          }
        }
      } catch (_) {}
    }
  }

  return {
    serverUrl: (serverUrl || 'https://api.nextwebworks.in').replace(/\/$/, ''),
    siteKey: siteKey || ''
  };
}

/**
 * Validates and normalizes seed post JSON into the exact NWW Mongoose Blog schema
 */
function validateAndFormatSeedPayload(raw, options = {}) {
  const errors = [];

  if (!raw.title || typeof raw.title !== 'string' || raw.title.trim().length < 2) {
    errors.push('Field "title" is required and must be at least 2 characters.');
  }

  if (!raw.content || typeof raw.content !== 'string' || raw.content.trim().length === 0) {
    errors.push('Field "content" is required and must contain HTML rich-text.');
  }

  // Normalized slug
  let slug = (raw.slug || '').trim().toLowerCase();
  if (!slug && raw.title) {
    slug = raw.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`Slug "${slug}" is invalid. Must be lowercase hyphenated alphanumeric (kebab-case).`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  // Excerpt fallback
  const fallbackExcerpt = raw.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 155) + '...';

  // Strict Mongoose placement: category and tags MUST reside in metadata Map
  const metadata = Object.assign({}, raw.metadata || {});
  if (raw.category && !metadata.category) {
    metadata.category = raw.category;
  }
  if (raw.tags && !metadata.tags) {
    metadata.tags = Array.isArray(raw.tags) ? raw.tags : [raw.tags];
  }

  const status = options.status || raw.status || 'published';
  const postedAt = raw.postedAt || new Date().toISOString();

  // Author sugar object handling
  let authorObj = undefined;
  if (raw.author && typeof raw.author === 'object') {
    authorObj = raw.author;
  } else if (raw.author_name || raw.author_image) {
    authorObj = {
      mode: 'manual',
      name: raw.author_name || 'Editorial Team',
      image: raw.author_image || null
    };
  }

  const payload = {
    title: raw.title.trim(),
    slug: slug,
    content: raw.content.trim(),
    status: status,
    cover_image: raw.cover_image || null,
    image: raw.image || raw.cover_image || null,
    order: typeof raw.order === 'number' ? raw.order : 0,
    metaTitle: (raw.metaTitle || raw.title).trim(),
    metaDescription: (raw.metaDescription || raw.excerpt || fallbackExcerpt).trim(),
    author_name: raw.author_name || (authorObj && authorObj.name) || 'Editorial Team',
    author_image: raw.author_image || (authorObj && authorObj.image) || null,
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    postedAt: postedAt,
    editTimeFields: true,
    metadata: metadata
  };

  if (raw.author_id) {
    payload.author_id = raw.author_id;
  }
  if (authorObj) {
    payload.author = authorObj;
  }

  return payload;
}

/**
 * Requests an auto-sanitized collision-free slug from the NWW CMS backend
 */
async function generateBlogSlug(title, serverUrl, siteKey) {
  const endpoint = `${serverUrl}/api/blog/generate-slug`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${siteKey}`,
      'x-site-key': siteKey
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    throw new Error(`generate-slug failed with HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data && data.success && data.data) {
    return typeof data.data === 'string' ? data.data : data.data.slug;
  }
  throw new Error(`Unexpected generate-slug response: ${JSON.stringify(data)}`);
}

/**
 * Seeds a single blog post to the NWW CMS backend
 */
async function seedPostToCMS(rawPost, options = {}) {
  const { serverUrl, siteKey, autoSlug, dryRun, status } = options;
  const payload = validateAndFormatSeedPayload(rawPost, { status });

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      action: 'PREVIEW_VALIDATED',
      slug: payload.slug,
      title: payload.title,
      payload
    };
  }

  if (!siteKey) {
    throw new Error('Missing CMS_SITE_KEY environment variable. Authenticated write required.');
  }

  const createEndpoint = `${serverUrl}/api/blog/create-one`;

  // Helper to make creation request
  async function executeCreate(postBody) {
    return await fetch(createEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${siteKey}`,
        'x-site-key': siteKey
      },
      body: JSON.stringify(postBody)
    });
  }

  let res = await executeCreate(payload);

  // Handle 409 Conflict (Duplicate Slug) with auto-slug resolution
  if (res.status === 409 && autoSlug) {
    console.warn(`  ! Slug collision for "${payload.slug}". Querying /api/blog/generate-slug...`);
    const newSlug = await generateBlogSlug(payload.title, serverUrl, siteKey);
    console.log(`  → Acquired collision-free slug: "${newSlug}"`);
    payload.slug = newSlug;
    res = await executeCreate(payload);
  }

  if (res.status === 201 || res.status === 200) {
    const json = await res.json();
    return {
      success: true,
      status: res.status,
      slug: payload.slug,
      title: payload.title,
      data: json.data || json
    };
  }

  const errText = await res.text();
  throw new Error(`HTTP ${res.status} ${res.statusText}: ${errText}`);
}

/**
 * Scans a directory and seeds all .json post files
 */
async function seedAllPostsFromDirectory(seedDir, options = {}) {
  if (!fs.existsSync(seedDir)) {
    throw new Error(`Seed directory does not exist: ${seedDir}`);
  }

  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log(`No .json files found in ${seedDir}.`);
    return [];
  }

  const results = [];
  for (const file of files) {
    const fullPath = path.join(seedDir, file);
    try {
      const rawContent = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      console.log(`Seeding [${file}]: "${parsed.title || 'Untitled'}"...`);
      const result = await seedPostToCMS(parsed, options);
      console.log(`  ✓ Seeded successfully: slug="${result.slug}" (HTTP ${result.status || 'DRY-RUN'})`);
      results.push({ file, success: true, result });
    } catch (err) {
      console.error(`  ✗ Failed to seed [${file}]: ${err.message}`);
      results.push({ file, success: false, error: err.message });
    }
  }

  return results;
}

/**
 * Main CLI execution entry point
 */
async function main() {
  const envConfig = resolveEnvConfig(projectRoot, flags['env-file']);
  const seedDir = flags.dir
    ? path.resolve(flags.dir)
    : path.join(projectRoot, 'project-docs', 'cms-seed');

  const isDryRun = Boolean(flags['dry-run']);
  const autoSlug = Boolean(flags['auto-slug']);
  const statusOverride = typeof flags.status === 'string' ? flags.status : undefined;

  console.log('=================================================================');
  console.log('  NWW CMS SEEDING ENGINE');
  console.log('=================================================================');
  console.log(`  Project Root: ${projectRoot}`);
  console.log(`  CMS Server:   ${envConfig.serverUrl}`);
  console.log(`  Auth State:   ${envConfig.siteKey ? 'CMS_SITE_KEY Loaded' : 'MISSING CMS_SITE_KEY'}`);
  console.log(`  Execution:    ${isDryRun ? 'DRY-RUN (No network writes)' : 'LIVE SEEDING'}`);
  if (autoSlug) console.log(`  Auto-Slug:    Enabled (/api/blog/generate-slug on 409 conflict)`);
  if (statusOverride) console.log(`  Status Force: ${statusOverride}`);
  console.log('-----------------------------------------------------------------');

  if (!isDryRun && !envConfig.siteKey) {
    console.error('\nERROR: CMS_SITE_KEY is missing. Please set CMS_SITE_KEY in your environment or site/.env.local, or use --dry-run.');
    process.exit(1);
  }

  const options = {
    serverUrl: envConfig.serverUrl,
    siteKey: envConfig.siteKey,
    autoSlug,
    dryRun: isDryRun,
    status: statusOverride
  };

  if (flags.file) {
    const singleFile = path.resolve(flags.file);
    console.log(`\nSeeding single file: ${singleFile}`);
    try {
      const parsed = JSON.parse(fs.readFileSync(singleFile, 'utf-8'));
      const res = await seedPostToCMS(parsed, options);
      console.log(`\n✓ Result: ${JSON.stringify(res, null, 2)}`);
    } catch (err) {
      console.error(`\n✗ Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  console.log(`\nScanning seed directory: ${path.relative(projectRoot, seedDir)}`);
  try {
    const results = await seedAllPostsFromDirectory(seedDir, options);
    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n=================================================================');
    console.log(`  SEED SUMMARY: ${succeeded} Succeeded | ${failed} Failed`);
    console.log('=================================================================');

    if (failed > 0 && !isDryRun) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\nFatal seeding error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedPostToCMS,
  generateBlogSlug,
  seedAllPostsFromDirectory,
  validateAndFormatSeedPayload,
  resolveEnvConfig
};
