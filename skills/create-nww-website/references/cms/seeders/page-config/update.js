#!/usr/bin/env node

/**
 * Standalone CMS Page Configuration Updater
 *
 * Updates an existing page configuration by MongoDB ObjectId.
 *
 * Usage:
 *   node update.js --id <doc-id> --file <path-to-json> [--dry-run]
 */

import { runUpdateCli } from '../lib/seeder-base.js';

runUpdateCli({
  modelName: 'Page Configuration',
  resourceSlug: 'website-page-config',
}).catch((err) => {
  process.stderr.write(`Update failure: ${err.message}\n`);
  process.exit(1);
});

