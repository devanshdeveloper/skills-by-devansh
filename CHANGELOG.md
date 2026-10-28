# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.10.3] - 2026-10-28

### Added
- **Root `.gitignore` Instructions for Legacy Site Mirror (`previous-site/`)**:
  - Added explicit instructions, code blocks, and completion checklist items across `skills/create-nww-website/SKILL.md`, `references/gate-0-intake/runbook.md`, `references/gate-0-intake/client-questionnaire.md`, `references/gate-0-intake/pipeline-stages.md`, `references/gate-0-intake/batch-06-legacy-site-migration/questionnaire.md`, and `references/gate-6-scaffolding/runbook.md` requiring `previous-site/` to be added to the project's root `.gitignore`.
  - Added `previous-site/` to authoring repository `.gitignore` to prevent local testing scrapes from being tracked.
  - Updated Canonical Project Architecture in `docs/ARCHITECTURE.md` to reflect `.gitignore` rules and gitignored `previous-site/` status.
  - Added `--add-to-gitignore` option and automated git hygiene inspection in `skills/create-nww-website/scripts/site-fetch/index.js` alerting users if the scraped folder is not ignored.

## [1.10.2] - 2026-10-28

### Added
- **User-Configurable Site Crawling Limits (`scripts/site-fetch/index.js`)**: Engineered `selectPagesToCapture()` implementing 5 distinct user-selectable crawling strategies for Stage 0 migration:
  - `no-limits`: Crawls and archives every discovered internal page on the site.
  - `max-any`: Crawls up to 15 pages in order of discovery (FIFO / straightforward).
  - `max-sampled` *(Default)*: Intelligent clustered sampling (homepage, core static pages, 1–2 items per collection, then fill).
  - `homepage`: Archives solely the root homepage (`/`).
  - `selected`: Crawls only the specific routes or URLs provided by the user (via `--pages`).
- **Offline HTML Display Hardening for Chrome**: Fixed blank screen and preloader blocking when opening `previous-site/index.html` directly in Chrome on `file://`:
  - Injected an offline display reset into `<head>` enforcing `html, body { visibility: visible !important; opacity: 1 !important; }` and permanently suppressing preloader overlays (`#preloader`, `.loading-screen`).
  - Injected window error and unhandled rejection guards to prevent SPA client-side hydration crashes on `file://` origin `null`.
  - Stripped restrictive Content-Security-Policy meta tags.
  - Relativized internal route links to `<path>/index.html` for direct local navigation.
  - Neutralized `type="module"` on local scripts to prevent Chrome's `file://` CORS security policy from failing.
- **Built-in Zero-Dependency Preview Server (`--serve`)**: Added zero-dependency static HTTP preview server (`--serve <dir> [--port <n>]`) using Node.js built-in `http` module, with automatic browser launching.
- **Intake Question Q25 [Legacy Site Crawling Scope]**: Added explicit crawl scope selection to `references/gate-0-intake/batch-06-legacy-site-migration/questionnaire.md`, `runbook.md`, `client-questionnaire.md`, and `pipeline-stages.md`.

## [1.10.1] - 2026-10-27

### Fixed
- **Gate Reference Runbooks Renaming (`references/gate-*/runbook.md`)**: Renamed all 9 internal gate reference guides under `skills/create-nww-website/references/gate-*/` from `SKILL.md` to `runbook.md`. Fixes `npx skills` CLI discovering internal stage documentation as malformed skills and emitting frontmatter warnings during user installation or updates.
- **Canonical Tree & Documentation Synchronization**: Aligned table and tree references in `skills/create-nww-website/SKILL.md` and `docs/ARCHITECTURE.md` to point to `runbook.md`.

## [1.10.0] - 2026-10-27

