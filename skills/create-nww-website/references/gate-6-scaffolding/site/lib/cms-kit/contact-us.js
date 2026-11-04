// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/contact-us.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { CMSError } from './error.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * ContactUs model helper for submitting visitor contact inquiries to WebsiteContactUs,
 * and generating contact-page SEO and Schema.org structured data.
 */
export class ContactUs {
  /**
   * Submits a contact inquiry to the NWW CMS backend (WebsiteContactUs).
   *
   * @param {object} payload - Inbound inquiry details
   * @param {string} payload.firstName - Sender first name
   * @param {string} payload.lastName - Sender last name
   * @param {string} payload.email - Sender email address
   * @param {string} payload.phone - Sender phone number
   * @param {string} payload.message - Inquiry message text
   * @param {string} [payload.status='pending'] - Workflow status ('pending', 'replied', 'closed')
   * @param {object} [payload.metadata] - Optional additional parameters
   * @returns {Promise<{ success: boolean, id?: string, message?: string }>}
   * @throws {CMSError} If submission fails
   */
  static async submit(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new CMSError('[ContactUs] Payload must be a non-null object.', 400);
    }

    const firstName = String(payload.firstName || '').trim();
    const lastName = String(payload.lastName || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const phone = String(payload.phone || '').trim();
    const message = payload.message ? ContentHelper.sanitizeHtml(String(payload.message)) : '';

    if (!firstName || !lastName || !email || !phone || !message) {
      throw new CMSError('[ContactUs] firstName, lastName, email, phone, and message are required fields.', 400);
    }

    const sanitizedPayload = {
      firstName,
      lastName,
      email,
      phone,
      message,
      status: payload.status || 'pending',
      metadata: payload.metadata || {},
    };

    const res = await ContentHelper.fetch('/api/website-contact-us/create-one', {
      resource: 'website-contact-us',
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
      message: res?.message || 'Contact inquiry submitted successfully.',
    };
  }

  /**
   * Generates dynamic Next.js Metadata for the contact page.
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

// Backwards-compatibility alias
export const Lead = ContactUs;
export default ContactUs;

