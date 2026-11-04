const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

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

module.exports = {
    getCacheKey,
    readCache,
    writeCache
};

