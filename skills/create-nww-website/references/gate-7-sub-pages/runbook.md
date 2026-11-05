# Sub-Page Build Loop Specification (Stage 7)

Stage 7 executes the incremental sub-page build process. The Home / Landing Page (`site/app/page.js` + `_components/`) was already constructed, styled, animated, and verified during **Stage 6 (Codebase Scaffolding, Foundation Build & Landing Page Showcase)**.

Stage 7 takes every remaining sub-page from `project-docs/page-list.md` (e.g. `about`, `services`, `contact`, `blog`, etc.) and builds, animates, verifies, and approves each one through a disciplined two-gate sub-pipeline (Gates 7a & 7b) before proceeding to the next page.

Pages are built strictly in the order listed in `project-docs/page-list.md`.

## Table of Contents
- [The Sub-Page Sub-Pipeline](#the-sub-page-sub-pipeline)
- [Step-by-Step Implementation Protocol](#step-by-step-implementation-protocol)
  - [Step 1: Ingest Specifications & Confirm](#step-1-ingest-specifications--confirm)
  - [Step 2: Implement Thin Page & Section Components](#step-2-implement-thin-page--section-components)
  - [Step 3: Self-Critique & Automated Diagnostics](#step-3-self-critique--automated-diagnostics)
  - [Step 4: Gate 7a (Build Review)](#step-4-gate-7a-build-review)
  - [Step 5: Gate 7b (Binary QA Sign-Off)](#step-5-gate-7b-binary-qa-sign-off)
  - [Step 6: Mark Completed & Advance](#step-6-mark-completed--advance)

---

## The Sub-Page Sub-Pipeline

```
Ingest Specs -> Confirm -> Code Thin Page & Sections -> Self-Critique -> Gate 7a (Build Review) -> Gate 7b (Binary QA Sign-Off) -> Mark Page Completed
```

---

## Step-by-Step Implementation Protocol

### Step 1: Ingest Specifications & Confirm
Before touching code for sub-page `<slug>`:
1. Read `client-context/<model>/<slug>/content.md` (or `client-context/<slug>/content.md`) and `project-docs/client-review/gate-4-seo-strategy/seo-strategy.md` for section layout, verbatim copy, asset slots, and metadata.
2. Inspect the analogous captured reference sub-pages from `project-docs/design-references/<domain>/<slug>/` (`index.html`, `content.md`, `screenshot.png`) and (if site migration) `previous-site/<slug>/` to review authentic spatial rhythm, card density, and interactive states for this specific page type. (Note: Gate 6 does not require sub-page benchmarking as it focuses solely on the Landing Page / Home).
3. Read `project-docs/page-checklist.md` for QA acceptance criteria.
4. Read `site/AGENTS.md` and the scoped AGENTS.md for each folder the page touches.
5. **Confirm (Self-Check):** Restate in 4–5 bullets:
   - Layout pattern & section sequence.
   - Primary CTA & conversion pathway.
   - Benchmark Reference Alignment: Key spatial rhythm, card density, and structural pattern adopted from the captured benchmark reference.
   - Any client feedback or taste revisions applying to this page.

### Step 2: Implement Thin Page & Section Components
1. **Thin Page Server Component (`site/app/<route>/page.js`):**
   - Strict limit: **Maximum 80 lines**.
   - Server Component by default; never place `'use client'` on `page.js`.
   - Export `metadata` or `generateMetadata` with titles, descriptions, and canonical URL from Stage 4 SEO Strategy or CMS readers.
   - Render section components in sequence.
2. **Co-Located Section Components (`site/app/<route>/_components/`):**
   - Strict limit: **Maximum 250 lines** per file (hard limit 300).
   - Mandatory first-line comment matching section ID:
     ```javascript
     // section: <id>
     ```
   - Render `data-section="<id>"` on the root tag.
   - Semantic landmarks (`<section id="...">`, `<header>`, `<footer>`, `<article>`).
   - **Repeating Elements (Tailwind Utility Discipline):** For repeating card grids or service lists, extract repeating items into focused React sub-components or map data over clean JSX elements using pure Tailwind utility classes; do NOT define custom CSS classes or use `@apply` in `globals.css`.
   - If section requires client state or GSAP animation, isolate into `'use client'` component.
3. **Copy Source Rule:**
   - All text must import from `site/content/<slug>.js`. Zero hardcoded copy in component JSX.
   - Unconfirmed copy blocks carry `data-placeholder="true"`.
4. **GSAP Animation Implementation:**
   - Always wrap in `useGSAP({ scope: container })` for automatic lifecycle cleanup.
   - Only animate `transform` and `opacity`. Never animate layout properties.
   - Wrap triggers in `gsap.matchMedia()` for `prefers-reduced-motion` compliance:
     ```javascript
     'use client';
     import { useRef } from 'react';
     import { useGSAP } from '@gsap/react';
     import gsap from 'gsap';
     import { ScrollTrigger } from 'gsap/ScrollTrigger';

     if (typeof window !== 'undefined') {
       gsap.registerPlugin(ScrollTrigger);
     }

     export default function AnimatedSection({ content }) {
       const container = useRef(null);

       useGSAP(
         () => {
           const mm = gsap.matchMedia();
           mm.add('(prefers-reduced-motion: no-preference)', () => {
             // section: animation-logic
             gsap.from('.hero-headline', {
               opacity: 0,
               y: 20,
               duration: 0.6,
               ease: 'power2.out',
             });
           });
         },
         { scope: container }
       );

       return (
         <section ref={container} id="services-s1-hero" data-section="services-s1-hero">
           ...
         </section>
       );
     }
     ```
5. **Asset Rendering:**
   - Consume images via `ResponsiveImage.js` with explicit aspect ratio and alt text.
   - Set `priority={true}` only on the LCP image. All other images use `loading="lazy"`.

### Step 3: Self-Critique & Automated Checks
Before presenting to the user:
1. Run automated checks:
   ```bash
   pnpm check:structure
   pnpm check:assets
   pnpm lint
   pnpm build
   ```
2. Walk through every check in `project-docs/page-checklist.md` for this page.
3. Initialize `project-docs/client-review/gate-7-sub-pages/<slug>/checklist-state.md` and check off verified items.
4. If any check fails, fix the code immediately and record the resolution.

### Step 4: Gate 7a (Build Review)
Present the built page to the user:
- Local preview URL: `http://localhost:3000/<route>`.
- Summary of created files and component line counts.
- Any deviations from Layout Theory or Design Theory (and justification).
- List of elements flagged with `data-placeholder="true"`.
- User reviews visual structure and provides feedback or clears **Gate 7a**.
- **Gate 7a Halt:** Present sub-page build preview; await approval.

### Step 5: Gate 7b (Binary QA Sign-Off)
Present the completed `project-docs/client-review/gate-7-sub-pages/<slug>/checklist-state.md` showing:
- Verified single `h1`, heading order, and metadata.
- Tested responsive behavior across mobile, tablet, desktop.
- Confirmed WCAG AA contrast, focus rings, and keyboard tab navigation.
- Passing `pnpm check:all` result.
- **Gate 7b Halt:** Run binary QA checklist; await QA sign-off before next sub-page.
- User grants explicit approval for **Gate 7b**.

### Step 6: Mark Completed & Advance
Once Gate 7b is cleared:
1. Mark this page completed in `project-docs/page-list.md`:
   ```markdown
   - [x] Page Name
   ```
2. Append build summary to `site/build-log.md`.
3. Update `project-docs/router-state.md`.
4. Proceed to the next unchecked sub-page in `page-list.md`.
