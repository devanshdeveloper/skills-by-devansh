# Stage 5 Batch 02: Building CMS Content Seeds & Schema Mapping

This rulebook governs **Batch 2 of Stage 5**. When CMS integration is active (`cms: cms`), the agent formalizes CMS schema mappings and authors production-grade seed content in `project-docs/client-review/gate-5-cms-content/`, sourcing copy and frontmatter directly from the modular content authored in `client-context/<model>/.../content.md` during Stage 4 SEO Strategy. All deliverables authored in this batch must strictly adhere to the payload schemas and validation rules enforced by the NWW CMS standalone seeders and companion CLI utilities.

## Table of Contents
- [1. Resolving the 28 Open Questions](#1-resolving-the-28-open-questions)
- [2. Mongoose Strict-Mode Rules & Seed Formatting](#2-mongoose-strict-mode-rules--seed-formatting)
  - [2.1 The Critical Mongoose Strict-Mode Rule](#21-the-critical-mongoose-strict-mode-rule)
  - [2.2 Blog Model Schema & Field Specifications](#22-blog-model-schema--field-specifications)
  - [2.3 Canonical Blog Post Seed Payload Template](#23-canonical-blog-post-seed-payload-template)
  - [2.4 Project (Portfolio) Model Schema & Payload Template](#24-project-portfolio-model-schema--payload-template)
  - [2.5 Contact Us Module Schema & Payload Template (Direct Module vs. Forms)](#25-contact-us-module-schema--payload-template-direct-module-vs-forms)
  - [2.6 Page Configurations (`WebsitePageConfig`) Schema & Payload Template](#26-page-configurations-websitepageconfig-schema--payload-template)
  - [2.7 Secondary Active Collections (Services, FAQs, Testimonials, etc.)](#27-secondary-active-collections-services-faqs-testimonials-etc)
- [3. Deliverables in `gate-5-cms-content/`](#3-deliverables-in-gate-5-cms-content)
  - [3.1 Directory Organization Standard](#31-directory-organization-standard)
  - [3.2 Blog Seed Articles (Minimum 3 Records)](#32-blog-seed-articles-minimum-3-records)
  - [3.3 Project (Portfolio) Seed Items](#33-project-portfolio-seed-items)
  - [3.4 Contact Us Test Inquiries (Direct Module)](#34-contact-us-test-inquiries-direct-module)
  - [3.5 Page Configuration Deliverables (`page-configs/`)](#35-page-configuration-deliverables-page-configs)
  - [3.6 Content Master Index (`index.md`)](#36-content-master-index-indexmd)
- [4. Schema Specification (`gate-5-cms-schema/cms-schema.md`)](#4-schema-specification-gate-5-cms-schemacms-schemamd)
- [5. Preflight Seeder Dry-Run Validation](#5-preflight-seeder-dry-run-validation)
- [6. Batch 2 Completion Checklist](#6-batch-2-completion-checklist)

---

## 1. Resolving the 28 Open Questions

Before authoring content seeds:
1. Review `project-docs/client-review/gate-5-cms-requirements/open-questions.md`.
2. Codify the answers into `project-docs/client-review/gate-5-cms-requirements/cms-implementation-rules.md`.
3. Confirm that all endpoints, headers, auth tokens, status enums, and taxonomy mappings match the Verified Multi-Module Route Catalog in [../../cms/rulebook.md](../../cms/rulebook.md).

---

## 2. Mongoose Strict-Mode Rules & Seed Formatting

Every content seed JSON must strictly adhere to the NWW backend model rules and route contracts defined in [../../cms/rulebook.md](../../cms/rulebook.md), [../../cms/blog.md](../../cms/blog.md), [../../cms/project.md](../../cms/project.md), [../../cms/contact-us.md](../../cms/contact-us.md), and [../../cms/page-config.md](../../cms/page-config.md).

### 2.1 The Critical Mongoose Strict-Mode Rule

The NWW CMS MongoDB backend enforces Mongoose strict mode (`strict: true`). Any field not explicitly declared in the collection's top-level schema is **silently stripped on save**.

- **Taxonomy Placement:** The backend schemas for `Blog`, `Project`, and other entities do **NOT** declare top-level `category`, `technologies`, or `tags` keys. Root-level taxonomies are silently dropped.
- **Mandatory `metadata` Container:** All taxonomies (categories, tags, badges, custom attributes) **must** reside inside the `metadata` object:
  ```json
  {
    "title": "Item Headline",
    "slug": "item-headline",
    "metadata": {
      "category": "Technology",
      "tags": ["nextjs", "cms", "fullstack"],
      "technologies": ["Next.js", "TypeScript"]
    }
  }
  ```
- **Timeline Preservation:** The backend automatically overrides `postedAt` with `new Date()` unless `editTimeFields: true` is explicitly provided in the payload. Every seed intended for immediate publication or back-dating must include `"editTimeFields": true`.

---

### 2.2 Blog Model Schema & Field Specifications

Seed payloads for the `Blog` model must conform to the validation rules enforced by `references/cms/seeders/blog/insert.js` and `scripts/cms-seed/lib/schema.js`:

| Field | Type | Required | Validation & Constraints | Purpose / Fallback |
| :--- | :--- | :---: | :--- | :--- |
| `title` | string | **Yes** | Min 2 characters, non-empty, trimmed | Article title displayed in `<h1>` and cards |
| `slug` | string | **Yes** | Lowercase kebab-case (`^[a-z0-9-]+$`) | Unique URL identifier `/blog/[slug]` |
| `content` | string | **Yes** | Non-empty rich HTML string (`<p>`, `<h2>`, `<ul>`, etc.) | Full article body rendered on single page |
| `status` | string | **Yes** | Must be `"published"`, `"draft"`, or `"pending"` | Live site queries only fetch `"published"` |
| `postedAt` | string | **Yes** | Valid ISO 8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Publication timestamp used for sorting and sitemaps |
| `editTimeFields` | boolean | **Yes** | Must be `true` | Tells backend to retain custom `postedAt` |
| `metadata` | object | **Yes** | Must contain `category` (string) and `tags` (string[]) | Mongoose strict-mode container for taxonomies |
| `summary` | string | No | Plain-text excerpt (140-160 characters) | Card summary & `metaDescription` fallback |
| `cover_image` | string | No | HTTPS URL or local optimized asset path | Featured hero image (1200x630px recommended) |
| `image` | string | No | HTTPS URL or local optimized asset path | Card thumbnail & Open Graph fallback |
| `author` | object | No | `{ mode: "manual", name: string, image?: string, url?: string }` | Structured author sugar object |
| `author_name` | string | No | Author display name string | Fallback author name |
| `author_image`| string | No | Author avatar image URL | Fallback author avatar |
| `metaTitle` | string | No | 50-60 character SEO title | Falls back to `title` if omitted |
| `metaDescription` | string | No | 150-160 character SEO description | Falls back to `summary` or truncated `content` |
| `faqs` | array | No | Array of `{ question: string, answer: string }` | Structured FAQ section & JSON-LD injection |
| `order` | number | No | Integer sorting weight (default: `0`) | Priority ordering in listings |

---

### 2.3 Canonical Blog Post Seed Payload Template

Every blog post seed must be a standalone JSON file matching this structure:

```json
{
  "title": "Scaling Next.js Websites with Headless CMS Architectures",
  "slug": "scaling-nextjs-websites-with-headless-cms",
  "content": "<p>Modern web engineering demands both dynamic agility and sub-millisecond static response times. By pairing the Next.js App Router with an on-demand revalidated headless CMS, development teams can publish real-time content without sacrificing Core Web Vitals performance.</p><h2>The On-Demand Revalidation Advantage</h2><p>Traditional static generation re-builds entire sites on publish. Incremental Static Regeneration (ISR) with cache tags enables precise, atomic invalidations the instant an article is published or edited.</p><h2>Key Architectural Takeaways</h2><ul><li>Zero server load during peak visitor traffic.</li><li>Instant content delivery through global edge networks.</li><li>Atomic tag-based revalidation via secure webhooks.</li></ul>",
  "summary": "Explore how combining Next.js App Router with headless CMS on-demand ISR enables blazing fast, edge-cached web publishing.",
  "cover_image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "status": "published",
  "order": 1,
  "metaTitle": "Scaling Next.js Websites with Headless CMS | Engineering Guide",
  "metaDescription": "Explore how combining Next.js App Router with headless CMS on-demand ISR enables blazing fast, edge-cached web publishing.",
  "postedAt": "2026-03-15T09:00:00.000Z",
  "editTimeFields": true,
  "author_name": "Devansh Developer",
  "author_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "author": {
    "mode": "manual",
    "name": "Devansh Developer",
    "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    "url": "https://nextwebworks.in/team/devansh"
  },
  "metadata": {
    "category": "Architecture",
    "tags": ["nextjs", "cms", "performance", "headless"]
  },
  "faqs": [
    {
      "question": "What is on-demand ISR?",
      "answer": "On-demand ISR is a Next.js capability allowing specific cached routes to be purged instantly upon receiving a secure webhook."
    }
  ]
}
```

---

### 2.4 Project (Portfolio) Model Schema & Payload Template

When portfolio projects are enabled (`Portfolio` module -> collection `project`), author seed files conforming to `references/cms/project.md` and `references/cms/seeders/project/insert.js`:

- **Required Fields:** `title` (string, min 2 chars), `slug` (lowercase kebab-case string).
- **Template (`projects/project-fintech-analytics.json`):**
  ```json
  {
    "title": "Next-Gen Fintech Analytics Dashboard",
    "slug": "fintech-analytics-dashboard",
    "client": "Apex Financial",
    "summary": "Real-time transactional monitoring platform processing over 100k daily transactions.",
    "content": "<p>Enterprise analytics dashboard constructed with Next.js 15, Tailwind CSS, and WebSockets for sub-100ms analytics streaming.</p><h2>Architecture & Engineering Highlights</h2><ul><li>Sub-millisecond data visual rendering via Canvas and SVG charts.</li><li>Multi-tenant role-based permissions and encrypted audit trails.</li><li>High-frequency real-time WebSocket connection pools.</li></ul>",
    "cover_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "liveUrl": "https://apex-analytics.example.com",
    "order": 1,
    "status": "published",
    "editTimeFields": true,
    "metadata": {
      "category": "Fintech",
      "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "GSAP"],
      "results": ["+240% Speed Improvement", "100k DAU Capacity", "99.99% Uptime"]
    }
  }
  ```

---

### 2.5 Contact Us Module Schema & Payload Template (Direct Module vs. Forms)

The NWW CMS provides two distinct contact mechanisms:
1. **Direct `WebsiteContactUs` Module (`POST /api/website-contact-us/create-one`):** Dedicated collection for direct inquiries with structured customer fields.
2. **Generic Forms Engine (`POST /api/form/:id/submit`):** Dynamic survey engine saving unstructured responses to `FormResponse`.

When testing or seeding direct `WebsiteContactUs` inquiries via `references/cms/seeders/contact-us/insert.js`:
- **Required Fields:** `firstName`, `lastName`, `email`, `phone`, `message`.
- **Template (`contact-us/inquiry-vip-consultation.json`):**
  ```json
  {
    "firstName": "Alexander",
    "lastName": "Vance",
    "email": "alex.vance@enterprise.com",
    "phone": "+1-415-555-0182",
    "message": "We would like to request an architecture review and commercial proposal for our upcoming Next.js web application.",
    "status": "pending",
    "editTimeFields": true
  }
  ```

---

### 2.6 Page Configurations (`WebsitePageConfig`) Schema & Payload Template

The `WebsitePageConfig` model (`website-page-config`) governs page-level routing metadata, SEO directives, OpenGraph cards, conversion CTA section toggles, page-specific FAQs, and shell layout flags.

- **Required Fields:** `title` (string), `slug` (lowercase kebab-case matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`), `path` (string).
- **Template (`page-configs/page-home.json`):**
  ```json
  {
    "title": "Home Page",
    "slug": "home",
    "path": "/",
    "status": "published",
    "metaTitle": "High-Performance Next.js Engineering | Next Web Works",
    "metaDescription": "Specialized Next.js App Router and headless CMS architecture delivering sub-second edge experiences.",
    "keywords": ["Next.js", "Headless CMS", "Tailwind CSS", "Web Engineering"],
    "canonicalUrl": "https://nextwebworks.in/",
    "noIndex": false,
    "noFollow": false,
    "ogTitle": "High-Performance Next.js Engineering",
    "ogDescription": "Specialized Next.js App Router and headless CMS architecture delivering sub-second edge experiences.",
    "ogImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    "twitterCard": "summary_large_image",
    "structuredDataType": "Organization",
    "showCTA": true,
    "ctaHeadline": "Ready to Transform Your Digital Infrastructure?",
    "ctaSubtext": "Partner with our engineers for custom site modeling, load analysis, and zero-downtime migrations.",
    "ctaButtonText": "Schedule Technical Consultation",
    "ctaButtonLink": "/contact",
    "headerVariant": "default",
    "showFooter": true,
    "banner": {
      "enabled": false,
      "text": "",
      "link": ""
    },
    "faqs": [
      {
        "question": "What is the typical development turnaround time?",
        "answer": "Standard full-stack web projects are completed and deployed within 4 to 8 weeks depending on scope."
      },
      {
        "question": "How is content cached and revalidated?",
        "answer": "Content is edge-cached using Next.js App Router cache tags, invalidating within 60ms upon CMS updates via secure webhooks."
      }
    ],
    "heroBadge": "Enterprise Next.js Specialists",
    "heroHeadline": "Engineering Modern Web Experiences with Pure Precision",
    "heroSubtext": "Construct edge-rendered, responsive digital products with guaranteed Core Web Vitals and headless agility.",
    "metadata": {
      "trackingCampaign": "enterprise-q1"
    }
  }
  ```

---

### 2.7 Secondary Active Collections (Services, FAQs, Testimonials, etc.)

When additional secondary modules are enabled, seed records must conform to their respective seeders in `references/cms/seeders/`:

- **Services (`services/service-<slug>.json`):** Required: `title`, `slug`. Include `summary`, `content`, `icon`, `status: "published"`, `metadata`.
- **FAQs (`faqs/faq-<slug>.json`):** Required: `question`, `answer`. Include `category`, `order`, `status: "published"`.
- **Testimonials (`testimonials/testimonial-<slug>.json`):** Required: `name`, `content` (or `quote`). Include `title`, `avatar`, `rating`, `status: "published"`.
- **Features (`features/feature-<slug>.json`):** Required: `title` (or `name`). Include `description`, `icon`, `status: "published"`.
- **Case Studies (`case-studies/case-study-<slug>.json`):** Required: `title`, `slug`. Include `client`, `summary`, `content`, `status: "published"`.
- **Website Tools (`tools/tool-<slug>.json`):** Required: `title`, `slug`. Include `description`, `icon`, `metaTitle`, `metaDescription`, `before_content`, `after_content`, `faqs`, `tags`, `status: "published"`.
- **Website Tool Categories (`tool-categories/category-<slug>.json`):** Required: `title`, `slug`. Include `description`, `images`, `toolCategory` (parent ID), `page_content`, `tags`, `faqs`, `metadata`, `status: "published"`.
- **Careers / Jobs (`jobs/job-<slug>.json`):** Required: `title`, `slug`, `description`, `city`, `state`, `country`, `startDate`, `endDate`, `status: "published"`.
- **Events (`events/event-<slug>.json`):** Required: `title`, `slug`, `description`, `startDate`, `endDate`, `location`, `status: "published"`.
- **Pricing Plans (`plans/plan-<slug>.json`):** Required: `name`, `price` array, `features` array, `status: "published"`.
- **Galleries (`galleries/gallery-<slug>.json`):** Required: `title`, `slug`, `images` array, `status: "active"`.
- **Articles (`articles/article-<slug>.json`):** Required: `title`, `slug`, `description`, `content`, `image`, `author_name`, `author_image`, `author_position`, `status: "published"`.
- **Industries (`industries/industry-<slug>.json`):** Required: `name`, `slug`, `description`, `content`, `image`, `icon`, `status: "published"`.
- **Portfolio (`portfolio/portfolio-<slug>.json`):** Required: `title`, `slug`. Include `description`, `images` array, `industry`, `service`, `tags`, `status: "published"`.
- **Legal Policies (`policies/<type>/policy.json`):** Required: `content`, `status: "published"`. Types: `privacy`, `terms`, `refund`.
- **Website Tags (`tags/tag-<slug>.json`):** Required: `name`. Include `value`, `type`, `color`, `status: "active"`.

---

## 3. Deliverables in `gate-5-cms-content/`

### 3.1 Directory Organization Standard

All content deliverables are housed inside `project-docs/client-review/gate-5-cms-content/`.
To ensure 100% compatibility with standalone seeders (`references/cms/seeders/<model>/insert.js`) and the Batch 4 seeder catalog, organize files by collection:

```text
project-docs/client-review/gate-5-cms-content/
├── index.md                             # Content Master Index cataloging all seeds & taxonomies
├── blog/                                # Blog post seed collection (seeders/blog/insert.js)
│   ├── blog-article-1.json
│   ├── blog-article-2.json
│   └── blog-article-3.json
├── projects/                            # [If Active] Portfolio project seed collection (seeders/project/insert.js)
│   ├── project-1.json
│   └── project-2.json
├── contact-us/                          # [If Active] Direct Contact Us inquiry seeds (seeders/contact-us/insert.js)
│   └── inquiry-1.json
├── page-configs/                        # [If Active] Page configuration seeds (seeders/page-config/insert.js)
│   ├── page-home.json
│   └── page-about.json
├── services/                            # [If Active] Service seed collection (seeders/service/insert.js)
│   └── service-<slug>.json
├── testimonials/                        # [If Active] Testimonials seed collection (seeders/testimonial/insert.js)
│   └── testimonial-<slug>.json
├── faqs/                                # [If Active] FAQs seed collection (seeders/faq/insert.js)
│   └── faq-<slug>.json
├── features/                            # [If Active] Features seed collection (seeders/feature/insert.js)
│   └── feature-<slug>.json
├── tools/                               # [If Active] Website tools seed collection (seeders/tool/insert.js)
│   └── tool-<slug>.json
├── tool-categories/                     # [If Active] Tool categories seed collection (seeders/tool-category/insert.js)
│   └── category-<slug>.json
├── jobs/                                # [If Active] Careers & jobs seed collection (seeders/job/insert.js)
│   └── job-<slug>.json
├── events/                              # [If Active] Events & webinars seed collection (seeders/event/insert.js)
│   └── event-<slug>.json
├── plans/                               # [If Active] Pricing plans seed collection (seeders/plan/insert.js)
│   └── plan-<slug>.json
├── galleries/                           # [If Active] Photo galleries seed collection (seeders/gallery/insert.js)
│   └── gallery-<slug>.json
├── articles/                            # [If Active] Articles seed collection (seeders/article/insert.js)
│   └── article-<slug>.json
└── case-studies/                        # [If Active] Case study collection (seeders/case-study/insert.js)
    └── case-study-<slug>.json
```

*Compatibility Note:* Standalone seeders default to `project-docs/client-review/gate-5-cms-content/<model>`. Structuring files within model subdirectories prevents namespace collisions across JSON files and allows both single-file and directory-wide batch executions without flags.

---

### 3.2 Blog Seed Articles (Minimum 3 Records)

Author **at least 3 production-grade blog post seed JSON files** in `project-docs/client-review/gate-5-cms-content/blog/`:
1. `blog-article-1.json`
2. `blog-article-2.json`
3. `blog-article-3.json`

**Editorial Standards:**
- **Authentic Copywriting:** Zero "Lorem Ipsum" or synthetic dummy copy. All articles must reflect the client's industry, brand tone, and Stage 4 target SEO keywords.
- **Rich HTML Content:** Each post must contain structured HTML bodies with at least two `<h2>` subheadings, descriptive `<p>` paragraphs, and one list (`<ul>` or `<ol>`).
- **Complete Metadata:** Every article must include valid `postedAt` timestamps, `editTimeFields: true`, `status: "published"`, and strict-mode `metadata: { category, tags }`.

---

### 3.3 Project (Portfolio) Seed Items

When portfolio showcase is enabled:
- Author at least 2 authentic project JSON files in `project-docs/client-review/gate-5-cms-content/projects/`.
- Ensure each item specifies real client/project details, `title`, kebab-case `slug`, rich HTML narrative in `content`, and tech badges in `metadata.technologies`.

---

### 3.4 Contact Us Test Inquiries (Direct Module)

When the Contact Us module is configured:
- Author test inquiry JSON records in `project-docs/client-review/gate-5-cms-content/contact-us/`.
- Validate that all required sender attributes (`firstName`, `lastName`, `email`, `phone`, `message`) are populated.

---

### 3.5 Page Configuration Deliverables (`page-configs/`)

When page-level configurations are integrated:
- Author seed configuration records for core routes (e.g. `page-home.json`, `page-about.json`, `page-contact.json`) in `project-docs/client-review/gate-5-cms-content/page-configs/`.
- Declare canonical URLs, OpenGraph previews, CTA conversion copies, and optional page-specific FAQs.

---

### 3.6 Content Master Index (`index.md`)

Author `project-docs/client-review/gate-5-cms-content/index.md` summarizing the seeded content catalog for client review:
- **Seed Inventory Table:** Catalog every seed file, title, slug, publication date, category, tags, and status across Blog, Projects, Page Configs, and other modules.
- **Author & Contributor Profiles:** Summarize author names, bios, and avatar URLs.
- **Taxonomic Structure:** List all unique categories, tech badges, and keyword tags represented in the seed set.
- **Active Module Summary:** Tabulate counts of articles, projects, page configs, services, FAQs, and testimonials prepared for ingestion.

---

## 4. Schema Specification (`gate-5-cms-schema/cms-schema.md`)

Author `project-docs/client-review/gate-5-cms-schema/cms-schema.md` documenting:
- **Collection Schemas:** Complete field definitions, types, default values, and validation rules for `Blog`, `Project`, `WebsiteContactUs`, `WebsitePageConfig`, and any active secondary collections.
- **Mongoose Strict-Mode Rules:** Clear documentation of why taxonomies and badges reside in `metadata`.
- **Taxonomy Dictionary:** Approved category list, allowed tag vocabulary, and slug mapping conventions.
- **Direct Module vs. Form Contracts:**
  - Direct Contact Inquiry (`POST /api/website-contact-us/create-one`) executed via Next.js Server Action (`site/app/contact/actions.js`).
  - Public Form Submission (`POST /api/form/:id/submit`) and Lead Capture (`POST /api/lead/submit`).
- **ISR Revalidation Blueprint:** Mapping each model collection to its canonical cache tag (e.g. `blog` -> `cms:blog`, `project` -> `cms:project`, `contact-us` -> `cms:contact-us`, `page-config` -> `cms:page-config`) matching `references/gate-6-scaffolding/cms-kit/content-helper.js` (`ContentHelper.tagFor(resource)`).

---

## 5. Preflight Seeder Dry-Run Validation

Before completing Batch 3, execute dry-run validation using both the standalone seeder scripts and companion CLI utilities. Dry runs validate payload syntax, schema rules, and Mongoose strict compliance with **zero network writes** and no active server credentials required.

### 1. Blog Post Dry-Run
```bash
# Validate via standalone model seeder
node skills/create-nww-website/references/cms/seeders/blog/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --dry-run

# Validate via companion CMS Seeding Engine
node skills/create-nww-website/scripts/cms-seed/index.js \
  --dir=project-docs/client-review/gate-5-cms-content/blog \
  --dry-run
```

### 2. Projects (Portfolio) Dry-Run
```bash
node skills/create-nww-website/references/cms/seeders/project/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/projects \
  --dry-run
```

### 3. Contact Us Inquiries Dry-Run (Direct Module)
```bash
node skills/create-nww-website/references/cms/seeders/contact-us/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/contact-us \
  --dry-run
```

### 4. Page Configurations Dry-Run
```bash
node skills/create-nww-website/references/cms/seeders/page-config/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/page-configs \
  --dry-run
```

### 5. Secondary Collections Dry-Run (When Active)
```bash
# Services validation
node skills/create-nww-website/references/cms/seeders/service/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/services \
  --dry-run

# FAQs validation
node skills/create-nww-website/references/cms/seeders/faq/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/faqs \
  --dry-run

# Testimonials validation
node skills/create-nww-website/references/cms/seeders/testimonial/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/testimonials \
  --dry-run

# Tools validation
node skills/create-nww-website/references/cms/seeders/tool/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tools \
  --dry-run

# Tool Categories validation
node skills/create-nww-website/references/cms/seeders/tool-category/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/tool-categories \
  --dry-run
```

Ensure all preflight validations complete with **exit code 0** and zero `[FAIL]` messages.

---

## 6. Batch 2 Completion Checklist

Before proceeding to Batch 3 (Pushing Seeds & Gate 5 Sign-Off), verify:
- [ ] All 28 questions in `gate-5-cms-requirements/open-questions.md` are answered in `cms-implementation-rules.md`.
- [ ] At least 3 complete blog post seed JSON files exist in `project-docs/client-review/gate-5-cms-content/blog/`.
- [ ] If Projects active: At least 2 project seed JSON files exist in `project-docs/client-review/gate-5-cms-content/projects/`.
- [ ] If Contact Us active: Test inquiry JSON exists in `project-docs/client-review/gate-5-cms-content/contact-us/`.
- [ ] If Page Configs active: Page configuration JSON files exist in `project-docs/client-review/gate-5-cms-content/page-configs/`.
- [ ] All blog and project seeds store taxonomies strictly inside `metadata` (Mongoose strict-mode compliance; zero warnings).
- [ ] All seeds include `status: "published"` (or `"pending"` for inquiries) and `"editTimeFields": true`.
- [ ] `project-docs/client-review/gate-5-cms-content/index.md` catalogs all seeded records, categories, publication dates, and author bios.
- [ ] `project-docs/client-review/gate-5-cms-schema/cms-schema.md` defines collection schemas, taxonomies, and public form contracts.
- [ ] Standalone seeder dry-run (`node .../seeders/blog/insert.js --dry-run`) reports 100% success with 0 failures.
- [ ] Project seeder dry-run (`node .../seeders/project/insert.js --dry-run`) reports 100% success.
- [ ] Contact Us seeder dry-run (`node .../seeders/contact-us/insert.js --dry-run`) reports 100% success.
- [ ] Page Config seeder dry-run (`node .../seeders/page-config/insert.js --dry-run`) reports 100% success.
- [ ] Companion CLI dry-run (`node skills/create-nww-website/scripts/cms-seed/index.js --dry-run`) reports 100% success.
- [ ] Gate containment invariant satisfied: zero loose markdown files outside designated gate directories.
