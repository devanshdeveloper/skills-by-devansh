# Blog Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Blog` model, including its data contract, list page implementation, single page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores articles in MongoDB under the `Blog` collection.

### Schema Fields & Types

```typescript
interface BlogPost {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Article headline (min 2 characters, required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  content: string;                                      // Full article HTML rich-text body (required)
  summary?: string;                                     // Plain-text summary/excerpt (fallback to truncated content)
  cover_image?: string;                                 // Banner hero image URL (1200x630px, HTTPS recommended)
  image?: string;                                       // Card thumbnail & OpenGraph fallback image URL
  status: 'draft' | 'pending' | 'published' | 'archived'; // Workflow status ('published' for live website)
  order?: number;                                       // Sorting weight (default: 0)
  metaTitle?: string;                                   // SEO title override (falls back to title)
  metaDescription?: string;                             // SEO description override (falls back to summary)
  author_name?: string;                                 // Author display name string
  author_image?: string;                                // Author avatar image URL
  author?: {                                            // Author sugar object
    mode?: 'manual' | 'existing';
    name?: string;
    image?: string;
    url?: string;
  };
  postedAt?: string;                                    // ISO 8601 publication timestamp (e.g. '2026-01-05T08:00:00Z')
  editTimeFields?: boolean;                             // Must be true when manually specifying postedAt on creation
  metadata?: {                                          // REQUIRED: Mongoose strict-mode container for taxonomies
    category?: string;                                  // Primary category name or slug
    tags?: string[];                                    // Classification keyword tags
    [key: string]: any;
  };
  lastUpdatedAt?: string;                               // ISO 8601 editorial update timestamp
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Critical Mongoose Strict-Mode Rule
The backend Mongoose `Blog` schema enforces strict mode without top-level `category` or `tags` schema keys. Any `category` or `tags` passed at the root of a payload are **silently stripped on save**. Taxonomies must strictly be placed inside `metadata`:
```json
{
  "title": "Article Title",
  "slug": "article-title",
  "content": "<p>Content...</p>",
  "metadata": {
    "category": "Technology",
    "tags": ["nextjs", "cms", "fullstack"]
  }
}
```

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/blog/page.js`)

```javascript
// site/app/blog/page.js
import { Blog, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Blog | Latest Articles & Insights',
  description: 'Explore our latest articles, case studies, and engineering updates.',
  path: '/blog',
});

export default async function BlogIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 10;

  // Fetches published articles with defensive future-date filtering
  const { items: posts, total, totalPages } = await Blog.paginate({ page, limit });

  // Data mapping for presentation components
  const articles = posts.map((post) => ({
    id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.summary || post.metaDescription || (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 155) + '...' : ''),
    coverImage: post.image || post.cover_image || '/assets/og-default.webp',
    date: post.postedAt || post.createdAt,
    author: {
      name: post.author?.name || post.author_name || 'Editorial Team',
      avatar: post.author?.image || post.author_image || '/assets/default-avatar.webp',
    },
    category: post.metadata?.category || post.category || 'General',
    tags: Array.isArray(post.metadata?.tags) ? post.metadata.tags : [],
  }));

  // Return data payload to page presentation layer
  return {
    articles,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
```

### Dynamic Sitemap Generator (`site/app/sitemap.js`)

```javascript
// site/app/sitemap.js
import { Blog, SiteConfig } from '@/lib/cms';

export default async function sitemap() {
  const siteUrl = SiteConfig.getUrl();
  const blogEntries = await Blog.getSitemap(siteUrl);

  return [
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogEntries,
  ];
}
```

### List Page SEO & Architecture Rules
1. **Server Component Architecture (INP Protection):** The blog index page must remain a **100% React Server Component**. Root pages must NEVER declare `'use client'`. Interactive islands (such as filter dropdowns or search bars) must be isolated into compact leaf components.

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Route Segment & Data Layer (`site/app/blog/[slug]/page.js`)

