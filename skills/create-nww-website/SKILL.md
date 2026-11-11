---
name: create-nww-website
description: Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 10-stage human-gated workflow. Enforces markdown page specifications with CMS schemas, codebase scaffolding with live landing page showcase, incremental sub-page builds, additional modular features, and production verification. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project.
---

# Create NWW Website

> [!IMPORTANT]
> **Hard Rule — Zero External Project Context:**
> DO NOT add any context from other projects. It misleads the AI Agent. Only use and add instructions. Skill files, templates, and reference runbooks must contain only instructions, syntax, and schema shapes—never specific brands, business domains, or project context from previous or external projects. All context must come strictly from the current project workspace, brief, or user input.
>
> **Project Identity Detection (Read Directory Name First):** Always inspect the current working directory name (`path.basename(process.cwd())`) to derive the project slug and default Brand Name in Title Case. Never introduce, assume, or hallucinate unrelated external projects. Anchor all branding and scope strictly to the current workspace.
>
> **Do Not Edit Skill Files:** Skill files (`SKILL.md`, `references/**`, `scripts/**`) are immutable runbooks. Never edit or overwrite skill files directly during project execution. If workflow changes or enhancements are required, **request changes with a prompt** instead.
>
> **Hard Rule — Zero Repeated Content & Exact Sections (Only Section Types May Repeat):**
> Only section types (e.g. Hero, Features, Testimonials, FAQ, CTA Banner, Process, Stats, Bento Grid) may be repeated across pages. No exact section, identical card layout, or duplicate content/copy may be repeated anywhere on the website or within the same page. Every section must have unique copywriting, bespoke cards, and page-specific value propositions. Shared components are strictly limited to global chrome (`Nav`, `Footer`, `PreviewBanner`, `ResponsiveImage`, `Schema`); body sections must never copy identical text across pages.
>
> **Hard Rule — Minimum 5 Substantive Sections (Excluding Bookends):**
> Every page (starting with Homepage in Stage 6 and every sub-page in Stage 7) must orchestrate a **minimum of 5 distinct, substantive semantic sections OTHER THAN Hero, CTA banner, FAQ, Contact Us form, and Footer**. Standard bookends/boilerplate (Hero, CTA, FAQ, Contact Us form, Footer) do NOT count toward this 5-section minimum. Pages must feature at least 5 rich substantive body sections (e.g. Features/Value, Social Proof/Testimonials, How-It-Works/Process, Bento Grid/Capabilities, Stats/Metrics, Case Studies, Comparison Table) in addition to those bookends.
>
> **Hard Rule — High FAQ Density:**
> Any page featuring an FAQ section (and any dedicated FAQ route) must enforce High FAQ Density with a minimum of 10 to 15 comprehensive, substantive FAQs with rich multi-sentence explanations addressing customer objections, technical specifics, pricing, and onboarding nuances. Duplicating FAQs across different pages is strictly prohibited; all FAQs must be 100% unique to that specific page's topic.
>
> **Hard Rule — Rolling Open Questions Pool (Minimum 20 at Any Stage & Zero Confirmed Decisions):**
> Maintain a minimum rolling queue of at least 20 targeted, substantive open questions in `client-context/open-questions.md` across EVERY stage of the pipeline (Stages 0 through 9). Confirmed decisions, agreed parameters, answered items, or project recaps in `client-context/open-questions.md` (and Open Questions deliverable sections) are strictly forbidden; that document must contain ONLY active, pending, unanswered discovery questions. As soon as an answer or decision is confirmed, it MUST be removed from `open-questions.md` immediately, recorded in `client-context/answers/batch-*/answers.md` (or design specifications), and replenished with a new open question to maintain the minimum count of at least 20 at all times.
>
> **Universal Instructions — Use `/compact` on Each Gate Transaction:**
> At every gate transaction or stage transition (Gates 0 through 9), the agent MUST instruct and remind the user to run `/compact`. This compacts and summarizes conversation history, keeping context token-efficient, preventing context window exhaustion during long multi-stage website builds, and ensuring clean state handoffs between gates.

