# Pure Page-Level Config Model Specification (`WebsitePageConfig`)

This model defines a **pure page-level configuration contract**. All layouts, component trees, styling, and HTML content are engineered and rendered exclusively by Next.js. The CMS solely manages routing metadata, SEO rules, OpenGraph preview cards, high-level shell toggles, conversion CTA controls, page FAQs, and marketing variables.

---

## 1. Separation of Concerns

- **Next.js Owns (100% in Code):**
  - All JSX structure, design system tokens, typography, and responsive layouts.
  - Section components (`HeroSection.js`, `FeaturesSection.js`, `FaqSection.js`, `CtaSection.js`).
  - GSAP animations, scroll triggers, client interactivity, and asset rendering via `ResponsiveImage.js`.
- **CMS Model Owns (`WebsitePageConfig`):**
  - Page identity (`slug`, `path`, `status`).
  - Search Engine Optimization (`metaTitle`, `metaDescription`, `canonicalUrl`, `keywords`, `noIndex`, `noFollow`).
  - Social Graph & Cards (`ogTitle`, `ogDescription`, `ogImage`, `twitterCard`).
  - **Conversion CTA Controls:** `showCTA`, `ctaHeadline`, `ctaSubtext`, `ctaButtonText`, `ctaButtonLink`.
  - **Page-Specific FAQs:** `faqs` array (`[{ question, answer }]`) + automated `FAQPage` JSON-LD schema.
  - **Hero Micro-Copy Overrides:** `heroBadge`, `heroHeadline`, `heroSubtext`.
  - High-level shell flags (`headerVariant`, `showFooter`, `banner`).
  - Arbitrary page parameters & feature flags (`metadata` Map).

---

## 2. API Endpoints

- **Mount Path:** `/api/website-page-config`
- **Paginate (List):** `GET /api/website-page-config/paginate` (Supports `?slug=:slug`)
- **Read by Slug:** `GET /api/website-page-config/read-one-by-slug/:slug`
- **Read by ID:** `GET /api/website-page-config/read-one/:id`
- **Create Config:** `POST /api/website-page-config/create-one`
- **Update Config:** `PUT /api/website-page-config/update-one/:id`
- **Delete Config:** `DELETE /api/website-page-config/delete-one/:id`
- **Revalidation Tag:** `cms:page-config`

---

## 3. Mongoose Model Schema (`website-page-config.model.js`)

```javascript
// src/features/website/page-config/website-page-config.model.js
const mongoose = require('mongoose');

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true }
}, { _id: false });

const websitePageConfigSchema = new mongoose.Schema({
  // 1. Identity & Routing
  title: { type: String, required: true, trim: true }, // e.g. "Home Page", "About Us", "Fleet Charging"
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  }, // "home", "about", "services", "contact", "pricing"
  path: { type: String, required: true, trim: true },  // "/", "/about", "/services"
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
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
    default: 'summary_large_image'
  },

  // 4. Schema.org JSON-LD Type
  structuredDataType: {
    type: String,
    enum: ['WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'Organization'],
    default: 'WebPage'
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
    default: 'default'
  },
  showFooter: { type: Boolean, default: true },
  banner: {
    enabled: { type: Boolean, default: false },
    text: { type: String, trim: true },
    link: { type: String, trim: true }
  },

  // 9. Arbitrary Custom Page Variables & Tracking Tags
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // 10. Multi-Tenancy & Governance
  website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Composite unique index: One config per slug per website tenant
websitePageConfigSchema.index({ website: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('WebsitePageConfig', websitePageConfigSchema);
```

---

## 4. Seeder JSON Payload Example

File: `project-docs/cms-seed/page-home.json`

