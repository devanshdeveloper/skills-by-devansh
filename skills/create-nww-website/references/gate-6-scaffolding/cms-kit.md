# Class-Based CMS Kit Reference

This reference documents the class-based CMS kit copied verbatim into `site/lib/cms/` during **Stage 6 Scaffolding**. It provides a single consistent pattern across all App Router Server Components for data fetching, SEO metadata generation, structured data (JSON-LD), sitemaps, and AI indexing feeds.

---

## 1. Architecture & Installation

During Stage 6 Scaffolding (Step 5), copy the kit directly into the Next.js site:

```bash
cp -r skills/create-nww-website/references/gate-6-scaffolding/cms-kit/* site/lib/cms/
```

### Core Characteristics
- **Zero External Dependencies:** Plain modern JavaScript (ESM) with JSDoc annotations. Does not require `server-only` or extra npm packages.
- **Pure Static Classes:** All utilities are static class methods (`Blog.readOne()`). Zero class instantiation (`new`), zero mutable module-level state.
- **Unified Site Name:** Every display of the site or brand name reads from `SiteConfig.getName()` which consumes `process.env.SITE_NAME`.
- **Complete OpenGraph Parity:** `SEOHelper` generates composite OpenGraph objects preventing Next.js shallow merge drops.
- **XSS-Safe JSON-LD:** Structured data serializes with `<` escaped as `\u003c`.

---

## 2. Environment Variables Contract

All variables are configured in `site/.env.local` (and documented in `site/.env.example`):

```env
# Human-readable brand/site name used everywhere
SITE_NAME="Acme Corp"

# NWW CMS Backend Connection
SERVER_URL="https://cms.example.com"
CMS_TOKEN="your-cms-token"
REVALIDATE_SECRET="your-revalidate-secret"

# Canonical Site URL
NEXT_PUBLIC_SITE_URL="https://example.com"
NEXT_PUBLIC_PREVIEW_GUARD="true"
```

---

### `SEOHelper` (`site/lib/cms/seo-helper.js`)
Comprehensive SEO metadata and Schema.org structured data generator supporting all standard types and fields:

```javascript
import { SEOHelper } from '@/lib/cms';

// 1. Article / BlogPosting Schema with complete field coverage
const articleJsonLd = SEOHelper.generateJSONLD('BlogPosting', {
  title: 'Building Resilient Next.js Systems',
  summary: 'In-depth guide to modern web architecture in 2026.',
  slug: 'resilient-systems',
  image: '/assets/blog-hero.webp',
  postedAt: '2026-03-01T08:00:00Z',
  updatedAt: '2026-03-05T12:00:00Z',
  author: { name: 'Devansh', url: 'https://example.com/team/devansh' },
  tags: ['Next.js', 'Architecture'],
  category: 'Engineering',
  content: '<p>Full body text...</p>',
});

// 2. FAQPage Schema
const faqJsonLd = SEOHelper.generateJSONLD('FAQPage', {
  faqs: [
    { question: 'What is NWW?', answer: 'Next Web Works builds high-performance Next.js websites.' },
  ],
});

// 3. Organization or LocalBusiness Schema
const orgJsonLd = SEOHelper.generateJSONLD('Organization', {
  email: 'contact@example.com',
  phone: '+1 (555) 019-2834',
  address: { street: '100 Innovation Way', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' },
  sameAs: ['https://linkedin.com/company/acme', 'https://x.com/acme'],
});

// 4. BreadcrumbList Schema
const breadcrumbsJsonLd = SEOHelper.generateJSONLD('BreadcrumbList', {
  items: [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: 'Article', url: '/blog/resilient-systems' },
  ],
});

// 5. In React Server Components / Pages:
// Render directly via safe <Schema /> component
import { Schema } from '@/components/seo/Schema';

<Schema schema={articleJsonLd} />
```