### Added
- **Complete Offline Mirror & Source Asset Preservation (`scripts/site-fetch/index.js`)**: Upgraded the universal website fetcher for Stage 0 legacy migrations to create a fully functioning offline website mirror in `previous-site/`:
  - Homepage written directly to `previous-site/index.html` with all asset references and internal links relativized, enabling direct local offline browsing (`file://` or static web server) out of the box.
  - Subpages mapped to natural route directories (`previous-site/<path>/index.html`) alongside `content.md` and `screenshot.png`.
  - All visual and downloadable assets (images, stylesheets, scripts, web fonts, vector SVGs, and downloadable PDFs) harvested and placed directly in their original source paths without flattening into a separate `media/` directory.
  - Pure-JavaScript image header parser extracting dimensions for PNG, JPEG, GIF, WebP, and SVG buffers to classify image quality (`high-res` vs `needs-replacement` for the 1200px retina threshold) for Gate 0 Batch 4 asset manifests.
  - Standard `sitemap.xml` generated at `previous-site/sitemap.xml` indexing discovered legacy URLs.
  - Complete catalog of legacy routes and harvested assets recorded into `previous-site/manifest.json`.

### Changed
- **Gate 0 Intake & Architecture Alignments**: Updated `SKILL.md`, `references/gate-0-intake/` runbooks, questionnaire guides (Batch 04 and Batch 06), and `docs/ARCHITECTURE.md` to reflect the full working offline mirror in `previous-site/` with source-located assets and standard `sitemap.xml`.

## [1.9.9] - 2026-10-25

### Added
- **Batch Intake Questionnaire Email Mode (`--type=questions` / `--questions --batch=N`)**: Extended `scripts/client-notify/index.js` with `getBatchQuestionnaireTemplate()` so milestone emails for discovery batches (Batches 01 to 07, or Batch 08) dispatch the actual discovery questions directly to clients requesting their answers, rather than sending approval/answers confirmation summaries.

## [1.9.8] - 2026-10-25

### Changed
- **Default Automatic Browser Launch in Mailto Mode (Method 2)**: Updated `scripts/client-notify/index.js` to automatically launch the email dispatcher portal in the user's default browser whenever mailto mode is active (Method 2), eliminating manual link clicking in sandboxed IDE chat windows. Added `--no-open` to opt out.

## [1.9.7] - 2026-10-25

### Added
- **HTML Email Dispatcher Portal & Browser Launcher (`--open`)**: Engineered `writeMailtoPortal()` in `scripts/client-notify/index.js` to generate a dedicated local HTML dispatcher (`client-context/send-email.html`). Solves chat webview CSP blocking of `mailto:` protocol handlers and URL length truncation by providing a clickable `file:///` link that opens directly in Chrome/Edge with a 1-click desktop mail app button and one-click clipboard copy for webmail (Gmail/Outlook Web). Added `--open` flag to automatically launch the portal.

## [1.9.6] - 2026-10-25

### Added
- **Single Batch Questionnaire for 20 Rolling Open Questions (`batch-08-open-questions`)**: Created `skills/create-nww-website/references/gate-0-intake/batch-08-open-questions/questionnaire.md` grouping the 20 rolling open questions into a single consolidated batch.
- **Strict Already-Answered Filtering**: Codified strict rule ensuring any question whose topic, detail, or asset is already documented in Batches 01 to 07 (`client-context/answers/batch-*/answers.md`) or `client-context/asset-manifest.md` is strictly filtered out so the batch contains only genuine, unanswered gap questions.
- **On-Demand Open Questions Mailer (`--questions`)**: Added `--questions` CLI flag and `batch-08-open-questions` support to `scripts/client-notify/index.js`, allowing maintainers and users to draft or dispatch milestone review emails containing the active 20 open questions at any time.

## [1.9.5] - 2026-10-25

### Added
- **Gate 0 Takeoff Rolling Open Questions Protocol (`client-context/open-questions.md`)**: Engineered an asynchronous continuous discovery loop activated upon Gate 0 takeoff. Maintains a rolling queue of at least 20 targeted, granular open questions for the client:
  - As answers are received, the answered question is removed, logged to its appropriate batch answer file (`client-context/answers/batch-*/answers.md`), and replenished with a new targeted open question (sustaining >= 20 questions).
  - **Downstream Action Engine**: Answers are immediately acted upon in the live Next.js codebase (updating React components, page copy, layout system, theme tokens, metadata, or CMS seed data) even if the site is already scaffolded and built, ensuring continuous client refinement without halting pipeline momentum.
- **Companion Script Audit Updates**: Updated `scripts/client-intake/index.js` and `scripts/structure-audit/index.js` to inspect and audit `client-context/open-questions.md` for queue health (>= 20 questions).

## [1.9.4] - 2026-10-25

