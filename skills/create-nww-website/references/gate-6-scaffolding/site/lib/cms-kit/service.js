// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/service.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Service model helper providing class-based static query and formatting methods.
 */
export class Service {
  /**
   * Fetches a single published service document by its slug.
   *
   * @param {string} slug - Unique service slug
   * @returns {Promise<any|null>} Service document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-service/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'service' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const service = items[0] || null;

    if (!service) return null;
    if (service.status && service.status !== 'published') return null;

    return service;
  }

  /**
   * Fetches a paginated list of published services.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.category] - Filter by category
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'published', category } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    let query = `/api/website-service/paginate?page=${p}&limit=${l}&status=${status}`;
    if (category) query += `&category=${encodeURIComponent(category)}`;

    const res = await ContentHelper.fetch(query, { resource: 'service' });

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
   * Fetches slugs for published services to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Service.paginate({ page: 1, limit });
    return items.map((s) => s.slug).filter(Boolean);
  }

  /**
   * Retrieves related services sharing category, excluding current service.
   *
   * @param {object} currentService - Current service document
   * @param {number} [limit=3] - Maximum related services to return
   * @returns {Promise<Array<any>>} Sibling service items
   */
  static async getRelated(currentService, limit = 3) {
    if (!currentService) return [];
    const category = currentService.category || currentService.metadata?.category;
    const res = await Service.paginate({ page: 1, limit: limit + 5, category });
    const currentId = currentService._id || currentService.id;

    return res.items
      .filter((s) => (s._id || s.id) !== currentId && s.slug !== currentService.slug)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for a single service route segment.
   *
   * @param {string} slug - Service slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const service = await Service.readOne(slug);
    if (!service) {
      return {
        title: 'Service Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = service.metaTitle || `${service.title} | Services`;
    const description = service.metaDescription || service.summary || `Learn about our ${service.title} capabilities.`;
    const image = service.image || service.cover_image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/services/${service.slug}`,
      image,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Generates Schema.org Service structured data with full field coverage.
   *
   * @param {object} service - Service document
   * @returns {object} Schema.org Service JSON-LD object
   */
  static generateJSONLD(service) {
    if (!service) return {};
    return SEOHelper.buildServiceSchema(service);
  }

  /**
   * Builds dynamic sitemap entries for all published services.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Service.paginate({ page: 1, limit: 100 });

    return items.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: new Date(service.updatedAt || service.createdAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.8,
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
    const { items } = await Service.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Services\n\n`;
    markdown += `> Available professional services and offerings from ${siteName}.\n\n`;
    markdown += `## Services\n\n`;

    for (const service of items) {
      const summary = service.summary || service.description || '';
      markdown += `- [${service.title}](${baseUrl}/services/${service.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

