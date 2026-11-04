# Article (`Article`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Article` model, including its data contract, press & editorial articles list page implementation, single article page implementation, Schema.org `Article` structured data injection, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores editorial articles, company announcements, and press publications in MongoDB under the `Article` collection (accessed via REST slug `website-article`).

### Schema Fields & Types

```typescript
interface ArticleItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Article title (required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description: string;                                  // Article summary / excerpt (required)
  content: string;                                      // Rich-text / HTML body content (required)
  image: string;                                        // Featured cover image URL (required)
  author_name: string;                                  // Display author name (required)
  author_image: string;                                 // Author avatar image URL (required)
  author_position: string;                              // Author job title / credential (required)
  author?: string;                                      // Linked User ObjectId ref
  industry?: string;                                    // Industry ObjectId ref
  services?: string[];                                  // Array of WebsiteService ObjectId refs
  tags?: string[];                                      // Array of WebsiteTag ObjectId refs
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

### Server Component Implementation (`site/app/articles/page.js`)

```javascript
// site/app/articles/page.js
import { Article, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Articles & Insights | Latest Publications',
  description: 'Read the latest editorial analysis, engineering articles, and corporate announcements.',
  path: '/articles',
});

export default async function ArticlesIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  const { items: articles, total, totalPages } = await Article.paginate({ page, limit });

  const articleCards = articles.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    image: item.image,
    author: {
      name: item.author_name,
      avatar: item.author_image,
      role: item.author_position,
    },
    publishedAt: item.createdAt,
  }));

  return (
    <main data-section="articles-index">
      {/* Presentation JSX receives { articleCards, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/articles/[slug]/page.js`)

```javascript
// site/app/articles/[slug]/page.js
import { notFound } from 'next/navigation';
import { Article, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const slugs = await Article.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Article.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleArticlePage({ params }) {
  'use cache';

  const { slug } = await params;
  const article = await Article.readOne(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = Article.generateJSONLD(article);

  return (
    <article data-section="article-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives article */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Article seeder scripts reside in `skills/create-nww-website/references/cms/seeders/article/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/articles/`.

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/references/cms/seeders/article/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/articles \
  --dry-run
```

### 2. Live Seeding
```bash
node skills/create-nww-website/references/cms/seeders/article/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/articles \
  --auto-slug
```

