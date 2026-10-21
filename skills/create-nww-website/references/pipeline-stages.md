# Pipeline Stages & State Machine

The website creation workflow follows a strict 12-stage sequential pipeline with explicit human approval gates between stages. No stage may begin until the preceding stage has received explicit human approval.

---

## State Machine & Tracking (`project-docs/router-state.md`)

All progress is tracked in `project-docs/router-state.md`. The agent must initialize this file at Stage 1 and update it before and after every stage and gate.

### State Schema

```markdown
# Pipeline Router State

**Project Name:** [Project Name]  
**CMS Mode:** [none | cms]  
**Current Stage:** [0 through 11]  
**Current Gate:** [Gate 0 through Gate 11b]  
**Status:** [in_progress | awaiting_approval | approved | blocked]  
**Webhook Status:** [pending | built-on-branch | deployed | verified]  
**Last Updated:** [YYYY-MM-DD HH:MM]

## Stage Progress

- [ ] Stage 0: Client Intake Check (Gate 0)
- [ ] Stage 1: Tech Stack Specification (Gate 1)
- [ ] Stage 2: Design Theory (Gate 2)
- [ ] Stage 3: Page List & Information Architecture (Gate 3)
- [ ] Stage 4: SEO Strategy (Gate 4)
- [ ] Stage 5: Layout Theory (Gate 5)
- [ ] Stage 6: Content & Assets (Gate 6)
- [ ] Stage 7: CMS Schema (Gate 7 - skipped if cms: none)
- [ ] Stage 8: Page Checklist & Taste Revisions (Gate 8)
- [ ] Stage 9: Foundation Build (Gate 9)
- [ ] Stage 10: Page Build Loop (Per-Page Gates 10a & 10b)
- [ ] Stage 11: Final Verification & Handover (Gates 11a & 11b)

## Per-Page Build Tracker

| Page Slug | Layout Theory | Content & Assets | Build State | QA Checklist |
|---|---|---|---|---|
| `home` | approved | approved | approved | approved |
| `about` | pending | pending | not started | pending |

## Active Blockers / Open Questions
- None.
```

---

## The 12 Stages in Detail

### Stage 0: Intake Check
- **Goal:** Execute the start-up activation protocol from [client-questionnaire.md](client-questionnaire.md): check for an existing brief, prefill from prompt notes, or present the 7-batch questionnaire to compile `project-docs/client-answers.md`.
- **Inputs:** Client questionnaire responses, brand guidelines, reference URLs.
- **Outputs:** `project-docs/client-answers.md` (summary recap, asset inventory, and stock decisions).
- **Gate 0:** Human reviews the intake recap, confirms business goals and audience, confirms CMS mode (`none` or `cms`), and confirms stock photography decision (approved / not approved / placeholder-only; provider priority and ceiling confirmed via [stock-image-sourcing.md](stock-image-sourcing.md) §3). Explicit approval is required before Stage 1 begins.


### Stage 1: Tech Stack Specification
- **Goal:** Author `project-docs/tech-stack.md` defining the stack, pre-filling defaults and asking only about deviations. Stack is Next.js App Router, Tailwind CSS, JavaScript-only (`.js`, `.jsx`), `pnpm`, container standalone output, Lucide icons, GSAP, and image mode `pre-optimized`.
- **Inputs:** Stage 0 discovery documentation.
- **Outputs:** `project-docs/tech-stack.md`.
- **Gate 1:** Human approves `tech-stack.md`. Downstream stages treat this file as binding.

### Stage 2: Design Theory
- **Goal:** Define the visual language, typography scales, color palettes, spacing systems, motion tokens, and voice & tone.
- **Inputs:** Brand guidelines, reference URLs from discovery.
- **Prerequisite:** Web-fetch and capture full-page reference screenshots (landing pages only). Verify if `frontend-design` skill is available per [design-theory.md](design-theory.md) or apply documented built-in taste rules.
- **Outputs:** `project-docs/design-theory.md`, `project-docs/design-references/<domain>/<slug>/` (`page.html`, `content.md`, `screenshot-full-1440.png`, `capture.json`), `project-docs/client-review/gate-2-design-theory/`.
- **Gate 2:** Client reviews the visual package (`project-docs/client-review/gate-2-design-theory/index.html`) and selects palette direction, typography, and brand mark. The agent never asks the client to review the raw technical spec; progress halts until the client decision is recorded.

