# Stage 5 Batch 03: Pushing Seeds & Gate 5 Sign-Off

This rulebook governs **Batch 3 of Stage 5**. In this final batch of Stage 5, the agent validates, tests, and seeds content into the live NWW CMS backend using the companion `content-pipeline` CLI, then presents the complete Stage 5 deliverable package for human Gate 5 sign-off.

## Table of Contents
- [1. Seeder Execution Workflow](#1-seeder-execution-workflow)
- [2. Step 1: Dry-Run Validation](#2-step-1-dry-run-validation)
- [3. Step 2: Live Seeding & Collision Handling](#3-step-2-live-seeding--collision-handling)
- [4. Step 3: Webhook Verification](#4-step-3-webhook-verification)
- [5. Gate 5 Review Checklist & Downstream Handover](#5-gate-5-review-checklist--downstream-handover)

---

## 1. Seeder Execution Workflow

Content seeding is executed using the companion `content-pipeline` CLI, paired directly with JSON files in `project-docs/client-review/gate-5-cms-content/<model>/`:

| Content Model | Target CLI Command | Content Source Directory |
|---|---|---|
| **Blog Articles** | `push --model blog` | `project-docs/client-review/gate-5-cms-content/blog/` |
| **Services** | `push --model service` | `project-docs/client-review/gate-5-cms-content/services/` |
| **Projects / Portfolio** | `push --model project` | `project-docs/client-review/gate-5-cms-content/projects/` |
| **Testimonials** | `push --model testimonial` | `project-docs/client-review/gate-5-cms-content/testimonials/` |
| **FAQs** | `push --model faq` | `project-docs/client-review/gate-5-cms-content/faqs/` |
| **Features** | `push --model feature` | `project-docs/client-review/gate-5-cms-content/features/` |
| **Case Studies** | `push --model case-study` | `project-docs/client-review/gate-5-cms-content/case-studies/` |
| **Contact Us (Module)** | `push --model contact-us` | `project-docs/client-review/gate-5-cms-content/contact-us/` |
| **Page Configurations** | `push --model page-config` | `project-docs/client-review/gate-5-cms-content/page-configs/` |
| **Website Tools** | `push --model tool` | `project-docs/client-review/gate-5-cms-content/tools/` |
| **Website Tool Categories** | `push --model tool-category` | `project-docs/client-review/gate-5-cms-content/tool-categories/` |
| **Careers / Jobs** | `push --model job` | `project-docs/client-review/gate-5-cms-content/jobs/` |
| **Events & Webinars** | `push --model event` | `project-docs/client-review/gate-5-cms-content/events/` |
| **Plans & Pricing** | `push --model plan` | `project-docs/client-review/gate-5-cms-content/plans/` |
| **Galleries** | `push --model gallery` | `project-docs/client-review/gate-5-cms-content/galleries/` |
| **Articles** | `push --model article` | `project-docs/client-review/gate-5-cms-content/articles/` |
| **Industries** | `push --model industry` | `project-docs/client-review/gate-5-cms-content/industries/` |
| **Portfolio** | `push --model portfolio` | `project-docs/client-review/gate-5-cms-content/portfolio/` |
| **Legal Policies** | `push --model policy` | `project-docs/client-review/gate-5-cms-content/policies/` |
| **Website Tags** | `push --model tag` | `project-docs/client-review/gate-5-cms-content/tags/` |

Ensure `SERVER_URL` and `CMS_TOKEN` are configured in the environment before live runs.

---

## 2. Step 1: Dry-Run Validation

Always execute a dry run before touching the remote CMS database (dry-run is the default mode):

```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --model blog
```

Confirm that:
- Every JSON file parses with valid syntax.
- All required model fields (`title`, `slug`, `content`, etc.) are present.
- Mongoose strict-mode warnings are resolved (taxonomies are in `metadata`).
- Exit code is 0.

---

## 3. Step 2: Live Seeding & Management

Execute live operations with the mandatory `--apply` flag:

```bash
# Live insertion of blog seeds
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/blog \
  --model blog \
  --apply

# Update existing document by MongoDB ObjectId
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model blog \
  --id "65f8a123bc45de6789012345" \
  --file update.json \
  --apply

# Delete document by MongoDB ObjectId
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model blog \
  --id "65f8a123bc45de6789012345" \
  --apply
```

- Verify that every item returns HTTP 201 Created (or HTTP 200 OK for update/delete).

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
- [ ] **SEO Content Complete:** All modular content authored in `client-context/<model>/.../` (`content.mdx` for CMS-controlled pages; `content.md` for non-CMS) with co-located image assets.
- [ ] **Batch 1 Complete:** Media slots populated via client assets or licensed stock; `project-docs/stock-provenance.json` logged.
- [ ] **Batch 2 Complete:** Content seeds compiled into `project-docs/client-review/gate-5-cms-content/` from validated `client-context/` MDX via `content-pipeline to-seed`.
- [ ] **CMS Open Questions Resolved:** All 28 questions in `gate-5-cms-requirements/open-questions.md` codified into `cms-implementation-rules.md`.
- [ ] **Batch 3 Complete:** Content pipeline operations executed successfully with zero fatal errors.
- [ ] **Gate Containment Verified:** Zero loose markdown files outside designated gate folders.
- [ ] **Codebase Untouched:** `site/` contains zero premature code or scaffold files.

### Downstream Handover to Stage 6
Present Gate 5 in plain language summarizing asset curation, CMS schemas, and seeded records. Upon human approval:
- Advance to **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)** to initialize `site/`, copy `references/gate-6-scaffolding/cms-kit/` to `site/lib/cms/`, wire global components, and construct the live showcase Landing Page.

