#!/usr/bin/env node

/**
 * NWW CMS Script-Driven Content Pipeline
 *
 * Unified CLI runner for CMS-controlled content authoring, validation,
 * compilation, and live database ingestion.
 *
 * Commands:
 *   content-pipeline validate   - Validate MDX files against model Zod schemas
 *   content-pipeline seo-check  - Audit SEO standards and Google Search rules
 *   content-pipeline to-seed    - Compile validated MDX into Mongoose seed JSON
 *   content-pipeline push       - Push validated seeds to NWW CMS collections
 *   content-pipeline update     - Update an existing document by ID in NWW CMS
 *   content-pipeline delete     - Delete an existing document by ID from NWW CMS
 *
 * Usage:
 *   node index.js <command> [options]
 */

import process from 'node:process';
import { main as runValidate } from './validate.js';
import { main as runSeoCheck } from './seo-check.js';
import { main as runToSeed } from './to-seed.js';
import { main as runPush } from './push.js';
import { main as runUpdate } from './update.js';
import { main as runDelete } from './delete.js';
import { listModels } from './models/registry.js';

function printHelp() {
  process.stdout.write(`NWW CMS Content Pipeline CLI (skills-by-devansh)

Usage:
  node index.js <command> [options]

Commands:
  validate     Validate authored MDX against model Zod schemas and asset invariants
  seo-check    Audit SEO standards, metadata, single H1, and Google guidelines
  to-seed      Compile validated MDX into Mongoose strict-mode JSON seeds (Gate 5 Batch 02)
  push         Push validated JSON seeds to live NWW CMS database (Gate 5 Batch 03)
  update       Update an existing document by MongoDB ObjectId in NWW CMS
  delete       Delete an existing document by MongoDB ObjectId from NWW CMS

Options:
  -h, --help   Show command-specific help

Available CMS Models:
  ${listModels().join(', ')}

Examples:
  node index.js validate --file client-context/blog/my-post/content.mdx --model blog
  node index.js seo-check --file client-context/blog/my-post/content.mdx
  node index.js to-seed --src client-context/blog --out project-docs/client-review/gate-5-cms-content/blog
  node index.js push --dir project-docs/client-review/gate-5-cms-content/blog --model blog
  node index.js update --model blog --id 65f8a123bc45de6789012345 --file update.json
  node index.js delete --model blog --id 65f8a123bc45de6789012345
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  // Shift subcommand argument so subcommand receives only its options
  process.argv.splice(2, 1);

  switch (command) {
    case 'validate':
      await runValidate();
      break;
    case 'seo-check':
      await runSeoCheck();
      break;
    case 'to-seed':
      await runToSeed();
      break;
    case 'push':
      await runPush();
      break;
    case 'update':
      await runUpdate();
      break;
    case 'delete':
      await runDelete();
      break;
    default:
      process.stderr.write(`Unknown command: '${command}'\n\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