This skill orchestrates the end-to-end creation of production-grade Next.js App Router websites with optional Next Web Website (NWW) CMS integration. It enforces a disciplined 10-stage human-gated workflow (Stages 0 through 9) ensuring structural rigor, taste-driven aesthetic polish, and technical quality.

---

## Quick Start

### 1. Install & Hard Pull

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website -y
```

> **New Chat / Fresh Session Rule:** When opening a new session, ensure the latest gate runbooks and features are loaded:
> `DISABLE_TELEMETRY=1 npx skills update create-nww-website -y`

### 2. Starter Brief Template

Copy and paste into your agent to initialize Stage 0 Intake:

```markdown
Activate create-nww-website. Here is our project brief for Stage 0 Intake:
- Brand Name: [Client / Business Brand Name, or leave blank to derive from directory name]
- Project Slug: [Defaults to current working directory name, e.g. <current-directory-name>]
- Project Type: ["Corporate" | "E-commerce" | "Publication" | "Portfolio" | "Service" | "SaaS"]
- Core Offering & Audience: [Primary service / product offering and target audience]
- Primary CTA: [Primary conversion action] | Timeline: [Target delivery timeline]
- CMS Mode: ["cms" or "none"] | Origin: ["scratch" or "migration"]
- Brand Tokens: [Primary: #hex, Accent: #hex, Headings: Font, Body: Font]
- Motion Tier: ["disabled", "low", "medium", "high", "max", or "ultra"] (Default: "medium")
- Benchmarks: [List 1-3 design inspiration or benchmark URLs]
- Scope: [List of core routes/pages] | Forms: [Required forms]
Parse into `client-context/answers/batch-*/answers.md` and present the Gate 0 Intake Recap.
```

---

## Activation Protocol

Execute this protocol immediately on activation before any other work:

1. **Project Identity Detection (Read Directory Name First):**
   - **Inspect Current Directory Name:** Read `path.basename(process.cwd())` (or inspect the workspace folder name).
   - **Derive Project Slug:** Use the exact current directory name as the Technical Project Slug (e.g. `tejas-cure-physiotherapy-clinic` -> `tejas-cure-physiotherapy-clinic`).
   - **Derive Default Brand Name:** Convert the directory slug to Title Case (e.g. `tejas-cure-physiotherapy-clinic` -> `Tejas Cure Physiotherapy Clinic`), unless the user or workspace documents (`client-context/`, brief) explicitly provide an official brand name.
   - **Zero External Hallucination:** NEVER introduce, assume, or borrow fictional or unrelated project names, business domains, or industries (e.g. NEVER inject "Minit Charger", EV charging, commercial bus depots, or unrelated sample brands). The project identity MUST be anchored exclusively to the current workspace directory and genuine client materials.
2. **Email Milestone Inquiry:** Ask: *"Would you like client milestone approval emails prepared and dispatched at each stage?"*
3. **Intake Status Check:** Inspect `client-context/answers/batch-01-core-identity/answers.md`:
   - If answers exist and are complete, recap for Gate 0 confirmation.
   - If user provided a brief, extract known fields to `client-context/answers/batch-*/answers.md` and present only unanswered questions.
   - If no answers exist, immediately output Batch 01 (Q1a to Q8) from [references/gate-0-intake/client-questionnaire.md](references/gate-0-intake/client-questionnaire.md).
4. **Migration Setup (if `build_origin: migration`):**
   - Run universal site crawler before Gate 1: `node skills/create-nww-website/scripts/site-fetch/index.js --url <legacy-url> --out previous-site --limit-mode max-sampled`.
   - Add `previous-site/` to root `.gitignore`. Generate root `.env.example` with credential placeholders.
5. **Mandatory Reference Site Crawl (Pre-Gate 2):**
   - If reference website URLs are provided in the intake brief or Batch 02 (Q13a), execute the universal site crawler before advancing to Gate 2:
     `node skills/create-nww-website/scripts/site-fetch/index.js --url <reference-url> --out project-docs/design-references/<domain> --limit-mode max-sampled`.
   - Compile `project-docs/design-references/sources.md` and ingest into Gate 0 context.
   - **Enforcement:** Mandatory before Gate 2; skippable only if zero reference sites are provided.
6. **Execution & Pacing:**
   - Present questions in batches of 5–7 questions per turn.
   - **Secret Hygiene:** NEVER request, accept, or record secret credentials or API keys; request env var names only (`CMS_TOKEN`, `SERVER_URL`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`).
   - Save answers in `client-context/answers/batch-*/answers.md` and assets in `client-context/asset-manifest.md`.
