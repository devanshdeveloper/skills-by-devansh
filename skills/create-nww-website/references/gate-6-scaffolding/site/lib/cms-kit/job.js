// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/job.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Job (Career) model helper providing class-based static query and formatting methods
 * for career listings and employment opportunities.
 */
export class Job {
  /**
   * Fetches a single published job opening by its slug.
   *
   * @param {string} slug - Unique job slug
   * @returns {Promise<any|null>} Job document or null
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-job/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'job' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published job postings.
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
      `/api/website-job/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'job' }
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
   * Fetches slugs for published jobs to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Job.paginate({ page: 1, limit });
    return items.map((j) => j.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for a single job opening.
   *
   * @param {string} slug - Job slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Job.readOne(slug);
    if (!item) {
      return {
        title: 'Job Opening Not Found',
        robots: { index: false, follow: false },
      };
    }

    const location = [item.city, item.state, item.country].filter(Boolean).join(', ');
    const title = `${item.title}${location ? ` (${location})` : ''} | Careers`;
    const description = item.description || `Join our team as a ${item.title}. View requirements and apply online.`;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/careers/${item.slug}`,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Generates Schema.org JobPosting structured data for a job opening.
   *
   * @param {object} item - Job document
   * @returns {object} Schema.org JobPosting JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();

    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: item.title,
      description: item.description,
      datePosted: item.startDate || item.createdAt,
      validThrough: item.endDate,
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: siteName,
        sameAs: siteUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.city,
          addressRegion: item.state,
          addressCountry: item.country,
        },
      },
    };
  }

  /**
   * Builds dynamic sitemap entries for all published jobs.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Job.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/careers/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }
}

