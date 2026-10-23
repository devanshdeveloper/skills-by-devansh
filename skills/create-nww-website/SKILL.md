---
name: create-nww-website
description: Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 9-stage human-gated workflow. Enforces markdown page specifications with CMS schemas, codebase scaffolding with live landing page showcase, and incremental sub-page builds. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project.
---

# Create NWW Website

This skill orchestrates the end-to-end creation of production-grade Next.js App Router websites with optional Next Web Website (NWW) CMS integration. It enforces a disciplined 9-stage human-gated workflow (Stages 0 through 8) ensuring structural rigor, taste-driven aesthetic polish, and technical quality.

---

## Quick Start

### 1. Install

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website
```

Or run without installing (one-shot):

```bash
npx skills use devanshdeveloper/skills-by-devansh@create-nww-website
```

### 2. Starter Prompt

Copy and paste into your AI assistant (Antigravity, Cursor, Claude Code, or Codex CLI) to fast-track Gate 0:

````markdown
Activate the create-nww-website skill. Here is our project brief to initialize Stage 0 Intake:

## 1. Project Identity & Purpose
- Business / Brand Name: [e.g. Minit Charger]
- Core Offering: [e.g. Turnkey Level 3 DC fast charging infrastructure for commercial transit and electric bus fleets.]
- Target Audience: [e.g. Municipal transit directors, commercial depot operators, fleet logistics managers]
- Primary Conversion Action: [e.g. Schedule Feasibility Study / Book a Consultation]
- Website Type: [e.g. Business/Corporate]
- CMS Mode: [Choose: "cms" (dynamic blog, lead capture, page configs) or "none" (100% static Next.js)]
- Build Origin: [Choose: "scratch" or "migration"]
- Target Launch Timeline: [e.g. 4 weeks]

## 2. Branding & Design Direction
- Brand Colors: [e.g. Primary: #0A192F, Accent: #00E5FF, Neutral: #F8FAFC]
- Typography: [e.g. Headings: Plus Jakarta Sans, Body: Inter]
- Design Personality: [e.g. Modern, technical authority, clean spatial grids, high trust]
- Motion Preference: [Choose: "subtle-gsap" or "static-only"]
- Design References:
  - https://stripe.com (spatial grid, typography hierarchy)
  - https://linear.app (sleek dark accents, micro-interactions)

## 3. Scope & Pages
- Core Pages: [e.g. Home, Solutions, About, Blog, Contact]
- Forms Needed: [e.g. Lead capture & consultation request]
- Imagery: [e.g. Licensed stock (Pixabay / Unsplash) + client diagrams]

Please parse this into `project-docs/client-answers.md` and present the Gate 0 Intake Recap for confirmation.
````

> **Tip:** If you prefer a guided interview, just type `nww` and the agent will walk you through each batch (5–7 questions per turn) interactively.

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
- Running the sequential website pipeline (Stages 0 through 8).
- Generating project documentation: Design Theory, Layout Theory, Page List, or SEO Strategy.
- Authoring verbatim page copy, asset catalogs, or binary QA checklists.
- Building, animating (via GSAP), or verifying pages against their checklists.

---

## The 9-Stage Human-Gated Pipeline

The workflow proceeds strictly one stage at a time. Every stage requires explicit human sign-off at its gate before the next stage begins. Progress is tracked in `project-docs/router-state.md`.

| Stage | Name | Key Deliverables | Gate Approval | Reference Guide |
|:---:|:---|:---|:---|:---|
| **0** | **Intake Check** | `project-docs/client-answers.md` | **Gate 0:** Intake recap & CMS mode confirmation | [client-questionnaire.md](references/client-questionnaire.md) |
| **1** | **Tech Stack** | `project-docs/tech-stack.md` | **Gate 1:** Tech stack sign-off (Internal Developer Gate) | [pipeline-stages.md](references/pipeline-stages.md) |
| **2** | **Design Theory & Variations** | `project-docs/design-theory.md`, `project-docs/design-references/`, `project-docs/client-review/index.html` | **Gate 2:** Client visual review & variation selection sign-off (via `client-review/index.html`) | [design-theory.md](references/design-theory.md), [design-variations.md](references/design-variations.md) |
| **3** | **Page List & Sitemap** | `project-docs/page-list.md`, `page-design-notes.md` | **Gate 3:** Sitemap & route structure sign-off (via review portal / chat recap) | [page-list.md](references/page-list.md) |
| **4** | **SEO Strategy** | `project-docs/seo-strategy.md` | **Gate 4:** Keywords, JSON-LD, sitemap, redirects sign-off | [seo-strategy.md](references/seo/seo-strategy.md) |
| **5** | **Page Specifications & CMS Schema** | `page-specs/<slug>/page.md`, `page-specs/_shared/*.md`, `project-docs/layout-system.md`, and if CMS active: `cms-schema.md`, `cms-backend-requirements.md`, `cms-seed/` | **Gate 5:** Page specifications & CMS schema sign-off | [page-specifications.md](references/page-specifications.md) |
| **6** | **Scaffolding, Foundation & Landing Page Showcase** | Pre-load 10 skills; generate `page-checklist.md` & `theory-revisions.md`; scaffold `site/` foundation shell, tokens, optimizer, check scripts; **construct full Landing Page (`site/app/page.js`) for client showcase** | **Gate 6:** Scaffolding, foundation & landing page showcase sign-off | [project-scaffolding.md](references/project-scaffolding.md) |
| **7** | **Sub-Page Build Loop** | `site/app/<route>/page.js`, `_components/`, `page-specs/<slug>/checklist-state.md` for remaining sub-pages | **Gate 7a:** Sub-page build review<br>**Gate 7b:** Sub-page binary QA sign-off | [build-one-page.md](references/build-one-page.md) |
| **8** | **Final Verification & Handover** | `project-docs/structure-audit.md`, production audit, client handover (deploy via `deploy-to-vercel`) | **Gate 8a:** Cross-page fixes approval<br>**Gate 8b:** Final handover sign-off | [pipeline-stages.md](references/pipeline-stages.md) |

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
- **Markdown Specifications, Scaffolding & Landing Page Pipeline:**
  - Stage 5 generates unified markdown `page-specs/<slug>/page.md` per slug combining layout blueprints, verbatim copywriting, asset references, and CMS schemas/seeds without HTML or mode toggles.
  - Stage 6 executes project scaffolding, generates the master QA checklist, builds the production foundation shell, emits `site/site.manifest.json`, and **fully constructs the Landing Page (`site/app/page.js`) for client showcase**.
  - Stage 7 incrementally constructs remaining sub-pages with per-page review and binary QA sign-off.
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

## Scaffolding Architecture & Specialized Skills

Before executing Stage 6 project scaffolding, the agent MUST load the 10 specialized architecture, composition, design system, and GSAP animation skills:

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

These skills govern code conventions during Next.js initialization, Server Component boundary enforcement, token design system injection, and GSAP motion orchestration.

For complete scaffolding instructions, consult [references/project-scaffolding.md](references/project-scaffolding.md).

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

## SEO Architecture & Specialized Skills

Technical SEO standards are enforced across Stage 4 (SEO Strategy) and Stage 8 (Pre-Launch SEO Audit):
- **Specialized SEO Skills:** Before starting Stage 4, load the specialized SEO agent skills:
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill ai-seo
  DISABLE_TELEMETRY=1 npx skills add https://github.com/anthropics/knowledge-work-plugins --skill seo-audit
  ```
- **SEO Tool Library & Truth in Auditing:** Before auditing, run the Tool Availability Check per [references/seo/seo-tool-library.md](references/seo/seo-tool-library.md) against [references/seo/seo-tool-registry.json](references/seo/seo-tool-registry.json). Distinguish connected APIs, user export files, and manual checks without pretending to execute disconnected tools.
- **Companion CLI Utilities:**
  - PageSpeed Insights & CWV audit: `node skills/create-nww-website/scripts/seo/pagespeed-check.js --url <url>`
  - Robots & Sitemap syntax audit: `node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --url <url>`

For complete SEO specifications, consult [references/seo/seo-strategy.md](references/seo/seo-strategy.md) and [references/seo/seo-tool-library.md](references/seo/seo-tool-library.md).

---

## CMS Architecture & Revalidation Standard

The NWW CMS operates in either `none` (static site) or `cms` (managed Blog) mode:
- **Base URL Env Var:** `SERVER_URL`.
- **Read & Write Requests:**
  - Read: `/api/blog/paginate` and `/api/blog/read-one-by-slug/:slug` with Bearer `CMS_SITE_KEY` passed via `Authorization: Bearer ${CMS_SITE_KEY}`.
  - Write & Seed: `POST /api/blog/create-one` and `POST /api/blog/generate-slug` with `Authorization: Bearer ${CMS_SITE_KEY}` (Website tenant token). Companion runner: `node skills/create-nww-website/scripts/cms-seed/index.js --auto-slug`.
- **Blog Model Mapping:** Banner/hero is `cover_image`; card thumbnail and single post hero use `image`; OG image uses `image` falling back to `cover_image`. Category and tags are nested inside `metadata.category` and `metadata.tags`. Timestamps are `postedAt` and `lastUpdatedAt` with `editTimeFields: true`.
- **Form Endpoints:** Contact forms submit to `/api/website-contact-us/:id/submit` with `{ firstName, lastName, email, phone, message }`; lead capture submits to `/api/lead/submit`. Notifications are managed in CMS settings.
- **Simplified On-Demand ISR Revalidation:**
  - Single resource tag `cms:<resource>` (e.g. `cms:blog`) produced only by `tagFor()` in `site/lib/cms/revalidation.js`. No per-slug tags.
  - Route `POST /api/revalidate` requires Bearer `REVALIDATE_SECRET` (constant-time hash comparison), validates body `{ "resource": "blog" }` against `ALLOWED_RESOURCES`, and calls `revalidateTag(tagFor(resource))`.
  - Fallback revalidation interval is `REVALIDATE_SECONDS=60` while webhook status is `pending`, upgrading to `3600` once `verified`.

For complete CMS integration details, consult [references/cms-architecture.md](references/cms-architecture.md).

---

## Asset Optimization Workflow

Image assets cataloged in `page-specs/<slug>/page.md` are processed during Stage 6 Foundation Build:
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

When stock images are needed for a project, every slot must come from either a client-provided asset (always first priority) or a licensed stock image fetched from one of three approved providers — Pixabay, Pexels, or Unsplash — using the agency's API key. Images are downloaded to `assets-source/` and processed through the optimizer (Unsplash images are hotlinked instead). Full provenance is recorded in `project-docs/stock-provenance.json` and a `/credits` page is generated in Stage 6.

Read [references/stock-image-sourcing.md](references/stock-image-sourcing.md) when Stage 0 reveals stock images are needed or during Stage 5 when a `page.md` asset slot lacks a client-provided asset. That file covers the intake branch, provider rules, hard exclusions, query construction, selection criteria, provenance manifest schema, attribution requirements, credential handling, and failure behavior.

---

## Detailed Reference Index

For deep-dive instructions, consult the matching reference document:

1. [Pipeline Stages & State Machine](references/pipeline-stages.md) — 9-stage sequential workflow (Stages 0 through 8), approval gates, and router state tracking.
2. [Client Discovery Questionnaire](references/client-questionnaire.md) — 7-batch structured intake questionnaire, branching rules, and site brief template.
3. [Design Theory & Visual System](references/design-theory.md) — Color palette, modular type scale, voice & tone, and dual motion tokens.
4. [Design Variations & Similarity Audit](references/design-variations.md) — 9-dimension variation framework, anti-copy distance rules, similarity audit protocol, and decision capture.
5. [Page List & Sitemap Architecture](references/page-list.md) — Master build tracker checklist, URL routes, and `page-design-notes.md`.
6. [SEO Strategy & Structured Data](references/seo/seo-strategy.md) — Pre-stage skills, SEO tool availability checks, keywords, single H1, JSON-LD schemas, sitemaps, robots, and redirects.
7. [Page Specifications & CMS Schema](references/page-specifications.md) — Unified markdown specifications (`page-specs/<slug>/page.md`), section blueprints, verbatim copywriting, cross-page layout system, and CMS data schemas/seeds.
8. [Codebase Scaffolding, Foundation & Landing Page Showcase](references/project-scaffolding.md) — Next.js initialization in `site/`, QA checklist emission, foundation shell, optimizer run, scoped AGENTS.md, check scripts, route mapping (`site.manifest.json`), and **full Landing Page showcase construction**.
9. [Asset Optimization & Media Pipeline](references/asset-optimization.md) — Optimizer execution, manifest schema, budgets, and `ResponsiveImage.js`.
10. [Page Checklists & Taste Verification](references/page-checklist.md) — Master static checklist template, theory revisions, and `checklist-state.md`.
11. [Code Conventions & Agent Rules](references/code-conventions.md) — App Router standards, file line limits, scoped AGENTS.md, and check scripts.
12. [Sub-Page Build Loop](references/build-one-page.md) — Incremental sub-page build pipeline (Stage 7), Gates 7a & 7b, GSAP integration, and self-critique.
13. [CMS Architecture & Integration](references/cms-architecture.md) — NWW CMS client, authenticated reads, revalidation route, and form endpoints.
14. [Stock Image Sourcing](references/stock-image-sourcing.md) — Two-source rule, approved providers (Pixabay, Pexels, Unsplash), intake branch, provenance manifest, attribution output, and failure handling.
15. [SEO Tool Library & Audit Selection Guide](references/seo/seo-tool-library.md) — Tool availability check protocol, 19-tool structured registry, stage-by-stage selection logic, and Next.js audit recommendations.
16. [CMS Models & Modules Catalog](references/cms/models/index.md) — Complete 25-module registry, Mongoose schemas, endpoint matrices, and seeder JSON structures.
17. [On-Demand ISR Revalidation & `notifySite`](references/cms/revalidation-webhook.md) — Backend webhook implementation guide, `Website` schema additions, and dashboard form integration.


