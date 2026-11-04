#!/usr/bin/env node

import { runUpdateCli } from '../lib/seeder-base.js';

runUpdateCli({
  modelName: 'Website Tool Category',
  resourceSlug: 'website-tool-category',
}).catch((err) => {
  process.stderr.write(`Update failure: ${err.message}\n`);
  process.exit(1);
});

