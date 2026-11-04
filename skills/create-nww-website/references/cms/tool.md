# Tool (`WebsiteTool`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteTool` model, including its data contract, list page implementation, single tool page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores interactive utility and calculator tools in MongoDB under the `WebsiteTool` collection (accessed via REST slug `website-tool`).

### Schema Fields & Types

```typescript
interface ToolItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Tool title (required, e.g. "Mortgage Calculator")
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description?: string;                                 // Short introductory summary
  icon?: string;                                        // Icon image URL or SVG identifier
  metaTitle?: string;                                   // SEO title override (falls back to title)
  metaDescription?: string;                             // SEO description override (falls back to description)
  before_content?: string;                              // Rich-text / HTML content displayed above interactive widget
  after_content?: string;                               // Rich-text / HTML content displayed below interactive widget
  faqs?: Array<{                                        // Embedded tool FAQs for rich snippets
    question: string;
    answer: string;
  }>;
  tags?: string[];                                      // Array of WebsiteTag ObjectIds or string tokens
  status: 'draft' | 'published' | 'archived';           // Workflow status ('published' for production site)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Critical REST Routing & Status Conventions
1. **Endpoint Mount**: The REST resource is mounted at `/api/website-tool` (not `/api/tool`).
2. **Status Parameter**: While backend default query filter is `status: "active"`, the schema enum is strictly `["draft", "published", "archived"]`. Queries and seeders must explicitly pass `status=published`.

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/tools/page.js`)

```javascript
// site/app/tools/page.js
import { Tool, ToolCategory, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Free Online Tools & Calculators | Our Platform',
  description: 'Explore our directory of free web-based calculators, converters, and developer utilities.',
  path: '/tools',
});

export default async function ToolsIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;
  const search = params?.q || '';

  // Fetches published tools and category taxonomy
  const [{ items: tools, total, totalPages }, { items: categories }] = await Promise.all([
    Tool.paginate({ page, limit, search }),
    ToolCategory.paginate({ limit: 50 }),
  ]);

  // Data mapping for presentation components
  const showcasedTools = tools.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    description: item.description || item.metaDescription || '',
    icon: item.icon || '/assets/icons/tool-default.svg',
    status: item.status,
    tags: Array.isArray(item.tags) ? item.tags : [],
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="tools-index">
      {/* Presentation JSX receives { showcasedTools, categories, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/tools/[slug]/page.js`)

```javascript
// site/app/tools/[slug]/page.js
import { notFound } from 'next/navigation';
import { Tool, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published tool slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await Tool.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Tool.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleToolPage({ params }) {
  'use cache';

  const { slug } = await params;
  const tool = await Tool.readOne(slug);

  if (!tool) {
    notFound();
  }

  // Structured Data (JSON-LD WebApplication schema with embedded FAQs)
  const jsonLd = Tool.generateJSONLD(tool);

  // Return data payload to single tool presentation layer
  return (
    <article data-section="tool-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives tool, tool.before_content, tool.after_content, tool.faqs */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Tool seeder scripts reside in `skills/create-nww-website/references/cms/seeders/tool/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/tools/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title and slug without network writes
node skills/create-nww-website/references/cms/seeders/tool/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tools \
  --dry-run
```

### 2. Live Seeding with Collision Resolution
```bash
# Live insertion of tool seeds with automated collision handling
node skills/create-nww-website/references/cms/seeders/tool/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tools \
  --auto-slug
```

### 3. Updating an Existing Tool
```bash
# Update fields for an existing tool by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/tool/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/tools/tool-update.json
```

### 4. Deleting a Tool
```bash
# Delete a tool by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/tool/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Tool Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `tools/page.js` and `tools/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published tool slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/tools/${tool.slug}`.
- [ ] **Structured Data:** Valid `WebApplication` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **Interactive Widget Boundary:** Client interactivity is encapsulated strictly inside an isolated leaf component (e.g. `<CalculatorWidget />`), keeping the page shell as a Server Component.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `Tool.getSitemap()` and sets real `lastModified` dates on each tool entry.

