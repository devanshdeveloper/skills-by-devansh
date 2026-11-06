# Case Study (`CaseStudy`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `CaseStudy` model, including its data contract, list page implementation, single case study page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores deep-dive enterprise client case studies in MongoDB under the `CaseStudy` collection (accessed via REST slug `website-case-study`).

### Schema Fields & Types

```typescript
interface CaseStudyItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Case study headline (required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  clientName: string;                                   // Client or partner organization name (required)
  clientLogo?: string;                                  // Client brand logo URL
  description: string;                                  // Executive summary / brief (required)
  challenge: string;                                    // Problem statement & business obstacles (required)
  solution: string;                                     // Architecture, technology, & approach delivered (required)
  results: string;                                      // Tangible metrics, ROI, & outcome (required)
  image: string;                                        // Banner showcase / thumbnail asset URL (required)
  industry?: string;                                    // Industry ObjectId ref
  services?: string[];                                  // Array of WebsiteService ObjectId refs
  tags?: string[];                                      // Keyword taxonomy tags
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

### Server Component Implementation (`site/app/case-studies/page.js`)

```javascript
// site/app/case-studies/page.js
import { SEOHelper, ContentHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Client Success Stories & Case Studies | Our Work',
  description: 'Explore verified client case studies detailing technical challenges, solutions, and measurable ROI.',
  path: '/case-studies',
});

export default async function CaseStudiesIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published case studies
  const res = await ContentHelper.fetch(
    `/api/website-case-study/paginate?page=${page}&limit=${limit}&status=published`,
    { resource: 'case-study' }
  );

  const rawItems = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
  const total = res?.data?.total || res?.pagination?.totalDocuments || rawItems.length;
  const totalPages = res?.data?.totalPages || res?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const caseStudies = rawItems.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    client: item.clientName,
    summary: item.description,
    image: item.image,
    results: item.results,
  }));

  return (
    <main data-section="case-studies-index">
      {/* Presentation JSX receives { caseStudies, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/case-studies/[slug]/page.js`)

```javascript
// site/app/case-studies/[slug]/page.js
import { notFound } from 'next/navigation';
import { SEOHelper, ContentHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const res = await ContentHelper.fetch(
    '/api/website-case-study/paginate?page=1&limit=100&status=published',
    { resource: 'case-study' }
  );
  const items = res?.data?.items || res?.items || [];
  return items.map((c) => ({ slug: c.slug })).filter((c) => c.slug);
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const res = await ContentHelper.fetch(
    `/api/website-case-study/paginate?slug=${encodeURIComponent(slug)}&status=published`,
    { resource: 'case-study' }
  );
  const caseStudy = res?.data?.items?.[0] || res?.items?.[0];
  if (!caseStudy) return { title: 'Case Study Not Found' };

  const parentOg = (await parent).openGraph?.images || [];
  return SEOHelper.generateMetadata({
    title: `${caseStudy.title} | ${caseStudy.clientName} Case Study`,
    description: caseStudy.description,
    path: `/case-studies/${caseStudy.slug}`,
    image: caseStudy.image,
    parentImages: parentOg,
    type: 'article',
  });
}

export default async function SingleCaseStudyPage({ params }) {
  'use cache';

  const { slug } = await params;
  const res = await ContentHelper.fetch(
    `/api/website-case-study/paginate?slug=${encodeURIComponent(slug)}&status=published`,
    { resource: 'case-study' }
  );
  const caseStudy = res?.data?.items?.[0] || res?.items?.[0];

  if (!caseStudy) {
    notFound();
  }

  const jsonLd = SEOHelper.generateJSONLD({
    title: caseStudy.title,
    description: caseStudy.description,
    image: caseStudy.image,
    url: `/case-studies/${caseStudy.slug}`,
  }, 'article');

  return (
    <article data-section="case-study-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives caseStudy (challenge, solution, results) */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Case Study content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/case-studies/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title, slug, and narrative fields
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/case-studies \
  --model case-study
```

### 2. Live Seeding
```bash
# Live insertion of case study seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/case-studies \
  --model case-study \
  --apply
```

### 3. Updating an Existing Case Study
```bash
# Update fields for an existing case study by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model case-study \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/case-studies/case-study-update.json
```

### 4. Deleting a Case Study
```bash
# Delete a case study by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model case-study \
  --id "65f8a123bc45de6789012345"
```

### 5. Case Study Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `case-studies/page.js` and `case-studies/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published case study slugs.
- [ ] **Structured Data:** Valid `Article` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **Dynamic Sitemap:** `app/sitemap.js` includes all published case study URLs.

