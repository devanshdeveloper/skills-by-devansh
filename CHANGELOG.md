# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
