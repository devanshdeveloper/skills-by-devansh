# Layout Theory & Section Architecture Specification

Stage 5 deconstructs every page from `project-docs/page-list.md` into discrete, responsive section blueprints grounded in live reference research.

Deliverables are authored across two tiers:
1. **Agent-Facing Source of Truth:** Saved per-page to `page-specs/<slug>/layout.md` and across pages to `project-docs/layout-system.md`. This is strictly an internal developer/agent specification and is never presented to non-technical clients.
2. **Generation Mode Deliverables:** Governed by the Mode Table below, producing either client-facing HTML review previews (`html` mode) or the production Next.js codebase in `site/` with a machine-readable manifest (`nextjs` mode).

---

## Layout Generation Mode Table

The pipeline supports two generation modes. The intake questionnaire (Q43c) captures whether to start the real site in Next.js after Gate 2 approval (default: `yes`).

| Mode Name | Primary Output | Target Location | Preconditions | Consistency Check | Verification Suite | When to Use |
|---|---|---|---|---|---|---|
| **`html`** | Static HTML preview pages per slug + layout index hub | `project-docs/client-review/pages/<slug>/index.html` & `pages/index.html` | Approved Gate 2 variation recorded; `layout.md` authored. | `verify-layout.mjs` (section order, parity, freshness, offline check). | Browser rendering via `file://` or preview server; WCAG AA contrast; zero external CDN calls. | Gate 2 variation reviews, client visual sign-off via local files or GitHub Pages, or when Node.js is unavailable. |
| **`nextjs`** | Production Next.js App Router application with modular routes, sections, content modules, tokens, and manifest | `site/` at project root | 1. Gate 2 client decision recorded.<br>2. Variation `layout.md` passed parity check & similarity audit.<br>3. `site/` does not exist or is empty.<br>4. Q43c confirms Next.js mode. | Read-only check comparing `layout.md` section IDs vs `data-section` markers vs `site/site.manifest.json`. | 1. Package install.<br>2. Lint & typecheck.<br>3. `pnpm build`.<br>4. Route count = slug count.<br>5. Screenshots (1440px & 390px).<br>6. Basic a11y. | Single-build production workflow: builds the real site in `site/` once so Stages 6–11 edit incrementally with minimal tokens. |

*Extensibility Rule:* Adding a future mode (e.g. `astro`, `remix`) requires exactly one flat reference file and one new table row.

---

## Gate 2 Variation Precondition (Non-Negotiable)

Before initiating Stage 5 research, authoring `layout.md`, or compiling layout deliverables:
1. **Inspect Chosen Variation:** Verify that the chosen design variation from Gate 2 is formally recorded in `project-docs/router-state.md` and `project-docs/design-theory.md`.
2. **Enforced Halt if Missing:** If Gate 2 is still pending, or if no variation choice is recorded, **HALT EXECUTION IMMEDIATELY**. Ask the user to confirm the Gate 2 variation decision.
3. **Never Self-Select:** The agent must never choose or assume a variation on behalf of the client.
4. **Preconditions for `nextjs` Mode:** In addition to the recorded variation decision, `nextjs` mode requires that `layout.md` has passed the consistency check and similarity audit, and that `site/` is empty or uninitialized. If any precondition is missing, refuse execution and state exactly what is missing. The mode never approves Gate 2 and never selects a variation autonomously.

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
   - Section components unique to a page live in `site/app/<route>/_components/<SectionName>.js`.
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

## Deliverable Structure 1: Per-Page Layout Blueprint (`page-specs/<slug>/layout.md`)

Each page in `project-docs/page-list.md` receives a dedicated blueprint file:

```markdown
# Layout Blueprint: [Page Name] ([Static | Dynamic])
Route: /route-path
Layout pattern: [e.g. Single-column narrative scroll with sticky visual]
Heading hierarchy & Links: Planned single H1 location, H2/H3 sequence, internal links, breadcrumbs

## Section-by-Section Breakdown

### Section 1: `home-s1-hero`
- Section Name: Hero
- Content: Value proposition headline, subheadline, dual action buttons, hero visual
- Layout notes: Two-column desktop (60/40 text vs visual), stacking vertically on mobile. Generous vertical padding.
- Why this section/order: Client reference analysis (Aesop hero structure)
- Component type: Server Component (renders Client Component wrapper for motion)
- Component file: `site/app/(marketing)/_components/HeroSection.js`
- Scope: page-local
- Motion intent: hero entrance: orchestrates the page's one bold moment (smooth staggered entrance).
- Content capacity:
  - Headline: max 70 chars
  - Subhead: max 160 chars
  - Button text: max 25 chars
  - Media: 1 image, aspect ratio `--ratio-hero`, role: `LCP candidate`

### Section 2: `home-s2-social-proof`
- Section Name: Social Proof
- Content: Partner logos and client validation badges
- Layout notes: Full-width container, horizontal flex wrap with grayscale filter
- Why this section/order: Builds credibility immediately following hero
- Component type: Server Component
- Component file: `site/app/(marketing)/_components/SocialProofSection.js`
- Scope: page-local
- Motion intent: static by design (no gratuitous movement)
- Content capacity:
  - Logos: 5–8 items, role: `icon`

[... Repeat for all sections on this page ...]

## Responsive Notes
- Notes on sticky elements, desktop-to-mobile grid collapsing, and mobile drawer transitions.

## Consistency Check
- Validates that spacing tokens and layout rhythms align with adjacent pages.
```

---

## Deliverable Structure 2: Cross-Page Layout System (`project-docs/layout-system.md`)

`project-docs/layout-system.md` documents shared system components:

```markdown
# Cross-Page Layout System

## Research Log
- Sources fetched and page counts analyzed during research.

## Shared Components (Reused across 2+ pages)
- `Nav`: Global sticky navigation header. Text fields: Nav links, CTA label. Capacity: links <= 20 chars. Media: Logo variant.
- `Footer`: Global site footer. Text fields: Company summary, column link labels, copyright. Capacity: summary <= 150 chars. Media: Reversed logo variant.
- `CTABanner`: Pre-footer conversion callout. Text fields: Heading, subhead, button label. Capacity: heading <= 60 chars, subhead <= 140 chars.
- `ResponsiveImage`: Manifest-driven image component rendering srcset, sizes, and LQIP blur placeholders.

## Layout Inconsistencies Resolved
- Explicit resolutions for conflicting patterns discovered during multi-page research.
```

---

## Deliverable Structure 3: Client-Facing Layout Previews (`project-docs/client-review/pages/`)

Non-technical clients cannot interpret markdown or code specifications. For every page slug in `project-docs/page-list.md`, Stage 5 produces a dedicated, self-contained HTML layout page, plus a top-level layout index hub.

### File Hierarchy & Naming
```
project-docs/client-review/pages/
├── index.html                   # Top-level layout review hub listing all slugs
├── home/
│   └── index.html               # Homepage visual layout preview
├── about/
│   └── index.html               # About page visual layout preview
└── <safe-slug>/
    └── index.html               # Per-page visual layout preview
```

*Windows Slug Safety:* Windows disallowed path characters (`:`, `*`, `?`, `"`, `<`, `>`, `|`, `[`, `]`) must be sanitized into safe kebab-case directory names (e.g., dynamic route `blog-[slug]` becomes folder `blog-post`).

