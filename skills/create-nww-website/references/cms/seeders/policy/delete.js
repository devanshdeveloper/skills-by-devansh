#!/usr/bin/env node

import process from 'node:process';
import { runDeleteCli } from '../lib/seeder-base.js';

const typeArgIndex = process.argv.indexOf('--type');
const policyType = typeArgIndex !== -1 ? process.argv[typeArgIndex + 1] : 'privacy';

const resourceMap = {
  privacy: 'website-privacy-policy',
  terms: 'website-terms-and-conditions',
  refund: 'website-refund-policy',
};

const resourceSlug = resourceMap[policyType] || 'website-privacy-policy';

runDeleteCli({
  modelName: `Policy (${policyType})`,
  resourceSlug,
}).catch((err) => {
  process.stderr.write(`Delete failure: ${err.message}\n`);
  process.exit(1);
});

