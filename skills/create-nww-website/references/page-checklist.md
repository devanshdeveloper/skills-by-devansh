# Page Checklist & Taste QA Specification

Stage 8 audits planning theories against taste standards and generates the master static QA verification checklist. It establishes the binary pass/fail criteria enforced during Stage 10 (Page Build Loop).

The outputs are saved to `project-docs/theory-revisions.md` and `project-docs/page-checklist.md`.

During Stage 10 builds, per-page QA execution results are logged to `page-specs/<slug>/checklist-state.md` and recorded in `site/build-log.md`. The master checklist file itself remains a clean static template.

---

## Taste Verification Pass (Stage 8 Prerequisite)

Before compiling the checklist:
1. **Taste Skill Check:** Verify if `frontend-design` is available per [design-theory.md](design-theory.md) or apply built-in taste rules.
2. **Theory Revisions:** Cross-examine `design-theory.md` and `page-specs/<slug>/layout.md` against taste standards:
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
- [ ] **Layout Fidelity:** Section order, layout pattern, and section count match `page-specs/<slug>/layout.md` exactly. Every section ID appears; no extra sections exist.
- [ ] **Next.js Stack & Components:** Route exists and compiles without console errors. `'use client'` appears only on leaf components requiring state or GSAP animations.
- [ ] **Design Tokens:** Exact semantic hex tokens, modular type scale, and container widths from `design-theory.md` are used; zero hardcoded hex colors or arbitrary font values; tap targets >= 44x44px.
- [ ] **Foundation Imports:** Shared shell components (`Nav`, `Footer`, `ResponsiveImage`) and motion tokens imported from Foundation without local redefinition.
- [ ] **Taste Review:** Exactly ONE section is designated the "bold moment" and named here: `[Section ID]`. No other section uses competing entrance animations. Zero generic AI tells present.
- [ ] **Typography Discipline:** Maximum of 2 typefaces; body line lengths enforced between 65–75ch; body text >= 16px on mobile; no all-caps body text.
- [ ] **Animation Discipline (GSAP + motion tokens):**
  - [ ] Motion matches `Motion intent` from blueprint (defaults to `static by design`).
  - [ ] Every tween imports easing and duration from `site/lib/motion.js`.
  - [ ] Animations wrapped in `useGSAP({ scope: container })` with automatic cleanup.
  - [ ] Wrapped in `gsap.matchMedia()` respecting `prefers-reduced-motion`.
  - [ ] Zero layout shift (animates `transform` and `opacity` only).
  - [ ] Initial HTML is fully rendered; no content hidden without a no-JS fallback.
  - [ ] Tailwind transitions and GSAP transforms do not fight on the same element.
- [ ] **Assets & Images:**
  - [ ] Every rendered image maps to an Asset ID in `page-specs/<slug>/assets.md`.
  - [ ] Final optimized WebP file exists in `site/public/assets/`.
  - [ ] Alt text matches `content.md` verbatim (or `alt=""` for decorative role).
  - [ ] Only the designated LCP candidate image has `priority={true}`.
  - [ ] Rendered via `ResponsiveImage` with pre-sized aspect ratio.
  - [ ] `pnpm check:assets` passes with zero errors and zero over-budget files.
- [ ] **SEO & Metadata:**
  - [ ] Exactly one semantic `<h1>` containing the primary topic; no skipped heading levels.
  - [ ] Title <= 60 characters and description <= 155 characters match `content.md`.
  - [ ] Self-referential canonical URL configured.
  - [ ] JSON-LD structured data matches visible content.
  - [ ] All internal links from `content.md` exist with specified anchor text.
  - [ ] Page is in `sitemap.js` unless marked `noindex`.
- [ ] **Responsive Integrity:** Tested across mobile (375px), tablet (768px), and desktop (1440px) without horizontal scroll or layout breaking.
- [ ] **Accessibility Floor:** WCAG AA contrast (>=4.5:1 text, >=3:1 large text); visible focus rings on all interactive elements; semantic landmarks used.
- [ ] **Copy & Placeholder Review:** Every text block matches approved `content.md` verbatim; every draft block carries `data-placeholder="true"`; content remains fully readable with JavaScript disabled.
- [ ] **CMS Checks (if CMS-managed page):**
  - [ ] Content read via `cmsFetch` in `site/lib/cms/client.js`.
  - [ ] Uses single resource tag `cms:<resource>` produced by `tagFor()`.
  - [ ] Rendered rich text HTML passes server-side sanitizer.
  - [ ] Only published, non-deleted posts render; missing posts return `notFound()`.
- [ ] **Build Check:** `pnpm lint` and `pnpm build` pass cleanly for this route.

*(Repeat per-page section for all pages in `page-list.md`)*

---

## Foundation Build Checklist (Stage 9)
Run once during Stage 9 Foundation Build:
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

## Cross-Page Consistency Pass (Stage 11)
Run across all built pages prior to Gate 11:
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

When building page `<slug>` in Stage 10:
1. Copy the per-page checklist block into `page-specs/<slug>/checklist-state.md`.
2. As each check is verified, mark `- [x]`.
3. If an item fails, fix the code immediately and record what was changed.
4. Present `checklist-state.md` to the user at **Gate 10b (Binary QA Sign-Off)**.
5. Append final verification summary to `site/build-log.md`.

---

## Gate 8 Review Checklist

- [ ] All theory revisions documented in `project-docs/theory-revisions.md`.
- [ ] Master checklist template authored at `project-docs/page-checklist.md`.
- [ ] Per-page checks include binary pass/fail criteria for structure, taste, SEO, motion, and assets.
- [ ] User approves checklist criteria before initiating Stage 9 (Foundation Build).
