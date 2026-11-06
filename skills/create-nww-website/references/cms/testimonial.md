# Testimonial (`Testimonial`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Testimonial` model, including its data contract, social proof showcase implementation, Schema.org `Review` structured data injection, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Section Component [Exact Code without the JSX]](#3-implementation-on-section-component-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores client testimonials and reviews in MongoDB under the `Testimonial` collection (accessed via REST slug `testimonial`).

### Schema Fields & Types

```typescript
interface TestimonialItem {
  _id: string;                                          // MongoDB ObjectId string
  name: string;                                         // Client / Reviewer name (required)
  content: string;                                      // Review text body or quote (required)
  title?: string;                                       // Reviewer position / job title (e.g. "VP of Operations")
  company?: string;                                     // Reviewer company / organization
  avatar?: string;                                      // Profile image URL or CDN asset
  rating?: number;                                      // Rating score (1-5, default: 5)
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

### Server Component Implementation (`site/app/testimonials/page.js`)

```javascript
// site/app/testimonials/page.js
import { Testimonial, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Client Reviews & Testimonials | What Clients Say',
  description: 'Read reviews and verified feedback from partners and clients who built with our platform.',
  path: '/testimonials',
});

export default async function TestimonialsIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published testimonials
  const { items: testimonials, total, totalPages } = await Testimonial.paginate({ page, limit });

  // Map review items for presentation
  const reviews = testimonials.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.title || 'Client',
    company: t.company || '',
    quote: t.content || '',
    avatar: t.avatar || '/assets/avatars/default.webp',
    rating: t.rating || 5,
  }));

  return (
    <main data-section="testimonials-index">
      {/* Presentation JSX receives { reviews, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Section Component [Exact Code without the JSX]

For in-page testimonial carousels or review grids embedded inside landing pages:

```javascript
// In-page Testimonials showcase section
import { Testimonial } from '@/lib/cms';

export async function LandingTestimonialsSection({ limit = 6 }) {
  const { items: testimonials } = await Testimonial.paginate({ limit });

  const reviews = testimonials.map((t) => ({
    id: t._id,
    name: t.name,
    role: t.title || '',
    company: t.company || '',
    quote: t.content,
    avatar: t.avatar,
    rating: t.rating || 5,
  }));

  return (
    <section data-section="landing-testimonials">
      {/* Presentation JSX receives reviews */}
    </section>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Testimonial content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/testimonials/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, name and content without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/testimonials \
  --model testimonial
```

### 2. Live Seeding
```bash
# Live insertion of testimonial seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/testimonials \
  --model testimonial \
  --apply
```

### 3. Updating an Existing Testimonial
```bash
# Update fields for an existing testimonial by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model testimonial \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/testimonials/testimonial-update.json
```

### 4. Deleting a Testimonial
```bash
# Delete a testimonial by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model testimonial \
  --id "65f8a123bc45de6789012345"
```

### 5. Testimonial Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `testimonials/page.js`.
- [ ] **Image Optimization:** Testimonial avatars apply explicit width/height and WebP format.
- [ ] **Accessible Quotations:** Quotes wrapped in `<figure>` and `<blockquote>` with `<figcaption>` attributing the speaker.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` includes `/testimonials` with priority `0.6`.

