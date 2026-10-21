#!/usr/bin/env node
/**
 * stock-fetch: Sourcing and provenance helper for create-nww-website.
 *
 * Sourced from Pixabay, Pexels, or Unsplash based on priority order and available env vars:
 *   Priority 1: PIXABAY_API_KEY
 *   Priority 2: PEXELS_API_KEY
 *   Priority 3: UNSPLASH_ACCESS_KEY
 *
 * Implements two-source rule compliance, candidate evaluation, provenance recording,
 * rate limit handling, 24h search caching, and provider-specific hosting rules:
 *   - Pixabay/Pexels: Downloaded to assets-source/ and processed via assets-optimizer.
 *   - Unsplash: Hotlinked directly; triggers download location endpoint; skips optimizer.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

// Parse command line arguments
function parseArgs(argv) {
    const options = {
        query: '',
        slot: '',
        page: '',
        orientation: 'horizontal',
        minWidth: 1200,
        outputDir: 'assets-source',
        provenancePath: 'project-docs/stock-provenance.json',
        provider: '',
        select: 1,
        dryRun: false,
        alt: '',
        noCache: false,
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--query' || arg === '-q') options.query = argv[++i];
        else if (arg === '--slot' || arg === '-s') options.slot = argv[++i];
        else if (arg === '--page' || arg === '-p') options.page = argv[++i];
        else if (arg === '--orientation' || arg === '-o') options.orientation = argv[++i];
        else if (arg === '--min-width' || arg === '-w') options.minWidth = parseInt(argv[++i], 10);
        else if (arg === '--output') options.outputDir = argv[++i];
        else if (arg === '--provenance') options.provenancePath = argv[++i];
        else if (arg === '--provider') options.provider = (argv[++i] || '').toLowerCase();
        else if (arg === '--select') options.select = parseInt(argv[++i], 10);
        else if (arg === '--alt') options.alt = argv[++i];
        else if (arg === '--dry-run' || arg === '--list') options.dryRun = true;
        else if (arg === '--no-cache') options.noCache = true;
        else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        }
    }

    return options;
}

function printHelp() {
    console.log(`
Stock Image Sourcing CLI (create-nww-website)

Usage:
  node scripts/stock-fetch/index.js --query <string> --slot <id> [options]

Required:
  --query, -q        Search keywords (3-5 words recommended)
  --slot, -s         Slot ID in assets.md (e.g. srv-s1-hero)

Options:
  --page, -p         Page route (e.g. /services) [default: ""]
  --orientation, -o  Image orientation: horizontal, vertical, squarish [default: horizontal]
  --min-width, -w    Minimum width in pixels [default: 1200]
  --output           Directory for downloaded assets [default: assets-source]
  --provenance       Path to stock-provenance.json [default: project-docs/stock-provenance.json]
  --provider         Force provider: pixabay, pexels, or unsplash [default: auto by priority]
  --select           1-based index of candidate to select [default: 1]
  --alt              Custom alt text [default: auto-generated]
  --dry-run, --list  Display candidate list without downloading or saving provenance
  --no-cache         Bypass 24-hour search cache
  --help, -h         Show this help message

Environment Variables:
  PIXABAY_API_KEY      Pixabay API key (Priority 1)
  PEXELS_API_KEY       Pexels API key (Priority 2)
  UNSPLASH_ACCESS_KEY  Unsplash API Access Key (Priority 3)
`);
}

// HTTP request helper with redirect following
function requestJson(targetUrl, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(targetUrl);
        const transport = parsed.protocol === 'http:' ? http : https;

        const req = transport.request(targetUrl, { method: 'GET', headers }, (res) => {
            // Handle redirects
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                const nextUrl = new URL(res.headers.location, targetUrl).toString();
                return resolve(requestJson(nextUrl, headers));
            }

            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        resolve({ status: res.statusCode, data: json, headers: res.headers });
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON response: ${e.message}`));
                    }
                } else {
                    reject({
                        status: res.statusCode,
                        message: `HTTP ${res.statusCode} ${res.statusMessage || ''}`.trim(),
                        headers: res.headers,
                        bodyPreview: data.slice(0, 200)
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Download binary file to disk following redirects
function downloadFile(targetUrl, destPath) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(targetUrl);
        const transport = parsed.protocol === 'http:' ? http : https;

        const req = transport.get(targetUrl, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                const nextUrl = new URL(res.headers.location, targetUrl).toString();
                return resolve(downloadFile(nextUrl, destPath));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
            }

            const dir = path.dirname(destPath);
            fs.mkdirSync(dir, { recursive: true });

            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close(() => resolve(destPath));
            });

            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        });

        req.on('error', reject);
    });
}

// Trigger Unsplash download endpoint (required by API guidelines)
async function triggerUnsplashDownload(downloadLocationUrl, accessKey) {
    try {
        const parsed = new URL(downloadLocationUrl);
        const headers = {
            'Authorization': `Client-ID ${accessKey}`
        };
        await requestJson(parsed.toString(), headers);
        return true;
    } catch (err) {
        console.warn(`[WARN] Unsplash download trigger failed: ${err.message || err.status || 'unknown error'}`);
        return false;
    }
}

// 24-hour cache manager
function getCacheKey(provider, query, orientation) {
    const raw = `${provider}:${query.toLowerCase().trim()}:${orientation}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

function readCache(provider, query, orientation) {
    const cacheDir = path.resolve('.stock-cache');
    const key = getCacheKey(provider, query, orientation);
    const filePath = path.join(cacheDir, `${provider}-${key}.json`);

    if (!fs.existsSync(filePath)) return null;

    try {
        const stat = fs.statSync(filePath);
        const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
        if (ageHours > 24) return null; // Expired after 24 hours

        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

function writeCache(provider, query, orientation, data) {
    try {
        const cacheDir = path.resolve('.stock-cache');
        fs.mkdirSync(cacheDir, { recursive: true });
        const key = getCacheKey(provider, query, orientation);
        const filePath = path.join(cacheDir, `${provider}-${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch {
        // Cache write failure is non-fatal
    }
}

// 1. Pixabay Search
async function searchPixabay(key, query, orientation, minWidth) {
    let orient = 'horizontal';
    if (orientation === 'vertical') orient = 'vertical';
    else if (orientation === 'squarish' || orientation === 'square') orient = 'all';

    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', key);
    url.searchParams.set('q', query);
    url.searchParams.set('image_type', 'photo');
    url.searchParams.set('safesearch', 'true');
    url.searchParams.set('orientation', orient);
    url.searchParams.set('min_width', String(minWidth || 1200));
    url.searchParams.set('order', 'popular');
    url.searchParams.set('per_page', '10');

    const res = await requestJson(url.toString());
    const hits = (res.data && res.data.hits) || [];

    return hits.map(hit => ({
        id: String(hit.id),
        provider: 'pixabay',
        photographer: hit.user || 'Unknown',
        photographerProfile: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
        pageUrl: hit.pageURL,
        licenseLink: 'https://pixabay.com/service/license/',
        width: hit.imageWidth,
        height: hit.imageHeight,
        downloadUrl: hit.largeImageURL || hit.webformatURL,
        previewUrl: hit.webformatURL,
        tags: hit.tags || '',
        rehosted: true
    }));
}

// 2. Pexels Search
async function searchPexels(key, query, orientation) {
    let orient = 'landscape';
    if (orientation === 'vertical') orient = 'portrait';
    else if (orientation === 'squarish' || orientation === 'square') orient = 'square';

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', orient);
    url.searchParams.set('size', 'large');
    url.searchParams.set('per_page', '10');

    const headers = { 'Authorization': key };
    const res = await requestJson(url.toString(), headers);
    const photos = (res.data && res.data.photos) || [];

    return photos.map(photo => ({
        id: String(photo.id),
        provider: 'pexels',
        photographer: photo.photographer || 'Unknown',
        photographerProfile: photo.photographer_url || 'https://www.pexels.com',
        pageUrl: photo.url,
        licenseLink: 'https://www.pexels.com/license/',
        width: photo.width,
        height: photo.height,
        downloadUrl: photo.src ? (photo.src.large2x || photo.src.large || photo.src.original) : '',
        previewUrl: photo.src ? photo.src.medium : '',
        altText: photo.alt || '',
        rehosted: true
    }));
}

// 3. Unsplash Search
async function searchUnsplash(key, query, orientation) {
    let orient = 'landscape';
    if (orientation === 'vertical') orient = 'portrait';
    else if (orientation === 'squarish' || orientation === 'square') orient = 'squarish';

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', orient);
    url.searchParams.set('content_filter', 'low');
    url.searchParams.set('per_page', '10');

    const headers = { 'Authorization': `Client-ID ${key}` };
    const res = await requestJson(url.toString(), headers);
    const results = (res.data && res.data.results) || [];

    return results.map(photo => ({
        id: String(photo.id),
        provider: 'unsplash',
        photographer: (photo.user && photo.user.name) || 'Unknown',
        photographerUsername: photo.user && photo.user.username,
        photographerProfile: photo.user && photo.user.links && photo.user.links.html,
        pageUrl: photo.links && photo.links.html,
        licenseLink: 'https://unsplash.com/license',
        width: photo.width,
        height: photo.height,
        hotlinkUrl: photo.urls && (photo.urls.regular || photo.urls.full),
        downloadLocationUrl: photo.links && photo.links.download_location,
        previewUrl: photo.urls && photo.urls.small,
        altText: photo.alt_description || photo.description || '',
        rehosted: false
    }));
}

// Append or update entry in stock-provenance.json
function updateProvenance(manifestPath, entry) {
    const fullPath = path.resolve(manifestPath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });

    let manifest = [];
    if (fs.existsSync(fullPath)) {
        try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            manifest = JSON.parse(raw);
            if (!Array.isArray(manifest)) manifest = [];
        } catch {
            manifest = [];
        }
    }

    const existingIdx = manifest.findIndex(item => item.assetId === entry.assetId);
    if (existingIdx >= 0) {
        manifest[existingIdx] = entry;
    } else {
        manifest.push(entry);
    }

    fs.writeFileSync(fullPath, JSON.stringify(manifest, null, 2), 'utf8');
    return fullPath;
}

// Determine available providers in priority order
function getAvailableProviders(forceProvider) {
    const providers = [];

    if (forceProvider) {
        if (!['pixabay', 'pexels', 'unsplash'].includes(forceProvider)) {
            throw new Error(`Invalid provider "${forceProvider}". Must be pixabay, pexels, or unsplash.`);
        }
        if (forceProvider === 'pixabay') {
            if (!process.env.PIXABAY_API_KEY) throw new Error('PIXABAY_API_KEY is not set in environment.');
            providers.push({ name: 'pixabay', key: process.env.PIXABAY_API_KEY });
        } else if (forceProvider === 'pexels') {
            if (!process.env.PEXELS_API_KEY) throw new Error('PEXELS_API_KEY is not set in environment.');
            providers.push({ name: 'pexels', key: process.env.PEXELS_API_KEY });
        } else if (forceProvider === 'unsplash') {
            if (!process.env.UNSPLASH_ACCESS_KEY) throw new Error('UNSPLASH_ACCESS_KEY is not set in environment.');
            providers.push({ name: 'unsplash', key: process.env.UNSPLASH_ACCESS_KEY });
        }
        return providers;
    }

    if (process.env.PIXABAY_API_KEY) {
        providers.push({ name: 'pixabay', key: process.env.PIXABAY_API_KEY });
    }
    if (process.env.PEXELS_API_KEY) {
        providers.push({ name: 'pexels', key: process.env.PEXELS_API_KEY });
    }
    if (process.env.UNSPLASH_ACCESS_KEY) {
        providers.push({ name: 'unsplash', key: process.env.UNSPLASH_ACCESS_KEY });
    }

    return providers;
}

async function executeSearch(providerInfo, query, orientation, minWidth, noCache) {
    const { name, key } = providerInfo;

    if (!noCache) {
        const cached = readCache(name, query, orientation);
        if (cached && cached.length > 0) {
            console.log(`[stock-fetch] Loaded ${cached.length} candidates from 24h cache (${name})`);
            return cached;
        }
    }

    let candidates = [];
    if (name === 'pixabay') {
        candidates = await searchPixabay(key, query, orientation, minWidth);
    } else if (name === 'pexels') {
        candidates = await searchPexels(key, query, orientation);
    } else if (name === 'unsplash') {
        candidates = await searchUnsplash(key, query, orientation);
    }

    if (candidates && candidates.length > 0) {
        writeCache(name, query, orientation, candidates);
    }

    return candidates;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (!options.query) {
        console.error('Error: --query is required.');
        printHelp();
        process.exit(1);
    }

    if (!options.slot && !options.dryRun) {
        console.error('Error: --slot is required unless running in --dry-run / --list mode.');
        printHelp();
        process.exit(1);
    }

    let providers;
    try {
        providers = getAvailableProviders(options.provider);
    } catch (e) {
        console.error(`Configuration Error: ${e.message}`);
        process.exit(1);
    }

    if (providers.length === 0) {
        console.error(`
[stock-fetch] Error: No stock provider API keys found in environment.
Please set at least one of the following environment variables:
  - PIXABAY_API_KEY      (Priority 1 - Recommended)
  - PEXELS_API_KEY       (Priority 2)
  - UNSPLASH_ACCESS_KEY  (Priority 3)

If no stock photography is approved for this project, record the decision in
client-answers.md and use neutral placeholder images instead.
`);
        process.exit(1);
    }

    let candidates = [];
    let activeProvider = null;

    // Try providers in priority order
    for (const prov of providers) {
        console.log(`[stock-fetch] Searching provider: ${prov.name.toUpperCase()} for "${options.query}" (${options.orientation})...`);
        try {
            candidates = await executeSearch(prov, options.query, options.orientation, options.minWidth, options.noCache);
            if (candidates && candidates.length > 0) {
                activeProvider = prov;
                break;
            } else {
                console.log(`[stock-fetch] Zero results from ${prov.name}. Trying next provider...`);
            }
        } catch (err) {
            const status = err.status || '';
            const msg = err.message || '';
            console.warn(`[stock-fetch] Provider ${prov.name} failed (${status} ${msg}).`);
            if (status === 429) {
                console.warn(`[stock-fetch] Rate limit reached on ${prov.name}.`);
            }
        }
    }

    if (!activeProvider || candidates.length === 0) {
        console.error(`
[stock-fetch] Failure: No candidate images found for query "${options.query}".
Tested provider(s): ${providers.map(p => p.name).join(', ')}.
Action: Revise search terms or check API credentials/quotas.
Never use unapproved sources or scrape images.
`);
        process.exit(1);
    }

    console.log(`\nFound ${candidates.length} candidate(s) from ${activeProvider.name.toUpperCase()}:\n`);
    candidates.forEach((c, idx) => {
        const num = idx + 1;
        const dims = `${c.width}x${c.height}`;
        console.log(`  [${num}] ID: ${c.id}`);
        console.log(`      Photographer : ${c.photographer}`);
        console.log(`      Dimensions   : ${dims}`);
        console.log(`      Page URL     : ${c.pageUrl}`);
        if (c.tags) console.log(`      Tags         : ${c.tags}`);
        if (c.altText) console.log(`      Description  : ${c.altText}`);
        console.log('');
    });

    if (options.dryRun) {
        console.log('[stock-fetch] --dry-run active. No files downloaded or provenance written.');
        return;
    }

    const selectIdx = Math.max(1, Math.min(options.select, candidates.length)) - 1;
    const chosen = candidates[selectIdx];

    console.log(`Selected Candidate [${selectIdx + 1}]: ID ${chosen.id} by ${chosen.photographer}`);

    const slot = options.slot;
    const pageRoute = options.page || 'unknown';
    const altDescription = options.alt || chosen.altText || `Photograph by ${chosen.photographer} representing ${options.query}`;

    let provenanceEntry = {
        assetId: slot,
        provider: chosen.provider,
        photoId: chosen.id,
        photographerName: chosen.photographer,
        photographerProfileUrl: chosen.photographerProfile,
        pageUrl: chosen.pageUrl,
        licenseLink: chosen.licenseLink,
        retrievalDate: new Date().toISOString(),
        searchQuery: options.query,
        pageSlot: `${slot} on ${pageRoute}`,
        altText: altDescription,
    };

    if (chosen.provider === 'pixabay' || chosen.provider === 'pexels') {
        const destFile = path.join(options.outputDir, `${slot}.jpg`);
        console.log(`[stock-fetch] Downloading source asset to ${destFile}...`);
        await downloadFile(chosen.downloadUrl, destFile);
        console.log(`[stock-fetch] Asset saved: ${destFile}`);

        provenanceEntry.localFile = `${options.outputDir}/${slot}.jpg`.replace(/\\/g, '/');
        provenanceEntry.finalFile = `site/public/assets/${slot}.webp`;
        provenanceEntry.rehosted = true;
    } else if (chosen.provider === 'unsplash') {
        console.log('[stock-fetch] Unsplash provider active: hotlinking directly (rehosted = false).');
        provenanceEntry.hotlinkedUrl = chosen.hotlinkUrl;
        provenanceEntry.downloadLocationUrl = chosen.downloadLocationUrl;
        provenanceEntry.rehosted = false;

        if (chosen.downloadLocationUrl) {
            console.log('[stock-fetch] Triggering Unsplash download count endpoint...');
            const success = await triggerUnsplashDownload(chosen.downloadLocationUrl, activeProvider.key);
            provenanceEntry.downloadTriggerFired = success;
            if (success) {
                console.log('[stock-fetch] Download count registered successfully with Unsplash API.');
            }
        } else {
            provenanceEntry.downloadTriggerFired = false;
        }
    }

    const provPath = updateProvenance(options.provenancePath, provenanceEntry);
    console.log(`[stock-fetch] Provenance manifest updated: ${provPath}`);
    console.log('\nProvenance Record Summary:');
    console.log(JSON.stringify(provenanceEntry, null, 2));
    console.log('\n[stock-fetch] Complete.\n');
}

main().catch(err => {
    console.error(`[stock-fetch] Fatal error: ${err.message || err}`);
    process.exit(1);
});
