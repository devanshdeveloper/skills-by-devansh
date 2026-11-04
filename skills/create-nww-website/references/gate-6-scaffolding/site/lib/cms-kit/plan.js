// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/plan.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';

/**
 * Plan (Pricing) model helper providing class-based static query and formatting methods
 * for subscription tiers and pricing plans.
 */
export class Plan {
  /**
   * Fetches a paginated list of published pricing plans.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=20] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 20, status = 'published' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const res = await ContentHelper.fetch(
      `/api/website-plan/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'plan' }
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
   * Fetches all published plans sorted by pricing.
   *
   * @returns {Promise<any[]>} Array of plan objects
   */
  static async getAll() {
    const { items } = await Plan.paginate({ limit: 50 });
    return items;
  }
}

