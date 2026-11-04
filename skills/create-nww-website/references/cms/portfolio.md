# Portfolio (`Portfolio`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Portfolio` showcase model, including its data contract, list page implementation, single portfolio item implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores visual showcase portfolio works, creative projects, and client deliverables in MongoDB under the `Portfolio` collection (accessed via REST slug `website-portfolio`).

### Schema Fields & Types

```typescript
interface PortfolioItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Portfolio project title (required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description?: string;                                 // Project narrative or client deliverable overview
  images?: string[];                                    // Array of high-resolution showcase image URLs
  industry?: string;                                    // ObjectId ref to Industry
  service?: string;                                     // ObjectId ref to WebsiteService
  tags?: string[];                                      // Array of ObjectId refs to WebsiteTag
  status: 'draft' | 'published' | 'archived';           // Workflow status ('published' for live website)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/portfolio/page.js`)

```javascript
// site/app/portfolio/page.js
import { Portfolio, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Portfolio & Creative Showcase | Our Work',
  description: 'Explore our selected portfolio of creative design, digital products, and client deliverables.',
  path: '/portfolio',
});

export default async function PortfolioIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published portfolio items via Portfolio helper
  const { items: portfolioItems, total, totalPages } = await Portfolio.paginate({ page, limit });

  // Data mapping for presentation components
  const showcasedWorks = portfolioItems.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    description: item.description || '',
    coverImage: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '/assets/portfolio-default.webp',
    gallery: Array.isArray(item.images) ? item.images : [],
    industry: item.industry?.name || null,
    service: item.service?.title || null,
    tags: Array.isArray(item.tags) ? item.tags.map((t) => t.name || t) : [],
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="portfolio-index">
      {/* Presentation JSX receives { showcasedWorks, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/portfolio/[slug]/page.js`)

```javascript
// site/app/portfolio/[slug]/page.js
import { notFound } from 'next/navigation';
import { Portfolio } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published portfolio slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await Portfolio.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Portfolio.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SinglePortfolioPage({ params }) {
  'use cache';

  const { slug } = await params;
  const item = await Portfolio.readOne(slug);

  if (!item) {
    notFound();
  }

  // Related sibling portfolio works
  const relatedWorks = await Portfolio.getRelated(item, 3);

  // Structured Data (JSON-LD)
  const jsonLd = Portfolio.generateJSONLD(item);

  // Return data payload to single portfolio presentation layer
  return (
    <article data-section="portfolio-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives { item, relatedWorks } */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Portfolio seeder scripts reside in `skills/create-nww-website/references/cms/seeders/portfolio/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/portfolio/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title and slug without network writes
node skills/create-nww-website/references/cms/seeders/portfolio/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/portfolio \
  --dry-run
```

### 2. Live Seeding with Collision Resolution
```bash
# Live insertion of portfolio seeds with automated collision handling
node skills/create-nww-website/references/cms/seeders/portfolio/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/portfolio \
  --auto-slug
```

### 3. Updating an Existing Portfolio Item
```bash
# Update fields for an existing portfolio item by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/portfolio/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/portfolio/portfolio-update.json
```

### 4. Deleting a Portfolio Item
```bash
# Delete a portfolio item by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/portfolio/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Portfolio Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `portfolio/page.js` and `portfolio/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published portfolio slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/portfolio/${item.slug}`.
- [ ] **Open Graph Merging:** `openGraph` specifies title, description, URL, and spreads parent images.
- [ ] **Structured Data:** Valid `CreativeWork` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **LCP Hero Image:** Exactly one hero banner image applies `fetchPriority="high"` (or `preload={true}`) with explicit width/height.
- [ ] **INP Architecture:** Portfolio routes are 100% Server Components with zero root `'use client'` hydration.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `Portfolio.getSitemap()` and sets real `lastModified` dates on each portfolio entry.

