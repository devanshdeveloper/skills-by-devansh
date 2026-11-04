#!/usr/bin/env node

/**
 * Standalone CMS Page Configuration Deletion Utility
 *
 * Deletes a page configuration by MongoDB ObjectId.
 *
 * Usage:
 *   node delete.js --id <doc-id> [--dry-run]
 */

import { runDeleteCli } from '../lib/seeder-base.js';

runDeleteCli({
  modelName: 'Page Configuration',
  resourceSlug: 'website-page-config',
}).catch((err) => {
  process.stderr.write(`Deletion failure: ${err.message}\n`);
  process.exit(1);
});

