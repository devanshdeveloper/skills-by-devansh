# CMS Architecture & Integration Specification

This reference defines the Next Web Website (NWW) CMS integration architecture. The CMS operates in one of two modes: **`none`** (pure static site) or **`cms`** (managed Blog and form endpoints). The legacy `extended` mode is permanently disabled.

---

## Architecture Modes

- **`none`**: The website has no dynamic CMS integration. All pages and content are statically built or managed in local JavaScript objects in `site/content/`. Form endpoints may submit to external email routing or static services.
- **`cms`**: Dynamic blog engine and form submission endpoints are wired to the headless NWW CMS backend service. Uses on-demand Next.js Incremental Static Regeneration (ISR) via tag-based revalidation.

---

## Environment Variables Configuration

In `site/.env.local` and production hosting environments:

```bash
# NWW CMS API Base URL (e.g., https://api.nextwebworks.in)
SERVER_URL="https://api.nextwebworks.in"

# NWW CMS Website Token (Read-only authorization)
CMS_SITE_KEY="your-cms-site-key"

# Secret token for on-demand revalidation webhooks
REVALIDATE_SECRET="your-revalidate-secret"

# Fallback ISR revalidation duration in seconds (60 pending verification, 3600 for verified production)
REVALIDATE_SECONDS="60"
```

*Security Rule:* None of the variables above start with `NEXT_PUBLIC_`. They must never be exposed to browser client bundles.

---

## Data Access Layer & Simplified Revalidation (`site/lib/cms/`)

### 1. Revalidation Utilities (`site/lib/cms/revalidation.js`)
All revalidation constants and tag generators live in a single module:

```javascript
// site/lib/cms/revalidation.js

export const ALLOWED_RESOURCES = ['blog'];

export const REVALIDATE_SECONDS = parseInt(
  process.env.REVALIDATE_SECONDS || '60',
  10
);

/**
 * Produces the canonical cache tag for a CMS resource.
 * Adheres strictly to the Simplified Revalidation Standard:
 * Exactly ONE tag per resource ('cms:<resource>').
 * Per-slug tags, sitemap tags, and ID suffixes are forbidden.
 */
export function tagFor(resource) {
  if (!ALLOWED_RESOURCES.includes(resource)) {
    throw new Error(`[CMS Revalidation] Unknown resource: ${resource}`);
  }
  return `cms:${resource}`;
}
```

### 2. CMS Fetch Client (`site/lib/cms/client.js`)
All data retrieval from the CMS is routed through `cmsFetch`. This is the **ONLY place** in the application that sets `next.tags` and `next.revalidate`:

