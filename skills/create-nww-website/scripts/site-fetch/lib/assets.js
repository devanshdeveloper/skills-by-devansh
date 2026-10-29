'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { fetchBuffer } = require('./http');

function getImageDimensionsFromBuffer(buffer) {
  if (!buffer || buffer.length < 24) return null;
  try {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: 'png' };
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8), format: 'gif' };
    }
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      const type = buffer.toString('ascii', 12, 16);
      if (type === 'VP8 ' && buffer.length >= 30) {
        return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff, format: 'webp' };
      }
      if (type === 'VP8L' && buffer.length >= 25) {
        const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
        return {
          width: 1 + (((b1 & 0x3f) << 8) | b0),
          height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
          format: 'webp'
        };
      }
      if (type === 'VP8X' && buffer.length >= 30) {
        return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3), format: 'webp' };
      }
    }
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) { offset++; continue; }
        const marker = buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7), format: 'jpeg' };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }
    const snippet = buffer.toString('utf-8', 0, Math.min(2048, buffer.length));
    if (snippet.includes('<svg')) {
      const vb = snippet.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
      if (vb) return { width: Math.round(parseFloat(vb[1])), height: Math.round(parseFloat(vb[2])), format: 'svg' };
      const w = snippet.match(/width\s*=\s*["'](\d+)(?:px)?["']/i);
      const h = snippet.match(/height\s*=\s*["'](\d+)(?:px)?["']/i);
      if (w && h) return { width: parseInt(w[1], 10), height: parseInt(h[1], 10), format: 'svg' };
      return { width: null, height: null, format: 'svg' };
    }
  } catch {}
  return null;
}

function resolveAssetSourceRelativePath(assetUrl, baseOrigin) {
  try {
    const u = new URL(assetUrl);
    let p = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index-asset';
    const isSameHost = u.origin === baseOrigin || u.hostname.endsWith(new URL(baseOrigin).hostname);
    return isSameHost ? p : path.posix.join('_cdn', u.hostname, p);
  } catch {
    return path.posix.join('assets', path.basename(assetUrl).split('?')[0] || 'asset.bin');
  }
}

async function harvestAndPlaceAssets({ allDomAssets, allNetworkBuffers, baseOrigin, outDir, maxAssets = 200 }) {
  console.log(`\n[Harvesting] Processing all page assets into source paths inside ${outDir}/...`);

  const assetMap = new Map();

  for (const item of allDomAssets) {
    try {
      const u = new URL(item.url, baseOrigin).href;
      if (/google-analytics|googletagmanager|facebook\.com\/tr|doubleclick|clarity\.ms/i.test(u)) continue;
      const pageSlug = item.pageSlug || 'home';

      if (!assetMap.has(u)) {
        assetMap.set(u, {
          url: u,
          localRelPath: resolveAssetSourceRelativePath(u, baseOrigin),
          alt: item.alt || '',
          naturalWidth: item.naturalWidth || 0,
          naturalHeight: item.naturalHeight || 0,
          type: item.type || 'image',
          foundOnPages: [pageSlug]
        });
      } else {
        const existing = assetMap.get(u);
        if (item.naturalWidth > existing.naturalWidth) existing.naturalWidth = item.naturalWidth;
        if (item.naturalHeight > existing.naturalHeight) existing.naturalHeight = item.naturalHeight;
        if (item.alt && !existing.alt) existing.alt = item.alt;
        if (!existing.foundOnPages.includes(pageSlug)) existing.foundOnPages.push(pageSlug);
      }
    } catch {}
  }

  for (const [netUrl, net] of allNetworkBuffers.entries()) {
    try {
      const u = new URL(netUrl, baseOrigin).href;
      if (/google-analytics|googletagmanager|facebook\.com\/tr|doubleclick|clarity\.ms/i.test(u)) continue;

      if (!assetMap.has(u)) {
        assetMap.set(u, {
          url: u,
          localRelPath: resolveAssetSourceRelativePath(u, baseOrigin),
          alt: '',
          naturalWidth: 0,
          naturalHeight: 0,
          type: net.contentType.includes('image') ? 'image' : (net.contentType.includes('css') ? 'stylesheet' : 'asset'),
          foundOnPages: ['global']
        });
      }
    } catch {}
  }

  const assetList = Array.from(assetMap.values()).slice(0, maxAssets);
  console.log(`  Identified ${assetList.length} unique asset file(s) to place into source locations.`);

  const catalog = [];
  const writtenUrlMap = new Map();
  let assetCounter = 1;

  for (const asset of assetList) {
    const fullDiskPath = path.join(outDir, asset.localRelPath);
    fs.mkdirSync(path.dirname(fullDiskPath), { recursive: true });

    let buffer = null;
    let contentType = '';

    if (allNetworkBuffers.has(asset.url)) {
      const cached = allNetworkBuffers.get(asset.url);
      buffer = cached.buffer;
      contentType = cached.contentType;
    } else {
      try {
        const res = await fetchBuffer(asset.url, 12000);
        buffer = res.buffer;
        contentType = res.contentType;
      } catch {}
    }

    if (!buffer || buffer.length === 0) continue;

    try {
      fs.writeFileSync(fullDiskPath, buffer);
      writtenUrlMap.set(asset.url, asset.localRelPath);
    } catch {
      continue;
    }

    let dims = (asset.naturalWidth && asset.naturalHeight)
      ? { width: asset.naturalWidth, height: asset.naturalHeight }
      : getImageDimensionsFromBuffer(buffer);

    const isSvg = asset.url.endsWith('.svg') || (contentType && contentType.includes('svg'));
    const isDoc = asset.url.endsWith('.pdf') || (contentType && contentType.includes('pdf')) || /\.(docx?|xlsx?)$/i.test(asset.url);

    let qualityStatus = 'high-res';
    let dimensionStr = '';

    if (isSvg) {
      qualityStatus = dimensionStr = 'vector';
    } else if (isDoc) {
      qualityStatus = dimensionStr = 'document';
    } else if (dims && dims.width && dims.height) {
      dimensionStr = `${dims.width}x${dims.height}`;
      qualityStatus = dims.width >= 1200 ? 'high-res' : 'needs-replacement';
    } else {
      dimensionStr = 'unspecified';
      qualityStatus = 'needs-replacement';
    }

    catalog.push({
      id: `leg-${String(assetCounter++).padStart(2, '0')}`,
      url: asset.url,
      path: asset.localRelPath,
      sizeBytes: buffer.length,
      dimensions: dims && dims.width && dims.height ? { width: dims.width, height: dims.height } : null,
      dimensionStr,
      qualityStatus,
      alt: asset.alt,
      foundOnPages: asset.foundOnPages
    });
  }

  console.log(`  ✓ Successfully wrote ${catalog.length} asset(s) to source locations in ${outDir}/`);
  return { catalog, writtenUrlMap };
}

module.exports = {
  getImageDimensionsFromBuffer,
  resolveAssetSourceRelativePath,
  harvestAndPlaceAssets
};