7. **Gate 0 Enforced Halt & Compaction:** Present intake recap across batch answers, project slug, asset manifest, and reference site crawl status. Halt execution until explicit human confirmation is received. Remind the user to run `/compact` on this gate transaction before advancing to Stage 1.

---

## When to Use This Skill

Activate this skill when:
- Creating, scaffolding, or developing a new Next.js website.
- Integrating a site with the NWW CMS for blog publishing or lead capture.
- Executing the sequential website pipeline (Stages 0 through 9).
- Generating project specs: Design Theory, Layout System, Page List, or SEO Strategy.
- Scaffolding, styling (Tailwind-only in JSX), animating (GSAP), or verifying pages against checklists.

---

## The 10-Stage Human-Gated Pipeline

The workflow advances strictly one stage at a time. Every stage requires explicit human sign-off at its gate before the next stage begins. Progress is recorded in `project-docs/router-state.md`.

| Stage | Name | Key Deliverables | Gate Approval | Primary Reference |
|:---:|:---|:---|:---|:---|
| **0** | **Intake Check** | `client-context/answers/batch-*/answers.md`, `asset-manifest.md`, `open-questions.md` (>= 20), `.env.example`, `previous-site/` (if migration), `project-docs/design-references/` (if reference sites provided) | **Gate 0:** Intake recap, asset manifest, reference site crawl & open questions sign-off | [gate-0-intake/runbook.md](references/gate-0-intake/runbook.md) |
| **1** | **Tech Stack** | `project-docs/client-review/gate-1-tech-stack/tech-stack.md` | **Gate 1:** Tech stack sign-off (Developer Gate) | [gate-1-tech-stack/runbook.md](references/gate-1-tech-stack/runbook.md) |
| **2** | **Design Theory & Variations** | `gate-2-design-theory/design-theory.md`, variation HTML previews, `index.html` review hub | **Gate 2:** Visual review & variation selection (via public URL) | [gate-2-design-theory/runbook.md](references/gate-2-design-theory/runbook.md) |
| **3** | **Page List & Sitemap** | `project-docs/client-review/gate-3-page-list/page-list.md` (blueprints, min 5 substantive sections/page other than hero/cta/faq/contact/footer, high FAQ density: min 10–15 unique FAQs/page, zero duplicated sections) | **Gate 3:** Sitemap & route structure sign-off | [gate-3-page-list/runbook.md](references/gate-3-page-list/runbook.md) |
| **4** | **SEO Strategy & Content** | `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md`, modular content in `client-context/<model>/.../` (`content.mdx` for CMS; `content.md` for non-CMS) with co-located images, zero duplicate content across pages, and high FAQ density | **Gate 4:** Keywords, JSON-LD schemas, sitemap, redirects & content sign-off | [gate-4-seo-strategy/runbook.md](references/gate-4-seo-strategy/runbook.md) |
| **5** | **CMS Schema, Asset Curation & Seeds** | `project-docs/client-review/gate-5-cms-requirements/` (`open-questions.md`, `cms-implementation-rules.md`), stock provenance, CMS schemas & seeds (confirm token/Website Name in CMS; image uploads supported) | **Gate 5:** CMS schema, asset curation & seeds sign-off | [gate-5-page-specs-and-cms/batch-01-asset-curation/rulebook.md](references/gate-5-page-specs-and-cms/batch-01-asset-curation/rulebook.md) |
| **6** | **Scaffolding & Showcase** | 6-batch execution: scaffold `site/`, foundation shell scoped to all pages, asset optimization, scoped rules, `page-checklist.md`, route stubs, and live **Landing Page showcase** (only Homepage built in Gate 6; min 5 substantive sections other than hero/cta/faq/contact/footer; high FAQ density: min 10–15 substantive FAQs/page; zero repeated sections/content; sub-pages deferred to Stage 7) | **Gate 6:** Scaffolding, foundation & landing showcase sign-off | [gate-6-scaffolding/runbook.md](references/gate-6-scaffolding/runbook.md) |
| **7** | **Sub-Page Build Loop** | Sequential sub-pages in `site/app/<route>/page.js` with per-page review & QA checklist (strictly unique content/sections; only section types repeat; min 5 substantive sections other than hero/cta/faq/contact/footer; high FAQ density: min 10–15 unique FAQs/page) | **Gate 7a:** Sub-page build review<br>**Gate 7b:** Binary QA sign-off | [gate-7-sub-pages/runbook.md](references/gate-7-sub-pages/runbook.md) |
| **8** | **Additional Features** | `features-manifest.md`, feature components in `site/`, `nww-analytics` visitor identity SDK & provider | **Gate 8:** Feature integration & analytics sign-off | [gate-8-additional-features/rulebook.md](references/gate-8-additional-features/rulebook.md) |
| **9** | **Final Verification & Handover** | `structure-audit.md`, production checks, Vercel deployment, client handover | **Gate 9a:** Cross-page fixes approval<br>**Gate 9b:** Final handover sign-off | [gate-9-final-verification/runbook.md](references/gate-9-final-verification/runbook.md) |