### Added
- **Modular Batch Discovery & Intake System (`gate-0-intake/batch-*`)**: Modularized Gate 0 intake questionnaire into 7 self-contained batches with explicit confirmation gates:
  - `batch-01-core-identity`: Core identity, technical project slug, business model, and goals.
  - `batch-02-branding-motion`: Visual personality tokens, typography pairings, and GSAP motion tiers.
  - `batch-03-sitemap-copy`: Route structure, page inventory, conversion paths, and copy sourcing.
  - `batch-04-asset-harvesting-generation`: Comprehensive visual asset inventory, legacy asset harvesting, custom generation specs, and stock sourcing permissions, outputting to `client-context/asset-manifest.md`.
  - `batch-05-type-specific-routing`: Deep-dive questions dynamically tailored to website archetype (e-commerce, SaaS, portfolio, booking, corporate, blog).
  - `batch-06-legacy-site-migration`: Legacy website content carry-forward inventory and 301 redirect map.
  - `batch-07-seo-analytics-governance`: Primary keywords, geographic intent, tracking platforms, and compliance governance.
- **Batch-by-Batch Milestone Client Email Notifications**: Added `--batch=<1-7>` flag support to `scripts/client-notify/index.js`, enabling progressive batch-level client confirmation emails and mailto previews after each discovery questionnaire batch is completed.
- **Enforced Technical Project Slug Governance**: Added explicit client question for technical project slug in Batch 01, propagating it strictly across Gate 2 variation folder names (`<project-slug>-v[1..N]`), `site/package.json`, and Vercel project deployment linking.

### Removed
- **Complete Deletion of `client-answers.md`**: Purged all occurrences of `client-answers.md` across runbooks, reference documents, schemas, and companion scripts in favor of modular batch answer storage (`client-context/answers/batch-[number]-[batch-name]/answers.md`) and dedicated visual asset manifest (`client-context/asset-manifest.md`).

## [1.9.3] - 2026-10-25

### Fixed
- **Multi-Page Page-Type Discovery in Reference Crawler (`scripts/site-fetch/index.js`)**: Fixed `crawlReferences` in the universal site fetcher to probe XML sitemaps and discover homepage navigation links for benchmark design references rather than capturing only the `home` landing page. Now clusters distinct page types up to `--max-pages` and captures `<domain>/<slug>/` (`index.html`, `content.md`, `screenshot.png`, `capture.json`), updating the `sources.md` audit ledger with all sampled page types.
- **Canonical Tree & Documentation Synchronization**: Aligned `design-references/` tree and descriptions in `SKILL.md`, `references/gate-0-intake/pipeline-stages.md`, `references/gate-2-design-theory/SKILL.md`, and `docs/ARCHITECTURE.md` to reflect multi-page page-type benchmarks.

## [1.9.2] - 2026-10-25

### Added
- **Repeating Cards Normal CSS Rule (Gate 2 Variations)**: Codified rule across `SKILL.md`, `references/gate-2-design-theory/SKILL.md`, and `references/gate-2-design-theory/design-variations.md` requiring normal CSS in a `<style>` block when cards, list items, or grid tiles repeat in Gate 2 HTML + Tailwind CSS + jQuery variations to dramatically reduce token consumption and eliminate repetitive inline utility strings.
- **Repeating Cards `@apply` Rule (`site/` Next.js App Router)**: Codified downstream rule across `SKILL.md`, `references/gate-6-scaffolding/SKILL.md`, `references/gate-6-scaffolding/code-conventions.md`, and `references/gate-7-sub-pages/SKILL.md` enforcing the use of Tailwind's `@apply` directive in `site/app/globals.css` (within `@layer components`) when repeating card structures are implemented in React, keeping section components concise and strictly within the <= 250 line limit.
- **Telemetry-Free Installation Commands for All Skills**: Updated all quick start install and one-shot execution commands across `README.md`, `skills/create-nww-website/SKILL.md`, `skills/create-nextjs-website/SKILL.md`, and `skills/nww/SKILL.md` with explicit `DISABLE_TELEMETRY=1` prefixes and Windows PowerShell `$env:DISABLE_TELEMETRY="1"` guidance.

## [1.9.1] - 2026-10-25

