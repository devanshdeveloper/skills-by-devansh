# SEO Strategy, Content Architecture & Structured Data Runbook (Stage 4)

Stage 4 establishes the search engine optimization (SEO) architecture, keyword strategy, and production content markdown for the entire website. It guarantees that every route complies with search intent, metadata best practices, rich structured data, canonical integrity, and high-signal content depth.

The master strategic deliverable is saved to `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`.
Modular production content is generated directly into `client-context/<model>/.../content.md` with co-located image assets.

> [!IMPORTANT]
> **Hard Rule — Zero External Project Context:**
> DO NOT add any context from other projects. It misleads the AI Agent. Only use and add instructions. Never embed domain-specific project examples, sample brand names, or external business copy into runbooks or prompts. All context must come strictly from the current project workspace, brief, or user input. Runbooks contain only structural instructions and schema shapes.
>
> **Strict Purity Rule: Zero Next.js / React / JSX Code in Stage 4:**
> Stage 4 is strictly an SEO strategy, keyword research, and content architecture stage. It is **strictly forbidden** to output Next.js code (`site/app/layout.js`, `generateMetadata`, `site/app/sitemap.js`, `site/app/robots.js`, React components, or JSX) during this stage.
> 
> All Next.js technical code implementations and SEO helpers (`generateMetadata`, `generateJSONLD`, `getSitemap`) are already provided in the modular CMS architecture ([references/cms/](../cms/rulebook.md)) and wired into `site/lib/cms-kit/` during **Stage 6 (Codebase Scaffolding)**.
> 
> In Stage 4, solve **only the SEO strategy and content authoring problems**.

---

