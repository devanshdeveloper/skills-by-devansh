#!/usr/bin/env node

/**
 * Standalone CMS Page Configuration Seeder (Insert)
 *
 * Reads JSON seed files from `project-docs/client-review/gate-5-cms-content/page-configs/`
 * and inserts them into the NWW CMS backend under `WebsitePageConfig`.
 *
 * Usage:
 *   node insert.js [--dir <path>] [--file <path>] [--dry-run] [--auto-slug]
 */

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.title || typeof item.title !== 'string') {
    errors.push('title is required and must be a string');
  }
  if (!item.slug || typeof item.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
    errors.push('slug is required and must be lowercase kebab-case (e.g. "home", "about", "services")');
  }
  if (!item.path || typeof item.path !== 'string') {
    errors.push('path is required and must be a string (e.g. "/", "/about")');
  }
  return errors;
}

runInsertCli({
  modelName: 'Page Configuration',
  resourceSlug: 'website-page-config',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/page-configs',
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

