#!/usr/bin/env node

import { runUpdateCli } from '../lib/seeder-base.js';

runUpdateCli({
  modelName: 'Case Study',
  resourceSlug: 'website-case-study',
}).catch((err) => {
  process.stderr.write(`Update failure: ${err.message}\n`);
  process.exit(1);
});

