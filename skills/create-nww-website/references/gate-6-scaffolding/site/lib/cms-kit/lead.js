// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/lead.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { CMSError } from './error.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Lead model helper for submitting visitor inquiries, consultation requests,
 * and generating contact-page SEO and structured data.
 */
export class Lead {
  /**
   * Submits a lead or contact inquiry to the NWW CMS backend.
   *
   * @param {object} payload - Visitor form data
   * @param {string} [payload.name] - Visitor full name
   * @param {string} [payload.firstName] - Visitor first name
   * @param {string} [payload.lastName] - Visitor last name
   * @param {string} payload.email - Visitor email address
   * @param {string} [payload.phone] - Visitor phone number
   * @param {string} [payload.message] - Inquiry message
   * @param {object} [payload.metadata] - Additional custom parameters
   * @returns {Promise<{ success: boolean, id?: string, message?: string }>}
   * @throws {CMSError} If submission fails
   */
  static async submit(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new CMSError('[Lead] Payload must be a non-null object.', 400);
    }

    const resolvedName = payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ');
    if (!resolvedName || !payload.email) {
      throw new CMSError('[Lead] Name (or firstName/lastName) and email are required fields.', 400);
    }

    const sanitizedPayload = {
      name: String(resolvedName).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: payload.phone ? String(payload.phone).trim() : undefined,
      message: payload.message ? ContentHelper.sanitizeHtml(String(payload.message)) : undefined,
      metadata: payload.metadata || {},
      submittedAt: new Date().toISOString(),
      ...(payload.firstName ? { firstName: String(payload.firstName).trim() } : {}),
      ...(payload.lastName ? { lastName: String(payload.lastName).trim() } : {}),
    };

    const res = await ContentHelper.fetch('/api/lead/submit', {
      resource: 'lead',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload),
      },
    });

    return {
      success: true,
      id: res?.data?._id || res?._id || res?.id,
      message: res?.message || 'Lead submitted successfully.',
    };
  }

  /**
   * Generates dynamic Next.js Metadata for the contact or consultation page.
   *
   * @param {object} [options={}] - Custom overrides
   * @returns {import('next').Metadata} Complete metadata object
   */
  static generateMetadata(options = {}) {
    const siteName = SiteConfig.getName();
    return SEOHelper.generateMetadata({
      title: options.title || `Contact Us | ${siteName}`,
      description: options.description || `Get in touch with the team at ${siteName} to discuss your next project.`,
      path: options.path || '/contact',
      parentImages: options.parentImages || [],
      type: 'website',
    });
  }

  /**
   * Generates Schema.org ContactPage structured data with full contact and organization details.
   *
   * @param {object} [options={}] - Custom contact details
   * @returns {object} ContactPage Schema.org object
   */
  static generateJSONLD(options = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();

    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: options.title || `Contact ${siteName}`,
      description: options.description || `Get in touch with ${siteName}.`,
      url: `${siteUrl}${options.path || '/contact'}`,
      mainEntity: SEOHelper.buildOrganizationSchema({
        name: siteName,
        url: siteUrl,
        email: options.email,
        phone: options.phone,
        address: options.address,
      }),
    };
  }
}
