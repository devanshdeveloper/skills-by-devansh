#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.name && !item.author && !item.title) errors.push('author name or title is required');
  if (!item.content && !item.quote && !item.message) errors.push('testimonial content or quote is required');
  return errors;
}

runInsertCli({
  modelName: 'Testimonial',
  resourceSlug: 'testimonial',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/testimonials',
  validateFn: validate,
  titleKey: 'name',
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

