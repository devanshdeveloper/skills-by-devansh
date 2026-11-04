#!/usr/bin/env node

/**
 * Standalone CMS Blog Post Seeder (Delete)
 *
 * Deletes a blog article from the NWW CMS backend.
 *
 * Usage:
 *   node delete.js --id <mongoId> [--dry-run]
 */

import process from 'node:process';

const SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL.replace(/\/+$/, '') : '';
const CMS_SITE_KEY = process.env.CMS_SITE_KEY || process.env.CMS_TOKEN;

function parseArgs(argv) {
  const options = {
    id: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--id' && i + 1 < argv.length) options.id = argv[++i];
  }
  return options;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.id) {
    process.stdout.write(`CMS Blog Seeder (Delete)
Usage: node delete.js --id <mongoId> [options]
Options:
  --id <id>          Target document MongoDB ObjectId (_id)
  --dry-run          Simulate delete without sending network request
  -h, --help         Display this help message
`);
    process.exit(opts.help ? 0 : 1);
  }

  if (opts.dryRun) {
    process.stdout.write(`[DRY-RUN] Would delete blog post with ID: ${opts.id}\n`);
    process.exit(0);
  }

  if (!SERVER_URL || !CMS_SITE_KEY) {
    process.stderr.write('Error: SERVER_URL and CMS_SITE_KEY must be set in environment.\n');
    process.exit(1);
  }

  const res = await fetch(`${SERVER_URL}/api/blog/delete-one/${opts.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${CMS_SITE_KEY}`,
      'x-site-key': CMS_SITE_KEY,
    },
  });

  if (!res.ok) {
    process.stderr.write(`[FAIL] Delete failed (${res.status}): ${await res.text()}\n`);
    process.exit(1);
  }

  const json = await res.json();
  process.stdout.write(`[SUCCESS] Deleted post ${opts.id}: ${json.message || 'ok'}\n`);
}

main().catch((err) => {
  process.stderr.write(`Unhandled Delete Error: ${err.message || err}\n`);
  process.exit(1);
});

