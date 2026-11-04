---
name: create-nww-website
description: Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 10-stage human-gated workflow. Enforces markdown page specifications with CMS schemas, codebase scaffolding with live landing page showcase, incremental sub-page builds, additional modular features, and production verification. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project.
---

# Create NWW Website

> [!IMPORTANT]
> **Do Not Edit Skill Files:** Skill files (`SKILL.md`, `references/**`, `scripts/**`) are immutable runbooks. Never edit or overwrite skill files directly during project execution. If workflow changes or enhancements are required, **request changes with a prompt** instead.

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
- Brand Name: [e.g. Minit Charger] | Slug: [e.g. minit-charger] | Type: [e.g. Corporate]
- Core Offering & Audience: [Turnkey DC fast charging for commercial bus depots]
- Primary CTA: [Schedule Depot Feasibility Study] | Timeline: [4 weeks]
- CMS Mode: ["cms" or "none"] | Origin: ["scratch" or "migration"]
- Brand Tokens: [Primary: #0A192F, Accent: #00E5FF, Headings: Plus Jakarta Sans, Body: Inter]
- Motion Tier: ["disabled", "low", "medium", "high", "max", or "ultra"] (Default: "medium")
- Benchmarks: [https://stripe.com (spatial hierarchy), https://linear.app (dark accents)]
- Scope: [Home, Solutions, About, Blog, Contact] | Forms: [Consultation request]
Parse into `client-context/answers/batch-*/answers.md` and present the Gate 0 Intake Recap.
```

---

## Activation Protocol

Execute this protocol immediately on activation before any other work:

1. **Email Milestone Inquiry:** Ask: *"Would you like client milestone approval emails prepared and dispatched at each stage?"*
2. **Intake Status Check:** Inspect `client-context/answers/batch-01-core-identity/answers.md`:
   - If answers exist and are complete, recap for Gate 0 confirmation.
   - If user provided a brief, extract known fields to `client-context/answers/batch-*/answers.md` and present only unanswered questions.
   - If no answers exist, immediately output Batch 01 (Q1a to Q8) from [references/gate-0-intake/client-questionnaire.md](references/gate-0-intake/client-questionnaire.md).
3. **Migration Setup (if `build_origin: migration`):**
   - Run universal site crawler before Gate 1: `node skills/create-nww-website/scripts/site-fetch/index.js --url <legacy-url> --out previous-site --limit-mode max-sampled`.
   - Add `previous-site/` to root `.gitignore`. Generate root `.env.example` with credential placeholders.
4. **Execution & Pacing:**
   - Present questions in batches of 5–7 questions per turn.
   - **Secret Hygiene:** NEVER request, accept, or record secret credentials or API keys; request env var names only (`CMS_SITE_KEY`, `SERVER_URL`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`).
   - Save answers in `client-context/answers/batch-*/answers.md` and assets in `client-context/asset-manifest.md`.
5. **Gate 0 Enforced Halt:** Present intake recap across batch answers, project slug, and asset manifest. Halt execution until explicit human confirmation is received.

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
| **0** | **Intake Check** | `client-context/answers/batch-*/answers.md`, `asset-manifest.md`, `open-questions.md` (>= 20), `.env.example`, `previous-site/` (if migration) | **Gate 0:** Intake recap, asset manifest & open questions sign-off | [gate-0-intake/runbook.md](references/gate-0-intake/runbook.md) |
| **1** | **Tech Stack** | `project-docs/client-review/gate-1-tech-stack/tech-stack.md` | **Gate 1:** Tech stack sign-off (Developer Gate) | [gate-1-tech-stack/runbook.md](references/gate-1-tech-stack/runbook.md) |
| **2** | **Design Theory & Variations** | `gate-2-design-theory/design-theory.md`, variation HTML previews, `index.html` review hub | **Gate 2:** Visual review & variation selection (via public URL) | [gate-2-design-theory/runbook.md](references/gate-2-design-theory/runbook.md) |
| **3** | **Page List & Sitemap** | `project-docs/client-review/gate-3-page-list/page-list.md` | **Gate 3:** Sitemap & route structure sign-off | [gate-3-page-list/runbook.md](references/gate-3-page-list/runbook.md) |
| **4** | **SEO Strategy** | `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` | **Gate 4:** Keywords, JSON-LD, sitemap & redirects sign-off | [gate-4-seo-strategy/runbook.md](references/gate-4-seo-strategy/runbook.md) |
| **5** | **Page Specs & CMS Schema** | `page-specs/<slug>/page.md`, `layout-system.md`, `gate-5-cms-requirements/` (`open-questions.md`, `cms-implementation-rules.md`), schemas & seeds | **Gate 5:** Markdown specifications & CMS schema sign-off | [gate-5-page-specs-and-cms/batch-01-page-spcs/rulebook.md](references/gate-5-page-specs-and-cms/batch-01-page-spcs/rulebook.md) |
| **6** | **Scaffolding & Showcase** | Scaffold `site/`, `page-checklist.md`, **Landing Page showcase**, CMS blog integration (`references/cms/blog.md`) | **Gate 6:** Scaffolding, foundation & landing showcase sign-off | [gate-6-scaffolding/runbook.md](references/gate-6-scaffolding/runbook.md) |
| **7** | **Sub-Page Build Loop** | Sequential sub-pages in `site/app/<route>/page.js` with per-page review & QA checklist | **Gate 7a:** Sub-page build review<br>**Gate 7b:** Binary QA sign-off | [gate-7-sub-pages/runbook.md](references/gate-7-sub-pages/runbook.md) |
| **8** | **Additional Features** | `features-manifest.md`, feature components in `site/`, `nww-analytics` visitor identity SDK & provider | **Gate 8:** Feature integration & analytics sign-off | [gate-8-additional-features/rulebook.md](references/gate-8-additional-features/rulebook.md) |
| **9** | **Final Verification & Handover** | `structure-audit.md`, production checks, Vercel deployment, client handover | **Gate 9a:** Cross-page fixes approval<br>**Gate 9b:** Final handover sign-off | [gate-9-final-verification/runbook.md](references/gate-9-final-verification/runbook.md) |

---

## State Machine & Gating Protocol

1. **State Tracking:** Maintain `project-docs/router-state.md` at all times. Update gate progress (`pending | approved`), current stage, open questions, and build status.
2. **Never Auto-Advance:** Complete each stage's deliverables and halt execution until the user grants explicit approval.
3. **In-Place Revisions:** If modifications are requested at any gate, edit existing files in-place; do not create duplicate markdown files (e.g. no `revisions.md`).
4. **Public Deployments Only:** All client preview links (Gate 2 variations, Next.js site) must be public HTTPS deployments. Never forward localhost URLs to the client.
5. **Continuous Discovery Loop:** Maintain at least 20 targeted questions in `client-context/open-questions.md`. When answers arrive downstream, update batch answers, replace the open question, and implement the answer directly into site code.
6. **Milestone Notifications:** Run `node skills/create-nww-website/scripts/client-notify/index.js` at gate sign-offs to preview and dispatch milestone emails upon explicit user approval.

---

## Canonical Project Structure

```text
<client-project-root>/
├── .gitignore                            # Root ignore rules (includes previous-site/, .env*, node_modules/)
├── .env.example                          # Stage 0 root environment template
├── client-context/                       # Raw client inputs, brand assets, and discovery answers
│   ├── answers/batch-*/answers.md        # Modular batch answers (Batches 01 to 07)
│   ├── asset-manifest.md                 # Visual asset inventory, provenance & status
│   └── open-questions.md                 # Rolling queue of >= 20 open discovery questions
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
| **Stage 5 Batch 1 Page Specs** | [gate-5-page-specs-and-cms/batch-01-page-spcs/rulebook.md](references/gate-5-page-specs-and-cms/batch-01-page-spcs/rulebook.md) | Authoring unified markdown page blueprints (`page-specs/<slug>/page.md`) and `layout-system.md`. |
| **Stage 5 Batch 2 Asset Curation** | [gate-5-page-specs-and-cms/batch-02-asset-curation/rulebook.md](references/gate-5-page-specs-and-cms/batch-02-asset-curation/rulebook.md) | Sourcing licensed stock images via Pixabay, Pexels, or Unsplash with provenance logging. |
| **Stage 5 Batch 3 Building Seeds** | [gate-5-page-specs-and-cms/batch-03-building-seeds/rulebook.md](references/gate-5-page-specs-and-cms/batch-03-building-seeds/rulebook.md) | Authoring seed content JSONs and schema specifications adhering to strict backend rules. |
| **Stage 5 Batch 4 Pushing Seeds** | [gate-5-page-specs-and-cms/batch-04-pushing-seeds/rulebook.md](references/gate-5-page-specs-and-cms/batch-04-pushing-seeds/rulebook.md) | Validating and pushing seed records into live CMS collections via standalone CLI scripts. |
| **CMS Integration & Architecture** | [cms/rulebook.md](references/cms/rulebook.md) | Connecting NWW CMS endpoints, on-demand ISR revalidation handler, and client helper wiring. |
| **CMS Blog Model & Implementation** | [cms/blog.md](references/cms/blog.md) | Querying blog posts, dynamic routes, ISR caching, metadata, Core Web Vitals, and running standalone seeders. |
| **CMS Project Model & Implementation** | [cms/project.md](references/cms/project.md) | Portfolio projects, dynamic showcase routes, gallery media, and running standalone seeders. |
| **CMS Contact Us Module & Implementation** | [cms/contact-us.md](references/cms/contact-us.md) | Direct WebsiteContactUs module, Server Action handler, security rules, and running standalone seeders. |
| **CMS Page Config Model & Implementation** | [cms/page-config.md](references/cms/page-config.md) | Pure page-level WebsitePageConfig schema, metadata/FAQ injection, shell controls, and running standalone seeders. |
| **CMS Service Model & Implementation** | [cms/service.md](references/cms/service.md) | Service catalog, dynamic capability routes, JSON-LD schemas, and running standalone seeders. |
| **CMS FAQ Model & Implementation** | [cms/faq.md](references/cms/faq.md) | Frequently asked questions, in-page accordions, FAQPage schema, and running standalone seeders. |
| **CMS Testimonial Model & Implementation** | [cms/testimonial.md](references/cms/testimonial.md) | Client reviews, star ratings, social proof showcase, and running standalone seeders. |
| **CMS Case Study Model & Implementation** | [cms/case-study.md](references/cms/case-study.md) | Narrative enterprise case studies, challenge/solution/results metrics, and running standalone seeders. |
| **CMS Tool Model & Implementation** | [cms/tool.md](references/cms/tool.md) | Interactive tools, calculators, widget boundaries, JSON-LD schemas, and running standalone seeders. |
| **CMS Tool Category Model & Implementation** | [cms/tool-category.md](references/cms/tool-category.md) | Hierarchical tool categories, landing pages, taxonomy metadata, and running standalone seeders. |
| **CMS Feature Model & Implementation** | [cms/feature.md](references/cms/feature.md) | Platform and product features grid, icons, and running standalone seeders. |
| **CMS Job Model & Implementation** | [cms/job.md](references/cms/job.md) | Careers index, job descriptions, JobPosting schema, and running standalone seeders. |
| **CMS Event Model & Implementation** | [cms/event.md](references/cms/event.md) | Corporate events, webinars, calendar views, Event schema, and running standalone seeders. |
| **CMS Plan Model & Implementation** | [cms/plan.md](references/cms/plan.md) | Subscription pricing plans, multi-cycle tiers, and running standalone seeders. |
| **CMS Gallery Model & Implementation** | [cms/gallery.md](references/cms/gallery.md) | Photo galleries, visual media albums, and running standalone seeders. |
| **CMS Article Model & Implementation** | [cms/article.md](references/cms/article.md) | Editorial articles with author credits, news posts, and running standalone seeders. |
| **CMS Industry Model & Implementation** | [cms/industry.md](references/cms/industry.md) | Industry solution verticals, sector capabilities, and running standalone seeders. |
| **CMS Portfolio Model & Implementation** | [cms/portfolio.md](references/cms/portfolio.md) | Showcase portfolio works, creative media galleries, and running standalone seeders. |
| **CMS Policy Model & Implementation** | [cms/policy.md](references/cms/policy.md) | Dynamic legal policies (Privacy, Terms, Refund), DigitalDocument schemas, and running standalone seeders. |
| **CMS Tag Model & Implementation** | [cms/tag.md](references/cms/tag.md) | WebsiteTag taxonomy badges, category filtering UI, and running standalone seeders. |
| **CMS User Event & Telemetry** | [cms/user-event.md](references/cms/user-event.md) | Visitor telemetry, interaction analytics, and server-side ingestion handler. |
| **CMS Lead & Inbound Capture** | [cms/lead.md](references/cms/lead.md) | Inbound lead inquiries, Server Action submission with honeypot anti-spam, and form testing. |
| **Stage 6 Scaffolding** | [gate-6-scaffolding/runbook.md](references/gate-6-scaffolding/runbook.md) | Scaffolding `site/`, generating master QA checklist, and constructing Landing Page showcase. |
| **Class-Based CMS Kit** | [gate-6-scaffolding/cms-kit.md](references/gate-6-scaffolding/cms-kit.md) | Integrating class-based CMS kit, site-name resolution, blog querying, SEO metadata, sitemaps, or feeds. |
| **Code Conventions** | [references/gate-6-scaffolding/code-conventions.md](references/gate-6-scaffolding/code-conventions.md) | Verifying App Router conventions, line limits, and Tailwind-only JSX utility rules. |
| **GSAP Motion Tiers** | [references/gate-6-scaffolding/gsap-animation-tiers.md](references/gate-6-scaffolding/gsap-animation-tiers.md) | Loading approved GSAP skills, configuring motion tiers (disabled to ultra), and writing animations. |
| **Asset Optimization** | [references/gate-6-scaffolding/asset-optimization.md](references/gate-6-scaffolding/asset-optimization.md) | Running `assets-optimizer` CLI, generating responsive WebP/AVIF images, and checking budgets. |
| **Page QA Checklist** | [references/gate-6-scaffolding/page-checklist.md](references/gate-6-scaffolding/page-checklist.md) | Verifying pages against the binary PASS/FAIL QA acceptance checklist. |
| **Stage 7 Sub-Pages** | [gate-7-sub-pages/runbook.md](references/gate-7-sub-pages/runbook.md) | Incrementally constructing sub-pages sequentially with per-page review and binary QA sign-off. |
| **Stage 8 Additional Features** | [gate-8-additional-features/rulebook.md](references/gate-8-additional-features/rulebook.md) | Integrating modular site capabilities, NWW Analytics (visitor identity & telemetry SDK), and custom widgets. |
| **NWW Analytics Reference** | [gate-8-additional-features/site/features/nww-analytics/implementation.md](references/gate-8-additional-features/site/features/nww-analytics/implementation.md) | Technical reference for NWW Visitor Identity & Telemetry, ES256 tokens, JWKS, and downloader contracts. |
| **Stage 9 Verification** | [gate-9-final-verification/runbook.md](references/gate-9-final-verification/runbook.md) | Executing Stage 9 structure audit, production checks, Vercel deployment, and final handover. |
