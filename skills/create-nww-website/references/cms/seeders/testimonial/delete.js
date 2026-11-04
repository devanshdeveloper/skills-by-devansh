#!/usr/bin/env node

import { runDeleteCli } from '../lib/seeder-base.js';

runDeleteCli({
  modelName: 'Testimonial',
  resourceSlug: 'testimonial',
}).catch((err) => {
  process.stderr.write(`Delete failure: ${err.message}\n`);
  process.exit(1);
});