### Added
- **References Folderization into 9 Gate Subdirectories (`references/gate-*`)**: Reorganized `create-nww-website/references/` into dedicated gate folders (`gate-0-intake/` through `gate-8-final-verification/`), leaving zero loose files in the root of `references/`. Authored an individual `SKILL.md` runbook for every gate and organized all stage guides, CMS schemas, SEO tools, and animation references cleanly under their respective gates.
- **Universal Website Fetcher Companion Script (`scripts/site-fetch/index.js`)**: Engineered a unified Node.js crawler for both Stage 0 previous site migrations and Stage 2 design references. Probes sitemaps (`/sitemap.xml`, `/sitemap_index.xml`) and internal DOM links, clusters routes to capture at least each unique page type, and generates `<slug>/index.html` (rendered DOM), `<slug>/content.md` (verbatim stripped markdown), and `<slug>/screenshot.png` (full-page screenshot), along with `sitemap-legacy.xml` and manifest indexes.
- **6-Tier GSAP Animation Architecture (`references/gate-6-scaffolding/gsap-animation-tiers.md`)**: Engineered an exhaustive 6-tier motion system (`disabled`, `low`, `medium`, `high`, `max`, `ultra`). Includes conditional skill loading (if `disabled`, zero GSAP skills are pre-loaded and `gsap` is omitted from `site/package.json`), Next.js App Router `'use client'` isolation guidelines, and production-ready code examples for Awwwards-caliber pinned horizontal scroll, SplitText masked reveals, magnetic buttons, Lenis smooth scroll ticker sync, 3D card tilt via `quickTo`, narrative perspective stacks, and decoupled WebGL / Three.js canvas architecture.
- **Intake Questionnaire Motion Tier Expansion**: Updated Q14 in `references/gate-0-intake/client-questionnaire.md` with explicit choices for `disabled`, `low`, `medium` (default), `high`, `max`, and `ultra`, synchronized with the Site Brief template and Coverage Matrix.

### Changed
- **Pre-Gate 1 Previous Site Archiving**: Explicitly codified that crawling and archiving legacy websites into `previous-site/` (`<slug>/index.html`, `content.md`, `screenshot.png`, `sitemap-legacy.xml`) must occur during Stage 0 strictly BEFORE Gate 1 sign-off, ensuring routes, 301 redirects, media assets, and copywriting are preserved before technical architecture begins.
- **Canonical Structure & Stage Inputs Alignment**: Updated canonical project trees and Stage 1/3 inputs across `SKILL.md`, `references/pipeline-stages.md`, and `docs/ARCHITECTURE.md` to reference `previous-site/<slug>/` snapshots and legacy sitemaps.
- **Scaffolding Skills Pruning & Motion Guard**: Removed obsolete skill loads in `references/code-conventions.md` and added conditional GSAP skill pre-loading guards across `SKILL.md`, `references/pipeline-stages.md`, and `references/project-scaffolding.md`.

## [1.9.0] - 2026-10-25

### Added
- **Canonical Project File Structure Specification**: Codified the strict client workspace layout with `client-context/`, `gate-1-tech-stack/` through `gate-8-final-verification/`, root and site `.env.example`, `previous-site/` migration directory, and optional `client-requirements/` across `SKILL.md`, `references/pipeline-stages.md`, and `docs/ARCHITECTURE.md`.
- **HTML + Tailwind + jQuery Gate 2 Variations**: Enforced interactive static prototype stack for Gate 2 variations with mandatory public preview deployment (GitHub Pages) and strict prohibition of localhost URLs.
- **Stage 0 Client Approval Email Prompt**: Added upfront capture of client approval email addresses to automate milestone notifications.
- **CMS Blocking Gate on Stage 6**: Embedded blocking precondition checking `gate-5-cms-requirements/list.md` before scaffolding CMS code.
- **SEO Tool Connection Protocol**: Added mandatory check in Stage 4 to ask clients for Google Search Console and analytics tool access upfront.