---

## State Machine & Gating Protocol

1. **State Tracking:** Maintain `project-docs/router-state.md` at all times. Update gate progress (`pending | approved`), current stage, open questions, and build status.
2. **Never Auto-Advance:** Complete each stage's deliverables and halt execution until the user grants explicit approval.
3. **In-Place Revisions:** If modifications are requested at any gate, edit existing files in-place; do not create duplicate markdown files (e.g. no `revisions.md`).
4. **Public Deployments Only:** All client preview links (Gate 2 variations, Next.js site) must be public HTTPS deployments. Never forward localhost URLs to the client.
5. **Continuous Discovery Loop & Zero Confirmed Decisions Invariant:** Maintain at least 20 targeted questions in `client-context/open-questions.md` across every stage of the pipeline (Stages 0 through 9). **Zero Confirmed Decisions Guardrail:** Never include any confirmed decision, resolved answer, agreed parameter, or project recap in `client-context/open-questions.md`. That document must strictly contain ONLY active, unanswered open questions. Confirmed decisions belong exclusively in `client-context/answers/batch-*/answers.md`. When answers arrive downstream, remove the question immediately from `open-questions.md`, record the answer in batch answers, replenish with a new open question to maintain >= 20 at all times, and implement the answer directly into site code.
6. **Milestone Notifications:** Run `node skills/create-nww-website/scripts/client-notify/index.js` at gate sign-offs to preview and dispatch milestone emails upon explicit user approval.
7. **Early Content & SEO Preparation (Gate 4 Early Invocation):** If requested during intake (Stage 0), Stage 4 (SEO Strategy & Content) can be executed out of order to formulate keywords, search intent, and author complete content in `client-context/<model>/.../` (`content.mdx` for CMS; `content.md` for non-CMS) with co-located image assets before proceeding to design variations (Stage 2) or page specifications (Stage 5). Stage 4 strictly solves SEO strategy and content authoring; zero Next.js code is written in Stage 4.
8. **Universal Instruction — Context Compaction on Gate Transactions:** On each gate transaction (whenever completing a gate, awaiting sign-off, or transitioning to the subsequent gate across Gates 0 through 9), the agent MUST instruct and remind the user to trigger `/compact`. Compacting conversation history between gates consolidates previous decisions into persistent state files (`router-state.md`, `answers.md`, deliverables) and frees up the context window for the upcoming stage.

---

## Canonical Project Structure

