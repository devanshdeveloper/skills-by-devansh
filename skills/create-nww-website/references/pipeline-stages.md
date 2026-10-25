# Pipeline Stages & State Machine

The website creation workflow follows a strict 9-stage sequential pipeline with explicit human approval gates between stages. No stage may begin until the preceding stage has received explicit human approval.

---

## State Machine & Tracking (`project-docs/router-state.md`)

All progress is tracked in `project-docs/router-state.md`. The agent must initialize this file at Stage 1 and update it before and after every stage and gate.

### State Schema

```markdown
# Pipeline Router State

**Project Name:** [Project Name]  
**CMS Mode:** [none | cms]  
**Current Stage:** [0 through 8]  
**Current Gate:** [Gate 0 through Gate 8b]  
**Status:** [in_progress | awaiting_approval | approved | blocked]  
**Webhook Status:** [pending | built-on-branch | deployed | verified]  
**Last Updated:** [YYYY-MM-DD HH:MM]

## Stage Progress

- [ ] Stage 0: Client Intake Check (Gate 0)
- [ ] Stage 1: Tech Stack Specification (Gate 1)
- [ ] Stage 2: Design Theory & Variations (Gate 2)
- [ ] Stage 3: Page List & Information Architecture (Gate 3)
- [ ] Stage 4: SEO Strategy (Gate 4)
- [ ] Stage 5: Page Specifications & CMS Schema (Gate 5)
- [ ] Stage 6: Codebase Scaffolding, Foundation Build & Landing Page Showcase (Gate 6)
- [ ] Stage 7: Sub-Page Build Loop (Per-Page Gates 7a & 7b)
- [ ] Stage 8: Final Verification & Handover (Gates 8a & 8b)

## Per-Page Build Tracker

| Page Slug | Page Specification | Scaffolding | Build State | QA Checklist |
|---|---|---|---|---|
| `home` | approved | approved | approved (Stage 6) | approved |
| `about` | approved | scaffolded | pending (Stage 7) | pending |

## Active Blockers / Open Questions
- None.
```

---

## The 9 Stages in Detail

### Stage 0: Intake Check
- **Goal:** Execute the start-up activation protocol from [client-questionnaire.md](client-questionnaire.md):
  1. Ask the user in the beginning whether they want client milestone approval emails dispatched at each stage.
  2. Inspect `client-context/client-answers.md` (or prefill from user prompt notes) to compile the intake brief.
  3. If site migration (`build_origin: migration`), create `previous-site/` folder to archive previous site content after the new site is built (screenshots, stripped markdown, full HTML).
  4. Generate root `.env.example` with credential placeholders for any external connection (SEO tools, client email sending).
- **Inputs:** User prompt, `client-context/` files, or interactive questionnaire responses.
- **Outputs:** `client-context/client-answers.md`, `.env.example`, and `previous-site/` (if migration).
- **Gate 0:** Human reviews and confirms the intake summary and CMS mode selection (`none` or `cms`). The agent records human sign-off in `project-docs/router-state.md` (`Gate 0: Intake Confirmed`).

### Stage 1: Tech Stack Specification
- **Goal:** Author `project-docs/client-review/gate-1-tech-stack/tech-stack.md` defining the stack, pre-filling defaults and asking only about deviations. Stack is Next.js App Router, Tailwind CSS, JavaScript-only (`.js`, `.jsx`), `pnpm`, container standalone output, Lucide icons, GSAP, and image mode `pre-optimized`.
- **Inputs:** `client-context/client-answers.md`.
- **Outputs:** `project-docs/client-review/gate-1-tech-stack/tech-stack.md` and initial `project-docs/router-state.md`.
- **Gate 1:** Internal developer confirms stack choices and framework parameters.

### Stage 2: Design Theory & Variations
- **Goal:** Author design principles in `project-docs/client-review/gate-2-design-theory/design-theory.md`, fetch reference sites into `project-docs/design-references/`, build $N$ original landing page variation previews in `project-docs/client-review/gate-2-design-theory/<variation-slug>/index.html` using **HTML + Tailwind CSS + jQuery** (to save future tokens), pass similarity audit distance rules (`_checks/similarity-audit.md`), and compile review hub at `project-docs/client-review/gate-2-design-theory/index.html`.
- **Client Presentation & Public Deployment:** Gate 2 variations are sent to the client. We do NOT include the "copy the prompt" or "Copy My Decision" prompt sections. We ALWAYS require a live public deployment (e.g. GitHub Pages via workflow) to forward to the client; localhost deployment URLs are strictly forbidden for client forwarding.
- **Inputs:** `client-context/client-answers.md`.
- **Outputs:** `project-docs/client-review/gate-2-design-theory/design-theory.md`, `project-docs/design-references/`, variation HTML files, `_checks/similarity-audit.md`, and review hub (`project-docs/client-review/gate-2-design-theory/index.html`).
- **Gate 2:** Client reviews visual variations via the public review deployment and selects one. The agent records human selection in `project-docs/router-state.md` (`Gate 2: Variation <slug> Selected`).

