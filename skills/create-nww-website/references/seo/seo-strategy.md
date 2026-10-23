# SEO Strategy & Structured Data Specification

Stage 4 establishes the search engine optimization (SEO) architecture for the entire site. It guarantees that every page complies with technical SEO best practices, rich structured data, keyword targeting, and canonical integrity.

The output deliverable is saved to `project-docs/seo-strategy.md`.

---

## Pre-Stage Skills & Tool Availability Check

Before commencing Stage 4 (SEO Strategy), verify whether the following specialized SEO agent skills are loaded in your agent environment. If missing, load them before starting research and strategy authoring:

```bash
DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill ai-seo
DISABLE_TELEMETRY=1 npx skills add https://github.com/anthropics/knowledge-work-plugins --skill seo-audit
```

*Fallback rule:* If any skill installation fails or is restricted in the execution environment, proceed using the built-in SEO architecture and technical specifications outlined in this document.

### SEO Tool Library & Upfront Availability Audit
Consult [seo-tool-library.md](seo-tool-library.md) and [seo-tool-registry.json](seo-tool-registry.json) to conduct the mandatory **Tool Availability Check** across the 8 audit categories (Search Performance, Analytics, Crawlers, Speed/CWV, Structured Data, Keywords/Backlinks, Indexation/Rendering, and AI/GEO Search):
- Determine whether data sources are **Connected** (API/MCP), **Export-Based** (CSV/XLSX), or **Manual**.
- Record detected modes and fallback paths in section 1 of `project-docs/seo-strategy.md`.
- Never claim to have run a tool that is not connected. If third-party volume or crawler tools are absent, request user export files using the prompts in [seo-tool-library.md](seo-tool-library.md) or mark unverified metrics as `needs-tool-validation`.

---

## Research Protocol

1. **Competitor & Reference Fetches:** Fetch competitor URLs using web-fetch to inspect live meta tags, heading hierarchies, and keywords. Cap research at 15 fetches total; if blocked or timed out, mark as "unverified" and continue.
2. **Strict Verification Rules:** Never fabricate search volume metrics or keyword difficulty numbers. If third-party volume tools are unavailable, mark secondary keywords as `needs-tool-validation`.

---

## Technical SEO Architecture

### 1. Root Metadata Configuration (`site/app/layout.js`)

Configure root metadata in `site/app/layout.js` covering every field supported by the Next.js App Router `Metadata` API:

```javascript
// site/app/layout.js
import { headers } from 'next/headers';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

/** @type {import('next').Metadata} */
export const metadata = {
  // 1. URL and Base Resolution
  metadataBase: new URL(siteUrl),

  // 2. Document Title (default, template, and absolute support)
  title: {
    default: 'Brand Name — Modern Web Development Agency',
    template: '%s | Brand Name',
  },

  // 3. Page Description & Core Metadata
  description: 'High-performance Next.js websites and headless digital experiences engineered with structural rigor and taste-driven aesthetics.',
  applicationName: 'Brand Name Agency',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Next.js Development Agency',
    'Custom Web Design',
    'Headless CMS Integration',
    'Core Web Vitals Optimization',
    'Enterprise Web Applications',
  ],
  authors: [
    { name: 'Brand Strategy Team', url: `${siteUrl}/about` },
  ],
  creator: 'Brand Agency Studio',
  publisher: 'Brand Holdings LLC',

  // 4. Format Detection (prevents unwanted iOS / mobile DOM link mutations)
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // 5. Canonical URLs & Alternate Feeds / Multi-Language Hreflang
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      // 'es-ES': '/es', // Add localized paths if multi-language is enabled in client-answers.md
    },
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },

  // 6. Open Graph (Facebook, LinkedIn, Discord, Slack rich previews)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Brand Name',
    title: 'Brand Name — High-Performance Web Development Agency',
    description: 'High-performance Next.js websites and headless digital experiences engineered with structural rigor.',
    images: [
      {
        url: '/assets/og-default.webp',
        secureUrl: `${siteUrl}/assets/og-default.webp`,
        width: 1200,
        height: 630,
        alt: 'Brand Name — Web Development Agency',
        type: 'image/webp',
      },
    ],
  },

  // 7. Twitter / X Card Metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Name — High-Performance Web Development Agency',
    description: 'High-performance Next.js websites and headless digital experiences.',
    site: '@BrandHandle',
    creator: '@BrandHandle',
    images: ['/assets/og-default.webp'],
  },

  // 8. Search Crawler & Robot Directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 9. Icons & Favicon Manifest
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon-precomposed.png',
      },
    ],
  },

  // 10. Web App Manifest & Mobile Web Configuration
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Brand Name',
    statusBarStyle: 'default',
  },

  // 11. Search Console & Webmaster Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-token',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || 'bing-verification-token',
    },
  },

  // 12. Classification & Custom Meta Directives
  category: 'technology',
  classification: 'Business & Information Technology Services',
  other: {
    'rating': 'general',
    'distribution': 'global',
  },
};
```

