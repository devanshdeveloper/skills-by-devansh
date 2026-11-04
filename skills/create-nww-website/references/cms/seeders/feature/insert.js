#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.title && !item.name) errors.push('title or name is required');
  return errors;
}

runInsertCli({
  modelName: 'Feature',
  resourceSlug: 'feature',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/features',
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

