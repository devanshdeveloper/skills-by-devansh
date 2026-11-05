# Stage 5 Batch 03: Pushing Seeds & Gate 5 Sign-Off

This rulebook governs **Batch 3 of Stage 5**. In this final batch of Stage 5, the agent validates, tests, and seeds content into the live NWW CMS backend using standalone seeder utilities, then presents the complete Stage 5 deliverable package for human Gate 5 sign-off.

## Table of Contents
- [1. Seeder Execution Workflow](#1-seeder-execution-workflow)
- [2. Step 1: Dry-Run Validation](#2-step-1-dry-run-validation)
- [3. Step 2: Live Seeding & Collision Handling](#3-step-2-live-seeding--collision-handling)
- [4. Step 3: Webhook Verification](#4-step-3-webhook-verification)
- [5. Gate 5 Review Checklist & Downstream Handover](#5-gate-5-review-checklist--downstream-handover)

---

## 1. Seeder Execution Workflow

Content seeding is executed using standalone model seeders located in `skills/create-nww-website/references/cms/seeders/<model>/insert.js`, paired directly with JSON files in `project-docs/client-review/gate-5-cms-content/<model>/`:

| Content Model | Target Seeder Script | Content Source Directory |
|---|---|---|
| **Blog Articles** | `skills/create-nww-website/references/cms/seeders/blog/insert.js` | `project-docs/client-review/gate-5-cms-content/blog/` |
| **Services** | `skills/create-nww-website/references/cms/seeders/service/insert.js` | `project-docs/client-review/gate-5-cms-content/services/` |
| **Projects / Portfolio** | `skills/create-nww-website/references/cms/seeders/project/insert.js` | `project-docs/client-review/gate-5-cms-content/projects/` |
| **Testimonials** | `skills/create-nww-website/references/cms/seeders/testimonial/insert.js` | `project-docs/client-review/gate-5-cms-content/testimonials/` |
| **FAQs** | `skills/create-nww-website/references/cms/seeders/faq/insert.js` | `project-docs/client-review/gate-5-cms-content/faqs/` |
| **Features** | `skills/create-nww-website/references/cms/seeders/feature/insert.js` | `project-docs/client-review/gate-5-cms-content/features/` |
| **Case Studies** | `skills/create-nww-website/references/cms/seeders/case-study/insert.js` | `project-docs/client-review/gate-5-cms-content/case-studies/` |
| **Contact Us (Module)** | `skills/create-nww-website/references/cms/seeders/contact-us/insert.js` | `project-docs/client-review/gate-5-cms-content/contact-us/` |
| **Page Configurations** | `skills/create-nww-website/references/cms/seeders/page-config/insert.js` | `project-docs/client-review/gate-5-cms-content/page-configs/` |
| **Website Tools** | `skills/create-nww-website/references/cms/seeders/tool/insert.js` | `project-docs/client-review/gate-5-cms-content/tools/` |
| **Website Tool Categories** | `skills/create-nww-website/references/cms/seeders/tool-category/insert.js` | `project-docs/client-review/gate-5-cms-content/tool-categories/` |
| **Careers / Jobs** | `skills/create-nww-website/references/cms/seeders/job/insert.js` | `project-docs/client-review/gate-5-cms-content/jobs/` |
| **Events & Webinars** | `skills/create-nww-website/references/cms/seeders/event/insert.js` | `project-docs/client-review/gate-5-cms-content/events/` |
| **Plans & Pricing** | `skills/create-nww-website/references/cms/seeders/plan/insert.js` | `project-docs/client-review/gate-5-cms-content/plans/` |
| **Galleries** | `skills/create-nww-website/references/cms/seeders/gallery/insert.js` | `project-docs/client-review/gate-5-cms-content/galleries/` |
| **Articles** | `skills/create-nww-website/references/cms/seeders/article/insert.js` | `project-docs/client-review/gate-5-cms-content/articles/` |
| **Industries** | `skills/create-nww-website/references/cms/seeders/industry/insert.js` | `project-docs/client-review/gate-5-cms-content/industries/` |
| **Portfolio** | `skills/create-nww-website/references/cms/seeders/portfolio/insert.js` | `project-docs/client-review/gate-5-cms-content/portfolio/` |
| **Legal Policies** | `skills/create-nww-website/references/cms/seeders/policy/insert.js` | `project-docs/client-review/gate-5-cms-content/policies/` |
| **Website Tags** | `skills/create-nww-website/references/cms/seeders/tag/insert.js` | `project-docs/client-review/gate-5-cms-content/tags/` |
| **Forms / Leads** | `skills/create-nww-website/references/cms/seeders/form/submit.js` | `project-docs/client-review/gate-5-cms-content/forms/` |

Ensure `SERVER_URL` and `CMS_SITE_KEY` are configured in the environment before live runs.

---

## 2. Step 1: Dry-Run Validation

Always execute a dry run before touching the remote CMS database:

```bash
# Example for Blog Posts
node skills/create-nww-website/references/cms/seeders/blog/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --dry-run

# Example for Services
node skills/create-nww-website/references/cms/seeders/service/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/services \
  --dry-run
```

Confirm that:
- Every JSON file parses with valid syntax.
- All required model fields (`title`, `slug`, `content`, etc.) are present.
- Mongoose strict-mode warnings are resolved (taxonomies are in `metadata`).
- Exit code is 0.

---

## 3. Step 2: Live Seeding & Collision Handling

Execute live insertion with automated collision handling:

```bash
node skills/create-nww-website/references/cms/seeders/blog/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --auto-slug
```

- If a slug collision occurs (HTTP 409), `--auto-slug` automatically calls `POST /api/<model>/generate-slug` to assign a collision-free suffix (e.g. `title-1`).
- Verify that every item returns HTTP 201 Created with a valid MongoDB `_id`.

---

## 4. Step 3: Webhook Verification

If the live website or local dev server is operational, verify that on-demand ISR revalidation fires:
- Target endpoint: `POST /api/revalidate`
- Headers: `Authorization: Bearer ${REVALIDATE_SECRET}`
- Body: `{ "resource": "blog" }`
- Response: `{ "revalidated": true, "tag": "cms:blog" }`

---

## 5. Gate 5 Review Checklist & Downstream Handover

Before presenting Gate 5 to the user for formal sign-off:

### Master Deliverables Checklist
- [ ] **SEO Content Complete:** All modular content authored in `client-context/<model>/.../content.md` with co-located image assets.
- [ ] **Batch 1 Complete:** Media slots populated via client assets or licensed stock; `project-docs/stock-provenance.json` logged.
- [ ] **Batch 2 Complete:** Content seeds authored in `project-docs/client-review/gate-5-cms-content/` from `client-context/` content.
- [ ] **CMS Open Questions Resolved:** All 28 questions in `gate-5-cms-requirements/open-questions.md` codified into `cms-implementation-rules.md`.
- [ ] **Batch 3 Complete:** Seeders executed successfully with zero fatal errors.
- [ ] **Gate Containment Verified:** Zero loose markdown files outside designated gate folders.
- [ ] **Codebase Untouched:** `site/` contains zero premature code or scaffold files.

### Downstream Handover to Stage 6
Present Gate 5 in plain language summarizing asset curation, CMS schemas, and seeded records. Upon human approval:
- Advance to **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)** to initialize `site/`, copy `references/gate-6-scaffolding/cms-kit/` to `site/lib/cms/`, wire global components, and construct the live showcase Landing Page.

