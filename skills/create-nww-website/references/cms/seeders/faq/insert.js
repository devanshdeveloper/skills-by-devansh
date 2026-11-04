#!/usr/bin/env node

import { runInsertCli } from '../lib/seeder-base.js';

function validate(item) {
  const errors = [];
  if (!item.question && !item.title) errors.push('question or title is required');
  if (!item.answer && !item.content) errors.push('answer or content is required');
  return errors;
}

runInsertCli({
  modelName: 'FAQ',
  resourceSlug: 'faq',
  defaultDir: 'project-docs/client-review/gate-5-cms-content/faqs',
  validateFn: validate,
  titleKey: 'question',
}).catch((err) => {
  process.stderr.write(`Seeder failure: ${err.message}\n`);
  process.exit(1);
});

