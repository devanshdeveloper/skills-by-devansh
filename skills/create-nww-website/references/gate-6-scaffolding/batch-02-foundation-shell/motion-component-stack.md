# Motion Tiers & UI Component Stack Architecture

This reference specifies the multi-tier UI and animation component stack for Next.js App Router codebases generated under `site/` by `create-nww-website` and `nww`. It governs the installation, dependency isolation, component registry selection, and animation ownership boundaries between GSAP and Motion.

## Table of Contents
- [1. The Unified Motion Tier Matrix](#1-the-unified-motion-tier-matrix)
- [2. Component Stack Architecture & Registries](#2-component-stack-architecture--registries)
- [3. Deterministic Scaffolding by Tier](#3-deterministic-scaffolding-by-tier)
- [4. GSAP & Motion Coexistence (Separation of Concerns)](#4-gsap--motion-coexistence-separation-of-concerns)
- [5. Tailwind Keyframes & Token Placement](#5-tailwind-keyframes--token-placement)
- [6. Section Conventions & Component Isolation](#6-section-conventions--component-isolation)
- [7. Site Manifest Schema (`site.manifest.json`)](#7-site-manifest-schema-sitemanifestjson)
- [8. Workspace MCP Server Architecture (`.agents/mcp_config.json`)](#8-workspace-mcp-server-architecture-agentsmcp_configjson)

---

## 1. The Unified Motion Tier Matrix

The repository unifies the 4 conceptual motion tiers (T0–T3) with the confirmed intake motion values (`disabled`, `low`, `medium`, `high`, `max`, `ultra`):

| Tier | Intake Value | Foundation | Allowed Component Registries | Showpiece Allowance | Dependency Cost | Core Interaction Rules |
|:---:|:---|:---|:---|:---:|:---|:---|
| **T0 (Static)** | `disabled` | shadcn/ui (static) | Pure CSS / Tailwind hover only | **0** | **0 KB** (zero JS motion deps) | Static layouts; native CSS/Tailwind transitions on hover/focus; 100% `prefers-reduced-motion` compliant. |
| **T1 (Subtle)** | `low` | shadcn/ui | Motion-Primitives (CSS style), React Bits (`-JS-TW`) | **0** | Minimal (`motion` optional, <= 15KB) | Gentle micro-interactions, hover scale (1.02), subtle scroll fades (15–20px translateY), stagger <= 0.05s. Zero pinning, zero continuous scrubbing. |
| **T2 (System)** | `medium` *(Default)* | shadcn/ui | **Pick ONE System Layer:** Magic UI, Cult UI, or Kokonut UI | **0** (System components only) | `motion` (~30KB gzipped) + GSAP core | Coordinated entrance pacing, `ScrollTrigger.batch()`, number counter tickers, sticky navbar backdrop blur, bento grids, marquee banners. Max 1 bold moment per page. |
| **T3 (Showpiece)** | `high` / `max` / `ultra` | shadcn/ui | T2 System Layer + **Max 1–2 Aceternity showpieces** | **Max 1–2** (Hero or Primary CTA only) | `motion` + GSAP + `lenis/react` (+ `three` on `ultra` with Gate approval) | Pinned tracks, masked text reveals, magnetic buttons, 3D card tilt/peel, glow cards. All showpieces lazy-loaded via `next/dynamic`. |

---

## 2. Component Stack Architecture & Registries

### A. Foundation: shadcn/ui
- **Status:** Verified.
- **Default Headless Engine:** Base UI (`@base-ui/react`) is the default as of July 2026. Radix remains supported via `-b radix`.
- **JavaScript Mode:** When initialized with `"tsx": false` in `components.json`, shadcn CLI generates clean JavaScript (`.jsx`) files under `site/components/ui/`.
- **Initialization Command:**
  ```bash
  pnpm dlx shadcn@latest init --defaults
  ```

### B. System Layer (Pick Exactly ONE per Site)
Never install multiple complete component systems on one site. Pick exactly one system layer based on brand direction:
1. **Magic UI (`@magicui`):**
   - *Best For:* Modern SaaS, developer tooling, sleek dark-mode tech brands.
   - *Verified Command:* `pnpm dlx shadcn@latest add @magicui/<component-name>`
   - *Dependencies:* `motion`, `clsx`, `tailwind-merge`
   - *License:* MIT
2. **Cult UI (`@cult-ui`):**
   - *Best For:* Creative agency, typography-driven, and avant-garde editorial websites.
   - *Verified Command:* `pnpm dlx shadcn@latest add @cult-ui/<component-name>`
   - *Dependencies:* `motion`, `@base-ui/react`, Tailwind CSS
   - *License:* MIT
3. **Kokonut UI (`@kokonutui`):**
   - *Best For:* Clean, accessible, modular enterprise and business web applications.
   - *Verified Command:* `pnpm dlx shadcn@latest add @kokonutui/<component-name>`
   - *Dependencies:* `motion`, `lucide-react`, Tailwind CSS
   - *License:* MIT

### C. Small Primitives & Utilities
Allowed for targeted component enhancements without full kit overhead:
- **Motion-Primitives (`@motion-primitives`):** Layout transitions, text effects, animated tabs. (MIT)
- **React Bits (`@react-bits`):** Tailored text effects and background animations (`npx shadcn add @react-bits/<Name>-JS-TW`). (MIT + Commons Clause)
- **Animata:** Small copy-paste interaction components (`https://animata.design/r/<name>.json`). (MIT)
- **Eldora UI (`@eldoraui`):** Subtle grid overlays and interactive borders. (MIT)
- **Fancy Components (`@fancy`):** Creative canvas & physics utilities. (MIT)
- **Kibo UI (`@kibo-ui`):** Open-source dashboard, chart, and table components maintained by Shadcnblocks. (MIT)

### D. Showpieces (Capped at 1–2 per Site — T3 Only)
- **Aceternity UI (`@aceternity`):**
  - *Best For:* High-impact Hero sections and primary conversion CTA showpieces (e.g. Lamp container, Sparkles, Background Beams, 3D Pin).
  - *Hard Limit:* Maximum **1 to 2 showpiece components** per site.
  - *Placement:* Confined strictly to the **Hero section** or **Primary CTA banner**.
  - *Lazy-Loading Invariant:* Must always be loaded via `next/dynamic` with `{ ssr: false }`.
  - *Heavy Dependencies:* Any showpiece requiring `three` or WebGL requires an explicit Gate sign-off recorded in `site.manifest.json`.

### E. Component Directories & Marketplace Registries
- **21st.dev (`twenty-first`):**
  - *Role:* Comprehensive community marketplace & design directory indexing 10,000+ Tailwind & React components across shadcn, Magic UI, Aceternity, and custom community creators.
  - *MCP Integration:* Available as a local stdio MCP server (`npx -y @21st-dev/magic@latest`) or hosted remote endpoint (`https://21st.dev/api/mcp`).
  - *Environment Variable:* Uses `API_KEY: "${API_KEY_21ST}"` in `site/.agents/mcp_config.json`.
  - *Access & Hygiene:* Free component searching and logo retrieval are available without upfront payment; high generation limits utilize a free personal key generated at `21st.dev/settings/api-keys`. Always document as a commented placeholder in `site/.env.example`; never commit or print live keys.

### F. Dropped / Forbidden Libraries
- **Skiper UI:** **DROPPED.** Free tier requires mandatory visible public attribution backlink; Pro tier requires proprietary paid license key.
- **Origin UI:** **DROPPED.** Repository absorbed into Cal.com monorepo (`cosscom/coss`); legacy snapshot with copyleft AGPL-3.0 license risk.

---

## 3. Deterministic Scaffolding by Tier

The companion script `skills/create-nww-website/scripts/motion-tier/index.js` outputs exact commands for the chosen tier. Future agents run:

```bash
# Print install commands for chosen tier
node skills/create-nww-website/scripts/motion-tier/index.js --tier medium --system magicui
```

### Execution Steps by Tier:

#### 1. Tier 0 (`disabled`):
- Do **NOT** install `gsap`, `@gsap/react`, or `motion`.
- Initialize shadcn in JS mode:
  ```bash
  pnpm dlx shadcn@latest init --defaults
  ```
- Ensure `site/lib/motion.js` exports pure CSS transitions only.

#### 2. Tier 1 (`low`):
- Initialize shadcn with `"tsx": false`.
- Install lightweight primitives only (e.g., Motion-Primitives or React Bits).
- Micro-interactions only: hover scale (`scale: 1.02`), scroll fade (`y: 20`, `opacity: 0`). Zero continuous scroll scrubbing.

#### 3. Tier 2 (`medium` - Default):
- Initialize shadcn with `"tsx": false`.
- Pre-load approved GSAP skills:
  ```bash
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-core
  DISABLE_TELEMETRY=1 npx skills add https://github.com/greensock/gsap-skills --skill gsap-scrolltrigger
  ```
- Install `motion` and the chosen system layer components:
  ```bash
  pnpm add motion
  pnpm dlx shadcn@latest add @magicui/bento-grid
  pnpm dlx shadcn@latest add @magicui/shimmer-button
  ```

#### 4. Tier 3 (`high` / `max` / `ultra`):
- Install T2 stack plus smooth scrolling:
  ```bash
  pnpm add lenis/react
  ```
- Install at most 1–2 approved Aceternity showpieces for the Hero or primary CTA:
  ```bash
  pnpm dlx shadcn@latest add @aceternity/sparkles
  ```
- If 3D canvas / `three` is required (on `ultra`), log gate approval in `site.manifest.json`.

---

## 4. GSAP & Motion Coexistence (Separation of Concerns)

To prevent visual collisions, jank, and animation bugs, the division of responsibility between GSAP and Motion is strictly enforced:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAGE-LEVEL VIEWPORT                        │
│  GSAP ScrollTrigger & Ticker (Smooth Scroll, Pinned Tracks)     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ OUTER WRAPPER (ref={containerRef})                      │   │
│   │ GSAP owns: ScrollTrigger.batch(), entrance y/opacity    │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │ INNER COMPONENT (<motion.div> / Magic UI / UI)   │   │   │
│   │   │ Motion owns: hover scale, spring physics, tap,  │   │   │
│   │   │ layout morphs, interactive border glow          │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Non-Negotiable Rules:
1. **Wrapper vs. Target Separation:** Never attach both a GSAP tween/trigger and a `motion.div` to the exact same DOM element. GSAP animates the outer container (`ref={containerRef}`), while Motion animates the inner element.
2. **Property Segregation:** Never mutate the same CSS transform property (`x`, `y`, `scale`) from both GSAP and Motion simultaneously.
3. **Accessibility Invariant (`prefers-reduced-motion`):**
   - GSAP: Wrap all scroll tweens inside `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", ...)`.
   - Motion: Wrap the root layout in `<MotionConfig reducedMotion="user">` so all component springs and transitions freeze automatically for users requesting reduced motion.

---

## 5. Tailwind Keyframes & Token Placement

All keyframes required by animated components (such as `marquee`, `shimmer`, `meteor`, `pulse`, `glow`) **MUST be defined in `site/tailwind.config.js`** under `theme.extend.keyframes` and `theme.extend.animation`.

> **Tailwind-Only Rule:** `site/app/globals.css` is strictly restricted to `@layer base` theme variables in `:root`. Never write custom `.css` rules, CSS modules, or `@apply` classes in `globals.css`. Placing keyframes in `tailwind.config.js` maintains 100% utility discipline.

### Example `site/tailwind.config.js` Animation Extension:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
```

---

## 6. Section Conventions & Component Isolation

Every section component generated under `site/app/<route>/_components/` must maintain the mandatory section shell:
1. **Comment on line 1:** `// section: <id>`
2. **Root DOM Attribute:** `<section id="<id>" data-section="<id>" className="...">`
3. **Strict Line Limit:** Maximum **250 lines** per section component (thin `page.js` <= 80 lines).
4. **Sub-Component Nesting:** Any UI library component (e.g. BentoGrid, Marquee, ShimmerButton) must be rendered *inside* this section component shell.
5. **T3 Lazy-Loading:** Any Aceternity or heavy showpiece component must be imported dynamically:
   ```javascript
   import dynamic from 'next/dynamic';

   const SparklesCore = dynamic(
     () => import('@/components/ui/sparkles').then((mod) => mod.SparklesCore),
     { ssr: false, loading: () => <div className="absolute inset-0 bg-transparent" /> }
   );
   ```

---

## 7. Site Manifest Schema (`site.manifest.json`)

Batch 05 records the motion tier, active component stack, and package dependencies in `site/site.manifest.json`:

```json
{
  "projectSlug": "your-project-slug",
  "generatedAt": "2026-11-11T12:00:00.000Z",
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
    "mcpServers": [
      {
        "id": "shadcn",
        "command": "npx",
        "args": ["shadcn@latest", "mcp"],
        "transport": "stdio"
      },
      {
        "id": "magicuidesign-mcp",
        "command": "npx",
        "args": ["-y", "@magicuidesign/mcp@latest"],
        "transport": "stdio"
      }
    ],
    "gateApprovalNotes": "Standard Tier 2 system stack. No heavy dependencies."
  },
  "routes": [
    {
      "path": "/",
      "component": "site/app/page.js",
      "content": "site/content/home.js",
      "sections": ["home-s1-hero", "home-s2-features", "home-s3-faq", "home-s4-cta"]
    }
  ]
}
```

If any component beyond the approved tier or requiring heavy 3D dependencies (`three`) is installed, `"gateApprovalNotes"` must cite the human approval decision and rationale.

---

## 8. Workspace MCP Server Architecture (`.agents/mcp_config.json`)

To enable future AI agents to query component registries directly rather than guessing code or APIs, Stage 6 Batch 02 configures Model Context Protocol (MCP) servers scoped to the generated codebase.

### A. Non-Blocking Helper Invariant
> **Strict Invariant:** MCP servers are **optional developer acceleration helpers**. The website application codebase (`site/`) must build, lint, compile, and execute 100% cleanly without any MCP server running or configured. Never couple site runtime dependencies to MCP tooling.

### B. Workspace Configuration Location
- **Path:** `site/.agents/mcp_config.json`
- **Scope:** Workspace-only. Loaded automatically by Antigravity IDE and CLI when working in `site/`.
- **Manual Authoring Invariant:** AI agents must **author this file using native editor tools (`write_file`)**. Running interactive CLI scripts (such as `shadcn mcp init`) is strictly forbidden by repository editing discipline.

### C. Zero-Secrets & Credential Hygiene
- All approved baseline MCP servers connect to public registries over local `stdio` or remote HTTPS without requiring credentials.
- For marketplace MCP servers supporting personal API keys (such as `21st.dev`), pass the key strictly via environment variable substitution: `API_KEY: "${API_KEY_21ST}"`.
- **Never write, commit, or print API keys, tokens, or credentials.**
- If an optional proprietary or marketplace token is required (e.g. `API_KEY_21ST`, `ACETERNITY_PRO_TOKEN`), it must be declared exclusively as an environment variable placeholder in `site/.env.example` (never committed with a live secret).

### D. Tier-to-MCP Matrix

Because the official `shadcn` MCP server automatically inspects `components.json` and queries all custom registry endpoints mapped within it, it acts as a unified gateway for multiple libraries:

| Tier | Intake Value | Active MCP Servers | Transport | Notes |
|:---:|:---|:---|:---:|:---|
| **T0 (Static)** | `disabled` | `shadcn` | `stdio` | Official shadcn CLI registry query tool. |
| **T1 (Subtle)** | `low` | `shadcn`<br>*(optional: `twenty-first`)* | `stdio` | Queries Motion-Primitives and React Bits registries configured in `components.json`. |
| **T2 (System)** | `medium` *(Default)* | `shadcn`<br>+ `magicuidesign-mcp` (if Magic UI)<br>*(optional: `twenty-first`, `kibo-ui`)* | `stdio` | If Cult UI or Kokonut UI is chosen, queried directly through `shadcn` MCP via `components.json`. |
| **T3 (Showpiece)** | `high` / `max` / `ultra` | T2 MCP Stack<br>*(optional: `twenty-first`)* | `stdio` | Aceternity UI components are queried directly through `shadcn` MCP via `components.json`. |

### E. Configuration Templates (`site/.agents/mcp_config.json`)

#### 1. Baseline Configuration (T0 Static, T1 Subtle, Cult UI, Kokonut UI):
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

#### 2. Magic UI System Configuration (T2 / T3 Default):
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "magicuidesign-mcp": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
}
```

#### 3. With Dashboard / Kibo UI Extension:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "kibo-ui": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://www.kibo-ui.com/api/mcp/mcp"]
    }
  }
}
```

#### 4. With 21st.dev Component Marketplace Extension:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "magicuidesign-mcp": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    },
    "twenty-first": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": {
        "API_KEY": "${API_KEY_21ST}"
      }
    }
  }
}
```

