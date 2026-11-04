# Project (Portfolio) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Project` (Portfolio) model, including its data contract, list page implementation, single page implementation, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page [Exact Code without the JSX]](#3-implementation-on-single-model-page-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores showcase portfolio items in MongoDB under the `Project` collection (accessed via REST slug `project`).

### Schema Fields & Types

```typescript
interface ProjectItem {
  _id: string;                                          // MongoDB ObjectId string
  title: string;                                        // Project title (min 2 characters, required)
  slug: string;                                         // Globally unique URL identifier (lowercase kebab-case, required)
  client?: string;                                      // Client / company name
  summary?: string;                                     // Plain-text brief summary/excerpt (fallback to truncated content)
  content?: string;                                     // In-depth case study HTML rich-text body
  cover_image?: string;                                 // Banner showcase image URL (1200x630px, HTTPS recommended)
  image?: string;                                       // Card thumbnail & OpenGraph fallback image URL
  gallery?: string[];                                   // Array of project screenshot or detail image URLs
  status: 'draft' | 'pending' | 'published' | 'archived'; // Workflow status ('published' for live website)
  order?: number;                                       // Sorting weight (default: 0)
  metaTitle?: string;                                   // SEO title override (falls back to title)
  metaDescription?: string;                             // SEO description override (falls back to summary)
  liveUrl?: string;                                     // External production link
  githubUrl?: string;                                   // Public or client code repository link
  year?: string | number;                               // Completion year
  postedAt?: string;                                    // ISO 8601 publication timestamp
  editTimeFields?: boolean;                             // Must be true when manually specifying postedAt on creation
  metadata?: {                                          // REQUIRED: Mongoose strict-mode container for taxonomies
    category?: string;                                  // Primary industry or project type
    tags?: string[];                                    // Keyword tags
    technologies?: string[];                            // Tech stack badges (e.g. Next.js, Tailwind, TypeScript)
    results?: string[];                                 // Metric callouts (e.g. "+140% Conversion")
    [key: string]: any;
  };
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Critical Mongoose Strict-Mode Rule
The backend Mongoose `Project` schema enforces strict mode without top-level `technologies` or `tags` schema keys. Taxonomies and arbitrary attributes must strictly reside in `metadata`:
```json
{
  "title": "Fintech Analytics Platform",
  "slug": "fintech-analytics-platform",
  "client": "Apex Financial",
  "status": "published",
  "metadata": {
    "category": "Fintech",
    "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
    "results": ["+240% Speed Improvement", "100k DAU"]
  }
}
```

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/projects/page.js`)

```javascript
// site/app/projects/page.js
import { Project, SEOHelper } from '@/lib/cms';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Portfolio & Case Studies | Our Work',
  description: 'Explore our selected portfolio of full-stack web applications, digital products, and client success stories.',
  path: '/projects',
});

export default async function ProjectsIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = 12;

  // Fetches published portfolio items via Project helper
  const { items: projects, total, totalPages } = await Project.paginate({ page, limit });

  // Data mapping for presentation components
  const showcasedProjects = projects.map((item) => ({
    id: item._id,
    title: item.title,
    slug: item.slug,
    client: item.client || 'Client Confidential',
    summary: item.summary || (item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 155) + '...' : ''),
    coverImage: item.image || item.cover_image || '/assets/project-default.webp',
    technologies: Array.isArray(item.metadata?.technologies)
      ? item.metadata.technologies
      : Array.isArray(item.metadata?.tags)
      ? item.metadata.tags
      : [],
    category: item.metadata?.category || 'Web Application',
    liveUrl: item.liveUrl || null,
    order: item.order || 0,
  }));

  // Return data payload to page presentation layer
  return (
    <main data-section="projects-index">
      {/* Presentation JSX receives { showcasedProjects, page, totalPages, total } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/projects/[slug]/page.js`)

```javascript
// site/app/projects/[slug]/page.js
import { notFound } from 'next/navigation';
import { Project, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce static build rendering
export const ensureStatic = 'navigation';

/**
 * Pre-renders all published project slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await Project.getSlugs({ limit: 100 });
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generates dynamic SEO metadata with shallow-merge safety.
 */
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const parentOg = (await parent).openGraph?.images || [];
  return Project.generateMetadata(slug, { parentImages: parentOg });
}

export default async function SingleProjectPage({ params }) {
  'use cache';

  const { slug } = await params;
  const project = await Project.readOne(slug);

  if (!project) {
    notFound();
  }

  // Structured Data (JSON-LD)
  const jsonLd = Project.generateJSONLD(project);

  // Return data payload to single project presentation layer
  return (
    <article data-section="project-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives project */}
    </article>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Project seeder scripts reside in `skills/create-nww-website/references/cms/seeders/project/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/projects/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required title and slug, and metadata without network writes
node skills/create-nww-website/references/cms/seeders/project/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/projects \
  --dry-run
```

### 2. Live Seeding with Collision Resolution
```bash
# Live insertion of project seeds with automated collision handling
node skills/create-nww-website/references/cms/seeders/project/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/projects \
  --auto-slug
```

### 3. Updating an Existing Project
```bash
# Update fields for an existing project by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/project/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/projects/project-update.json
```

### 4. Deleting a Project
```bash
# Delete a project by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/project/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Project Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `projects/page.js` and `projects/[slug]/page.js`.
- [ ] **Static Params:** `generateStaticParams()` returns all published project slugs.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/projects/${project.slug}`.
- [ ] **Open Graph Merging:** `openGraph` specifies title, description, URL, and spreads parent images.
- [ ] **Structured Data:** Valid `CreativeWork` JSON-LD rendered with `<` Unicode escaping (`\\u003c`).
- [ ] **LCP Hero Image:** Exactly one hero banner image applies `fetchPriority="high"` (or `preload={true}`) with explicit width/height.
- [ ] **INP Architecture:** Project routes are 100% Server Components with zero root `'use client'` hydration.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `getAllProjects()` and sets real `lastModified` dates on each project entry.

