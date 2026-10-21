# SEO Strategy & Structured Data Specification

Stage 4 establishes the search engine optimization (SEO) architecture for the entire site. It guarantees that every page complies with technical SEO best practices, rich structured data, keyword targeting, and canonical integrity.

The output deliverable is saved to `project-docs/seo-strategy.md`.

---

## Research Protocol

1. **Competitor & Reference Fetches:** Fetch competitor URLs using web-fetch to inspect live meta tags, heading hierarchies, and keywords. Cap research at 15 fetches total; if blocked or timed out, mark as "unverified" and continue.
2. **Strict Verification Rules:** Never fabricate search volume metrics or keyword difficulty numbers. If third-party volume tools are unavailable, mark secondary keywords as `needs-tool-validation`.

---

## Technical SEO Architecture

### 1. Root Metadata Configuration (`site/app/layout.js`)
- Configure `metadataBase` with the production canonical domain (`https://example.com`).
- Setup global title template:
  ```javascript
  // site/app/layout.js
  export const metadata = {
    metadataBase: new URL('https://example.com'),
    title: {
      default: 'Brand Name — Primary Service or Tagline',
      template: '%s | Brand Name',
    },
    description: 'Concise global fallback description for the site...',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: 'Brand Name',
      images: [
        {
          url: '/assets/og-default.webp',
          width: 1200,
          height: 630,
          alt: 'Brand Name',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
  ```

### 2. Strict Heading Hierarchy
- **Single `<h1>` Rule:** Exactly one `<h1>` element per page, placed within the hero section containing the primary keyword topic.
- **Logical Progression:** `<h2>` for major sections; `<h3>` for cards/grid items. Never skip levels (e.g. `<h1>` followed directly by `<h3>`).

### 3. Canonical URLs & Internal Linking
- Every page must have a self-referential canonical URL.
- Every page must be reachable within **3 clicks** from Home.
- Internal links must use descriptive anchor text (avoid "Click here" or "Read more").

### 4. Structured Data (JSON-LD)
Embed schemas using `site/components/JsonLd.js`. Schema markup must strictly match visible page content:
- `Organization` / `LocalBusiness`: On root layout or Home page.
- `BreadcrumbList`: On all deep interior and service pages.
- `Article` / `BlogPosting`: On dynamic CMS blog detail pages (`/blog/[slug]`).
- `FAQPage`: Only where visible accordion FAQs exist on the page.

### 5. Automated Sitemaps & Robots (`app/sitemap.js` & `app/robots.js`)
- `site/app/sitemap.js`: Returns an array of objects (`url`, `lastModified`, `changeFrequency`). For CMS blog posts, reads via `cmsFetch` tagged with resource tag `cms:blog`.
- `site/app/robots.js`: Generates crawling rules allowing legitimate search bots and referencing `/sitemap.xml`. Staging environments are set to `noindex`.

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
- [ ] Every page has a unique primary keyword and search intent.
- [ ] Titles are <= 60 characters; meta descriptions are <= 155 characters.
- [ ] Exactly one `h1` planned per page.
- [ ] JSON-LD schema types mapped to visible page content.
- [ ] 301 redirect map planned for all existing legacy URLs (if migrating).
- [ ] User approves `project-docs/seo-strategy.md` before initiating Stage 5 (Layout Theory).
