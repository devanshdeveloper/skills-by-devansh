# Codebase Scaffolding, Foundation Build & Landing Page Showcase (Stage 6)

## Table of Contents
- [1. Role & Responsibilities](#1-role--responsibilities)
- [2. Location & Containment Boundary](#2-location--containment-boundary)
- [3. Runtime Convention Discovery Procedure](#3-runtime-convention-discovery-procedure)
- [4. Scaffolding & Foundation Execution Protocol](#4-scaffolding--foundation-execution-protocol)
- [5. Output Mapping from Stage 5 page.md](#5-output-mapping-from-stage-5-pagemd)
- [6. Pre-Launch Guard (noindex + Preview Banner)](#6-pre-launch-guard-noindex--preview-banner)
- [7. Full Landing Page Construction for Client Showcase](#7-full-landing-page-construction-for-client-showcase)
- [8. Scaffolding Verification & Gate 6 Sign-Off](#8-scaffolding-verification--gate-6-sign-off)

Stage 6 initializes the Next.js App Router application in `site/`, generates the master QA checklist, builds the production foundation shell, scaffolds all application routes from approved Stage 5 `page.md` specifications, and **fully constructs the Landing Page (`site/app/page.js` + `_components/`) for client showcase**.

---

## 1. Role & Responsibilities

Stage 6 is the foundational engineering and initial showcase stage:
1. **CMS Blocking Guard:** Verify that all 28 questions in `project-docs/client-review/gate-5-cms-requirements/open-questions.md` are resolved in `cms-implementation-rules.md`.
2. **Pre-scaffolding GSAP Standards:** Pre-load approved GSAP animation skills per [gsap-animation-tiers.md](gsap-animation-tiers.md).
3. **Master QA Checklist:** Emit `project-docs/page-checklist.md` per [page-checklist.md](page-checklist.md).
4. **Codebase Scaffolding & Env:** Initialize `site/` with verified conventions without nested git tracking and generate `site/.env.example`.
5. **Production Foundation Shell:** Inject theme tokens into `site/app/globals.css`, assemble global shell (`Nav.js`, `Footer.js`, root `layout.js`, `ResponsiveImage.js`), and export motion tokens to `site/lib/motion.js`.
6. **Asset Optimization & Scoped Agents:** Run asset optimizer per [asset-optimization.md](asset-optimization.md), generate scoped AGENTS.md files, and wire verification check scripts per [code-conventions.md](code-conventions.md).
7. **Conditional Integrations:** Wire CMS client layer (`site/lib/cms/`) from `references/gate-6-scaffolding/cms-kit/`, blog routes per [cms-kit.md](cms-kit.md), and `/credits` page if stock imagery was sourced.
8. **Route Scaffolding & Landing Showcase:** Scaffold all App Router routes from Stage 5 `page.md` specs and construct the fully functional Landing Page (`site/app/page.js` + `_components/`) for client showcase.
9. **Gate 6 Sign-Off:** Verify production build (`pnpm build`) and present the live showcase for client approval.

---

## 2. Location & Containment Boundary

- **Target Folder:** `site/` strictly at the project root.
- **Safety Precondition:** If `site/` already exists and is not empty, **HALT EXECUTION IMMEDIATELY** and ask the user how to proceed. Never overwrite or re-initialize an existing codebase.
- **Containment Scope:** All codebase writes are confined exclusively to `site/`. Planning docs update `project-docs/page-checklist.md`, `project-docs/router-state.md`, and `project-docs/launch-checklist.md`.
- **Gate Containment Invariant:** Zero loose markdown files outside gates. All planning deliverables under `project-docs/client-review/` and all skill reference documents must strictly live inside their designated gate folders (`gate-0-intake/` through `gate-9-final-verification/`). Creating loose markdown files directly under `references/` or loose in `project-docs/` is strictly prohibited.

---

## 3. Runtime Convention Discovery Procedure

Before scaffolding or generating code in `site/`:
1. **Document Inspection:** Read `project-docs/client-review/gate-1-tech-stack/tech-stack.md` and `project-docs/code-conventions.md`.
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

### Step 0: Motion Tier Check & Skills Pre-Load
Before scaffolding or writing code in `site/`, verify that all questions in `project-docs/client-review/gate-5-cms-requirements/open-questions.md` are resolved in `cms-implementation-rules.md`. Check the client's selected animation tier from `client-context/answers/batch-02-branding-motion/answers.md` against [gsap-animation-tiers.md](gsap-animation-tiers.md):

- **If `motion: disabled`:**
  - Do **NOT** execute the skill load commands.
  - Do **NOT** install `gsap` or `@gsap/react` in `site/package.json`.
  - Proceed directly to Step 1.
- **If `motion: low | medium | high | max | ultra`:**
  - Load the approved GSAP animation suite:
```bash
# GSAP Animation Suite
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
```
  - For `high`, `max`, or `ultra` projects, install required companion libraries (e.g. `pnpm add lenis/react` for smooth scrolling, or `three` for ultra WebGL scenes) per [gsap-animation-tiers.md](gsap-animation-tiers.md).

### Step 1: Initialize Next.js Application & Env Template
Execute the official generator non-interactively using verified flags matching discovered conventions:
```bash
# Example for discovered JavaScript + pnpm stack:
pnpm create next-app@latest site --js --tailwind --app --eslint --import-alias "@/*" --disable-git --use-pnpm
```
- **Mandatory Flag `--disable-git`:** Prevents creating a nested git repository within the parent workspace.
- **Root `.gitignore` Configuration:** Verify or create `.gitignore` at the project root so that legacy site mirrors, vendor dependencies, and environment files are strictly ignored by git:
  ```gitignore
  # Legacy site offline mirror & harvested assets (Stage 0 migration)
  previous-site/

  # Dependencies & framework builds
  node_modules/
  .next/
  site/node_modules/
  site/.next/

  # Environment secrets
  .env*
  !.env.example
  site/.env*
  !site/.env.example
  ```
- **Project Name & Slug Synchronization:** Immediately update `site/package.json` so that `"name": "<project-slug>"` matches the confirmed technical project slug from `client-context/answers/batch-01-core-identity/answers.md` (Batch 01 Q1b).
- **Vercel Project Setup:** When linking or deploying to Vercel for client reviews, use this confirmed project slug (`vercel link --project <project-slug>`). Localhost forwarding is strictly forbidden for client review milestones.
- **Dependency Boundary:** No third-party packages beyond the official generator and the approved tech stack may be installed.
- **File Size & Token Efficiency:** Generated files in `site/` must be as small as possible without limiting the features or functionality of the page.
- **Site Environment Template:** Create `site/.env.example` documenting all required variables:
  ```env
  SITE_NAME="Your Brand Name"
  SERVER_URL="https://cms.example.com"
  CMS_SITE_KEY="your-cms-site-key"
  REVALIDATE_SECRET="your-revalidate-secret"
  NEXT_PUBLIC_SITE_URL="https://example.com"
  NEXT_PUBLIC_PREVIEW_GUARD="true"
  ```

### Step 2: Generate Master QA Checklist
Generate the master QA acceptance checklist before building pages:
- `project-docs/page-checklist.md`: Master static QA checklist establishing binary pass/fail checks across individual pages, the foundation shell, and final cross-page verification.
- **In-Place Revisions Rule:** Do NOT generate `project-docs/theory-revisions.md`. When revisions are requested, edit existing deliverable files in-place. If requirement notes are needed, place them in `client-requirements/`.

### Step 3: Wire Design Tokens & Foundation Shell
- Extract semantic tokens from `project-docs/client-review/gate-2-design-theory/design-theory.md` (colors, typography scale, container widths, radii) and wire theme variables into `site/app/globals.css`.
- **Tailwind-Only Styling Rule:** All styling across `site/` strictly uses pure **Tailwind utility classes directly in JSX**; extract repeating elements into small React sub-components per [code-conventions.md](code-conventions.md#strict-file--line-limits).
- Export motion tokens into `site/lib/motion.js`: if `motion: disabled`, export pure CSS/Tailwind transitions; if motion is active, export dual GSAP easing equations and CSS transitions per [gsap-animation-tiers.md](gsap-animation-tiers.md).
- Promote shared navigation header (`Nav.js`) and footer (`Footer.js`) to `site/components/`.
- Install `site/components/ResponsiveImage.js` for zero-CLS server-rendered image loading with LQIP blur placeholders per [asset-optimization.md](asset-optimization.md).
- Install `site/components/seo/Schema.js` for safe, XSS-escaped Schema.org JSON-LD structured data injection across pages.
- Wire `Nav` and `Footer` into root layout `site/app/layout.js`.

### Step 4: Asset Optimization, Scoped AGENTS.md & Check Scripts
- Run the asset optimizer from `assets-source/` to `site/public/assets/`, writing configuration to `site/assets-optimize.config.md` per [asset-optimization.md](asset-optimization.md):
  ```bash
  node skills/create-nww-website/scripts/assets-optimizer/index.js --input ../assets-source --output public/assets --image-format webp --quality 75 --max-size 61440 --strict-max-size 102400 --concurrency 4 --responsive --manifest-dir public/assets
  ```
- Scaffold `site/AGENTS.md` (<=150 lines) and 4 scoped AGENTS.md files (`app/`, `components/`, `lib/`, `content/`) per [code-conventions.md](code-conventions.md#scoped-agentsmd-hierarchy).
- Create verification scripts in `site/scripts/` (`check-structure.mjs`, `check-assets.mjs`, `make-placeholders.mjs`) and wire into `site/package.json` scripts (`check:structure`, `check:assets`, `check:all`) per [code-conventions.md](code-conventions.md#automated-verification-scripts--package-commands).

### Step 5: CMS Client Layer & Stock Credits (Conditional)
- **If `cms: cms`:**
  1. Copy the class-based library directory `skills/create-nww-website/references/gate-6-scaffolding/cms-kit/` directly into `site/lib/cms/`.
  2. Implement the on-demand ISR webhook route handler in `site/app/api/revalidate/route.js` per [../cms/rulebook.md](../cms/rulebook.md#4-the-on-demand-isr-webhook-apirevalidate).
  3. Wire dynamic blog routes (`site/app/blog/page.js` and `site/app/blog/[slug]/page.js`) using the class-based kit (`Blog.readOne`, `Blog.paginate`, `Blog.generateMetadata`, `Blog.generateJSONLD`) per [../gate-6-scaffolding/cms-kit.md](cms-kit.md).
  4. For any other active dynamic modules (Services, Projects/Portfolio, Testimonials, FAQs, Features, Case Studies, Policies), import data access helpers from `@/lib/cms` following the Verified Route Catalog in [../cms/rulebook.md](../cms/rulebook.md#6-verified-multi-module-route-catalog-websitemodules).
- **If stock imagery was sourced:** Generate `site/app/credits/page.js` from `project-docs/stock-provenance.json`, link in `Footer.js`, and ensure Unsplash images carry `referrerPolicy="no-referrer-when-downgrade"`.

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

## 7. Full Landing Page Construction for Client Showcase

Stage 6 does not stop at structural scaffolding; it immediately builds out the **Landing Page (Home route: `site/app/page.js`) as the flagship interactive showcase**:
1. **Thin Home Page Server Component:** `site/app/page.js` (<= 80 lines) exports metadata and renders Home section components in blueprint order.
2. **Polished Section Components:** Every section in `page-specs/home/page.md` is fully coded and styled in `site/app/_components/<SectionName>.js` (<= 250 lines).
3. **Copy & Media Wiring:** Fully wired to verbatim copy in `site/content/home.js` and optimized images rendered via `ResponsiveImage.js`.
4. **Taste & Motion Discipline:** Animation strictly adhering to the selected motion tier (`disabled`, `low`, `medium`, `high`, `max`, `ultra`) per [gsap-animation-tiers.md](gsap-animation-tiers.md). If motion is active, wrap in `useGSAP` with container scopes, `gsap.matchMedia()` honoring `prefers-reduced-motion`, and at most ONE bold moment on the page.
5. **Client Showcase Readiness:** The landing page is immediately previewable via local dev server (`pnpm dev`) or review portal for client inspection and sign-off.

---

## 8. Scaffolding Verification & Gate 6 Sign-Off

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
- [ ] Precondition satisfied: Zero unresolved CMS questions; all codified in `gate-5-cms-requirements/cms-implementation-rules.md`.
- [ ] Approved GSAP animation skills pre-loaded (or skipped if `motion: disabled`).
- [ ] Next.js App Router codebase initialized in `site/` without nested git repo.
- [ ] `site/.env.example` generated.
- [ ] File size discipline verified: code is lean and token-efficient without limiting features.
- [ ] `project-docs/page-checklist.md` generated (no separate `theory-revisions.md` file).
- [ ] Foundation shell operational: Nav, Footer, tokens, `ResponsiveImage.js`, motion tokens.
- [ ] Asset optimizer executed; `assets-optimize.config.md` persisted.
- [ ] Scoped AGENTS.md files and check scripts operational (`pnpm check:all` passes).
- [ ] Route structure matches all pages in `page-list.md`.
- [ ] Blog routes (if CMS active) implement static guarantees and Core Web Vitals per [../cms/blog.md](../cms/blog.md).
- [ ] **Landing Page (`site/app/page.js` + `_components/`) fully constructed, styled, animated, and showcase-ready.**
- [ ] Pre-launch guard enabled in `site/.env.local` and root layout.
- [ ] `site/site.manifest.json` emitted and validated via `verify-nextjs.mjs`.
- [ ] `pnpm build` compiles cleanly with zero errors.
- [ ] **Gate 6 Halt:** Present live Landing Page showcase; await scaffolding & showcase approval before Stage 7.
- [ ] `project-docs/router-state.md` updated to `Gate 6: Scaffolding, Foundation & Landing Page Approved`.

### Gate 6 Presentation & Downstream Handover
Present Gate 6 to the client with the live interactive Landing Page showcase (via local server or review portal) along with clean build diagnostics. Upon Gate 6 approval:
- Advance to **Stage 7 (Sub-Page Build Loop)** to incrementally construct remaining sub-pages (`about`, `services`, `contact`, `blog`, etc.) one-by-one with per-page review and binary QA sign-off.