### Required Information on Every Layout Page
Each client-facing HTML page must present, in plain, jargon-free language:
1. **Page Name & Purpose:** Clear headline and 1–2 sentence explanation of what the page accomplishes for visitors.
2. **Labeled Section Sequence:** Every section from `layout.md` rendered in identical sequential order as a distinct visual card, labeled with its user-friendly name and what it does for the visitor.
3. **Authentic Content & Marked Placeholders:** Incorporates the client's actual discovery copy. Any missing text must be clearly tagged as `[Client Copy Needed: ...]` with `data-placeholder="true"`. Never use text from reference websites.
4. **Image & Media Slots:** Displays aspect ratio containers showing media role, alt text, and source requirements (`Client Asset Needed`, `Stock Licensed`, or `Placeholder`).
5. **Calls to Action (CTAs):** Primary and secondary action buttons with target destinations explained in plain terms.
6. **Forms & Integrations:** Interactive forms described in plain terms (e.g., "Contact inquiry form collecting name, email, phone, and message").
7. **Responsive Behavior:** Clear explanations of how the layout behaves on a phone versus a desktop (stacking order, sticky elements, drawer menus).
8. **Preview Banner:** Prominent label: *"Layout preview, not the final design — Visual styling reflects your chosen design variation, while full imagery, polished motion, and final copy will be applied in later stages."*
9. **Per-Page Decision Block:** A copy-ready reply block with one-click copy button (Approve, Requested Changes, Anything to Avoid).
10. **Collapsed Developer Details:** Technical code notes (section ID, component path, Server/Client type, line limits, character capacities) must be enclosed inside `<details><summary>Technical Specifications for Developers</summary>`.

### Top-Level Layout Index (`pages/index.html`)
The index page lists every page slug from `page-list.md` in a structured directory card grid:
- Page title, URL route, business purpose, and section count.
- Direct links to inspect each page's layout blueprint (`<slug>/index.html`).
- Current review status (`Pending Review` / `Approved`).
- Global decision reply snippet allowing the client to sign off on all layouts in one response.

### HTML Quality & Isolation Standards
- **Static & Self-Contained:** 100% offline-operable via `file://` or preview server; zero external CDN, font, or script dependencies.
- **Visual Fidelity:** Medium fidelity (structural layout preview) inheriting the approved Gate 2 design tokens and typography.
- **Responsive:** Built-in viewport toggle (Desktop 100% vs Phone 390px) and responsive CSS.
- **Accessibility & Contrast:** WCAG AA compliant contrast (text >= 4.5:1), alt text on all media slots, and keyboard-focusable controls.
- **Print-Friendly:** Clean `@media print` rules hiding interactive controls and decision boxes.
- **Placeholder Hygiene:** Zero unresolved template tokens (`{{...}}`).

---

## Deliverable Structure 4: Next.js Site Architecture & Manifest (`site/`)

When `nextjs` mode is selected (intake Q43c = `yes`), Stage 5 starts the real site in `site/` at the project root once from the approved variation's `layout.md` blueprints, and writes a compact machine-readable manifest (`site/site.manifest.json`). Later pipeline stages (Stages 6–11) work directly from this manifest and modify code incrementally without re-scanning or regenerating the codebase.

### 1. Location & Containment Boundary
- **Target Folder:** `site/` strictly at the project root.
- **Safety Precondition:** If `site/` already exists and is not empty, **HALT EXECUTION IMMEDIATELY** and ask the user how to proceed. Never overwrite or re-initialize an existing codebase.
- **Containment Scope:** All writes are confined exclusively to:
  1. `site/` (codebase, configs, and `site/site.manifest.json`)
  2. `project-docs/client-answers.md` (intake brief)
  3. `project-docs/router-state.md` (state machine)
  4. `project-docs/launch-checklist.md` (pre-launch guard checklist)
  No other folders, root files, or sibling applications in the project are touched.

