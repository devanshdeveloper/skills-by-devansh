#!/usr/bin/env node

/**
 * Standalone CMS Contact Us Inquiry Updater
 *
 * Updates an existing inquiry by MongoDB ObjectId.
 *
 * Usage:
 *   node update.js --id <doc-id> --file <path-to-json> [--dry-run]
 */

import { runUpdateCli } from '../lib/seeder-base.js';

runUpdateCli({
  modelName: 'Contact Us Inquiry',
  resourceSlug: 'website-contact-us',
}).catch((err) => {
  process.stderr.write(`Update failure: ${err.message}\n`);
  process.exit(1);
});

