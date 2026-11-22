# Gate 1: Site Audit (Read-Only)

> **Gate ID:** `1`  
> **Gate Name:** `site-audit`  
> **Execution Mode:** Read-Only Static Analysis  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Non-Negotiable Invariants

Gate 1 performs a comprehensive, **read-only** architectural audit of an existing Next.js codebase before any CMS integration code is scaffolded or content is migrated.

> [!IMPORTANT]
> **Strict Read-Only Discipline:**
> - Zero modifications to source files, dependencies, package configurations, or environment variables during Gate 1.
> - The agent and tooling must ONLY inspect repository structure and write audit outputs into `.nww-cms/`.

> [!IMPORTANT]
> **Human Approval Barrier:**
> Gate 1 requires explicit human approval via the exact verbatim phrase:
> `APPROVE GATE 1`
> The agent and `cms-state.mjs` strictly refuse to advance to Gate 2 without this exact phrase.

> [!TIP]
> **Context Compaction:**
> At the conclusion of Gate 1 evidence presentation, run `/compact` to compact conversation history and preserve context window headroom for Gate 2.

---

## 2. Step-by-Step Procedure

### Step 1: Initialize State Machine
Inside the target Next.js repository, initialize `.nww-cms/state.json`:

```bash
node <path-to-skill>/scripts/cms-state.mjs init
```

### Step 2: Execute Automated Static Audit
Run the companion `site-audit.mjs` analyzer to scan the target codebase:

```bash
node <path-to-skill>/scripts/cms-state.mjs set-status 1 in_progress
node <path-to-skill>/scripts/site-audit.mjs --out .nww-cms/audit.json
```

The script inspects:
1. **Next.js & React Versions:** Parses `package.json` dependencies and devDependencies.
2. **Router Architecture:** Identifies `app/` (App Router), `pages/` (Pages Router), or `hybrid`. Checks for `src/` directory wrapping.
3. **TypeScript Support:** Checks for `tsconfig.json`.
4. **Package Manager:** Identifies `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, or `bun.lockb`.
5. **Styling Paradigm:** Detects Tailwind CSS (`tailwind.config.*`), CSS Modules, Styled Components, Emotion, or Sass.
6. **Content Sources Inventory:** Detects hardcoded JSX text strings, local Markdown/MDX directories (`content/`, `posts/`), local JSON data files, or existing external CMS SDKs (`@sanity/client`, `contentful`, `@strapi/strapi`).
7. **Route & Page Inventory:** Traverses all pages, identifying static routes (`/`, `/about`, `/contact`), dynamic segments (`/blog/[slug]`), and route groups (`(marketing)`).
8. **Section Breakdown per Page:** Scans page and component trees for semantic sections (Hero, Features, Testimonials, FAQ, CTA Banner, Bento Grid, Stats, Process/Steps, Pricing/Plans, Contact Form).
9. **Existing SEO & Structured Data:** Scans for `generateMetadata`, `export const metadata`, `<Head>`, `next-seo`, sitemaps (`sitemap.js`, `sitemap.xml`), robots (`robots.js`, `robots.txt`), and JSON-LD scripts (`application/ld+json`).
10. **Environment Variable Configuration:** Scans `.env*` files, collecting variable *names only* (redacting all values).
11. **Deployment Target:** Checks for `vercel.json`, `netlify.toml`, or `Dockerfile`.

### Step 3: Author Human Audit Report (`.nww-cms/audit-report.md`)
Read the generated `.nww-cms/audit.json` and compile an executive summary into `.nww-cms/audit-report.md` structured as follows:

```markdown
# Architectural Site Audit Report

## 1. Framework & Runtime Stack
- Next.js Version: <version>
- Router Paradigm: <App Router | Pages Router | Hybrid>
- Language: <TypeScript | JavaScript>
- Package Manager: <pnpm | npm | yarn | bun>
- Styling: <Tailwind CSS | CSS Modules | other>

## 2. Discovered Routes & Page Inventory
| Route Path | Source File | Detected Semantic Sections | Content Source |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Hero, Features, Testimonials, FAQ, CTA | Hardcoded JSX |
| `/about` | `app/about/page.tsx` | Hero, Process, Team, CTA | Hardcoded JSX |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Article Header, Markdown Body, Author Bio | Local MDX (`content/posts`) |

## 3. SEO, Metadata & Structured Data
- Page Metadata Mechanism: <generateMetadata | export metadata | next/head>
- Schema.org JSON-LD Present: <Yes/No - list types>
- Sitemap: <app/sitemap.ts | public/sitemap.xml | None>
- Robots Directives: <app/robots.ts | public/robots.txt | None>

## 4. Environment Variables Present
- Discovered Variable Names: <LIST_OF_NAMES_ONLY>
- Missing NWW CMS Variables: `SERVER_URL`, `CMS_TOKEN`, `REVALIDATE_SECRET`, `SITE_NAME`, `NEXT_PUBLIC_SITE_URL`

## 5. Migration Risk & Complexity Assessment
- Complexity Rating: <Low | Medium | High>
- Key Risks: <e.g., custom markdown plugins, hybrid router transitions, dynamic data fetchers>
```

### Step 4: Present Evidence & Request Approval
1. Set Gate 1 status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 1 awaiting_approval
   ```
2. Present `.nww-cms/audit-report.md` to the user in chat.
3. Prompt user for Gate 1 approval:
   ```markdown
   > [!IMPORTANT]
   > Please review `.nww-cms/audit-report.md`. To proceed to Gate 2 (Content-to-Model Mapping), respond with:
   > `APPROVE GATE 1`
   >
   > [!TIP]
   > **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 2.
   ```
4. Upon receiving `APPROVE GATE 1`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 1 "APPROVE GATE 1"
   ```
