// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/site-config.js: copy-ready CMS kit source. Do not edit site copies in place.

import { CMSError } from './error.js';

/**
 * Centralized site-wide identity and domain configuration helper.
 * Provides a single canonical source for the site name and origin URL.
 */
export class SiteConfig {
  /**
   * Retrieves and validates the canonical site/brand name from SITE_NAME.
   * Throws a sanitized CMSError in production if missing.
   *
   * @returns {string} Configured site name
   * @throws {CMSError} If SITE_NAME is missing in production
   */
  static getName() {
    const name = process.env.SITE_NAME ? process.env.SITE_NAME.trim() : '';
    if (!name) {
      if (process.env.NODE_ENV === 'production') {
        throw new CMSError('[SiteConfig] Missing required environment variable: SITE_NAME.', 500);
      }
      console.warn('[SiteConfig Warning] SITE_NAME is not set in environment. Falling back to "Website".');
      return 'Website';
    }
    return name;
  }

  /**
   * Retrieves the canonical origin URL without trailing slash.
   * Reads SITE_URL with fallback to NEXT_PUBLIC_SITE_URL or localhost.
   *
   * @returns {string} Normalized origin URL (e.g. "https://example.com")
   */
  static getUrl() {
    const rawUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return rawUrl.trim().replace(/\/+$/, '');
  }
}

