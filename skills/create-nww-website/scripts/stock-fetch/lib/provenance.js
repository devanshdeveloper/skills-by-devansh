const fs = require('node:fs');
const path = require('node:path');
const { downloadFile, triggerUnsplashDownload } = require('./http');

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

async function processSelectedCandidate(chosen, options, activeProvider) {
    const slot = options.slot;
    const pageRoute = options.page || 'unknown';
    const altDescription = options.alt || chosen.altText || `Photograph by ${chosen.photographer} representing ${options.query}`;

    const provenanceEntry = {
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

module.exports = {
    updateProvenance,
    processSelectedCandidate
};

