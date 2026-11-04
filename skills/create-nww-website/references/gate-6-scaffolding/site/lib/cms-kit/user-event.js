// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/user-event.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';

/**
 * UserEvent telemetry and visitor interaction tracking helper.
 * Sends interaction metrics and page views to the NWW event ingestion pipeline.
 */
export class UserEvent {
  /**
   * Tracks a visitor event or interaction.
   *
   * @param {object} payload - Event payload
   * @param {string} payload.visitorId - Visitor identifier
   * @param {string} payload.websiteId - Website tenant identifier
   * @param {string} payload.eventType - Event category ('page_view' | 'custom' | 'video' | etc.)
   * @param {'started'|'completed'|'failed'} [payload.status='completed'] - Event lifecycle status
   * @param {object} [payload.metadata={}] - Arbitrary context key-value pairs
   * @param {string} [payload.errorMessage] - Optional failure message
   * @returns {Promise<{ success: boolean, eventId?: string }>}
   */
  static async track({
    visitorId,
    websiteId,
    eventType = 'custom',
    status = 'completed',
    metadata = {},
    errorMessage = null,
  }) {
    if (!visitorId || !websiteId) {
      return { success: false, error: 'visitorId and websiteId are required' };
    }

    try {
      const res = await ContentHelper.fetch('/api/events/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          website: websiteId,
          eventType,
          status,
          timestamp: new Date().toISOString(),
          metadata,
          errorMessage,
        }),
      });

      return {
        success: true,
        eventId: res?.body?.eventId || res?.eventId,
      };
    } catch (err) {
      // Telemetry failures must never break user experience or page rendering
      return { success: false, error: err.message };
    }
  }

  /**
   * Convenience method to track a page view navigation event.
   *
   * @param {string} path - URL path visited
   * @param {object} context - Tenant and visitor IDs
   * @param {string} context.visitorId - Visitor ID
   * @param {string} context.websiteId - Website ID
   * @returns {Promise<{ success: boolean, eventId?: string }>}
   */
  static async pageView(path, { visitorId, websiteId }) {
    return UserEvent.track({
      visitorId,
      websiteId,
      eventType: 'page_view',
      status: 'completed',
      metadata: { path, referrer: typeof document !== 'undefined' ? document.referrer : '' },
    });
  }
}