```javascript
// site/lib/cms/client.js
import { tagFor, REVALIDATE_SECONDS } from './revalidation.js';

const SERVER_URL = process.env.SERVER_URL;
const CMS_SITE_KEY = process.env.CMS_SITE_KEY;

export async function cmsFetch(path, resource, init = {}) {
  if (!SERVER_URL) {
    throw new Error('[CMS Client] Missing SERVER_URL environment variable.');
  }
  if (!CMS_SITE_KEY) {
    throw new Error('[CMS Client] Missing CMS_SITE_KEY environment variable. Authenticated read required.');
  }

  const url = `${SERVER_URL}${path}`;
  const tag = tagFor(resource);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s fetch timeout

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CMS_SITE_KEY}`,
        'x-site-key': CMS_SITE_KEY,
        ...init.headers,
      },
      next: {
        tags: [tag],
        revalidate: REVALIDATE_SECONDS,
      },
    });

    if (!res.ok) {
      throw new Error(`[CMS Client Error] ${res.status} ${res.statusText} at ${path}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch paginated blog articles.
 */
export async function getPaginatedBlogPosts(page = 1, limit = 10) {
  return cmsFetch(
    `/api/blog/paginate?page=${page}&limit=${limit}`,
    'blog'
  );
}

/**
 * Fetch a single blog article by unique URL slug.
 */
export async function getBlogPostBySlug(slug) {
  return cmsFetch(
    `/api/blog/read-one-by-slug/${slug}`,
    'blog'
  );
}
```

---

## On-Demand Revalidation Route (`site/app/api/revalidate/route.js`)

When an article is published, updated, or unpublished in the NWW CMS dashboard, the backend fires a POST request to `/api/revalidate`. The handler performs constant-time token verification and revalidates the resource tag:

```javascript
// site/app/api/revalidate/route.js
import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { ALLOWED_RESOURCES, tagFor } from '@/lib/cms/revalidation.js';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const secret = process.env.REVALIDATE_SECRET || '';

    if (!token || !secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Constant-time token comparison via SHA-256 hash to prevent timing attacks
    const tokenHash = crypto.createHash('sha256').update(token).digest();
    const secretHash = crypto.createHash('sha256').update(secret).digest();

    if (!crypto.timingSafeEqual(tokenHash, secretHash)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { resource } = body;

    if (!resource || !ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json(
        { error: 'Invalid or missing resource', allowed: ALLOWED_RESOURCES },
        { status: 400 }
      );
    }

    const tagToRevalidate = tagFor(resource);
    revalidateTag(tagToRevalidate);

    return NextResponse.json({
      revalidated: true,
      resource,
      tag: tagToRevalidate,
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal revalidation error', message: err.message },
      { status: 500 }
    );
  }
}
```

*Revalidation Contract:*
- The backend makes one 5-second attempt upon write; no retries.
- Webhook body sends `{ "resource": "blog" }`. (Any optional slug in body is ignored).
- While webhook status is `pending`, fallback time-based ISR refreshes the cache every 60 seconds (`REVALIDATE_SECONDS=60`). Once verified, the interval upgrades to 3600 seconds.

---

## Blog Data Model & Field Mapping

The CMS returns blog articles matching the following schema:

```javascript
/**
 * @typedef {Object} BlogPost
 * @property {string} _id - Document ID
 * @property {string} title - Article title
 * @property {string} slug - Unique URL slug
 * @property {string} content - HTML rich text body
 * @property {string} [cover_image] - Banner / Hero image URL
 * @property {string} [image] - Card thumbnail & single post hero image URL
 * @property {('draft'|'pending'|'published'|'rejected'|'archived')} status - Workflow status
 * @property {string} [metaTitle] - SEO meta title
 * @property {string} [metaDescription] - SEO meta description
 * @property {string} [author_name] - Denormalized author name
 * @property {string} [author_image] - Author avatar URL
 * @property {string} [postedAt] - Publication timestamp
 * @property {string} [lastUpdatedAt] - Last update timestamp
 * @property {string} [createdAt] - Record creation timestamp
 * @property {string} [updatedAt] - Record modification timestamp
 */
```

### Media Role & SEO Mapping
- **Hero Banner:** `cover_image`.
- **Card Thumbnail:** `image`.
- **OpenGraph Image:** `image` falling back to `cover_image`, falling back to `/assets/og-default.webp`.
- **Alt Text Fallback:** `cover_image_alt` falls back to the article `title`.
- **Excerpt Fallback:** Strips HTML from `content` and truncates to the first 155 characters followed by `...`.
- **Canonical URL:** Always self-referential: `/blog/${post.slug}`.
- **Unpublished Guard:** If `status !== 'published'`, return Next.js `notFound()` or set `robots: { index: false, follow: false }`.

---

## Form Submission Endpoints

The NWW CMS provides standard endpoints for form capture:

### 1. Contact Form (`WebsiteContactUs`)
- **Route:** `POST /api/website-contact-us/:id/submit` (where `:id` is the website contact form ID).
- **Headers:** `Content-Type: application/json`
- **Body Schema:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0199",
    "message": "Project inquiry details..."
  }
  ```
  *(Notifications: Form submission email alerts are configured directly by the client inside CMS dashboard settings).*

### 2. Lead Capture
- **Route:** `POST /api/lead/submit`
- **Headers:** `Content-Type: application/json`
- **Body Schema:**
  ```json
  {
    "email": "visitor@example.com",
    "course": "General Inquiry",
    "user": "tenant-id"
  }
  ```

---

## Recipe: How to Add a New Content Type (3 Steps)

1. Add the resource name to `ALLOWED_RESOURCES` in `site/lib/cms/revalidation.js`.
2. Fetch through `cmsFetch(path, "<resource>")` in the data layer (the only place that sets `next.tags`).
3. Backend calls `notifySite(tenant, "<resource>")` upon write.
