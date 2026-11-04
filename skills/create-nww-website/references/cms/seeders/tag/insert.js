#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.name || typeof item.name !== 'string') errors.push('name is required');
  return errors;
}

runInsertCli({
  modelName: 'Website Tag',
  resourceSlug: 'website-tag',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/tags',
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