#### Dynamic Route Metadata Pattern (`generateMetadata`)
For dynamic routes (`site/app/blog/[slug]/page.js` or `site/app/services/[slug]/page.js`), author `generateMetadata` resolving parameters dynamically:

```javascript
// site/app/blog/[slug]/page.js
export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = post.image || post.cover_image || '/assets/og-default.webp';

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.postedAt,
      modifiedTime: post.lastUpdatedAt || post.postedAt,
      authors: [post.author?.name || 'Brand Editorial Team'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.cover_image_alt || post.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: [ogImage],
    },
  };
}
```

---

### 2. Strict Heading Hierarchy
- **Single `<h1>` Rule:** Exactly one `<h1>` element per page, placed within the hero section containing the primary keyword topic.
- **Logical Progression:** `<h2>` for major sections; `<h3>` for cards/grid items. Never skip levels (e.g. `<h1>` followed directly by `<h3>`).

---

### 3. Canonical URLs & Internal Linking
- Every page must have a self-referential canonical URL.
- Every page must be reachable within **3 clicks** from Home.
- Internal links must use descriptive anchor text (avoid "Click here" or "Read more").

---

### 4. Structured Data (JSON-LD) Specification

Embed schemas using `site/components/JsonLd.js`. Schema markup must strictly match visible page content with zero fabricated claims:

