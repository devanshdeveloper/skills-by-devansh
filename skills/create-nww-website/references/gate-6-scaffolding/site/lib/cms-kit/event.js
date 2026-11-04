// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/event.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Event model helper providing class-based static query and formatting methods
 * for corporate events, webinars, conferences, and meetups.
 */
export class Event {
  /**
   * Fetches a single published event by its slug.
   *
   * @param {string} slug - Unique event slug
   * @returns {Promise<any|null>} Event document or null
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/website-event/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'event' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const item = items[0] || null;

    if (!item) return null;
    if (item.status && item.status !== 'published') return null;

    return item;
  }

  /**
   * Fetches a paginated list of published events.
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
      `/api/website-event/paginate?page=${p}&limit=${l}&status=${status}`,
      { resource: 'event' }
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
   * Fetches slugs for published events to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Event.paginate({ page: 1, limit });
    return items.map((e) => e.slug).filter(Boolean);
  }

  /**
   * Generates dynamic Next.js Metadata for a single event.
   *
   * @param {string} slug - Event slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const item = await Event.readOne(slug);
    if (!item) {
      return {
        title: 'Event Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = `${item.title} | Events`;
    const description = item.description || `Join us for ${item.title} at ${item.location || 'online'}.`;
    const image = Array.isArray(item.attachments) && item.attachments[0] ? item.attachments[0] : null;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/events/${item.slug}`,
      image,
      parentImages,
      type: 'website',
    });
  }

  /**
   * Generates Schema.org Event structured data for an event.
   *
   * @param {object} item - Event document
   * @returns {object} Schema.org Event JSON-LD object
   */
  static generateJSONLD(item) {
    if (!item) return {};
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: item.title,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: item.location?.toLowerCase().includes('online')
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: item.location,
      },
      organizer: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
      },
    };
  }

  /**
   * Builds dynamic sitemap entries for all published events.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Event.paginate({ page: 1, limit: 100 });

    return items.map((item) => ({
      url: `${baseUrl}/events/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }
}

