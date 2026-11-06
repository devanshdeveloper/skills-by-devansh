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

