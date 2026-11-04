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

const { getAvailableProviders, executeSearch } = require('./lib/providers');
const { processSelectedCandidate } = require('./lib/provenance');

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
  --slot, -s         Slot ID in page.md (e.g. srv-s1-hero)

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
client-context/answers/batch-04-asset-harvesting-generation/answers.md and use neutral placeholder images instead.
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
    await processSelectedCandidate(chosen, options, activeProvider);
}

if (require.main === module) {
    main().catch(err => {
        console.error(`[stock-fetch] Fatal error: ${err.message || err}`);
        process.exit(1);
    });
}

module.exports = {
    parseArgs,
    printHelp,
    main
};
