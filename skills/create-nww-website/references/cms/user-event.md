# Website User Event & Telemetry (`WebsiteUserEvent`) Specification

This reference provides the unified technical specification for client-side event ingestion and analytics tracking using `WebsiteUserEvent`, including ingestion payloads, privacy compliance, client-side integration patterns, and monitoring.

## Table of Contents
- [1. Model & Architecture](#1-model--architecture)
- [2. Ingestion Pipeline & Client Tracking [Exact Code without the JSX]](#2-ingestion-pipeline--client-tracking-exact-code-without-the-jsx)
- [3. Server Action & Proxy Ingestion Pattern [Exact Code without the JSX]](#3-server-action--proxy-ingestion-pattern-exact-code-without-the-jsx)
- [4. Verification & QA Checklist](#4-verification--qa-checklist)

---

## 1. Model & Architecture

The NWW CMS stores visitor interactions and telemetry events in MongoDB under the `WebsiteUserEvent` collection (accessed via public ingestion endpoint `/api/events/ingest`).

### Schema Fields & Types

```typescript
interface WebsiteUserEventItem {
  _id: string;                                          // MongoDB ObjectId string
  visitor: string;                                      // Scoped Visitor ObjectId (required)
  website: string;                                      // Scoped Website ObjectId (required)
  user?: string;                                        // Tenant owner ObjectId
  eventType:                                            // Interaction category (required)
    | 'page_view'
    | 'video'
    | 'thumbnail'
    | 'audio'
    | 'playlist-video'
    | 'playlist-audio'
    | 'playlist-thumbnail'
    | 'playlist-complete'
    | 'custom';
  youtubeId?: string;                                   // External media identifier
  playlistId?: string;                                  // External playlist identifier
  format?: string;                                      // Media format or interaction subtype
  status: 'started' | 'completed' | 'failed';           // Lifecycle status (required)
  metadata?: Record<string, any>;                       // Contextual payload (e.g. path, duration)
  errorMessage?: string;                                // Error message if status === 'failed'
  timestamp: string;                                    // ISO 8601 client occurrence timestamp (required)
  receivedAt?: string;                                  // ISO 8601 server arrival timestamp
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
}
```

---

## 2. Ingestion Pipeline & Client Tracking [Exact Code without the JSX]

### Client Interaction Helper (`site/lib/analytics.js`)

```javascript
// site/lib/analytics.js
import { UserEvent } from '@/lib/cms';

export async function trackPageView(path) {
  if (typeof window === 'undefined') return;

  const visitorId = localStorage.getItem('nww_visitor_id');
  const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID;

  if (!visitorId || !websiteId) return;

  await UserEvent.track({
    visitorId,
    websiteId,
    eventType: 'page_view',
    status: 'completed',
    metadata: {
      path,
      referrer: document.referrer || '',
      screen: `${window.innerWidth}x${window.innerHeight}`,
    },
  });
}
```

---

## 3. Server Action & Proxy Ingestion Pattern [Exact Code without the JSX]

To ensure visitor privacy and zero-credential exposure in the client bundle, telemetry events should route through an internal Next.js Route Handler (`site/app/api/telemetry/route.js`):

```javascript
// site/app/api/telemetry/route.js
import { NextResponse } from 'next/server';
import { UserEvent } from '@/lib/cms';

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await UserEvent.track(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
```

---

## 4. Verification & QA Checklist
- [ ] **Privacy First:** Never transmit personally identifiable information (PII) such as passwords, emails, or tokens in event `metadata`.
- [ ] **Non-Blocking Execution:** Event tracking calls must always be wrapped in async promises and never block page hydration or navigation.
- [ ] **Valid ObjectIds:** `visitorId` and `websiteId` must be 24-character hexadecimal MongoDB ObjectIds.
- [ ] **Graceful Failure:** When backend ingestion returns 4xx/5xx or visitor is offline, client scripts must swallow the error silently.

