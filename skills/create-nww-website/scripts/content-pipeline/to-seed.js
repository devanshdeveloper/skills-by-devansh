#!/usr/bin/env node

/**
 * Gate 5 Batch 02: MDX-to-Seed Compiler CLI
 *
 * Compiles validated MDX content into Mongoose strict-mode JSON seeds
 * with zero LLM token burn, guaranteed round-trip schema validation,
 * and deterministic slug ordering.
 *
 * Usage:
 *   node to-seed.js --src <client-context-dir> --out <output-dir> --model <model-name>
 *   node to-seed.js --file <path-to-mdx> --out <output-dir> --model <model-name>
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readAndParseMDX } from './lib/mdx-parser.js';
import { markdownToHtml, extractFaqs } from './lib/html-renderer.js';
import { getModel, listModels } from './models/registry.js';
import { printHeader, finishCli } from './lib/reporter.js';

export function parseArgs(argv) {
  const options = {
    file: null,
    src: null,
    out: null,
    model: null,
    dryRun: false,
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--json') options.json = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg.startsWith('--src=')) options.src = arg.split('=')[1];
    else if (arg === '--src' && i + 1 < argv.length) options.src = argv[++i];
    else if (arg.startsWith('--out=')) options.out = arg.split('=')[1];
    else if (arg === '--out' && i + 1 < argv.length) options.out = argv[++i];
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--model' && i + 1 < argv.length) options.model = argv[++i];
  }

  return options;
}

export function compileMdxToSeed(filePath, modelKey) {
  const modelModule = getModel(modelKey);
  if (!modelModule) {
    throw new Error(`Unknown model: '${modelKey}'. Available: ${listModels().join(', ')}`);
  }

  const { frontmatter, body } = readAndParseMDX(filePath);

  // 1. Validate frontmatter against model schema
  const fmParsed = modelModule.frontmatterSchema.parse(frontmatter);

  // 2. Render markdown body to semantic HTML rich-text
  const htmlBody = markdownToHtml(body);

  // 3. Extract FAQ pairs if present
  const faqs = extractFaqs(body);

  // 4. Transform into Mongoose payload
  const seedPayload = modelModule.toSeedPayload(fmParsed, htmlBody, faqs);

  // 5. Round-trip validation against seed schema
  const validatedSeed = modelModule.seedSchema.parse(seedPayload);

  return {
    slug: validatedSeed.slug,
    model: modelModule.modelName,
    resourceSlug: modelModule.resourceSlug,
    seedPayload: validatedSeed,
  };
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.src)) {
    process.stdout.write(`Gate 5 Batch 02: MDX-to-Seed Compiler (skills-by-devansh)
Usage:
  node to-seed.js --file <path-to-mdx> --model <name> [options]
  node to-seed.js --src <source-dir> --out <output-dir> [options]

Options:
  --file <path>       Single MDX file to compile
  --src <path>        Source directory (e.g. client-context/ or client-context/blog/)
  --out <path>        Output directory for JSON seeds (default: project-docs/client-review/gate-5-cms-content/<model>)
  --model <name>      CMS model schema (e.g. blog, project, service, tool)
  --dry-run           Compile and validate in-memory without writing files to disk
  --json              Output structured JSON result
  -h, --help          Show this help message

Registered Models:
  ${listModels().join(', ')}
`);
    process.exit(opts.help ? 0 : 1);
  }

  const targetFiles = [];
  if (opts.file) {
    targetFiles.push(path.resolve(opts.file));
  } else if (opts.src) {
    const srcDir = path.resolve(opts.src);
    if (!fs.existsSync(srcDir)) {
      process.stderr.write(`Source directory not found: ${srcDir}\n`);
      process.exit(1);
    }
    for (const ent of fs.readdirSync(srcDir, { recursive: true, withFileTypes: true })) {
      if (ent.isFile() && (ent.name.endsWith('.mdx') || ent.name === 'content.md')) {
        targetFiles.push(path.join(ent.parentPath || ent.path, ent.name));
      }
    }
  }

  // Sort deterministically by path
  targetFiles.sort();

  if (!opts.json) {
    printHeader(`COMPILING ${targetFiles.length} MDX FILE(S) TO CMS JSON SEEDS`);
  }

  const compiledSeeds = [];
  let compilePassed = true;

  for (const f of targetFiles) {
    let model = opts.model;
    if (!model) {
      const parts = f.replace(/\\/g, '/').split('/');
      const modelIdx = parts.findIndex(p => listModels().includes(p));
      if (modelIdx !== -1) model = parts[modelIdx];
      else model = 'blog';
    }

    try {
      const compiled = compileMdxToSeed(f, model);
      compiledSeeds.push({
        sourceFile: f,
        ...compiled,
      });

      if (!opts.dryRun) {
        const baseOutDir = opts.out
          ? path.resolve(opts.out)
          : path.join(process.cwd(), 'project-docs', 'client-review', 'gate-5-cms-content');
        const outDir = path.join(baseOutDir, model);

        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        const outPath = path.join(outDir, `${compiled.slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(compiled.seedPayload, null, 2), 'utf-8');

        if (!opts.json) {
          process.stdout.write(`  ✓ [${model}] Compiled: ${compiled.slug} -> ${path.relative(process.cwd(), outPath)}\n`);
        }
      } else if (!opts.json) {
        process.stdout.write(`  ✓ [DRY-RUN] [${model}] Validated & Compiled: ${compiled.slug}\n`);
      }
    } catch (err) {
      compilePassed = false;
      if (!opts.json) {
        process.stderr.write(`  ✗ Failed compiling '${path.relative(process.cwd(), f)}': ${err.message}\n`);
      }
    }
  }

  // Generate manifest in output directory
  if (!opts.dryRun && compilePassed && compiledSeeds.length > 0 && opts.out) {
    const outDir = path.resolve(opts.out);
    const manifestPath = path.join(outDir, 'manifest.json');
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalSeeds: compiledSeeds.length,
      items: compiledSeeds.map(s => ({
        slug: s.slug,
        model: s.model,
        resourceSlug: s.resourceSlug,
        source: path.relative(process.cwd(), s.sourceFile),
      })),
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  finishCli(
    compilePassed,
    {
      passed: compilePassed,
      total: targetFiles.length,
      compiledCount: compiledSeeds.length,
      seeds: compiledSeeds.map(s => ({ slug: s.slug, model: s.model, file: s.sourceFile })),
    },
    opts.json
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

