---
name: create-nww-website
description: Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 9-stage human-gated workflow. Enforces markdown page specifications with CMS schemas, codebase scaffolding with live landing page showcase, and incremental sub-page builds. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project.
---

# Create NWW Website

> [!IMPORTANT]
> **Do Not Edit Skill Files:** Skill files (`SKILL.md`, `references/**`, `scripts/**`) are immutable runbooks. Never edit or overwrite skill files directly during project execution. If you need changes, improvements, or custom workflow behavior, **request changes with a prompt** instead.

This skill orchestrates the end-to-end creation of production-grade Next.js App Router websites with optional Next Web Website (NWW) CMS integration. It enforces a disciplined 9-stage human-gated workflow (Stages 0 through 8) ensuring structural rigor, taste-driven aesthetic polish, and technical quality.

---

## Quick Start

### 1. Install & Update (Hard Pull Latest Skills)

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website -y
```

> **New Chat / Session Rule:** If starting in a **new chat** or continuing a project in a fresh session, always **hard pull / update** the latest skills to ensure you have the newest gate runbooks, crawler limit options, and bugfixes:
> ```bash
> DISABLE_TELEMETRY=1 npx skills update create-nww-website -y
> # Or hard re-fetch directly from GitHub:
> DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website -y
> ```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@create-nww-website
```

> **Tip (Windows PowerShell):** Use `$env:DISABLE_TELEMETRY="1"; npx skills update create-nww-website -y`

### 2. Starter Prompt

Copy and paste into your AI assistant (Antigravity, Cursor, Claude Code, or Codex CLI) to fast-track Gate 0 (if starting in a new chat, run the hard pull update command above first):

````markdown
Activate the create-nww-website skill. Here is our project brief to initialize Stage 0 Intake:

## 1. Project Identity & Purpose
- Business / Brand Name: [e.g. Minit Charger]
- Technical Project Name / Vercel Slug: [e.g. minit-charger]
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
- Motion Preference: [Choose: "disabled", "low", "medium", "high", "max", or "ultra" (Default: "medium")]
- Design References:
  - https://stripe.com (spatial grid, typography hierarchy)
  - https://linear.app (sleek dark accents, micro-interactions)

## 3. Scope & Pages
- Core Pages: [e.g. Home, Solutions, About, Blog, Contact]
- Forms Needed: [e.g. Lead capture & consultation request]
- Imagery & Assets: [e.g. Client-provided photos + licensed stock (Pixabay / Unsplash) + legacy site reuse]

Please parse this into `client-context/answers/batch-*/answers.md` and `client-context/asset-manifest.md`, then present the Gate 0 Intake Recap for confirmation.
````

> **Tip:** If you prefer a guided interview, just type `nww` and the agent will walk you through each batch (5–7 questions per turn) interactively.

---

## Mandatory Start-Up Rule (Activation Protocol)

**ON ACTIVATION, IMMEDIATELY EXECUTE THIS START-UP PROTOCOL BEFORE ANY OTHER WORK:**

0. **New Chat / Fresh Session Rule (Hard Pull Latest Skills):**
   - If this is a **new chat**, new session, or starting a new project, verify or hard pull the latest version of the skills from GitHub before initiating the pipeline:
     ```bash
     DISABLE_TELEMETRY=1 npx skills update create-nww-website -y
     # Or re-fetch directly from GitHub:
     DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website -y
     ```
   - Verify local skill discovery: `DISABLE_TELEMETRY=1 npx skills add . --list`.
1. **Client Milestone Email Question:**
   - Ask the user at the start: *"Would you like client milestone approval emails prepared and dispatched at each stage?"* Record the preference.
2. **First Action:** Check if the intake answers directory `client-context/answers/` already exists (single read-only check; inspect `client-context/answers/batch-01-core-identity/answers.md`).
   - **If answers exist and are complete:** Present an intake recap across batches, highlight any variations from project defaults, and halt for user confirmation to proceed to Gate 0.
   - **If answers exist but are partial:** Acknowledge answered fields, and present ONLY the first batch containing unanswered questions.
   - **If user provided a pasted brief or project notes in their prompt:** Extract known answers into `client-context/answers/batch-*/answers.md`, report what was captured, and present ONLY the remaining gap questions.
   - **If no answers exist:** **IMMEDIATELY output Batch 01 (Questions Q1a to Q8)** of the intake questionnaire.
