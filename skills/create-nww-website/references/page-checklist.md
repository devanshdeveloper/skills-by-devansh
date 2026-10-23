# Page Checklist & Taste QA Specification

The master static QA verification checklist establishes binary pass/fail criteria across individual pages, the foundation shell, and the final production audit. It is generated during **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)** and enforced across Stage 6, Stage 7 (Sub-Page Build Loop), and Stage 8 (Final Verification & Handover).

The outputs are saved to `project-docs/theory-revisions.md` and `project-docs/page-checklist.md`.

During Stage 7 sub-page builds, per-page QA execution results are logged to `page-specs/<slug>/checklist-state.md` and recorded in `site/build-log.md`. The master checklist file itself remains a clean static template.

---

## Taste Verification Pass (Stage 6 Prerequisite)

Before compiling the checklist in Stage 6:
1. **Taste Skill Check:** Verify if `frontend-design` is available per [design-theory.md](design-theory.md) or apply built-in taste rules.
2. **Theory Revisions:** Cross-examine `design-theory.md` and `page-specs/<slug>/page.md` against taste standards:
   - Identify generic defaults (warm-cream defaults, unearned fade-and-slide-up animations across multiple sections).
   - Revise theories in place to ensure distinctive styling justified by client references.
   - Record every modification in `project-docs/theory-revisions.md` (what changed, why, and which files were updated).

---

## Master Checklist Structure (`project-docs/page-checklist.md`)

```markdown
# Master QA Checklist & Taste Quality Contract

## Theory Revisions Summary
[Summary of adjustments made during taste review, or "No revisions needed — theories already avoid generic defaults."]

---

## [Page Name] (`/route-slug`)

- [ ] **Structure & Line Limits:** Thin page server component (`page.js`) is <= 80 lines; section components in route `_components/` are <= 250 lines; each section file opens with `// section: <id>`; no cross-route imports; no new components in `site/components/` unless reused across 2+ pages; no `'use client'` on `page.js`; `pnpm check:structure` passes.
- [ ] **Layout Fidelity:** Section order, layout pattern, and section count match `page-specs/<slug>/page.md` exactly. Every section ID appears; no extra sections exist.
- [ ] **Next.js Stack & Components:** Route exists and compiles without console errors. `'use client'` appears only on leaf components requiring state or GSAP animations.
- [ ] **Design Tokens:** Exact semantic hex tokens, modular type scale, and container widths from `design-theory.md` are used; zero hardcoded hex colors or arbitrary font values; tap targets >= 44x44px.
- [ ] **Foundation Imports:** Shared shell components (`Nav`, `Footer`, `ResponsiveImage`) and motion tokens imported from Foundation without local redefinition.
- [ ] **Taste Review:** Exactly ONE section is designated the "bold moment" and named here: `[Section ID]`. No other section uses competing entrance animations. Zero generic AI tells present.
- [ ] **Typography Discipline:** Maximum of 2 typefaces; body line lengths enforced between 65–75ch; body text >= 16px on mobile; no all-caps body text.
- [ ] **Animation Discipline (GSAP + motion tokens):**
  - [ ] No animation on layout properties (`width`, `height`, `margin`, `padding`, `top`, `left`).
  - [ ] Animations use only `transform` and `opacity`.
  - [ ] Animations wrapped in `useGSAP({ scope: container })` with automatic cleanup.
  - [ ] Wrapped in `gsap.matchMedia()` respecting `prefers-reduced-motion`.
  - [ ] No uniform scroll-triggered entrance applied to every section.
  - [ ] Duration and easing strictly match `design-theory.md` motion tokens.
  - [ ] Tailwind transitions and GSAP transforms do not fight on the same element.
  - [ ] All section text present in initial server-rendered HTML (animations run post-hydration only).
- [ ] **Copy & Placeholder Audit:**
  - [ ] Copy matches `page-specs/<slug>/page.md` verbatim (letter for letter, punctuation for punctuation).
  - [ ] Copy imported from `site/content/<slug>.js`; zero hardcoded text strings in section components.
  - [ ] Every unconfirmed text block carries `data-placeholder="true"`.
  - [ ] Zero unapproved placeholders present (`[Insert X]`, `Lorem Ipsum`, `TODO`).