### Supported Schema.org Types & Fields in `SEOHelper.generateJSONLD`
- **`Article` / `BlogPosting` / `NewsArticle`:** `headline`, `alternativeHeadline`, `description`, `image`, `datePublished`, `dateModified`, `author` (Person/Organization with name, url, image, jobTitle), `publisher` (Organization with name, url, logo), `mainEntityOfPage`, `url`, `articleSection`, `keywords`, `articleBody`, `wordCount`, `inLanguage`, `isAccessibleForFree`, `copyrightYear`.
- **`CreativeWork` / `Project`:** `headline`, `name`, `description`, `image`, `dateCreated`, `datePublished`, `dateModified`, `author` (Client/Organization), `creator`, `publisher`, `mainEntityOfPage`, `url`, `genre`, `keywords`, `inLanguage`.
- **`FAQPage`:** `mainEntity` array of `Question` and `Answer` with `name` and `acceptedAnswer.text`.
- **`Organization` / `LocalBusiness`:** `name`, `legalName`, `url`, `logo`, `image`, `description`, `email`, `telephone`, `address` (PostalAddress), `sameAs` (social profile links), `contactPoint`, `priceRange`, `geo`, `openingHoursSpecification`.
- **`WebSite`:** `name`, `url`, `description`, `publisher`, `potentialAction` (SearchAction), `inLanguage`.
- **`WebPage` / `AboutPage` / `ContactPage`:** `name`, `headline`, `description`, `url`, `isPartOf` (WebSite), `primaryImageOfPage`, `inLanguage`.
- **`BreadcrumbList`:** `itemListElement` array of `ListItem` with `position`, `name`, and `item` URL.
- **`Service`:** `name`, `serviceType`, `description`, `provider`, `areaServed`, `url`, `image`, `offers` (price, priceCurrency).
- **`Product`:** `name`, `description`, `image`, `sku`, `brand`, `offers` (price, availability, url).
- **`Review` / `Testimonial`:** `author`, `reviewBody`, `reviewRating` (ratingValue, bestRating), `itemReviewed`, `datePublished`.
- **`Person`:** `name`, `jobTitle`, `image`, `url`, `sameAs`.

---

## 4. Universal 8-Function Standard Across Content Models

Every content model in the kit (`Blog`, `Project`, `PageConfig`, `Service`, `Testimonial`, `FAQ`) implements the complete 8-function suite:

| Function | Purpose | Typical Next.js Usage |
|---|---|---|
| `readOne(identifier)` | Fetches single published record by slug/ID | Single page segment (`[slug]/page.js`) |
| `paginate({ page, limit, status, ... })` | Fetches filtered, paginated record list | Index/archive routes (`page.js`) |
| `getSlugs({ limit })` | Returns published slug string array | `generateStaticParams()` prerendering |
| `getRelated(item, limit)` | Returns siblings sharing category/tags | "Related Items" recommendation rail |
| `generateMetadata(identifier, options)` | Builds shallow-merge-safe Next.js Metadata | Page segment `generateMetadata()` |
| `generateJSONLD(item)` | Generates Schema.org JSON-LD object | Injected via `<Schema schema={jsonLd} />` |
| `getSitemap(siteUrl)` | Compiles dynamic sitemap entries | Dynamic sitemap handler (`app/sitemap.js`) |
| `getLLMsTxt(siteUrl)` | Formats structured Markdown feed | AI crawler endpoint (`app/llms.txt/route.js`) |

---

## 5. Model Inventory & Usage Recipes

### `SiteConfig` (`site/lib/cms/site-config.js`)
Centralized accessor for site identity and canonical URL:
```javascript
import { SiteConfig } from '@/lib/cms';

const siteName = SiteConfig.getName(); // Reads process.env.SITE_NAME
const siteUrl = SiteConfig.getUrl();   // Reads SITE_URL or NEXT_PUBLIC_SITE_URL
```

### `Blog` (`site/lib/cms/blog.js`)
Universal article querying, pagination, SEO metadata, sitemaps, and feeds:

#### List Page (`site/app/blog/page.js`)
```javascript
import { Blog } from '@/lib/cms';

export const revalidate = 60;

export default async function BlogPage({ searchParams }) {
  const { page = '1' } = await searchParams;
  const { items, totalPages, currentPage } = await Blog.paginate({
    page: parseInt(page, 10),
    limit: 10,
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog & Insights</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((post) => (
          <article key={post._id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-400 mb-4">{post.summary}</p>
            <a href={`/blog/${post.slug}`} className="text-blue-500 hover:underline">Read article &rarr;</a>
          </article>
        ))}
      </div>
    </main>
  );
}
```

