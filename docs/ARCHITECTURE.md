# Architecture: skills-by-devansh

## Overview

`skills-by-devansh` is a specialized skill repository designed for the [skills.sh](https://skills.sh/) ecosystem and the `npx skills` CLI. It authors, packages, and distributes specialized agent capabilities that can be installed into any AI development agent (such as Antigravity, Claude, or Cursor).

Unlike traditional web or service codebases, this repository is **documentation- and instruction-first**: its primary artifacts are structured markdown runbooks (`SKILL.md`), modular technical references (`references/`), and embedded Node.js CLI utilities (`scripts/`).

---

## Directory Architecture

```
skills-by-devansh/
├── skills/                             # The published skills catalog
│   ├── create-nextjs-website/          # App Router scaffolding skill
│   │   └── SKILL.md                    # Single-file runbook & frontmatter
│   ├── create-nww-website/             # Multi-stage website builder
│   │   ├── SKILL.md                    # Master 9-stage pipeline runbook
│   │   ├── assets/                     # Standalone templates & client review assets
│   │   │   └── client-review-template.html
│   │   ├── references/                 # Modular gate reference specifications (zero loose files in root)
│   │   │   ├── gate-0-intake/          # Stage 0: SKILL.md, client-questionnaire.md, pipeline-stages.md
│   │   │   ├── gate-1-tech-stack/      # Stage 1: SKILL.md
│   │   │   ├── gate-2-design-theory/   # Stage 2: SKILL.md, design-variations.md
│   │   │   ├── gate-3-page-list/       # Stage 3: SKILL.md
│   │   │   ├── gate-4-seo-strategy/    # Stage 4: SKILL.md, seo-tool-library.md, seo-tool-registry.json
│   │   │   ├── gate-5-page-specs/      # Stage 5: SKILL.md, cms-architecture.md, stock-image-sourcing.md, cms/
│   │   │   ├── gate-6-scaffolding/     # Stage 6: SKILL.md, gsap-animation-tiers.md, code-conventions.md, asset-optimization.md, page-checklist.md
│   │   │   ├── gate-7-sub-pages/       # Stage 7: SKILL.md
│   │   │   └── gate-8-final-verification/ # Stage 8: SKILL.md
│   │   └── scripts/                    # Embedded CLI helper tools
│   │       ├── assets-optimizer/       # Sharp/ffmpeg image/video pipeline
│   │       ├── stock-fetch/            # Stock image provenance & fetch
│   │       ├── client-review/          # Gate 2 visual review hub and portal generator
│   │       ├── reference-capture/      # Automated reference landing page DOM & screenshot capture
│   │       ├── site-fetch/             # Universal site crawler & page-type capture (previous site & references)
│   │       ├── client-notify/          # Multi-stage client email review & approval notification engine
│   │       ├── structure-audit/        # Stage 8 deliverables and coding conventions validator
│   │       ├── cms-seed/               # Blog seeding CLI engine and schema validator
│   │       └── seo/                    # PageSpeed Insights & sitemap/robots CLI helpers
│   ├── nww/                            # Shortcut alias skill for create-nww-website
│   │   └── SKILL.md                    # Fast shortcut delegation runbook
│   └── publish/                        # Maintainer-only release skill (metadata.internal)
│       ├── SKILL.md                    # 10-gate release runbook
│       └── references/                 # Preflight gates & incident response
├── scripts/                            # Repository maintenance utilities
│   └── publish/                        # Preflight validator, security scan & release CLI
├── docs/                               # Architecture and repo documentation
│   └── ARCHITECTURE.md                 # This system architecture guide
├── AGENTS.md                           # Core agent guidance and discipline
└── .agents/                            # Antigravity customization layer
    ├── rules/                          # Scoped declarative constraints
    ├── skills/                         # On-demand agent runbooks
    └── hooks/                          # Lifecycle safety guards
```

---

## Client Project Architecture (`<client-project-root>/`)

When an agent executes the `create-nww-website` or `nww` pipeline to develop a website for a client, the generated workspace strictly follows this locked canonical directory architecture:

```text
<client-project-root>/
├── .env.example                          # Root environment template (SEO tools, Resend email keys)
├── client-context/                       # All raw client inputs, brand assets, discovery questionnaires
│   ├── answers/                          # Modular batch discovery & intake answers (batch-01 to batch-07)
│   ├── asset-manifest.md                 # Complete visual asset inventory, harvesting & generation manifest
│   ├── branding/                         # Brand logos, color guides, visual assets
│   ├── uploads/                          # Client-provided images, headshots, brochures
│   └── notes/                            # Raw notes, transcripts, or initial requirements
├── previous-site/                        # [If Migration - Crawled Before Gate 1] Legacy site archive
│   ├── sitemap-legacy.xml                # Crawled URLs from existing website for 301 redirects
│   ├── <slug>/                           # Per-page snapshot (<slug>/index.html, content.md, screenshot.png)
│   └── media/                            # Legacy media assets
├── client-requirements/                  # [Optional] Recorded client requirement notes during in-place revisions
│   └── client-revision-notes.md          # Client revision feedback notes (revisions applied directly in-place)
├── project-docs/                         # Project pipeline management & tracking
│   ├── router-state.md                   # Live pipeline state, current stage, gate status & email logs
│   ├── page-checklist.md                 # Stage 6 master QA acceptance checklist
│   ├── design-references/                # Benchmark reference scrapes (page-type snapshots via site-fetch)
│   │   ├── sources.md                    # Ledger of all benchmark reference sites and captured page types
│   │   └── <domain>/                     # Scraped reference site assets (<domain>/<slug>/)
│   │       └── <slug>/                   # Per-page snapshot (<slug>/index.html, content.md, screenshot.png)
│   └── client-review/                    # Human-gated client review deliverables
│       ├── index.html                    # Root Review Portal (indexes all active gate deliverables)
│       ├── gate-1-tech-stack/
│       │   └── tech-stack.md             # Stage 1 tech stack specification
│       ├── gate-2-design-theory/
│       │   ├── design-theory.md          # Stage 2 visual direction, typography, colors, motion
│       │   ├── index.html                # Gate 2 concept comparison & review hub
│       │   └── variation-<N>-<slug>/     # HTML + Tailwind + jQuery variations (deployed to public URL)
│       ├── gate-3-page-list/
│       │   └── page-list.md              # Master page inventory & route hierarchy (no page-design-notes.md)
│       ├── gate-4-seo-strategy/
│       │   └── seo-strategy.md           # Keywords, metadata, JSON-LD & Search Console check
│       ├── gate-5-page-specs/            # Single-Mode Markdown page blueprints
│       │   ├── layout-system.md          # Global shared components layout spec (ONLY ## Shared Components)
│       │   └── <page-slug>.md
│       ├── gate-5-cms-requirements/      # [If CMS Enabled] Blocking checklist (list.md) & read-only query (prompt.md)
│       ├── gate-5-cms-schema/            # [If CMS Enabled] Collection schemas & models (cms-schema.md)
│       ├── gate-5-cms-content/           # [If CMS Enabled] Authentic JSON seed content
│       └── gate-8-final-verification/
│           └── structure-audit.md        # Stage 8 deliverables compliance & code limits audit
└── site/                                 # Production Next.js App Router codebase
    ├── .env.example                      # Site environment template (Next.js variables, CMS API tokens)
    ├── package.json                      # Next.js App Router, Tailwind CSS, Lucide icons, GSAP
    ├── next.config.mjs                   # Next.js configuration (images, redirects, headers)
    ├── tailwind.config.js                # Design token mapping from Stage 2 Design Theory
    ├── postcss.config.js
    ├── site.manifest.json                # Project build manifest and page status registry
    ├── public/                           # Self-hosted variable fonts, optimized WebP/AVIF images, SVGs
    ├── app/                              # Next.js App Router (layout.js, globals.css, thin page.js <= 80 lines)
    │   ├── page.js                       # Stage 6 Home / Landing Page Showcase (< 80 lines)
    │   ├── _components/                  # Section components (< 250 lines, // section: <id>)
    │   └── <sub-page-slug>/              # Stage 7 sub-pages built sequentially
    ├── components/                       # Global shared components defined in layout-system.md
    └── lib/                              # Shared helper utilities (< 500 lines: cms, utils, seo, animations)
```

---

## Skills.sh & Discovery Model

Skills in this repository conform to the skills.sh decentralized distribution standard:
1. **Repository Layout**: Each skill is a named directory under `skills/<skill-name>/` containing a `SKILL.md` file.
2. **YAML Frontmatter**: The `SKILL.md` must start with YAML frontmatter containing:
   - `name`: Lowercase, hyphen-separated identifier matching the directory.
   - `description`: Third-person synopsis describing *what* the skill does and *when* the agent should invoke it.
3. **Decentralized Distribution**: Anyone installs skills via `npx skills add devanshdeveloper/skills-by-devansh --skill <skill-name>`.
4. **Local Discovery & Testing**: Tested via `DISABLE_TELEMETRY=1 npx skills add . --list` and `DISABLE_TELEMETRY=1 npx skills use . --skill <name>`.

---

## Embedded Utility Scripts

Skills may contain companion CLI utilities inside `scripts/`:
- **`assets-optimizer`**: A Node.js utility utilizing `sharp` and `ffmpeg` to process, optimize, resize, and produce WebP assets and manifests.
- **`stock-fetch`**: A Node.js utility connecting to Pixabay, Pexels, and Unsplash APIs to search, download, and log provenance for images.
- **`client-review`**: A Node.js utility that automatically scans modular concept review directories and generates/updates client review hubs and portals.
- **`site-fetch`**: A unified Node.js crawler for both Stage 0 previous site migrations and Stage 2 design references. Probes sitemaps, discovers internal navigation links, clusters page types up to `--max-pages`, and captures rendered DOM (`<slug>/index.html`), stripped markdown (`<slug>/content.md`), full-page screenshots (`<slug>/screenshot.png`), and `sitemap-legacy.xml`.
- **`reference-capture`**: A backwards-compatible CLI wrapper delegating directly to `site-fetch` for Stage 2 design reference discovery and capture.
- **`client-notify`**: A Node.js utility providing stage-by-stage client email drafting, Resend/SendGrid/SMTP dispatch upon explicit user approval, clickable `mailto:` links, and automated logging in `router-state.md`.
- **`structure-audit`**: A Node.js utility auditing project documentation across all 12 stages, enforcing strict line limits and section comments, and compiling `project-docs/structure-audit.md`.

These utilities are self-contained and invoked via Node directly (`node index.js`).

---

## Release & Publishing Orchestration

The maintainer release workflow (`scripts/publish/`) enforces a 10-gate validation pipeline ensuring zero accidental secret leaks, accurate catalog manifests, consistent documentation, and fast-forward-only git releases:
- **Fast Mode Orchestrator (`release.mjs`)**: Evaluates all 10 preflight gates (G1 through G10) plus the full security scan concurrently in a single process via `Promise.all`. Automatically infers the latest semver tag from `CHANGELOG.md` and outputs a consolidated machine-readable summary table in < 1 second.
- **Thorough Mode (`--thorough`)**: Sequential execution mode for deep manual debugging with verbose diagnostics.
- **Preflight Core (`preflight.mjs`)**: Modular async gate implementations (`checkG1Remote` ... `checkG10RemoteProbe`) reusable across CLI and CI runners.
- **Security Scanner (`security-scan.mjs`)**: High-entropy and pattern-based token detector scanning active tree files and `git log -p --all` history.
- **Human Confirmation Gate**: Git commit, tag creation, and fast-forward push remain strictly gated behind interactive human approval (`Type "yes"`), preventing automated or unattended push mutations.

---

## Antigravity Customization Architecture

To ensure AI agents operate with maximum precision and zero unwanted side-effects:
- **`AGENTS.md`**: Provides immediate, always-on grounding: repo map, exact commands, and non-negotiable editing rules.
- **Rules (`.agents/rules/`)**: Scoped rules applied conditionally via globs (`skills/**`, `skills/**/scripts/**`) or manual triggers.
- **Skills (`.agents/skills/`)**: Multi-step workflows (`plan-first`, `verify`, `add-feature-in-repo-style`) progressively disclosed when triggered.
- **Hooks (`.agents/hooks.json`)**: PreToolUse and Stop safety guards blocking unauthorized file mutations and enforcing verification gates.

---

## Security & Guardrail Heuristic Limits

Automated scanners (`security-scan.mjs`) and lifecycle hooks (`edit-guard.mjs`, `secret-guard.mjs`) provide layer-of-defense heuristic guardrails, not absolute mathematical guarantees:
- **Regex Heuristics**: Pattern matching intercepts known token syntax (GitHub tokens, AWS keys, stock API keys) and standard shell redirection syntax (`>`, `tee`, `sed -i`).
- **Non-Exhaustive Scope**: Obfuscated scripts, base64 payloads, dynamic command evaluation, or unknown third-party token structures can evade regex heuristics.
- **Maintainer Responsibility**: Automated checks augment but never supersede manual code review, secret hygiene, and prompt credential rotation if an exposure occurs.
