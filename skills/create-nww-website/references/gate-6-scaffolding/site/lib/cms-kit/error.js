// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/error.js: copy-ready CMS kit source. Do not edit site copies in place.

/**
 * Sanitized Error class for NWW CMS operations.
 * Strips bearer tokens, secrets, and credential keys from error messages and stack traces
 * to prevent accidental leakages in console logs, server responses, or error monitoring tools.
 */
export class CMSError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} [status=500] - Associated HTTP status code
   * @param {Error|null} [originalError=null] - Optional underlying cause
   */
  constructor(message, status = 500, originalError = null) {
    const sanitized = CMSError.sanitize(message);
    super(sanitized);
    this.name = 'CMSError';
    this.status = status;
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${CMSError.sanitize(originalError.stack)}`;
    }
  }

  /**
   * Redacts credential tokens, bearer strings, and long alphanumeric secrets.
   * @param {string} text - Raw input string
   * @returns {string} Sanitized string with masked secrets
   */
  static sanitize(text) {
    if (typeof text !== 'string') return String(text);
    return text
      .replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED]')
      .replace(/x-site-key:\s*[A-Za-z0-9_.-]+/gi, 'x-site-key: [REDACTED]')
      .replace(/siteKey=[A-Za-z0-9_.-]+/gi, 'siteKey=[REDACTED]')
      .replace(/(?:REVALIDATE_SECRET|CMS_TOKEN|CMS_API_KEY)=[^\s&]+/gi, '$1=[REDACTED]');
  }
}

