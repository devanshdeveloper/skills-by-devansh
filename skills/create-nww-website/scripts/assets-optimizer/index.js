#!/usr/bin/env node
/**
 * Assets Optimizer
 * 
 * Usage: npm run optimize-assets
 */

const AssetManager = require('./lib/AssetManager');

async function main() {
    const args = process.argv.slice(2);
    const options = {};

    // Full CLI argument parsing for overrides
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--dry-run') options.dryRun = true;
        else if (arg === '--input') options.inputDir = args[++i];
        else if (arg === '--output') options.outputDir = args[++i];
        else if (arg === '--image-format') options.imageOutputFormat = args[++i];
        else if (arg === '--video-format') options.videoOutputFormat = args[++i];
        else if (arg === '--no-recreate') options.recreateOutputFolder = false;
        else if (arg === '--responsive') options.getResponsiveSizes = true;
        else if (arg === '--responsive-sizes') options.responsiveSizes = args[++i].split(',').map(n => parseInt(n.trim(), 10));
        else if (arg === '--manifest-dir') options.manifestDir = args[++i];
        else if (arg === '--manifest-name') options.manifestName = args[++i];
        else if (arg === '--logo') {
            options.processLogo = true;
            options.logoPath = args[++i];
        }
        else if (arg === '--quality') options.quality = parseInt(args[++i], 10);
        else if (arg === '--max-size') options.maxSize = parseInt(args[++i], 10);
        else if (arg === '--strict-max-size') options.strictMaxSize = parseInt(args[++i], 10);
        else if (arg === '--concurrency') options.concurrency = parseInt(args[++i], 10);
        else if (arg === '--overwrite') options.overwrite = true;
        else if (arg === '--no-recursive') options.recursive = false;
        else if (arg === '--blur-bottom-right') options.blurBottomRight = true;
    }

    const manager = new AssetManager(options);
    await manager.processAll();
}

main().catch(console.error);
