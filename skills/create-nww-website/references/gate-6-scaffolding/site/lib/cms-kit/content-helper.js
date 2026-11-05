// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/content-helper.js: copy-ready CMS kit source. Do not edit site copies in place.

import { CMSError } from './error.js';

/**
 * Low-level HTTP data access layer for NWW CMS backend.
 * Handles credential injection, App Router tag attachment, error redaction, and response normalization.
 */
export class ContentHelper {
  /** Default revalidation window in seconds */
  static REVALIDATE_SECONDS = 60;

  /**
   * Retrieves and validates server credentials.
   * @returns {{ serverUrl: string, siteKey: string }}
   * @private
   */
  static _getCredentials() {
    const rawUrl = (process.env.SERVER_URL || 'https://prod-server.nextwebworks.com').trim();
    const siteKey = (process.env.CMS_TOKEN || '').trim();

    const serverUrl = rawUrl.replace(/\/+$/, '');
    return { serverUrl, siteKey };
  }

  /**
   * Generates a canonical, deterministic Next.js cache tag for a CMS resource.
   * @param {string} resource - Resource name (e.g. 'blog', 'page-config')
   * @returns {string} Normalized tag (e.g. 'cms:blog')
   */
  static tagFor(resource) {
    const clean = String(resource || 'global').trim().toLowerCase();
    return `cms:${clean}`;
  }

  /**
   * Universal cached data retrieval client.
   *
   * @param {string} endpoint - Route path (e.g. '/api/blog/paginate?status=published')
   * @param {object} [options={}] - Options object
   * @param {string} [options.resource='global'] - Resource identifier for cache tagging
   * @param {RequestInit} [options.init={}] - Fetch RequestInit options
   * @param {number} [options.timeoutMs=10000] - Request timeout in milliseconds
   * @returns {Promise<any>} Parsed JSON response or null on 404
   * @throws {CMSError} If network or authorization fails
   */
  static async fetch(endpoint, options = {}) {
    const { resource = 'global', init = {}, timeoutMs = 10000 } = options;
    const { serverUrl, siteKey } = ContentHelper._getCredentials();

    if (!serverUrl) {
      console.warn(`[ContentHelper Warning] SERVER_URL missing. Skipping fetch to "${endpoint}".`);
      return null;
    }

    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${serverUrl}${cleanPath}`;
    const tag = ContentHelper.tagFor(resource);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = {
        'Accept': 'application/json',
        'User-Agent': 'NWW-NextJS-Client/1.0',
        ...(init.headers || {}),
      };

      if (siteKey) {
        headers['Authorization'] = `Bearer ${siteKey}`;
        headers['x-site-key'] = siteKey;
      }

      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers,
        next: {
          tags: [tag],
          revalidate: ContentHelper.REVALIDATE_SECONDS,
        },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new CMSError(
          `[ContentHelper] Request failed with HTTP ${res.status} ${res.statusText} at ${endpoint}`,
          res.status
        );
      }

      return await res.json();
    } catch (err) {
      if (err instanceof CMSError) throw err;
      if (err.name === 'AbortError') {
        throw new CMSError(`[ContentHelper] Request timed out after ${timeoutMs}ms at ${endpoint}`, 504, err);
      }
      throw new CMSError(`[ContentHelper] Network error fetching ${endpoint}: ${err.message}`, 500, err);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Basic string sanitizer removing active script or iframe elements from rich text.
   * @param {string} html - Raw HTML or rich text string
   * @returns {string} Sanitized string
   */
  static sanitizeHtml(html) {
    if (typeof html !== 'string') return '';
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }
}

