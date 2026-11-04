// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/portfolio.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Portfolio model helper providing class-based static query and formatting methods
 * for showcase creative portfolio items, visual projects, and client deliverables.
 */
export class Portfolio {
  /**
   * Fetches a single published portfolio showcase document by its slug.
   *
   * @param {string} slug - Unique portfolio slug
   * @returns {Promise<any|null>} Portfolio document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-portfolio/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'portfolio' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published portfolio items with optional filtering.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.industry] - Industry ObjectId or slug filter
   * @param {string} [options.service] - Service ObjectId or slug filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'published', industry, service } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    let query = `/api/website-portfolio/paginate?page=${p}&limit=${l}&status=${status}`;
    if (industry) query += `&industry=${encodeURIComponent(industry)}`;
    if (service) query += `&service=${encodeURIComponent(service)}`;

    const res = await ContentHelper.fetch(query, { resource: 'portfolio' });

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
   * Fetches slugs for published portfolio items to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Portfolio.paginate({ page: 1, limit });
    return items.map((p) => p.slug).filter(Boolean);
  }

  /**
   * Retrieves related portfolio items sharing industry or service, excluding the current item.
   *
   * @param {object} currentItem - Current portfolio document
   * @param {number} [limit=3] - Maximum related items to return
   * @returns {Promise<Array<any>>} Sibling portfolio documents
   */
  static async getRelated(currentItem, limit = 3) {
    if (!currentItem) return [];
    const industry = currentItem.industry?._id || currentItem.industry;
    const res = await Portfolio.paginate({ page: 1, limit: limit + 5, industry });
    const currentId = currentItem._id || currentItem.id;

    return res.items
      .filter((item) => (item._id || item.id) !== currentId && item.slug !== currentItem.slug)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for a single portfolio route segment.
   *
   * @param {string} slug - Portfolio slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Portfolio.readOne(slug);
    if (!item) {
      return {
        title: 'Portfolio Showcase Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = `${item.title} | Showcase | ${SiteConfig.getName()}`;
    const description = item.description || `Explore our creative showcase and execution for ${item.title}.`;
    const image = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/portfolio/${item.slug}`,
      image,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org CreativeWork structured data for a portfolio project.
   *
   * @param {object} item - Portfolio document
   * @returns {object} Schema.org JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    const siteUrl = SiteConfig.getUrl().replace(/\/$/, '');

    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      headline: item.title,
      description: item.description,
      url: `${siteUrl}/portfolio/${item.slug}`,
      image: Array.isArray(item.images) ? item.images : [],
      creator: {
        '@type': 'Organization',
        name: SiteConfig.getName(),
        url: siteUrl,
      },
    };
  }

  /**
   * Builds dynamic sitemap entries for all published portfolio showcases.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Portfolio.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/portfolio/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
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
    const { items } = await Portfolio.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Portfolio Showcase\n\n`;
    markdown += `> Portfolio works, creative deliverables, and client projects from ${siteName}.\n\n`;
    markdown += `## Showcase Works\n\n`;

    for (const item of items) {
      const summary = item.description || '';
      markdown += `- [${item.title}](${baseUrl}/portfolio/${item.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

