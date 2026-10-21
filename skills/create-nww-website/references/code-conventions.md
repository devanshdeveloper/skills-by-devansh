# Code Conventions & Agent Rules

This document establishes the architecture, directory structure, coding standards, and file limits for the Next.js App Router codebase built under `site/`.

---

## Core Technology Stack

- **Framework:** Next.js (App Router, latest stable release).
- **Package Manager:** `pnpm` exclusively (`pnpm dev`, `pnpm build`, `pnpm check:all`).
- **Language:** JavaScript only (`.js`, `.jsx`). Zero TypeScript (`.ts`, `.tsx`) or `tsconfig.json`.
- **Styling:** Tailwind CSS with semantic tokens defined in `design-theory.md` and `globals.css`.
- **Animation:** GSAP (GreenSock) with `@gsap/react` (`useGSAP`) and ScrollTrigger, importing tokens from `site/lib/motion.js`.
- **Icons:** Lucide React (`lucide-react`).
- **Pre-Optimized Media:** `site/components/ResponsiveImage.js` (native Server Component reading `site/public/assets/manifest.json`).

---

## Project Scaffolding Command

During Stage 9 Foundation Build, scaffold the Next.js application inside `site/` using this exact command:
```bash
pnpm create next-app@latest site --js --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm
```

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

During Stage 9, the agent scaffolds `site/AGENTS.md` and 4 scoped AGENTS.md files:
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

Stage 9 adds three verification scripts to `site/scripts/` and wires them into `package.json`:
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
