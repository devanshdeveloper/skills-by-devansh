# Build-One-Page Loop Specification

Stage 10 executes the page-by-page build process. Rather than building the entire site at once, each page is built, animated, verified against its binary checklist, and approved through a disciplined two-gate sub-pipeline before proceeding to the next page.

Pages are built strictly in the order listed in `project-docs/page-list.md`.

---

## The Per-Page Sub-Pipeline

```
Ingest Specs -> Confirm -> Code Thin Page & Sections -> Self-Critique -> Gate 10a (Build Review) -> Gate 10b (Binary QA Sign-Off) -> Mark Page Completed
```

---

## Step-by-Step Implementation Protocol

### Step 1: Ingest Specifications & Confirm
Before touching code for page `<slug>`:
1. Read `page-specs/<slug>/layout.md` and `project-docs/layout-system.md`.
2. Read `page-specs/<slug>/content.md` for verbatim copy.
3. Read `page-specs/<slug>/assets.md` for media dimensions and asset IDs.
4. Read `project-docs/page-checklist.md` for QA acceptance criteria.
5. Read `site/AGENTS.md` and the scoped AGENTS.md for each folder the page touches.
6. **Confirm (Self-Check):** Restate in 3–5 bullets: layout pattern, section sequence, primary CTA, and any taste revision applying to this page.

### Step 2: Implement Thin Page & Section Components
1. **Thin Page Server Component (`site/app/<route>/page.js`):**
   - Strict limit: **Maximum 80 lines**.
   - Server Component by default; never place `'use client'` on `page.js`.
   - Export `metadata` or `generateMetadata` with titles, descriptions, and canonical URL from `content.md`.
   - Render section components in sequence.
2. **Co-Located Section Components (`site/app/<route>/_components/`):**
   - Strict limit: **Maximum 250 lines** per file (hard limit 300).
   - Mandatory first-line comment matching section ID:
     ```javascript
     // section: <id>
     ```
   - Semantic landmarks (`<section id="...">`, `<header>`, `<footer>`, `<article>`).
   - If section requires client state or GSAP animation, isolate into `'use client'` component.
3. **Copy Source Rule:**
   - For static pages and `cms: none`, read verbatim copy from `site/content/<slug>.js`.
   - For CMS-managed pages, read via `cmsFetch` in `site/lib/cms/client.js`.
   - Every draft text block carries `data-placeholder="true"`.
4. **GSAP Animation Implementation:**
   - Always wrap in `useGSAP({ scope: container })` for automatic lifecycle cleanup.
   - Import all easings and durations from `site/lib/motion.js`.
   - Wrap triggers in `gsap.matchMedia()` for `prefers-reduced-motion` compliance:
     ```javascript
     'use client';
     import { useRef } from 'react';
     import { useGSAP } from '@gsap/react';
     import gsap from 'gsap';
     import { ScrollTrigger } from 'gsap/ScrollTrigger';
     import { motionTokens } from '@/lib/motion';

     gsap.registerPlugin(ScrollTrigger);

     // section: hero
     export default function HeroSection() {
       const container = useRef(null);

       useGSAP(
         () => {
           const mm = gsap.matchMedia();

           mm.add('(prefers-reduced-motion: no-preference)', () => {
             gsap.from('.hero-headline', {
               y: 30,
               opacity: 0,
               duration: motionTokens.heroDuration,
               ease: motionTokens.easeHero,
             });
           });
         },
         { scope: container }
       );

       return (
         <section ref={container} id="hero" className="py-24">
           {/* Section content */}
         </section>
       );
     }
     ```
5. **Assets Rendering:**
   - Render images via `site/components/ResponsiveImage.js` using Asset IDs from `assets.md`.
   - Only the designated LCP candidate gets `priority={true}`.

### Step 3: Self-Critique & Local Verification
Before presenting to the user:
1. Run automated checks:
   ```bash
   pnpm check:structure
   pnpm check:assets
   pnpm lint
   pnpm build
   ```
2. Walk through every check in `project-docs/page-checklist.md` for this page.
3. Initialize `page-specs/<slug>/checklist-state.md` and check off verified items.
4. If any check fails, fix the code immediately and record the resolution.

### Step 4: Gate 10a (Build Review)
Present the built page to the user:
- Local preview URL: `http://localhost:3000/<route>`.
- Summary of created files and component line counts.
- Any deviations from Layout Theory or Design Theory (and justification).
- List of elements flagged with `data-placeholder="true"`.
- User reviews visual structure and provides feedback or clears **Gate 10a**.

### Step 5: Gate 10b (Binary QA Sign-Off)
Present the completed `page-specs/<slug>/checklist-state.md` showing:
- Verified single `h1`, heading order, and metadata.
- Tested responsive behavior across mobile, tablet, desktop.
- Confirmed WCAG AA contrast, focus rings, and keyboard tab navigation.
- Passing `pnpm check:all` result.
- User grants explicit approval for **Gate 10b**.

### Step 6: Mark Completed & Advance
Once Gate 10b is cleared:
1. Mark this page completed in `project-docs/page-list.md`:
   ```markdown
   - [x] Page Name
   ```
2. Append build summary to `site/build-log.md`.
3. Update `project-docs/router-state.md`.
4. Proceed to the next unchecked page in `page-list.md`.
