# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
