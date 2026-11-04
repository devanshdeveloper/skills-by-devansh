#!/usr/bin/env node

/**
 * Standalone CMS Blog Post Seeder (Insert)
 *
 * Reads JSON seed files from `project-docs/client-review/gate-5-cms-content/`
 * (or a specified file/directory) and inserts them into the NWW CMS backend.
 *
 * Usage:
 *   node insert.js [--dir <path>] [--file <path>] [--dry-run] [--auto-slug]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL.replace(/\/+$/, '') : '';
const CMS_SITE_KEY = process.env.CMS_SITE_KEY || process.env.CMS_TOKEN;

function parseArgs(argv) {
  const options = {
    dir: 'project-docs/client-review/gate-5-cms-content',
    file: null,
    dryRun: false,
    autoSlug: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--auto-slug') options.autoSlug = true;
    else if (arg === '--dir' && i + 1 < argv.length) options.dir = argv[++i];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
  }
  return options;
}

function validatePostPayload(post, sourceName) {
  const errors = [];
  if (!post.title || typeof post.title !== 'string' || post.title.trim().length < 2) {
    errors.push('title must be a non-empty string with at least 2 characters');
  }
  if (!post.slug || typeof post.slug !== 'string' || !/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('slug must be a lowercase kebab-case string');
  }
  if (!post.content || typeof post.content !== 'string' || post.content.trim().length === 0) {
    errors.push('content must be a non-empty HTML rich-text string');
  }
  if (post.category && !post.metadata?.category) {
    errors.push('Mongoose strict-mode warning: category should be nested in metadata.category');
  }
  if (post.tags && !post.metadata?.tags) {
    errors.push('Mongoose strict-mode warning: tags should be nested in metadata.tags');
  }
  return errors;
}

async function generateSlug(title) {
  const res = await fetch(`${SERVER_URL}/api/blog/generate-slug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CMS_SITE_KEY}`,
      'x-site-key': CMS_SITE_KEY,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Slug generation failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return typeof json.data === 'string' ? json.data : json.data?.slug;
}

async function insertPost(post, autoSlug) {
  let targetSlug = post.slug;
  let payload = {
    ...post,
    status: post.status || 'published',
    editTimeFields: true,
    postedAt: post.postedAt || new Date().toISOString(),
  };

  let res = await fetch(`${SERVER_URL}/api/blog/create-one`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CMS_SITE_KEY}`,
      'x-site-key': CMS_SITE_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 409 && autoSlug) {
    process.stdout.write(`  [CONFLICT] Slug '${targetSlug}' exists. Generating auto-slug...\n`);
    targetSlug = await generateSlug(post.title);
    payload.slug = targetSlug;
    res = await fetch(`${SERVER_URL}/api/blog/create-one`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CMS_SITE_KEY}`,
        'x-site-key': CMS_SITE_KEY,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create post '${targetSlug}' (${res.status}): ${errorText}`);
  }

  return await res.json();
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(`CMS Blog Seeder (Insert)
Usage: node insert.js [options]
Options:
  --dir <path>       Directory containing seed JSON files (default: project-docs/client-review/gate-5-cms-content)
  --file <path>      Target single JSON file to insert
  --dry-run          Validate payloads and schema rules without network requests
  --auto-slug        Automatically resolve slug collisions via backend generator
  -h, --help         Display this help message
`);
    process.exit(0);
  }

  const files = [];
  if (opts.file) {
    if (!fs.existsSync(opts.file)) {
      process.stderr.write(`Error: Specified file not found: ${opts.file}\n`);
      process.exit(1);
    }
    files.push(opts.file);
  } else {
    let targetDir = opts.dir;
    if (!fs.existsSync(targetDir)) {
      process.stderr.write(`Error: Seed directory not found: ${targetDir}\n`);
      process.exit(1);
    }
    const blogSubdir = path.join(targetDir, 'blog');
    if (fs.existsSync(blogSubdir) && fs.statSync(blogSubdir).isDirectory()) {
      const subEntries = fs.readdirSync(blogSubdir).filter(e => e.endsWith('.json') && !e.endsWith('manifest.json'));
      if (subEntries.length > 0) {
        targetDir = blogSubdir;
      }
    }
    for (const entry of fs.readdirSync(targetDir)) {
      if (entry.endsWith('.json') && !entry.endsWith('manifest.json')) {
        files.push(path.join(targetDir, entry));
      }
    }
    opts.dir = targetDir;
  }

  if (files.length === 0) {
    process.stdout.write(`No blog seed JSON files found in ${opts.dir}.\n`);
    process.exit(0);
  }

  process.stdout.write(`Found ${files.length} blog seed file(s).\n`);
  if (!opts.dryRun) {
    if (!SERVER_URL || !CMS_SITE_KEY) {
      process.stderr.write('Error: SERVER_URL and CMS_SITE_KEY must be set in environment for live insertion.\n');
      process.exit(1);
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fileName = path.basename(file);
    process.stdout.write(`Processing: ${fileName}...\n`);

    let post;
    try {
      post = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      process.stderr.write(`  [FAIL] JSON parse error in ${fileName}: ${err.message}\n`);
      failCount++;
      continue;
    }

    const errors = validatePostPayload(post, fileName);
    if (errors.length > 0) {
      for (const err of errors) {
        process.stdout.write(`  [WARN] ${err}\n`);
      }
    }

    if (opts.dryRun) {
      process.stdout.write(`  [DRY-RUN] Validated payload for '${post.slug || post.title}'. (No network call)\n`);
      successCount++;
      continue;
    }

    try {
      const result = await insertPost(post, opts.autoSlug);
      process.stdout.write(`  [SUCCESS] Inserted '${post.title}' -> ID: ${result?.data?._id || 'ok'}\n`);
      successCount++;
    } catch (err) {
      process.stderr.write(`  [FAIL] ${err.message}\n`);
      failCount++;
    }
  }

  process.stdout.write(`\nSeeder Summary: ${successCount} succeeded, ${failCount} failed.\n`);
  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`Unhandled Seeder Error: ${err.message || err}\n`);
  process.exit(1);
});

