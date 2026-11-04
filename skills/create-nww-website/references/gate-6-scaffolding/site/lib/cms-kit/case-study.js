// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/case-study.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * CaseStudy model helper providing class-based static query and formatting methods
 * for enterprise client case studies.
 */
export class CaseStudy {
  /**
   * Fetches a single published case study document by its slug.
   *
   * @param {string} slug - Unique case study slug
   * @returns {Promise<any|null>} Case study document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-case-study/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'case-study' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published case studies.
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
      `/api/website-case-study/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'case-study' }
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
   * Fetches slugs for published case studies to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await CaseStudy.paginate({ page: 1, limit });
    return items.map((c) => c.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for a single case study route segment.
   *
   * @param {string} slug - Case study slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await CaseStudy.readOne(slug);
    if (!item) {
      return {
        title: 'Case Study Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = `${item.title} | ${item.clientName || 'Client'} Case Study`;
    const description = item.description || `Read how we partnered with ${item.clientName || 'clients'} to deliver results.`;
    const image = item.image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/case-studies/${item.slug}`,
      image,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org Article structured data for a case study.
   *
   * @param {object} item - Case study document
   * @returns {object} Schema.org Article JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    return SEOHelper.generateJSONLD({
      title: item.title,
      description: item.description,
      image: item.image,
      url: `/case-studies/${item.slug}`,
    }, 'article');
  }

  /**
   * Builds dynamic sitemap entries for all published case studies.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await CaseStudy.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/case-studies/${item.slug}`,
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
    const { items } = await CaseStudy.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Case Studies\n\n`;
    markdown += `> In-depth client success narratives and results for ${siteName}.\n\n`;
    markdown += `## Case Studies\n\n`;

    for (const item of items) {
      const summary = item.description || '';
      const client = item.clientName ? ` (${item.clientName})` : '';
      markdown += `- [${item.title}](${baseUrl}/case-studies/${item.slug})${client}${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

