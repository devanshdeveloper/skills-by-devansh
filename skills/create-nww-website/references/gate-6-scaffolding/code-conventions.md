# Code Conventions & Agent Rules

This document establishes the architecture, directory structure, coding standards, and file limits for the Next.js App Router codebase built under `site/`.

## Table of Contents
- [Core Technology Stack & Convention Discovery](#core-technology-stack--convention-discovery)
- [Scaffolding & Dependency Governance](#scaffolding--dependency-governance)
- [File Structure & Granular Line Limits](#file-structure--granular-line-limits)
- [Component Boundaries: Server vs. Client](#component-boundaries-server-vs-client)
- [Canonical Directory Structure (`site/`)](#canonical-directory-structure-site)
- [Scoped AGENTS.md Hierarchy](#scoped-agentsmd-hierarchy)
- [Automated Script Checks & Gate Verification](#automated-script-checks--gate-verification)

---

## Core Technology Stack & Convention Discovery

The website stack is centered on Next.js App Router and Tailwind CSS. The programming language (JavaScript or TypeScript), package manager, folder structure, and naming conventions are **discovered from project files and documentation at run time** using the 5-step detection procedure in [runbook.md](runbook.md#3-runtime-convention-discovery-procedure).

### Discovered Stack Mapping Matrix
| Property | Discovered From | Supported Options | Default / Fallback |
| :--- | :--- | :--- | :--- |
| **Package Manager** | Lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`) | `pnpm`, `npm`, `yarn`, `bun` | `pnpm` |
| **Language** | `tsconfig.json` presence | TypeScript (`.ts`, `.tsx`), JavaScript (`.js`, `.jsx`) | JavaScript (`.js`, `.jsx`) |
| **App Directory** | Root `app/` vs `src/app/` | Root `site/app/` | `site/app/` |
| **Import Alias** | Root `package.json` or `jsconfig.json` | `@/*` | `@/*` |
| **Styling** | Confirmed brief | Tailwind CSS (Pure utility classes in JSX) | Tailwind CSS |

---

## Scaffolding & Dependency Governance

Scaffold the Next.js application inside `site/` at Stage 6 after Gate 5 page specifications are approved, following the verified execution procedure in [runbook.md](runbook.md#4-scaffolding--foundation-execution-protocol).

### Governance Rules:
1. **Environment Requirement:** Node.js version must satisfy `node -v` >= 18.18.0.
2. **Mandatory `--disable-git` Flag:** Skips git initialization inside `site/` to prevent creating a nested git repository within the parent workspace.
3. **Dependency Boundary:** No packages may be installed beyond the official generator output and the approved brief. Never silently add third-party dependencies.
4. **Motion Dependencies:** Install GSAP packages (`gsap`, `@gsap/react`, `lenis/react`) only when the confirmed motion tier requires them per [gsap-animation-tiers.md](gsap-animation-tiers.md). Never install motion dependencies if `motion: disabled`.

---

## Fonts, Media & Pre-Launch Guard

### 1. Fonts & Build-Time Privacy
- Uses `next/font/google`, `next/font/local`, or system font stacks.
- *Verified Next.js Fact:* `next/font/google` automatically downloads CSS and font files at **build time** and hosts them locally alongside static assets. Zero runtime requests are made to Google by client browsers, ensuring complete privacy, GDPR compliance, and offline operation.
- If build-time internet access is unavailable, fall back cleanly to system font stacks (`system-ui`, `-apple-system`, `sans-serif`, `serif`).

### 2. Neutral Placeholders & Image Hygiene
- All image slots render neutral SVG/geometric containers matching blueprint aspect ratios.
- All draft text and placeholders carry `data-placeholder="true"`.
- Zero images, SVGs, or assets may be copied or hotlinked from reference websites.

### 3. Pre-Launch Guard (`noindex` + Preview Banner)
To protect unlaunched sites from being indexed by search engines or mistaken for live production:
- Root `app/layout.js` exports `robots: { index: false, follow: false }` and `site/app/robots.js` serves `Disallow: /` when `NEXT_PUBLIC_PREVIEW_GUARD="true"`.
- Renders `<PreviewBanner />` at the top of the viewport.
- Operational configuration and deactivation checklist items are governed by [runbook.md](runbook.md#6-pre-launch-guard-noindex--preview-banner).

---

## Strict File & Line Limits

To preserve readability, modularity, and assist AI agent maintenance:
1. **Thin Page Server Components (`page.js`):**
   - Maximum **80 lines**.
   - `page.js` acts purely as an orchestrator: fetches data, exports metadata, and renders section components sequentially.
   - Example `page.js`:
     ```javascript
     // site/app/about/page.js
     import HeroSection from './_components/HeroSection';
     import StorySection from './_components/StorySection';
     import ValuesSection from './_components/ValuesSection';
     import TeamSection from './_components/TeamSection';
     import CTABanner from '@/components/CTABanner';

     export const metadata = {
       title: 'About Our Mission & Team',
       description: 'Learn about the principles driving our company.',
       alternates: { canonical: '/about' },
     };

     export default function AboutPage() {
       return (
         <main>
           <HeroSection />
           <StorySection />
           <ValuesSection />
           <TeamSection />
           <CTABanner />
         </main>
       );
     }
     ```
2. **Section Components (`_components/*.js`):**
   - Maximum **250 lines** (hard ceiling 300).
   - Co-located in `site/app/<route>/_components/`.
   - Every section component must open with the section comment matching its blueprint:
     ```javascript
     // section: hero
     ```
3. **Utility, Config & Content Files:**
   - Maximum **500 lines**. Content exceeding 500 lines must be split into section-based objects.
4. **Tailwind-Only Styling & Repeating Elements:**
   - All styling in the Next.js `site/` codebase must use **Tailwind CSS utility classes directly in JSX**.
   - **Prohibited:** Custom CSS files (e.g. `tokens.css`), CSS modules (`*.module.css`), styled-jsx, CSS-in-JS, Sass/Less, and agent-authored CSS rules in `globals.css` (including `@apply` classes).
   - **Prohibited:** Agent-authored inline style props (`style={{...}}`) in JSX components. (CSS `<style>` blocks and inline styling are permitted ONLY in HTML outputs such as Gate 2 variations and review portals).
   - **Repeating Components (Cards, Grids, Tiles):**
     - Rather than creating `@apply` classes in `globals.css` or repeating long class strings manually, extract repeating cards into small, focused React sub-components within the same file or `_components/` (e.g., `function FeatureCard({ title, desc, icon }) { return <div className="relative bg-card border border-border/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1">...</div> }`), or map data over clean JSX elements with standard utility classes.
     - This maintains pure Tailwind utility discipline in JSX, keeps section components modular and readable, and easily respects the strict **<= 250 line limit**.

---

## Component Boundaries: Server vs. Client

- Default to **React Server Components (RSC)** for all pages, layouts, and static section components.
- Use `'use client'` only on the smallest possible leaf component requiring:
  - Interactive state (`useState`, `useReducer`).
  - Browser events and forms with client validation (`onClick`, `onSubmit`).
  - GSAP animations and hooks (`useGSAP`, `useRef`).
- Never place `'use client'` on `page.js` or root `layout.js`.

---

## Project Directory Structure (`site/`)

```
site/
├── app/
│   ├── (marketing)/
│   │   ├── _components/         # Route-specific section components (<=250 lines)
│   │   └── page.js              # Thin page component (<=80 lines)
│   ├── about/
│   │   ├── _components/
│   │   └── page.js
│   ├── blog/
│   │   ├── [slug]/
│   │   │   ├── _components/
│   │   │   └── page.js
│   │   ├── _components/
│   │   └── page.js
│   ├── api/
│   │   └── revalidate/
│   │       └── route.js         # On-demand ISR revalidation handler
│   ├── AGENTS.md                # Scoped agent guide for routes and pages
│   ├── globals.css              # Base styles & Tailwind theme directives
│   ├── layout.js                # Root layout (Nav, Footer, fonts, metadataBase)
│   ├── not-found.js             # 404 handler
│   ├── robots.js                # File-based robots.txt
│   └── sitemap.js               # File-based sitemap.xml
├── components/
│   ├── AGENTS.md                # Scoped agent guide for shared components
│   ├── motion/                  # Client animation wrapper components
│   │   └── HeroMotionWrapper.js
│   ├── Nav.js                   # Shared navigation header (reused 2+ pages)
│   ├── Footer.js                # Shared footer (reused 2+ pages)
│   ├── CTABanner.js             # Shared callout (reused 2+ pages)
│   ├── JsonLd.js                # Schema markup component
│   └── ResponsiveImage.js       # Pre-optimized responsive image component
├── lib/
│   ├── AGENTS.md                # Scoped agent guide for utilities
│   ├── cms/                     # CMS data access layer (copied directly from references/gate-6-scaffolding/cms-kit/)
│   ├── motion.js                # Exported GSAP & CSS motion tokens
│   └── utils.js                 # Helper utilities (cn, formatting)
├── content/
│   ├── AGENTS.md                # Scoped agent guide for content objects
│   ├── shared/                  # Shared copy (nav.js, footer.js)
│   ├── site-settings.js         # Global site settings (contact info, socials)
│   └── <slug>.js                # Verbatim static page copy objects
├── public/
│   └── assets/                  # Optimized WebP images & manifest.json
├── scripts/
│   ├── check-structure.mjs      # File size and colocation validator
│   ├── check-assets.mjs         # Image budget and manifest validator
│   └── make-placeholders.mjs    # Neutral SVG placeholder generator
├── assets-optimize.config.md    # Persisted asset optimizer flags and rationale
├── AGENTS.md                    # Root agent guidelines (<=150 lines)
├── package.json
└── tailwind.config.js
```

---

## Scoped AGENTS.md Files Specification

During Stage 6, the agent scaffolds `site/AGENTS.md` and 4 scoped AGENTS.md files:
1. **Root `site/AGENTS.md`:** Maximum **150 lines**. Must preserve managed block markers:
   ```markdown
   <!-- BEGIN:nextjs-agent-rules -->
   ...
   <!-- END:nextjs-agent-rules -->
   ```
   Never edit inside the managed block. Outside it, specify project-specific rules, pnpm commands, and file-size constraints.
2. **Four Scoped Files:** Created in `site/app/AGENTS.md`, `site/components/AGENTS.md`, `site/lib/AGENTS.md`, and `site/content/AGENTS.md`. Each file must use **exact H2 headings in this exact order**:
   ```markdown
   ## Architecture
   ## Conventions
   ## Anti-patterns
   ## Commands
   ```
   Bullets only; non-obvious, project-specific rules without generic prose.

---

## Automated Verification Scripts & Package Commands

Stage 6 adds three verification scripts to `site/scripts/` and wires them into `package.json`:
- `check:structure`: `node scripts/check-structure.mjs` (verifies thin `page.js` <=80 lines, section <=250 lines, first-line `// section: <id>`, flat `components/`).
- `check:assets`: `node scripts/check-assets.mjs` (verifies all rendered images exist in `public/assets/`, match manifest, and satisfy byte budgets: LCP <=100 KB, general <=60 KB, SVG <=5 KB).
- `check:all`: Executes `pnpm lint && pnpm check:structure && pnpm check:assets`.

*Required `package.json` scripts:*
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "check:structure": "node scripts/check-structure.mjs",
  "check:assets": "node scripts/check-assets.mjs",
  "check:all": "pnpm lint && pnpm check:structure && pnpm check:assets"
}
```
