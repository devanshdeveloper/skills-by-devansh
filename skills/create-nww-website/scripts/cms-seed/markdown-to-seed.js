#!/usr/bin/env node

/**
 * Markdown-to-Seed Converter for NWW CMS
 *
 * Compiles SEO-approved markdown content (authored in Stage 4 under client-context/)
 * into Mongoose strict-mode compliant JSON seed files and optionally seeds them to live CMS.
 *
 * Eliminates LLM token burn and JSON escaping errors when dealing with large articles.
 *
 * Usage:
 *   node scripts/cms-seed/markdown-to-seed.js [projectRoot] [options]
 *
 * Options:
 *   --src=<path>         Path to markdown source file or directory (default: auto-detects client-context/blog or client-context/)
 *   --out=<path>         Output directory for compiled seed JSON (default: project-docs/client-review/gate-5-cms-content/blog)
 *   --model=<model>      Target CMS collection model (default: 'blog')
 *   --seed               Immediately push compiled payloads to CMS after generating JSON
 *   --dry-run            Preview conversion and validate schema without writing to disk or network
 *   --auto-slug          Automatically query /api/blog/generate-slug on slug collisions
 *   --status=<status>    Override publication status ('published', 'draft', 'pending')
 *   --env-file=<path>    Custom .env file with SERVER_URL and CMS_TOKEN
 *   --help               Show this help message
 */

const fs = require('node:fs');
const path = require('node:path');

const { resolveEnvConfig } = require('./lib/env');
const {
  convertMarkdownFileToSeedPayload,
  buildSeedsFromMarkdownDirectory
} = require('./lib/markdown');
const { seedPostToCMS } = require('./lib/api');

// Parse arguments
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
NWW CMS Markdown-to-Seed Compiler
Converts SEO markdown (content.md) directly into Mongoose strict-mode JSON seeds.

Usage:
  node scripts/cms-seed/markdown-to-seed.js [projectRoot] [options]

Options:
  --src=<path>         Source markdown file or directory (default: client-context/blog or client-context)
  --out=<path>         Output seed JSON directory (default: project-docs/client-review/gate-5-cms-content/blog)
  --model=<model>      Target CMS collection model (default: blog)
  --seed               Push compiled seeds directly to live NWW CMS backend
  --dry-run            Validate and preview converted payloads without writes
  --auto-slug          Resolve duplicate slugs automatically via /api/blog/generate-slug
  --status=<status>    Override post status (e.g. published or draft)
  --env-file=<path>    Path to .env file with SERVER_URL and CMS_TOKEN
  --help               Display this help message
