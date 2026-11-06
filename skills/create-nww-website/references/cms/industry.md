# Industry Solutions (`Industry`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Industry` model, including its data contract, list page implementation, single industry page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores vertical market solutions and industry landing pages in MongoDB under the `Industry` collection (accessed via REST slug `website-industry`).

### Schema Fields & Types

```typescript
interface IndustryItem {
  _id: string;                                          // MongoDB ObjectId string
  name: string;                                         // Industry title / sector name (required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description: string;                                  // Short overview / summary (required)
  image: string;                                        // Header showcase or card banner image URL (required)
  icon: string;                                         // Industry icon asset URL or Lucide identifier (required)
  content: string;                                      // In-depth sector solution overview HTML (required)
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

### Server Component Implementation (`site/app/industries/page.js`)

```javascript
// site/app/industries/page.js
import { Industry, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Industries & Verticals We Serve | Tailored Solutions',
  description: 'Explore our specialized technology solutions, domain architectures, and proven outcomes across diverse industries.',
  path: '/industries',
});

export default async function IndustriesIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published industry verticals via Industry helper
  const { items: industries, total, totalPages } = await Industry.paginate({ page, limit });

  // Data mapping for presentation components
  const showcasedIndustries = industries.map((item) => ({
    id: item._id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    image: item.image || '/assets/industry-default.webp',
    icon: item.icon || '/assets/icons/industry.svg',
    summary: item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...' : item.description,
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="industries-index">
      {/* Presentation JSX receives { showcasedIndustries, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/industries/[slug]/page.js`)

```javascript
// site/app/industries/[slug]/page.js
import { notFound } from 'next/navigation';
import { Industry } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published industry slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await Industry.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Industry.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleIndustryPage({ params }) {
  'use cache';

  const { slug } = await params;
  const industry = await Industry.readOne(slug);

  if (!industry) {
    notFound();
  }

  // Related sibling industries
  const relatedIndustries = await Industry.getRelated(industry, 3);

  // Structured Data (JSON-LD)
  const jsonLd = Industry.generateJSONLD(industry);

  // Return data payload to single industry presentation layer
  return (
    <article data-section="industry-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives { industry, relatedIndustries } */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Industry content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/industries/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, required name, slug, description, and content without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/industries \
  --model industry
```

### 2. Live Seeding
```bash
# Live insertion of industry seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/industries \
  --model industry \
  --apply
```

### 3. Updating an Existing Industry
```bash
# Update fields for an existing industry by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model industry \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/industries/industry-update.json
```

### 4. Deleting an Industry
```bash
# Delete an industry by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model industry \
  --id "65f8a123bc45de6789012345"
```

### 5. Industry Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `industries/page.js` and `industries/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published industry slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/industries/${industry.slug}`.
- [ ] **Open Graph Merging:** `openGraph` specifies title, description, URL, and spreads parent images.
- [ ] **Structured Data:** Valid `Service` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **LCP Hero Image:** Exactly one hero banner image applies `fetchPriority="high"` (or `preload={true}`) with explicit width/height.
- [ ] **INP Architecture:** Industry routes are 100% Server Components with zero root `'use client'` hydration.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `Industry.getSitemap()` and sets real `lastModified` dates on each industry entry.

