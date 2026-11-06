#!/usr/bin/env node

/**
 * MDX Content Validator CLI
 *
 * Validates MDX files against model Zod schemas and content integrity rules:
 * - Frontmatter strictly matches schema (rejects unknown keys)
 * - Slug matches file/folder name
 * - Dates in ISO format
 * - Referenced local assets exist
 * - Exactly one H1 heading
 * - Image alt text present
 * - Internal relative links resolve
 *
 * Usage:
 *   node validate.js --file <path-to-mdx> --model <model-name>
 *   node validate.js --dir <path-to-mdx-dir> --model <model-name>
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readAndParseMDX } from './lib/mdx-parser.js';
import { getModel, listModels } from './models/registry.js';
import { printHeader, printIssue, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    file: null,
    dir: null,
    model: null,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg === '--dir' && i + 1 < argv.length) options.dir = argv[++i];
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--model' && i + 1 < argv.length) options.model = argv[++i];
  }

  return options;
}

export function validateSingleMdx(filePath, modelKey) {
  const modelModule = getModel(modelKey);
  if (!modelModule) {
    return {
      filePath,
      passed: false,
      issues: [{
        severity: 'ERROR',
        code: 'INVALID_MODEL',
        message: `Unknown model: '${modelKey}'. Available models: ${listModels().join(', ')}`,
      }],
    };
  }

  const issues = [];
  let parsed;
  try {
    parsed = readAndParseMDX(filePath);
  } catch (err) {
    return {
      filePath,
      passed: false,
      issues: [{ severity: 'ERROR', code: 'PARSE_FAILED', message: err.message }],
    };
  }

  const { frontmatter, headings, images, links, localAssets } = parsed;

  // 1. Zod strict schema validation
  const result = modelModule.frontmatterSchema.safeParse(frontmatter);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join('.') || 'root';
      issues.push({
        severity: 'ERROR',
        code: 'SCHEMA_VIOLATION',
        message: `Field '${fieldPath}': ${issue.message}`,
        source: 'frontmatter',
      });
    }
  }

  // 2. Slug equals filename or parent directory name
  const expectedSlug = frontmatter.slug;
  if (expectedSlug) {
    const fileBase = path.basename(filePath, path.extname(filePath));
    const parentDir = path.basename(path.dirname(filePath));
    const matchesSlug = fileBase === expectedSlug || (fileBase === 'content' && parentDir === expectedSlug);
    if (!matchesSlug) {
      issues.push({
        severity: 'ERROR',
        code: 'SLUG_MISMATCH',
        message: `Slug '${expectedSlug}' does not match file base '${fileBase}' or parent directory '${parentDir}'`,
        source: 'filename',
      });
    }
  } else {
    issues.push({
      severity: 'ERROR',
      code: 'MISSING_SLUG',
      message: 'Frontmatter must declare a unique kebab-case slug',
      source: 'frontmatter',
    });
  }

  // 3. Exactly one H1 heading in body
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'MISSING_H1',
      message: 'MDX body must contain exactly one H1 heading (# Headline)',
      source: 'body',
    });
  } else if (h1s.length > 1) {
    issues.push({
      severity: 'ERROR',
      code: 'MULTIPLE_H1',
      message: `MDX body contains ${h1s.length} H1 headings. Exactly one H1 is permitted.`,
      source: 'body',
    });
  }

  // 4. Image alt text present
  for (const img of images) {
    if (!img.hasAlt) {
      issues.push({
        severity: 'ERROR',
        code: 'MISSING_ALT',
        message: `Image '${img.src}' is missing descriptive alt text`,
        source: 'images',
      });
    }
  }

  // 5. Referenced local assets exist on disk
  for (const assetPath of localAssets) {
    if (!fs.existsSync(assetPath)) {
      issues.push({
        severity: 'ERROR',
        code: 'MISSING_ASSET',
        message: `Referenced local asset not found on disk: '${assetPath}'`,
        source: 'assets',
      });
    }
  }

  // 6. Internal relative links resolve
  const fileDir = path.dirname(filePath);
  for (const link of links) {
    if (link.href.startsWith('./') || link.href.startsWith('../')) {
      const resolved = path.resolve(fileDir, link.href);
      if (!fs.existsSync(resolved) && !fs.existsSync(`${resolved}.mdx`) && !fs.existsSync(`${resolved}.md`)) {
        issues.push({
          severity: 'ERROR',
          code: 'BROKEN_LINK',
          message: `Internal relative link cannot be resolved on disk: '${link.href}'`,
          source: 'links',
        });
      }
    }
  }

  const passed = issues.every(i => i.severity !== 'ERROR');
  return { filePath, passed, issues };
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.dir)) {
    process.stdout.write(`MDX Content Validator (skills-by-devansh)
Usage:
  node validate.js --file <path-to-mdx> --model <model-name> [options]
  node validate.js --dir <path-to-dir> --model <model-name> [options]

Options:
  --file <path>       Target MDX file to validate
  --dir <path>        Directory containing MDX files to validate
  --model <name>      CMS model schema (e.g. blog, project, service, tool)
  --json              Output structured JSON report
  -h, --help          Show this help message

Registered Models:
  ${listModels().join(', ')}
`);
    process.exit(opts.help ? 0 : 1);
  }

  const targetFiles = [];
  if (opts.file) {
    targetFiles.push(path.resolve(opts.file));
  } else if (opts.dir) {
    const dir = path.resolve(opts.dir);
    if (!fs.existsSync(dir)) {
      process.stderr.write(`Directory not found: ${dir}\n`);
      process.exit(1);
    }
    for (const ent of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (ent.isFile() && (ent.name.endsWith('.mdx') || ent.name === 'content.md')) {
        targetFiles.push(path.join(ent.parentPath || ent.path, ent.name));
      }
    }
  }

  if (!opts.json) {
    printHeader(`VALIDATING ${targetFiles.length} MDX FILE(S) AGAINST MODEL '${opts.model || 'auto'}'`);
  }

  const results = [];
  let allPassed = true;

  for (const f of targetFiles) {
    // Auto-detect model from parent directory if not explicitly passed
    let model = opts.model;
    if (!model) {
      const parts = f.replace(/\\/g, '/').split('/');
      const modelIdx = parts.findIndex(p => listModels().includes(p));
      if (modelIdx !== -1) model = parts[modelIdx];
    }

    const res = validateSingleMdx(f, model);
    results.push(res);
    if (!res.passed) allPassed = false;

    if (!opts.json) {
      const icon = res.passed ? '✓' : '✗';
      process.stdout.write(`\n${icon} File: ${path.relative(process.cwd(), f)}\n`);
      for (const issue of res.issues) {
        printIssue(issue.severity, issue.code, issue.message, issue.source);
      }
    }
  }

  finishCli(allPassed, { passed: allPassed, total: targetFiles.length, results }, opts.json);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