### Stage 3: Page List & Information Architecture
- **Goal:** Build the complete sitemap, route hierarchy, page types (static, dynamic CMS, utility), and URL slugs. If page types appear that Design Theory did not cover, generate `project-docs/page-design-notes.md`.
- **Inputs:** Intake answers and approved `design-theory.md`.
- **Outputs:** `project-docs/page-list.md` (master build tracker) and `project-docs/page-design-notes.md` (if needed).
- **Gate 3:** Human approves route structure, navigation hierarchy, and sitemap scope.

### Stage 4: SEO Strategy
- **Goal:** Define global and per-page SEO architecture: unique keywords, single `h1`, title/description lengths, JSON-LD schemas, canonical URLs, robots rules, sitemap generation, and 301 redirects map.
- **Inputs:** Approved `page-list.md`, competitor references.
- **Outputs:** `project-docs/seo-strategy.md`.
- **Gate 4:** Human approves SEO keywords, metadata rules, and JSON-LD schema definitions.

### Stage 5: Layout Theory
- **Goal:** Map each page into discrete, semantic sections (`// section: <id>`). Define section hierarchy, responsive layout blueprints, motion intent (defaulting to `static by design` with at most one bold moment per page), content capacity, and identify components reused across 2+ pages in `project-docs/layout-system.md`.
- **Inputs:** `project-docs/design-theory.md`, `project-docs/page-list.md`, `project-docs/seo-strategy.md`.
- **Outputs:** `page-specs/<slug>/layout.md` for every page, and `project-docs/layout-system.md`.
- **Gate 5:** Human approves section breakdowns, layout blueprints, and cross-page layout system.

### Stage 6: Content & Assets
- **Goal:** Author production-ready, verbatim copy for every section. Catalog all required images, icons, illustrations, and videos in `assets.md` using the 8-tag taxonomy. Every draft text block renders with `data-placeholder="true"`. If stock images are approved, follow [stock-image-sourcing.md](stock-image-sourcing.md): client assets take priority, hard exclusions are honored, and stock entries are fetched via `scripts/stock-fetch/index.js`.
- **Sub-sequence:**
  1. Author shared units (`page-specs/_shared/*.md` and `page-specs/_shared/brand-assets.md`). Cleared at **Gate 6 (Shared)**.
  2. Author per-page units (`page-specs/<slug>/content.md` and `page-specs/<slug>/assets.md`). Cleared per page at **Gate 6 (Page)**.
- **Outputs:** `page-specs/_shared/*.md`, `page-specs/<slug>/content.md`, `page-specs/<slug>/assets.md`, `project-docs/stock-provenance.json` (if stock used), and regenerated client-facing `project-docs/asset-requests.md`.
- **Gate 6:** Clears when shared units and all page content are approved. If stock images are used, verify `stock-provenance.json` is complete, hard exclusions are marked `placeholder` + `[STOCK-EXCLUDED]`, and approved image count ceiling is respected.

### Stage 7: CMS Schema (Skipped if `cms: none`)
- **Goal:** Produce CMS schema mapping, backend requirement spec, seed content files, and foundation tasks for NWW CMS blog integration.
- **Inputs:** Approved `content.md` files, `tech-stack.md`, and CMS architecture specification.
- **Outputs:** `project-docs/cms-schema.md`, `project-docs/cms-backend-requirements.md`, `project-docs/cms-seed/blog-<slug>.json`, `project-docs/cms-seed/index.md`, `project-docs/cms-foundation-tasks.md`, `project-docs/editor-handover-outline.md`.
- **Gate 7:** Human approves CMS schema, backend specifications, seed files, and risk mitigations.