`);
  process.exit(0);
}

const projectRoot = positionalArgs[0] ? path.resolve(positionalArgs[0]) : process.cwd();
const envConfig = resolveEnvConfig(projectRoot, flags['env-file']);
const isDryRun = Boolean(flags['dry-run']);
const shouldSeed = Boolean(flags.seed);
const autoSlug = Boolean(flags['auto-slug']);
const statusOverride = typeof flags.status === 'string' ? flags.status : undefined;
const targetModel = typeof flags.model === 'string' ? flags.model : 'blog';

// Resolve source directory or file
let sourcePath = flags.src
  ? path.resolve(flags.src)
  : path.join(projectRoot, 'client-context', targetModel);

if (!fs.existsSync(sourcePath) && !flags.src) {
  const generalContext = path.join(projectRoot, 'client-context');
  if (fs.existsSync(generalContext)) {
    sourcePath = generalContext;
  }
}

// Resolve output directory
const outputDir = flags.out
  ? path.resolve(flags.out)
  : path.join(projectRoot, 'project-docs', 'client-review', 'gate-5-cms-content', targetModel);

async function main() {
  console.log('=================================================================');
  console.log('  NWW CMS MARKDOWN-TO-SEED COMPILER');
  console.log('=================================================================');
  console.log(`  Project Root: ${projectRoot}`);
  console.log(`  Source Path:  ${sourcePath}`);
  console.log(`  Output Dir:   ${outputDir}`);
  console.log(`  Target Model: ${targetModel}`);
  console.log(`  Direct Seed:  ${shouldSeed ? 'ENABLED (Push to CMS)' : 'DISABLED (Generate JSON only)'}`);
  console.log(`  Execution:    ${isDryRun ? 'DRY-RUN (Preview only)' : 'COMPILING SEEDS'}`);
  console.log('-----------------------------------------------------------------');

  if (!fs.existsSync(sourcePath)) {
    console.error(`\nERROR: Source path not found: ${sourcePath}`);
    console.error('Please specify a valid path with --src=<path> or create client-context/<model>/');
    process.exit(1);
  }

  const stat = fs.statSync(sourcePath);
  let payloads = [];
  let files = [];

  if (stat.isFile()) {
    console.log(`\nCompiling single markdown file: ${path.relative(projectRoot, sourcePath)}`);
    const payload = convertMarkdownFileToSeedPayload(sourcePath, { status: statusOverride });
    payloads.push(payload);

    if (!isDryRun) {
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const outFile = path.join(outputDir, `${payload.slug}.json`);
      fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
      files.push(outFile);
      console.log(`  ✓ Written: ${path.relative(projectRoot, outFile)}`);
    }
  } else {
    console.log(`\nScanning markdown content in: ${path.relative(projectRoot, sourcePath)}`);
    if (isDryRun) {
      // In dry-run mode, simulate directory scan without file writes
      const dummyRes = buildSeedsFromMarkdownDirectory(sourcePath, outputDir, { status: statusOverride });
      payloads = dummyRes.payloads;
    } else {
      const res = buildSeedsFromMarkdownDirectory(sourcePath, outputDir, { status: statusOverride });
      payloads = res.payloads;
      files = res.files;
    }
  }

  if (payloads.length === 0) {
    console.log('\n[NOTICE] Zero markdown content files found to compile.');
    process.exit(0);
  }

  console.log(`\nSuccessfully compiled ${payloads.length} seed record(s):`);
  payloads.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.slug}] "${p.title}" (${p.content.length} chars HTML)`);
    if (p.metadata?.category) console.log(`     Category: ${p.metadata.category} | Tags: ${(p.metadata.tags || []).join(', ')}`);
    if (p.faqs && p.faqs.length > 0) console.log(`     FAQs: ${p.faqs.length} structured FAQ(s) extracted`);
  });

  if (isDryRun) {
    console.log('\n[DRY-RUN] Schema validation passed for all payloads. Zero files written.');
    return;
  }

  console.log(`\n✓ Seed JSON deliverables saved to: ${path.relative(projectRoot, outputDir)}/`);

  // Direct live seeding if requested
  if (shouldSeed) {
    if (!envConfig.cmsToken) {
      console.error('\nERROR: CMS_TOKEN is missing. Set CMS_TOKEN in your environment or site/.env.local before running with --seed.');
      process.exit(1);
    }

    console.log('\n-----------------------------------------------------------------');
    console.log(`  PUSHING SEEDS TO LIVE CMS (${envConfig.serverUrl})`);
    console.log('-----------------------------------------------------------------');

    const seedOptions = {
      serverUrl: envConfig.serverUrl,
      siteKey: envConfig.cmsToken,
      autoSlug,
      dryRun: false,
      status: statusOverride
    };

    let liveSuccess = 0;
    let liveFail = 0;

    for (const post of payloads) {
      console.log(`\n→ Seeding "${post.title}" [${post.slug}]...`);
      try {
        const res = await seedPostToCMS(post, seedOptions);
        if (res.conflict) {
          console.log(`  ℹ ${res.message} (Action: ${res.action})`);
        } else {
          console.log(`  ✓ Live Seed Succeeded: ID ${res.id || 'ok'}`);
        }
        liveSuccess++;
      } catch (err) {
        console.error(`  ✗ Live Seed Failed: ${err.message}`);
        liveFail++;
      }
    }

    console.log('\n=================================================================');
    console.log(`  CMS SEED COMPLETE: ${liveSuccess} Succeeded | ${liveFail} Failed`);
    console.log('=================================================================');

    if (liveFail > 0) {
      process.exit(1);
    }
  } else {
    console.log('\nNext step: To validate and seed to CMS, run:');
    console.log(`  node skills/create-nww-website/scripts/cms-seed/index.js --dir ${path.relative(projectRoot, outputDir)} --dry-run`);
    console.log(`  node skills/create-nww-website/scripts/cms-seed/index.js --dir ${path.relative(projectRoot, outputDir)}`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\nFatal compiler error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  main,
  convertMarkdownFileToSeedPayload,
  buildSeedsFromMarkdownDirectory
};
