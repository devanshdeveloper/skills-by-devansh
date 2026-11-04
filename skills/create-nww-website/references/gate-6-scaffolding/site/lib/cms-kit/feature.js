// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/feature.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';

/**
 * Feature model helper providing class-based static query methods for product / platform features.
 */
export class Feature {
  /**
   * Fetches a paginated list of active features.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=20] - Number of items per page
   * @param {string} [options.status='active'] - Workflow status filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 20, status = 'active' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const res = await ContentHelper.fetch(
      `/api/feature/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'feature' }
    );

    const rawItems = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const total = res?.data?.total || res?.pagination?.totalDocuments || res?.total || rawItems.length;
    const totalPages = res?.data?.totalPages || res?.pagination?.totalPages || Math.ceil(total / l) || 1;

    return {
      items: rawItems,
      total,
      page: p,
      limit: l,
      totalPages,
    };
  }

  /**
   * Fetches all active features for landing page showcases.
   *
   * @param {number} [limit=20] - Maximum features to fetch
   * @returns {Promise<any[]>} Array of feature objects
   */
  static async getAll(limit = 20) {
    const { items } = await Feature.paginate({ page: 1, limit });
    return items;
  }
}