#### Reusable Server Component (`site/components/JsonLd.js`)
```javascript
// site/components/JsonLd.js
export default function JsonLd({ schema }) {
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### Core Schema Type Specifications

1. **`Organization` & `Corporation` (Root Layout or Home):**
   ```javascript
   export const organizationSchema = {
     '@context': 'https://schema.org',
     '@type': 'Organization',
     '@id': 'https://example.com/#organization',
     name: 'Brand Name Agency',
     url: 'https://example.com',
     logo: {
       '@type': 'ImageObject',
       url: 'https://example.com/assets/brand-logo.png',
       width: 512,
       height: 512,
     },
     description: 'Modern Next.js web design and development agency.',
     foundingDate: '2020-01-01',
     sameAs: [
       'https://twitter.com/BrandHandle',
       'https://linkedin.com/company/brand-handle',
       'https://github.com/brand-handle',
     ],
     contactPoint: [
       {
         '@type': 'ContactPoint',
         telephone: '+1-555-0199',
         contactType: 'customer support',
         email: 'contact@example.com',
         areaServed: 'US',
         availableLanguage: ['en'],
       },
     ],
     address: {
       '@type': 'PostalAddress',
       streetAddress: '100 Innovation Way, Suite 400',
       addressLocality: 'San Francisco',
       addressRegion: 'CA',
       postalCode: '94105',
       addressCountry: 'US',
     },
   };
   ```

2. **`LocalBusiness` / `ProfessionalService` (For Local & Regional Clients):**
   ```javascript
   export const localBusinessSchema = {
     '@context': 'https://schema.org',
     '@type': 'ProfessionalService',
     '@id': 'https://example.com/#localbusiness',
     name: 'Brand Name Agency',
     image: 'https://example.com/assets/office-exterior.webp',
     telephone: '+1-555-0199',
     email: 'hello@example.com',
     url: 'https://example.com',
     priceRange: '$$$',
     address: {
       '@type': 'PostalAddress',
       streetAddress: '100 Innovation Way',
       addressLocality: 'San Francisco',
       addressRegion: 'CA',
       postalCode: '94105',
       addressCountry: 'US',
     },
     geo: {
       '@type': 'GeoCoordinates',
       latitude: 37.7749,
       longitude: -122.4194,
     },
     openingHoursSpecification: [
       {
         '@type': 'OpeningHoursSpecification',
         dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
         opens: '09:00',
         closes: '18:00',
       },
     ],
     areaServed: ['San Francisco Bay Area', 'California', 'Global Online'],
   };
   ```

3. **`WebSite` with Sitelinks Searchbox (Root Layout):**
   ```javascript
   export const websiteSchema = {
     '@context': 'https://schema.org',
     '@type': 'WebSite',
     '@id': 'https://example.com/#website',
     url: 'https://example.com',
     name: 'Brand Name',
     description: 'High-performance Next.js web agency.',
     publisher: {
       '@id': 'https://example.com/#organization',
     },
     potentialAction: {
       '@type': 'SearchAction',
       target: {
         '@type': 'EntryPoint',
         urlTemplate: 'https://example.com/search?q={search_term_string}',
       },
       'query-input': 'required name=search_term_string',
     },
   };
   ```

4. **`BreadcrumbList` (Interior & Service Routes):**
   ```javascript
   export function createBreadcrumbSchema(items) {
     return {
       '@context': 'https://schema.org',
       '@type': 'BreadcrumbList',
       itemListElement: items.map((item, index) => ({
         '@type': 'ListItem',
         position: index + 1,
         name: item.name,
         item: item.url.startsWith('http') ? item.url : `https://example.com${item.url}`,
       })),
     };
   }
   // Usage on /services/web-development:
   // createBreadcrumbSchema([
   //   { name: 'Home', url: '/' },
   //   { name: 'Services', url: '/services' },
   //   { name: 'Web Development', url: '/services/web-development' },
   // ])
   ```

5. **`Article` / `BlogPosting` (CMS Blog Post Detail Routes):**
   ```javascript
   export function createBlogPostingSchema(post) {
     return {
       '@context': 'https://schema.org',
       '@type': 'BlogPosting',
       '@id': `https://example.com/blog/${post.slug}#article`,
       headline: post.title,
       description: post.metaDescription || post.excerpt,
       image: [post.image || post.cover_image || 'https://example.com/assets/og-default.webp'],
       datePublished: post.postedAt,
       dateModified: post.lastUpdatedAt || post.postedAt,
       mainEntityOfPage: {
         '@type': 'WebPage',
         '@id': `https://example.com/blog/${post.slug}`,
       },
       author: {
         '@type': 'Person',
         name: post.author?.name || 'Brand Team Member',
         url: post.author?.profileUrl || 'https://example.com/about',
       },
       publisher: {
         '@id': 'https://example.com/#organization',
       },
       wordCount: post.wordCount || 1200,
       articleSection: post.category || 'Engineering',
       inLanguage: 'en-US',
     };
   }
   ```

6. **`FAQPage` (Only Where Visible Accordion FAQs Exist):**
   ```javascript
   export function createFaqSchema(faqs) {
     return {
       '@context': 'https://schema.org',
       '@type': 'FAQPage',
       mainEntity: faqs.map(faq => ({
         '@type': 'Question',
         name: faq.question,
         acceptedAnswer: {
           '@type': 'Answer',
           text: faq.answer,
         },
       })),
     };
   }
   ```

7. **`Service` (Service Pages):**
   ```javascript
   export function createServiceSchema({ serviceName, description, route }) {
     return {
       '@context': 'https://schema.org',
       '@type': 'Service',
       serviceType: serviceName,
       provider: {
         '@id': 'https://example.com/#organization',
       },
       description: description,
       areaServed: {
         '@type': 'Country',
         name: 'United States',
       },
       hasOfferCatalog: {
         '@type': 'OfferCatalog',
         name: `${serviceName} Tiers`,
       },
     };
   }
   ```

8. **`Product` / `SoftwareApplication` (SaaS / Software Products):**
   ```javascript
   export function createSoftwareSchema({ name, description, price, currency = 'USD' }) {
     return {
       '@context': 'https://schema.org',
       '@type': 'SoftwareApplication',
       name: name,
       description: description,
       applicationCategory: 'BusinessApplication',
       operatingSystem: 'Cloud-based',
       offers: {
         '@type': 'Offer',
         price: price || '0.00',
         priceCurrency: currency,
         availability: 'https://schema.org/InStock',
       },
     };
   }
   ```

9. **`VideoObject` (Embedded Media Hero or Explainer Video):**
   ```javascript
   export function createVideoSchema({ name, description, thumbnailUrl, uploadDate, duration, contentUrl }) {
     return {
       '@context': 'https://schema.org',
       '@type': 'VideoObject',
       name: name,
       description: description,
       thumbnailUrl: [thumbnailUrl],
       uploadDate: uploadDate,
       duration: duration || 'PT2M30S', // ISO 8601 duration
       contentUrl: contentUrl,
     };
   }
   ```

---

### 5. Automated Sitemaps & Robots (`app/sitemap.js` & `app/robots.js`)

Implement production-ready dynamic generators using Next.js `MetadataRoute` interfaces:

#### 1. Dynamic Sitemap Generator (`site/app/sitemap.js`)
```javascript
// site/app/sitemap.js
import { cmsFetch, tagFor } from '@/lib/cms/client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

