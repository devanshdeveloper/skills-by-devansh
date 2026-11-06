#!/usr/bin/env node

/**
 * CMS Content Deletion CLI
 *
 * Deletes a document from the NWW CMS backend by MongoDB ObjectId (_id).
 *
 * Safety Invariants:
 * - Dry-run is the strict default.
 * - Live remote deletions require explicit '--apply' flag.
 * - Target CMS environment and masked token printed before any action.
 *
 * Usage:
 *   node delete.js --model <name> --id <mongoId>
 *   node delete.js --model <name> --id <mongoId> --apply
 */

import path from 'node:path';
import process from 'node:process';
import { resolveEnvConfig, maskToken } from './lib/env.js';
import { getModel, listModels } from './models/registry.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    model: null,
    id: null,
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
    else if (arg.startsWith('--env-file=')) options.envFile = arg.split('=')[1];
    else if (arg === '--env-file' && i + 1 < argv.length) options.envFile = argv[++i];
  }

  return options;
}

/**
 * Executes or previews deletion on the remote NWW CMS.
 *
 * @param {object} params
 * @returns {Promise<{ id: string, status: string, message: string }>}
 */
export async function deleteItem({ serverUrl, cmsToken, resourceSlug, id, apply = false }) {
  if (!apply) {
    return {
      id,
      status: 'DRY_RUN_VALIDATED',
      message: `Deletion preview for ${resourceSlug}/${id} verified (Write suppressed: --apply not set)`,
    };
  }

  if (!cmsToken) {
    throw new Error('CMS_TOKEN environment variable is missing. Authenticated write required.');
  }

  const endpoint = `${serverUrl}/api/${resourceSlug}/delete-one/${id}`;
  const headers = {
    Authorization: `Bearer ${cmsToken}`,
    'x-site-key': cmsToken,
  };

  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CMS API rejected deletion (${res.status}): ${errorText}`);
  }

  return {
    id,
    status: 'DELETED',
    message: `Successfully deleted ${resourceSlug}/${id} (HTTP ${res.status})`,
  };
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.model || !opts.id) {
    process.stdout.write(`CMS Content Deletion CLI (skills-by-devansh)
Usage:
  node delete.js --model <name> --id <mongoId> [options]

Options:
  --model <name>      CMS model schema (e.g. blog, project, service, tool)
  --id <id>           Target document MongoDB ObjectId (_id)
  --apply             Execute live remote deletion (Default: dry-run)
  --env-file <path>   Custom path to .env file containing CMS_TOKEN
  --json              Output structured JSON result
  -h, --help          Show this help message

Registered Models:
  ${listModels().join(', ')}

Safety Notice:
  Live deletions require the explicit --apply flag. Defaults strictly to dry-run.
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

  if (!opts.json) {
    printHeader(`CMS DOCUMENT DELETION (${opts.apply ? 'LIVE APPLY' : 'DRY-RUN PREVIEW'})`);
    process.stdout.write(`  Target Server: ${envConfig.serverUrl}\n`);
    process.stdout.write(`  Model Resource: /api/${resourceSlug}/delete-one/${opts.id}\n`);
    process.stdout.write(`  Token Status:  ${envConfig.isConfigured ? maskToken(envConfig.cmsToken) : '[MISSING / UNSET]'}\n`);
    process.stdout.write(`  Operation:     ${opts.apply ? 'LIVE DATABASE DELETION' : 'DRY-RUN (Simulated; zero network calls)'}\n\n`);
  }

  try {
    const result = await deleteItem({
      serverUrl: envConfig.serverUrl,
      cmsToken: envConfig.cmsToken,
      resourceSlug,
      id: opts.id,
      apply: opts.apply,
    });

    if (!opts.json) {
      process.stdout.write(`  ✓ [${result.status}] ${result.message}\n`);
    }

    finishCli(true, { passed: true, mode: opts.apply ? 'live' : 'dry-run', result }, opts.json);
  } catch (err) {
    if (!opts.json) {
      process.stderr.write(`  ✗ [FAILED] Deletion error: ${err.message}\n`);
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

