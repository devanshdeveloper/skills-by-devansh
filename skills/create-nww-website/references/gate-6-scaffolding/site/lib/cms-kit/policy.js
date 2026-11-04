// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/policy.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Policy model helper providing static query and formatting methods
 * for dynamic website legal documents: Privacy Policy, Terms and Conditions,
 * and Refund Policy.
 */
export class Policy {
  /**
   * Fetches the active Privacy Policy for the current website tenant.
   *
   * @returns {Promise<any|null>} Privacy Policy document or null
   */
  static async getPrivacyPolicy() {
    const res = await ContentHelper.fetch(
      '/api/website-privacy-policy/paginate?limit=1',
      { resource: 'website-privacy-policy' }
    );
    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return items[0] || null;
  }

  /**
   * Fetches the active published Terms and Conditions for the current website tenant.
   *
   * @returns {Promise<any|null>} Terms and Conditions document or null
   */
  static async getTerms() {
    const res = await ContentHelper.fetch(
      '/api/website-terms-and-conditions/paginate?limit=1&status=published',
      { resource: 'website-terms-and-conditions' }
    );
    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return items[0] || null;
  }

  /**
   * Fetches the active published Refund Policy for the current website tenant.
   *
   * @returns {Promise<any|null>} Refund Policy document or null
   */
  static async getRefundPolicy() {
    const res = await ContentHelper.fetch(
      '/api/website-refund-policy/paginate?limit=1&status=published',
      { resource: 'website-refund-policy' }
    );
    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    return items[0] || null;
  }

  /**
   * Fetches a legal policy document by its standardized type identifier.
   *
   * @param {'privacy'|'terms'|'refund'} type - Policy type
   * @returns {Promise<any|null>} Policy document or null
   */
  static async readOne(type) {
    switch (type) {
      case 'privacy':
      case 'privacy-policy':
        return Policy.getPrivacyPolicy();
      case 'terms':
      case 'terms-and-conditions':
        return Policy.getTerms();
      case 'refund':
      case 'refund-policy':
        return Policy.getRefundPolicy();
      default:
        return null;
    }
  }

  /**
   * Generates dynamic Next.js Metadata for a legal policy route segment.
   *
   * @param {'privacy'|'terms'|'refund'} type - Policy type
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(type, { parentImages = [] } = {}) {
    const configMap = {
      privacy: {
        title: `Privacy Policy | ${SiteConfig.getName()}`,
        description: `Read the official Privacy Policy of ${SiteConfig.getName()}. Learn how we collect, protect, and handle your data.`,
        path: '/privacy',
      },
      terms: {
        title: `Terms & Conditions | ${SiteConfig.getName()}`,
        description: `Read the official Terms of Service and Conditions governing the use of ${SiteConfig.getName()}.`,
        path: '/terms',
      },
      refund: {
        title: `Refund Policy | ${SiteConfig.getName()}`,
        description: `Read our transparent Refund Policy and satisfaction guarantees at ${SiteConfig.getName()}.`,
        path: '/refund',
      },
    };

    const config = configMap[type] || {
      title: `Legal Policy | ${SiteConfig.getName()}`,
      description: `Official legal disclosures and policies of ${SiteConfig.getName()}.`,
      path: `/${type}`,
    };

    return SEOHelper.generateMetadata({
      title: config.title,
      description: config.description,
      path: config.path,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org DigitalDocument structured data for a legal policy.
   *
   * @param {object} policy - Policy document
   * @param {'privacy'|'terms'|'refund'} type - Policy type
   * @returns {object} Schema.org JSON-LD object
   */
  static generateJSONLD(policy, type) {
    if (!policy) return {};
    const siteUrl = SiteConfig.getUrl().replace(/\/$/, '');

    const nameMap = {
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions',
      refund: 'Refund Policy',
    };

    const pathMap = {
      privacy: '/privacy',
      terms: '/terms',
      refund: '/refund',
    };

    const docName = nameMap[type] || 'Legal Policy';
    const docPath = pathMap[type] || `/${type}`;

    return {
      '@context': 'https://schema.org',
      '@type': 'DigitalDocument',
      name: `${SiteConfig.getName()} ${docName}`,
      url: `${siteUrl}${docPath}`,
      publisher: {
        '@type': 'Organization',
        name: SiteConfig.getName(),
        url: siteUrl,
      },
      dateModified: policy.updatedAt || policy.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Builds dynamic sitemap entries for standard legal pages.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const now = new Date();

    return [
      {
        url: `${baseUrl}/privacy`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/refund`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
    ];
  }
}

