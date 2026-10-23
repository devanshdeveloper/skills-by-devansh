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
- **Goal:** Execute the start-up activation protocol from [client-questionnaire.md](client-questionnaire.md): check for an existing brief, prefill from prompt notes, or present the 7-batch questionnaire to compile `project-docs/client-answers.md`.
- **Inputs:** User prompt, local context files, or interactive questionnaire responses.
- **Outputs:** `project-docs/client-answers.md`.
- **Gate 0:** Human reviews and confirms the intake summary and CMS mode selection (`none` or `cms`). The agent records human sign-off in `project-docs/router-state.md` (`Gate 0: Intake Confirmed`).

### Stage 1: Tech Stack Specification
- **Goal:** Author `project-docs/tech-stack.md` defining the stack, pre-filling defaults and asking only about deviations. Stack is Next.js App Router, Tailwind CSS, JavaScript-only (`.js`, `.jsx`), `pnpm`, container standalone output, Lucide icons, GSAP, and image mode `pre-optimized`.
- **Inputs:** `project-docs/client-answers.md`.
- **Outputs:** `project-docs/tech-stack.md` and initial `project-docs/router-state.md`.
- **Gate 1:** Internal developer confirms stack choices and framework parameters.

### Stage 2: Design Theory & Variations
- **Goal:** Author design principles in `project-docs/design-theory.md`, fetch reference sites into `project-docs/design-references/`, build $N$ original landing page variation previews in `project-docs/client-review/gate-2-design-theory/<variation-slug>/index.html`, pass similarity audit distance rules (`_checks/similarity-audit.md`), and compile review portal via `scripts/client-review/index.js`.
- **Inputs:** `project-docs/client-answers.md`, `project-docs/tech-stack.md`.
- **Outputs:** `project-docs/design-theory.md`, `project-docs/design-references/`, variation HTML pages, `_checks/similarity-audit.md`, and review portal (`project-docs/client-review/index.html`).
- **Gate 2:** Client reviews visual variations via review portal and selects one. The agent records human selection in `project-docs/router-state.md` (`Gate 2: Variation <slug> Selected`).

### Stage 3: Page List & Sitemap
- **Goal:** Author `project-docs/page-list.md` and `page-design-notes.md`. Map every URL route, title, primary purpose, visual anchors, and shared component candidates.
- **Inputs:** `project-docs/client-answers.md`, `project-docs/design-theory.md`.
- **Outputs:** `project-docs/page-list.md`, `page-design-notes.md`.
- **Gate 3:** Client / lead developer confirms the sitemap, URL route hierarchy, and page inventory.

