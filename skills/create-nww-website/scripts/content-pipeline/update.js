#!/usr/bin/env node

/**
 * CMS Content Update CLI
 *
 * Updates an existing document in the NWW CMS backend by MongoDB ObjectId (_id).
 *
 * Safety Invariants:
 * - Dry-run is the strict default.
 * - Live remote writes require explicit '--apply' flag.
 * - Target CMS environment and masked token printed before any action.
 *
 * Usage:
 *   node update.js --model <name> --id <mongoId> --file <path-to-json-or-mdx>
 *   node update.js --model <name> --id <mongoId> --file <path-to-json-or-mdx> --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { resolveEnvConfig, maskToken } from './lib/env.js';
import { getModel, listModels } from './models/registry.js';
import { readAndParseMDX } from './lib/mdx-parser.js';
import { markdownToHtml, extractFaqs } from './lib/html-renderer.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    model: null,
    id: null,
    file: null,
    apply: false,
    envFile: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--model' && i + 1 < argv.length) options.model = argv[++i];
    else if (arg.startsWith('--id=')) options.id = arg.split('=')[1];
    else if (arg === '--id' && i + 1 < argv.length) options.id = argv[++i];
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg.startsWith('--env-file=')) options.envFile = arg.split('=')[1];
    else if (arg === '--env-file' && i + 1 < argv.length) options.envFile = argv[++i];
  }

  return options;
}

/**
 * Resolves payload from a JSON or MDX file.
 *
 * @param {string} filePath
 * @param {object} modelModule
 * @returns {object}
 */
export function loadUpdatePayload(filePath, modelModule) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (filePath.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Parse MDX
  const { frontmatter, body } = readAndParseMDX(filePath);
  const htmlBody = markdownToHtml(body);
  const faqs = extractFaqs(body);
  return modelModule.toSeedPayload(frontmatter, htmlBody, faqs);
}

/**
 * Executes or previews an update on the remote NWW CMS.
 *
 * @param {object} params
 * @returns {Promise<{ id: string, status: string, message: string, data?: any }>}
 */
export async function updateItem({ serverUrl, cmsToken, resourceSlug, id, payload, apply = false }) {
  if (!apply) {
    return {
      id,
      status: 'DRY_RUN_VALIDATED',
      message: `Update preview for ${resourceSlug}/${id} verified with fields: ${Object.keys(payload).join(', ')} (Write suppressed: --apply not set)`,
    };
  }

  if (!cmsToken) {
    throw new Error('CMS_TOKEN environment variable is missing. Authenticated write required.');
  }

  const endpoint = `${serverUrl}/api/${resourceSlug}/update-one/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cmsToken}`,
    'x-site-key': cmsToken,
  };

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CMS API rejected update (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    id,
    status: 'UPDATED',
    message: `Successfully updated ${resourceSlug}/${id} (HTTP ${res.status})`,
    data,
  };
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.model || !opts.id || !opts.file) {
    process.stdout.write(`CMS Content Update CLI (skills-by-devansh)
Usage:
  node update.js --model <name> --id <mongoId> --file <path> [options]

Options:
  --model <name>      CMS model schema (e.g. blog, project, service, tool)
  --id <id>           Target document MongoDB ObjectId (_id)
  --file <path>       Path to JSON or MDX file containing update fields
  --apply             Execute live remote update (Default: dry-run)
  --env-file <path>   Custom path to .env file containing CMS_TOKEN
  --json              Output structured JSON result
  -h, --help          Show this help message

Registered Models:
  ${listModels().join(', ')}

Safety Notice:
  Live updates require the explicit --apply flag. Defaults strictly to dry-run.
`);
    process.exit(opts.help ? 0 : 1);
  }

  const envConfig = resolveEnvConfig(process.cwd(), opts.envFile);
  const modelModule = getModel(opts.model);
  if (!modelModule) {
    process.stderr.write(`Unknown model: '${opts.model}'. Available: ${listModels().join(', ')}\n`);
    process.exit(1);
  }

  const resourceSlug = modelModule.resourceSlug;
  const targetFile = path.resolve(opts.file);

  if (!opts.json) {
    printHeader(`CMS DOCUMENT UPDATE (${opts.apply ? 'LIVE APPLY' : 'DRY-RUN PREVIEW'})`);
    process.stdout.write(`  Target Server: ${envConfig.serverUrl}\n`);
    process.stdout.write(`  Model Resource: /api/${resourceSlug}/update-one/${opts.id}\n`);
    process.stdout.write(`  Token Status:  ${envConfig.isConfigured ? maskToken(envConfig.cmsToken) : '[MISSING / UNSET]'}\n`);
    process.stdout.write(`  Payload File:  ${path.relative(process.cwd(), targetFile)}\n`);
    process.stdout.write(`  Operation:     ${opts.apply ? 'LIVE DATABASE UPDATE' : 'DRY-RUN (Simulated; zero network writes)'}\n\n`);
  }

  try {
    const payload = loadUpdatePayload(targetFile, modelModule);
    const result = await updateItem({
      serverUrl: envConfig.serverUrl,
      cmsToken: envConfig.cmsToken,
      resourceSlug,
      id: opts.id,
      payload,
      apply: opts.apply,
    });

    if (!opts.json) {
      process.stdout.write(`  ✓ [${result.status}] ${result.message}\n`);
    }

    finishCli(true, { passed: true, mode: opts.apply ? 'live' : 'dry-run', result }, opts.json);
  } catch (err) {
    if (!opts.json) {
      process.stderr.write(`  ✗ [FAILED] Update error: ${err.message}\n`);
    }
    finishCli(false, { passed: false, error: err.message }, opts.json);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

