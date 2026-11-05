#!/usr/bin/env node

/**
 * Standalone CMS Form Submitter (Contact Us / Lead)
 *
 * Submits test or initial form payload to the NWW CMS form endpoints.
 *
 * Usage:
 *   node submit.js --form-id <id> --file <payload.json> [--dry-run]
 */

import fs from 'node:fs';
import process from 'node:process';

const SERVER_URL = (process.env.SERVER_URL || 'https://prod-server.nextwebworks.com').replace(/\/+$/, '');

function parseArgs(argv) {
  const options = {
    formId: process.env.CMS_CONTACT_FORM_ID || null,
    file: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--form-id' && i + 1 < argv.length) options.formId = argv[++i];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
  }
  return options;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.formId || !opts.file) {
    process.stdout.write(`CMS Form Submitter
Usage: node submit.js --form-id <id> --file <path-to-json> [options]
Options:
  --form-id <id>     Target form identifier (defaults to env CMS_CONTACT_FORM_ID)
  --file <path>      Path to JSON file with form submission fields
  --dry-run          Validate payload without network submission
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
    process.stdout.write(`[DRY-RUN] Validated submission for Form ${opts.formId}:\n${JSON.stringify(payload, null, 2)}\n`);
    process.exit(0);
  }

  if (!SERVER_URL) {
    process.stderr.write('Error: SERVER_URL must be set in environment.\n');
    process.exit(1);
  }

  const res = await fetch(`${SERVER_URL}/api/form/${opts.formId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    process.stderr.write(`[FAIL] Submission failed (${res.status}): ${await res.text()}\n`);
    process.exit(1);
  }

  const json = await res.json();
  process.stdout.write(`[SUCCESS] Form submitted: ${json.message || 'ok'}\n`);
}

main().catch((err) => {
  process.stderr.write(`Unhandled Form Submit Error: ${err.message || err}\n`);
  process.exit(1);
});

