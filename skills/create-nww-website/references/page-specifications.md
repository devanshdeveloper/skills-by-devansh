# Page Specifications & CMS Schema (Stage 5)

Stage 5 deconstructs every page from `project-docs/client-review/gate-3-page-list/page-list.md` into discrete, responsive section blueprints, complete verbatim copywriting, and structured asset references. If CMS mode is `cms`, Stage 5 also authors the complete CMS schema mapping, backend requirements, and seed data.

Stage 5 operates strictly in a **single mode: Markdown**. It generates unified specification documents `page-specs/<slug>/page.md` for every page slug, shared units, the cross-page layout system in `project-docs/client-review/gate-5-page-specs/layout-system.md`, and (if CMS mode is enabled and context complete) CMS schemas and seed files. **All other modes (Next.js and HTML preview modes) are permanently deleted.** Codebase scaffolding and foundation construction are deferred exclusively to Stage 6.

Do NOT create any additional unstated markdown files. Specifically, do NOT generate `project-docs/migration-inventory.md`, `project-docs/editor-handover-outline.md`, `project-docs/context-update.md`, or `project-docs/cms-foundation-tasks.md`.

---

## Deliverables Summary

Stage 5 authors deliverables across strict markdown locations:

1. **Per-Page Specifications:** Saved to `page-specs/<slug>/page.md` for every page slug in `project-docs/client-review/gate-3-page-list/page-list.md`. Combines section layout blueprints, verbatim copywriting, and asset slots into a single cohesive document.
2. **Shared Units:**
   - Shared text units: `page-specs/_shared/<component-slug>.md` (e.g. `shared-nav.md`, `shared-footer.md`, `site-settings.md`).
   - Shared brand assets: `page-specs/_shared/brand-assets.md`.
3. **Cross-Page Layout System:** Saved to `project-docs/client-review/gate-5-page-specs/layout-system.md` containing ONLY one section: `## Shared Components`.
4. **CMS Requirements & Investigation (if `cms: cms`):**
   - **Incomplete Context Guard:** If CMS context seems incomplete, create `project-docs/client-review/gate-5-cms-requirements/list.md` listing missing details, and do NOT proceed to CMS schema or content until this is resolved.
   - **Read-Only Investigation Prompt:** Provide a strictly read-only prompt in `project-docs/client-review/gate-5-cms-requirements/prompt.md` for the user to paste into their CMS agentic IDE to fetch needed answers (no write commands).
   - `project-docs/client-review/gate-5-cms-requirements/cms-backend-requirements.md` (API endpoint specs, Bearer auth, ISR webhook contracts).
5. **CMS Schema & Content Seeds (when requirements complete):**
   - `project-docs/client-review/gate-5-cms-schema/cms-schema.md` (Blog post model mapping, fields, author/category schemas).
   - `project-docs/client-review/gate-5-cms-content/blog-<slug>.json` & `project-docs/client-review/gate-5-cms-content/index.md` (Initial seed posts).
6. **Stock Provenance Manifest (if stock used):** Saved to `project-docs/stock-provenance.json` when licensed stock imagery is sourced during asset slot authoring.

---

## Gate 2 Variation Precondition (Non-Negotiable)

Before initiating Stage 5 research or authoring `page.md` specifications:
1. **Inspect Chosen Variation:** Verify that the chosen design variation from Gate 2 is formally recorded in `project-docs/router-state.md` and `project-docs/client-review/gate-2-design-theory/design-theory.md`.
2. **Enforced Halt if Missing:** If Gate 2 is still pending, or if no variation choice is recorded, **HALT EXECUTION IMMEDIATELY**. Ask the user to confirm the Gate 2 variation decision.
3. **Never Self-Select:** The agent must never choose or assume a variation on behalf of the client.
4. **Clean Boundary:** No code generation or codebase initialization occurs in Stage 5. `site/` remains untouched until Stage 6.

---

## Research Protocol

1. **Live-Fetch Reference Layouts:** Fetch liked and disliked reference websites before drawing structural conclusions. Extract section orders, hero patterns, grid systems, and content density changes.
2. **Attribution:** Clearly attribute each section's structural choice to a client-provided reference, agent-sourced research, or the page's primary conversion CTA.
3. **Research Bounds:** Maximum 3 fetches per page type across references, and 25 fetches total. If a URL blocks access, mark as "unverified" and fall back to the client's description.
4. **Principles-Not-Pixels Abstraction Barrier:** The similarity audit and no-clone rules from [references/design-variations.md](design-variations.md) strictly apply. All layouts are synthesized from abstract design principles and authentic client content. Never copy DOM markup, CSS classes, element IDs, or visual assets from captured reference websites.

