# Codebase Scaffolding, Foundation Build & Landing Page Showcase (Stage 6)

Stage 6 initializes the Next.js App Router application in `site/`, generates the master QA checklist, builds the production foundation shell, scaffolds all application routes from approved Stage 5 `page.md` specifications, and **fully constructs the Landing Page (`site/app/page.js` + `_components/`) for client showcase**.

---

## 1. Role & Responsibilities

Stage 6 is the foundational engineering and initial showcase stage:
1. **Pre-scaffolding Engineering Standards:** Pre-loads 10 specialized agent skills covering Next.js App Router conventions, React composition patterns, design system tokens, and the GSAP animation suite.
2. **Master QA & Taste Checklist Generation:** Emits `project-docs/page-checklist.md` and `project-docs/theory-revisions.md` defining binary pass/fail acceptance criteria.
3. **Codebase Initialization:** Scaffolds Next.js App Router in `site/` with verified conventions without nested git tracking.
4. **Production Foundation Shell:**
   - Injects design tokens into `site/app/globals.css` and `site/styles/tokens.css`.
   - Assembles global shell: `Nav.js`, `Footer.js`, root layout `site/app/layout.js`, and `site/components/ResponsiveImage.js`.
   - Exports dual GSAP & CSS motion tokens to `site/lib/motion.js`.
   - Runs the asset optimizer (`scripts/assets-optimizer/index.js`), outputting WebP variants to `site/public/assets/` and writing `site/assets-optimize.config.md`.
   - Adds 3 check scripts (`check-structure.mjs`, `check-assets.mjs`, `make-placeholders.mjs`) and wires `pnpm check:all`.
   - Scaffolds `site/AGENTS.md` and 4 scoped AGENTS.md files (`app/`, `components/`, `lib/`, `content/`).
   - Wires CMS data access layer (`site/lib/cms/`) if `cms: cms`.
   - Generates `/credits` page (`site/app/credits/page.js`) if stock imagery was sourced.
5. **Route & Component Scaffolding:** Scaffolds all App Router routes and section components with `// section: <id>` and `data-section="<id>"` markers, decoupling content into `site/content/`, and emitting `site/site.manifest.json`.
6. **Full Landing Page Construction for Client Showcase:**
   - Implements thin `site/app/page.js` (<= 80 lines).
   - Fully codes and styles all home section components in `site/app/_components/` (<= 250 lines).
   - Wires authentic verbatim copy from `site/content/home.js`.
   - Connects optimized media assets via `ResponsiveImage.js`.
   - Applies tasteful, subtle GSAP motion wrapped in `useGSAP` with container scopes and unmount cleanup.
7. **Gate 6 Client Showcase:** Presents the fully functional, interactive Landing Page to the client along with passing build diagnostics (`pnpm build`).

---

## 2. Location & Containment Boundary

- **Target Folder:** `site/` strictly at the project root.
- **Safety Precondition:** If `site/` already exists and is not empty, **HALT EXECUTION IMMEDIATELY** and ask the user how to proceed. Never overwrite or re-initialize an existing codebase.
- **Containment Scope:** All codebase writes are confined exclusively to `site/`. Planning docs update `project-docs/page-checklist.md`, `project-docs/theory-revisions.md`, `project-docs/router-state.md`, and `project-docs/launch-checklist.md`.

---

## 3. Runtime Convention Discovery Procedure

Before scaffolding or generating code in `site/`:
1. **Document Inspection:** Read `project-docs/tech-stack.md` and `project-docs/code-conventions.md`.
2. **Lockfile Detection:** Check project root for:
   - `pnpm-lock.yaml` -> `pnpm`
   - `package-lock.json` -> `npm`
   - `yarn.lock` -> `yarn`
   - `bun.lockb` / `bun.lock` -> `bun`
   - *Conflict Guard:* If multiple conflicting lockfiles exist in the root, halt and ask the human to resolve the ambiguity.
3. **Language Detection:** Check for `tsconfig.json`. If present -> TypeScript (`.ts`, `.tsx`); otherwise -> JavaScript (`.js`, `.jsx`).
4. **Intake Fallback:** If no existing project files or lockfiles exist, apply the user's default stack: Next.js App Router, Tailwind CSS, JavaScript, `pnpm`, root `app/`, `@/*`.
5. **Print Discovery Report:**
   ```
   --- NWW Convention Discovery Report ---
   Package Manager: pnpm (detected from pnpm-lock.yaml)
   Language: JavaScript (project default applied)
   App Directory: site/app/
   Import Alias: @/*
   Styling: Tailwind CSS
   Pre-Launch Guard: Active (noindex + banner enabled)
   ---------------------------------------
   ```

---

## 4. Scaffolding & Foundation Execution Protocol

### Step 0: Load Specialized Architecture & Engineering Skills
Before scaffolding or writing code in `site/`, the agent MUST load the specialized agent skills covering Next.js App Router best practices, React composition patterns, web design guidelines, token design systems, and the GSAP animation suite:

```bash
# Next.js & React Architecture Standards (Vercel Labs)
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/openreview --skill next-best-practices

# Design System & Token Architecture
DISABLE_TELEMETRY=1 npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill design-system

# GSAP Animation Suite
DISABLE_TELEMETRY=1 npx skills add https://github.com/heygen-com/hyperframes --skill gsap
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
```

*(Note: For React-specific GSAP lifecycle hooks and unmount cleanup, `greensock/gsap-skills` also supplies `gsap-react`.)*

### Step 1: Initialize Next.js Application
Execute the official generator non-interactively using verified flags matching discovered conventions:
```bash
# Example for discovered JavaScript + pnpm stack:
pnpm create next-app@latest site --js --tailwind --app --eslint --import-alias "@/*" --disable-git --use-pnpm
```
- **Mandatory Flag `--disable-git`:** Prevents creating a nested git repository within the parent workspace.
- **Dependency Boundary:** No third-party packages beyond the official generator and the approved tech stack may be installed.

### Step 2: Generate Master QA Checklist & Theory Revisions
Generate the QA acceptance artifacts before building pages:
- `project-docs/theory-revisions.md`: Records taste adjustments, typography contrast audits, and motion limits.
- `project-docs/page-checklist.md`: Master static QA checklist establishing binary pass/fail checks across individual pages, the foundation shell, and final cross-page verification.

### Step 3: Wire Design Tokens & Foundation Shell
- Extract semantic tokens from `project-docs/design-theory.md` (colors, typography scale, container widths, radii) and wire them into `site/app/globals.css` and `site/styles/tokens.css`.
- Export GSAP and CSS motion tokens into `site/lib/motion.js`.
- Promote shared navigation header (`Nav.js`) and footer (`Footer.js`) to `site/components/`.
- Install `site/components/ResponsiveImage.js` for zero-CLS server-rendered image loading with LQIP blur placeholders.
- Wire `Nav` and `Footer` into root layout `site/app/layout.js`.

### Step 4: Asset Optimization, Scoped AGENTS.md & Check Scripts
- Run the asset optimizer from `assets-source/` to `site/public/assets/`, writing configuration to `site/assets-optimize.config.md`:
  ```bash
  node skills/create-nww-website/scripts/assets-optimizer/index.js --input ../assets-source --output public/assets --image-format webp --quality 75 --max-size 61440 --strict-max-size 102400 --concurrency 4 --responsive --manifest-dir public/assets
  ```
- Scaffold `site/AGENTS.md` (<=150 lines) and 4 scoped AGENTS.md files: `site/app/AGENTS.md`, `site/components/AGENTS.md`, `site/lib/AGENTS.md`, and `site/content/AGENTS.md`.
- Create check scripts in `site/scripts/`: `check-structure.mjs`, `check-assets.mjs`, `make-placeholders.mjs`. Wire into `site/package.json`:
  ```json
  "scripts": {
    "check:structure": "node scripts/check-structure.mjs",
    "check:assets": "node scripts/check-assets.mjs",
    "check:all": "pnpm check:structure && pnpm check:assets && pnpm lint && pnpm build"
  }
  ```

### Step 5: CMS Client Layer & Stock Credits (Conditional)
- If `cms: cms`: Wire data access layer in `site/lib/cms/` (`revalidation.js`, `blog.js`, `forms.js`) and on-demand ISR route `POST /api/revalidate`.
- If stock imagery was sourced: Generate `site/app/credits/page.js` from `project-docs/stock-provenance.json`, link in `Footer.js`, and ensure Unsplash images carry `referrerPolicy="no-referrer-when-downgrade"`.

---

## 5. Output Mapping from Stage 5 `page.md`

Stage 6 iterates through every `page-specs/<slug>/page.md` and maps its contents into the App Router structure:

1. **One Route per Slug:**
   - Each page slug from `project-docs/page-list.md` maps 1:1 to an App Router route (`site/app/<route>/page.js`).
   - Dynamic routes follow Next.js folder naming (e.g. `blog-[slug]` becomes `site/app/blog/[slug]/page.js`).
2. **Thin Page Server Components (`page.js`):**
   - Maximum **80 lines**.
   - Server Component by default; never place `'use client'` on `page.js`.
   - Exports route `metadata` (title, description, canonical) from `page.md`.
   - Renders section components in blueprint order.
3. **One Component per Section ID:**
   - Each section in `page.md` maps to a modular component in `site/app/<route>/_components/<SectionName>.js` (**<= 250 lines**).
   - Every section component must open with the section comment and render `data-section="<id>"`:
     ```jsx
     // section: services-s1-hero
     export default function HeroSection({ content }) {
       return (
         <section id="services-s1-hero" data-section="services-s1-hero" className="...">
           ...
         </section>
       );
     }
     ```
4. **Decoupled Content Modules (`site/content/<slug>.js`):**
   - Verbatim copy and marked placeholders (`data-placeholder="true"`) from `page.md` are isolated into dedicated content files (`site/content/<slug>.js`).
   - Keeps section components purely structural.
   - Shared text from `page-specs/_shared/*.md` maps to `site/content/shared/<name>.js`.