3. **Site Migration & Environment Setup:**
   - If user indicates a site migration (`build_origin: migration`), crawl and archive the previous website into `previous-site/` BEFORE Gate 1 as a full working offline mirror (`previous-site/index.html`, `sitemap.xml`, `<path>/index.html`, `content.md`, `screenshot.png`, `manifest.json`, with all assets placed in their source locations so opening `index.html` works as it is). Fetching the previous site must be completed in Stage 0 so that existing routes, redirects, copywriting, and media assets are preserved before technical planning begins.
   - Run the universal site fetcher using the user-selected crawling limit (`max-sampled`, `no-limits`, `max-any`, `homepage`, or `selected`): `node skills/create-nww-website/scripts/site-fetch/index.js --url <legacy-url> --out previous-site --limit-mode max-sampled` (viewable directly via `previous-site/index.html` or `--serve previous-site`). If `previous-site/` already exists, `site-fetch` automatically deletes the existing folder before crawling to guarantee a clean, pristine mirror without stale artifacts.
   - **Agentic Progress & Phase Reporting:** When executing `site-fetch`, monitor execution output and proactively report back to the user as each architectural phase completes:
     * **Phase 1 (Route Discovery):** Report XML sitemaps parsed and internal navigation links found.
     * **Phase 2 (Page Selection):** Report limit mode strategy and targeted page roster.
     * **Phase 3 (Page Capture):** Report captured pages count, asset slots detected, and network buffer status.
     * **Phase 4 (Asset Harvesting):** Report unique assets placed, high-resolution media tally, and relativized CSS files.
     * **Phase 5 (Offline Hardening):** Report offline HTML files written and active hardening safeguards.
     * **Phase 6 (Catalog & Preview):** Report manifest generation and provide instant local preview server command/URL (`--serve`).
   - **Git Ignore Instructions (`.gitignore`):** Add `previous-site/` to `.gitignore` at the project root immediately. Crawled offline mirrors contain full HTML documents, stylesheets, client-side scripts, and original media assets that bloat git history. Keeping `previous-site/` in `.gitignore` ensures all legacy assets remain available locally for Stage 0 asset harvesting and Stage 4 301 redirect mapping without being committed to git:
     ```gitignore
     # Legacy website offline mirror & harvested assets
     previous-site/
     ```
   - In the project root folder, generate a `.env.example` file with credential placeholders for external connections (e.g. SEO tools, client email sending).
4. **Absolute Restrictions & Skill Immutability:**
   - **DO NOT EDIT SKILL FILES:** Skill files (`SKILL.md`, `references/**`, `scripts/**`) are immutable runbooks. Never edit skill files directly; instead, request changes with a prompt.
   - **ZERO** preliminary file searches, directory listings, or repository scans.
   - **ZERO** project scaffolding, bash commands, package installations, or code edits.
   - **ZERO** planning artifact creation before answers are collected.
