# Gallery (`Gallery`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Gallery` model, including its data contract, media album showcase implementation, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores image galleries and photo albums in MongoDB under the `Gallery` collection (accessed via REST slug `website-gallery`).

### Schema Fields & Types

```typescript
interface GalleryImage {
  title: string;
  description: string;
  image: string;                                        // CDN / S3 asset URL
}

interface GalleryItem {
  _id: string;
  title: string;                                        // Album title (required)
  slug: string;                                         // URL identifier (required)
  description?: string;                                 // Album summary
  images: GalleryImage[];                               // Image list (required)
  status: 'active' | 'inactive';                        // Workflow status
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag
}
```

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/gallery/page.js`)

```javascript
// site/app/gallery/page.js
import { Gallery, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Media Gallery | Photos & Project Showcase',
  description: 'Browse our high-resolution photo galleries and visual media albums.',
  path: '/gallery',
});

export default async function GalleryIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  const { items: albums, total, totalPages } = await Gallery.paginate({ page, limit });

  const galleryAlbums = albums.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    coverImage: item.images?.[0]?.image || '/assets/gallery/default.webp',
    imageCount: item.images?.length || 0,
  }));

  return (
    <main data-section="gallery-index">
      {/* Presentation JSX receives { galleryAlbums, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/gallery/[slug]/page.js`)

```javascript
// site/app/gallery/[slug]/page.js
import { notFound } from 'next/navigation';
import { Gallery, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const slugs = await Gallery.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Gallery.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleGalleryPage({ params }) {
  'use cache';

  const { slug } = await params;
  const album = await Gallery.readOne(slug);

  if (!album) {
    notFound();
  }

  return (
    <article data-section="gallery-detail">
      {/* Presentation JSX receives album and album.images */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Gallery content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/galleries/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/galleries \
  --model gallery
```

### 2. Live Seeding
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/galleries \
  --model gallery \
  --apply
```

### 3. Updating an Existing Gallery
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model gallery \
  --id "65f8a123bc45de6789012345" \
  --file update.json
```

### 4. Deleting a Gallery
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model gallery \
  --id "65f8a123bc45de6789012345"
```

