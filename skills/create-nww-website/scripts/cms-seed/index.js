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

const { resolveEnvConfig } = require('./lib/env');
const { validateAndFormatSeedPayload } = require('./lib/schema');
const {
  generateBlogSlug,
  seedPostToCMS,
  seedAllPostsFromDirectory
} = require('./lib/api');

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