---

## Component Architecture & Promotion Rule (2+ Pages)

To keep code maintainable, avoid duplicate components, and prevent monolithic files:
1. **Route-Specific Components:**
   - Section components unique to a page will live in `site/app/<route>/_components/<SectionName>.js`.
   - Thin page server component (`page.js`) must remain **<= 80 lines**.
   - Section components must remain **<= 250 lines** (hard limit 300).
   - Every section file must open with the section comment:
     ```javascript
     // section: <id>
     ```
2. **Shared Component Promotion Rule (2+ Pages):**
   - Any component reused across **2 or more pages** (or global shell elements like Nav, Footer, and `ResponsiveImage`) is promoted to `site/components/`.
   - The components directory is **flat**: `site/components/<ComponentName>.js`. Client animation wrappers reside in `site/components/motion/<WrapperName>.js`. Nested directories like `ui/` or `shared/` are not used.

---

## Deliverable Structure 1: Per-Page Specification (`page-specs/<slug>/page.md`)

Each page in `project-docs/page-list.md` receives a dedicated specification file combining metadata, layout blueprint, verbatim copywriting, and media asset slots:

```markdown
# Page Specification: [Page Name] ([Static | Dynamic CMS])
Route: /route-path
Slug: [slug]
Layout Pattern: [e.g. Single-column narrative scroll with sticky visual]

---

## 1. SEO & Metadata Specification

```yaml
seo:
  title: "Modern Web Development & Digital Engineering | Brand Name"
  description: "Scale your digital footprint with high-performance Next.js web applications."
  canonical: "/services"
  robots: "index, follow"
  primaryKeyword: "web development agency"
  h1: "High-Performance Web Engineering for Modern Brands"
  openGraph:
    title: "Modern Web Development & Digital Engineering"
    description: "Scale your digital footprint with high-performance Next.js web applications."
    image: "/assets/services-og.webp"
    imageAlt: "Digital engineering showcase"
  jsonLd:
    type: "Service"
    name: "Web Engineering"
    provider: "Brand Name"
  internalLinks:
    - anchor: "explore our design philosophy"
      target: "/about"
    - anchor: "schedule a consultation"
      target: "/contact"
```

---

## 2. Section-by-Section Blueprint & Verbatim Content

### Section 1: `services-s1-hero`
- **Section Name:** Hero
- **Component File:** `site/app/services/_components/HeroSection.js`
- **Component Type:** Server Component (renders Client Component wrapper for motion)
- **Scope:** page-local
- **Motion Intent:** hero entrance: orchestrates the page's one bold moment (smooth staggered entrance).
- **Layout Blueprint:**
  - Structure: Two-column desktop (60/40 text vs visual), stacking vertically on mobile.
  - Spacing: Generous vertical padding (`py-24` desktop, `py-12` mobile).
  - Rationale: Grounded in Aesop reference spatial rhythm (client reference analysis).
- **Verbatim Copywriting:**
  - Status: `agency-created`
  - Eyebrow: "Digital Engineering"
  - Headline (H1): "High-Performance Web Engineering for Modern Brands"
  - Subhead: "We design, build, and deploy high-converting Next.js websites tailored to enterprise speed and aesthetic excellence."
  - Primary CTA: "Schedule a Discovery Call" -> destination: `/contact`
  - Secondary CTA: "Explore Case Studies" -> destination: `/case-studies`
- **Asset Slots:**
  | Slot ID | Role | Description | Aspect Ratio | Dimensions | Format | Budget | Source Path | Status Tag | Rights |
  |---|---|---|---|---|---|---|---|---|---|
  | `srv-s1-hero` | `LCP candidate` | Modern engineering workspace with code editor | `--ratio-hero` | 1920x1080 | WebP | <= 100 KB | `assets-source/hero.png` | `placeholder` | `n/a` |

### Section 2: `services-s2-capabilities`
- **Section Name:** Capabilities Grid
- **Component File:** `site/app/services/_components/CapabilitiesSection.js`
- **Component Type:** Server Component
- **Scope:** page-local
- **Motion Intent:** static by design (no gratuitous movement)
- **Layout Blueprint:**
  - Structure: 3-column responsive card grid (1 col mobile, 2 col tablet, 3 col desktop).
  - Spacing: Standard section padding (`py-20`).
- **Verbatim Copywriting:**
  - Status: `client-provided`
  - Eyebrow: "What We Build"
  - Headline (H2): "Engineered for Speed, Scalability, and Search Dominance"
  - Items:
    - Item 1:
      - Title: "Next.js App Router Architecture"
      - Body: "Leveraging React Server Components for near-instant first contentful paint and zero unnecessary client JavaScript."
    - Item 2:
      - Title: "Headless CMS Integration"
      - Body: "Seamless publishing workflows powered by NWW CMS with on-demand ISR revalidation."
- **Asset Slots:**
  | Slot ID | Role | Description | Aspect Ratio | Dimensions | Format | Budget | Source Path | Status Tag | Rights |
  |---|---|---|---|---|---|---|---|---|---|
  | `srv-s2-ic1` | `icon` | Code branch vector icon | `--ratio-square` | 24x24 | Lucide | <= 2 KB | `Lucide:GitBranch` | `agency-created` | `confirmed` |
  | `srv-s2-ic2` | `icon` | Database cloud vector icon | `--ratio-square` | 24x24 | Lucide | <= 2 KB | `Lucide:Database` | `agency-created` | `confirmed` |

[... Repeat for all sections on this page ...]

---

## 3. Responsive Integrity Notes
- Sticky elements, drawer collapsing on mobile (< 768px), and viewport transitions.

## 4. Consistency Audit
- Confirms typography scale, semantic color tokens, and container widths align with `design-theory.md` and adjacent pages.
```

