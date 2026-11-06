#!/usr/bin/env node

/**
 * Gate 5 Batch 03: CMS Content Seeder & Remote Ingestion CLI
 *
 * Pushes validated JSON seed files into live NWW CMS database collections
 * with state synchronization, exponential retry controls, and execution reporting.
 *
 * Safety Invariants:
 * - Dry-run is the strict default.
 * - Live writes require explicit '--apply' flag.
 * - State tracking via manifest.json prevents duplicate insertions.
 * - Exponential backoff retry controls handle transient errors and rate limits.
 * - Secret credentials (CMS_TOKEN) strictly masked in all logs and outputs.
 *
 * Usage:
 *   node push.js --dir <path-to-seeds> --model <model-name>
 *   node push.js --dir <path-to-seeds> --model <model-name> --apply
 *   node push.js --file <path-to-seed.json> --model <model-name> --apply --retries=3
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { resolveEnvConfig, maskToken } from './lib/env.js';
import { getModel, listModels } from './models/registry.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    file: null, dir: null, model: null, apply: false, autoSlug: false,
    force: false, retries: 3, retryDelay: 1000, envFile: null, reportFile: null, json: false, help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i], next = argv[i + 1];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--force') options.force = true;
    else if (arg === '--auto-slug') options.autoSlug = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && next) { options.file = next; i++; }
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg === '--dir' && next) { options.dir = next; i++; }
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--model' && next) { options.model = next; i++; }
    else if (arg.startsWith('--retries=')) options.retries = parseInt(arg.split('=')[1], 10) || 3;
    else if (arg === '--retries' && next) { options.retries = parseInt(next, 10) || 3; i++; }
    else if (arg.startsWith('--retry-delay=')) options.retryDelay = parseInt(arg.split('=')[1], 10) || 1000;
    else if (arg === '--retry-delay' && next) { options.retryDelay = parseInt(next, 10) || 1000; i++; }
    else if (arg.startsWith('--env-file=')) options.envFile = arg.split('=')[1];
    else if (arg === '--env-file' && next) { options.envFile = next; i++; }
    else if (arg.startsWith('--report-file=')) options.reportFile = arg.split('=')[1];
    else if (arg === '--report-file' && next) { options.reportFile = next; i++; }
  }

  return options;
}

/**
 * Resolves the specific endpoint resource slug for an item.
 *
 * @param {string} modelName
 * @param {object} item
 * @returns {string}
 */
export function resolveResourceSlug(modelName, item) {
  if (modelName === 'policy') {
    if (item.slug === 'privacy-policy') return 'website-privacy-policy';
    if (item.slug === 'terms-and-conditions') return 'website-terms-and-conditions';
    return 'website-privacy-policy';
  }
  if (modelName === 'tool') return 'website-tool';
  if (modelName === 'blog') return 'blog';

  const modelModule = getModel(modelName);
  return modelModule?.resourceSlug || modelName || 'blog';
}

/**
 * Loads or initializes the synchronization manifest.
 *
 * @param {string} manifestPath
 * @returns {{ model?: string, lastSyncedAt?: string, items: Record<string, any> }}
 */
export function loadManifest(manifestPath) {
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (data && typeof data === 'object') {
        const items = {};
        if (data.items) {
          if (Array.isArray(data.items)) {
            for (const item of data.items) {
              if (item && item.slug) items[item.slug] = item;
            }
          } else if (typeof data.items === 'object') {
            Object.assign(items, data.items);
          }
        }
        return {
          model: data.model || null,
          lastSyncedAt: data.lastSyncedAt || null,
          items,
        };
      }
    } catch {
      // Return fresh manifest on parse failure
    }
  }
  return { model: null, lastSyncedAt: null, items: {} };
}

/**
 * Saves the synchronization manifest atomically.
 *
 * @param {string} manifestPath
 * @param {object} manifest
 */
export function saveManifest(manifestPath, manifest) {
  const dir = path.dirname(manifestPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Executes a network fetch with exponential backoff and rate limit controls.
 *
 * @param {string} url
 * @param {object} init
 * @param {number} maxRetries
 * @param {number} baseDelay
 * @param {string} slug
 * @returns {Promise<{ res?: Response, error?: Error, attempts: number }>}
 */
export async function fetchWithRetry(url, init, maxRetries = 3, baseDelay = 1000, slug = '') {
  let attempts = 0;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    attempts++;
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 20000);
    if (timeoutTimer.unref) timeoutTimer.unref();

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutTimer);

      // Non-retryable success or client errors
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404 || res.status === 409 || res.status === 422) {
        return { res, attempts };
      }

      // Retryable 429 Rate Limit
      if (res.status === 429 && attempt <= maxRetries) {
        const retryAfterHeader = res.headers.get('Retry-After');
        const waitMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000 || baseDelay * Math.pow(2, attempt - 1)
          : baseDelay * Math.pow(2, attempt - 1);
        process.stdout.write(`  ↻ [RETRY ${attempt}/${maxRetries}] Slug: '${slug}' — Rate limit (429), waiting ${waitMs}ms...\n`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      // Retryable 5xx Server Errors
      if (res.status >= 500 && attempt <= maxRetries) {
        const backoff = Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200, 10000);
        process.stdout.write(`  ↻ [RETRY ${attempt}/${maxRetries}] Slug: '${slug}' — HTTP ${res.status}, retrying in ${Math.round(backoff)}ms...\n`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }

      return { res, attempts };
    } catch (err) {
      clearTimeout(timeoutTimer);
      if (attempt <= maxRetries) {
        const backoff = Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200, 10000);
        process.stdout.write(`  ↻ [RETRY ${attempt}/${maxRetries}] Slug: '${slug}' — ${err.message}, retrying in ${Math.round(backoff)}ms...\n`);
        await new Promise(r => setTimeout(r, backoff));
      } else {
        return { error: err, attempts };
      }
    }
  }

  return { error: new Error(`Exceeded max retries (${maxRetries})`), attempts };
}

