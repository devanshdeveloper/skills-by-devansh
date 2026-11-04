#!/usr/bin/env node

import { runDeleteCli } from '../lib/seeder-base.js';

runDeleteCli({
  modelName: 'Gallery',
  resourceSlug: 'website-gallery',
}).catch((err) => {
  process.stderr.write(`Delete failure: ${err.message}\n`);
  process.exit(1);
});

