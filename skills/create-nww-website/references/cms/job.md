# Job (`WebsiteJob`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteJob` model, including its data contract, careers list page implementation, single job opening implementation, Schema.org `JobPosting` structured data injection, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores employment opportunities in MongoDB under the `WebsiteJob` collection (accessed via REST slug `website-job`).

### Schema Fields & Types

```typescript
interface JobItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Job title (required, e.g. "Senior Frontend Engineer")
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description: string;                                  // Job description, responsibilities & requirements HTML (required)
  startDate: string;                                    // Application open date (ISO 8601, required)
  endDate: string;                                      // Application deadline date (ISO 8601, required)
  city: string;                                         // Job location city (required)
  state: string;                                        // Job location state / province (required)
  country: string;                                      // Job location country (required)
  attachments?: string[];                               // Associated PDF job specs or JD files
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

### Server Component Implementation (`site/app/careers/page.js`)

```javascript
// site/app/careers/page.js
import { Job, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Careers & Open Positions | Join Our Team',
  description: 'Explore open job positions, engineering roles, and career opportunities at our company.',
  path: '/careers',
});

export default async function CareersIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published job openings
  const { items: jobs, total, totalPages } = await Job.paginate({ page, limit });

  // Data mapping for presentation components
  const jobListings = jobs.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    location: [item.city, item.state, item.country].filter(Boolean).join(', '),
    deadline: item.endDate,
    description: item.description,
  }));

  return (
    <main data-section="careers-index">
      {/* Presentation JSX receives { jobListings, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/careers/[slug]/page.js`)

```javascript
// site/app/careers/[slug]/page.js
import { notFound } from 'next/navigation';
import { Job, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const slugs = await Job.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Job.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleJobPage({ params }) {
  'use cache';

  const { slug } = await params;
  const job = await Job.readOne(slug);

  if (!job) {
    notFound();
  }

  // Structured Data (JSON-LD JobPosting schema)
  const jsonLd = Job.generateJSONLD(job);

  return (
    <article data-section="job-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives job */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Job content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/jobs/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/jobs \
  --model job
```

### 2. Live Seeding
```bash
# Live insertion of job seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/jobs \
  --model job \
  --apply
```

### 3. Updating an Existing Job
```bash
# Update fields for an existing job by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model job \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/jobs/job-update.json
```

### 4. Deleting a Job
```bash
# Delete a job by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model job \
  --id "65f8a123bc45de6789012345"
```