### Changed
- **In-Place Revisions Discipline**: Formally banned creation of extra markdown files (e.g. `theory-revisions.md`); revisions are applied directly in-place, and requirement notes are placed in `client-requirements/`.
- **Deleted Extraneous Markdown Documents**: Permanently banned `page-design-notes.md`, `migration-inventory.md`, `editor-handover-outline.md`, `context-update.md`, and `cms-foundation-tasks.md`.
- **Single-Mode Markdown Page Specifications**: Removed HTML and Next.js blueprint toggles in Stage 5 in favor of a single unified Markdown specification per page; `layout-system.md` is streamlined to contain only `## Shared Components`.
- **Scaffolding Skill Load Pruning**: Removed 7 unneeded skill installations, keeping the approved GSAP animation suite.
- **CMS Backend Contract Alignments**: Reconciled blog pagination (`?status=published` mandatory, defensive future `postedAt` filter, `data.items` response unwrap), slug lookup, and contact form submission (`POST /api/form/:id/submit` with dynamic `FormResponse` and relational `WebsiteContactUs` modes).
- **Companion CLI Script Updates**: Updated `client-notify`, `client-review`, `structure-audit`, `client-intake`, and `reference-capture` to support `client-context/` and new gate folders.

## [1.8.1] - 2026-10-23

### Added
- **`## Quick Start` Sections in All SKILL.md Files**: Each public skill (`create-nww-website`, `create-nextjs-website`, `nww`) now contains a self-contained `## Quick Start` section with install command, one-shot run command, and a copy-paste starter prompt for immediate use in Antigravity, Cursor, Claude Code, or Codex CLI.
- **Per-Skill Install + Starter Prompt Sections in Root README**: Replaced the generic `## Installation` block with dedicated `## Skill: <name>` subsections, each containing install command, one-shot run command, and a ready-to-use starter prompt template.



### Added
- **CMS Seeding Engine (`scripts/cms-seed/index.js`)**: Production-grade companion CLI and exportable client helper for automated NWW CMS blog seeding. Supports verified backend contracts (`POST /api/blog/create-one`, `POST /api/blog/generate-slug`), automatic Mongoose strict mode `metadata` mapping, and `--auto-slug` conflict resolution.
- **Dedicated CMS Architecture & Models Registry (`references/cms/models/`)**: Comprehensive model specifications covering all 25 modules in `WebsiteModules` (`blog`, `article`, `service`, `product`, `testimonial`, `faq`, `contact-us`, `lead`, `case-study`, `portfolio`, etc.) with endpoint matrices and Mongoose schemas.
- **On-Demand ISR Revalidation Specification (`references/cms/revalidation-webhook.md`)**: Full turnkey guide for the CMS dashboard team covering `website.model.js` additions (`revalidation_webhook`, `revalidation_secret`), `WebsiteForm.jsx` inputs, and the `notifySite({ websiteId, resource, operation })` async dispatcher.
- **Pure Page-Level Configuration Model (`references/cms/models/page-config.md`)**: Engineered the `WebsitePageConfig` contract where Next.js owns all layout, HTML structure, components, and animations, while the CMS supplies routing, SEO metadata, OpenGraph cards, conversion CTA controls (`showCTA`, `ctaHeadline`, `ctaSubtext`, button links), and page FAQs.
- **Specialized SEO Tool Library & Scripts (`references/seo/`, `scripts/seo/`)**: 19-tool structured registry, tool availability check protocol, PageSpeed Insights auditor, and sitemap/robots parser.

### Changed
- **Pipeline Consolidation to 9 Stages (Stages 0 through 8)**: Streamlined the end-to-end website generation pipeline from 12 stages to 9 strictly human-gated stages:
  - **Stage 5 (Page Specifications & CMS Schema)**: Single-mode markdown architecture (`page-specs/<slug>/page.md`). Absorbed former Stage 7 CMS Schema deliverables (`project-docs/cms-schema.md`, backend API requirements, content models, and seed files).
  - **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)**: Absorbed former Stage 8 Checklist emission (`project-docs/page-checklist.md`, `project-docs/theory-revisions.md`) and former Stage 9 Foundation Build (Next.js App Router scaffolding, global navigation, footer, theme tokens, asset optimizer run, `ResponsiveImage.js`, check scripts, CMS client layer, and stock `/credits`). Additionally constructs and styles the full interactive **Landing Page** (`site/app/page.js` + `_components/`) for client showcase review at Gate 6.
  - **Stage 7 (Sub-Page Build Loop)**: Renumbered former Stage 10. Incrementally constructs remaining sub-pages (`about`, `services`, `contact`, `blog`, etc.) one-by-one with per-page review (Gate 7a) and binary QA sign-off (Gate 7b).
  - **Stage 8 (Final Verification & Handover)**: Renumbered former Stage 11. Cross-page accessibility, performance scores, responsive checks, stock provenance audits, and deployment handover.