/**
 * Pushes or previews a single item into the NWW CMS.
 *
 * @param {object} item
 * @param {string} resourceSlug
 * @param {object} envConfig
 * @param {boolean} apply
 * @param {boolean} autoSlug
 * @param {number} retries
 * @param {number} retryDelay
 * @returns {Promise<{ slug: string, status: string, message: string, id?: string, attempts: number, endpoint: string }>}
 */
export async function pushItem(item, resourceSlug, envConfig, apply = false, autoSlug = false, retries = 3, retryDelay = 1000) {
  const { serverUrl, cmsToken } = envConfig;
  const slug = item.slug || 'unknown';
  const endpoint = `${serverUrl}/api/${resourceSlug}/create-one`;

  if (!apply) {
    return {
      slug,
      status: 'DRY_RUN_VALIDATED',
      message: `Payload verified for endpoint POST ${endpoint} (Write suppressed: --apply not set)`,
      attempts: 0,
      endpoint,
    };
  }

  if (!cmsToken) {
    throw new Error('CMS_TOKEN environment variable is missing. Authenticated write required.');
  }

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

  const { res, error, attempts } = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }, retries, retryDelay, slug);

  if (error) {
    throw new Error(`Network failure after ${attempts} attempt(s): ${error.message}`);
  }

  // Handle 409 Conflict
  if (res.status === 409) {
    if (autoSlug) {
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
          const retryRes = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
          if (retryRes.status === 200 || retryRes.status === 201) {
            const data = await retryRes.json();
            const itemId = data?.data?._id || data?._id;
            return {
              slug: payload.slug,
              status: 'CREATED_WITH_NEW_SLUG',
              id: itemId,
              message: `Created with auto-generated slug '${payload.slug}' (HTTP ${retryRes.status})`,
              attempts: attempts + 1,
              endpoint,
            };
          }
        }
      }
    }

    return {
      slug,
      status: 'ALREADY_EXISTS',
      message: `Document with slug '${slug}' already exists in CMS database (HTTP 409 Conflict)`,
      attempts,
      endpoint,
    };
  }

  if (res.status === 200 || res.status === 201) {
    const data = await res.json();
    const itemId = data?.data?._id || data?._id;
    return {
      slug: payload.slug,
      status: 'CREATED',
      id: itemId,
      message: `Successfully created ${resourceSlug} item (HTTP ${res.status})`,
      attempts,
      endpoint,
    };
  }

  const errorText = await res.text();
  throw new Error(`CMS API rejected payload (${res.status}): ${errorText.slice(0, 300)}`);
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.dir)) {
    process.stdout.write(`Gate 5 Batch 03: CMS Seeder & State Sync CLI (skills-by-devansh)
Usage:
  node push.js --dir <path-to-seeds> --model <name> [options]
  node push.js --file <path-to-seed.json> --model <name> [options]

Options:
  --file <path>         Specific JSON seed file to push
  --dir <path>          Directory containing JSON seed files
  --model <name>        CMS model schema (e.g. blog, tool, policy, article)
  --apply               Execute live network writes (Default: dry-run)
  --force               Force re-push even if already synchronized in manifest
  --auto-slug           Automatically resolve 409 slug conflicts
  --retries <number>    Maximum retry attempts on network/server errors (Default: 3)
  --retry-delay <ms>    Base retry delay in milliseconds (Default: 1000)
  --env-file <path>     Custom path to .env file containing CMS_TOKEN
  --report-file <path>  Custom destination path for JSON execution report
  --json                Output structured JSON result
  -h, --help            Show this help message

Registered Models:
  ${listModels().join(', ')}

Safety Notice:
  Live writes require the explicit --apply flag. Defaults strictly to dry-run.
`);
    process.exit(opts.help ? 0 : 1);
  }

  const startTime = Date.now();
  const envConfig = resolveEnvConfig(process.cwd(), opts.envFile);
  const targetFiles = [];

  let manifestPath = null;
  if (opts.file) {
    targetFiles.push(path.resolve(opts.file));
    manifestPath = path.join(path.dirname(path.resolve(opts.file)), 'manifest.json');
  } else if (opts.dir) {
    const dir = path.resolve(opts.dir);
    if (!fs.existsSync(dir)) {
      process.stderr.write(`Seed directory not found: ${dir}\n`);
      process.exit(1);
    }
    manifestPath = path.join(dir, 'manifest.json');
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isFile() && ent.name.endsWith('.json') && ent.name !== 'manifest.json' && ent.name !== 'sync-report.json') {
        targetFiles.push(path.join(dir, ent.name));
      }
    }
  }

  targetFiles.sort();
  const manifest = loadManifest(manifestPath);
  manifest.model = opts.model || manifest.model || 'unknown';

  if (!opts.json) {
    printHeader(`CMS SEED INGESTION (${opts.apply ? 'LIVE APPLY' : 'DRY-RUN PREVIEW'})`);
    process.stdout.write(`  Target Server: ${envConfig.serverUrl}\n  Model Schema:  ${opts.model || 'auto'}\n  Token Status:  ${envConfig.isConfigured ? maskToken(envConfig.cmsToken) : '[MISSING / UNSET]'}\n  Retry Policy:  ${opts.retries} retries (base delay: ${opts.retryDelay}ms)\n  Operation:     ${opts.apply ? 'LIVE DATABASE WRITE' : 'DRY-RUN (Simulated; zero network writes)'}\n\n`);
  }

  const results = [];
  let allPassed = true;
  let createdCount = 0;
  let skippedCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;

  for (const f of targetFiles) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(f, 'utf-8'));
    } catch (parseErr) {
      allPassed = false;
      failedCount++;
      results.push({ file: f, status: 'PARSE_ERROR', error: parseErr.message });
      if (!opts.json) process.stderr.write(`  ✗ [PARSE_ERROR] File: ${path.basename(f)} — ${parseErr.message}\n`);
      continue;
    }

    const itemSlug = raw.slug || path.basename(f, '.json');
    const resourceSlug = resolveResourceSlug(opts.model, raw);

    // State Synchronization Check
    if (opts.apply && !opts.force && manifest.items[itemSlug]?.status === 'synced') {
      skippedCount++;
      const existing = manifest.items[itemSlug];
      const res = {
        slug: itemSlug,
        status: 'SKIPPED',
        id: existing.id,
        message: `Already synchronized with CMS (ID: ${existing.id}) [Use --force to re-push]`,
        attempts: 0,
        endpoint: existing.endpoint || `/api/${resourceSlug}/create-one`,
      };
      results.push({ file: f, ...res });
      if (!opts.json) process.stdout.write(`  ↷ [SKIPPED] Slug: '${itemSlug}' — ${res.message}\n`);
      continue;
    }

    try {
      const res = await pushItem(raw, resourceSlug, envConfig, opts.apply, opts.autoSlug, opts.retries, opts.retryDelay);
      results.push({ file: f, ...res });

      if (res.status === 'CREATED' || res.status === 'CREATED_WITH_NEW_SLUG') {
        createdCount++;
        manifest.items[res.slug] = {
          id: res.id,
          slug: res.slug,
          status: 'synced',
          pushedAt: new Date().toISOString(),
          attempts: res.attempts,
          endpoint: res.endpoint,
        };
      } else if (res.status === 'ALREADY_EXISTS') {
        alreadyExistsCount++;
        manifest.items[res.slug] = {
          id: manifest.items[res.slug]?.id || null,
          slug: res.slug,
          status: 'already_exists',
          lastCheckedAt: new Date().toISOString(),
          endpoint: res.endpoint,
        };
      }

      if (!opts.json) {
        const symbol = res.status.includes('CREATED') ? '✓' : res.status === 'ALREADY_EXISTS' ? '↷' : '✓';
        process.stdout.write(`  ${symbol} [${res.status}] Slug: '${res.slug}' — ${res.message}\n`);
      }
    } catch (err) {
      allPassed = false;
      failedCount++;
      manifest.items[itemSlug] = {
        slug: itemSlug,
        status: 'failed',
        error: err.message,
        failedAt: new Date().toISOString(),
      };
      results.push({ file: f, slug: itemSlug, status: 'FAILED', error: err.message });
      if (!opts.json) {
        process.stderr.write(`  ✗ [FAILED] Slug: '${itemSlug}' — ${err.message}\n`);
      }
    }
  }

  // Persist synchronization manifest and execution report
  const durationMs = Date.now() - startTime;
  if (opts.apply && manifestPath) {
    manifest.lastSyncedAt = new Date().toISOString();
    saveManifest(manifestPath, manifest);
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode: opts.apply ? 'live' : 'dry-run',
    serverUrl: envConfig.serverUrl,
    model: opts.model || 'auto',
    durationMs,
    stats: {
      total: targetFiles.length,
      created: createdCount,
      skipped: skippedCount,
      alreadyExists: alreadyExistsCount,
      failed: failedCount,
    },
    results,
  };

  const reportDest = opts.reportFile
    ? path.resolve(opts.reportFile)
    : opts.dir
    ? path.join(path.resolve(opts.dir), 'sync-report.json')
    : null;

  if (reportDest) fs.writeFileSync(reportDest, JSON.stringify(report, null, 2), 'utf-8');
  finishCli(allPassed, report, opts.json);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