```text
<client-project-root>/
├── .gitignore                            # Root ignore rules (includes previous-site/, .env*, node_modules/)
├── .env.example                          # Stage 0 root environment template
├── client-context/                       # Raw client inputs, brand assets, SEO content, and discovery answers
│   ├── answers/batch-*/answers.md        # Modular batch answers (Batches 01 to 07)
│   ├── asset-manifest.md                 # Visual asset inventory, provenance & status
│   ├── open-questions.md                 # Rolling queue of >= 20 open discovery questions
│   ├── blog/<blog-slug>/                 # [Gate 4/Stage 0] Modular blog posts (content.mdx for CMS + co-located images)
│   │   ├── content.mdx                   # Complete SEO-optimized MDX article with frontmatter (or content.md)
│   │   └── cover.webp                    # Co-located image assets
│   ├── tool/<category-slug>/<tool-slug>/ # [Gate 4/Stage 0] Modular tool content (when tool model is enabled)
│   │   ├── content.md                    # Complete tool copy, specs, SEO metadata
│   │   ├── icon.svg                      # Co-located tool icon
│   │   └── preview.webp                  # Co-located tool screenshot / preview
│   └── <model>/<slug>/                   # Other active models (service, case-study, industry, policy)
│       ├── content.md                    # Complete content with SEO frontmatter
│       └── [co-located assets]           # Images alongside markdown
├── previous-site/                        # [If Migration] Full working offline mirror (crawled in Stage 0)
├── project-docs/                         # Project pipeline management & client deliverables
│   ├── router-state.md                   # Live pipeline state, current stage & gate status
│   ├── design-references/                # Benchmark scrapes captured via reference-capture / site-fetch
│   └── client-review/                    # Human-gated client review deliverables (Gates 1 through 9)
└── site/                                 # Production Next.js App Router codebase (Scaffolded at Gate 6)
    ├── package.json                      # Next.js App Router, Tailwind CSS, Lucide icons, GSAP
    ├── next.config.mjs                   # Next.js configuration (images, redirects, headers)
    ├── tailwind.config.js                # Design token mapping from Stage 2 Design Theory
    ├── site.manifest.json                # Project build manifest and page status registry
    ├── public/                           # Self-hosted variable fonts, optimized WebP/AVIF images, SVGs
    ├── app/                              # Next.js App Router (layout.js, globals.css, thin page.js <= 80 lines)
    │   ├── page.js                       # [Stage 6] Home / Landing Page Showcase 
    │   ├── _components/                  # Section components (<= 250 lines; // section: <id>)
    │   └── <sub-page-slug>/              # [Stage 7] Sub-pages built sequentially
    ├── components/                       # Shared components reused across 2+ pages (defined in layout-system.md)
    └── lib/                              # Shared helper utilities (cms, utils, seo, animations)
```

*For detailed file layouts per gate, consult each stage runbook.*

---

## Core Technical Conventions

All website code is generated under `site/`:
- **Framework & Discovery:** Next.js App Router (`app/` directory, React Server Components by default). Package manager (`pnpm` default) and language (`js`/`ts`) are discovered dynamically from lockfiles at run time.
- **Tailwind-Only Styling Rule:**
  - All styling in `site/` must use **Tailwind CSS utility classes directly in JSX**.
  - **Zero Custom CSS:** Prohibit custom `.css` files (including `tokens.css`), CSS modules (`*.module.css`), styled-jsx, Sass/Less, and agent-authored CSS rules in `globals.css` (including `@apply` classes).
  - **`globals.css` Scope:** Restricted strictly to Tailwind root import/directives and theme CSS variables in `:root`. Zero agent-authored component classes.
  - **Zero Agent-Authored Inline Styles:** Prohibit `style={{...}}` in JSX components authored by the agent. (CSS `<style>` blocks and inline styling are permitted ONLY in HTML outputs such as Gate 2 variations and review portals).
- **Gate Containment Rule (Zero Loose Markdown Files Outside Gates):**
  - Every markdown reference file under `references/` and every client review deliverable under `project-docs/client-review/` must reside strictly inside its designated gate folder (`gate-0-intake/` through `gate-9-final-verification/`).
  - Authoring loose markdown files directly under `references/` or outside gate directories in `project-docs/` is strictly prohibited.
- **Strict Line Limits & Section Markers:**
  - Thin page server component (`page.js`): **<= 80 lines**.
  - Section component (`_components/*.js`): **<= 250 lines** (hard ceiling 300).
  - Utility and config files: **<= 500 lines**.
  - Every section component must open with `// section: <id>` and render `data-section="<id>"`.
