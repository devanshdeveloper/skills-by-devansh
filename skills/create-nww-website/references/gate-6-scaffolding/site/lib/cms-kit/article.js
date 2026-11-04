// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/article.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Article model helper providing class-based static query and formatting methods
 * for news articles, press releases, and editorial publications.
 */
export class Article {
  /**
   * Fetches a single published article by its slug.
   *
   * @param {string} slug - Unique article slug
   * @returns {Promise<any|null>} Article document or null
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-article/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'article' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published articles.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'published' } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    const res = await ContentHelper.fetch(
      `/api/website-article/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'article' }
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
   * Fetches slugs for published articles to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Article.paginate({ page: 1, limit });
    return items.map((a) => a.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for an article route segment.
   *
   * @param {string} slug - Article slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Article.readOne(slug);
    if (!item) {
      return {
        title: 'Article Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = item.title;
    const description = item.description;
    const image = item.image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/articles/${item.slug}`,
      image,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org Article / NewsArticle structured data.
   *
   * @param {object} item - Article document
   * @returns {object} Schema.org Article JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    return SEOHelper.buildArticleSchema({
      title: item.title,
      description: item.description,
      image: item.image,
      url: `/articles/${item.slug}`,
      author: item.author_name ? { name: item.author_name } : undefined,
      publishedAt: item.createdAt,
      modifiedAt: item.updatedAt,
      type: 'Article',
    });
  }

  /**
   * Builds dynamic sitemap entries for all published articles.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Article.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/articles/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }
}