/** @type {() => Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  // 1. Core static routes with explicit priority and change frequency
  const staticRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // 2. Dynamic CMS Blog Posts (fetched using cached, tagged reader)
  let blogRoutes = [];
  try {
    const blogData = await cmsFetch('/api/blog/paginate?page=1&limit=500', {
      next: { tags: [tagFor('blog')] },
    });
    if (blogData && Array.isArray(blogData.items)) {
      blogRoutes = blogData.items
        .filter(post => post.status === 'published' && !post.deleted)
        .map(post => ({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: new Date(post.lastUpdatedAt || post.postedAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
    }
  } catch (err) {
    console.error('Sitemap generator failed to fetch dynamic blog posts:', err.message);
  }

  return [...staticRoutes, ...blogRoutes];
}
```

#### 2. Environment-Gated Robots Generator (`site/app/robots.js`)
```javascript
// site/app/robots.js
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const isPreviewGuardActive = process.env.NEXT_PUBLIC_PREVIEW_GUARD === 'true';
const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

/** @type {() => import('next').MetadataRoute.Robots} */
export default function robots() {
  // Guard condition: Staging, development, or pre-launch branches must NEVER be indexed
  if (isPreviewGuardActive || !isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  // Production Rules: Allow legitimate search crawlers and AI search answer engines
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/*_buildManifest.js',
          '/*_middlewareManifest.js',
        ],
      },
      {
        // Explicitly prioritize Googlebot with crawl-delay respect
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        // Explicitly prioritize Bingbot
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        // Allow Search/Citation AI bots for answer engine discovery (ChatGPT Search, Perplexity)
        userAgent: ['OAI-SearchBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        // Restrict bulk LLM model training scrapers if specified in client-answers.md
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot'],
        disallow: ['/'],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
    ],
    host: siteUrl,
  };
}
```

---

## Deliverable Structure (`project-docs/seo-strategy.md`)

`project-docs/seo-strategy.md` must contain these 15 sections:

1. **Goal & Audience Search Intent Summary:** Commercial, informational, navigational, transactional breakdown.
2. **Page-by-Page SEO Matrix:**
   | Slug | Route | Primary Keyword | Search Intent | Secondary Keywords | Title (<=60 chars) | Description (<=155 chars) | Indexing | Canonical |
   |---|---|---|---|---|---|---|---|---|
   | `home` | `/` | Web Development Agency | Commercial | nextjs dev, ui design | Modern Web Development Agency | Scale your brand with high-performance... | index | `/` |
   *(Rule: strictly one primary keyword per page. No keyword cannibalization).*
3. **Keyword Sourcing:** Explicit tags for each keyword: `from-client`, `from-competitor-fetch`, or `needs-tool-validation`.
4. **Heading Rules:** Single `h1` placement and hierarchy logic.
5. **URL Rules:** Lowercase, short, hyphenated slugs without file extensions or dates.
6. **Internal Linking Map:** 3–6 target destinations, planned anchor text, and source components per page.
7. **Structured Data Plan:** Schema type mappings and required JSON-LD properties per page.
8. **Indexation Plan:** List of pages to noindex (thank-you pages, staging, admin).
9. **Social Sharing Strategy:** OG image specs (1200x630, WebP/JPG) and card fallbacks.
10. **Internationalization Plan:** Single-language statement or `hreflang` / locale routing rules if multi-language.
11. **Migration SEO (if applicable):** Full 301 redirect map (old URL -> 301 -> target route) and traffic baseline preservation plan.
12. **Performance & Content Rules for Build:** Explicit image dimensions, WebP format, `priority` applied only to LCP candidate, and no layout shift from animations.
13. **Analytics & Webmaster Setup:** GA4 Measurement ID, Search Console verification method, sitemap submission steps.
14. **CMS Integration Rules (if `cms` mode active):** All dynamic routes and sitemaps read via `cmsFetch` using tag `cms:blog`. Fallback rules for missing CMS fields (e.g. title used for `cover_image_alt`, HTML-stripped text for excerpts).
15. **Open Questions:** Client follow-up items regarding SEO inputs.

---

## Gate 4 Review Checklist

Before presenting to the user for Gate 4 sign-off:
- [ ] Pre-stage SEO skills checked and tool availability matrix recorded in `project-docs/seo-strategy.md`.
- [ ] Every page has a unique primary keyword and search intent.
- [ ] Titles are <= 60 characters; meta descriptions are <= 155 characters.
- [ ] Exactly one `h1` planned per page.
- [ ] JSON-LD schema types mapped to visible page content.
- [ ] 301 redirect map planned for all existing legacy URLs (if migrating).
- [ ] User approves `project-docs/seo-strategy.md` before initiating Stage 5 (Page Specifications).
