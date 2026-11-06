# Event (`WebsiteEvent`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteEvent` model, including its data contract, events calendar page implementation, single event page implementation, Schema.org `Event` structured data injection, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores corporate events, webinars, workshops, and meetups in MongoDB under the `WebsiteEvent` collection (accessed via REST slug `website-event`).

### Schema Fields & Types

```typescript
interface EventItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Event title (required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  description: string;                                  // Event summary / description (required)
  startDate: string;                                    // Event start datetime (ISO 8601, required)
  endDate: string;                                      // Event end datetime (ISO 8601, required)
  location: string;                                     // Physical address or "Online / Zoom" (required)
  attachments?: string[];                               // Slide deck or flyer URLs
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

### Server Component Implementation (`site/app/events/page.js`)

```javascript
// site/app/events/page.js
import { Event, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Events & Webinars | Meetups & Conferences',
  description: 'Explore upcoming webinars, product launches, developer conferences, and community meetups.',
  path: '/events',
});

export default async function EventsIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  const { items: events, total, totalPages } = await Event.paginate({ page, limit });

  const eventCards = events.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    description: item.description,
  }));

  return (
    <main data-section="events-index">
      {/* Presentation JSX receives { eventCards, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/events/[slug]/page.js`)

```javascript
// site/app/events/[slug]/page.js
import { notFound } from 'next/navigation';
import { Event, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export const ensureStatic = 'navigation';

export async function generateStaticParams() {
  const slugs = await Event.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Event.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleEventPage({ params }) {
  'use cache';

  const { slug } = await params;
  const event = await Event.readOne(slug);

  if (!event) {
    notFound();
  }

  const jsonLd = Event.generateJSONLD(event);

  return (
    <article data-section="event-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives event */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Event content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/events/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/events \
  --model event
```

### 2. Live Seeding
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/events \
  --model event \
  --apply
```

### 3. Updating an Existing Event
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model event \
  --id "65f8a123bc45de6789012345" \
  --file update.json
```

### 4. Deleting an Event
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model event \
  --id "65f8a123bc45de6789012345"
```

