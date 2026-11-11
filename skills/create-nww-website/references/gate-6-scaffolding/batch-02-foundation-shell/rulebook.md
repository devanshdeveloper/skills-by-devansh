# Batch 02: Design Tokens, Motion Tier & Foundation Shell

**Batch Code:** `batch-02-foundation-shell`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 02 transforms the raw Next.js scaffold into a branded, production foundation shell. It injects design tokens from Gate 2 into Tailwind, initializes the confirmed motion tier in `site/lib/motion.js`, and installs global layout components (`Nav.js`, `Footer.js`, `ResponsiveImage.js`, `Schema.js`, root `app/layout.js`).

> **Global Scope Invariant:** All shell components (`Nav.js`, `Footer.js`, root `layout.js`), theme tokens, and motion tokens built in Batch 02 have **global scope across all future pages**, even though only the Homepage is constructed during Gate 6.

---

## 2. Preconditions & Input Sources

1. **Approved Design Theory:** Read `project-docs/client-review/gate-2-design-theory/design-theory.md` for exact hex colors, typography scales, container max-widths, and radii.
2. **Confirmed Motion Tier:** Read `client-context/answers/batch-02-branding-motion/answers.md` for confirmed animation level (`disabled`, `low`, `medium`, `high`, `max`, `ultra`). Consult [gsap-animation-tiers.md](gsap-animation-tiers.md).
3. **Batch 01 Completed:** Next.js application initialized in `site/`.

---

## 3. Execution Protocol

### Step 1: Wire Design Tokens into `site/app/globals.css`
Extract semantic tokens from `design-theory.md` and declare CSS custom properties under `@layer base`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #...;
    --color-secondary: #...;
    --color-accent: #...;
    --color-background: #...;
    --color-surface: #...;
    --font-heading: '...', sans-serif;
    --font-body: '...', sans-serif;
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
  }
}
```

> **Tailwind-Only Styling Rule:** All styling across `site/` strictly uses pure **Tailwind utility classes directly in JSX**; never write custom component CSS classes or use `@apply` in `globals.css`.

### Step 2: Configure Motion Tier, UI Component Stack & Export `site/lib/motion.js`
Consult [motion-component-stack.md](motion-component-stack.md) and [gsap-animation-tiers.md](gsap-animation-tiers.md). Run the companion script to inspect deterministic install commands for the confirmed tier:
```bash
node skills/create-nww-website/scripts/motion-tier/index.js --tier <confirmed-tier> [--system magicui|cult-ui|kokonutui]
```

- **Initialize shadcn/ui Foundation (All Tiers):**
  Initialize shadcn in JavaScript mode (`"tsx": false` in `components.json` with Base UI default):
  ```bash
  pnpm dlx shadcn@latest init --defaults
  ```
- **If `motion: disabled` (T0 Static):**
  - Do NOT load GSAP skills or install `gsap` or `motion` in `site/package.json`.
  - In `site/lib/motion.js`, export standard CSS transition tokens only.
  - Rely purely on static layout structure and native CSS/Tailwind transitions.
- **If `motion: low` (T1 Subtle):**
  - Install subtle primitives only (`@motion-primitives` or `@react-bits/*-JS-TW`).
  - Zero pinned tracks, zero continuous scroll scrubbing.
- **If `motion: medium` (T2 System - Default):**
  - Pre-load approved GSAP animation skills:
    ```bash
    DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
    DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
    DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
    DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
    ```
  - Install `motion` and exactly **ONE** approved system layer (Magic UI, Cult UI, or Kokonut UI):
    ```bash
    pnpm add motion
    pnpm dlx shadcn@latest add @magicui/bento-grid
    ```
  - Export dual motion tokens (GSAP easing curves and CSS transitions) in `site/lib/motion.js`.
- **If `motion: high | max | ultra` (T3 Showpiece):**
  - Install T2 stack plus smooth scrolling: `pnpm add lenis/react`.
  - Install at most **1 to 2 Aceternity showpieces** (Hero or CTA only, lazy-loaded via `next/dynamic`).
  - If 3D physics / `three` is active (`ultra`), record explicit Gate approval in `site.manifest.json`.

### Step 3: Implement Global Navigation & Footer Shell
- Promote shared navigation header to `site/components/Nav.js` with responsive mobile drawer and backdrop blur.
- Promote shared footer to `site/components/Footer.js` with semantic links, copyright, and brand badges.

### Step 4: Install Core Utility Components
1. **Zero-CLS Image Component (`site/components/ResponsiveImage.js`):**
   - Implements native `next/image` wrapper supporting LQIP blur placeholders and responsive variants per [../batch-03-asset-pipeline-agents/asset-optimization.md](../batch-03-asset-pipeline-agents/asset-optimization.md).
2. **SEO Structured Data Component (`site/components/seo/Schema.js`):**
   - Implements safe, XSS-escaped Schema.org JSON-LD structured data injection.

### Step 5: Wire Root Layout (`site/app/layout.js`)
Assemble root layout with:
- Google Fonts configuration via `next/font/google`.
- Root HTML metadata and Pre-Launch Guard headers (`robots: { index: false, follow: false }`).
- `<PreviewBanner />` rendered at the top of the viewport when `NEXT_PUBLIC_PREVIEW_GUARD="true"`.
- `Nav` and `Footer` wrapping `{children}`.

---

## 4. Deliverables Checklist

- [ ] `site/app/globals.css` populated with `@layer base` theme variables.
- [ ] `site/lib/motion.js` configured matching confirmed motion tier.
- [ ] `site/components/Nav.js` and `site/components/Footer.js` implemented.
- [ ] `site/components/ResponsiveImage.js` and `site/components/seo/Schema.js` installed.
- [ ] `site/app/layout.js` assembled with font providers, Pre-Launch Guard, and root shell.

---

## 5. Next Batch Handover

Upon verifying all checklist items above, proceed to **[Batch 03: Asset Pipeline & Scoped AGENTS.md](../batch-03-asset-pipeline-agents/rulebook.md)** to optimize media, position favicons, and establish the agent rule hierarchy.