- **Section Uniqueness & Zero Repeated Content:**
  - Only section types (Hero, Features, Testimonials, FAQ, Process, Bento, CTA Banner, Stats) may be repeated across pages.
  - Repeating exact sections, identical card sets, or duplicate content/headings/copy across pages or within the same page is strictly prohibited.
  - Shared components in `site/components/` are restricted strictly to universal chrome (`Nav`, `Footer`, `PreviewBanner`, `ResponsiveImage`, `Schema`). Every body section component must be bespoke to its route.
- **Minimum 5 Substantive Sections (Excluding Bookends):**
  - Every page must contain a minimum of 5 distinct substantive semantic sections *other than* Hero, CTA banner, FAQ, Contact Us form, and Footer.
  - Standard bookends/boilerplate (Hero, CTA, FAQ, Contact Us form, Footer) do not count toward this 5-section minimum.
  - Every page must feature at least 5 rich substantive body sections (e.g. Features/Value Grid, Social Proof/Testimonials, How-It-Works/Process, Capabilities/Bento Grid, Stats/Metrics, Case Studies, Comparison Table).
- **High FAQ Density & Informational Richness:**
  - Any page with an FAQ section, and any standalone FAQ route, must render a minimum of **10 to 15 comprehensive, substantive FAQs**.
  - Answers must be multi-sentence, informative explanations addressing deep user objections, edge cases, pricing, technical architecture, and onboarding. Zero shallow 1-line answers or filler questions.
  - All FAQs across different pages must be 100% unique to that specific page's topic (zero cross-page duplication).
- **Pre-Launch Guard:** Default `robots: { index: false, follow: false }` metadata and visual `<PreviewBanner />` until Stage 9 production sign-off.
- **Scoped AGENTS.md:** Scaffold `site/AGENTS.md` (<= 150 lines) and 4 scoped files (`site/app/AGENTS.md`, `site/components/AGENTS.md`, `site/lib/AGENTS.md`, `site/content/AGENTS.md`) with standard H2 headers (`## Architecture`, `## Conventions`, `## Anti-patterns`, `## Commands`).

---

## Detailed Reference Routing

Consult the matching reference guide when executing each stage or specialized capability:

| Area / Guide | Reference File | Trigger: Read this when... |
| :--- | :--- | :--- |
| **Stage 0 Intake** | [gate-0-intake/runbook.md](references/gate-0-intake/runbook.md) | Conducting Stage 0 intake, parsing brief, or running `site-fetch` migration crawl. |
| **Client Questionnaire** | [gate-0-intake/client-questionnaire.md](references/gate-0-intake/client-questionnaire.md) | Presenting structured intake batches (Batches 01 to 08) interactively to the user. |
| **Pipeline Stages** | [gate-0-intake/pipeline-stages.md](references/gate-0-intake/pipeline-stages.md) | Reviewing gate criteria, transition conditions, or `router-state.md` state machine rules. |
| **Stage 1 Tech Stack** | [gate-1-tech-stack/runbook.md](references/gate-1-tech-stack/runbook.md) | Generating Stage 1 tech stack spec, App Router structure, and root `.env.example`. |
| **Stage 2 Design Theory** | [gate-2-design-theory/runbook.md](references/gate-2-design-theory/runbook.md) | Establishing typography scales, semantic tokens, and building the Gate 2 review hub. |
| **Design Variations** | [gate-2-design-theory/design-variations.md](references/gate-2-design-theory/design-variations.md) | Building HTML + Tailwind concept variations and running the pre-presentation similarity audit. |
| **Stage 3 Page List** | [gate-3-page-list/runbook.md](references/gate-3-page-list/runbook.md) | Compiling master page inventory, route hierarchy, and build tracker checkboxes. |
| **Stage 4 SEO Strategy** | [gate-4-seo-strategy/runbook.md](references/gate-4-seo-strategy/runbook.md) | Drafting SEO strategy, keywords, metadata, JSON-LD schemas, sitemaps, and 301 redirects. |
| **SEO Tool Library** | [gate-4-seo-strategy/seo-tool-library.md](references/gate-4-seo-strategy/seo-tool-library.md) | Running SEO tool availability check or auditing PageSpeed / sitemap / robots. |
| **Stage 5 Batch 1 Asset Curation** | [gate-5-page-specs-and-cms/batch-01-asset-curation/rulebook.md](references/gate-5-page-specs-and-cms/batch-01-asset-curation/rulebook.md) | Sourcing licensed stock images via Pixabay, Pexels, or Unsplash with provenance logging. |
| **Stage 5 Batch 2 Building Seeds** | [gate-5-page-specs-and-cms/batch-02-building-seeds/rulebook.md](references/gate-5-page-specs-and-cms/batch-02-building-seeds/rulebook.md) | Authoring seed content JSONs and schema specifications from client-context/ content. |
| **Stage 5 Batch 3 Pushing Seeds** | [gate-5-page-specs-and-cms/batch-03-pushing-seeds/rulebook.md](references/gate-5-page-specs-and-cms/batch-03-pushing-seeds/rulebook.md) | Validating and pushing seed records into live CMS collections via the companion content-pipeline CLI. |
| **CMS Integration & Architecture** | [cms/rulebook.md](references/cms/rulebook.md) | Connecting NWW CMS endpoints, on-demand ISR revalidation handler, and client helper wiring. |
| **CMS Blog Model & Implementation** | [cms/blog.md](references/cms/blog.md) | Querying blog posts, dynamic routes, ISR caching, metadata, Core Web Vitals, and running content-pipeline operations. |
| **CMS Project Model & Implementation** | [cms/project.md](references/cms/project.md) | Portfolio projects, dynamic showcase routes, gallery media, and running content-pipeline operations. |
| **CMS Contact Us Module & Implementation** | [cms/contact-us.md](references/cms/contact-us.md) | Direct WebsiteContactUs module, Server Action handler, security rules, and running content-pipeline operations. |
| **CMS Page Config Model & Implementation** | [cms/page-config.md](references/cms/page-config.md) | Pure page-level WebsitePageConfig schema, metadata/FAQ injection, shell controls, and running content-pipeline operations. |
| **CMS Service Model & Implementation** | [cms/service.md](references/cms/service.md) | Service catalog, dynamic capability routes, JSON-LD schemas, and running content-pipeline operations. |
| **CMS FAQ Model & Implementation** | [cms/faq.md](references/cms/faq.md) | Frequently asked questions, in-page accordions, FAQPage schema, and running content-pipeline operations. |
| **CMS Testimonial Model & Implementation** | [cms/testimonial.md](references/cms/testimonial.md) | Client reviews, star ratings, social proof showcase, and running content-pipeline operations. |
| **CMS Case Study Model & Implementation** | [cms/case-study.md](references/cms/case-study.md) | Narrative enterprise case studies, challenge/solution/results metrics, and running content-pipeline operations. |
| **CMS Tool Model & Implementation** | [cms/tool.md](references/cms/tool.md) | Interactive tools, calculators, widget boundaries, JSON-LD schemas, and running content-pipeline operations. |
| **CMS Tool Category Model & Implementation** | [cms/tool-category.md](references/cms/tool-category.md) | Hierarchical tool categories, landing pages, taxonomy metadata, and running content-pipeline operations. |
| **CMS Feature Model & Implementation** | [cms/feature.md](references/cms/feature.md) | Platform and product features grid, icons, and running content-pipeline operations. |
| **CMS Job Model & Implementation** | [cms/job.md](references/cms/job.md) | Careers index, job descriptions, JobPosting schema, and running content-pipeline operations. |
| **CMS Event Model & Implementation** | [cms/event.md](references/cms/event.md) | Corporate events, webinars, calendar views, Event schema, and running content-pipeline operations. |
| **CMS Plan Model & Implementation** | [cms/plan.md](references/cms/plan.md) | Subscription pricing plans, multi-cycle tiers, and running content-pipeline operations. |
| **CMS Gallery Model & Implementation** | [cms/gallery.md](references/cms/gallery.md) | Photo galleries, visual media albums, and running content-pipeline operations. |
| **CMS Article Model & Implementation** | [cms/article.md](references/cms/article.md) | Editorial articles with author credits, news posts, and running content-pipeline operations. |
| **CMS Industry Model & Implementation** | [cms/industry.md](references/cms/industry.md) | Industry solution verticals, sector capabilities, and running content-pipeline operations. |
| **CMS Portfolio Model & Implementation** | [cms/portfolio.md](references/cms/portfolio.md) | Showcase portfolio works, creative media galleries, and running content-pipeline operations. |
| **CMS Policy Model & Implementation** | [cms/policy.md](references/cms/policy.md) | Dynamic legal policies (Privacy, Terms, Refund), DigitalDocument schemas, and running content-pipeline operations. |
| **CMS Tag Model & Implementation** | [cms/tag.md](references/cms/tag.md) | WebsiteTag taxonomy badges, category filtering UI, and running content-pipeline operations. |
| **CMS User Event & Telemetry** | [cms/user-event.md](references/cms/user-event.md) | Visitor telemetry, interaction analytics, and server-side ingestion handler. |
| **CMS Lead & Inbound Capture** | [cms/lead.md](references/cms/lead.md) | Inbound lead inquiries, Server Action submission with honeypot anti-spam, and form testing. |
| **Stage 6 Scaffolding** | [gate-6-scaffolding/runbook.md](references/gate-6-scaffolding/runbook.md) | Scaffolding `site/`, generating master QA checklist, and constructing Landing Page showcase. |
| **Class-Based CMS Kit** | [gate-6-scaffolding/batch-04-cms-kit-integration/cms-kit.md](references/gate-6-scaffolding/batch-04-cms-kit-integration/cms-kit.md) | Integrating class-based CMS kit, site-name resolution, blog querying, SEO metadata, sitemaps, or feeds. |
| **Code Conventions** | [references/gate-6-scaffolding/batch-01-codebase-scaffolding/code-conventions.md](references/gate-6-scaffolding/batch-01-codebase-scaffolding/code-conventions.md) | Verifying App Router conventions, line limits, and Tailwind-only JSX utility rules. |
| **Motion & UI Component Stack** | [references/gate-6-scaffolding/batch-02-foundation-shell/motion-component-stack.md](references/gate-6-scaffolding/batch-02-foundation-shell/motion-component-stack.md) | Installing UI component stack by Motion Tier (T0–T3), shadcn/ui Base UI setup, and GSAP/Motion boundary. |
| **GSAP Motion Tiers** | [references/gate-6-scaffolding/batch-02-foundation-shell/gsap-animation-tiers.md](references/gate-6-scaffolding/batch-02-foundation-shell/gsap-animation-tiers.md) | Loading approved GSAP skills, configuring motion tiers (disabled to ultra), and writing animations. |
| **Asset Optimization** | [references/gate-6-scaffolding/batch-03-asset-pipeline-agents/asset-optimization.md](references/gate-6-scaffolding/batch-03-asset-pipeline-agents/asset-optimization.md) | Running `assets-optimizer` CLI, generating responsive WebP/AVIF images, and checking budgets. |
| **Page QA Checklist** | [references/gate-6-scaffolding/batch-05-route-scaffolding/page-checklist.md](references/gate-6-scaffolding/batch-05-route-scaffolding/page-checklist.md) | Verifying pages against the binary PASS/FAIL QA acceptance checklist. |
| **Stage 7 Sub-Pages** | [gate-7-sub-pages/runbook.md](references/gate-7-sub-pages/runbook.md) | Incrementally constructing sub-pages sequentially with per-page review and binary QA sign-off. |
| **Stage 8 Additional Features** | [gate-8-additional-features/rulebook.md](references/gate-8-additional-features/rulebook.md) | Integrating modular site capabilities, NWW Analytics (visitor identity & telemetry SDK), and custom widgets. |
| **NWW Analytics Reference** | [gate-8-additional-features/site/features/nww-analytics/implementation.md](references/gate-8-additional-features/site/features/nww-analytics/implementation.md) | Technical reference for NWW Visitor Identity & Telemetry, ES256 tokens, JWKS, and downloader contracts. |
| **Stage 9 Verification** | [gate-9-final-verification/runbook.md](references/gate-9-final-verification/runbook.md) | Executing Stage 9 structure audit, production checks, Vercel deployment, and final handover. |
