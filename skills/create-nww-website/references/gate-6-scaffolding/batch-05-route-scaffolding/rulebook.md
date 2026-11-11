# Batch 05: Master QA Checklist & App Router Route Stubs

**Batch Code:** `batch-05-route-scaffolding`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 05 generates the master QA acceptance checklist (`project-docs/page-checklist.md`), registers all application routes from the approved `page-list.md` inventory into `site/site.manifest.json`, and scaffolds minimal structural route stubs.

> **Homepage-Only Build Invariant:** In Gate 6, **only the Homepage is constructed as a complete, styled page**. Batch 05 establishes route inventory and checklist scope across all pages, but section components, page layouts, and styling for sub-pages are strictly prohibited from being built in Gate 6. Full sub-page construction occurs strictly in Stage 7.

---

## 2. Preconditions & Input Sources

1. **Approved Page List:** Read `project-docs/client-review/gate-3-page-list/page-list.md` for complete inventory of routes, section IDs, and primary goals.
2. **SEO Strategy:** Read `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` for target keywords and route metadata.
3. **Modular Content:** Sourced from `client-context/<model>/.../` (`content.mdx` or `content.md`).
4. **Batch 01–04 Completed:** Foundation shell, asset pipeline, and CMS client configured.

---

## 3. Execution Protocol

### Step 1: Generate Master QA Acceptance Checklist
Generate `project-docs/page-checklist.md` before building individual pages per [page-checklist.md](page-checklist.md). It codifies binary PASS/FAIL gates across:
- **Global Invariants:** Responsive typography, touch targets >= 44x44px, zero layout shift (CLS), Pre-Launch Guard active.
- **Per-Page Binary Checks:** Minimum 5 distinct substantive sections per page (other than Hero, CTA, FAQ, Contact Us form, and Footer), zero repeated content or exact sections (only section types repeat), High FAQ Density (minimum 10–15 substantive, unique FAQs if FAQs present), Header/Footer presence, section ID data attributes (`data-section="<id>"`), valid metadata, zero broken links.
- **In-Place Revisions Rule:** Do NOT generate `project-docs/theory-revisions.md`. When revisions are requested, edit existing files directly in-place.

### Step 2: Scaffold App Router Route Stubs
For every page slug in `page-list.md`:
1. **Directory & Page File (`site/app/<route>/page.js`):**
   - **Strict Line Limit:** Maximum **80 lines**.
   - Server Component by default; never place `'use client'` on `page.js`.
   - Exports static `metadata` object (title, description, canonical, openGraph).
   - Renders section components in sequential order.
2. **Section Component Stubs (`site/app/<route>/_components/<SectionName>.js`):**
   - **Strict Line Limit:** Maximum **250 lines**.
   - Every section opens with the section comment and renders `data-section="<id>"`:
     ```jsx
     // section: services-s1-hero
     export default function HeroSection({ content }) {
       return (
         <section id="services-s1-hero" data-section="services-s1-hero" className="...">
           ...
         </section>
       );
     }
     ```
3. **Decoupled Content Module (`site/content/<slug>.js`):**
   - Isolates all text copy, headings, and placeholder tags (`data-placeholder="true"`).
   - Keeps section components purely structural.
   - Shared text maps to `site/content/shared/<name>.js`.

### Step 3: Emit Site Manifest (`site/site.manifest.json`)
Emit `site/site.manifest.json` indexing the project slug, confirmed motion tier, active component stack, installed dependencies, and all routes for automated auditing:

```json
{
  "projectSlug": "your-project-slug",
  "generatedAt": "2026-11-11T00:00:00Z",
  "motionTier": "medium",
  "motionStack": {
    "tier": "medium",
    "foundation": "shadcn/ui (Base UI)",
    "systemLayer": "magicui",
    "showpieces": [],
    "allowedComponents": [
      "@magicui/bento-grid",
      "@magicui/shimmer-button"
    ],
    "dependencies": [
      "motion@^12.0.0",
      "clsx@^2.1.1",
      "tailwind-merge@^2.5.4"
    ],
    "gateApprovalNotes": "Standard Tier 2 system stack."
  },
  "routes": [
    {
      "path": "/",
      "component": "site/app/page.js",
      "content": "site/content/home.js",
      "sections": ["home-s1-hero", "home-s2-features", "home-s3-cta"]
    }
  ]
}
```

---

## 4. Deliverables Checklist

- [ ] `project-docs/page-checklist.md` generated with binary QA criteria for all pages.
- [ ] Every slug from `page-list.md` mapped to an App Router route in `site/app/<route>/page.js`.
- [ ] All `page.js` files are thin Server Components (<= 80 lines).
- [ ] Section component stubs created with `data-section="<id>"` (<= 250 lines).
- [ ] Content modules scaffolded in `site/content/<slug>.js`.
- [ ] `site/site.manifest.json` emitted and valid.

---

## 5. Next Batch Handover

Proceed immediately to **[Batch 06: Landing Showcase & Verification](../batch-06-landing-showcase-verification/rulebook.md)** to fully construct the interactive Landing Page showcase, run consistency audits, and obtain Gate 6 human sign-off.

