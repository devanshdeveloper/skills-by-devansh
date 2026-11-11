#!/usr/bin/env node

/**
 * Gate 5 Content Pipeline: Image & Media Upload CLI
 *
 * Uploads local images to the NWW CMS media asset storage via multipart/form-data.
 * Supports single files or entire asset directories with dry-run verification default.
 *
 * Usage:
 *   node upload.js --file path/to/image.webp
 *   node upload.js --file path/to/image.webp --apply
 *   node upload.js --dir path/to/assets --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { resolveEnvConfig, maskToken, verifyCmsToken } from './lib/env.js';
import { uploadImageToCms, isLocalImagePath } from './lib/image-uploader.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    file: null,
    dir: null,
    apply: false,
    envFile: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i], next = argv[i + 1];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && next) { options.file = next; i++; }
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg === '--dir' && next) { options.dir = next; i++; }
    else if (arg.startsWith('--env-file=')) options.envFile = arg.split('=')[1];
    else if (arg === '--env-file' && next) { options.envFile = next; i++; }
  }

  return options;
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.dir)) {
    process.stdout.write(`Gate 5: NWW CMS Image & Media Uploader (skills-by-devansh)
Usage:
  node upload.js --file <path-to-image> [options]
  node upload.js --dir <path-to-images> [options]

Options:
  --file <path>       Path to local image file to upload
  --dir <path>        Directory containing image files to upload
  --apply             Execute live network upload to CMS (Default: dry-run)
  --env-file <path>   Custom path to .env file containing CMS_TOKEN
  --json              Output structured JSON result
  -h, --help          Show this help message
`);
    process.exit(opts.help ? 0 : 1);
  }

  const envConfig = resolveEnvConfig(process.cwd(), opts.envFile);
  const tokenMeta = await verifyCmsToken(envConfig.serverUrl, envConfig.cmsToken);

  if (!opts.json) {
    printHeader(`CMS IMAGE UPLOADER (${opts.apply ? 'LIVE APPLY' : 'DRY-RUN PREVIEW'})`);
    process.stdout.write(`  Target Server:  ${envConfig.serverUrl}\n  Token Status:   ${envConfig.isConfigured ? maskToken(envConfig.cmsToken) : '[MISSING / UNSET]'}\n  Website Name:   "${tokenMeta.websiteName || '[UNRESOLVED]'}" (ID: ${tokenMeta.websiteId || 'none'})\n  Auth Check:     ${tokenMeta.status}\n  Operation:      ${opts.apply ? 'LIVE UPLOAD TO CMS MEDIA' : 'DRY-RUN (Simulated; zero network writes)'}\n\n`);
  }

  if (opts.apply && tokenMeta.status === 'UNAUTHORIZED') {
    process.stderr.write(`\n  ✗ [CMS_AUTH_FAILED] CMS_TOKEN is unauthorized for ${envConfig.serverUrl}. Please confirm token credentials before applying live uploads.\n\n`);
    process.exit(1);
  }

  const targetFiles = [];
  if (opts.file) {
    const target = path.resolve(opts.file);
    if (!fs.existsSync(target)) {
      process.stderr.write(`File not found: ${target}\n`);
      process.exit(1);
    }
    targetFiles.push(target);
  } else if (opts.dir) {
    const dir = path.resolve(opts.dir);
    if (!fs.existsSync(dir)) {
      process.stderr.write(`Directory not found: ${dir}\n`);
      process.exit(1);
    }
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isFile() && isLocalImagePath(ent.name)) {
        targetFiles.push(path.join(dir, ent.name));
      }
    }
  }

  if (targetFiles.length === 0) {
    process.stdout.write('No matching image files found to process.\n');
    process.exit(0);
  }

  const results = [];
  let allPassed = true;

  for (const f of targetFiles) {
    try {
      const res = await uploadImageToCms(f, envConfig, { apply: opts.apply });
      results.push(res);
      if (!opts.json) {
        const symbol = res.status === 'UPLOADED' || res.status === 'DRY_RUN_VALIDATED' ? '✓' : '✗';
        process.stdout.write(`  ${symbol} [${res.status}] ${path.basename(f)} -> ${res.url}\n`);
      }
    } catch (err) {
      allPassed = false;
      results.push({ file: f, status: 'FAILED', error: err.message });
      if (!opts.json) {
        process.stderr.write(`  ✗ [FAILED] ${path.basename(f)}: ${err.message}\n`);
      }
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode: opts.apply ? 'live' : 'dry-run',
    serverUrl: envConfig.serverUrl,
    websiteName: tokenMeta.websiteName,
    websiteId: tokenMeta.websiteId,
    total: targetFiles.length,
    results,
  };

  finishCli(allPassed, report, opts.json);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

