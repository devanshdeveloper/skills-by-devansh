#!/usr/bin/env node

/**
 * Standalone CMS Blog Post Seeder (Update)
 *
 * Updates an existing blog article in the NWW CMS backend.
 *
 * Usage:
 *   node update.js --id <mongoId> --file <payload.json>
 */

import fs from 'node:fs';
import process from 'node:process';

const SERVER_URL = (process.env.SERVER_URL || 'https://prod-server.nextwebworks.com').replace(/\/+$/, '');
const CMS_TOKEN = process.env.CMS_TOKEN;

function parseArgs(argv) {
  const options = {
    id: null,
    file: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--id' && i + 1 < argv.length) options.id = argv[++i];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
  }
  return options;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.id || !opts.file) {
    process.stdout.write(`CMS Blog Seeder (Update)
Usage: node update.js --id <mongoId> --file <path-to-json> [options]
Options:
  --id <id>          Target document MongoDB ObjectId (_id)
  --file <path>      Path to JSON file containing updated fields
  --dry-run          Validate file and preview update without sending request
  -h, --help         Display this help message
`);
    process.exit(opts.help ? 0 : 1);
  }

  if (!fs.existsSync(opts.file)) {
    process.stderr.write(`Error: File not found: ${opts.file}\n`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(opts.file, 'utf8'));

  if (opts.dryRun) {
    process.stdout.write(`[DRY-RUN] Would update post ${opts.id} with fields: ${Object.keys(payload).join(', ')}\n`);
    process.exit(0);
  }

  if (!SERVER_URL || !CMS_TOKEN) {
    process.stderr.write('Error: SERVER_URL and CMS_TOKEN must be set in environment.\n');
    process.exit(1);
  }

  const res = await fetch(`${SERVER_URL}/api/blog/update-one/${opts.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CMS_TOKEN}`,
      'x-site-key': CMS_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    process.stderr.write(`[FAIL] Update failed (${res.status}): ${await res.text()}\n`);
    process.exit(1);
  }

  const json = await res.json();
  process.stdout.write(`[SUCCESS] Updated post ${opts.id}: ${json.message || 'ok'}\n`);
}

main().catch((err) => {
  process.stderr.write(`Unhandled Update Error: ${err.message || err}\n`);
  process.exit(1);
});

