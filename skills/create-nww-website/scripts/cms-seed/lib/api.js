const fs = require('node:fs');
const path = require('node:path');
const { validateAndFormatSeedPayload } = require('./schema');

/**
 * Requests an auto-sanitized collision-free slug from the NWW CMS backend
 */
async function generateBlogSlug(title, serverUrl, siteKey) {
  const endpoint = `${serverUrl}/api/blog/generate-slug`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${siteKey}`,
      'x-site-key': siteKey
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    throw new Error(`generate-slug failed with HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data && data.success && data.data) {
    return typeof data.data === 'string' ? data.data : data.data.slug;
  }
  throw new Error(`Unexpected generate-slug response: ${JSON.stringify(data)}`);
}

/**
 * Seeds a single blog post to the NWW CMS backend
 */
async function seedPostToCMS(rawPost, options = {}) {
  const { serverUrl, siteKey, autoSlug, dryRun, status } = options;
  const payload = validateAndFormatSeedPayload(rawPost, { status });

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      action: 'PREVIEW_VALIDATED',
      slug: payload.slug,
      title: payload.title,
      payload
    };
  }

  if (!siteKey) {
    throw new Error('Missing CMS_SITE_KEY environment variable. Authenticated write required.');
  }

  const createEndpoint = `${serverUrl}/api/blog/create-one`;

  // Helper to make creation request
  async function executeCreate(postBody) {
    return await fetch(createEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${siteKey}`,
        'x-site-key': siteKey
      },
      body: JSON.stringify(postBody)
    });
  }

  let res = await executeCreate(payload);

  // Handle 409 Conflict (Duplicate Slug) with auto-slug resolution
  if (res.status === 409 && autoSlug) {
    console.warn(`  ! Slug collision for "${payload.slug}". Querying /api/blog/generate-slug...`);
    const newSlug = await generateBlogSlug(payload.title, serverUrl, siteKey);
    console.log(`  → Acquired collision-free slug: "${newSlug}"`);
    payload.slug = newSlug;
    res = await executeCreate(payload);
  }

  if (res.status === 201 || res.status === 200) {
    const json = await res.json();
    return {
      success: true,
      status: res.status,
      slug: payload.slug,
      title: payload.title,
      data: json.data || json
    };
  }

  const errText = await res.text();
  throw new Error(`HTTP ${res.status} ${res.statusText}: ${errText}`);
}

/**
 * Scans a directory and seeds all .json post files
 */
async function seedAllPostsFromDirectory(seedDir, options = {}) {
  if (!fs.existsSync(seedDir)) {
    throw new Error(`Seed directory does not exist: ${seedDir}`);
  }

  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log(`No .json files found in ${seedDir}.`);
    return [];
  }

  const results = [];
  for (const file of files) {
    const fullPath = path.join(seedDir, file);
    try {
      const rawContent = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      console.log(`Seeding [${file}]: "${parsed.title || 'Untitled'}"...`);
      const result = await seedPostToCMS(parsed, options);
      console.log(`  ✓ Seeded successfully: slug="${result.slug}" (HTTP ${result.status || 'DRY-RUN'})`);
      results.push({ file, success: true, result });
    } catch (err) {
      console.error(`  ✗ Failed to seed [${file}]: ${err.message}`);
      results.push({ file, success: false, error: err.message });
    }
  }

  return results;
}

module.exports = {
  generateBlogSlug,
  seedPostToCMS,
  seedAllPostsFromDirectory
};

