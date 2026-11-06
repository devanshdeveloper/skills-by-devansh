# Tool Category (`WebsiteToolCategory`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteToolCategory` model, including its data contract, category landing page implementation, nested taxonomy handling, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS organizes tools into hierarchical taxonomy groups under the `WebsiteToolCategory` collection (accessed via REST slug `website-tool-category`).

### Schema Fields & Types

```typescript
interface ToolCategoryItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Category title (required, e.g. "Financial Calculators")
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description?: string;                                 // Category narrative summary
  images?: string[];                                    // Banner / badge image URLs
  toolCategory?: string;                                // Parent WebsiteToolCategory ObjectId for nested sub-categories
  page_content?: string;                                // Markdown or rich-text landing page content
  tags?: string[];                                      // Array of WebsiteTag ObjectIds
  faqs?: Array<{                                        // Category-specific frequently asked questions
    question: string;
    answer: string;
  }>;
  metaTitle?: string;                                   // SEO title override (falls back to title)
  metaDescription?: string;                             // SEO description override (falls back to description)
  metadata?: Record<string, any>;                       // Arbitrary key-value metadata container
  status: 'draft' | 'published' | 'archived';           // Workflow status ('published' for production site)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Critical REST Routing & Hierarchy Conventions
1. **Endpoint Mount**: The REST resource is mounted at `/api/website-tool-category`.
2. **Hierarchical Taxonomy**: Categories support 1-level or multi-level nesting via the self-referencing `toolCategory` ObjectId.
3. **Strict-Mode Metadata**: Arbitrary attributes must be contained inside the `metadata` Map object to preserve schema integrity.

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/tools/categories/page.js`)

```javascript
// site/app/tools/categories/page.js
import { ToolCategory, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Tool Categories | Free Web Utilities',
  description: 'Browse all categories of free online tools, converters, calculators, and generators.',
  path: '/tools/categories',
});

export default async function ToolCategoriesIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 20;

  // Fetches published tool categories
  const { items: categories, total, totalPages } = await ToolCategory.paginate({ page, limit });

  // Data mapping for presentation components
  const categoryCards = categories.map((cat) => ({
    id: cat._id,
    title: cat.title,
    slug: cat.slug,
    description: cat.description || cat.metaDescription || '',
    image: Array.isArray(cat.images) && cat.images[0] ? cat.images[0] : null,
    parentCategoryId: cat.toolCategory || null,
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="tool-categories-index">
      {/* Presentation JSX receives { categoryCards, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/tools/category/[slug]/page.js`)

```javascript
// site/app/tools/category/[slug]/page.js
import { notFound } from 'next/navigation';
import { ToolCategory, Tool, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published tool category slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await ToolCategory.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return ToolCategory.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleToolCategoryPage({ params }) {
  'use cache';

  const { slug } = await params;
  const category = await ToolCategory.readOne(slug);

  if (!category) {
    notFound();
  }

  // Fetch tools filtered by or associated with this category
  const { items: associatedTools } = await Tool.paginate({ limit: 50 });

  // Structured Data (JSON-LD CollectionPage schema)
  const jsonLd = ToolCategory.generateJSONLD(category);

  // Return data payload to single category presentation layer
  return (
    <article data-section="tool-category-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives category, associatedTools, category.page_content, category.faqs */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Tool Category content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/tool-categories/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title and slug without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/tool-categories \
  --model tool-category
```

### 2. Live Seeding
```bash
# Live insertion of category seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/tool-categories \
  --model tool-category \
  --apply
```

### 3. Updating an Existing Tool Category
```bash
# Update fields for an existing category by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model tool-category \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/tool-categories/category-update.json
```

### 4. Deleting a Tool Category
```bash
# Delete a tool category by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model tool-category \
  --id "65f8a123bc45de6789012345"
```

### 5. Tool Category Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from category list and detail pages.
- [ ] **Static Params:** `generateStaticParams()` returns all published category slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/tools/category/${category.slug}`.
- [ ] **Structured Data:** Valid `CollectionPage` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `ToolCategory.getSitemap()` and sets real `lastModified` dates on each category entry.