#### Detail Page (`site/app/blog/[slug]/page.js`)
```javascript
import { notFound } from 'next/navigation';
import { Blog, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export async function generateStaticParams() {
  const slugs = await Blog.getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await Blog.generateMetadata(slug);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await Blog.readOne(slug);
  if (!post) notFound();

  const jsonLd = Blog.generateJSONLD(post);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Schema schema={jsonLd} />
      <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
```

#### Dynamic Sitemap (`site/app/sitemap.js`)
```javascript
import { Blog, SiteConfig } from '@/lib/cms';

export default async function sitemap() {
  const baseUrl = SiteConfig.getUrl();
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  const blogRoutes = await Blog.getSitemap(baseUrl);
  return [...staticRoutes, ...blogRoutes];
}
```

#### AI Indexing Feed (`site/app/llms.txt/route.js`)
```javascript
import { Blog, SiteConfig } from '@/lib/cms';

export async function GET() {
  const content = await Blog.getLLMsTxt(SiteConfig.getUrl());
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

### `Project` (`site/lib/cms/project.js`)
Portfolio case studies querying, pagination, static parameters, and SEO metadata:
```javascript
import { Project, SEOHelper } from '@/lib/cms';

// List Page
export default async function ProjectsPage({ searchParams }) {
  const { page = '1' } = await searchParams;
  const { items, totalPages } = await Project.paginate({ page: parseInt(page, 10), limit: 12 });
  // render items...
}

// Single Project Page
export async function generateStaticParams() {
  const slugs = await Project.getSlugs({ limit: 50 });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await Project.generateMetadata(slug);
}
```

### `PageConfig` (`site/lib/cms/page-config.js`)
Fetch page-level overrides and metadata:
```javascript
import { PageConfig } from '@/lib/cms';

export async function generateMetadata() {
  return await PageConfig.generateMetadata('about', {
    title: 'About Our Mission',
    description: 'Learn about our engineering philosophy and company history.',
  });
}
```

### `Service` (`site/lib/cms/service.js`)
Service offerings querying, pagination, static parameters, and SEO:
```javascript
import { Service, SEOHelper } from '@/lib/cms';

// List Page
export default async function ServicesPage() {
  const { items } = await Service.paginate({ page: 1, limit: 20 });
  // render services...
}

// Single Service Page
export async function generateStaticParams() {
  const slugs = await Service.getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await Service.generateMetadata(slug);
}
```

### `FAQ` (`site/lib/cms/faq.js`)
FAQ collection querying, Accordion data, and automated Schema.org `FAQPage`:
```javascript
import { FAQ } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export default async function FAQSection() {
  const { items: faqs } = await FAQ.paginate({ page: 1, limit: 50 });
  const faqSchema = await FAQ.generateJSONLD(faqs);

  return (
    <section>
      <Schema schema={faqSchema} />
      {/* render accordion... */}
    </section>
  );
}
```

### `Testimonial` (`site/lib/cms/testimonial.js`)
Verified client reviews and endorsements with Schema.org `Review` markup:
```javascript
import { Testimonial, SEOHelper } from '@/lib/cms';

export default async function TestimonialsSection() {
  const { items: reviews } = await Testimonial.paginate({ page: 1, limit: 10 });
  // render testimonial slider / cards...
}
```

### `Lead` (`site/lib/cms/lead.js`)
Submit contact inquiries server-side:
```javascript
import { Lead } from '@/lib/cms';

export async function submitContactAction(formData) {
  'use server';
  return await Lead.submit({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });
}
```

---

## 4. On-Demand ISR Revalidation

The revalidation route handler (`site/app/api/revalidate/route.js`) purges cache on CMS webhooks:

```javascript
import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { ContentHelper } from '@/lib/cms';

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!secret || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { resource = 'blog' } = await request.json().catch(() => ({}));
  const tag = ContentHelper.tagFor(resource);

  // Next.js 16.4+ stale-while-revalidate invalidation profile
  revalidateTag(tag, 'max');

  return Response.json({ revalidated: true, tag });
}
```

