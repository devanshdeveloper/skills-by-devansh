const { URL } = require('node:url');
const { requestJson } = require('./http');
const { readCache, writeCache } = require('./cache');

// Provider-specific orientation mapping
const ORIENTATION_MAP = {
    pixabay:  { horizontal: 'horizontal', vertical: 'vertical',  squarish: 'all',      square: 'all' },
    pexels:   { horizontal: 'landscape',  vertical: 'portrait',  squarish: 'square',   square: 'square' },
    unsplash: { horizontal: 'landscape',  vertical: 'portrait',  squarish: 'squarish', square: 'squarish' }
};

function mapOrientation(orientation, provider) {
    return ORIENTATION_MAP[provider]?.[orientation] || ORIENTATION_MAP[provider]?.horizontal || orientation;
}

// 1. Pixabay Search
async function searchPixabay(key, query, orientation, minWidth) {
    const orient = mapOrientation(orientation, 'pixabay');

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
    const orient = mapOrientation(orientation, 'pexels');

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
    const orient = mapOrientation(orientation, 'unsplash');

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

// Supported providers and their corresponding environment variables in priority order
const PROVIDER_CONFIGS = [
    { name: 'pixabay', envVar: 'PIXABAY_API_KEY' },
    { name: 'pexels', envVar: 'PEXELS_API_KEY' },
    { name: 'unsplash', envVar: 'UNSPLASH_ACCESS_KEY' }
];

// Determine available providers in priority order
function getAvailableProviders(forceProvider) {
    if (forceProvider) {
        const config = PROVIDER_CONFIGS.find(p => p.name === forceProvider);
        if (!config) {
            throw new Error(`Invalid provider "${forceProvider}". Must be pixabay, pexels, or unsplash.`);
        }
        const key = process.env[config.envVar];
        if (!key) {
            throw new Error(`${config.envVar} is not set in environment.`);
        }
        return [{ name: config.name, key }];
    }

    return PROVIDER_CONFIGS
        .filter(p => Boolean(process.env[p.envVar]))
        .map(p => ({ name: p.name, key: process.env[p.envVar] }));
}

const SEARCH_HANDLERS = {
    pixabay: (key, query, orientation, minWidth) => searchPixabay(key, query, orientation, minWidth),
    pexels: (key, query, orientation) => searchPexels(key, query, orientation),
    unsplash: (key, query, orientation) => searchUnsplash(key, query, orientation)
};

async function executeSearch(providerInfo, query, orientation, minWidth, noCache) {
    const { name, key } = providerInfo;

    if (!noCache) {
        const cached = readCache(name, query, orientation);
        if (cached && cached.length > 0) {
            console.log(`[stock-fetch] Loaded ${cached.length} candidates from 24h cache (${name})`);
            return cached;
        }
    }

    const handler = SEARCH_HANDLERS[name];
    const candidates = handler ? await handler(key, query, orientation, minWidth) : [];

    if (candidates && candidates.length > 0) {
        writeCache(name, query, orientation, candidates);
    }

    return candidates;
}

module.exports = {
    ORIENTATION_MAP,
    mapOrientation,
    searchPixabay,
    searchPexels,
    searchUnsplash,
    PROVIDER_CONFIGS,
    getAvailableProviders,
    SEARCH_HANDLERS,
    executeSearch
};

