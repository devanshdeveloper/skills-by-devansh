# Project Context Brief: skills-by-devansh

## 0. Header
- **Repository**: `skills-by-devansh` [read: `publish.config.json`]
- **Branch**: `main` [read: git branch]
- **Commit**: `2ff9f61` [read: git rev-parse --short HEAD]
- **Date**: 2026-10-21 [read: system clock]
- **Focus**: whole project

## 1. Purpose and Current State
- Authoring and distribution catalog for agent skills compliant with the [skills.sh](https://skills.sh/) ecosystem and `npx skills` CLI, providing structured runbooks and companion Node.js utilities for AI-assisted software development [read: `AGENTS.md:3-5`, `docs/ARCHITECTURE.md:3-8`].
- Actively maintained at release `v1.6.0`, publishing three consumer skills (`create-nextjs-website`, `create-nww-website`, `nww`) and one maintainer skill (`publish`) [read: `skills.manifest.json:3-10`, `README.md:10-15`, git log].
- Repository enforces a strict 10-gate release preflight suite with multi-layered secret scanning, rigid line-count caps, and automated git tagging [read: `scripts/publish/preflight.mjs:58-450`, `skills/publish/SKILL.md:21-35`].

## 2. Stack and Versions
- **Repository Architecture**: Documentation- and instruction-first skill catalog; no root web framework [read: `docs/ARCHITECTURE.md:7`].
- **Scaffolded Target Framework**: Next.js App Router with TypeScript and React Server Components [read: `skills/create-nextjs-website/SKILL.md:2-3`, `skills/create-nww-website/SKILL.md:86`].
- **Runtime**: Node.js (>=20.9.0, active v24.16.0) [read: `AGENTS.md:7`].
- **Package Managers**: npm, pnpm, npx (root package.json intentionally forbidden without approval) [read: `AGENTS.md:8, 49`]. Lockfile present: `skills/create-nww-website/scripts/client-review/pnpm-lock.yaml` [read: file listing].
- **Key Companion Libraries & Versions**:
  - `ffmpeg-static`: `^5.3.0` [read: `skills/create-nww-website/scripts/assets-optimizer/package.json:13`]
  - `fluent-ffmpeg`: `^2.1.3` [read: `skills/create-nww-website/scripts/assets-optimizer/package.json:14`]
  - `sharp`: `^0.35.3` [read: `skills/create-nww-website/scripts/assets-optimizer/package.json:15`]
  - `@axe-core/playwright`: `4.11.1` [read: `skills/create-nww-website/scripts/client-review/package.json:5`]
  - `playwright`: `1.56.1` [read: `skills/create-nww-website/scripts/client-review/package.json:6`]
- **Deploy Targets**: GitHub / skills.sh (skill catalog) [read: `publish.config.json:16`], GitHub Pages (Gate 2 preview portals) [read: `skills/create-nww-website/assets/client-review-pages.yml:1-33`], Vercel (generated Next.js sites) [read: `skills/create-nww-website/SKILL.md:68`].

## 3. Structure
```
skills-by-devansh/
├── .agents/                                # Antigravity agent configuration layer
│   ├── hooks/                              # Lifecycle safety hooks (edit-guard, secret-guard, verify-gate)
│   ├── rules/                              # Behavioral constraints (safety, authoring, scripts, release)
│   └── skills/                             # Agent workflows (plan-first, verify, add-feature-in-repo-style, codex-cli)
├── .github/workflows/                      # GitHub Actions CI (security scan, preflight audit, discovery)
├── docs/
│   └── ARCHITECTURE.md                     # Core architecture, directory map, and distribution model
├── scripts/publish/                        # Repository release automation (preflight, security-scan, release)
├── skills/                                 # Distributed skills catalog (agentskills.io format)
│   ├── create-nextjs-website/              # App Router scaffolding skill (single-file SKILL.md)
│   ├── create-nww-website/                 # 9-stage human-gated website builder skill
│   │   ├── assets/                         # Client review portal templates and GitHub Pages action
│   │   ├── references/                     # 14 modular stage references and technical specifications
│   │   └── scripts/                        # 8 embedded CLI companion utilities (standalone tools)
│   ├── nww/                                # Lightweight shortcut alias delegating to create-nww-website
│   └── publish/                            # Maintainer-only skill enforcing 10 preflight gates
├── tests/                                  # Test runner & fixtures (tests/run-fixtures.mjs)
│   └── fixtures/                           # Sample valid & oversized fixtures
├── AGENTS.md                               # Primary agent operational rules and command whitelist
├── publish.config.json                     # Git remote, owner, and telemetry configuration
└── skills.manifest.json                    # Public vs internal skills catalog manifest
```

## 4. Architecture and Data Flow
- **Skill Engine Model**: Markdown runbooks with YAML frontmatter (`name`, `description`) parsed by `npx skills` CLI; decentralized distribution directly from GitHub repository [read: `docs/ARCHITECTURE.md:52-61`].
- **Routing & Client/Server Boundaries (Target Sites)**: Next.js App Router (`site/app/<route>/page.js`) using React Server Components by default; thin page server components delegating interactive parts to scoped `_components/*.js` [read: `skills/create-nww-website/SKILL.md:86-95`].
- **API & Data Access**: Target sites connect to Next Web Website (NWW) Headless CMS via Bearer token auth (`Authorization: Bearer ${CMS_SITE_KEY}`) fetching paginated articles (`/api/blog/paginate`) and individual posts (`/api/blog/read-one-by-slug/:slug`); leads submit to `/api/lead/submit` [read: `skills/create-nww-website/SKILL.md:127-131`, `references/cms-architecture.md:20-40`].
- **Cache & Revalidation Pipeline**: On-demand ISR using constant-time hashed Bearer authentication on `POST /api/revalidate`, invalidating broad tags via `revalidateTag(tagFor(resource))` with fallback `REVALIDATE_SECONDS=60` [read: `skills/create-nww-website/SKILL.md:132-136`].
- **Rendering & Preview Pipelines**: Single-mode markdown page specifications in Stage 5 generating unified `page.md` blueprints; Stage 6 project scaffolding pre-loading 10 specialized architecture & GSAP skills and building the Next.js App Router codebase in `site/` with manifest `site/site.manifest.json` [read: `skills/create-nww-website/SKILL.md:88-132`].
- **Media Optimization Pipeline**: Companion CLI uses `sharp` and `ffmpeg-static` to process source assets into WebP/AVIF format with responsive `srcset` and manifest output at CLS = 0 [read: `skills/create-nww-website/SKILL.md:143-150`].
- **Tool Decoupling**: Companion scripts under `skills/create-nww-website/scripts/` are self-contained and run directly via Node.js without monorepo package workspace links [read: `docs/ARCHITECTURE.md:64-74`].

## 5. Conventions to Mirror
- **Naming**: Directory and skill names are lowercase alphanumeric with hyphens (`create-nww-website`); reference files are lowercase kebab-case (`pipeline-stages.md`) [read: `docs/ARCHITECTURE.md:56-58`, `scripts/publish/preflight.mjs:185-188`].
- **Skill Specification**: `SKILL.md` must be <= 500 lines with YAML frontmatter containing `name` (matching directory) and third-person `description` (<= 1024 characters); references directory must be flat (no subdirectories); no `README.md` inside skill folders [read: `scripts/publish/preflight.mjs:159-206`].
  - Example: `skills/publish/SKILL.md`
- **Reference Layout**: Modular, stage-specific guidance partitioned into flat markdown files [read: `docs/ARCHITECTURE.md:22-26`].
  - Example: `skills/create-nww-website/references/pipeline-stages.md`
- **Script Conventions**: Node scripts use strict mode/ESM, avoid external production dependencies where native Node suffices, mask sensitive tokens in stdout, and provide CLI flag parsing [read: `.agents/rules/script-conventions.md:1-40`].
  - Example: `scripts/publish/security-scan.mjs`
- **State Machine Discipline**: Progress tracked explicitly in markdown state files (`project-docs/router-state.md`) with explicit human sign-off required at each gate before advancing [read: `skills/create-nww-website/SKILL.md:53-78`].
  - Example: `skills/create-nww-website/SKILL.md`
- **Section Component Markup**: Every generated section component opens with `// section: <id>` comment and renders `data-section="<id>"` on the root tag [read: `skills/create-nww-website/SKILL.md:95`].

## 6. Reusable Pieces
- **Preflight & Security Engine**:
  - `scripts/publish/preflight.mjs`: 10-gate audit script checking remotes, branch cleanliness, specs, manifests, placeholders, and tags [read: file].
  - `scripts/publish/security-scan.mjs`: Regex-based secret scanner with token masking [read: file].
  - `scripts/publish/release.mjs`: Interactive release execution wrapper [read: file].
- **Website Pipeline Companion Utilities**:
  - `skills/create-nww-website/scripts/assets-optimizer/index.js`: Sharp and ffmpeg asset optimization pipeline [read: file].
  - `skills/create-nww-website/scripts/stock-fetch/index.js`: Pixabay, Pexels, and Unsplash search, fetch, and provenance logger [read: file].
  - `skills/create-nww-website/scripts/client-review/index.js`: Gate 2 concept comparison hub and portal compiler [read: file].
  - `skills/create-nww-website/scripts/client-review/preview.mjs`: Static server for Gate 2 visual preview [read: file].
  - `skills/create-nww-website/scripts/client-review/verify.mjs`: Playwright and Axe accessibility verification suite [read: file].
  - `skills/create-nww-website/scripts/client-review/fetch-fonts.mjs`: Google Fonts downloader for offline review [read: file].
  - `skills/create-nww-website/scripts/reference-capture/index.js`: Playwright DOM, screenshot, and markdown extractor [read: file].
  - `skills/create-nww-website/scripts/client-notify/index.js`: Milestone notification drafter and Resend/SendGrid dispatcher [read: file].
  - `skills/create-nww-website/scripts/structure-audit/index.js`: Deliverables and line-limit auditor [read: file].
- **Templates & Schemas**:
  - `skills/create-nww-website/assets/client-review-template.html`: Client review portal UI template [read: file].
  - `skills/create-nww-website/assets/client-review-pages.yml`: GitHub Actions workflow template for GitHub Pages deployment [read: file].
  - `publish.config.json` & `skills.manifest.json`: Validation schemas and catalog configuration [read: files].

## 7. Commands
*Commands defined across repository package.json files:*
- Root `package.json`: None exists (forbidden without explicit approval) [read: `AGENTS.md:49`].
- `skills/create-nww-website/scripts/assets-optimizer/package.json`:
  - `optimize-assets`: `node index.js` [read: file line 10]
  - *(lint, typecheck, build, test, dev: not found)*
- `skills/create-nww-website/scripts/client-review/package.json`:
  - *(scripts block: not found / no scripts defined)* [read: file]
- `skills/create-nww-website/scripts/stock-fetch/package.json`:
  - `fetch`: `node index.js` [read: file line 10]
  - *(lint, typecheck, build, test, dev: not found)*

*Exact verification and workflow commands defined in repository specification [read: `AGENTS.md:24-36`]:*
- List skills locally: `DISABLE_TELEMETRY=1 npx skills add . --list`
- Test skill prompt: `DISABLE_TELEMETRY=1 npx skills use . --skill <skill-name>`
- Syntax check scripts: `node --check <path-to-script.js>`
- Security scan: `node scripts/publish/security-scan.mjs`
- Preflight audit: `node scripts/publish/preflight.mjs --dry-run`
- Release flow: `node scripts/publish/release.mjs --dry-run`

## 8. Agent Setup
- **Rules (`.agents/rules/`)**:
  - `release-checklist.md`: Outlines 10 preflight gates and dry-run to confirm release workflow [read: file].
  - `safety-discipline.md`: Enforces IDE-only non-destructive edits, secret hygiene, and isolation [read: file].
  - `script-conventions.md`: Coding standards, dependency bans, and error patterns for companion scripts [read: file].
  - `skill-authoring.md`: agentskills.io compliance, frontmatter structure, and <=500 line limits [read: file].
- **Skills (`.agents/skills/`)**:
  - `add-feature-in-repo-style`: Pattern-extracting scaffolder for new skills and companion tools [read: file].
  - `codex-cli`: Automates and configures OpenAI Codex CLI sessions and AGENTS.md integration [read: file].
  - `plan-first`: Mandates context reading, risk analysis, and plan confirmation before editing [read: file].
  - `verify`: Catalog validation, frontmatter linting, script syntax checking, and reporting [read: file].
- **Workflows (`.agents/workflows/`)**:
  - `codex.md` (`/codex`): Slash command executing prompt directly through Codex CLI [read: file]. Subagents: none configured in repo.
- **Hooks (`.agents/hooks.json`)**:
  - `edit-guard`: PreToolUse hook intercepting `run_command` via `node hooks/edit-guard.mjs` to prevent bash mutations [read: file lines 2-15].
  - `secret-guard`: PreToolUse hook intercepting file modifications via `node hooks/secret-guard.mjs` to block exposed keys [read: file lines 16-29].
  - `verify-gate`: Stop hook via `node hooks/verify-gate.mjs` (currently `"enabled": false`) [read: file lines 30-39].

## 9. Env and Services
- **Environment Variable Names (Values Omitted)**:
  - `DISABLE_TELEMETRY`: Disables skills CLI telemetry during test and CI runs [read: `README.md:92`, `.github/workflows/verify-and-scan.yml:31`].
  - `PIXABAY_API_KEY`: API authentication key for Pixabay image queries [read: `skills/create-nww-website/scripts/stock-fetch/index.js:359`].
  - `PEXELS_API_KEY`: API authentication key for Pexels image queries [read: `skills/create-nww-website/scripts/stock-fetch/index.js:362`].
  - `UNSPLASH_ACCESS_KEY`: Access key for Unsplash image queries [read: `skills/create-nww-website/scripts/stock-fetch/index.js:365`].
  - `RESEND_API_KEY`: API token for client notification email delivery via Resend [read: `skills/create-nww-website/scripts/client-notify/index.js:379`].
  - `RESEND_FROM`: Configurable sender address for milestone emails [read: `skills/create-nww-website/scripts/client-notify/index.js:380`].
  - `SERVER_URL`: NWW CMS API base URL [read: `skills/create-nww-website/references/cms-architecture.md:72`].
  - `CMS_SITE_KEY`: Bearer site identifier token for NWW CMS queries [read: `skills/create-nww-website/references/cms-architecture.md:73`].
  - `REVALIDATE_SECRET`: Shared secret for on-demand ISR webhook verification [read: `skills/create-nww-website/references/cms-architecture.md:153`].
  - `REVALIDATE_SECONDS`: Cache duration fallback interval for Next.js ISR [read: `skills/create-nww-website/references/cms-architecture.md:47`].
  - `LOCALAPPDATA`: Windows path resolution for npm/Playwright cache [read: `skills/create-nww-website/scripts/reference-capture/index.js:34`].
- **Services Used**:
  - `skills.sh`: Decentralized agent skill hosting and leaderboard registry [read: `README.md:44-49`].
  - Pixabay / Pexels / Unsplash: Stock media sourcing [read: `skills/create-nww-website/scripts/stock-fetch/index.js:359-366`].
  - Resend: Transactional email notifications for client milestones [read: `skills/create-nww-website/scripts/client-notify/index.js:379`].
  - NWW CMS: Headless backend providing blog articles, media schemas, and contact submission APIs [read: `skills/create-nww-website/references/cms-architecture.md:1-25`].
  - GitHub Pages: Static hosting for client concept review hubs [read: `skills/create-nww-website/assets/client-review-pages.yml`].
  - GitHub Actions: Automated CI validation, secret scanning, and preflight audit [read: `.github/workflows/verify-and-scan.yml`].

## 10. Git State
- **Branch**: `main` [read: git rev-parse]
- **Last 5 Commits**:
  - `2ff9f61` release: v1.6.0 [read: git log]
  - `df25608` feat(create-nww-website): sync Gate 2 review companion tools, Playwright verifier, font fetcher, and reference capture [read: git log]
  - `00309c2` release: v1.3.0 [read: git log]
  - `1429109` docs: clarify Node script commands in Stage 2 pipeline-stages reference [read: git log]
  - `5acb2f7` release: v1.2.1 [read: git log]
- **Uncommitted Files**: None (working tree clean) [read: git status]

## 11. Risks and Gaps
- **Companion Script Dependencies**: Standalone companion utilities maintain independent `package.json` files; running them in consumer projects requires installing their respective dependencies (`pnpm install`).
- **Telemetry Sensitivity**: Executing `npx skills add .` or `npx skills use .` without `DISABLE_TELEMETRY=1` during development triggers install telemetry that corrupts public rankings on skills.sh; guarded via `edit-guard.mjs`.
- **Heuristic Protections**: Automated regex guards and security scans are heuristic defenses-in-depth, not formal verification proofs; developer credential hygiene remains essential.

## 12. Unknowns
- **Playwright Installation in Consumer Agents**: `skills/create-nww-website/scripts/client-review/package.json` and `reference-capture/package.json` require Playwright 1.56.1 and `@axe-core/playwright`; consumer agent environments must run `npx playwright install chromium` if browser binaries are not pre-cached.

## 13. Audit Verification Check
- Re-ran `git status --short`: No files modified (working tree matches baseline).