### Stage 4: SEO Strategy
- **Goal:** Pre-load SEO skills, run Tool Availability Check per [references/seo/seo-tool-library.md](seo/seo-tool-library.md), and author `project-docs/seo-strategy.md` covering keyword targets, JSON-LD schemas, sitemap, robots, and 301 redirects.
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
  DISABLE_TELEMETRY=1 npx skills add https://github.com/coreyhaines31/marketingskills --skill ai-seo
  DISABLE_TELEMETRY=1 npx skills add https://github.com/anthropics/knowledge-work-plugins --skill seo-audit
  ```
- **Inputs:** Approved `page-list.md`, competitor references, client intake answers.
- **Outputs:** `project-docs/seo-strategy.md`.
- **Gate 4:** Target keywords confirmed with the client in plain text; technical JSON-LD schemas, canonical rules, and redirect maps approved by the internal developer.

### Stage 5: Page Specifications & CMS Schema
- **Goal:** Author comprehensive markdown specifications (`page-specs/<slug>/page.md`) unifying responsive layout blueprints, verbatim copywriting, and media asset slots for every page. Define shared units in `page-specs/_shared/*.md`, multi-page components in `project-docs/layout-system.md`, and log sourced stock images in `project-docs/stock-provenance.json` (if stock is authorized). If `cms: cms` is active, author the complete CMS schema mapping (`cms-schema.md`), backend requirement spec (`cms-backend-requirements.md`), seed content files (`cms-seed/blog-<slug>.json`, `index.md`), foundation tasks, and editor handover outline.
- **Inputs:** `project-docs/design-theory.md` (and confirmed Gate 2 variation), `project-docs/page-list.md`, `project-docs/seo-strategy.md`, and CMS intake answers.
- **Preconditions:** The chosen Gate 2 design variation must exist in `project-docs/router-state.md` and `project-docs/design-theory.md`. Stage 5 operates in a single mode: Markdown only. No code or HTML preview files are generated.
- **Outputs:**
  - `page-specs/<slug>/page.md` for every page in `page-list.md`.
  - `page-specs/_shared/<component-slug>.md` (nav, footer, site settings) and `page-specs/_shared/brand-assets.md`.
  - `project-docs/layout-system.md` (shared 2+ page system components: Nav, Footer, CTABanner, ResponsiveImage).
  - `project-docs/stock-provenance.json` (if stock imagery is sourced via `scripts/stock-fetch/index.js`).
  - If `cms: cms`: `project-docs/cms-schema.md`, `project-docs/cms-backend-requirements.md`, `project-docs/cms-seed/`, `project-docs/cms-foundation-tasks.md`, `project-docs/editor-handover-outline.md`.
- **Gate 5:** Client / lead developer reviews and approves the unified page specifications (layout, copy, asset slots) and CMS data models/seeds. Progress is recorded in `project-docs/router-state.md` (`Gate 5: Page Specifications & CMS Schema Approved`).

### Stage 6: Codebase Scaffolding, Foundation Build & Landing Page Showcase
- **Goal:** Pre-load 10 specialized architecture skills, generate the master QA checklist, build the production foundation shell, scaffold all application routes, and **fully construct the Landing Page (`site/app/page.js` + `_components/`) for client showcase**.
- **Specialized Skills Pre-Load:** Before scaffolding, the agent MUST load the 10 specialized architecture & GSAP skills:
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/openreview --skill next-best-practices
  DISABLE_TELEMETRY=1 npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill design-system
  DISABLE_TELEMETRY=1 npx skills add https://github.com/heygen-com/hyperframes --skill gsap
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
  ```
- **Inputs:** Approved Stage 5 `page.md` files, `page-specs/_shared/*.md`, `project-docs/layout-system.md`, `project-docs/tech-stack.md`, and CMS schema (if active).
- **Execution & Deliverables:**
  1. **QA Artifacts:** Emit `project-docs/theory-revisions.md` and master static checklist `project-docs/page-checklist.md`.
  2. **Codebase Scaffolding:** Execute `pnpm create next-app site --disable-git` matching runtime conventions.
  3. **Foundation Shell:** Wire theme tokens into `site/app/globals.css`, export motion tokens to `site/lib/motion.js`, install `site/components/ResponsiveImage.js`, and assemble `Nav.js` and `Footer.js` into root `layout.js`.
  4. **Media & Tooling:** Run asset optimizer (`assets-source/` to `site/public/assets/`), write `site/assets-optimize.config.md`, scaffold `site/AGENTS.md` + 4 scoped AGENTS.md, and add check scripts (`pnpm check:all`).
  5. **CMS & Credits:** Wire CMS client data layer (`site/lib/cms/`) if CMS active; generate `site/app/credits/page.js` if stock images used.
  6. **Route Mapping:** Scaffold thin routes and section components with `data-section="<id>"` markers, decoupled `site/content/`, and emit `site/site.manifest.json`.
  7. **Landing Page Showcase Construction:** Fully implement, style, and animate the Landing Page (`site/app/page.js` + `site/app/_components/`) with verbatim copy and subtle GSAP motion.
- **Verification:** Run `node skills/create-nww-website/scripts/client-review/verify-nextjs.mjs .` and execute `pnpm build` in `site/` to ensure zero compilation or route errors.
- **Gate 6:** Client reviews the live interactive Landing Page showcase and approves codebase foundation. Progress is recorded in `project-docs/router-state.md` (`Gate 6: Scaffolding, Foundation & Landing Page Approved`).

### Stage 7: Sub-Page Build Loop (Per-Page Sub-Pipeline)
- **Goal:** Incrementally build every remaining page from `project-docs/page-list.md` (e.g. `about`, `services`, `contact`, `blog`) strictly one by one in order. Since the Landing Page was already built in Stage 6 and all route stubs exist in `site.manifest.json`, the agent modifies only the target sub-page components and content modules.
- **Sub-Pipeline per sub-page:**
  1. **Build:** Implement/refine thin `site/app/<route>/page.js` (<=80 lines) and section components in `site/app/<route>/_components/` (<=250 lines). Follow verbatim copy, exact tokens, and ensure `data-section="<id>"` markers match `page.md`.
  2. **Self-Critique:** Agent tests against `project-docs/page-checklist.md`, runs `pnpm check:structure` and `pnpm check:assets`, logs per-page verification to `page-specs/<slug>/checklist-state.md`, and records results in `site/build-log.md`.
  3. **Gate 7a (Build Review):** Human inspects built page structure, responsive behavior, component line counts, and placeholder tags.
  4. **Gate 7b (Binary QA Sign-Off):** Human verifies passing binary QA checks from `checklist-state.md` and gives final approval. Mark page completed in `project-docs/page-list.md` (`- [x] Page Name`).
- **Repeat** until all sub-pages in `page-list.md` are approved.

### Stage 8: Final Verification & Handover
- **Goal:** Execute full production audit and prepare handover:
  - Run `node scripts/structure-audit/index.js` to audit all deliverables, verify documentation completeness, check strict line limits, and generate `project-docs/structure-audit.md`.
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

---

## Gating Rules for Agents

1. **Never auto-advance:** When a stage's artifacts are generated, display a concise summary to the user, present key decisions, and halt until human sign-off is granted.
2. **Approval standard:** Only an affirmative reply ("approved", "proceed") clears a gate. Silence or clarifying questions do not constitute approval.
3. **Atomic checkpoints:** Update `project-docs/router-state.md` immediately upon passing each gate.
4. **Client Notification Prompt:** At every gate sign-off, ask the user: *"Would you like to notify the client for this milestone? Run `node scripts/client-notify/index.js` to preview and send upon approval."*
5. **Client Review Gate Rule (Markdown is Internal):** No client-facing gate ever asks the client to open, read, or approve `.md` files. Every client review gate (Gates 0, 2, 3, 5, 6, 7a, 8b) presents HTML previews, live URLs, or plain-language summaries. All `.md` files are strictly internal developer artifacts.
