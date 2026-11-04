# Stage 5 Batch 01: Page Specifications & Layout Architecture

This rulebook governs **Batch 1 of Stage 5**. In this batch, the agent deconstructs every page from `project-docs/client-review/gate-3-page-list/page-list.md` into unified markdown blueprints, authentic verbatim copywriting, and cross-page layout systems.

## Table of Contents
- [1. Operational Mandate & Single Mode](#1-operational-mandate--single-mode)
- [2. Specification Architecture (`page-specs/<slug>/page.md`)](#2-specification-architecture-page-specsslugpagemd)
- [3. Verbatim Copywriting Standards](#3-verbatim-copywriting-standards)
- [4. Cross-Page Layout System (`layout-system.md`)](#4-cross-page-layout-system-layout-systemmd)
- [5. Component Promotion Rule (2+ Pages)](#5-component-promotion-rule-2-pages)
- [6. Batch 1 Completion Checklist](#6-batch-1-completion-checklist)

---

## 1. Operational Mandate & Single Mode

- **Single Mode Enforced:** Gate 5 operates strictly in ONE mode: **Markdown only**. All legacy Next.js and HTML preview modes are permanently deleted.
- **Codebase Untouched:** `site/` remains completely untouched during Stage 5. Scaffolding is deferred exclusively to Stage 6.
- **Deliverables Locations:**
  - Per-page specifications: `page-specs/<slug>/page.md` for every route in `page-list.md`.
  - Shared text/brand units: `page-specs/_shared/<component-slug>.md` (e.g. `shared-nav.md`, `shared-footer.md`, `brand-assets.md`).
  - Cross-page layout system: `project-docs/client-review/gate-5-page-specs/layout-system.md` (containing ONLY one section: `## Shared Components`).

---

## 2. Specification Architecture (`page-specs/<slug>/page.md`)

Each page specification must follow this strict structure:

### 1. Benchmark Reference Alignment
Open every `page.md` with:
```markdown
## 0. Reference Benchmark Mapping & Similar Page Alignment
```
Map the planned page to analogous captured benchmark sub-pages in `project-docs/design-references/<domain>/<slug>/` or `previous-site/<slug>/`. Extract spatial rhythm, grid systems, card density, and CTA placements without copying DOM or CSS classes.

### 2. Section Blueprints
For each section on the page:
- **Section ID:** Matching `site/app/<route>/_components/<SectionName>.js` and `data-section="<id>"`.
- **Reference Benchmark Anchor:** Explicitly attribute structural layout choices to captured benchmark observations or client conversion goals.
- **Layout Blueprint:** Grid configuration (columns, gap, max-width), mobile-to-desktop responsiveness, and spacing.
- **Verbatim Copywriting:** Complete, client-ready headline, subheadline, body copy, and CTA button text.
- **Asset Slots:** Media requirements mapped to 8-tag taxonomy (resolved in Batch 2).

---

## 3. Verbatim Copywriting Standards

- **Zero "Lorem Ipsum":** Prohibit generic placeholder text, repeated filler, or robotic dummy copy.
- **Tone Alignment:** Copy must reflect the client's industry, positioning, and target audience discovered during Gate 0 Intake.
- **Unconfirmed Text:** If specific client facts (e.g. founding year, exact certification numbers) are unconfirmed, mark them with `data-placeholder="true"`.

---

## 4. Cross-Page Layout System (`layout-system.md`)

The cross-page layout spec lives at `project-docs/client-review/gate-5-page-specs/layout-system.md`.
It must contain **ONLY ONE SECTION**:
```markdown
## Shared Components
```
Catalog all global chrome and recurring multi-page elements:
- Global Navigation bar (desktop links, mobile drawer, CTA button)
- Global Footer (brand bio, sitemap links, legal copyright, social icons)
- Shared CTA banners or newsletter subscription bands

---

## 5. Component Promotion Rule (2+ Pages)

To prevent code duplication and keep section components lean:
1. **Route-Specific Components:** Unique to one page -> `site/app/<route>/_components/<SectionName>.js` (<= 250 lines).
2. **Promoted Shared Components:** Reused across **2 or more pages** -> `site/components/<ComponentName>.js` (<= 250 lines).
3. **Thin Page Server Component:** `page.js` acts purely as an orchestrator (<= 80 lines).

---

## 6. Batch 1 Completion Checklist

Before proceeding to Batch 2 (Asset Curation), verify:
- [ ] Every route from `page-list.md` has a complete `page-specs/<slug>/page.md`.
- [ ] Section 0 in every `page.md` anchors layout decisions to benchmark references.
- [ ] Verbatim copywriting is authored for all sections.
- [ ] `layout-system.md` is authored with only `## Shared Components`.
- [ ] Shared components are mapped according to the 2+ pages promotion rule.
- [ ] Zero code has been written in `site/`.