- **Specialized Architecture & GSAP Skills Pre-Load**: Embedded mandatory loading protocol for 10 specialized agent skills prior to Next.js scaffolding in Stage 6, covering Vercel Labs React/Next.js standards, composition patterns, web design guidelines, token design systems, and the full GSAP animation suite.
- **Companion Script Alignment**:
  - `scripts/client-notify/index.js`: Consolidated milestone email templates to stages 0 through 8 and removed retired stages 9, 10, 11.
  - `scripts/structure-audit/index.js`: Updated deliverables audit matrix (CMS Schema in Stage 5, Checklist in Stage 6, final audit in Stage 8) and aligned report headers.
- **Scaffolding Verification (`scripts/client-review/verify-nextjs.mjs`)**: Updated companion script to audit `page-specs/<slug>/page.md` against `site.manifest.json` and component markers as the primary Gate 6 validator.
- **Removed Obsolete Layout Previews**: Deleted obsolete HTML templates `assets/layout-page-template.html`, `assets/layout-index-template.html`, and `scripts/client-review/verify-layout.mjs`.

## [1.7.0] - 2026-10-21

### Added
- **Fast Mode Release Orchestrator (`scripts/publish/release.mjs`)**: Engineered concurrent evaluation of all 10 preflight gates and secret scanning via `Promise.all` in a single Node process, reducing preflight verification time to ~0.5s and overall release time to ~1 minute.
- **Automatic Tag Inference (`scripts/publish/preflight.mjs`)**: Integrated automated semver tag detection from `CHANGELOG.md` when `--tag` is omitted, eliminating version-guessing overhead.
- **Consolidated Summary Contract**: Standardized tabular single-output machine-readable reports displaying pass/fail status and actionable diagnostic messages.
- **Thorough Mode Opt-In (`--thorough`)**: Preserved sequential verbose gate execution for deep manual debugging.
- **Publish Skill Runbook Streamlining (`skills/publish/SKILL.md`)**: Rewrote the maintainer publish runbook to enforce summary-only consumption and strictly prohibit unnecessary script source reads.

## [1.6.0] - 2026-10-21


### Added
- **Next.js Layout Generation Mode (`references/layout-theory.md`)**: Engineered a production Next.js generation mode (`nextjs`) running in Stage 5 after Gate 2 variation approval, scaffolding the real site once in `site/` at project root with modular routes, section components (`data-section="<id>"` markers), decoupled content modules (`site/content/<slug>.js`), and design tokens.
- **Site Manifest Architecture (`site/site.manifest.json`)**: Integrated a compact machine-readable site manifest mapping routes, section IDs, component paths, and content keys. Downstream stages (Stages 6–11) read this manifest directly, preventing redundant codebase scans and saving up to 80% input tokens.
- **Runtime Convention Discovery (`references/code-conventions.md`)**: Replaced hardcoded stack conventions with runtime discovery detecting package manager (from lockfiles), language (from `tsconfig.json`), directory style, and import aliases, falling back to questionnaire answers (Q43e) and project defaults.
- **Pre-Launch Guard & Launch Checklist (`references/code-conventions.md`)**: Implemented a unified pre-launch guard setting (`NEXT_PUBLIC_PREVIEW_GUARD="true"`) synchronizing `<meta name="robots" content="noindex, nofollow" />`, `/robots.txt` crawler blocking, and a visual preview banner, tracked in `project-docs/launch-checklist.md`.
- **Intake Questionnaire Scoping (Q43c–Q43e)**: Added Q43c (Start Real Site in Next.js), Q43d (Codebase Folder `site/`), and Q43e (Defaults if Unset) to Batch 7 with end-to-end Coverage Matrix traceability.
- **Vercel Deployment Integration**: Documented deployment handover using the official `deploy-to-vercel` agent skill (`npx skills add https://github.com/vercel-labs/agent-skills --skill deploy-to-vercel`) after the site is built and approved.

