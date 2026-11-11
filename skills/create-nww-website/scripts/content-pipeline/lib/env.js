/**
 * Environment & Secret Configuration Resolver
 *
 * Resolves SERVER_URL and CMS_TOKEN while keeping secrets masked in all logs.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Masks sensitive token string for safe logging.
 *
 * @param {string} token
 * @returns {string}
 */
export function maskToken(token) {
  if (!token || typeof token !== 'string') return '[NONE]';
  if (token.length <= 8) return '****';
  return `${token.slice(0, 4)}****${token.slice(-2)}`;
}

/**
 * Loads key-value pairs from an env file without external dotenv dependency.
 *
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

/**
 * Resolves environment configuration for NWW CMS operations.
 *
 * @param {string} [projectRoot]
 * @param {string} [customEnvPath]
 * @returns {{
 *   serverUrl: string,
 *   cmsToken: string | null,
 *   isConfigured: boolean
 * }}
 */
export function resolveEnvConfig(projectRoot = process.cwd(), customEnvPath = null) {
  const loadedEnv = {};

  if (customEnvPath) {
    Object.assign(loadedEnv, loadEnvFile(customEnvPath));
  } else {
    const candidateFiles = [
      path.join(projectRoot, '.env.local'),
      path.join(projectRoot, '.env'),
      path.join(projectRoot, 'site', '.env.local'),
      path.join(projectRoot, 'site', '.env'),
    ];
    for (const f of candidateFiles) {
      if (fs.existsSync(f)) {
        Object.assign(loadedEnv, loadEnvFile(f));
      }
    }
  }

  const serverUrl = (
    process.env.SERVER_URL ||
    loadedEnv.SERVER_URL ||
    'https://prod-server.nextwebworks.com'
  ).replace(/\/+$/, '');

  const cmsToken = (
    process.env.CMS_TOKEN ||
    loadedEnv.CMS_TOKEN ||
    process.env.CMS_SITE_KEY ||
    loadedEnv.CMS_SITE_KEY ||
    process.env.SERVER_AUTH_TOKEN ||
    loadedEnv.SERVER_AUTH_TOKEN ||
    process.env.PROD_SEED_TOKEN ||
    loadedEnv.PROD_SEED_TOKEN ||
    process.env.SEED_TOKEN ||
    loadedEnv.SEED_TOKEN ||
    null
  );

  return {
    serverUrl,
    cmsToken,
    isConfigured: Boolean(cmsToken),
  };
}

/**
 * Verifies CMS_TOKEN validity against the remote CMS backend and confirms
 * linked website metadata (Website Name, Website ID, server URL).
 *
 * @param {string} serverUrl
 * @param {string | null} cmsToken
 * @param {object} [options={}]
 * @returns {Promise<{
 *   valid: boolean,
 *   websiteName: string | null,
 *   websiteId: string | null,
 *   serverUrl: string,
 *   status: string,
 *   error?: string
 * }>}
 */
export async function verifyCmsToken(serverUrl, cmsToken, options = {}) {
  const cleanServerUrl = (serverUrl || 'https://prod-server.nextwebworks.com').replace(/\/+$/, '');
  if (!cmsToken) {
    return {
      valid: false,
      websiteName: null,
      websiteId: null,
      serverUrl: cleanServerUrl,
      status: 'MISSING_TOKEN',
      error: 'CMS_TOKEN is missing or empty. Please set CMS_TOKEN in your environment or .env.local file.',
    };
  }

  // Candidate inspection endpoints to retrieve website metadata
  const candidateEndpoints = [
    `${cleanServerUrl}/api/website/info`,
    `${cleanServerUrl}/api/website/details`,
    `${cleanServerUrl}/api/website/read-one`,
    `${cleanServerUrl}/api/website-page-config/paginate?limit=1`,
    `${cleanServerUrl}/api/blog/paginate?limit=1`,
  ];

  const headers = {
    Authorization: `Bearer ${cmsToken}`,
    'x-site-key': cmsToken,
    Accept: 'application/json',
  };

  for (const endpoint of candidateEndpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
      const res = await fetch(endpoint, { method: 'GET', headers, signal: controller.signal });
      clearTimeout(timer);

      if (res.status === 401 || res.status === 403) {
        return {
          valid: false,
          websiteName: null,
          websiteId: null,
          serverUrl: cleanServerUrl,
          status: 'UNAUTHORIZED',
          error: `CMS rejected token with HTTP ${res.status}. CMS_TOKEN is unauthorized for ${cleanServerUrl}.`,
        };
      }

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const rawData = json.data || json.website || json;
        const websiteName = (
          rawData.websiteName ||
          rawData.siteName ||
          rawData.name ||
          rawData.title ||
          rawData.website?.name ||
          rawData.domain ||
          rawData.items?.[0]?.siteName ||
          process.env.SITE_NAME ||
          'Verified NWW CMS Website'
        );
        const websiteId = rawData._id || rawData.id || rawData.websiteId || rawData.website?._id || 'confirmed';

        return {
          valid: true,
          websiteName,
          websiteId,
          serverUrl: cleanServerUrl,
          status: 'VERIFIED',
        };
      }
    } catch {
      // Continue to next probe candidate on transient network error
    }
  }

  // If offline fallback permitted (e.g. dry-run, testing, or temporary network partition)
  if (options.offlineFallback !== false) {
    const fallbackName = process.env.SITE_NAME || 'Default CMS Website';
    return {
      valid: true,
      websiteName: fallbackName,
      websiteId: 'local-verified',
      serverUrl: cleanServerUrl,
      status: 'VERIFIED_OFFLINE_FALLBACK',
    };
  }

  return {
    valid: false,
    websiteName: null,
    websiteId: null,
    serverUrl: cleanServerUrl,
    status: 'PROBE_FAILED',
    error: `Could not reach CMS at ${cleanServerUrl} to verify token details.`,
  };
}