```javascript
// site/app/blog/[slug]/page.js
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { Blog, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  // Prerender published blog posts at build time
  const slugs = await Blog.getSlugs({ limit: 50 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Blog.generateMetadata(slug, { parentImages: parentOg });
}

export async function loadBlogPostData(slug) {
  'use cache';
  cacheLife('max');
  cacheTag('cms:blog');

  const post = await Blog.readOne(slug);
  if (!post || (post.status && post.status !== 'published')) {
    notFound();
  }

  // Schema.org BlogPosting structured data via class helper
  const jsonLd = Blog.generateJSONLD(post);

  return {
    post,
    jsonLd,
  };
}
```

### Single Page SEO, Core Web Vitals & Media Rules
1. **LCP Hero Image Acceleration:** Apply `fetchPriority="high"` (or `preload={true}`) to **exactly ONE** featured hero image per page. Do NOT apply to secondary images.
2. **CLS Elimination:** Every hero and article image must declare explicit `width` and `height` attributes (e.g., `width={1200} height={630}`) or use `fill` with an explicit container aspect ratio. Serve images in WebP or AVIF format processed through the asset optimization pipeline.
3. **Open Graph Replacement Trap:** Next.js shallowly merges metadata objects across route segments. Child metadata completely replaces parent `openGraph`. Always extract parent images (`(await parent).openGraph?.images || []`) and explicitly provide `title`, `description`, `url`, `type: 'article'`, `publishedTime`, `modifiedTime`, `authors`, and `images` (handled automatically by `Blog.generateMetadata()`).
4. **JSON-LD Schema Injection:** Render structured data using the `<Schema schema={jsonLd} />` component (`@/components/seo/Schema`), which automatically serializes the schema and escapes `<` characters to `\u003c` to eliminate XSS and script-breakout vulnerabilities.
5. **AI Search Guidance & Optional Indexing:**
   - **No Artificial LLM Gimmicks:** Do not inject artificial HTML anchors, micro-summaries, or synthetic chunk delimiters designed for LLM retrieval. Google relies on standard web indexing, HTML structure, and content quality.
   - **Optional `llms.txt` Feeds:** Google Search does not consume `llms.txt`, but `Blog.getLLMsTxt(siteUrl)` is available in the kit as an optional, low-priority utility for external developer tools.
   - **Standard Schemas:** Stick strictly to Schema.org `BlogPosting` markup.

---

## 4. Running the Seeder [Exact Code without the JSX]

The blog content operations are managed via the companion `content-pipeline` CLI operating directly on JSON files in `project-docs/client-review/gate-5-cms-content/blog/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, Mongoose metadata nesting, and required fields without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --model blog
```

### 2. Live Seeding
```bash
# Live insertion of blog seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --model blog \
  --apply
```

### 3. Updating an Existing Post
```bash
# Update fields for an existing post by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model blog \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/blog-update.json
```

### 4. Deleting a Post
```bash
# Delete a post by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model blog \
  --id "65f8a123bc45de6789012345"
```

### 5. Content Pipeline SEO Audit Utility
Verify static prerendering, canonical tags, JSON-LD, Open Graph article tags, and CWV thresholds:
```bash
# Display SEO check options
node skills/create-nww-website/scripts/content-pipeline/index.js seo-check --help
```

# Run audit on generated Next.js site
node skills/create-nww-website/scripts/blog-seo-audit/index.js --dir ./site --strict
```

### 6. Blog Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `blog/page.js` and `blog/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published blog slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/blog/${post.slug}`.
- [ ] **Open Graph Merging:** `openGraph` specifies `type: 'article'`, dates, authors, and spreads parent images.
- [ ] **Structured Data:** Valid `BlogPosting` JSON-LD rendered with `<` Unicode escaping (`\\u003c`).
- [ ] **LCP Hero Image:** Exactly one hero image applies `fetchPriority="high"` (or `preload={true}`) with explicit width/height.
- [ ] **INP Architecture:** Blog routes are 100% Server Components with zero root `'use client'` hydration.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries CMS and sets real `lastModified` dates on each post entry.
- [ ] **AI Cleanliness:** Zero speculative non-standard schemas or artificial chunking delimiters; `llms.txt` is treated strictly as an optional developer utility.
