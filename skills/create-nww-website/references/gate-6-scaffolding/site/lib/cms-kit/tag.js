// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/tag.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';

/**
 * Tag model helper providing static query methods for website taxonomies,
 * content filtering tags, and classification badges.
 */
export class Tag {
  /**
   * Fetches active tags for filtering and navigation.
   *
   * @param {object} [options={}] - Query options
   * @param {string} [options.type='general'] - Taxonomy type category
   * @param {string} [options.status='active'] - Status filter ('active' or 'all')
   * @param {number} [options.limit=100] - Max tags to retrieve
   * @returns {Promise<Array<any>>} Array of tag objects
   */
  static async paginate({ type, status = 'active', limit = 100 } = {}) {
    let query = `/api/website-tag/paginate?limit=${Math.max(1, limit)}&status=${status}`;
    if (type) query += `&type=${encodeURIComponent(type)}`;

    const res = await ContentHelper.fetch(query, { resource: 'website-tag' });
    return res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
  }

  /**
   * Fetches a dropdown or lightweight label list of active tags.
   *
   * @param {object} [options={}] - Query options
   * @param {string} [options.type] - Optional taxonomy type
   * @returns {Promise<Array<{ label: string, value: string }>>}
   */
  static async dropdown({ type } = {}) {
    let query = `/api/website-tag/dropdown?status=active`;
    if (type) query += `&type=${encodeURIComponent(type)}`;

    const res = await ContentHelper.fetch(query, { resource: 'website-tag' });
    return res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
  }

  /**
   * Reads a single tag by its value (slug) or ObjectId.
   *
   * @param {string} valueOrId - Tag value string or ObjectId
   * @returns {Promise<any|null>} Tag document or null
   */
  static async readOne(valueOrId) {
    if (!valueOrId) return null;
    const clean = encodeURIComponent(String(valueOrId).trim());

    const res = await ContentHelper.fetch(
      `/api/website-tag/paginate?value=${clean}&status=active&limit=1`,
      { resource: 'website-tag' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return items[0] || null;
  }
}

