---
name: integrate-nww-cms
description: Audits an existing Next.js website, maps content to NWW CMS models, scaffolds a typed data-access client, migrates pages one by one with fallback resilience, unifies SEO and structured data, and configures on-demand revalidation. Use when the user asks to integrate NWW CMS into an existing Next.js site, migrate hardcoded Next.js content to NWW CMS, or run /integrate-nww-cms.
disable_model_invocation: true
user_invocable: true
---

# Integrate NWW CMS (`integrate-nww-cms`)

> [!IMPORTANT]
> **Manual-Only Invocation Barrier:**
> This skill executes strictly upon explicit user invocation via `/integrate-nww-cms` (or explicit user request). The agent never activates this skill autonomously on general conversational queries.
>
> **Human Approval Barrier:**
> The agent NEVER advances across any gate, installs any client files, alters page components, or completes revalidation setup without explicit human sign-off. Advancing from Gate N requires the exact verbatim phrase:
> `APPROVE GATE N`
> Colloquial approvals (e.g. "looks good", "proceed", "go ahead") are strictly rejected. Gates must be completed in strict sequence.
>
> **Progressive Disclosure Invariant:**
> The agent MUST read ONLY the active gate's rulebook (`references/gate-N-*/rulebook.md`). Reading future gate rulebooks eagerly is strictly forbidden to preserve context tokens and enforce gate containment.
>
> **Layout & Design Preservation Invariant:**
> Existing page JSX structures, layout wrappers, flex/grid hierarchies, and Tailwind classes must be preserved verbatim. Creating new CSS files or changing visual styles during migration is strictly prohibited.
>
> **Image Approval Discipline:**
> The agent must NEVER pick, suggest, or assign images autonomously. Image slots remain placeholders until explicitly approved by the human operator, stored strictly **one file per page** (`.nww-cms/images/<page-slug>.json`).
>
> **Universal Context Compaction Rule (`/compact` on Each Gate Transaction):**
> At every gate presentation, evidence review, rejection, approval, or transition across the 6-stage pipeline (Gates 1 through 6), the agent MUST instruct and remind the user to run `/compact`:
> `> [!TIP]`
> `> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate N + 1.`

---

## Overview

`integrate-nww-cms` safely bridges an **existing Next.js website** (whether App Router, Pages Router, or hybrid) into the **Next Web Works (NWW) headless CMS**.

It establishes an isolated state machine inside the target repository at `.nww-cms/state.json`, audits existing routes and content sources, maps pages to authoritative NWW CMS backend models, builds a typed zero-dependency data access client, migrates content page-by-page under iterative approval with fallback resilience, unifies SEO and Schema.org JSON-LD structured data, and configures verified on-demand ISR revalidation webhooks.

---

## State Machine Helper (`cms-state.mjs`)

Progress is tracked deterministically in `.nww-cms/state.json` inside the target repository using the companion CLI helper.

> [!TIP]
> **Scripts Over Prompts:** Run `node <path-to-skill>/scripts/cms-state.mjs --help` to inspect CLI commands rather than reading script source files.

### Common Helper Commands

```bash
# Initialize .nww-cms/state.json in target repo
node <path-to-skill>/scripts/cms-state.mjs init [--target <dir>]

# Inspect current gate and status summary
node <path-to-skill>/scripts/cms-state.mjs status [--target <dir>]

# Set gate status (pending | in_progress | awaiting_approval | approved | rejected)
node <path-to-skill>/scripts/cms-state.mjs set-status <N> awaiting_approval [--target <dir>]

# Approve gate N with exact verbatim phrase (advances currentGate)
node <path-to-skill>/scripts/cms-state.mjs approve <N> "APPROVE GATE N" [--target <dir>]

# Reject gate N with recorded human feedback reason
node <path-to-skill>/scripts/cms-state.mjs reject <N> "<reason>" [--target <dir>]

# Record human-approved images for a page slug
node <path-to-skill>/scripts/cms-state.mjs approve-image <page-slug> .nww-cms/images/<page-slug>.json

# Mark a specific page as successfully migrated
node <path-to-skill>/scripts/cms-state.mjs mark-page-migrated <page-slug>
```

---

## 6-Gate Architecture & Rulebook Routing Table

The workflow proceeds strictly through 6 human-gated phases. The agent reads only the rulebook for the currently active gate:

| Gate | Phase Name | Primary Output Deliverable | Human Approval Trigger | Rulebook Location |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Site Audit (Read-Only)** | `.nww-cms/audit.json`, `.nww-cms/audit-report.md` | `APPROVE GATE 1` | [references/gate-1-site-audit/rulebook.md](references/gate-1-site-audit/rulebook.md) |
| **2** | **Content-to-Model Mapping** | `.nww-cms/content-mapping.md` | `APPROVE GATE 2` | [references/gate-2-content-mapping/rulebook.md](references/gate-2-content-mapping/rulebook.md) |
| **3** | **Typed CMS Client Layer** | `lib/cms/*`, `.env.example`, `.nww-cms/client-spec.md` | `APPROVE GATE 3` | [references/gate-3-cms-client/rulebook.md](references/gate-3-cms-client/rulebook.md) |
| **4** | **Page-by-Page Migration** | `.nww-cms/pages/<slug>/migration-log.md`, `.nww-cms/images/<slug>.json` | `APPROVE GATE 4` | [references/gate-4-page-migration/rulebook.md](references/gate-4-page-migration/rulebook.md) |
| **5** | **SEO & Structured Data** | `.nww-cms/seo-audit.md`, `sitemap.ts`, `robots.ts` | `APPROVE GATE 5` | [references/gate-5-seo-metadata/rulebook.md](references/gate-5-seo-metadata/rulebook.md) |
| **6** | **Revalidation & Handoff** | `/api/revalidate`, `.nww-cms/handoff.md`, Manual Test Checklist | `APPROVE GATE 6` | [references/gate-6-revalidation-handoff/rulebook.md](references/gate-6-revalidation-handoff/rulebook.md) |

---

## Authoritative NWW CMS Model References

For exact Mongoose schemas, field definitions, and standing NWW decisions, consult:
- Core Models: [references/models/core/](references/models/core/) (`page-config.md`, `blog.md`, `service.md`, `portfolio.md`, `testimonial.md`, `faq.md`, `contact-us.md`, `tag.md`)
- Feature Models: [references/models/features/](references/models/features/) (`case-study.md`, `tool.md`, `article.md`, `event.md`, `job.md`, `plan.md`, `policy.md`, `gallery.md`)