### 2. Output Mapping from `layout.md`
- **One Route per Slug:** Each page slug from `project-docs/page-list.md` maps 1:1 to an App Router route (`site/app/<route>/page.js`). Dynamic routes follow Next.js folder naming (e.g. `blog-[slug]` becomes `site/app/blog/[slug]/page.js`).
- **Thin Page Server Components:** `page.js` is strictly an orchestrator (`<= 80 lines`), exporting route metadata and rendering section components in blueprint order.
- **One Component per Section ID:** Each section in `layout.md` maps to a modular component in `site/app/<route>/_components/<SectionName>.js` (`<= 250 lines`).
- **Section Markers (`data-section`):** Every section component must render its `layout.md` section ID via a `data-section="<id>"` attribute and `id="<id>"`:
  ```jsx
  // section: home-s1-hero
  export default function HeroSection({ content }) {
    return (
      <section id="home-s1-hero" data-section="home-s1-hero" className="...">
        ...
      </section>
    );
  }
  ```
- **Decoupled Content Modules:** Verbatim copy and marked placeholders (`data-placeholder="true"`) are isolated in dedicated content files (`site/content/<slug>.js`), keeping layout code purely structural.
- **Variation Design Tokens:** The approved variation's colors, typography scale, radii, and spacing tokens are wired into `site/app/globals.css` and the styling config.
- **Global Navigation:** Header (`Nav.js`) and Footer (`Footer.js`) are promoted to `site/components/` and rendered in the root layout (`site/app/layout.js`).
- **Clean Boundaries:** Zero CMS data wiring or backend APIs are generated during Stage 5 (reserved for Stage 7 and Stage 9).

### 3. Pre-Launch Guard (`noindex` + Preview Banner)
To protect unlaunched sites from being indexed by search engines or mistaken for live production:
- **Unified Setting:** Controlled by `NEXT_PUBLIC_PREVIEW_GUARD="true"` in `site/.env.local` (active by default).
- **Search Engine Blocking:** Root `app/layout.js` exports `robots: { index: false, follow: false }` when active. In addition, `site/app/robots.js` serves `Disallow: /`.
- **Visual Alert:** Renders `<PreviewBanner />` at the top of the viewport stating *"Preview Environment — Under Construction. Not for public indexing."*
- **Launch Checklist Item:** The mode writes to `project-docs/launch-checklist.md`:
  `- [ ] Pre-Launch Guard Deactivation: Set NEXT_PUBLIC_PREVIEW_GUARD="false" before public DNS switchover.`
- **Guard Boundaries:**
  - *What it covers:* Prevents crawler indexing by standard search engines and visually identifies preview deployments.
  - *What it cannot cover:* It does not provide access authentication/passwords, block malicious scrapers that ignore robots.txt, or prevent shared preview URL leaks.

### 4. Site Manifest Specification (`site/site.manifest.json`)
A compact machine-readable index emitted at the root of `site/`:
```json
{
  "$schema": "https://agentskills.io/schemas/site-manifest-v1.json",
  "generator": "create-nww-website",
  "mode": "nextjs",
  "generatedAt": "2026-10-21T12:00:00Z",
  "sourceVariation": "Variation 1: The Modernist Architect",
  "sourceLayoutDocs": "page-specs/<slug>/layout.md",
  "conventions": {
    "packageManager": "pnpm",
    "language": "javascript",
    "appDir": "site/app",
    "importAlias": "@/*",
    "tokensFile": "site/app/globals.css"
  },
  "preLaunchGuard": {
    "enabled": true,
    "envVar": "NEXT_PUBLIC_PREVIEW_GUARD",
    "checklist": "project-docs/launch-checklist.md"
  },
  "pages": [
    {
      "slug": "home",
      "route": "/",
      "layoutBlueprint": "page-specs/home/layout.md",
      "pageFile": "site/app/page.js",
      "contentFile": "site/content/home.js",
      "sections": [
        {
          "id": "home-s1-hero",
          "name": "Hero",
          "componentFile": "site/app/(marketing)/_components/HeroSection.js",
          "contentKey": "hero",
          "marker": "data-section=\"home-s1-hero\""
        }
      ]
    }
  ]
}
```
*Token Savings:* Downstream stages read this manifest (~50 lines) to locate exact files, avoiding recursive file tree scanning and saving up to 80% input tokens.

---