5. **Execution & Pacing:**
   - Present questions in progressive batches of 5 to 7 questions as defined in [references/gate-0-intake/client-questionnaire.md](references/gate-0-intake/client-questionnaire.md).
   - Wait for the user's reply before presenting the subsequent batch.
   - Never guess or fabricate missing required answers. For optional questions, record approved defaults if the user answers "I don't know" or "decide later".
   - **Secret Hygiene:** NEVER request, accept, or record secret credentials, API keys, or passwords. Request environment variable names only (`CMS_SITE_KEY`, `SERVER_URL`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`).
   - Save all answers to `client-context/answers/batch-[number]-[batch-name]/answers.md` and compiled asset inventories to `client-context/asset-manifest.md`.
6. **Gate 0 Enforced Halt:**
   - Present the completed intake summary across modular batch answers, confirmed technical project slug, and asset manifest for explicit human confirmation.
   - **HALT EXECUTION.** Do not proceed to Stage 1 Tech Stack or start any building until explicit confirmation is granted.

Read [references/gate-0-intake/client-questionnaire.md](references/gate-0-intake/client-questionnaire.md) immediately on activation to present the intake batches and compile modular batch answer files in `client-context/answers/batch-*/answers.md` and `client-context/asset-manifest.md`.

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
| **0** | **Intake Check** | `client-context/answers/batch-*/answers.md`, `client-context/asset-manifest.md`, `client-context/open-questions.md` (>= 20 questions), `.env.example`, `previous-site/` (if migration, crawled before Gate 1) | **Gate 0:** Intake recap across batch answers, asset manifest, open questions & CMS mode confirmation | [gate-0-intake/runbook.md](references/gate-0-intake/runbook.md), [client-questionnaire.md](references/gate-0-intake/client-questionnaire.md) |
| **1** | **Tech Stack** | `project-docs/client-review/gate-1-tech-stack/tech-stack.md` | **Gate 1:** Tech stack sign-off (Internal Developer Gate) | [gate-1-tech-stack/runbook.md](references/gate-1-tech-stack/runbook.md) |
| **2** | **Design Theory & Variations** | `project-docs/client-review/gate-2-design-theory/design-theory.md`, variation HTML files (HTML + Tailwind + jQuery), `gate-2-design-theory/index.html` review hub | **Gate 2:** Client visual review & variation selection sign-off (via live public deployment) | [gate-2-design-theory/runbook.md](references/gate-2-design-theory/runbook.md), [design-variations.md](references/gate-2-design-theory/design-variations.md) |
| **3** | **Page List & Sitemap** | `project-docs/client-review/gate-3-page-list/page-list.md` (zero unstated markdowns) | **Gate 3:** Sitemap & route structure sign-off | [gate-3-page-list/runbook.md](references/gate-3-page-list/runbook.md) |
| **4** | **SEO Strategy** | `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` (ask client for tool connections upfront) | **Gate 4:** Keywords, JSON-LD, sitemap, redirects sign-off | [gate-4-seo-strategy/runbook.md](references/gate-4-seo-strategy/runbook.md) |
| **5** | **Page Specifications & CMS Schema** | `page-specs/<slug>/page.md` (with benchmark reference mapping), `page-specs/_shared/*.md`, `gate-5-page-specs/layout-system.md` (only `Shared Components`), `gate-5-cms-requirements/` (`list.md`, read-only `prompt.md`), `gate-5-cms-schema/`, `gate-5-cms-content/` | **Gate 5:** Page specifications & CMS schema sign-off (Single Mode: Markdown only) | [gate-5-page-specs/runbook.md](references/gate-5-page-specs/runbook.md) |
| **6** | **Scaffolding, Foundation & Landing Page Showcase** | Load approved GSAP skills (skip if motion: disabled); block on unresolved CMS requirements; `site/.env.example`; file size efficiency; scaffold `site/`; `page-checklist.md`; **construct full Landing Page (`site/app/page.js`) for client showcase** | **Gate 6:** Scaffolding, foundation & landing page showcase sign-off | [gate-6-scaffolding/runbook.md](references/gate-6-scaffolding/runbook.md) |
| **7** | **Sub-Page Build Loop** | Inspect benchmark reference sub-pages prior to coding; `site/app/<route>/page.js`, `_components/`, `page-specs/<slug>/checklist-state.md` for remaining sub-pages | **Gate 7a:** Sub-page build review<br>**Gate 7b:** Sub-page binary QA sign-off | [gate-7-sub-pages/runbook.md](references/gate-7-sub-pages/runbook.md) |
| **8** | **Final Verification & Handover** | `project-docs/client-review/gate-8-final-verification/structure-audit.md`, production audit, client handover (deploy via `deploy-to-vercel`, email notification) | **Gate 8a:** Cross-page fixes approval<br>**Gate 8b:** Final handover sign-off | [gate-8-final-verification/runbook.md](references/gate-8-final-verification/runbook.md) |

---

## State Machine & Gating Protocol

1. **State Tracking:** Maintain `project-docs/router-state.md` at all times. Update gate progress (`pending | approved`), current stage, open questions, webhook status (`pending | built-on-branch | deployed | verified`), and per-page track (`layout: pending|approved`, `content: pending|approved`, `build: not started|built-pending`).
2. **Never Auto-Advance:** When completing a stage, present the deliverable summary to the user and halt execution until the user grants explicit approval.
3. **Handling Rejections & In-Place Revisions:** If the client requests modifications at any gate, do NOT create an extra markdown file (e.g. no `theory-revisions.md`). Make modifications directly to existing deliverable files in-place. If requirement notes are needed, store them in `client-requirements/`.
4. **Public Deployments for Client:** All links sent to the client (Gate 2 variations via GitHub Pages, Next.js site via Vercel) MUST be public HTTPS deployments. Never forward localhost URLs to the client.
5. **Master Checklist:** Track page completion solely in `project-docs/client-review/gate-3-page-list/page-list.md` checkboxes (`- [x] Page Name`).
6. **Client Milestone Notifications:** At every stage completion and gate sign-off, ask the user if they wish to dispatch an email notification to the client. Run `node scripts/client-notify/index.js` to preview the draft. The script enforces explicit user approval before sending and logs the event to `project-docs/router-state.md`.
7. **Continuous Discovery Loop & Rolling Open Questions (`client-context/open-questions.md`):** At Gate 0 takeoff, generate `client-context/open-questions.md` with at least 20 targeted open questions across batches. Maintain this rolling queue: when answers arrive at any downstream stage (even after `site/` has been scaffolded and constructed), the agent immediately removes the answered question, logs the answer to the appropriate batch file, adds a new question to keep the queue at >= 20, and **immediately implements the answer in the live site code and component specs**.

---

## Canonical Project File Structure Specification

All client projects developed through this pipeline strictly adhere to the following locked file and directory structure. No extraneous markdown files, alternate layouts, or legacy paths may be created.

```text
<client-project-root>/
├── .gitignore                            # Root repository ignore rules (includes previous-site/, .env*, node_modules/)
├── .env.example                          # [Stage 0] Root environment template (SEO tools, Resend email keys)
├── client-context/                       # [Stage 0] Dedicated repository for all raw client inputs & assets
│   ├── answers/                          # Confirmed modular intake batch answers
│   │   ├── batch-01-core-identity/answers.md
│   │   ├── batch-02-branding-motion/answers.md
│   │   ├── batch-03-sitemap-copy/answers.md
│   │   ├── batch-04-asset-harvesting-generation/answers.md
│   │   ├── batch-05-type-specific-routing/answers.md
│   │   ├── batch-06-legacy-site-migration/answers.md (if migration)
│   │   └── batch-07-seo-analytics-governance/answers.md
│   ├── asset-manifest.md                 # Visual asset inventory, provenance & status
│   ├── open-questions.md                 # [Gate 0 Takeoff] Rolling queue of >= 20 open questions for continuous discovery
│   ├── branding/                         # Client logos (SVG/PNG), brand guidelines, color palettes
│   ├── uploads/                          # Client-provided images, team headshots, PDFs, brochures
│   └── notes/                            # Raw notes, transcripts, or initial requirements from client
├── previous-site/                        # [Stage 0 - If Migration] Full working offline mirror (gitignored)
│   ├── index.html                        # Root homepage (functional offline mirror; works as it is when opened)
│   ├── sitemap.xml                       # Discovered legacy route index
│   ├── manifest.json                     # Complete inventory of legacy routes and harvested assets
│   ├── <path>/index.html                 # Per-page working snapshot (<path>/index.html, content.md, screenshot.png)
│   └── <source-path>/...                 # All assets (images, stylesheets, scripts, fonts, PDFs) in source locations
├── client-requirements/                  # [Optional] Recorded client requirement notes during in-place revisions
│   └── client-revision-notes.md          # Client revision feedback notes (revisions applied directly in-place)
├── project-docs/                         # Project pipeline management & tracking
│   ├── router-state.md                   # Live pipeline state, current stage, gate status & email logs
│   ├── page-checklist.md                 # [Stage 6] Master QA checklist (binary PASS/FAIL criteria)
│   ├── design-references/                # [Stage 2] Benchmark reference scrapes (page-type snapshots via site-fetch)
│   │   ├── sources.md                    # Ledger of all benchmark reference sites and captured page types
│   │   └── <domain>/                     # Scraped reference site assets (<domain>/<slug>/)
│   │       └── <slug>/                   # Per-page snapshot (<slug>/index.html, content.md, screenshot.png)
│   └── client-review/                    # Human-gated client review deliverables
│       ├── index.html                    # Root Review Portal (indexes all active gate deliverables)
│       ├── gate-1-tech-stack/
│       │   └── tech-stack.md             # [Stage 1] Tech stack specification & architecture
│       ├── gate-2-design-theory/
│       │   ├── design-theory.md          # [Stage 2] Visual direction, typography, colors, spatial system
│       │   ├── index.html                # Gate 2 concept comparison & review hub
│       │   ├── variation-1-<slug>/       # [Stage 2] Variation 1 (HTML + Tailwind CSS + jQuery)
│       │   │   └── index.html            # Deployed to public URL (e.g. GitHub Pages preview)
│       │   ├── variation-2-<slug>/       # [Stage 2] Variation 2 (HTML + Tailwind CSS + jQuery)
│       │   │   └── index.html
│       │   └── variation-3-<slug>/       # [Stage 2] Variation 3 (HTML + Tailwind CSS + jQuery)
│       │       └── index.html
│       ├── gate-3-page-list/
│       │   └── page-list.md              # [Stage 3] Master page inventory & route hierarchy (no page-design-notes.md)
│       ├── gate-4-seo-strategy/
│       │   └── seo-strategy.md           # [Stage 4] Keywords, metadata, JSON-LD & Search Console check
│       ├── gate-5-page-specs/            # [Stage 5] Single-Mode Markdown page blueprints
│       │   ├── layout-system.md          # Global shared components layout spec (ONLY ## Shared Components)
│       │   ├── home.md                   # Verbatim copywriting, responsive layouts & media slots
│       │   └── <page-slug>.md
│       ├── gate-5-cms-requirements/      # [Stage 5 - If CMS Enabled] CMS gap checklist & query prompt
│       │   ├── list.md                   # Blocking CMS checklist (must be resolved before Stage 6)
│       │   └── prompt.md                 # Read-only query prompt to run in client CMS IDE
│       ├── gate-5-cms-schema/            # [Stage 5 - If CMS Enabled] CMS collection schemas
│       │   └── cms-schema.md             # Data schemas, field types, relationships, validation rules
│       ├── gate-5-cms-content/           # [Stage 5 - If CMS Enabled] Seed content inventory & records
│       │   ├── index.md                  # Seed content inventory and collection map
│       │   └── <collection>-<slug>.json  # Authentic JSON seed records
│       └── gate-8-final-verification/
│           └── structure-audit.md        # [Stage 8] Automated deliverable compliance & code limits audit
└── site/                                 # [Stage 6 Scaffolding & Stage 7 Sub-Page Construction]
    ├── .env.example                      # Site environment template (Next.js variables, CMS API tokens)
    ├── package.json                      # Next.js App Router, Tailwind CSS, Lucide icons, GSAP
    ├── next.config.mjs                   # Next.js configuration (images, redirects, headers)
    ├── tailwind.config.js                # Design token mapping from Stage 2 Design Theory
    ├── postcss.config.js
    ├── site.manifest.json                # Project build manifest and page status registry
    ├── public/                           # Optimized production assets (fonts, images, icons, robots, sitemap)
    │   ├── favicon.ico
    │   ├── robots.txt
    │   ├── sitemap.xml
    │   ├── fonts/                        # Self-hosted variable fonts (no Google Fonts CDN links)
    │   ├── images/                       # Optimized WebP/AVIF images (via assets-optimizer)
    │   └── icons/                        # Optimized SVGs (via SVGO)
    ├── app/                              # Next.js App Router
    │   ├── layout.js                     # Root layout 
    │   ├── globals.css                   # Tailwind tokens, CSS variables, typography reset
    │   ├── page.js                       # [Stage 6] Home / Landing Page Showcase 
    │   ├── _components/                  # Section components ( // section: <id>)
    │   ├── <sub-page-slug>/              # [Stage 7] Sub-pages built sequentially (page.js + _components/)
    │   │   ├── page.js                   # 
    │   │   └── _components/              # 
    │   └── api/                          # Backend route handlers (revalidation webhooks, contact)
    ├── components/                       # Global shared components defined in layout-system.md
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── Navigation.jsx
    │   ├── MobileMenu.jsx
    │   └── ui/                           # UI primitives (Button, Card, Badge, Modal)
    └── lib/                              # Shared helper utilities (cms, utils, seo, animations)
```

---

## Core Technical Conventions

All website code is generated under the `site/` directory:

- **Framework:** Next.js App Router (`app/` directory, React Server Components by default).
- **Runtime Convention Discovery:** Package manager (`pnpm`, `npm`, `yarn`, `bun`), language (`JavaScript` or `TypeScript`), and directory structure are discovered dynamically from lockfiles and project configs at run time, never hard-coded.
- **Markdown Specifications, Scaffolding & Landing Page Pipeline:**
  - Stage 5 generates unified markdown `page-specs/<slug>/page.md` per slug combining benchmark reference mapping, layout blueprints, verbatim copywriting, asset references, and CMS schemas/seeds without HTML or mode toggles.
  - Stage 6 executes project scaffolding, generates the master QA checklist, builds the production foundation shell, emits `site/site.manifest.json`, and **fully constructs the Landing Page (`site/app/page.js`) for client showcase**. (No sub-page benchmarking needed for Gate 6).
  - Stage 7 incrementally constructs remaining sub-pages with benchmark reference inspection in Step 1, per-page review, and binary QA sign-off.
- **Strict Line Limits & Markers:**
  - Thin page server component (`page.js`): **<= 80 lines**.
  - Section component (`_components/*.js`): **<= 250 lines** (hard limit 300).
  - Utility, config, and content files: **<= 500 lines**.
  - Every section component must open with `// section: <id>` and render `data-section="<id>"`.
- **Pre-Launch Guard:** `robots: { index: false, follow: false }` metadata, dynamic `robots.js`, and visual `<PreviewBanner />` active by default until production launch checklist sign-off.
- **Shared Component Promotion Rule (2+ Pages):** Any component reused across **2+ pages** lives in flat `site/components/`. Page-local components live in `_components/` within their route.
- **Repeating Cards & Component Styling (@apply Rule):** When repeating card components (features, metrics, testimonials, team grids) are ported into the Next.js App Router codebase (`site/app/globals.css`), define them using the Tailwind **`@apply`** rule within `@layer components` (e.g. `@layer components { .feature-card { @apply bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/40; } }`). This keeps JSX section components clean, prevents repeating multi-line utility strings, and strictly honors the <= 250 line limit.
- **Scoped AGENTS.md Guidance:** Scaffold `site/AGENTS.md` (<=150 lines) and 4 scoped files: `site/app/AGENTS.md`, `site/components/AGENTS.md`, `site/lib/AGENTS.md`, and `site/content/AGENTS.md`, each with fixed H2 headings: `## Architecture`, `## Conventions`, `## Anti-patterns`, `## Commands`.

For complete coding rules, consult [references/gate-6-scaffolding/code-conventions.md](references/gate-6-scaffolding/code-conventions.md).

---

## Scaffolding Architecture & Animation Skills

Before executing Stage 6 project scaffolding:
1. **CMS Blocking Guard:** Confirm zero unresolved items exist in `project-docs/client-review/gate-5-cms-requirements/list.md`. Scaffolding is blocked until all CMS requirements are resolved.
2. **File Size & Token Efficiency:** Scaffolding code must be as small as possible without limiting features of the page.
3. **Environment Template:** Scaffold `site/.env.example` with required site variables (`SERVER_URL`, `CMS_SITE_KEY`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PREVIEW_GUARD`).
4. **GSAP Animation Suite & Motion Tiering:**
   - If client selected `motion: disabled`:
     - Do **NOT** load GSAP skills.
     - Do **NOT** install `gsap` or `@gsap/react` in `site/package.json`.
     - Configure `site/lib/motion.js` with pure CSS / Tailwind animation tokens.
   - If client selected `low`, `medium`, `high`, `max`, or `ultra`:
     - Pre-load approved GSAP skills:
```bash
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
```
     - For tier-specific implementations (e.g. pinned horizontal tracks, SplitText character reveals, 3D perspective card tilt, and WebGL Three.js orchestration), consult [references/gate-6-scaffolding/gsap-animation-tiers.md](references/gate-6-scaffolding/gsap-animation-tiers.md).

For complete scaffolding instructions, consult [references/gate-6-scaffolding/SKILL.md](references/gate-6-scaffolding/SKILL.md).

---

## Taste Standards & Visual Excellence

Aesthetic polish is mandatory for Stages 2 and 8:
- **Taste Skill Check:** Verify if `frontend-design` is available in your agent environment. If missing, attempt installation per [references/gate-2-design-theory/SKILL.md](references/gate-2-design-theory/SKILL.md):
  ```bash
  DISABLE_TELEMETRY=1 npx skills add anthropics/skills --skill frontend-design
  ```
  If unavailable, apply the documented built-in taste rules.
- **Client Visual Review & Variations at Gate 2:** Capture reference benchmark sites into `project-docs/design-references/<domain>/<slug>/` across key page types (Home, About, Work, etc.) as analysis inputs only using `node skills/create-nww-website/scripts/reference-capture/index.js`. Extract abstract principles and build $N$ original full-page landing page variation previews in `project-docs/client-review/gate-2-design-theory/<project-slug>-v[1..N]/index.html` using **HTML + Tailwind CSS + jQuery** (to save future tokens) across the 9 dimensions per [references/gate-2-design-theory/design-variations.md](references/gate-2-design-theory/design-variations.md). Run the pre-presentation similarity audit (`_checks/similarity-audit.md`) confirming distance rules (>= 4 dimensions divergent from nearest references, <= 3 dimensions shared between variations, zero shared classes/IDs/assets, word overlap <= 5 words).
- **Repeating Cards Normal CSS Rule (Token Optimization):** In Gate 2 HTML + Tailwind CSS + jQuery variations, whenever components such as cards, grid items, or list tiles repeat (e.g. 3–6 feature cards, service boxes, metric counters), **use normal CSS** in a `<style>` block (e.g. `.feature-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; transition: transform 0.25s ease; }`) instead of duplicating 20+ Tailwind utility classes inline on every single repeated element. This saves tokens, keeps HTML clean, and prevents bloated previews. When that same card structure is ported to the Next.js `site/` codebase, convert it using Tailwind's **`@apply`** rule in `site/app/globals.css`.
- **Public Deployment Required (No Prompt Copying):** Gate 2 variations are sent to the client via a mandatory public deployment (e.g. GitHub Pages). We do NOT include the "copy the prompt" or "Copy My Decision" button section. Forwarding localhost deployment links to the client is strictly forbidden.
- **In-Place Revisions:** If client requests revisions, edit existing files in-place; do NOT create extra markdown files. Save requirement notes in `client-requirements/`.
- **Aesthetic Principles:**
  - Curated semantic tokens with refined contrast; avoid flat or generic palettes.
  - Generous whitespace and modular typography hierarchy using `next/font`.
  - Motion discipline: sections default to `static by design`; at most ONE section per page may be the "bold moment"; ban uniform fade-and-slide-up animations on every section.
  - Never animate layout properties (`width`, `height`, `margin`); use GPU-accelerated `transform` and `opacity`.

For complete design guidelines, consult [references/gate-2-design-theory/SKILL.md](references/gate-2-design-theory/SKILL.md) and [references/gate-2-design-theory/design-variations.md](references/gate-2-design-theory/design-variations.md).

Keep reusable Gate 2 tooling in this skill's `scripts/client-review/`, not in a project-level tools folder. The bundled `preview.mjs`, `verify.mjs`, and `fetch-fonts.mjs` accept a project root. Note: Playwright-powered companion tools (`reference-capture`, `verify.mjs`) require Chromium installed via `npx playwright install chromium`. Keep project-specific HTML, CSS, font choices, and assets in `project-docs/client-review/`; put generated Gate 2 QA reports, similarity audits, and working notes in `gate-2-design-theory/_checks/`. See the design reference guide for commands and compatibility details.

---

## SEO Architecture & Tool Connections

Technical SEO standards are enforced across Stage 4 (SEO Strategy) and Stage 8 (Pre-Launch SEO Audit):
- **Upfront Client Tool Inquiry:** Before starting Stage 4, ask the client for any tool connections (Google Search Console, Google Analytics 4, Ahrefs, SEMrush, PageSpeed API). Placeholders are documented in root `.env.example`.
- **Specialized SEO Skills:** Load approved specialized SEO skills:
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill ai-seo
  ```
- **SEO Tool Library & Truth in Auditing:** Before auditing, run the Tool Availability Check per [references/gate-4-seo-strategy/seo-tool-library.md](references/gate-4-seo-strategy/seo-tool-library.md) against [references/gate-4-seo-strategy/seo-tool-registry.json](references/gate-4-seo-strategy/seo-tool-registry.json). Distinguish connected APIs, user export files, and manual checks without pretending to execute disconnected tools.
- **Companion CLI Utilities:**
  - PageSpeed Insights & CWV audit: `node skills/create-nww-website/scripts/seo/pagespeed-check.js --url <url>`
  - Robots & Sitemap syntax audit: `node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --url <url>`

For complete SEO specifications, consult [references/gate-4-seo-strategy/SKILL.md](references/gate-4-seo-strategy/SKILL.md) and [references/gate-4-seo-strategy/seo-tool-library.md](references/gate-4-seo-strategy/seo-tool-library.md).

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

For complete CMS integration details, consult [references/gate-5-page-specs/cms-architecture.md](references/gate-5-page-specs/cms-architecture.md).

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

For complete media processing steps, consult [references/gate-6-scaffolding/asset-optimization.md](references/gate-6-scaffolding/asset-optimization.md).

---

## Stock Image Sourcing

When stock images are needed for a project, every slot must come from either a client-provided asset (always first priority) or a licensed stock image fetched from one of three approved providers — Pixabay, Pexels, or Unsplash — using the agency's API key. Images are downloaded to `assets-source/` and processed through the optimizer (Unsplash images are hotlinked instead). Full provenance is recorded in `project-docs/stock-provenance.json` and a `/credits` page is generated in Stage 6.

Read [references/gate-5-page-specs/stock-image-sourcing.md](references/gate-5-page-specs/stock-image-sourcing.md) when Stage 0 reveals stock images are needed or during Stage 5 when a `page.md` asset slot lacks a client-provided asset. That file covers the intake branch, provider rules, hard exclusions, query construction, selection criteria, provenance manifest schema, attribution requirements, credential handling, and failure behavior.

---

## Detailed Reference Index

For deep-dive instructions, consult the matching reference document:

1. [Pipeline Stages & State Machine](references/gate-0-intake/pipeline-stages.md) — 9-stage sequential workflow (Stages 0 through 8), approval gates, and router state tracking.
2. [Client Discovery Questionnaire](references/gate-0-intake/client-questionnaire.md) — 7-batch structured intake questionnaire, branching rules, and site brief template.
3. [Design Theory & Visual System](references/gate-2-design-theory/SKILL.md) — Color palette, modular type scale, voice & tone, and dual motion tokens.
4. [Design Variations & Similarity Audit](references/gate-2-design-theory/design-variations.md) — 9-dimension variation framework, anti-copy distance rules, similarity audit protocol, and decision capture.
5. [Page List & Sitemap Architecture](references/gate-3-page-list/SKILL.md) — Master build tracker checklist, URL routes, and zero unstated markdowns.
6. [SEO Strategy & Structured Data](references/gate-4-seo-strategy/SKILL.md) — Pre-stage skills, SEO tool availability checks, keywords, single H1, JSON-LD schemas, sitemaps, robots, and redirects.
7. [Page Specifications & CMS Schema](references/gate-5-page-specs/SKILL.md) — Unified markdown specifications (`page-specs/<slug>/page.md`), section blueprints, verbatim copywriting, cross-page layout system, and CMS data schemas/seeds.
8. [Codebase Scaffolding, Foundation & Landing Page Showcase](references/gate-6-scaffolding/SKILL.md) — Next.js initialization in `site/`, QA checklist emission, foundation shell, optimizer run, scoped AGENTS.md, check scripts, route mapping (`site.manifest.json`), and **full Landing Page showcase construction**.
9. [Asset Optimization & Media Pipeline](references/gate-6-scaffolding/asset-optimization.md) — Optimizer execution, manifest schema, budgets, and `ResponsiveImage.js`.
10. [Page Checklists & Taste Verification](references/gate-6-scaffolding/page-checklist.md) — Master static checklist template, in-place revisions, and `checklist-state.md`.
11. [Code Conventions & Agent Rules](references/gate-6-scaffolding/code-conventions.md) — App Router standards, file line limits, scoped AGENTS.md, and check scripts.
12. [Sub-Page Build Loop](references/gate-7-sub-pages/SKILL.md) — Incremental sub-page build pipeline (Stage 7), Gates 7a & 7b, GSAP integration, and self-critique.
13. [CMS Architecture & Integration](references/gate-5-page-specs/cms-architecture.md) — NWW CMS client, authenticated reads, revalidation route, and form endpoints.
14. [Stock Image Sourcing](references/gate-5-page-specs/stock-image-sourcing.md) — Two-source rule, approved providers (Pixabay, Pexels, Unsplash), intake branch, provenance manifest, attribution output, and failure handling.
15. [SEO Tool Library & Audit Selection Guide](references/gate-4-seo-strategy/seo-tool-library.md) — Tool availability check protocol, 19-tool structured registry, stage-by-stage selection logic, and Next.js audit recommendations.
16. [CMS Models & Modules Catalog](references/gate-5-page-specs/cms/models/index.md) — Complete 25-module registry, Mongoose schemas, endpoint matrices, and seeder JSON structures.
17. [On-Demand ISR Revalidation & `notifySite`](references/gate-5-page-specs/cms/revalidation-webhook.md) — Backend webhook implementation guide, `Website` schema additions, and dashboard form integration.
18. [GSAP Animation Tiers & Creative Motion Reference](references/gate-6-scaffolding/gsap-animation-tiers.md) — 6-tier motion system (disabled, low, medium, high, max, ultra), conditional skill loading, Next.js isolation, and production code examples.


