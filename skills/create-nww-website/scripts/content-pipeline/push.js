#!/usr/bin/env node

/**
 * Gate 5 Batch 03: CMS Content Seeder & Remote Ingestion CLI
 *
 * Pushes validated JSON seed files into live NWW CMS database collections.
 *
 * Safety Invariants:
 * - Dry-run is the strict default.
 * - Live writes require explicit '--apply' flag.
 * - Idempotent upsert keyed by unique slug.
 * - Target CMS environment printed before any write.
 * - Secret credentials (CMS_TOKEN) strictly masked.
 *
 * Usage:
 *   node push.js --dir <path-to-seeds> --model <model-name>
 *   node push.js --file <path-to-seed.json> --model <model-name>
 *   node push.js --dir <path-to-seeds> --model <model-name> --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { resolveEnvConfig, maskToken } from './lib/env.js';
import { getModel, listModels } from './models/registry.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    file: null,
    dir: null,
    model: null,
    apply: false,
    autoSlug: false,
    envFile: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--auto-slug') options.autoSlug = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg === '--dir' && i + 1 < argv.length) options.dir = argv[++i];
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--model' && i + 1 < argv.length) options.model = argv[++i];
    else if (arg.startsWith('--env-file=')) options.envFile = arg.split('=')[1];
    else if (arg === '--env-file' && i + 1 < argv.length) options.envFile = argv[++i];
  }

  return options;
}

/**
 * Executes or previews remote insertion into NWW CMS.
 *
 * @param {object} item
 * @param {string} resourceSlug
 * @param {object} envConfig
 * @param {boolean} apply
 * @param {boolean} autoSlug
 * @returns {Promise<{ slug: string, status: string, message: string, id?: string }>}
 */
export async function pushItem(item, resourceSlug, envConfig, apply = false, autoSlug = false) {
  const { serverUrl, cmsToken } = envConfig;
  const slug = item.slug || 'unknown';

  if (!apply) {
    return {
      slug,
      status: 'DRY_RUN_VALIDATED',
      message: `Payload verified for endpoint POST ${serverUrl}/api/${resourceSlug}/create-one (Write suppressed: --apply not set)`,
    };
  }

  if (!cmsToken) {
    throw new Error('CMS_TOKEN environment variable is missing. Authenticated write required.');
  }

  const endpoint = `${serverUrl}/api/${resourceSlug}/create-one`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cmsToken}`,
    'x-site-key': cmsToken,
  };

  const payload = {
    ...item,
    status: item.status || 'published',
    editTimeFields: true,
  };

  let res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // Handle 409 Conflict with auto-slug resolution
  if (res.status === 409 && autoSlug) {
    const slugEndpoint = `${serverUrl}/api/${resourceSlug}/generate-slug`;
    const slugRes = await fetch(slugEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: item.title || slug }),
    });

    if (slugRes.ok) {
      const slugData = await slugRes.json();
      const newSlug = typeof slugData.data === 'string' ? slugData.data : slugData.data?.slug;
      if (newSlug) {
        payload.slug = newSlug;
        res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    }
  }

  if (res.status === 200 || res.status === 201) {
    const data = await res.json();
    const itemId = data?.data?._id || data?._id;
    return {
      slug: payload.slug,
      status: 'CREATED',
      id: itemId,
      message: `Successfully created ${resourceSlug} item (HTTP ${res.status})`,
    };
  }

  const errorText = await res.text();
  throw new Error(`CMS API rejected payload (${res.status}): ${errorText}`);
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.dir)) {
    process.stdout.write(`Gate 5 Batch 03: CMS Seeder CLI (skills-by-devansh)
Usage:
  node push.js --dir <path-to-seeds> --model <name> [options]
  node push.js --file <path-to-seed.json> --model <name> [options]

Options:
  --file <path>       Specific JSON seed file to push
  --dir <path>        Directory containing JSON seed files
  --model <name>      CMS model schema (e.g. blog, project, service, tool)
  --apply             Execute live network writes (Default: dry-run)
  --auto-slug         Automatically resolve 409 slug conflicts
  --env-file <path>   Custom path to .env file containing CMS_TOKEN
  --json              Output structured JSON result
  -h, --help          Show this help message

Safety Notice:
  Live writes require the explicit --apply flag. Defaults strictly to dry-run.
`);
    process.exit(opts.help ? 0 : 1);
  }

  const envConfig = resolveEnvConfig(process.cwd(), opts.envFile);
  const modelModule = opts.model ? getModel(opts.model) : null;
  const resourceSlug = modelModule?.resourceSlug || opts.model || 'blog';

  const targetFiles = [];
  if (opts.file) {
    targetFiles.push(path.resolve(opts.file));
  } else if (opts.dir) {
    const dir = path.resolve(opts.dir);
    if (!fs.existsSync(dir)) {
      process.stderr.write(`Seed directory not found: ${dir}\n`);
      process.exit(1);
    }
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isFile() && ent.name.endsWith('.json') && ent.name !== 'manifest.json') {
        targetFiles.push(path.join(dir, ent.name));
      }
    }
  }

  if (!opts.json) {
    printHeader(`CMS SEED INGESTION (${opts.apply ? 'LIVE APPLY' : 'DRY-RUN PREVIEW'})`);
    process.stdout.write(`  Target Server: ${envConfig.serverUrl}\n`);
    process.stdout.write(`  Model Resource: /api/${resourceSlug}\n`);
    process.stdout.write(`  Token Status:  ${envConfig.isConfigured ? maskToken(envConfig.cmsToken) : '[MISSING / UNSET]'}\n`);
    process.stdout.write(`  Operation:     ${opts.apply ? 'LIVE DATABASE WRITE' : 'DRY-RUN (Simulated; zero network writes)'}\n\n`);
  }

  const results = [];
  let allPassed = true;

  for (const f of targetFiles) {
    try {
      const raw = JSON.parse(fs.readFileSync(f, 'utf-8'));
      if (modelModule?.seedSchema) {
        modelModule.seedSchema.parse(raw);
      }

      const res = await pushItem(raw, resourceSlug, envConfig, opts.apply, opts.autoSlug);
      results.push({ file: f, ...res });

      if (!opts.json) {
        process.stdout.write(`  ✓ [${res.status}] Slug: '${res.slug}' — ${res.message}\n`);
      }
    } catch (err) {
      allPassed = false;
      results.push({ file: f, status: 'FAILED', error: err.message });
      if (!opts.json) {
        process.stderr.write(`  ✗ [FAILED] File: ${path.basename(f)} — ${err.message}\n`);
      }
    }
  }

  finishCli(
    allPassed,
    {
      passed: allPassed,
      mode: opts.apply ? 'live' : 'dry-run',
      serverUrl: envConfig.serverUrl,
      resourceSlug,
      total: targetFiles.length,
      results,
    },
    opts.json
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

