// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/industry.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Industry model helper providing class-based static query and formatting methods
 * for vertical industry solutions and market domain pages.
 */
export class Industry {
  /**
   * Fetches a single published industry solution document by its slug.
   *
   * @param {string} slug - Unique industry slug
   * @returns {Promise<any|null>} Industry document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-industry/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'industry' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published industries.
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
      `/api/website-industry/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'industry' }
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
   * Fetches slugs for published industry solutions to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Industry.paginate({ page: 1, limit });
    return items.map((i) => i.slug).filter(Boolean);
  }

  /**
   * Retrieves related or sibling industries, excluding the current item.
   *
   * @param {object} currentIndustry - Current industry document
   * @param {number} [limit=3] - Maximum related items to return
   * @returns {Promise<Array<any>>} Sibling industry documents
   */
  static async getRelated(currentIndustry, limit = 3) {
    if (!currentIndustry) return [];
    const res = await Industry.paginate({ page: 1, limit: limit + 5 });
    const currentId = currentIndustry._id || currentIndustry.id;

    return res.items
      .filter((item) => (item._id || item.id) !== currentId && item.slug !== currentIndustry.slug)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for an industry solution route segment.
   *
   * @param {string} slug - Industry slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Industry.readOne(slug);
    if (!item) {
      return {
        title: 'Industry Solution Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = item.name ? `${item.name} Solutions | ${SiteConfig.getName()}` : 'Industry Solution';
    const description = item.description || `Specialized digital capabilities and solutions tailored for the ${item.name} sector.`;
    const image = item.image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/industries/${item.slug}`,
      image,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org Service / Solution structured data for an industry page.
   *
   * @param {object} industry - Industry document
   * @returns {object} Schema.org JSON-LD object
   */
  static generateJSONLD(industry) {
    if (!industry) return {};
    const siteUrl = SiteConfig.getUrl().replace(/\/$/, '');

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: industry.name,
      description: industry.description,
      url: `${siteUrl}/industries/${industry.slug}`,
      image: industry.image || undefined,
      provider: {
        '@type': 'Organization',
        name: SiteConfig.getName(),
        url: siteUrl,
      },
      areaServed: 'Worldwide',
    };
  }

  /**
   * Builds dynamic sitemap entries for all published industries.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Industry.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/industries/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'weekly',
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
    const { items } = await Industry.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Industry Solutions\n\n`;
    markdown += `> Domain expertise and digital solutions by industry vertical from ${siteName}.\n\n`;
    markdown += `## Industries\n\n`;

    for (const item of items) {
      const summary = item.description || '';
      markdown += `- [${item.name}](${baseUrl}/industries/${item.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

