// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/tool.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Tool model helper providing class-based static query, SEO metadata, JSON-LD schemas,
 * sitemaps, and feeds for interactive website tools.
 */
export class Tool {
  /**
   * Fetches a single published tool document by its unique slug.
   *
   * @param {string} slug - Unique tool slug (e.g. 'roi-calculator', 'image-compressor')
   * @returns {Promise<any|null>} Tool document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-tool/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'tool' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const tool = items[0] || null;

    if (!tool) return null;
    if (tool.status && tool.status !== 'published') return null;

    return tool;
  }

  /**
   * Fetches a paginated list of published website tools.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.search] - Optional keyword search
   * @param {string} [options.tag] - Optional tag ObjectId or slug
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'published', search, tag } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    let query = `/api/website-tool/paginate?page=${p}&limit=${l}&status=${status}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (tag) query += `&tag=${encodeURIComponent(tag)}`;

    const res = await ContentHelper.fetch(query, { resource: 'tool' });

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
   * Fetches slugs for published tools to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Tool.paginate({ page: 1, limit });
    return items.map((t) => t.slug).filter(Boolean);
  }

  /**
   * Retrieves related tools excluding the current tool.
   *
   * @param {object} currentTool - Current tool document
   * @param {number} [limit=3] - Maximum related tools to return
   * @returns {Promise<Array<any>>} Sibling tool items
   */
  static async getRelated(currentTool, limit = 3) {
    if (!currentTool) return [];
    const res = await Tool.paginate({ page: 1, limit: limit + 5 });
    const currentId = currentTool._id || currentTool.id;

    return res.items
      .filter((item) => (item._id || item.id) !== currentId && item.slug !== currentTool.slug)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for a single tool route segment.
   *
   * @param {string} slug - Tool slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const tool = await Tool.readOne(slug);
    if (!tool) {
      return {
        title: 'Tool Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = tool.metaTitle || `${tool.title} | Free Online Tool`;
    const description = tool.metaDescription || tool.description || `Use our free online ${tool.title}. Fast, secure, and browser-based.`;
    const image = tool.icon || tool.image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/tools/${tool.slug}`,
      image,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Generates Schema.org WebApplication structured data for a tool.
   *
   * @param {object} tool - Tool document
   * @returns {object} Schema.org WebApplication JSON-LD object
   */
  static generateJSONLD(tool) {
    if (!tool) return {};
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = `/tools/${tool.slug || ''}`;
    const url = `${siteUrl.replace(/\/$/, '')}${path}`;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.title,
      description: tool.metaDescription || tool.description || `${tool.title} by ${siteName}`,
      url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      provider: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
      },
    };

    if (tool.icon) {
      schema.image = tool.icon;
    }

    // Optional embedded FAQ schema
    if (Array.isArray(tool.faqs) && tool.faqs.length > 0) {
      schema.mainEntity = tool.faqs.map((faq) => ({
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
   * Builds dynamic sitemap entries for all published tools.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Tool.paginate({ page: 1, limit: 100 });

    return items.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: new Date(tool.updatedAt || tool.createdAt || Date.now()),
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
    const { items } = await Tool.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Interactive Tools\n\n`;
    markdown += `> Free web-based calculators and utility tools provided by ${siteName}.\n\n`;
    markdown += `## Available Tools\n\n`;

    for (const tool of items) {
      const summary = tool.description || tool.metaDescription || '';
      markdown += `- [${tool.title}](${baseUrl}/tools/${tool.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