### Stage 8: Page Checklist & Taste Revisions
- **Goal:** Audit theories against taste standards; output `project-docs/theory-revisions.md` and master static checklist `project-docs/page-checklist.md` (covering individual page checks, Stage 9 Foundation checklist, and Cross-Page Consistency pass).
- **Inputs:** Approved `page-list.md`, `design-theory.md`, `layout.md` files, and `cms-schema.md` (if CMS mode active).
- **Outputs:** `project-docs/theory-revisions.md` and `project-docs/page-checklist.md`.
- **Gate 8:** Human approves theory revisions and master QA checklist criteria.

### Stage 9: Foundation Build
- **Goal:** Scaffold Next.js App Router codebase under `site/` using `pnpm create next-app@latest site --js --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm`. Scaffold `site/AGENTS.md` and 4 scoped AGENTS.md files (`app/`, `components/`, `lib/`, `content/`). Create check scripts (`check-structure.mjs`, `check-assets.mjs`, `make-placeholders.mjs`). Run asset optimizer from `assets-source/` to `site/public/assets/`, persisting settings to `site/assets-optimize.config.md`. Wire theme tokens, Nav, Footer, `site/components/ResponsiveImage.js`, and CMS data layer (`site/lib/cms/`) if CMS mode is active. If stock images are used, generate `site/app/credits/page.js` from `stock-provenance.json`, link in footer, and ensure Unsplash images hotlink with `referrerPolicy="no-referrer-when-downgrade"`.
- **Inputs:** Approved foundation specs from Stages 1 through 8.
- **Outputs:** Compiling Next.js foundation shell in `site/`.
- **Gate 9:** Human reviews root shell, navigation, tokens, optimizer report, credits page (if stock used), and verifies that `pnpm lint`, `pnpm build`, and `pnpm check:all` pass cleanly.

### Stage 10: Page Build Loop (Per-Page Sub-Pipeline)
- **Goal:** Incrementally build every page from `project-docs/page-list.md` strictly one by one in order.
- **Sub-Pipeline per page:**
  1. **Build:** Implement thin `site/app/<route>/page.js` (<=80 lines) and section components in `site/app/<route>/_components/` (<=250 lines). Follow verbatim copy and exact tokens.
  2. **Self-Critique:** Agent tests against `project-docs/page-checklist.md`, runs `pnpm check:structure` and `pnpm check:assets`, logs per-page verification to `page-specs/<slug>/checklist-state.md`, and records results in `site/build-log.md`.
  3. **Gate 10a (Build Review):** Human inspects built page structure, responsive behavior, component line counts, and placeholder tags.
  4. **Gate 10b (Binary QA Sign-Off):** Human verifies passing binary QA checks from `checklist-state.md` and gives final approval. Mark page completed in `project-docs/page-list.md` (`- [x] Page Name`).
- **Repeat** until all pages in `page-list.md` are approved.

### Stage 11: Final Verification & Handover
- **Goal:** Execute full production audit and prepare handover:
  - Run `ai-edit-audit` in `report-only` mode producing `project-docs/structure-audit.md`.
  - Conduct Pre-Launch SEO Audit on production build (`pnpm build && pnpm start`): metadata, JSON-LD, 301 redirects, robots.txt, sitemap.
  - Verify CMS checks: unpublished posts excluded, sanitizer strips malicious HTML, webhook responds within 5s, `REVALIDATE_SECRET` and `CMS_SITE_KEY` not leaked.
  - Verify stock audit: no provider API keys in site build or bundles; `/credits` page renders cleanly; Unsplash images include proper UTM attribution; `stock-provenance.json` backed up with assets.
  - Run `pnpm check:all`.
  - **Gate 11a:** Human reviews and approves proposed cross-page or audit fixes before applying them to approved pages.
  - Apply fixes, re-verify production build, and assemble Client Handover (AGENTS.md notes, CMS admin guide, asset backup location in `assets-source/`).
  - **Gate 11b:** Human gives final deployment and handover sign-off.

---

## Gating Rules for Agents

1. **Never auto-advance:** When a stage's artifacts are generated, display a concise summary to the user, present key decisions, and halt until human sign-off is granted.
2. **Approval standard:** Only an affirmative reply ("approved", "proceed") clears a gate. Silence or clarifying questions do not constitute approval.
3. **Atomic checkpoints:** Update `project-docs/router-state.md` immediately upon passing each gate.