## Parity, Consistency & Freshness Rules

### 1. The 1:1 Parity Rule
`layout.md` is the internal agent-facing source of truth. Both `html` and `nextjs` outputs are derived strictly from `layout.md` and authentic client inputs. Neither mode may add sections, CTAs, forms, or claims that `layout.md` does not specify.

### 2. Consistency Audits per Mode
- **For `html` Mode:** Run `node skills/create-nww-website/scripts/client-review/verify-layout.mjs .` asserting 1:1 section order, freshness (`mtime(layout.md) <= mtime(layout.html)`), and offline isolation.
- **For `nextjs` Mode:** Read-only check comparing `page-specs/<slug>/layout.md` vs `site/site.manifest.json` vs component `data-section="<id>"` markers on disk.

### 3. Change Flow & Drift Detection (Post-Scaffolding)
Once `site/` exists, full-site regeneration is strictly forbidden:
1. Update `page-specs/<slug>/layout.md` first.
2. Update only the affected section component(s) and content keys.
3. Update `site/site.manifest.json`.
4. Re-run consistency and build checks.
*Drift Detection:* If the auditor finds discrepancy between `layout.md`, the manifest, and code markers, the agent **halts execution, reports the exact drift, and asks the user for instructions**. It never silently overwrites manual code edits.

### 4. Similarity Audit & Tailwind Exemption
Anti-copy distance rules from [references/design-variations.md](design-variations.md) apply to generated code and copy.
- **Tailwind Exception (Stated Once):** Standard utility class names (`flex`, `grid`, `col-span-12`, `p-4`, `text-lg`, `bg-slate-900`) are standard utility tokens and are **excluded** from class-name overlap checks. The audit strictly evaluates custom class names, element IDs, CSS variable names, component/file names, verbatim text, and assets.

---

## Taste & Motion Rules

- **Motion Discipline:** Every section defaults to `static by design`. At most **one section per page** may be designated as the "bold moment" (typically the hero).
- **Ban Uniform Entrances:** Do not apply uniform fade-and-slide-up animations across all sections of a page.
- **Server-Rendered Presence:** All text and layout containers must be fully present in initial server-rendered HTML. Animations run strictly post-hydration.

---

## Gate 5 Review Checklist & Handover Protocol

### Gating Rule (Markdown is Internal)
No client-facing gate ever asks the client to open, read, or approve `.md` files. Every client review gate presents browser previews (HTML portal or local Next.js server). `.md` files are strictly internal developer artifacts.

### Before Presenting Gate 5 to the Client
- [ ] Precondition satisfied: Gate 2 chosen design variation is recorded in `router-state.md` and `design-theory.md`.
- [ ] Every page in `page-list.md` has an agent blueprint at `page-specs/<slug>/layout.md`.
- [ ] Mode verified:
  - If `html` mode: Previews generated at `client-review/pages/<slug>/index.html` and `verify-layout.mjs` passes.
  - If `nextjs` mode: Real site generated in `site/`, `site/site.manifest.json` emitted, section markers verified, and production build passes.
- [ ] Pre-launch guard enabled (`robots: { index: false, follow: false }` and `<PreviewBanner />` active).
- [ ] Motion intent defaults to `static by design` with at most one bold moment per page.
- [ ] `project-docs/router-state.md` updated to `Gate 5: Awaiting Client Layout Decision`.

### Gate 5 Presentation & Downstream Handover
Present Gate 5 in plain language directing the client to the review preview. Upon Gate 5 approval:
1. For `html` mode: Proceed to Stage 6 Content & Assets.
2. For `nextjs` mode: Hand control back with the exact path to `site/site.manifest.json` for Stage 6 incremental content population.

### Post-Build Vercel Deployment Note
Once the site has been completely built, audited, and approved at Gate 11b, deployment to Vercel is executed by adding and invoking the official Vercel deployment agent skill:
```bash
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill deploy-to-vercel
```
