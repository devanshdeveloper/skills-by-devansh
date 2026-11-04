// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/page-config.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * PageConfig model helper for querying page-level CMS overrides, generating route metadata,
 * structured data, dynamic sitemaps, and indexing feeds.
 */
export class PageConfig {
  /**
   * Fetches a single page configuration document by its unique slug.
   *
   * @param {string} slug - Unique page identifier (e.g. 'home', 'about', 'services')
   * @returns {Promise<any|null>} Page configuration object or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());
    const res = await ContentHelper.fetch(
      `/api/website-page-config/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'page-config' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const config = items[0] || null;
    if (!config) return null;
    if (config.status && config.status !== 'published') return null;

    return config;
  }

  /**
   * Fetches a paginated list of published page configurations.
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
      `/api/website-page-config/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'page-config' }
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
   * Fetches slugs for all published page configurations.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await PageConfig.paginate({ page: 1, limit });
    return items.map((p) => p.slug).filter(Boolean);
  }

  /**
   * Retrieves sibling page configurations, excluding the current page.
   *
   * @param {object|string} current - Current config object or slug string
   * @param {number} [limit=4] - Maximum sibling pages to return
   * @returns {Promise<Array<any>>} Sibling page configurations
   */
  static async getRelated(current, limit = 4) {
    const currentSlug = typeof current === 'string' ? current : current?.slug;
    const { items } = await PageConfig.paginate({ page: 1, limit: limit + 5 });

    return items
      .filter((p) => p.slug !== currentSlug)
      .slice(0, limit);
  }

  /**
   * Builds complete Next.js Metadata for a page route by merging CMS page config with fallbacks.
   *
   * @param {string} slug - Page slug to look up
   * @param {object} [fallback={}] - Default metadata properties if CMS document is missing
   * @param {string} [fallback.title] - Default title
   * @param {string} [fallback.description] - Default description
   * @param {string} [fallback.path] - Default relative route path
   * @param {string} [fallback.image] - Default preview image
   * @param {any[]} [fallback.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, fallback = {}) {
    const config = await PageConfig.readOne(slug);

    const title = config?.metaTitle || config?.title || fallback.title || 'Page';
    const description = config?.metaDescription || config?.description || fallback.description || '';
    const image = config?.ogImage || config?.cover_image || fallback.image;
    const path = fallback.path || config?.path || (slug === 'home' ? '/' : `/${slug}`);

    const metadata = SEOHelper.generateMetadata({
      title,
      description,
      path,
      image,
      parentImages: fallback.parentImages || [],
      type: 'website',
    });

    if (config?.noIndex || config?.noFollow) {
      metadata.robots = {
        index: !config.noIndex,
        follow: !config.noFollow,
      };
    }

    return metadata;
  }

  /**
   * Generates complete Schema.org structured data for a page configuration.
   * Supports WebPage, AboutPage, ContactPage, and FAQPage with full field coverage.
   *
   * @param {object|string} configOrSlug - Page config document or slug string
   * @returns {Promise<object>|object} Schema.org JSON-LD object
   */
  static async generateJSONLD(configOrSlug) {
    const config = typeof configOrSlug === 'string'
      ? await PageConfig.readOne(configOrSlug)
      : configOrSlug;

    if (!config) return {};

    const type = config.structuredDataType || (config.slug === 'about' ? 'AboutPage' : config.slug === 'contact' ? 'ContactPage' : 'WebPage');

    // If page contains FAQs, return FAQPage schema or composite graph
    if (Array.isArray(config.faqs) && config.faqs.length > 0) {
      const faqSchema = SEOHelper.buildFAQSchema(config.faqs);
      if (type === 'FAQPage') return faqSchema;

      const pageSchema = SEOHelper.buildWebPageSchema({
        ...config,
        type,
        path: config.path || (config.slug === 'home' ? '/' : `/${config.slug}`),
      });

      return {
        '@context': 'https://schema.org',
        '@graph': [pageSchema, faqSchema],
      };
    }

    return SEOHelper.buildWebPageSchema({
      ...config,
      type,
      path: config.path || (config.slug === 'home' ? '/' : `/${config.slug}`),
    });
  }

  /**
   * Compiles dynamic sitemap entries for all published page configurations.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await PageConfig.paginate({ page: 1, limit: 100 });

    return items.map((config) => {
      const isHome = config.slug === 'home' || config.path === '/';
      const url = isHome ? baseUrl : `${baseUrl}${config.path?.startsWith('/') ? config.path : `/${config.slug}`}`;
      return {
        url,
        lastModified: new Date(config.updatedAt || config.createdAt || Date.now()),
        changeFrequency: isHome ? 'daily' : 'weekly',
        priority: isHome ? 1.0 : 0.8,
      };
    });
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
    const { items } = await PageConfig.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Navigation & Pages\n\n`;
    markdown += `> Core site structure and overview pages for ${siteName}.\n\n`;
    markdown += `## Site Pages\n\n`;

    for (const config of items) {
      const isHome = config.slug === 'home' || config.path === '/';
      const url = `${baseUrl}${isHome ? '' : (config.path || `/${config.slug}`)}`;
      const summary = config.metaDescription || config.ctaHeadline || '';
      markdown += `- [${config.title || config.slug}](${url})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}