```json
{
  "title": "Home Page",
  "slug": "home",
  "path": "/",
  "status": "published",
  "metaTitle": "Minit Charger | Fleet EV Fast Charging Infrastructure",
  "metaDescription": "Turnkey DC fast charging solutions engineered for bus fleets, municipal transit, and commercial logistics.",
  "keywords": ["EV fleet charging", "DC fast charger", "depot charging", "transit electrification"],
  "ogImage": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=630&fit=crop",
  "noIndex": false,
  "noFollow": false,
  "structuredDataType": "Organization",
  "headerVariant": "transparent",
  "showFooter": true,
  "banner": {
    "enabled": true,
    "text": "Discover the new Altus II 180kW depot fast charger",
    "link": "/products/altus-ii"
  },
  "heroBadge": "Fleet Electrification Leaders",
  "heroHeadline": "High-Power Fast Charging Engineered for Heavy-Duty Fleets",
  "heroSubtext": "Deploy depot-scale Level 3 DC fast charging infrastructure with 99.5% uptime guaranteed.",
  "showCTA": true,
  "ctaHeadline": "Ready to Electrify Your Transit Hub?",
  "ctaSubtext": "Speak with our charging infrastructure engineers for custom site modeling and electrical load analysis.",
  "ctaButtonText": "Schedule Feasibility Study",
  "ctaButtonLink": "/contact",
  "ctaSecondaryButtonText": "Explore Altus Products",
  "ctaSecondaryButtonLink": "/products/altus-ii",
  "faqs": [
    {
      "question": "What is the peak power output of the Altus II depot charger?",
      "answer": "The Altus II delivers up to 180 kW continuous DC output with dynamic dual-port load balancing."
    },
    {
      "question": "Can the chargers integrate with our existing fleet telematics?",
      "answer": "Yes, all Minit Charger systems support OCPP 2.0.1 and native API integration with standard transit dispatch platforms."
    },
    {
      "question": "What is the guaranteed service uptime?",
      "answer": "We back our installations with a 99.5% uptime SLA, supported by 24/7 automated telemetry and remote diagnostics."
    }
  ],
  "metadata": {
    "leadFormId": "fleet-depot-inquiry",
    "trackingCampaign": "q4-electrification"
  }
}
```

---

## 5. Next.js App Router Integration

In `site/app/page.js`:

```javascript
import { cmsFetch } from '@/lib/cms/client';
import { HeroSection } from './_components/HeroSection';
import { StatsSection } from './_components/StatsSection';
import { FeaturesSection } from './_components/FeaturesSection';
import { FaqSection } from './_components/FaqSection';
import { CtaSection } from './_components/CtaSection';

// 1. Next.js Metadata API + Automated FAQPage JSON-LD
export async function generateMetadata() {
  const res = await cmsFetch('/api/website-page-config/paginate?slug=home&limit=1', 'page-config');
  const config = res.data?.[0];
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: config.keywords,
    alternates: { canonical: config.canonicalUrl || '/' },
    openGraph: {
      title: config.ogTitle || config.metaTitle,
      description: config.ogDescription || config.metaDescription,
      images: config.ogImage ? [{ url: config.ogImage }] : []
    },
    robots: config.noIndex ? { index: false, follow: !config.noFollow } : undefined
  };
}

// 2. All HTML structure, layout, styling, and GSAP animations are 100% Next.js code
export default async function HomePage() {
  const res = await cmsFetch('/api/website-page-config/paginate?slug=home&limit=1', 'page-config');
  const config = res.data?.[0];

  // Automated Schema.org FAQPage structured data injection
  const faqSchema = config?.faqs?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  } : null;

  return (
    <main>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Optional Top Announcement Banner */}
      {config?.banner?.enabled && (
        <aside className="bg-primary text-white py-2 px-4 text-center text-sm font-medium">
          <a href={config.banner.link}>{config.banner.text} &rarr;</a>
        </aside>
      )}

      {/* Hero with dynamic copy overrides */}
      <HeroSection
        badge={config?.heroBadge}
        headline={config?.heroHeadline}
        subtext={config?.heroSubtext}
      />

      {/* Hardcoded high-performance Next.js sections */}
      <StatsSection />
      <FeaturesSection />

      {/* Dynamic FAQs populated from CMS config */}
      {config?.faqs?.length > 0 && (
        <FaqSection items={config.faqs} />
      )}

      {/* Dynamic CTA Banner controlled by CMS toggles */}
      {config?.showCTA !== false && (
        <CtaSection
          headline={config?.ctaHeadline}
          subtext={config?.ctaSubtext}
          buttonText={config?.ctaButtonText}
          buttonLink={config?.ctaButtonLink}
          secondaryButtonText={config?.ctaSecondaryButtonText}
          secondaryButtonLink={config?.ctaSecondaryButtonLink}
        />
      )}
    </main>
  );
}
```