### Changed
- **Dual-Mode Layout Architecture**: Formalized the Mode Comparison Table defining `html` and `nextjs` modes with clear preconditions, consistency checks, and verification suites.
- **Downstream Stage Optimization (`references/pipeline-stages.md`)**: Updated Stages 5, 6, 9, 10, and 11 to consume `site/site.manifest.json` and work incrementally without whole-codebase regeneration passes.
- **Strict `layout.md` Internal Designation**: Audited and updated all skill documents to re-affirm that `layout.md` is strictly an internal developer/agent specification, with client reviews occurring exclusively via browser previews.

## [1.5.0] - 2026-10-21

### Added
- **Client-Facing Layout Previews (`references/layout-theory.md`)**: Updated Stage 5 to produce dedicated, client-facing HTML layout preview pages for every page slug in `project-docs/client-review/pages/<slug>/index.html` plus a top-level layout review hub at `project-docs/client-review/pages/index.html`.
- **Layout Templates (`assets/layout-index-template.html`, `assets/layout-page-template.html`)**: Added self-contained, responsive (desktop 100% / phone 390px viewports), WCAG AA compliant, print-friendly layout preview templates featuring plain-language section blocks, labeled media slots, interactive CTA/form representations, and copy-ready decision snippets.
- **Layout Consistency & Freshness Auditor (`scripts/client-review/verify-layout.mjs`)**: Engineered zero-dependency companion script to verify 1:1 section order parity, identical CTA names, zero extra sections, offline isolation, placeholder hygiene, and blueprint freshness (`mtime(layout.md) <= mtime(layout.html)`) before Gate 5 presentation.
- **Intake Questionnaire Review Format (`references/client-questionnaire.md`)**: Added Q43b in Batch 7 for Client Review Format Preference (`local-folder` [default] vs `github-pages`), updated the Site Brief deliverable template, and synchronized the Question-to-Consumer Coverage Matrix.

### Changed
- **Pipeline Gate Modernization (Markdown is Internal)**: Audited all 12 stages in `SKILL.md` and `references/pipeline-stages.md` to eliminate instructions asking non-technical clients to open or approve raw markdown files. Client review gates (Gates 0, 2, 3, 5, 6, 10a, 11b) strictly present visual HTML portals or plain summaries, keeping `.md` files strictly internal developer artifacts.
- **Client Review Portal & Notifications Integration**: Updated `scripts/client-review/index.js` to automatically discover Gate 5 layout pages and link them in the root review hub. Updated `scripts/client-notify/index.js` and `scripts/structure-audit/index.js` to reference the visual layout deliverables.

## [1.4.0] - 2026-10-21

### Added
- **Gate 2 Design Variations Framework (`references/design-variations.md`)**: Engineered a 9-dimension architectural variation framework ensuring Gate 2 client design reviews explore distinct spatial layouts, typography pairings, and aesthetic personalities while anchoring to the client's authentic copy and technical constants.
- **Principles-Not-Pixels Anti-Copy Guardrail**: Established a strict abstraction barrier in `references/design-theory.md` and `references/design-variations.md` prohibiting direct reuse of captured DOM markup, CSS classes, element IDs, inline styles, text, or visual assets from reference websites.
- **Quantitative Distance Rules**: Enforced binding distance thresholds requiring each variation to differ on at least 4 of 9 dimensions from nearest references, at most 3 shared dimensions between variations, zero shared class/ID/asset tokens, and maximum 5 consecutive words overlap.
- **Pre-Presentation Similarity Audit**: Integrated a pre-presentation automated similarity audit protocol compiling an internal diagnostic report in `project-docs/client-review/gate-2-design-theory/_checks/similarity-audit.md` before client presentation.
- **Intake Questionnaire Extensions & Coverage Matrix (`references/client-questionnaire.md`)**: Expanded Batch 2 with variation count (Q12c), liked principles (Q12a), reference anti-patterns to avoid (Q12b), and reference adherence mode (Q12d), backed by a complete Question-to-Consumer Traceability Coverage Matrix.

### Changed
- **Client Review & Hub Alignment**: Updated `assets/client-review-template.html`, `scripts/client-review/index.js`, and `scripts/client-notify/index.js` to showcase landing page variations, personality summaries, and copy-ready decision snippets.
- **Eliminated "Reference Fidelity" Mandate**: Removed reference fidelity language from `references/design-theory.md` that previously encouraged copying reference layouts, replacing it with principles extraction.

