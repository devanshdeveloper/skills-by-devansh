# Service (`WebsiteService`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteService` model, including its data contract, list page implementation, single service page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores client service offerings in MongoDB under the `WebsiteService` collection (accessed via REST slug `website-service`).

### Schema Fields & Types

```typescript
interface ServiceItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Service title (required, e.g. "Full-Stack Web Development")
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description: string;                                  // Short service excerpt / summary (required)
  content: string;                                      // In-depth service description rich-text HTML (required)
  industry?: string;                                    // Industry ObjectId ref
  portfolio?: string;                                   // Portfolio / Case Study ObjectId ref
  attachments?: string[];                               // Associated brochure or media attachment URLs
  metaTitle?: string;                                   // SEO title override (falls back to title)
  metaDescription?: string;                             // SEO description override (falls back to description)
  status: 'draft' | 'published' | 'archived';           // Workflow status ('published' for production site)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Critical REST Routing & Status Conventions
1. **Endpoint Mount**: The REST resource is mounted at `/api/website-service` (not `/api/service`).
2. **Status Parameter**: Explicitly pass `status=published` in queries to override default backend filters.

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/services/page.js`)

```javascript
// site/app/services/page.js
import { Service, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Our Services & Capabilities | What We Offer',
  description: 'Explore our full suite of professional services, specialized solutions, and technical expertise.',
  path: '/services',
});

export default async function ServicesIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published services
  const { items: services, total, totalPages } = await Service.paginate({ page, limit });

  // Data mapping for presentation components
  const showcasedServices = services.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    description: item.description || item.metaDescription || '',
    content: item.content || '',
    status: item.status,
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="services-index">
      {/* Presentation JSX receives { showcasedServices, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/services/[slug]/page.js`)

```javascript
// site/app/services/[slug]/page.js
import { notFound } from 'next/navigation';
import { Service, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published service slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await Service.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Service.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleServicePage({ params }) {
  'use cache';

  const { slug } = await params;
  const service = await Service.readOne(slug);

  if (!service) {
    notFound();
  }

  // Structured Data (JSON-LD Service schema)
  const jsonLd = Service.generateJSONLD(service);

  // Return data payload to single service presentation layer
  return (
    <article data-section="service-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives service */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Service seeder scripts reside in `skills/create-nww-website/references/cms/seeders/service/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/services/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title and slug without network writes
node skills/create-nww-website/references/cms/seeders/service/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/services \
  --dry-run
```

### 2. Live Seeding with Collision Resolution
```bash
# Live insertion of service seeds with automated collision handling
node skills/create-nww-website/references/cms/seeders/service/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/services \
  --auto-slug
```

### 3. Updating an Existing Service
```bash
# Update fields for an existing service by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/service/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/services/service-update.json
```

### 4. Deleting a Service
```bash
# Delete a service by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/service/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Service Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `services/page.js` and `services/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published service slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/services/${service.slug}`.
- [ ] **Structured Data:** Valid `Service` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `Service.getSitemap()` and sets real `lastModified` dates on each service entry.

