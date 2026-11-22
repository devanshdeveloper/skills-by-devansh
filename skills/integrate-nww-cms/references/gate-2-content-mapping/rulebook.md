# Gate 2: Content-to-Model Mapping

> **Gate ID:** `2`  
> **Gate Name:** `content-mapping`  
> **Execution Mode:** Analytical Mapping & Schema Gap Analysis  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Standing NWW CMS Decisions

Gate 2 maps every audited route, page, and semantic section to authoritative NWW CMS backend models and fields without modifying the CMS backend.

> [!IMPORTANT]
> **Authoritative Standing NWW Decisions:**
> 1. **Zero `path` on `WebsitePageConfig`:** The CMS backend resolves page configurations strictly by `slug`. The legacy `path` field is omitted from all client queries and seeds.
> 2. **Zero `structuredDataType`:** The legacy enum is replaced by the arbitrary, validated `jsonLd` string field.
> 3. **Valid JSON-LD Invariant:** `WebsitePageConfig.jsonLd` accepts only valid JSON-LD strings.
> 4. **`WebsiteTag` Taxonomy References:** All content models with tags (Blog, Portfolio, Service, Tool, CaseStudy) reference the `WebsiteTag` collection (`name`, `slug`, `color`, `type`).
> 5. **Icons as Image Uploads:** All icon fields (`WebsiteService.icon`, `WebsiteTool.icon`) store hosted image URLs, never raw SVG markup or CSS classes.
> 6. **Backend Immutability:** Never modify the CMS backend during this workflow. Unmapped sections must be mapped into `WebsitePageConfig.metadata` or proposed as a separate recommendation list.

> [!IMPORTANT]
> **Human Approval Barrier:**
> Advancing to Gate 3 requires the exact verbatim phrase:
> `APPROVE GATE 2`

> [!TIP]
> **Context Compaction:**
> At the conclusion of Gate 2 evidence presentation, run `/compact` to compact conversation history and preserve context window headroom for Gate 3.

---

## 2. Model Mapping Matrix

| Content Scope | NWW CMS Model | Primary Fields Mapped | Implementation Role |
| :--- | :--- | :--- | :--- |
| **All Static & Shell Pages** | `WebsitePageConfig` | `title`, `slug`, `metaTitle`, `metaDescription`, `canonicalUrl`, `keywords`, `noIndex`, `noFollow`, `ogTitle`, `ogDescription`, `ogImage`, `twitterCard`, `jsonLd`, `showCTA`, `ctaHeadline`, `ctaSubtext`, `ctaButtonText`, `ctaButtonLink`, `faqs`, `heroBadge`, `heroHeadline`, `heroSubtext`, `headerVariant`, `showFooter`, `banner`, `metadata` | Controls page identity, SEO metadata, hero overrides, CTA banner, page-specific FAQs, and custom section variables. |
| **Blog Articles & Posts** | `Blog` | `title`, `slug`, `content` (HTML), `image` (thumbnail), `cover_image` (banner), `author_name`, `author_image`, `postedAt`, `tags`, `metaTitle`, `metaDescription` | Powers `/blog` index and dynamic `/blog/[slug]` detail routes. |
| **Portfolio & Projects** | `WebsitePortfolio` | `title`, `slug`, `client`, `description`, `content`, `image`, `gallery`, `services`, `tags`, `liveUrl`, `completedAt` | Powers portfolio showcase grids and project detail views. |
| **Services Offerings** | `WebsiteService` | `title`, `slug`, `tagline`, `description`, `content`, `icon` (image URL), `image`, `features`, `benefits`, `pricing`, `tags` | Powers services list and dedicated `/services/[slug]` landing pages. |
| **Case Studies** | `WebsiteCaseStudy` | `title`, `slug`, `client`, `industry`, `summary`, `challenge`, `solution`, `results` (`[{ metric, label }]`), `testimonial`, `image`, `tags` | Powers case study cards and deep-dive proof pages. |
| **Customer Testimonials** | `Testimonial` | `name`, `role`, `company`, `content`, `image` (avatar URL), `rating`, `featured` | Replaces hardcoded review cards across all pages. |
| **Frequently Asked Questions** | `WebsitePageConfig.faqs` or `WebsiteFAQ` | `question`, `answer`, `category` | Injects page-specific accordion FAQs and generates `FAQPage` JSON-LD. |
| **Interactive Tools** | `WebsiteTool` & `WebsiteToolCategory` | `title`, `slug`, `tagline`, `description`, `icon`, `url`, `category`, `tags` | Powers tools directory and directory categorization. |
| **Contact & Inquiries** | `WebsiteContactUs` | `firstName`, `lastName`, `email`, `phone`, `message` | Wire target for contact form Server Actions (`POST /api/website-contact-us/:id/submit`). |
| **Taxonomies & Badges** | `WebsiteTag` | `name`, `slug`, `color`, `type` | Standardizes tags across blog, portfolio, service, and tool entities. |

---

## 3. Step-by-Step Procedure

### Step 1: Run Automated Model Mapper
Run `model-mapper.mjs` to compare `.nww-cms/audit.json` against NWW CMS models:

```bash
node <path-to-skill>/scripts/cms-state.mjs set-status 2 in_progress
node <path-to-skill>/scripts/model-mapper.mjs --out .nww-cms/content-mapping.md
```

### Step 2: Review and Refine Mapping Table
Open `.nww-cms/content-mapping.md` and verify:
1. **Route Alignment:** Every static route (`/`, `/about`, `/contact`, `/pricing`) maps to a unique `WebsitePageConfig` slug (`home`, `about`, `contact`, `pricing`).
2. **Dynamic Segments:** Dynamic routes (`/blog/[slug]`, `/services/[slug]`) map to their respective collection models (`Blog`, `WebsiteService`).
3. **Section Mapping:** Identify sections that map directly to standard model fields vs sections that store custom parameters inside `WebsitePageConfig.metadata`:
   - Hero Badge / Headline / Subtext -> `WebsitePageConfig.hero*`
   - FAQs -> `WebsitePageConfig.faqs` (`[{ question, answer }]`)
   - CTA Section -> `WebsitePageConfig.showCTA`, `ctaHeadline`, `ctaButtonText`, `ctaButtonLink`
   - Customer Reviews -> `Testimonial.paginate()`
   - Bento Grids / Stats / Process Steps -> `WebsitePageConfig.metadata.bentoCards`, `metadata.stats`, `metadata.processSteps`

### Step 3: Compile Unmapped Content & Schema Recommendations
If the audited site contains content entities not natively supported by the standard NWW CMS backend models (e.g., Team Members, Career Openings, Pricing Tables, Event Calendars):
1. Document each unmapped item in Section 4 of `.nww-cms/content-mapping.md`.
2. Propose the interim storage solution (using `WebsitePageConfig.metadata` Map).
3. Draft proposed schema specifications for future CMS backend implementation.

### Step 4: Present Evidence & Request Approval
1. Set Gate 2 status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 2 awaiting_approval
   ```
2. Present `.nww-cms/content-mapping.md` to the user in chat.
3. Prompt user for Gate 2 approval:
   ```markdown
   > [!IMPORTANT]
   > Please review the mapping table in `.nww-cms/content-mapping.md`. To approve and proceed to Gate 3 (CMS Client Layer), respond with:
   > `APPROVE GATE 2`
   >
   > [!TIP]
   > **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 3.
   ```
4. Upon receiving `APPROVE GATE 2`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 2 "APPROVE GATE 2"
   ```
