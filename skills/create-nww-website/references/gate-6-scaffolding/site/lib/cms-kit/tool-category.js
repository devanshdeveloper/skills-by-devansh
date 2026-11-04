// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/tool-category.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * ToolCategory model helper providing class-based static query, hierarchical category navigation,
 * SEO metadata, JSON-LD structured data, sitemaps, and feeds.
 */
export class ToolCategory {
  /**
   * Fetches a single published tool category document by its unique slug.
   *
   * @param {string} slug - Unique category slug (e.g. 'finance-calculators', 'developer-utilities')
   * @returns {Promise<any|null>} Tool category document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-tool-category/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'tool-category' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const category = items[0] || null;

    if (!category) return null;
    if (category.status && category.status !== 'published') return null;

    return category;
  }

  /**
   * Fetches a paginated list of published tool categories.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=20] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.search] - Optional keyword search
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 20, status = 'published', search } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    let query = `/api/website-tool-category/paginate?page=${p}&limit=${l}&status=${status}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;

    const res = await ContentHelper.fetch(query, { resource: 'tool-category' });

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
   * Fetches slugs for published tool categories to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await ToolCategory.paginate({ page: 1, limit });
    return items.map((c) => c.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for a single tool category route.
   *
   * @param {string} slug - Category slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const category = await ToolCategory.readOne(slug);
    if (!category) {
      return {
        title: 'Category Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = category.metaTitle || `${category.title} | Online Tools`;
    const description = category.metaDescription || category.description || `Browse free web tools in ${category.title}.`;
    const image = (Array.isArray(category.images) && category.images[0]) || null;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/tools/category/${category.slug}`,
      image,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Generates Schema.org CollectionPage structured data for a tool category.
   *
   * @param {object} category - Category document
   * @returns {object} Schema.org CollectionPage JSON-LD object
   */
  static generateJSONLD(category) {
    if (!category) return {};
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = `/tools/category/${category.slug || ''}`;
    const url = `${siteUrl.replace(/\/$/, '')}${path}`;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.title,
      description: category.metaDescription || category.description || `${category.title} tools on ${siteName}`,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
      },
    };

    if (Array.isArray(category.images) && category.images.length > 0) {
      schema.image = category.images[0];
    }

    // Optional embedded FAQ schema
    if (Array.isArray(category.faqs) && category.faqs.length > 0) {
      schema.mainEntity = category.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      }));
    }

    return schema;
  }

  /**
   * Builds dynamic sitemap entries for all published tool categories.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await ToolCategory.paginate({ page: 1, limit: 100 });

    return items.map((category) => ({
      url: `${baseUrl}/tools/category/${category.slug}`,
      lastModified: new Date(category.updatedAt || category.createdAt || Date.now()),
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
    const { items } = await ToolCategory.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Tool Categories\n\n`;
    markdown += `> Groupings and catalogs of web utilities available on ${siteName}.\n\n`;
    markdown += `## Categories\n\n`;

    for (const category of items) {
      const summary = category.description || category.metaDescription || '';
      markdown += `- [${category.title}](${baseUrl}/tools/category/${category.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

