# Website Tag (`WebsiteTag`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteTag` taxonomy model, including its data contract, category/tag filtering UI implementation, Core Web Vitals rules, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation with Category / Tag Filtering UI [Exact Code without the JSX]](#2-implementation-with-category--tag-filtering-ui-exact-code-without-the-jsx)
- [3. Taxonomical Filtering & Dynamic Routes [Exact Code without the JSX]](#3-taxonomical-filtering--dynamic-routes-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores taxonomies, filtering tags, and badges in MongoDB under the `WebsiteTag` collection (accessed via REST slug `website-tag`).

### Schema Fields & Types

```typescript
interface WebsiteTagItem {
  _id: string;                                          // MongoDB ObjectId string
  name: string;                                         // Tag display label (required, min 1 char)
  value?: string;                                       // Tag URL slug / identifier (lowercase kebab-case)
  type?: string;                                        // Classification type (default: 'general', e.g. 'category', 'technology')
  level?: number;                                       // Hierarchy level (default: 1)
  color?: string;                                       // Optional HEX color badge (e.g. '#3b82f6')
  description?: string;                                 // Optional descriptive summary
  status: 'active' | 'inactive';                        // Tag status ('active' for live websites)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

---

## 2. Implementation with Category / Tag Filtering UI [Exact Code without the JSX]

### Server Component Implementation (`site/components/common/TagFilter.jsx`)

```javascript
// site/components/common/TagFilter.jsx
import { Tag } from '@/lib/cms';

export async function TagFilter({ activeTag, type = 'general' }) {
  'use cache';

  // Fetches all active tags of given classification type
  const tags = await Tag.paginate({ type, status: 'active', limit: 50 });

  const filterOptions = tags.map((t) => ({
    id: t._id,
    label: t.name,
    value: t.value || t.name.toLowerCase().replace(/\s+/g, '-'),
    color: t.color || null,
    isActive: (t.value || t.name.toLowerCase()) === (activeTag || '').toLowerCase(),
  }));

  return { filterOptions };
}
```

---

## 3. Taxonomical Filtering & Dynamic Routes [Exact Code without the JSX]

Tags enable dynamic URL segment filtering across blog, portfolio, and service modules:

```javascript
// site/app/blog/tags/[tag]/page.js
import { Blog, Tag, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const tags = await Tag.paginate({ type: 'blog', status: 'active' });
  return tags.map((t) => ({ tag: t.value || t.name.toLowerCase() }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return SEOHelper.generateMetadata({
    title: `Articles tagged with "${tag}" | Blog`,
    description: `Browse all articles, guides, and tutorials filed under ${tag}.`,
    path: `/blog/tags/${tag}`,
  });
}

export default async function TaggedBlogPage({ params }) {
  'use cache';
  const { tag } = await params;
  const { items: articles } = await Blog.paginate({ tag });

  return { articles, tag };
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Website Tag seeder scripts reside in `skills/create-nww-website/references/cms/seeders/tag/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/tags/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required name without network writes
node skills/create-nww-website/references/cms/seeders/tag/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tags \
  --dry-run
```

### 2. Live Seeding with Collision Resolution
```bash
# Live insertion of tag seeds with automated collision handling
node skills/create-nww-website/references/cms/seeders/tag/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tags \
  --auto-slug
```

### 3. Updating an Existing Tag
```bash
# Update fields for an existing tag by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/tag/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/tags/tag-update.json
```

### 4. Deleting a Tag
```bash
# Delete a tag by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/tag/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Tag Implementation Binary QA Checklist
- [ ] **Static Params:** `generateStaticParams()` returns all active tag values for dynamic taxonomy routes.
- [ ] **Canonical URL:** `generateMetadata` exports valid canonical paths for tag listings.
- [ ] **INP Architecture:** Tag filtering controls use lightweight server links or searchParams navigation without client bundle bloat.

