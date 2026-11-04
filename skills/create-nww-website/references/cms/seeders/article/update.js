#!/usr/bin/env node

import { runUpdateCli } from '../lib/seeder-base.js';

runUpdateCli({
  modelName: 'Article',
  resourceSlug: 'website-article',
}).catch((err) => {
  process.stderr.write(`Update failure: ${err.message}\n`);
  process.exit(1);
});