### Stage 3: Page List & Sitemap
- **Goal:** Author `project-docs/client-review/gate-3-page-list/page-list.md`. Map every URL route, title, primary purpose, visual anchors, and shared component candidates.
- **Rules:** Do NOT generate `page-design-notes.md` (file generation deleted). Do NOT create any additional unstated markdown files.
- **Inputs:** `client-context/client-answers.md`, approved design theory.
- **Outputs:** `project-docs/client-review/gate-3-page-list/page-list.md`.
- **Gate 3:** Client / lead developer confirms the sitemap, URL route hierarchy, and page inventory.

### Stage 4: SEO Strategy
- **Goal:** **Ask the client for any tool connections** (Google Search Console, Ahrefs, SEMrush, Google Analytics, PageSpeed API) before proceeding. Pre-load approved SEO skills, run Tool Availability Check per [references/seo/seo-tool-library.md](seo/seo-tool-library.md), and author `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` covering keyword targets, JSON-LD schemas, sitemap, robots, and 301 redirects.
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill ai-seo
  ```
- **Inputs:** Approved `page-list.md`, competitor references, client intake answers.
- **Outputs:** `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`.
- **Gate 4:** Target keywords confirmed with the client in plain text; technical JSON-LD schemas, canonical rules, and redirect maps approved by the internal developer.

### Stage 5: Page Specifications & CMS Schema
- **Goal:** Author comprehensive markdown specifications (`page-specs/<slug>/page.md`) unifying responsive layout blueprints, verbatim copywriting, and media asset slots for every page. Define shared units in `page-specs/_shared/*.md`, multi-page components in `project-docs/client-review/gate-5-page-specs/layout-system.md` (containing ONLY one section: `## Shared Components`), and log sourced stock images in `project-docs/stock-provenance.json` (if stock is authorized).
- **Single Mode Enforced:** Gate 5 operates strictly in ONE mode: **Markdown only**. Remove all Next.js and HTML preview modes in Gate 5.
- **Incomplete CMS Context Protocol:** If CMS context seems incomplete, create `project-docs/client-review/gate-5-cms-requirements/list.md` and do NOT proceed to CMS schema or content until this is resolved. Hand over a strictly READ-ONLY prompt in `project-docs/client-review/gate-5-cms-requirements/prompt.md` for the user to paste into their CMS agentic IDE to fetch answers (no write prompts).
- **Deliverables:**
  - `page-specs/<slug>/page.md` for every page in `page-list.md`.
  - `page-specs/_shared/<component-slug>.md` (nav, footer, site settings) and `page-specs/_shared/brand-assets.md`.
  - `project-docs/client-review/gate-5-page-specs/layout-system.md` (contains ONLY section: `## Shared Components`).
  - `project-docs/stock-provenance.json` (if stock imagery is sourced).
  - If `cms: cms` and requirements resolved: `project-docs/client-review/gate-5-cms-schema/cms-schema.md`, `project-docs/client-review/gate-5-cms-requirements/cms-backend-requirements.md`, `project-docs/client-review/gate-5-cms-content/blog-<slug>.json`, `index.md`.
- **Banned Markdown Files:** Do NOT generate `project-docs/migration-inventory.md`, `project-docs/editor-handover-outline.md`, `project-docs/context-update.md`, `project-docs/cms-foundation-tasks.md`, or any unstated markdown files.
- **Gate 5:** Client / lead developer reviews and approves the unified page specifications (layout, copy, asset slots) and CMS data models/seeds. Progress is recorded in `project-docs/router-state.md` (`Gate 5: Page Specifications & CMS Schema Approved`).

### Stage 6: Codebase Scaffolding, Foundation Build & Landing Page Showcase
- **Goal:** Pre-load approved GSAP animation skills, generate master QA checklist, build production foundation shell, scaffold all application routes, create `site/.env.example`, and **fully construct the Landing Page (`site/app/page.js` + `_components/`) for client showcase**.
- **Specialized Skills Pre-Load:** Pre-load approved GSAP animation suite:
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
  ```
- **Blocking Guard:** Do NOT proceed to scaffolding if there are any unresolved CMS requirements in `project-docs/client-review/gate-5-cms-requirements/list.md`.
- **Scaffolding File Size & Token Discipline:** Any generated file must not limit the file size of the scaffolding Next.js site; code should be as small as possible while preserving all features of the page (thin `page.js` <= 80 lines, section components <= 250 lines).
- **Inputs:** Approved Stage 5 `page.md` files, `page-specs/_shared/*.md`, `project-docs/client-review/gate-5-page-specs/layout-system.md`, `project-docs/client-review/gate-1-tech-stack/tech-stack.md`, and CMS schema (if active).
- **Execution & Deliverables:**
  1. **QA Artifacts:** Emit master static checklist `project-docs/page-checklist.md`. (Do NOT create `theory-revisions.md`; make revisions directly to existing files).
  2. **Codebase Scaffolding:** Execute `pnpm create next-app site --disable-git` matching runtime conventions.
  3. **Site Env Template:** Generate `site/.env.example` with all variables needed by the scaffolding (`SERVER_URL`, `CMS_SITE_KEY`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PREVIEW_GUARD`).
  4. **Foundation Shell:** Wire theme tokens into `site/app/globals.css` and `site/styles/tokens.css`, export motion tokens to `site/lib/motion.js`, install `site/components/ResponsiveImage.js`, and assemble `Nav.js` and `Footer.js` into root `layout.js`.
  5. **Media & Tooling:** Run asset optimizer (`assets-source/` to `site/public/assets/`), write `site/assets-optimize.config.md`, scaffold `site/AGENTS.md` + 4 scoped AGENTS.md, and add check scripts (`pnpm check:all`).
  6. **CMS & Credits:** Wire CMS client data layer (`site/lib/cms/`) if CMS active; generate `site/app/credits/page.js` if stock images used.
  7. **Route Mapping:** Scaffold thin routes and section components with `data-section="<id>"` markers, decoupled `site/content/`, and emit `site/site.manifest.json`.
  8. **Landing Page Showcase Construction:** Fully implement, style, and animate the Landing Page (`site/app/page.js` + `site/app/_components/`) with verbatim copy and subtle GSAP motion.
- **Verification:** Run `node skills/create-nww-website/scripts/client-review/verify-nextjs.mjs .` and execute `pnpm build` in `site/` to ensure zero compilation or route errors.
- **Gate 6:** Client reviews the live interactive Landing Page showcase and approves codebase foundation. Progress is recorded in `project-docs/router-state.md` (`Gate 6: Scaffolding, Foundation & Landing Page Approved`).

### Stage 7: Sub-Page Build Loop (Per-Page Sub-Pipeline)
- **Goal:** Incrementally build every remaining page from `project-docs/client-review/gate-3-page-list/page-list.md` (e.g. `about`, `services`, `contact`, `blog`) strictly one by one in order. Since the Landing Page was already built in Stage 6 and all route stubs exist in `site.manifest.json`, the agent modifies only the target sub-page components and content modules.
- **Sub-Pipeline per sub-page:**
  1. **Build:** Implement/refine thin `site/app/<route>/page.js` (<=80 lines) and section components in `site/app/<route>/_components/` (<=250 lines). Follow verbatim copy, exact tokens, and ensure `data-section="<id>"` markers match `page.md`.
  2. **Self-Critique:** Agent tests against `project-docs/page-checklist.md`, runs `pnpm check:structure` and `pnpm check:assets`, logs per-page verification to `page-specs/<slug>/checklist-state.md`, and records results in `site/build-log.md`.
  3. **Gate 7a (Build Review):** Human inspects built page structure, responsive behavior, component line counts, and placeholder tags.
  4. **Gate 7b (Binary QA Sign-Off):** Human verifies passing binary QA checks from `checklist-state.md` and gives final approval. Mark page completed in `project-docs/client-review/gate-3-page-list/page-list.md` (`- [x] Page Name`).
- **Repeat** until all sub-pages in `page-list.md` are approved.

### Stage 8: Final Verification & Handover
- **Goal:** Execute full production audit and prepare handover:
  - Run `node scripts/structure-audit/index.js` to audit all deliverables, verify documentation completeness, check strict line limits, and generate `project-docs/client-review/gate-8-final-verification/structure-audit.md`.
  - Conduct Pre-Launch SEO Audit on production build (`pnpm build && pnpm start`): metadata, JSON-LD, 301 redirects, robots.txt, sitemap. Validate using companion utilities: `node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --url http://localhost:3000` and `node skills/create-nww-website/scripts/seo/pagespeed-check.js --url http://localhost:3000`.
  - Verify CMS checks (if CMS active): unpublished posts excluded, sanitizer strips malicious HTML, webhook responds within 5s, `REVALIDATE_SECRET` and `CMS_SITE_KEY` not leaked.
  - Verify stock audit: no provider API keys in site build or bundles; `/credits` page renders cleanly; Unsplash images include proper attribution; `stock-provenance.json` backed up with assets.
  - Deactivate pre-launch guard per `project-docs/launch-checklist.md` (`NEXT_PUBLIC_PREVIEW_GUARD="false"`).
  - Run `pnpm check:all`.
  - **Gate 8a:** Human reviews and approves proposed cross-page or audit fixes before applying them to approved pages.
  - Apply fixes, re-verify production build, and assemble Client Handover (AGENTS.md notes, CMS admin guide, asset backup location in `assets-source/`).
  - **Gate 8b (Deployment Sign-Off):** Human gives final deployment and handover sign-off. When deploying the Next.js site to Vercel, invoke the official Vercel deployment agent skill:
    ```bash
    DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill deploy-to-vercel
    ```
  - Send milestone notification email to client via `node scripts/client-notify/index.js` containing the public production URL.

---

## Gating Rules for Agents

1. **Never auto-advance:** When a stage's artifacts are generated, display a concise summary to the user, present key decisions, and halt until human sign-off is granted.
2. **Approval standard:** Only an affirmative reply ("approved", "proceed") clears a gate. Silence or clarifying questions do not constitute approval.
3. **Atomic checkpoints:** Update `project-docs/router-state.md` immediately upon passing each gate.
4. **Client Notification Prompt:** At every gate sign-off, ask the user: *"Would you like to notify the client for this milestone? Run `node scripts/client-notify/index.js` to preview and send upon approval."*
5. **Always Public Deployments for Client:** All links sent to the client (Gate 2 variations via GitHub Pages, Next.js site via Vercel) MUST be public HTTPS deployments. Never forward localhost URLs to the client.
6. **In-Place Revisions Discipline:** If a client requests revisions at any gate, do NOT create an extra markdown file (e.g. no `theory-revisions.md`). Make modifications directly to the existing deliverable document. If an important client requirement note needs to be recorded, create `client-requirements/` folder and place the note there.
7. **Client Context Folder:** Store all client-provided materials, briefs, and inputs in `client-context/` (e.g. `client-context/client-answers.md`).
8. **Client Review Gate Rule (Markdown is Internal):** No client-facing gate ever asks the client to open, read, or approve raw `.md` files. Every client review gate (Gates 0, 2, 3, 5, 6, 7a, 8b) presents HTML previews, live public URLs, or plain-language summaries. All `.md` files are strictly internal developer artifacts.

---

## Canonical Project File Structure Specification

Every client website project created through this pipeline must strictly follow this locked file tree:

```text
<client-project-root>/
├── .env.example                          # [Stage 0] Root environment template (SEO tools, Resend email keys)
├── client-context/                       # [Stage 0] Dedicated repository for all raw client inputs & assets
│   ├── client-answers.md                 # Complete compiled Stage 0 discovery & intake brief
│   ├── branding/                         # Client logos (SVG/PNG), brand guidelines, color palettes
│   ├── uploads/                          # Client-provided images, team headshots, PDFs, brochures
│   └── notes/                            # Raw notes, transcripts, or initial requirements from client
├── previous-site/                        # [Stage 0 - If Migration] Old website archive & migration data
│   ├── sitemap-legacy.xml                # Crawled URLs from existing website for 301 redirects
│   ├── content-export/                   # Scraped or exported legacy blog posts, pages, and metadata
│   └── media/                            # Downloaded legacy media assets for optimization
├── client-requirements/                  # [Optional] Recorded client requirement notes during in-place revisions
│   └── client-revision-notes.md          # Client revision feedback notes (revisions applied directly in-place)
├── project-docs/                         # Project pipeline management & tracking
│   ├── router-state.md                   # Live pipeline state, current stage, gate status & email logs
│   ├── page-checklist.md                 # [Stage 6] Master QA checklist (binary PASS/FAIL criteria)
│   ├── design-references/                # [Stage 2] Benchmark reference scrapes (landing pages only)
│   │   ├── sources.md                    # Ledger of all benchmark reference sites analyzed
│   │   └── <domain>/                     # Scraped reference site assets (internal visual analysis only)
│   │       ├── page.html
│   │       ├── content.md
│   │       ├── screenshot-full-1440.png
│   │       └── capture.json
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
    │   ├── layout.js                     # Root layout (< 80 lines)
    │   ├── globals.css                   # Tailwind tokens, CSS variables, typography reset
    │   ├── page.js                       # [Stage 6] Home / Landing Page Showcase (< 80 lines)
    │   ├── _components/                  # Section components (< 250 lines, // section: <id>)
    │   ├── <sub-page-slug>/              # [Stage 7] Sub-pages built sequentially (page.js + _components/)
    │   │   ├── page.js                   # (< 80 lines)
    │   │   └── _components/              # (< 250 lines)
    │   └── api/                          # Backend route handlers (revalidation webhooks, contact)
    ├── components/                       # Global shared components defined in layout-system.md
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── Navigation.jsx
    │   ├── MobileMenu.jsx
    │   └── ui/                           # UI primitives (< 250 lines each: Button, Card, Badge, Modal)
    └── lib/                              # Shared helper utilities (< 500 lines each: cms, utils, seo, animations)
```
