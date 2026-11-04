// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/gallery.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Gallery model helper providing class-based static query and formatting methods
 * for visual portfolios, photo galleries, and media albums.
 */
export class Gallery {
  /**
   * Fetches a single published gallery album by its slug.
   *
   * @param {string} slug - Unique gallery slug
   * @returns {Promise<any|null>} Gallery document or null
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-gallery/paginate?slug=${cleanSlug}&status=active`,
      { resource: 'gallery' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'active') return null;

    return item;
  }

  /**
   * Fetches a paginated list of active gallery albums.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='active'] - Workflow status filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'active' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    const res = await ContentHelper.fetch(
      `/api/website-gallery/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'gallery' }
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
   * Fetches slugs for active galleries to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Gallery.paginate({ page: 1, limit });
    return items.map((g) => g.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for a single gallery album.
   *
   * @param {string} slug - Gallery slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Gallery.readOne(slug);
    if (!item) {
      return {
        title: 'Gallery Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = `${item.title} | Photo Gallery`;
    const description = item.description || `Browse images from our ${item.title} gallery album.`;
    const image = Array.isArray(item.images) && item.images[0]?.image ? item.images[0].image : null;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/gallery/${item.slug}`,
      image,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Builds dynamic sitemap entries for all active galleries.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Gallery.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/gallery/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  }
}

