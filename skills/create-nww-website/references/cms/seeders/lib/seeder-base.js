/**
 * Universal Seeder Engine Base
 *
 * Provides shared argument parsing, environment resolution, and CRUD lifecycle
 * handlers for standalone model seeders in Stage 5.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function parseArgs(argv, defaultDir = 'project-docs/client-review/gate-5-cms-content') {
  const options = {
    dir: defaultDir,
    file: null,
    id: null,
    dryRun: false,
    autoSlug: false,
    status: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--auto-slug') options.autoSlug = true;
    else if (arg === '--dir' && i + 1 < argv.length) options.dir = argv[++i];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg === '--id' && i + 1 < argv.length) options.id = argv[++i];
    else if (arg === '--status' && i + 1 < argv.length) options.status = argv[++i];
  }
  return options;
}

export function resolveEnv() {
  const rawUrl = process.env.SERVER_URL;
  const siteKey = process.env.CMS_SITE_KEY || process.env.CMS_TOKEN;
  if (!rawUrl) {
    throw new Error('SERVER_URL must be set in environment or .env.local');
  }
  if (!siteKey) {
    throw new Error('CMS_SITE_KEY or CMS_TOKEN must be set in environment or .env.local');
  }
  const serverUrl = rawUrl.replace(/\/+$/, '');
  return { serverUrl, siteKey };
}

export async function generateSlug(serverUrl, siteKey, resourceSlug, title) {
  const res = await fetch(`${serverUrl}/api/${resourceSlug}/generate-slug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${siteKey}`,
      'x-site-key': siteKey,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Slug generation failed for ${resourceSlug}: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return typeof json.data === 'string' ? json.data : json.data?.slug;
}

export async function insertItem({ serverUrl, siteKey, resourceSlug, item, autoSlug, titleKey = 'title', slugKey = 'slug' }) {
  let targetSlug = item[slugKey];
  let payload = {
    ...item,
    status: item.status || 'published',
    editTimeFields: true,
  };

  let res = await fetch(`${serverUrl}/api/${resourceSlug}/create-one`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${siteKey}`,
      'x-site-key': siteKey,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 409 && autoSlug && targetSlug) {
    process.stdout.write(`  [CONFLICT] Slug '${targetSlug}' exists. Generating auto-slug...\n`);
    targetSlug = await generateSlug(serverUrl, siteKey, resourceSlug, item[titleKey] || targetSlug);
    payload[slugKey] = targetSlug;
    res = await fetch(`${serverUrl}/api/${resourceSlug}/create-one`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${siteKey}`,
        'x-site-key': siteKey,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create ${resourceSlug} item (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function updateItem({ serverUrl, siteKey, resourceSlug, id, payload }) {
  const res = await fetch(`${serverUrl}/api/${resourceSlug}/update-one/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${siteKey}`,
      'x-site-key': siteKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update ${resourceSlug}/${id} (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function deleteItem({ serverUrl, siteKey, resourceSlug, id }) {
  const res = await fetch(`${serverUrl}/api/${resourceSlug}/delete-one/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${siteKey}`,
      'x-site-key': siteKey,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete ${resourceSlug}/${id} (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function runInsertCli({ modelName, resourceSlug, defaultDir, validateFn = () => [], titleKey = 'title', slugKey = 'slug' }) {
  const opts = parseArgs(process.argv.slice(2), defaultDir);

  if (opts.help) {
    process.stdout.write(`CMS ${modelName} Seeder (Insert)
Usage: node insert.js [options]
Options:
  --dir <path>       Directory containing seed JSON files (default: ${defaultDir})
  --file <path>      Target single JSON file to insert
  --dry-run          Validate payloads without sending network requests
  --auto-slug        Auto-resolve slug collisions via backend generator
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
    if (!fs.existsSync(opts.dir)) {
      process.stderr.write(`Notice: Seed directory not found: ${opts.dir}\n`);
      process.exit(0);
    }
    for (const entry of fs.readdirSync(opts.dir)) {
      if (entry.endsWith('.json') && !entry.endsWith('manifest.json')) {
        files.push(path.join(opts.dir, entry));
      }
    }
  }

  if (files.length === 0) {
    process.stdout.write(`No seed JSON files found in ${opts.dir}.\n`);
    process.exit(0);
  }

  process.stdout.write(`Found ${files.length} ${modelName} seed file(s).\n`);

  let env = null;
  if (!opts.dryRun) {
    try {
      env = resolveEnv();
    } catch (err) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const fileName = path.basename(file);
    process.stdout.write(`Processing: ${fileName}...\n`);

    let item;
    try {
      item = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      process.stderr.write(`  [FAIL] JSON parse error in ${fileName}: ${err.message}\n`);
      failCount++;
      continue;
    }

    const errors = validateFn(item, fileName);
    if (errors && errors.length > 0) {
      for (const err of errors) {
        process.stdout.write(`  [WARN] ${err}\n`);
      }
    }

    if (opts.dryRun) {
      process.stdout.write(`  [DRY-RUN] Validated payload for '${item[titleKey] || fileName}'. (No network call)\n`);
      successCount++;
      continue;
    }

    try {
      const result = await insertItem({
        serverUrl: env.serverUrl,
        siteKey: env.siteKey,
        resourceSlug,
        item,
        autoSlug: opts.autoSlug,
        titleKey,
        slugKey,
      });
      process.stdout.write(`  [SUCCESS] Inserted '${item[titleKey] || fileName}' -> ID: ${result?.data?._id || 'ok'}\n`);
      successCount++;
    } catch (err) {
      process.stderr.write(`  [FAIL] ${err.message}\n`);
      failCount++;
    }
  }

  process.stdout.write(`\nSeeder Summary: ${successCount} succeeded, ${failCount} failed.\n`);
  if (failCount > 0) process.exit(1);
}

export async function runUpdateCli({ modelName, resourceSlug }) {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.id || !opts.file) {
    process.stdout.write(`CMS ${modelName} Updater
Usage: node update.js --id <doc-id> --file <path-to-json> [--dry-run]
`);
    process.exit(opts.help ? 0 : 1);
  }

  if (!fs.existsSync(opts.file)) {
    process.stderr.write(`Error: Specified file not found: ${opts.file}\n`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(opts.file, 'utf8'));

  if (opts.dryRun) {
    process.stdout.write(`[DRY-RUN] Validated update for ${modelName} ID ${opts.id}:\n${JSON.stringify(payload, null, 2)}\n`);
    process.exit(0);
  }

  const env = resolveEnv();
  const result = await updateItem({
    serverUrl: env.serverUrl,
    siteKey: env.siteKey,
    resourceSlug,
    id: opts.id,
    payload,
  });

  process.stdout.write(`[SUCCESS] Updated ${modelName} ${opts.id}: ${result.message || 'ok'}\n`);
}

export async function runDeleteCli({ modelName, resourceSlug }) {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.id) {
    process.stdout.write(`CMS ${modelName} Deletion Utility
Usage: node delete.js --id <doc-id> [--dry-run]
`);
    process.exit(opts.help ? 0 : 1);
  }

  if (opts.dryRun) {
    process.stdout.write(`[DRY-RUN] Would delete ${modelName} with ID: ${opts.id}\n`);
    process.exit(0);
  }

  const env = resolveEnv();
  const result = await deleteItem({
    serverUrl: env.serverUrl,
    siteKey: env.siteKey,
    resourceSlug,
    id: opts.id,
  });

  process.stdout.write(`[SUCCESS] Deleted ${modelName} ${opts.id}: ${result.message || 'ok'}\n`);
}

