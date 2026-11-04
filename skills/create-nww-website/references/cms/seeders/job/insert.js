#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.title || typeof item.title !== 'string') errors.push('title is required');
  if (!item.slug || typeof item.slug !== 'string') errors.push('slug is required');
  return errors;
}

runInsertCli({
  modelName: 'Website Job (Career)',
  resourceSlug: 'website-job',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/jobs',
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

