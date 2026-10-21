---
name: create-nww-website
description: Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 12-stage human-gated workflow. Supports dual HTML and Next.js layout generation modes with manifest-driven incremental builds. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project.
---

# Create NWW Website

This skill orchestrates the end-to-end creation of production-grade Next.js App Router websites with optional Next Web Website (NWW) CMS integration. It enforces a disciplined 12-stage human-gated workflow ensuring structural rigor, taste-driven aesthetic polish, and technical quality.

---

## Mandatory Start-Up Rule (Activation Protocol)

**ON ACTIVATION, IMMEDIATELY EXECUTE THIS START-UP PROTOCOL BEFORE ANY OTHER WORK:**

1. **First Action:** Check if the site brief file `project-docs/client-answers.md` already exists (single read-only check).
   - **If brief exists and is complete:** Present an intake recap, highlight any variations from project defaults, and halt for user confirmation to proceed to Gate 0.
   - **If brief exists but is partial:** Acknowledge answered fields, and present ONLY the first batch containing unanswered questions.
   - **If user provided a pasted brief or project notes in their prompt:** Extract known answers into `project-docs/client-answers.md`, report what was captured, and present ONLY the remaining gap questions.
   - **If no brief exists:** **IMMEDIATELY output Batch 1 (Questions 1 to 7)** of the intake questionnaire.
2. **Absolute Restrictions Before Presenting Batch 1:**
   - **ZERO** preliminary file searches, directory listings, or repository scans.
   - **ZERO** project scaffolding, bash commands, package installations, or code edits.
   - **ZERO** planning artifact creation before answers are collected.
