/**
 * CMS Media & Image Uploader
 *
 * Scans content seed payloads for local image paths, uploads them to NWW CMS
 * via multipart/form-data, and substitutes local paths with live remote CDN URLs.
 *
 * In dry-run mode (apply: false), verifies local image files exist on disk,
 * checks file size and format, and returns simulated CDN URLs without network writes.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// In-memory upload cache to prevent duplicate uploads of the same asset: localPath -> remoteUrl
const uploadCache = new Map();

/**
 * Common image MIME types by file extension.
 */
const MIME_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

/**
 * Checks if a string value appears to be a local image file reference.
 *
 * @param {any} val
 * @returns {boolean}
 */
export function isLocalImagePath(val) {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return false;
  }
  const ext = path.extname(trimmed.split('?')[0].split('#')[0]).toLowerCase();
  return Boolean(MIME_TYPES[ext]);
}

/**
 * Detects the MIME type of a file by extension.
 *
 * @param {string} filePath
 * @returns {string}
 */
export function detectMimeType(filePath) {
  const ext = path.extname(filePath.toLowerCase());
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Resolves a local image path to an absolute path on disk by probing candidate directories.
 *
 * @param {string} rawPath
 * @param {string[]} [candidateDirs=[]]
 * @returns {string | null}
 */
export function resolveLocalImageFile(rawPath, candidateDirs = []) {
  if (!rawPath) return null;
  const clean = rawPath.split('?')[0].split('#')[0];

  // If already absolute and exists
  if (path.isAbsolute(clean) && fs.existsSync(clean)) {
    return path.normalize(clean);
  }

  // Probe relative to candidate directories
  for (const dir of candidateDirs) {
    if (!dir) continue;
    const resolved = path.resolve(dir, clean);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return path.normalize(resolved);
    }
  }

  // Probe relative to current working directory and common asset roots
  const commonRoots = [
    process.cwd(),
    path.join(process.cwd(), 'client-context'),
    path.join(process.cwd(), 'site', 'public'),
    path.join(process.cwd(), 'site', 'public', 'assets'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public', 'assets'),
    path.join(process.cwd(), 'assets-source'),
  ];

  for (const root of commonRoots) {
    const resolved = path.resolve(root, clean.replace(/^\/+/, ''));
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return path.normalize(resolved);
    }
  }

  return null;
}

/**
 * Uploads a local image file to NWW CMS using multipart/form-data.
 *
 * @param {string} filePath Absolute or resolvable path to local image
 * @param {object} envConfig { serverUrl, cmsToken }
 * @param {object} [options={}]
 * @param {boolean} [options.apply=false] If false, simulates upload (dry-run)
 * @param {string[]} [options.candidateDirs=[]] Directory search paths
 * @returns {Promise<{ url: string, status: string, originalPath: string, sizeBytes?: number, error?: string }>}
 */
