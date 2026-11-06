# Page Configuration Model & Integration Specification (`WebsitePageConfig`)

This reference provides the unified technical specification for the NWW CMS `WebsitePageConfig` model (`website-page-config`), defining the pure page-level configuration contract, Next.js page metadata integration, layout shell controls, structured data generation, and companion seeder workflows.

## Table of Contents
- [1. Model & Separation of Concerns](#1-model--separation-of-concerns)
- [2. Implementation on Next.js Pages [Exact Code without the JSX]](#2-implementation-on-nextjs-pages-exact-code-without-the-jsx)
- [3. Layout & Shell Integration [Exact Code without the JSX]](#3-layout--shell-integration-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model & Separation of Concerns

The `WebsitePageConfig` model defines a **pure page-level configuration contract**:

- **Next.js Code Owns (100% in Repository):**
  - All JSX structure, Tailwind CSS classes, component trees, and layout wrappers.
  - Section components (`HeroSection.js`, `FeaturesSection.js`, `FaqSection.js`, `CtaSection.js`).
  - Animations, GSAP scroll triggers, asset rendering, and client hydration.
- **CMS Model Owns (`WebsitePageConfig`):**
  - Page identity & routing (`slug`, `path`, `status`).
  - Search Engine Optimization (`metaTitle`, `metaDescription`, `canonicalUrl`, `keywords`, `noIndex`, `noFollow`).
  - Social Graph previews (`ogTitle`, `ogDescription`, `ogImage`, `twitterCard`).
  - Conversion CTA controls (`showCTA`, `ctaHeadline`, `ctaSubtext`, `ctaButtonText`, `ctaButtonLink`, `ctaSecondaryButtonText`, `ctaSecondaryButtonLink`).
  - Page-specific FAQs (`faqs: [{ question, answer }]`) and automated `FAQPage` JSON-LD.
  - Hero micro-copy overrides (`heroBadge`, `heroHeadline`, `heroSubtext`).
  - Shell & layout flags (`headerVariant`, `showFooter`, `banner`).
  - Arbitrary page parameters & tracking tags (`metadata` Map).

### Complete Mongoose Model Schema

```javascript
const mongoose = require('mongoose');

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const websitePageConfigSchema = new mongoose.Schema(
  {
    // 1. Identity & Routing
    title: { type: String, required: true, trim: true }, // e.g. "Home Page", "About Us", "Fleet Charging"
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    }, // "home", "about", "services", "contact", "pricing"
    path: { type: String, required: true, trim: true }, // "/", "/about", "/services"
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },

    // 2. SEO & Crawler Directives
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },

    // 3. Social Graph & OpenGraph Previews
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image'],
      default: 'summary_large_image',
    },

    // 4. Schema.org JSON-LD Type
    structuredDataType: {
      type: String,
      enum: ['WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'Organization'],
      default: 'WebPage',
    },

    // 5. Conversion CTA Section Controls
    showCTA: { type: Boolean, default: true },
    ctaHeadline: { type: String, trim: true },
    ctaSubtext: { type: String, trim: true },
    ctaButtonText: { type: String, trim: true, default: 'Get Started' },
    ctaButtonLink: { type: String, trim: true, default: '/contact' },
    ctaSecondaryButtonText: { type: String, trim: true },
    ctaSecondaryButtonLink: { type: String, trim: true },

    // 6. Page-Specific FAQs (Powers both on-page Accordion and FAQPage JSON-LD)
    faqs: [faqItemSchema],

    // 7. Hero Micro-Copy Overrides (Optional dynamic copy overrides for Next.js Hero)
    heroBadge: { type: String, trim: true },
    heroHeadline: { type: String, trim: true },
    heroSubtext: { type: String, trim: true },

    // 8. Shell & Layout Flags (Consumed by Next.js Root/Page Layout)
    headerVariant: {
      type: String,
      enum: ['default', 'transparent', 'minimal', 'hidden'],
      default: 'default',
    },
    showFooter: { type: Boolean, default: true },
    banner: {
      enabled: { type: Boolean, default: false },
      text: { type: String, trim: true },
      link: { type: String, trim: true },
    },

    // 9. Arbitrary Custom Page Variables & Tracking Tags
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // 10. Multi-Tenancy & Governance
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Composite unique index: One config per slug per website tenant
websitePageConfigSchema.index({ website: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('WebsitePageConfig', websitePageConfigSchema);
```

---

## 2. Implementation on Next.js Pages [Exact Code without the JSX]

### Server Component Integration (`site/app/page.js` or `site/app/<route>/page.js`)

```javascript
// site/app/page.js
import { PageConfig, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

/**
 * 1. Next.js Dynamic Metadata API
 * Extracts SEO tags, OpenGraph cards, Twitter cards, and crawler robots rules via PageConfig helper.
 */
export async function generateMetadata() {
  return PageConfig.generateMetadata('home', {
    title: 'Home Page',
    description: 'Welcome to our website.',
    path: '/',
  });
}

/**
 * 2. Page Server Component
 * Consumes hero micro-copy overrides, conversion CTA controls, and FAQs.
 */
export default async function HomePage() {
  'use cache';

  const config = await PageConfig.readOne('home');

  // Automated Schema.org structured data (WebPage, AboutPage, ContactPage, FAQPage)
  const jsonLd = await PageConfig.generateJSONLD(config);

  // Data payload mapping for presentation layer
  const pageData = {
    // Hero micro-copy overrides (fallback to defaults if undefined)
    hero: {
      badge: config?.heroBadge,
      headline: config?.heroHeadline,
      subtext: config?.heroSubtext,
    },
    // FAQs array for accordion rendering
    faqs: config?.faqs || [],
    // Conversion CTA section toggles & copy
    cta: {
      show: config?.showCTA !== false,
      headline: config?.ctaHeadline,
      subtext: config?.ctaSubtext,
      buttonText: config?.ctaButtonText || 'Get Started',
      buttonLink: config?.ctaButtonLink || '/contact',
      secondaryButtonText: config?.ctaSecondaryButtonText,
      secondaryButtonLink: config?.ctaSecondaryButtonLink,
    },
    metadata: config?.metadata || {},
  };

  // Return data payload to presentation layer
  return (
    <main data-section="home-page">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives pageData and renders Section components */}
    </main>
  );
}
```

---

## 3. Layout & Shell Integration [Exact Code without the JSX]

The layout layer consumes `headerVariant`, `banner`, and `showFooter` from `WebsitePageConfig` to control global navigation styling and global chrome without touching page-level section components.

### Layout Implementation Pattern (`site/app/layout.js` or `site/app/(sub)/layout.js`)

```javascript
// site/app/layout.js
import { PageConfig } from '@/lib/cms';

export default async function SubPageLayout({ children, params }) {
  const currentSlug = (await params)?.slug || 'home';
  const config = await PageConfig.readOne(currentSlug);

  // Shell controls
  const headerVariant = config?.headerVariant || 'default'; // 'default' | 'transparent' | 'minimal' | 'hidden'
  const showFooter = config?.showFooter !== false;
  const banner = config?.banner?.enabled ? config.banner : null;

  return (
    <div className={`layout-shell header-${headerVariant}`}>
      {/* 1. Dynamic Announcement Banner */}
      {banner && (
        <aside className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
          <a href={banner.link}>{banner.text} &rarr;</a>
        </aside>
      )}

      {/* 2. Global Navigation rendered with appropriate variant */}
      {headerVariant !== 'hidden' && (
        <header data-variant={headerVariant}>
          {/* Global Header Chrome */}
        </header>
      )}

      {/* 3. Page Content */}
      {children}

      {/* 4. Global Footer (conditional) */}
      {showFooter && (
        <footer>
          {/* Global Footer Chrome */}
        </footer>
      )}
    </div>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The Page Configuration content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/page-configs/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema constraints, kebab-case slugs, and required path without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/page-configs \
  --model page-config
```

### 2. Live Seeding Page Configs
```bash
# Live insertion of page configurations into WebsitePageConfig (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/page-configs \
  --model page-config \
  --apply
```

### 3. Updating an Existing Page Config
```bash
# Update page config fields by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model page-config \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/page-configs/home-update.json
```

### 4. Deleting a Page Config
```bash
# Delete a page config by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model page-config \
  --id "65f8a123bc45de6789012345"
```

### 5. Page Configuration Implementation Binary QA Checklist
- [ ] **Slug Formatting:** `slug` is lowercase alphanumeric kebab-case matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
- [ ] **Path Declaration:** `path` represents the actual route segment (e.g. `/`, `/about`, `/contact`).
- [ ] **SEO & Metadata:** `metaTitle`, `metaDescription`, `canonicalUrl`, and `openGraph` correctly reflect in `generateMetadata()`.
- [ ] **Structured Data:** Automated `FAQPage` JSON-LD generated when `faqs` array contains 1+ questions.
- [ ] **CTA Controls:** `showCTA`, `ctaHeadline`, and `ctaButtonLink` dynamically govern the page conversion banner.
- [ ] **Shell Directives:** `headerVariant` and `banner` successfully modulate the layout header chrome.

