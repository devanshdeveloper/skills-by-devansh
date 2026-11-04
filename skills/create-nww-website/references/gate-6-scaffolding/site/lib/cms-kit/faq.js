// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/faq.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * FAQ model helper providing class-based static query, Schema.org FAQPage generation,
 * metadata, sitemaps, and feeds.
 */
export class FAQ {
  /**
   * Fetches a single published FAQ document by its slug or ID.
   *
   * @param {string} idOrSlug - Unique FAQ slug or ID
   * @returns {Promise<any|null>} FAQ document or null
   */
  static async readOne(idOrSlug) {
    if (!idOrSlug) return null;
    const cleanId = encodeURIComponent(String(idOrSlug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/faq/paginate?slug=${cleanId}&status=published`,
      { resource: 'faq' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const faq = items[0] || null;

    if (!faq) return null;
    if (faq.status && faq.status !== 'published') return null;

    return faq;
  }

  /**
   * Fetches a paginated list of published FAQs.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=20] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.category] - Optional category filter
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 20, status = 'published', category } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    let query = `/api/faq/paginate?page=${p}&limit=${l}&status=${status}`;
    if (category) query += `&category=${encodeURIComponent(category)}`;

    const res = await ContentHelper.fetch(query, { resource: 'faq' });

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
   * Fetches slugs/IDs for all published FAQs.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max items to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await FAQ.paginate({ page: 1, limit });
    return items.map((f) => f.slug || f._id || f.id).filter(Boolean);
  }

  /**
   * Retrieves related FAQs sharing category, excluding current FAQ.
   *
   * @param {object} currentFaq - Current FAQ document
   * @param {number} [limit=4] - Maximum related FAQs to return
   * @returns {Promise<Array<any>>} Sibling FAQ items
   */
  static async getRelated(currentFaq, limit = 4) {
    if (!currentFaq) return [];
    const category = currentFaq.category || currentFaq.metadata?.category;
    const res = await FAQ.paginate({ page: 1, limit: limit + 5, category });
    const currentId = currentFaq._id || currentFaq.id || currentFaq.slug;

    return res.items
      .filter((f) => (f._id || f.id || f.slug) !== currentId)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for an FAQ route or section.
   *
   * @param {string} [idOrSlug='faq'] - FAQ slug or section name
   * @param {object} [options={}] - Additional metadata options
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(idOrSlug = 'faq', options = {}) {
    const siteName = SiteConfig.getName();
    const isSingle = idOrSlug && idOrSlug !== 'faq';
    const singleFaq = isSingle ? await FAQ.readOne(idOrSlug) : null;

    const title = singleFaq
      ? `${singleFaq.question || singleFaq.title} | ${siteName} FAQ`
      : `Frequently Asked Questions | ${siteName}`;
    const description = singleFaq
      ? (singleFaq.answer || singleFaq.content || '').slice(0, 160)
      : `Find answers to common questions about services, onboarding, and platform capabilities at ${siteName}.`;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: isSingle ? `/faq/${singleFaq?.slug || idOrSlug}` : '/faq',
      parentImages: options.parentImages || [],
      type: 'website',
    });
  }

  /**
   * Generates complete Schema.org FAQPage structured data from an array of FAQs or a single FAQ.
   *
   * @param {Array<any>|any} [faqsOrFaq] - Array of FAQ items or single item
   * @returns {Promise<object>|object} Schema.org FAQPage JSON-LD object
   */
  static async generateJSONLD(faqsOrFaq) {
    let items = faqsOrFaq;

    if (!items) {
      const res = await FAQ.paginate({ page: 1, limit: 100 });
      items = res.items;
    } else if (!Array.isArray(items)) {
      items = [items];
    }

    return SEOHelper.buildFAQSchema(items);
  }

  /**
   * Builds dynamic sitemap entries for FAQs.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await FAQ.paginate({ page: 1, limit: 100 });

    const sitemapEntries = items
      .filter((f) => f.slug)
      .map((f) => ({
        url: `${baseUrl}/faq/${f.slug}`,
        lastModified: new Date(f.updatedAt || f.createdAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

    return [
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      ...sitemapEntries,
    ];
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
    const { items } = await FAQ.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Frequently Asked Questions\n\n`;
    markdown += `> Answers to common questions regarding ${siteName}.\n\n`;
    markdown += `## FAQ\n\n`;

    for (const f of items) {
      const q = f.question || f.title || '';
      const a = f.answer || f.content || '';
      markdown += `### ${q}\n\n${a}\n\n`;
    }

    return markdown;
  }
}