- [ ] **Asset Implementation:**
  - [ ] Every asset slot from `page-specs/<slug>/page.md` is rendered; zero missing slots.
  - [ ] Rendered using `ResponsiveImage.js` with WebP srcset, sizes attribute, and explicit width/height.
  - [ ] Cumulative Layout Shift is zero (CLS = 0).
  - [ ] LCP image has `priority={true}` (or `fetchpriority="high"`).
  - [ ] Non-LCP images have `loading="lazy"`.
  - [ ] All images have descriptive, non-empty alt text.
  - [ ] Stock images (if used) carry proper provider attribution; Unsplash images include UTM parameters.
- [ ] **SEO & Metadata:**
  - [ ] Page exports static or dynamic `metadata` matching `page-specs/<slug>/page.md`.
  - [ ] Title contains target keyword and ends with brand name.
  - [ ] Meta description <= 155 characters with CTA.
  - [ ] Canonical URL is absolute and self-referencing.
  - [ ] Exactly ONE `<h1>` on the page; headings follow strict H1 -> H2 -> H3 nesting.
  - [ ] JSON-LD schema injected via `<script type="application/ld+json">`.
  - [ ] OG image configured (1200x630).
- [ ] **Accessibility (WCAG AA):**
  - [ ] All text meets 4.5:1 contrast against its background (3:1 for large text).
  - [ ] All interactive elements keyboard focusable with visible focus ring.
  - [ ] Form inputs have associated `<label>` elements.
  - [ ] Links have descriptive text (no "click here").

---

## Foundation Build Checklist (Stage 6)
Run during Stage 6 Foundation Build:
- [ ] Keyboard focus states visible on all interactive elements.
- [ ] WCAG AA contrast met across all theme tokens.
- [ ] Reduced motion respected in all global components.
- [ ] Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) present in root layout.
- [ ] No hardcoded hex values in code.
- [ ] Nav/Footer copy reads from `site/content/shared/*.js`.
- [ ] Site settings read from `site/content/site-settings.js`.
- [ ] `site/AGENTS.md` (<=150 lines, managed blocks preserved) and 4 scoped AGENTS.md files created.
- [ ] Check scripts (`check-structure.mjs`, `check-assets.mjs`, `make-placeholders.mjs`) created.
- [ ] Asset optimizer executed; `site/assets-optimize.config.md` persisted.
- [ ] `site/components/ResponsiveImage.js` implemented as native Server Component.
- [ ] Every CMS fetch uses `cmsFetch`; no other file sets `next.tags` or `next.revalidate`.
- [ ] Revalidation route (`site/app/api/revalidate/route.js`) responds 401 without secret, 400 for unknown resource, 200 on valid POST.
- [ ] `SERVER_URL`, `CMS_SITE_KEY`, `REVALIDATE_SECRET` never leaked to client bundles.
- [ ] `pnpm check:all` passes cleanly.

---

## Cross-Page Consistency Pass (Stage 8)
Run across all built pages prior to Gate 8:
- [ ] Recurring components (Nav, Footer, CTABanner) render identically across all pages.
- [ ] No duplicate titles, descriptions, or `h1`s across any routes.
- [ ] No orphan pages (every route reachable within 3 clicks).
- [ ] All 301 redirects return 301 and point to active 200 routes.
- [ ] Custom 404 page works cleanly.
- [ ] Zero `.ts` / `.tsx` files and zero `tsconfig.json` exist in `site/`.
- [ ] Production build succeeds (`pnpm build`).
- [ ] `pnpm check:all` passes with zero errors.
- [ ] `project-docs/structure-audit.md` generated with zero unresolved High findings.
```

---

## Per-Page State Logging Protocol

When building page `<slug>` in Stage 7:
1. Copy the per-page checklist block into `page-specs/<slug>/checklist-state.md`.
2. As each check is verified, mark `- [x]`.
3. If an item fails, fix the code immediately and record what was changed.
4. Present `checklist-state.md` to the user at **Gate 7b (Binary QA Sign-Off)**.
5. Append final verification summary to `site/build-log.md`.

---

## Stage 6 QA Integration Checklist

- [ ] All theory revisions documented in `project-docs/theory-revisions.md`.
- [ ] Master checklist template authored at `project-docs/page-checklist.md`.
- [ ] Per-page checks include binary pass/fail criteria for structure, taste, SEO, motion, and assets.
- [ ] User approves checklist criteria alongside Stage 6 Foundation and Landing Page showcase.