---

## Verbatim Copywriting Standards

1. **No Unmarked Placeholders:** Never use "Lorem ipsum", "Headline text goes here", or bracketed filler. All copy must be drafted as realistic, production-ready prose matching the brand voice established in `design-theory.md`.
2. **Dev Visual Outline Attribute (`data-placeholder="true"`):**
   - Every `drafted-placeholder` or `needs-client-input` **TEXT block** must render in component markup with the attribute `data-placeholder="true"`.
   - In non-production builds, a global dev-only CSS rule outlines elements with this attribute so human reviewers can instantly identify unconfirmed copy:
     ```css
     [data-placeholder="true"] {
       outline: 2px dashed #f59e0b;
     }
     ```
3. **Legal Text Discipline:**
   - Final legal agreements (Privacy Policy, Terms of Service) must be provided by the client.
   - The agent drafts only a clearly labeled skeleton marked `needs-client-input`, never invented legal prose.
4. **Copy Must Fit Blueprint:**
   - Headlines and body text must respect the character caps and item counts defined in the section layout blueprints.

---

## Asset Slot Taxonomy & Sourcing Rules

Every asset slot must be cataloged using existing assets or approved stock sources. **Do not invent arbitrary asset paths.**

### The 8-Tag Status Taxonomy
1. `client-provided`: Asset supplied directly by the client with confirmed commercial usage rights (located in `assets-source/` or brand folder).
2. `agency-created`: Asset created in-house (vector icons via Lucide, charts, typography graphics).
3. `stock-licensed`: Commercial stock photography/illustration with source and licence verified. Follow [references/stock-image-sourcing.md](stock-image-sourcing.md) for approved providers (Pixabay, Pexels, Unsplash). Sourced via `scripts/stock-fetch/index.js` at Stage 5 authoring time and logged to `project-docs/stock-provenance.json`.
4. `ai-generated`: Synthesized imagery requiring recorded written client sign-off.
5. `placeholder`: Neutral generated placeholder image with visible dimensions and ratio label.
6. `drafted-placeholder`: Realistic copy drafted for review; requires `data-placeholder="true"`.
7. `needs-client-input`: Real facts, pricing, legal text, or proprietary assets that cannot be fabricated.
8. `cms-hosted`: Image hosted dynamically on NWW CMS media storage (needs no local source file).

---

## Deliverable Structure 2: Cross-Page Layout System (`project-docs/client-review/gate-5-page-specs/layout-system.md`)

Documents system-wide components reused across 2+ pages. Per repository rules, this document must contain ONLY one section:

```markdown
# Cross-Page Layout System

## Shared Components
- `Nav`: Global sticky navigation header. Text fields: Nav links, CTA label. Capacity: links <= 20 chars. Media: Logo variant.
- `Footer`: Global site footer. Text fields: Company summary, column link labels, copyright. Capacity: summary <= 150 chars. Media: Reversed logo variant.
- `CTABanner`: Pre-footer conversion callout. Text fields: Heading, subhead, button label. Capacity: heading <= 60 chars, subhead <= 140 chars.
- `ResponsiveImage`: Manifest-driven image component rendering srcset, sizes, and LQIP blur placeholders.
```

---

## Deliverable Structure 3: CMS Requirements, Schema & Content (When `cms: cms`)

When CMS mode is `cms`, Stage 5 authors CMS requirements, schema, and content across dedicated gate subdirectories:

1. **Incomplete CMS Context Guard (`project-docs/client-review/gate-5-cms-requirements/list.md`):**
   - If CMS requirements or data structures are incomplete, create `project-docs/client-review/gate-5-cms-requirements/list.md` itemizing all missing elements.
   - **Enforced Halt:** Do NOT proceed to `gate-5-cms-schema/` or `gate-5-cms-content/` until `list.md` is resolved.
2. **Read-Only Investigation Prompt (`project-docs/client-review/gate-5-cms-requirements/prompt.md`):**
   - Provide a strictly read-only prompt for the user to paste into their CMS agentic IDE to fetch needed answers (endpoints, model structures, tenant keys). Never include write or mutation commands.
3. **`project-docs/client-review/gate-5-cms-requirements/cms-backend-requirements.md`:**
   - Base URL configuration (`SERVER_URL`).
   - Read & Write endpoint contracts (`GET /api/blog/paginate`, `GET /api/blog/read-one-by-slug/:slug`, `POST /api/blog/create-one`, `POST /api/blog/generate-slug`) with Bearer token authentication (`Authorization: Bearer ${CMS_SITE_KEY}`).
   - On-demand ISR revalidation webhook contract (`POST /api/revalidate`) using `REVALIDATE_SECRET` with canonical tag `cms:blog`.
4. **`project-docs/client-review/gate-5-cms-schema/cms-schema.md`:**
   - Field-by-field mapping of Blog Post content models (`title`, `slug`, `content`, `excerpt`, `cover_image`, `image`, `author`, `category`, `tags`, `postedAt`, `lastUpdatedAt`).
   - Category and tag classification taxonomies.
   - Form schema models for contact inquiries (`/api/website-contact-us/:id/submit`) and lead capture (`/api/lead/submit`).
5. **`project-docs/client-review/gate-5-cms-content/`:**
   - Author at least 3 realistic blog post seed JSON files (`project-docs/client-review/gate-5-cms-content/blog-<slug>.json`) matching client tone and SEO target keywords. Note: Store category and tags inside `metadata.category` and `metadata.tags` to prevent Mongoose strict-mode stripping.
   - Author `project-docs/client-review/gate-5-cms-content/index.md` indexing all seed articles, categories, and author bios.
   - Execute seed validation and insertion via companion script:
     ```bash
     node skills/create-nww-website/scripts/cms-seed/index.js --dry-run
     node skills/create-nww-website/scripts/cms-seed/index.js --auto-slug
     ```

For technical CMS details, consult [references/cms-architecture.md](cms-architecture.md).

---

## Taste & Motion Rules

- **Motion Discipline:** Every section defaults to `static by design`. At most **one section per page** may be designated as the "bold moment" (typically the hero).
- **Ban Uniform Entrances:** Do not apply uniform fade-and-slide-up animations across all sections of a page.
- **Server-Rendered Presence:** All text and layout containers must be fully present in initial server-rendered HTML. Animations run strictly post-hydration.

---

## Gate 5 Review Checklist & Handover Protocol

### Before Presenting Gate 5 to the User
- [ ] Precondition satisfied: Gate 2 chosen design variation is recorded in `router-state.md` and `design-theory.md`.
- [ ] Every page in `page-list.md` has a complete markdown specification at `page-specs/<slug>/page.md`.
- [ ] Shared units created at `page-specs/_shared/*.md` (nav, footer, brand assets).
- [ ] Shared 2+ page components cataloged in `project-docs/client-review/gate-5-page-specs/layout-system.md` with only one section: `## Shared Components`.
- [ ] Verbatim copywriting drafted for all sections; unconfirmed draft text carries `data-placeholder="true"`.
- [ ] Asset slots cataloged with 8-tag taxonomy; stock images (if used) fetched via `scripts/stock-fetch/index.js` and logged in `project-docs/stock-provenance.json`.
- [ ] If `cms: cms` active: all items in `gate-5-cms-requirements/list.md` resolved; read-only prompt delivered in `prompt.md`; `gate-5-cms-schema/cms-schema.md` and content seeds authored.
- [ ] Zero unneeded markdown files were generated (no `migration-inventory.md`, `editor-handover-outline.md`, `context-update.md`, or `cms-foundation-tasks.md`).
- [ ] Motion intent defaults to `static by design` with at most one bold moment per page.
- [ ] `project-docs/router-state.md` updated to `Gate 5: Awaiting Page Specification & CMS Schema Decision`.

### Gate 5 Presentation & Downstream Handover
Present Gate 5 in plain language summarizing the page structure, verbatim copywriting highlights, asset inventory, and CMS content schemas/seed data. Upon Gate 5 approval:
- Advance to **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)** to initialize `site/`, build the foundation shell, wire tokens, and construct the live landing page for client showcase. (Ensure zero unresolved CMS requirements exist before initializing Stage 6).
