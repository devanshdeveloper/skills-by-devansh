#!/usr/bin/env node

/**
 * Standalone CMS Contact Us Inquiries Seeder (Insert)
 *
 * Reads JSON seed files from `project-docs/client-review/gate-5-cms-content/contact-us/`
 * and inserts them into the NWW CMS backend under `WebsiteContactUs`.
 *
 * Usage:
 *   node insert.js [--dir <path>] [--file <path>] [--dry-run]
 */

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.firstName || typeof item.firstName !== 'string') errors.push('firstName is required');
  if (!item.lastName || typeof item.lastName !== 'string') errors.push('lastName is required');
  if (!item.email || typeof item.email !== 'string') errors.push('email is required');
  if (!item.phone || typeof item.phone !== 'string') errors.push('phone is required');
  if (!item.message || typeof item.message !== 'string') errors.push('message is required');
  return errors;
}

runInsertCli({
  modelName: 'Contact Us Inquiry',
  resourceSlug: 'website-contact-us',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/contact-us',
  validateFn: validate,
  titleKey: 'email',
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

