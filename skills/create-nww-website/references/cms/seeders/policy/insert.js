#!/usr/bin/env node

import process from 'node:process';
import { runInsertCli } from '../lib/seeder-base.js';

const typeArgIndex = process.argv.indexOf('--type');
const policyType = typeArgIndex !== -1 ? process.argv[typeArgIndex + 1] : 'privacy';

const resourceMap = {
  privacy: 'website-privacy-policy',
  terms: 'website-terms-and-conditions',
  refund: 'website-refund-policy',
};

const resourceSlug = resourceMap[policyType] || 'website-privacy-policy';

function validate(item) {
  const errors = [];
  if (!item.content || typeof item.content !== 'string') errors.push('content is required');
  return errors;
}

runInsertCli({
  modelName: `Policy (${policyType})`,
  resourceSlug,
  defaultDir: `project-docs/client-review/gate-5-cms-content/policies/${policyType}`,
  validateFn: validate,
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