export async function uploadImageToCms(filePath, envConfig, options = {}) {
  const { apply = false, candidateDirs = [] } = options;
  const { serverUrl, cmsToken } = envConfig;

  const resolved = resolveLocalImageFile(filePath, candidateDirs);
  if (!resolved) {
    return {
      url: filePath,
      status: 'NOT_FOUND',
      originalPath: filePath,
      error: `Local image file could not be found on disk: "${filePath}"`,
    };
  }

  // Check upload cache
  if (uploadCache.has(resolved)) {
    return {
      url: uploadCache.get(resolved),
      status: 'CACHED',
      originalPath: filePath,
      sizeBytes: fs.statSync(resolved).size,
    };
  }

  const stat = fs.statSync(resolved);
  const mimeType = detectMimeType(resolved);
  const baseName = path.basename(resolved);

  if (!apply) {
    // Dry-run simulated upload URL
    const simulatedUrl = `${serverUrl.replace(/\/+$/, '')}/assets/uploads/${baseName}`;
    uploadCache.set(resolved, simulatedUrl);
    return {
      url: simulatedUrl,
      status: 'DRY_RUN_VALIDATED',
      originalPath: filePath,
      sizeBytes: stat.size,
    };
  }

  if (!cmsToken) {
    throw new Error(`Cannot upload image "${baseName}": CMS_TOKEN is missing in environment.`);
  }

  const buffer = fs.readFileSync(resolved);
  const blob = new Blob([buffer], { type: mimeType });

  const form = new FormData();
  form.append('file', blob, baseName);
  form.append('image', blob, baseName);

  // Candidate upload endpoints supported by NWW CMS
  const uploadEndpoints = [
    `${serverUrl}/api/media/upload`,
    `${serverUrl}/api/upload`,
    `${serverUrl}/api/website-media/upload`,
    `${serverUrl}/api/file/upload`,
    `${serverUrl}/api/asset/upload`,
  ];

  let lastError = null;
  for (const endpoint of uploadEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmsToken}`,
          'x-site-key': cmsToken,
        },
        body: form,
      });

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const uploadedUrl = (
          json.url ||
          json.fileUrl ||
          json.secure_url ||
          json.path ||
          json.data?.url ||
          json.data?.fileUrl ||
          json.data?.secure_url ||
          json.data?.path ||
          null
        );

        if (uploadedUrl) {
          const finalUrl = uploadedUrl.startsWith('http')
            ? uploadedUrl
            : `${serverUrl.replace(/\/+$/, '')}${uploadedUrl.startsWith('/') ? '' : '/'}${uploadedUrl}`;

          uploadCache.set(resolved, finalUrl);
          return {
            url: finalUrl,
            status: 'UPLOADED',
            originalPath: filePath,
            sizeBytes: stat.size,
          };
        }
      }
      lastError = new Error(`HTTP ${res.status} from ${endpoint}`);
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback: If CMS upload endpoints fail or are unavailable, warn and preserve
  console.warn(`[ImageUploader Warning] Upload failed for "${baseName}": ${lastError?.message}. Retaining reference.`);
  return {
    url: filePath,
    status: 'FAILED',
    originalPath: filePath,
    error: lastError?.message || 'Upload rejected by all endpoints',
  };
}

/**
 * Recursively inspects a seed payload object, identifies local image references,
 * uploads them, and substitutes local paths with the remote URLs.
 *
 * @param {object} item Seed payload
 * @param {string} [seedFilePath]
 * @param {object} envConfig
 * @param {boolean} [apply=false]
 * @param {object} [options={}]
 * @returns {Promise<{ payload: object, uploads: Array<object> }>}
 */
export async function processSeedImages(item, seedFilePath, envConfig, apply = false, options = {}) {
  const clone = JSON.parse(JSON.stringify(item));
  const candidateDirs = [];
  if (seedFilePath) {
    candidateDirs.push(path.dirname(seedFilePath));
  }
  if (options.srcDir) {
    candidateDirs.push(options.srcDir);
  }

  const uploads = [];

  async function resolveAndUpload(val) {
    if (!isLocalImagePath(val)) return val;
    const res = await uploadImageToCms(val, envConfig, { apply, candidateDirs });
    uploads.push(res);
    return res.url || val;
  }

  // Top-level single image fields
  const imageFields = ['cover_image', 'image', 'ogImage', 'author_image', 'avatar', 'icon', 'thumbnail'];
  for (const field of imageFields) {
    if (clone[field]) {
      clone[field] = await resolveAndUpload(clone[field]);
    }
  }

  // Author object
  if (clone.author && typeof clone.author === 'object') {
    if (clone.author.image) {
      clone.author.image = await resolveAndUpload(clone.author.image);
    }
    if (clone.author.avatar) {
      clone.author.avatar = await resolveAndUpload(clone.author.avatar);
    }
  }

  // Images array (Gallery, Project, Product)
  if (Array.isArray(clone.images)) {
    for (let i = 0; i < clone.images.length; i++) {
      const entry = clone.images[i];
      if (typeof entry === 'string') {
        clone.images[i] = await resolveAndUpload(entry);
      } else if (entry && typeof entry === 'object') {
        if (entry.image) entry.image = await resolveAndUpload(entry.image);
        if (entry.src) entry.src = await resolveAndUpload(entry.src);
      }
    }
  }

  // HTML Rich-Text content: search for <img src="..." />
  if (typeof clone.content === 'string') {
    const imgRegex = /<img\b([^>]*?)\bsrc=(["'])(.*?)\2([^>]*?)>/gi;
    let match;
    const replacements = [];

    while ((match = imgRegex.exec(clone.content)) !== null) {
      const originalSrc = match[3];
      if (isLocalImagePath(originalSrc)) {
        replacements.push(originalSrc);
      }
    }

    for (const src of replacements) {
      const remote = await resolveAndUpload(src);
      if (remote && remote !== src) {
        clone.content = clone.content.replaceAll(src, remote);
      }
    }
  }

  return { payload: clone, uploads };
}

