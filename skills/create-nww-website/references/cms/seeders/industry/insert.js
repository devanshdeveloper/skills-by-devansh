#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.name || typeof item.name !== 'string') errors.push('name is required');
  if (!item.slug || typeof item.slug !== 'string') errors.push('slug is required');
  return errors;
}

runInsertCli({
  modelName: 'Industry',
  resourceSlug: 'website-industry',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/industries',
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