## [1.3.0] - 2026-10-21

### Added
- **Client Milestone Notification Engine (`scripts/client-notify/index.js`)**: Multi-stage companion utility allowing agents to draft and dispatch milestone review emails to clients across all 12 pipeline gates, with strict human approval required before sending, Resend/SendGrid/SMTP integration, clickable `mailto:` links, and automated logging in `router-state.md`.
- **Mandatory Notification Prompt Rule**: Enforced state machine protocol rule in `SKILL.md` and `pipeline-stages.md` requiring agents to ask whether to notify the client at every stage and gate sign-off.
- **Stage 11 Structure Auditor (`scripts/structure-audit/index.js`)**: Companion utility to automatically audit all 12 stage deliverables, verify strict component line limits, and generate `project-docs/structure-audit.md`.

## [1.2.1] - 2026-10-21

### Fixed
- **Concept Sorting in Review Hub**: Explicitly sorted Gate 2 concept cards by numerical concept/option number (`Concept 1`, `Option 1`, etc.) ascending rather than relying on filesystem directory order.

### Added
- **GitHub Pages Review Deployment**: Added `client-review-pages.yml` reusable GitHub Actions workflow asset to instantly publish Gate 2 client review websites to GitHub Pages.

## [1.2.0] - 2026-10-21

### Added
- **Full-Page Client Review Experience**: Replaced card-based review mockups with full-page final HTML websites at `project-docs/client-review/gate-2-design-theory/<concept-name>/index.html` featuring complete realistic portfolio content, real project showcases, timeline, stack, and floating review switcher navigation.
- **Companion Reference Capture Utility (`scripts/reference-capture/index.js`)**: Provided automated Node.js utility to fetch rendered HTML (`page.html`), stripped markdown (`content.md`), full-page screenshots (`screenshot-full-1440.png`), and structured audit records (`capture.json`) into `project-docs/design-references/<domain>/`.
- **Eliminated Artificial Slug Layers**: Removed artificial `/home` subdirectories from both reference captures (`project-docs/design-references/<domain>/`) and client reviews (`gate-2-design-theory/<concept-name>/index.html`) for cleaner, direct paths.
- **Optimized Gate 2 Review Generator (`scripts/client-review/index.js`)**: Updated companion script to scan direct concept directories and generate/update the Gate 2 comparison hub (`gate-2-design-theory/index.html`) and root portal (`client-review/index.html`).

## [1.1.0] - 2026-10-21

### Added
- **Reference Capture Engine (Landing Pages Only)**: Standardized reference captures into `project-docs/design-references/` capturing 4 distinct artifacts per page: `page.html`, `content.md`, `screenshot-full-1440.png`, and `capture.json`.
- **Mandatory Usage Notice**: Enforced legal/security disclaimer in `sources.md` prohibiting third-party markup, text, or image reuse in client deliverables.
- **Modular Client Review Architecture**: Restructured Gate 2 deliverables from a single file into modular per-concept pages.
- **Companion Review Generator Utility (`scripts/client-review/index.js`)**: Provided zero-dependency Node.js companion script to scan concept directories and generate the Gate 2 comparison hub.
- **Client Decision Protocol**: Formalized Gate 2 halt condition in `project-docs/router-state.md` preventing raw technical spec review and providing copy-ready decision snippets.

## [1.0.0] - 2026-10-21

### Added
- **create-nextjs-website**: Single-file runbook to scaffold modern Next.js App Router websites with TypeScript and Tailwind CSS.
- **create-nww-website**: 12-stage human-gated website build pipeline with optional NWW CMS integration, responsive image optimizer, and stock image sourcing.
- **nww**: Fast shortcut alias to start the Next Web Website (NWW) site creation pipeline.
- **publish**: Maintainer-only release automation and preflight validation suite enforcing the 10-gate safety architecture.
- **skills.manifest.json**: Authoritative manifest defining publishable and internal skills.
- **publish.config.json**: Authoritative publish configuration defining approved remote allowlists, branch restrictions, and security guardrails.

### Security & Privacy
- Enforced strict preflight checks (G1 through G10) blocking accidental secret leaks, un-gitignored context files, and unapproved remotes.