## Table of Contents
- [1. Mandatory Upfront Tool Connection Protocol](#1-mandatory-upfront-tool-connection-protocol)
- [2. Early SEO & Content Intake Protocol (Invocation from Gate 0)](#2-early-seo--content-intake-protocol-invocation-from-gate-0)
- [3. Modular SEO Content Generation Architecture (`client-context/`)](#3-modular-seo-content-generation-architecture-client-context)
  - [Directory Hierarchy & Model Scoping](#directory-hierarchy--model-scoping)
  - [Image Co-Location Invariant](#image-co-location-invariant)
  - [Standard `content.md` Specification](#standard-contentmd-specification)
- [4. Keyword Research & Intent Strategy](#4-keyword-research--intent-strategy)
- [5. Technical SEO Architecture Specifications](#5-technical-seo-architecture-specifications)
  - [Page Titles & Meta Descriptions](#page-titles--meta-descriptions)
  - [Heading Progression & Canonical URLs](#heading-progression--canonical-urls)
  - [Structured Data (JSON-LD) Entity Specifications](#structured-data-json-ld-entity-specifications)
  - [Sitemap Priority & Inclusion Architecture](#sitemap-priority--inclusion-architecture)
  - [Robots Directives & Crawler Policies](#robots-directives--crawler-policies)
  - [301 Redirect Mapping & Migration Baseline](#301-redirect-mapping--migration-baseline)
- [6. Deliverable Structure (`project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`)](#6-deliverable-structure-project-docsclient-reviewgate-4-seo-strategyseo-strategymd)
- [7. Gate 4 Review Checklist & Sign-Off](#7-gate-4-review-checklist--sign-off)

---

## 1. Mandatory Upfront Tool Connection Protocol

Whenever Stage 4 is activated—whether reached sequentially or jumped to early from Gate 0—the agent **MUST NOT** jump straight into generating content, keyword tables, or mock data.

### Step 1: Upfront Tool Inquiry (Mandatory Pause Turn)
Before analyzing keywords or authoring content, the agent must explicitly ask the client about tool connections:

> *"Before we develop the SEO Strategy and content, do you have any SEO tools or data connections available for this project?*  
> *- **Google Search Console** (Performance / Coverage reports)*  
> *- **Google Analytics 4** (`NEXT_PUBLIC_GA_ID` / Traffic data)*  
> *- **Third-Party SEO Tools** (Ahrefs, SEMrush, Moz, Screaming Frog crawl exports)*  
> *- **PageSpeed Insights API Key** (for automated Core Web Vitals checks)*  
>  
> *If you have any exports (CSV/XLSX) or API keys, please let me know. If no external tools are connected, I will proceed with high-signal heuristic research and mark unverified metrics as `needs-tool-validation`."*

The agent must await the user's reply (or acknowledge if the user already provided this context in the prompt) and record the tool status in the **SEO Tool Availability Matrix** in `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`:
- `Connected` (API/MCP connection active)
- `Export-Based` (Client provided CSV/JSON export)
- `Heuristic Fallback` (No tool connected; using heuristic research)

Consult [seo-tool-library.md](seo-tool-library.md) and [seo-tool-registry.json](seo-tool-registry.json) for category details. Never claim to have run a tool that is not connected.

---

## 2. Early SEO & Content Intake Protocol (Invocation from Gate 0)

When a project requires content or SEO strategy to be finalized **before** design variations (Gate 2) or page specifications (Gate 5):
1. The user may request: *"Run Gate 4 first for SEO"* or *"Prepare SEO content for our tools/blog before proceeding."*
2. The agent executes Stage 4 out of order without breaking the pipeline:
   - Performs the **Tool Connection Check** (Step 1 above).
   - Establishes the keyword matrix and search intent in `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`.
   - Generates the complete, production-ready content in `client-context/<model>/.../` (`content.mdx` for CMS-controlled pages; `content.md` for non-CMS) with co-located image slots.
   - Records the early completion in `project-docs/router-state.md`.
3. Downstream stages (Stage 5 Page Specs, Stage 5 CMS Seeds, Stage 6 Scaffolding) will then ingest this content directly from `client-context/`.

---

## 3. Modular SEO Content Generation Architecture (`client-context/`)

All long-form SEO copy, articles, tool guides, and service details are stored in modular directories under `client-context/`. Each piece of content is completely self-contained within its own slug folder.

> [!NOTE]
> **Consolidation of Page Specs with SEO Content:**
> Because page copywriting, section hierarchies, keyword targeting, and media slots are authored here in Stage 4 alongside the SEO strategy (in `client-context/<model>/.../` and `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`), Stage 5 does not require a redundant page-specs batch. Stage 5 focuses directly on CMS schema resolution, asset curation, and live database seeding.
>
> **Zero Repeated Content & Anti-Duplication Invariant:**
> Duplicate copy across pages severely harms SEO and user trust. No headlines, subheadings, paragraphs, bullet points, feature card copy, or FAQ items may be repeated across multiple pages or between sections on the same page. Every page's content markdown (`content.mdx` / `content.md`) must be 100% original copy authored specifically for that route's search intent. Only UI section types may repeat—never exact content or sections.
>
> **High FAQ Density & Informational Richness Invariant:**
> FAQ sections must maintain high informational density with a minimum of 10 to 15 comprehensive, substantive FAQs per section / FAQ route. Answers must be detailed, multi-sentence explanations addressing genuine user objections, pricing, technical architecture, and onboarding. Zero 1-sentence superficial answers. Zero duplicate FAQs across different pages.
>
> **The MDX-to-JSON-to-Seeding Pipeline Invariant:**
> 1. **Authoring (Stage 4):** When CMS mode is active (`cms: cms`) and a route is requested to be controlled via the CMS (`CMS-Controlled: true` in `page-list.md`), the agent ALWAYS writes an MDX file (`content.mdx`) in `client-context/<model>/<slug>/content.mdx`.
> 2. **Validation (Stage 4):** Validate immediately against the model's Zod schema (`models/<model>/schema.js`):
>    `node skills/create-nww-website/scripts/content-pipeline/index.js validate --file client-context/<model>/<slug>/content.mdx --model <model>`
>    `node skills/create-nww-website/scripts/content-pipeline/index.js seo-check --file client-context/<model>/<slug>/content.mdx`
> 3. **Compilation to JSON Seeds (Stage 5 Batch 02):** Validated MDX files are automatically compiled into Mongoose strict-mode JSON seeds:
>    `node skills/create-nww-website/scripts/content-pipeline/index.js to-seed --src client-context --out project-docs/client-review/gate-5-cms-content`
> 4. **Pushing to CMS (Stage 5 Batch 03):** Validated seeds are pushed to the live CMS backend (dry-run default; `--apply` required for live writes):
>    `node skills/create-nww-website/scripts/content-pipeline/index.js push --dir project-docs/client-review/gate-5-cms-content/<model> --model <model> --apply`
> Non-CMS pages are generated by AI only (no MDX, no schema, no scripts).

### Directory Hierarchy & Model Scoping

Create folders strictly matching the models active on the website:

```text
client-context/
├── blog/
│   └── <blog-slug>/
│       ├── content.mdx            # Complete SEO-optimized MDX article (or content.md if non-CMS)
│       ├── cover.webp             # Co-located featured/cover image
│       └── [diagrams/figures]     # Co-located inline visual assets
├── tool/                         # ONLY when the `tool` model is used on the site
│   └── <tool-category-slug>/
│       └── <tool-slug>/
│           ├── content.mdx        # Tool specification, usage guide, SEO copy, input/output specs
│           ├── icon.svg           # Co-located tool icon
│           └── preview.webp       # Co-located tool screenshot/preview
├── service/                      # ONLY when `service` model is used
│   └── <service-slug>/
│       ├── content.mdx
│       └── hero.webp
├── case-study/                   # ONLY when `case-study` model is used
│   └── <case-study-slug>/
│       ├── content.mdx
│       └── [before/after images]
├── industry/                     # ONLY when `industry` model is used
│   └── <industry-slug>/
│       ├── content.mdx
│       └── banner.webp
├── portfolio/                    # ONLY when `portfolio` model is used
│   └── <portfolio-slug>/
│       ├── content.mdx
│       └── [project screenshots]
├── policy/                       # Legal policies (privacy-policy, terms, refund)
│   └── <policy-slug>/
│       ├── content.mdx
│       └── [policy assets]
└── article/                      # ONLY when `article` model is used
    └── <article-slug>/
        ├── content.mdx
        └── [co-located assets]
```

> [!NOTE]
> **Model Relevance Guard:** Only generate folders for models that are actively part of the project brief or website type. For example, `client-context/tool/<tool-category-slug>/<tool-slug>/` is created **only** when the project includes interactive tools.

### Image Co-Location Invariant

All visual assets associated with a piece of content (cover images, diagrams, icons, screenshots) **MUST** be placed directly inside that specific slug folder alongside `content.mdx` (or `content.md`):
- `client-context/blog/<blog-slug>/cover.webp`
- `client-context/tool/<tool-category-slug>/<tool-slug>/icon.svg`
- `client-context/tool/<tool-category-slug>/<tool-slug>/preview.webp`

**Never** store loose images in unrelated directories or detach images from their content file. When drafting `content.mdx`, reference local images via relative paths:
```markdown
coverImage: "./cover.webp"
```

### Standard Content File Specification (MDX for CMS; Markdown for Non-CMS)

Every `content.mdx` (or `content.md`) file must open with rich YAML frontmatter providing all metadata required for SEO, structured data, and CMS seeders, followed by complete, production-ready content (never placeholder stubs or arrays of code objects):

#### Template: Blog / Article (`client-context/blog/<blog-slug>/content.mdx`)
```markdown
---
title: "<Article Title>"
slug: "<article-slug>"
metaTitle: "<Primary Keyword or Topic> | <Brand Name>" # <= 60 chars
metaDescription: "<Action-oriented summary highlighting key value prop and subtle CTA>" # <= 155 chars
primaryKeyword: "<Primary Target Keyword>"
searchIntent: "<Informational | Commercial | Transactional | Navigational>"
secondaryKeywords:
  - "<secondary-keyword-1>"
  - "<secondary-keyword-2>"
  - "<secondary-keyword-3>"
canonicalUrl: "/blog/<article-slug>"
schemaType: "BlogPosting"
category: "<Category Name>"
tags: ["<Tag1>", "<Tag2>"]
author:
  name: "<Author Name or Editorial Team>"
  role: "<Author Role or Title>"
publishedAt: "YYYY-MM-DD"
coverImage: "./cover.webp"
coverImageAlt: "<Descriptive alt text for the featured cover image>"
---

# <Article Title>

## <Section 1: Topic Introduction & Core Context>
<Detailed introductory narrative addressing user intent and subject matter derived strictly from project brief...>

## <Section 2: In-Depth Exploration & Core Analysis>
<Comprehensive technical, strategic, or practical breakdown structured with subheadings...>

### <Key Takeaway / Subtopic A>
<Detailed explanatory copy...>

### <Key Takeaway / Subtopic B>
<Detailed explanatory copy...>

## <Section 3: Practical Application / Guidelines>
<Actionable steps, considerations, or structured guidelines...>

## Frequently Asked Questions
### <Search Query / Question 1>
<Clear, direct factual answer addressing search intent...>

### <Search Query / Question 2>
<Clear, direct factual answer addressing search intent...>
```

#### Template: Interactive Tool (`client-context/tool/<tool-category-slug>/<tool-slug>/content.mdx`)
```markdown
---
name: "<Tool Name>"
slug: "<tool-slug>"
categorySlug: "<tool-category-slug>"
metaTitle: "<Tool Name> — Free Online Utility | <Brand Name>" # <= 60 chars
metaDescription: "<Direct summary of what the tool accomplishes, input/output types, and key benefits>" # <= 155 chars
primaryKeyword: "<Primary Tool Keyword>"
searchIntent: "Transactional"
secondaryKeywords:
  - "<secondary-keyword-1>"
  - "<secondary-keyword-2>"
canonicalUrl: "/tool/<tool-category-slug>/<tool-slug>"
schemaType: "SoftwareApplication"
applicationCategory: "<UtilityApplication | DeveloperApplication | BusinessApplication>"
pricing: "Free"
icon: "./icon.svg"
previewImage: "./preview.webp"
publishedAt: "YYYY-MM-DD"
---

# <Tool Name>

## Tool Overview
<Concise description of the tool's purpose, what it calculates or generates, and visitor benefit...>

## Key Features & Capabilities
- **<Feature 1 Name>:** <Description of specific utility feature...>
- **<Feature 2 Name>:** <Description of specific utility feature...>
- **<Feature 3 Name>:** <Description of privacy, performance, or export capability...>

## How to Use
1. <Step 1: Input or configuration action>
2. <Step 2: Processing or execution action>
3. <Step 3: Output, download, or copy action>

## Technical & Input Specifications
- Supported Formats: <Input/output file or data formats>
- Execution Environment: <Client-side / Browser API / Serverless>
```

---

## 4. Keyword Research & Intent Strategy

1. **Search Intent Classification:**
   - **Informational:** How-to guides, concepts, guides, comparisons (e.g. `/blog/*`, `/guides/*`).
   - **Commercial:** Solution pages, service descriptions, feature breakdowns (e.g. `/services/*`, `/solutions/*`).
   - **Transactional:** Direct utility execution, signup, booking, tool actions (e.g. `/tool/*`, `/contact`, `/pricing`).
   - **Navigational:** Brand queries, team, about, policies (e.g. `/about`, `/privacy-policy`).

2. **Strict Keyword Non-Cannibalization:**
   - Every page must target **exactly one unique primary keyword**.
   - No two pages on the website may share the same primary keyword.

3. **Keyword Provenance Tagging:**
   Every keyword in `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` must be tagged with its source:
   - `[from-client]` — Provided directly by the client in intake brief or answers.
   - `[from-competitor-fetch]` — Discovered via verified live competitor crawl.
   - `[needs-tool-validation]` — Heuristic suggestion that must be verified when third-party tools are connected.

4. **Content Non-Duplication & Section Uniqueness:**
   - No two pages may share identical copy blocks, mirrored feature lists, or copy-pasted section layouts. Only section types may be repeated.
   - All FAQ sections across pages must feature distinct questions and answers unique to each page's specific topic with high density (10–15+ questions).

---

## 5. Technical SEO Architecture Specifications

Define all technical SEO parameters in `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` as structured specifications (not Next.js code):

### Page Titles & Meta Descriptions
- **Page Title Formula:** `<Page Topic / Primary Keyword> | <Brand Name>` (or `<Primary Keyword> — <Value Prop> | <Brand Name>`).
  - Length ceiling: **<= 60 characters** (including brand suffix) to prevent SERP truncation.
- **Meta Description Formula:** Active verb + core benefit + primary/secondary keyword + subtle CTA.
  - Length ceiling: **<= 155 characters** to prevent desktop and mobile truncation.

### Heading Progression & Canonical URLs
- **Single `<h1>` Rule:** Exactly one `<h1>` per page located in the hero section containing the primary keyword.
- **Heading Order:** `<h2>` for major content sections; `<h3>` for cards, subsections, or accordion items. Never skip heading levels.
- **Canonical URLs:** Every page must specify a self-referential canonical URL.
- **Internal Linking:** Every page must be accessible within **3 clicks** from Home. Internal links must use descriptive anchor text (avoid generic "click here" or "learn more").

### Structured Data (JSON-LD) Entity Specifications

Map Schema.org types to page categories. In `seo-strategy.md`, specify entity fields as clean JSON-LD definitions:

| Route Pattern | Primary Schema Type | Required Fields |
|---|---|---|
| Root Layout / Home | `Organization` + `WebSite` | `name`, `url`, `logo`, `sameAs`, `contactPoint`, `potentialAction` |
| Local Business Home | `LocalBusiness` / `ProfessionalService` | `name`, `address`, `geo`, `telephone`, `openingHoursSpecification` |
| `/services/[slug]` | `Service` | `serviceType`, `provider`, `description`, `areaServed` |
| `/tool/[category]/[slug]` | `SoftwareApplication` | `name`, `applicationCategory`, `operatingSystem`, `offers` |
| `/blog/[slug]` | `BlogPosting` | `headline`, `description`, `image`, `datePublished`, `author`, `publisher` |
| FAQ Sections | `FAQPage` | `mainEntity` array of `Question` and `Answer` |
| Interior Pages | `BreadcrumbList` | `itemListElement` array with `position`, `name`, `item` |

### Sitemap Priority & Inclusion Architecture

Specify sitemap hierarchy and priority tiers:
- **Priority 1.0 (Daily/Weekly):** Home (`/`).
- **Priority 0.9 (Monthly):** Core conversion pages (`/services`, `/pricing`, `/tools`).
- **Priority 0.8 (Weekly/Monthly):** Content hubs and contact (`/blog`, `/contact`, `/about`).
- **Priority 0.6–0.7 (Weekly):** Detail items (`/blog/[slug]`, `/tool/[category]/[slug]`, `/services/[slug]`).
- **Excluded (noindex):** `/admin/*`, `/api/*`, `/thank-you`, `/private/*`.

### Robots Directives & Crawler Policies
- **Production Directives:**
  - `Allow: /`
  - `Disallow: /api/`, `Disallow: /admin/`
  - Prioritize search crawlers (`Googlebot`, `Bingbot`).
  - Prioritize AI citation bots (`OAI-SearchBot`, `PerplexityBot`) for answer engine discovery.
  - Block bulk LLM training scrapers (`GPTBot`, `CCBot`) if requested in client governance.
- **Staging & Pre-Launch Protection:**
  - When pre-launch guard is active, output `robots: noindex, nofollow` and `Disallow: /` across all routes.

### 301 Redirect Mapping & Migration Baseline
If the build is a migration (`build_origin: migration`):
- Maintain a comprehensive 301 redirect mapping table in `seo-strategy.md`:
  `Old Legacy URL` -> `Status 301` -> `New Destination Route`.
- Ensure zero broken backlinks from high-authority legacy pages.

---

## 6. Deliverable Structure (`project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`)

`project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` must contain these 15 structured sections:

1. **SEO Tool Availability Matrix:** Log of connected tools, export files, or heuristic fallback status.
2. **Goal & Audience Search Intent Summary:** Breakdown of informational, commercial, transactional, and navigational intent.
3. **Page-by-Page SEO Matrix:**
   | Slug | Route | Primary Keyword | Search Intent | Secondary Keywords | Title (<=60 chars) | Description (<=155 chars) | Indexing | Canonical |
   |---|---|---|---|---|---|---|---|---|
4. **Keyword Sourcing & Provenance Ledger:** Tags for `from-client`, `from-competitor-fetch`, or `needs-tool-validation`.
5. **Modular Content Inventory:** Inventory of all authored `client-context/<model>/.../` content files (`content.mdx` for CMS-controlled pages; `content.md` for non-CMS) and co-located images.
6. **Heading Progression & Layout Rules:** Single `h1` placement and section structure.
7. **URL Architecture & Slugs:** Clean, lowercase, hyphenated URL paths.
8. **Internal Linking & Silo Strategy:** 3-click depth, planned anchor text, and topic cluster connections.
9. **Structured Data (JSON-LD) Entity Plan:** Schema.org types mapped to each page.
10. **Indexation & Crawler Directives:** Production crawler policies and pre-launch guard configuration.
11. **Social Sharing & Open Graph Strategy:** OG image specs (1200x630 WebP) and card copy.
12. **Internationalization & Hreflang (if applicable):** Single-language statement or multi-locale routing.
13. **Migration 301 Redirect Map (if migration):** Old URL to new route mapping.
14. **Core Web Vitals & Media Rules for Scaffolding:** Image dimensions, WebP format, LCP high-priority fetch rules.
15. **Open Questions:** Client follow-up items regarding SEO inputs (strictly unresolved questions; never list confirmed decisions here).

---

## 7. Gate 4 Review Checklist & Sign-Off

Before presenting Gate 4 for client approval:
- [ ] Upfront tool connection check conducted and recorded in the Tool Availability Matrix.
- [ ] Every page has a unique primary keyword with search intent (zero cannibalization).
- [ ] Meta titles are <= 60 characters; meta descriptions are <= 155 characters.
- [ ] Modular content created in `client-context/<model>/.../` (`content.mdx` validated against `schema.js` for CMS-controlled pages; `content.md` for non-CMS) for all active models.
- [ ] Visual assets (images, icons, diagrams) are co-located in the same slug folders alongside `content.mdx` (or `content.md`).
- [ ] Strictly zero Next.js or React code emitted in Gate 4 deliverables (code deferred to Stage 6).
- [ ] Structured data schemas mapped to real visible page content.
- [ ] Zero repeated content: all copy, value arguments, and card descriptions are 100% unique across pages (only section types repeat).
- [ ] High FAQ Density enforced: all FAQ sections feature 10–15+ substantive, unique questions with multi-sentence answers.
- [ ] 301 redirect map completed for all legacy URLs (if migrating).
- [ ] **Gate 4 Halt:** Present `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` and content inventory. Await explicit human sign-off before proceeding.
