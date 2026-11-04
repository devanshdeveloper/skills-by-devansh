#!/usr/bin/env node

/**
 * Standalone CMS Contact Us Inquiry Deletion Utility
 *
 * Deletes an inquiry by MongoDB ObjectId.
 *
 * Usage:
 *   node delete.js --id <doc-id> [--dry-run]
 */

import { runDeleteCli } from '../lib/seeder-base.js';

runDeleteCli({
  modelName: 'Contact Us Inquiry',
  resourceSlug: 'website-contact-us',
}).catch((err) => {
  process.stderr.write(`Deletion failure: ${err.message}\n`);
  process.exit(1);
});