---

## 6. Pre-Launch Guard (`noindex` + Preview Banner)

To protect unlaunched sites from being indexed by search engines or mistaken for live production:
- **Unified Setting:** Controlled by `NEXT_PUBLIC_PREVIEW_GUARD="true"` in `site/.env.local` (active by default).
- **Search Engine Blocking:** Root `app/layout.js` exports `robots: { index: false, follow: false }` when active. In addition, `site/app/robots.js` serves `Disallow: /`.
- **Visual Alert:** Renders `<PreviewBanner />` at the top of the viewport stating *"Preview Environment — Under Construction. Not for public indexing."*
- **Launch Checklist Item:** Writes to `project-docs/launch-checklist.md`:
  `- [ ] Pre-Launch Guard Deactivation: Set NEXT_PUBLIC_PREVIEW_GUARD="false" before public DNS switchover.`

---

## 7. Site Manifest Specification (`site/site.manifest.json`)

Stage 6 emits a compact machine-readable manifest at the root of `site/`:

```json
{
  "$schema": "https://agentskills.io/schemas/site-manifest-v1.json",
  "generator": "create-nww-website",
  "mode": "scaffolded",
  "generatedAt": "2026-10-23T12:00:00Z",
  "sourceVariation": "Variation 1: The Modernist Architect",
  "sourcePageSpecs": "page-specs/<slug>/page.md",
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
      "status": "fully_built",
      "pageSpec": "page-specs/home/page.md",
      "pageFile": "site/app/page.js",
      "contentFile": "site/content/home.js",
      "sections": [
        {
          "id": "home-s1-hero",
          "name": "Hero",
          "componentFile": "site/app/_components/HeroSection.js",
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

## 8. Full Landing Page Construction for Client Showcase

Stage 6 does not stop at structural scaffolding; it immediately builds out the **Landing Page (Home route: `site/app/page.js`) as the flagship interactive showcase**:
1. **Thin Home Page Server Component:** `site/app/page.js` (<= 80 lines) exports metadata and renders Home section components in blueprint order.
2. **Polished Section Components:** Every section in `page-specs/home/page.md` is fully coded and styled in `site/app/_components/<SectionName>.js` (<= 250 lines).
3. **Copy & Media Wiring:** Fully wired to verbatim copy in `site/content/home.js` and optimized images rendered via `ResponsiveImage.js`.
4. **Taste & Motion Discipline:** Subtle GSAP motion wrapped in `useGSAP` with container scopes, `gsap.matchMedia()` honoring `prefers-reduced-motion`, and at most ONE bold moment on the page.
5. **Client Showcase Readiness:** The landing page is immediately previewable via local dev server (`pnpm dev`) or review portal for client inspection and sign-off.

---

## 9. Scaffolding Verification & Gate 6 Sign-Off

### Automated Consistency Audit
Run companion script `scripts/client-review/verify-nextjs.mjs`:
```bash
node skills/create-nww-website/scripts/client-review/verify-nextjs.mjs .
```
Asserts that:
1. `site/site.manifest.json` exists and is valid.
2. Every page in `page-list.md` and `page-specs/<slug>/page.md` has an App Router route and page file.
3. Every section ID from `page.md` has a corresponding component with `data-section="<id>"`.
4. Pre-launch guard is active.

### Build Verification
Execute test production build from within `site/`:
```bash
pnpm build
```
Build must compile with zero errors.

### Gate 6 Review Checklist
- [ ] 10 specialized architecture & GSAP skills pre-loaded.
- [ ] Next.js App Router codebase initialized in `site/` without nested git repo.
- [ ] `project-docs/theory-revisions.md` and `project-docs/page-checklist.md` generated.
- [ ] Foundation shell operational: Nav, Footer, tokens, `ResponsiveImage.js`, motion tokens.
- [ ] Asset optimizer executed; `assets-optimize.config.md` persisted.
- [ ] Scoped AGENTS.md files and check scripts operational (`pnpm check:all` passes).
- [ ] Route structure matches all pages in `page-list.md`.
- [ ] **Landing Page (`site/app/page.js` + `_components/`) fully constructed, styled, animated, and showcase-ready.**
- [ ] Pre-launch guard enabled in `site/.env.local` and root layout.
- [ ] `site/site.manifest.json` emitted and validated via `verify-nextjs.mjs`.
- [ ] `pnpm build` compiles cleanly with zero errors.
- [ ] `project-docs/router-state.md` updated to `Gate 6: Scaffolding, Foundation & Landing Page Approved`.

### Gate 6 Presentation & Downstream Handover
Present Gate 6 to the client with the live interactive Landing Page showcase (via local server or review portal) along with clean build diagnostics. Upon Gate 6 approval:
- Advance to **Stage 7 (Sub-Page Build Loop)** to incrementally construct remaining sub-pages (`about`, `services`, `contact`, `blog`, etc.) one-by-one with per-page review and binary QA sign-off.
