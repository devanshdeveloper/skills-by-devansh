# Code Conventions & Agent Rules

This document establishes the architecture, directory structure, coding standards, and file limits for the Next.js App Router codebase built under `site/`.

---

## Core Technology Stack & Convention Discovery

The website stack is centered on Next.js App Router and Tailwind CSS. The programming language (JavaScript or TypeScript), package manager, folder structure, and naming conventions must be **discovered from project files and documentation at run time**, never hard-coded.

### Runtime Convention Discovery Procedure
Before scaffolding or writing code in `site/`:
1. **Document Inspection:** Read `project-docs/tech-stack.md` and `project-docs/code-conventions.md` if present.
2. **Lockfile Detection:** Check project root for:
   - `pnpm-lock.yaml` -> `pnpm`
   - `package-lock.json` -> `npm`
   - `yarn.lock` -> `yarn`
   - `bun.lockb` / `bun.lock` -> `bun`
   - *Conflict Guard:* If multiple conflicting lockfiles exist in the root, **HALT and ask the human** to resolve the ambiguity.
3. **Language Detection:** Check for `tsconfig.json`. If present -> TypeScript (`.ts`, `.tsx`); otherwise -> JavaScript (`.js`, `.jsx`).
4. **Intake Fallback:** If no existing project files or lockfiles exist, consult intake questionnaire Batch 7 (Q43e) and apply the user's default stack: Next.js App Router, Tailwind CSS, JavaScript, `pnpm`, root `app/`, `@/*`.
5. **Report Output:** Print a concise Convention Discovery Report before scaffolding:
   ```
   --- NWW Convention Discovery Report ---
   Package Manager: pnpm (detected from pnpm-lock.yaml)
   Language: JavaScript (no tsconfig.json found; project default applied)
   App Directory: site/app/ (root app mode)
   Import Alias: @/*
   Styling: Tailwind CSS
   Pre-Launch Guard: Active (noindex + banner enabled)
   ---------------------------------------
   ```

---

## Scaffolding & Dependency Governance

Scaffold the Next.js application inside `site/` at Stage 6 after Gate 5 page specifications are approved, using verified flags:

### 0. Specialized Architecture Skills Pre-Load
Before running the generator or producing code in `site/`, the agent MUST load the 10 specialized architecture, composition, design system, and GSAP skills:
```bash
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/openreview --skill next-best-practices
DISABLE_TELEMETRY=1 npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill design-system
DISABLE_TELEMETRY=1 npx skills add https://github.com/heygen-com/hyperframes --skill gsap
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-performance
DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-timeline
```

### 1. Environment Check
- Verify Node.js availability (`node -v` >= 18.18.0). If Node is missing or package installation fails, stop and report to the user.

### 2. Verified Generator Command
Execute the official generator with flags matching discovered conventions:
```bash
# Example for discovered JavaScript + pnpm stack:
pnpm create next-app@latest site --js --tailwind --app --eslint --import-alias "@/*" --disable-git --use-pnpm
```
- **Mandatory Flag `--disable-git`:** Skips git initialization inside `site/` to prevent creating a nested git repository within the parent workspace.
- **Dependency Boundary:** No packages may be installed beyond the official generator output and the approved brief. Never silently add packages.

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
- Controlled by `NEXT_PUBLIC_PREVIEW_GUARD="true"` in `site/.env.local` (active by default).
- Generates `robots: { index: false, follow: false }` metadata in root `app/layout.js` and dynamic `/robots.txt` disallowing all crawlers.
- Renders `<PreviewBanner />` at the top of the viewport.
- Writes deactivation reminder to `project-docs/launch-checklist.md`.
- *Boundary:* Instructs compliant search engines not to index; does not provide user authentication or prevent unauthorized network access.

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
│   ├── cms/                     # CMS data access layer (client.js, revalidation.js)
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
