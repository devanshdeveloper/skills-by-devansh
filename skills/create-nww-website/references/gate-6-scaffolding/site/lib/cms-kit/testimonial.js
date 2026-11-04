// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/testimonial.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Testimonial model helper providing class-based static query and formatting methods.
 */
export class Testimonial {
  /**
   * Fetches a single published testimonial by its ID or slug.
   *
   * @param {string} idOrSlug - Unique identifier or slug
   * @returns {Promise<any|null>} Testimonial document or null
   */
  static async readOne(idOrSlug) {
    if (!idOrSlug) return null;
    const cleanId = encodeURIComponent(String(idOrSlug).trim());

    const res = await ContentHelper.fetch(
      `/api/testimonial/paginate?slug=${cleanId}&status=published`,
      { resource: 'testimonial' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published testimonials.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=10] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 10, status = 'published' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const res = await ContentHelper.fetch(
      `/api/testimonial/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'testimonial' }
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
   * Fetches slugs/IDs for published testimonials.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug/ID strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Testimonial.paginate({ page: 1, limit });
    return items.map((t) => t.slug || t._id || t.id).filter(Boolean);
  }

  /**
   * Retrieves related testimonials, excluding the current testimonial.
   *
   * @param {object} current - Current testimonial document
   * @param {number} [limit=3] - Maximum items to return
   * @returns {Promise<Array<any>>} Sibling testimonials
   */
  static async getRelated(current, limit = 3) {
    if (!current) return [];
    const currentId = current._id || current.id || current.slug;
    const { items } = await Testimonial.paginate({ page: 1, limit: limit + 5 });

    return items
      .filter((t) => (t._id || t.id || t.slug) !== currentId)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for a single testimonial route.
   *
   * @param {string} idOrSlug - Testimonial identifier
   * @param {object} [options={}] - Additional metadata options
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(idOrSlug, options = {}) {
    const item = await Testimonial.readOne(idOrSlug);
    if (!item) {
      return {
        title: 'Review Not Found',
        robots: { index: false, follow: false },
      };
    }

    const author = item.author || item.name || 'Client Review';
    const title = `${author} Review`;
    const description = item.content || item.quote || item.message || '';

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/testimonials/${item.slug || idOrSlug}`,
      image: item.image || item.avatar,
      parentImages: options.parentImages || [],
      type: 'website',
    });
  }

  /**
   * Generates Schema.org Review structured data with full field coverage.
   *
   * @param {object} item - Testimonial document
   * @returns {object} Schema.org Review JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    return SEOHelper.buildReviewSchema(item);
  }

  /**
   * Builds dynamic sitemap entries for all published testimonials.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Testimonial.paginate({ page: 1, limit: 100 });

    return items.map((t) => ({
      url: `${baseUrl}/testimonials/${t.slug || t._id || t.id}`,
      lastModified: new Date(t.updatedAt || t.createdAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  }

  /**
   * Generates a markdown feed for AI indexing (llms.txt compatible format).
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<string>} Structured Markdown string
   */
  static async getLLMsTxt(siteUrl) {
    const siteName = SiteConfig.getName();
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Testimonial.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Client Reviews & Testimonials\n\n`;
    markdown += `> Verified client feedback and endorsements for ${siteName}.\n\n`;
    markdown += `## Reviews\n\n`;

    for (const t of items) {
      const author = t.author || t.name || 'Client';
      const quote = t.content || t.quote || '';
      markdown += `- **${author}**: "${quote}" (${baseUrl}/testimonials/${t.slug || t._id || t.id})\n`;
    }

    return markdown;
  }
}