3. **Execution & Pacing:**
   - Present questions in progressive batches of 5 to 7 questions as defined in [references/client-questionnaire.md](references/client-questionnaire.md).
   - Wait for the user's reply before presenting the subsequent batch.
   - Never guess or fabricate missing required answers. For optional questions, record approved defaults if the user answers "I don't know" or "decide later".
   - **Secret Hygiene:** NEVER request, accept, or record secret credentials, API keys, or passwords. Request environment variable names only (`CMS_SITE_KEY`, `SERVER_URL`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`).
   - Save all answers to `project-docs/client-answers.md`.
4. **Gate 0 Enforced Halt:**
   - Present the completed intake summary and asset inventory for explicit human confirmation.
   - **HALT EXECUTION.** Do not proceed to Stage 1 Tech Stack or start any building until explicit confirmation is granted.

Read [references/client-questionnaire.md](references/client-questionnaire.md) immediately on activation to present the intake batches and compile `project-docs/client-answers.md`.

---

## When to Use This Skill

Activate this skill when:
- Creating or scaffolding a new Next.js website from scratch.
- Integrating a site with the NWW CMS for blog publishing or lead capture.
- Running the sequential website pipeline (Stages 0 through 11).
- Generating project documentation: Design Theory, Layout Theory, Page List, or SEO Strategy.
- Authoring verbatim page copy, asset catalogs, or binary QA checklists.
- Building, animating (via GSAP), or verifying pages against their checklists.

---

## The 12-Stage Human-Gated Pipeline

The workflow proceeds strictly one stage at a time. Every stage requires explicit human sign-off at its gate before the next stage begins. Progress is tracked in `project-docs/router-state.md`.

| Stage | Name | Key Deliverables | Gate Approval | Reference Guide |
|---|---|---|---|---|
| **0** | **Intake Check** | `project-docs/client-answers.md` | **Gate 0:** Intake recap & CMS mode confirmation | [client-questionnaire.md](references/client-questionnaire.md) |
| **1** | **Tech Stack** | `project-docs/tech-stack.md` | **Gate 1:** Tech stack sign-off (Internal Developer Gate) | [pipeline-stages.md](references/pipeline-stages.md) |
| **2** | **Design Theory** | `project-docs/design-theory.md`, `project-docs/design-references/`, `project-docs/client-review/index.html` | **Gate 2:** Client visual review & variation selection sign-off (via `client-review/index.html`) | [design-theory.md](references/design-theory.md), [design-variations.md](references/design-variations.md) |
| **3** | **Page List** | `project-docs/page-list.md`, `page-design-notes.md` | **Gate 3:** Sitemap & route structure sign-off (via review portal / chat recap) | [page-list.md](references/page-list.md) |
| **4** | **SEO Strategy** | `project-docs/seo-strategy.md` | **Gate 4:** Keywords, JSON-LD, sitemap, redirects sign-off | [seo-strategy.md](references/seo-strategy.md) |
| **5** | **Layout Theory** | `project-docs/layout-system.md`, `page-specs/<slug>/layout.md` (internal spec), `client-review/pages/` (HTML mode) or `site/` with `site.manifest.json` (Next.js mode) | **Gate 5:** Visual layout review sign-off (via browser preview or local server) | [layout-theory.md](references/layout-theory.md) |
| **6** | **Content & Assets** | `page-specs/_shared/*.md`, `page-specs/<slug>/content.md`, `page-specs/<slug>/assets.md`, `project-docs/asset-requests.md`, `project-docs/stock-provenance.json` | **Gate 6:** Shared content & per-page copy sign-off (via visual previews / plain requests) | [page-content.md](references/page-content.md), [stock-image-sourcing.md](references/stock-image-sourcing.md) |
| **7** | **CMS Schema** | `project-docs/cms-schema.md`, `cms-backend-requirements.md`, `cms-seed/` | **Gate 7:** CMS schema & seeds sign-off (skipped if `none`) | [cms-architecture.md](references/cms-architecture.md) |
| **8** | **Page Checklist** | `project-docs/page-checklist.md`, `theory-revisions.md` | **Gate 8:** Master static checklist & taste revisions sign-off | [page-checklist.md](references/page-checklist.md) |
| **9** | **Foundation Build** | `site/`, `site/AGENTS.md`, 4 scoped AGENTS.md, `site/assets-optimize.config.md`, `site/components/ResponsiveImage.js`, shell nav/footer/motion, check scripts | **Gate 9:** Base shell, optimizer run, clean build check (`pnpm check:all`) | [code-conventions.md](references/code-conventions.md), [asset-optimization.md](references/asset-optimization.md) |
| **10** | **Page Build Loop** | `site/app/<route>/page.js`, `_components/`, `page-specs/<slug>/checklist-state.md`, `site/build-log.md` | **Gate 10a:** Per-page build review<br>**Gate 10b:** Per-page binary QA sign-off | [build-one-page.md](references/build-one-page.md) |
| **11** | **Final Verification & Handover** | `project-docs/structure-audit.md`, production audit, client handover (deploy via `deploy-to-vercel`) | **Gate 11a:** Cross-page fixes approval<br>**Gate 11b:** Final handover sign-off | [pipeline-stages.md](references/pipeline-stages.md) |

---

## State Machine & Gating Protocol

1. **State Tracking:** Maintain `project-docs/router-state.md` at all times. Update gate progress (`pending | approved`), current stage, open questions, webhook status (`pending | built-on-branch | deployed | verified`), and per-page track (`layout: pending|approved`, `content: pending|approved`, `build: not started|built-pending`).
2. **Never Auto-Advance:** When completing a stage, present the deliverable summary to the user and halt execution until the user grants explicit approval.
3. **Handling Rejections:** If the user requests modifications, update the stage outputs and re-present for approval.
4. **Master Checklist:** Track page completion solely in `project-docs/page-list.md` checkboxes (`- [x] Page Name`).
5. **Client Milestone Notifications:** At every stage completion and gate sign-off, ask the user if they wish to dispatch an email notification to the client. Run `node scripts/client-notify/index.js` to preview the draft. The script enforces explicit user approval before sending and logs the event to `project-docs/router-state.md`.

---

## Core Technical Conventions

All website code is generated under the `site/` directory:

- **Framework:** Next.js App Router (`app/` directory, React Server Components by default).
- **Runtime Convention Discovery:** Package manager (`pnpm`, `npm`, `yarn`, `bun`), language (`JavaScript` or `TypeScript`), and directory structure are discovered dynamically from lockfiles and project configs at run time, never hard-coded.
- **Dual Layout Generation Modes:**
  - `html` mode: Compiles static preview pages in `client-review/pages/` for Gate 5 review.
  - `nextjs` mode: Scaffolds the real Next.js application once in `site/` from `layout.md`, emitting `site/site.manifest.json` for token-efficient downstream stages.
- **Strict Line Limits & Markers:**
  - Thin page server component (`page.js`): **<= 80 lines**.
  - Section component (`_components/*.js`): **<= 250 lines** (hard limit 300).
  - Utility, config, and content files: **<= 500 lines**.
  - Every section component must open with `// section: <id>` and render `data-section="<id>"`.
- **Pre-Launch Guard:** `robots: { index: false, follow: false }` metadata, dynamic `robots.js`, and visual `<PreviewBanner />` active by default until production launch checklist sign-off.
- **Shared Component Promotion Rule (2+ Pages):** Any component reused across **2+ pages** lives in flat `site/components/`. Page-local components live in `_components/` within their route.
- **Scoped AGENTS.md Guidance:** Scaffold `site/AGENTS.md` (<=150 lines) and 4 scoped files: `site/app/AGENTS.md`, `site/components/AGENTS.md`, `site/lib/AGENTS.md`, and `site/content/AGENTS.md`, each with fixed H2 headings: `## Architecture`, `## Conventions`, `## Anti-patterns`, `## Commands`.

For complete coding rules, consult [references/code-conventions.md](references/code-conventions.md).

---

## Taste Standards & Visual Excellence

Aesthetic polish is mandatory for Stages 2 and 8:
- **Taste Skill Check:** Verify if `frontend-design` is available in your agent environment. If missing, attempt installation per [references/design-theory.md](references/design-theory.md):
  ```bash
  DISABLE_TELEMETRY=1 npx skills add anthropics/skills --skill frontend-design
  ```
  If unavailable, apply the documented built-in taste rules.
- **Client Visual Review & Variations at Gate 2:** Capture reference landing pages into `project-docs/design-references/<domain>/` as analysis inputs only using `scripts/reference-capture/index.js`. Extract abstract principles and build $N$ original full-page landing page variation previews in `project-docs/client-review/gate-2-design-theory/<variation-slug>/index.html` across the 9 dimensions per [references/design-variations.md](references/design-variations.md). Run the pre-presentation similarity audit (`_checks/similarity-audit.md`) confirming distance rules (>= 4 dimensions divergent from nearest references, <= 3 dimensions shared between variations, zero shared classes/IDs/assets, word overlap <= 5 words). Compile the Gate 2 comparison hub and root portal using `scripts/client-review/index.js` (optionally deployed live to GitHub Pages via `assets/client-review-pages.yml`). Never ask the client to read raw technical specs. Halt at Gate 2 with `router-state.md` set to `Gate 2: Awaiting Client Decision Among Variations` and await client selection before advancing. The agent never self-approves Gate 2.
- **Aesthetic Principles:**
  - Curated semantic tokens with refined contrast; avoid flat or generic palettes.
  - Generous whitespace and modular typography hierarchy using `next/font`.
  - Motion discipline: sections default to `static by design`; at most ONE section per page may be the "bold moment"; ban uniform fade-and-slide-up animations on every section.
  - Never animate layout properties (`width`, `height`, `margin`); use GPU-accelerated `transform` and `opacity`.

For complete design guidelines, consult [references/design-theory.md](references/design-theory.md) and [references/design-variations.md](references/design-variations.md).

Keep reusable Gate 2 tooling in this skill's `scripts/client-review/`, not in a project-level tools folder. The bundled `preview.mjs`, `verify.mjs`, and `fetch-fonts.mjs` accept a project root. Note: Playwright-powered companion tools (`reference-capture`, `verify.mjs`) require Chromium installed via `npx playwright install chromium`. Keep project-specific HTML, CSS, font choices, and assets in `project-docs/client-review/`; put generated Gate 2 QA reports, similarity audits, and working notes in `gate-2-design-theory/_checks/`. See the design reference guide for commands and compatibility details.

---

## CMS Architecture & Revalidation Standard

The NWW CMS operates in either `none` (static site) or `cms` (managed Blog) mode:
- **Base URL Env Var:** `SERVER_URL`.
- **Read Requests:** Paginated articles from `/api/blog/paginate` and single posts from `/api/blog/read-one-by-slug/:slug` with Bearer `CMS_SITE_KEY` passed via `Authorization: Bearer ${CMS_SITE_KEY}`. Unauthenticated reads are forbidden.
- **Blog Model Mapping:** Banner/hero is `cover_image`; card thumbnail and single post hero use `image`; OG image uses `image` falling back to `cover_image`. Timestamps are `postedAt` and `lastUpdatedAt`.
- **Form Endpoints:** Contact forms submit to `/api/website-contact-us/:id/submit` with `{ firstName, lastName, email, phone, message }`; lead capture submits to `/api/lead/submit`. Notifications are managed in CMS settings.
- **Simplified On-Demand ISR Revalidation:**
  - Single resource tag `cms:<resource>` (e.g. `cms:blog`) produced only by `tagFor()` in `site/lib/cms/revalidation.js`. No per-slug tags.
  - Route `POST /api/revalidate` requires Bearer `REVALIDATE_SECRET` (constant-time hash comparison), validates body `{ "resource": "blog" }` against `ALLOWED_RESOURCES`, and calls `revalidateTag(tagFor(resource))`.
  - Fallback revalidation interval is `REVALIDATE_SECONDS=60` while webhook status is `pending`, upgrading to `3600` once `verified`.

For complete CMS integration details, consult [references/cms-architecture.md](references/cms-architecture.md).

---

## Asset Optimization Workflow

Image assets cataloged in `page-specs/<slug>/assets.md` are processed during Stage 9 Foundation Build:
- **Optimizer Execution:** Use bundled script `scripts/assets-optimizer/index.js` (with fallback to global `assets-optimize` CLI if present):
  ```bash
  node scripts/assets-optimizer/index.js --input ../assets-source --output public/assets --image-format webp --quality 75 --max-size 61440 --strict-max-size 102400 --concurrency 4 --responsive --manifest-dir public/assets
  ```
- **File Conventions:** Source assets in `assets-source/` (git-ignored); output in `site/public/assets/`; manifest at `site/public/assets/manifest.json`. Settings persisted to `site/assets-optimize.config.md`.
- **Rendering:** Consumed via `site/components/ResponsiveImage.js` as a native Server Component rendering `<img>` or `<picture>` with srcset, sizes, and zero layout shift (CLS = 0).
- **Budgets:** LCP image <= 100 KB, other images <= 60 KB, SVG <= 5 KB, downloads <= 2 MB.

For complete media processing steps, consult [references/asset-optimization.md](references/asset-optimization.md).

---

## Stock Image Sourcing

When stock images are needed for a project, every slot must come from either a client-provided asset (always first priority) or a licensed stock image fetched from one of three approved providers — Pixabay, Pexels, or Unsplash — using the agency's API key. Images are downloaded to `assets-source/` and processed through the optimizer (Unsplash images are hotlinked instead). Full provenance is recorded in `project-docs/stock-provenance.json` and a `/credits` page is generated in Stage 9.

Read [references/stock-image-sourcing.md](references/stock-image-sourcing.md) when Stage 0 reveals stock images are needed or during Stage 6 when an `assets.md` slot lacks a client-provided asset. That file covers the intake branch, provider rules, hard exclusions, query construction, selection criteria, provenance manifest schema, attribution requirements, credential handling, and failure behavior.

---

## Detailed Reference Index

For deep-dive instructions, consult the matching reference document:

1. [Pipeline Stages & State Machine](references/pipeline-stages.md) — 12-stage sequential workflow, approval gates, and router state tracking.
2. [Client Discovery Questionnaire](references/client-questionnaire.md) — 7-batch structured intake questionnaire, branching rules, and site brief template.
3. [Design Theory & Visual System](references/design-theory.md) — Color palette, modular type scale, voice & tone, and dual motion tokens.
4. [Design Variations & Similarity Audit](references/design-variations.md) — 9-dimension variation framework, anti-copy distance rules, similarity audit protocol, and decision capture.
5. [Page List & Sitemap Architecture](references/page-list.md) — Master build tracker checklist, URL routes, and `page-design-notes.md`.
6. [SEO Strategy & Structured Data](references/seo-strategy.md) — Keywords, single H1, JSON-LD schemas, sitemaps, robots, and redirects.
7. [Layout Theory & Section Blueprints](references/layout-theory.md) — Internal section blueprints (`page-specs/<slug>/layout.md`), dual generation modes (`html` vs `nextjs`), site manifest (`site.manifest.json`), and Vercel deployment.
8. [Page Content & Asset Catalog](references/page-content.md) — Verbatim copywriting, 8-tag asset taxonomy (`assets.md`), and `data-placeholder="true"`.
9. [Asset Optimization & Media Pipeline](references/asset-optimization.md) — Optimizer execution, manifest schema, budgets, and `ResponsiveImage.js`.
10. [Page Checklists & Taste Verification](references/page-checklist.md) — Master static checklist template, theory revisions, and `checklist-state.md`.
11. [Code Conventions & Agent Rules](references/code-conventions.md) — App Router standards, file line limits, scoped AGENTS.md, and check scripts.
12. [Build-One-Page Loop](references/build-one-page.md) — Per-page build sub-pipeline, Gates 10a & 10b, GSAP integration, and self-critique.
13. [CMS Architecture & Integration](references/cms-architecture.md) — NWW CMS client, authenticated reads, revalidation route, and form endpoints.
14. [Stock Image Sourcing](references/stock-image-sourcing.md) — Two-source rule, approved providers (Pixabay, Pexels, Unsplash), intake branch, provenance manifest, attribution output, and failure handling.


