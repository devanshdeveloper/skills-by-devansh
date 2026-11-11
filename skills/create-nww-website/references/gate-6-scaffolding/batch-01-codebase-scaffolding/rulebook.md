# Batch 01: Codebase Scaffolding & Environment Setup

**Batch Code:** `batch-01-codebase-scaffolding`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 01 initializes the Next.js App Router codebase in `site/`. It establishes runtime conventions, synchronizes the project slug, configures git ignore boundaries, emits the environment variable contract (`site/.env.example`), and enforces App Router standards per [code-conventions.md](code-conventions.md).

> **Gate 6 Homepage Scope Rule:** In Gate 6, **only the Homepage is constructed as a complete page**. Batch 01 initializes the codebase foundation with global scope across all future pages, but sub-pages must never be implemented in Gate 6.

---

## 2. Preconditions & Safety Checks

Before running any generator command:
1. **CMS Blocking Guard:** Confirm that all questions in `project-docs/client-review/gate-5-cms-requirements/open-questions.md` are resolved in `cms-implementation-rules.md`.
2. **Containment Safety Check:** Verify that `site/` does not already exist or is empty:
   ```bash
   # If site/ exists and contains files, HALT IMMEDIATELY and ask the human how to proceed.
   test -d site && ls -A site
   ```
3. **Runtime & Lockfile Discovery:**
   - `pnpm-lock.yaml` -> `pnpm` (default project package manager)
   - `package-lock.json` -> `npm`
   - `yarn.lock` -> `yarn`
   - `bun.lockb` / `bun.lock` -> `bun`
   - *Conflict Guard:* If multiple conflicting lockfiles exist in the root, halt and prompt the user to resolve the ambiguity.
4. **Language Detection:** Check for `tsconfig.json`. If present -> TypeScript (`.ts`, `.tsx`); otherwise -> JavaScript (`.js`, `.jsx`).

---

## 3. Execution Protocol

### Step 1: Initialize Next.js Application
Execute the official generator non-interactively using verified flags matching discovered conventions:

```bash
# Example for standard JavaScript + pnpm stack:
pnpm create next-app@latest site --js --tailwind --app --eslint --import-alias "@/*" --disable-git --use-pnpm
```

- **Mandatory Flag `--disable-git`:** Strictly prevents creating a nested git repository within the parent workspace.
- **Dependency Boundary:** No third-party packages beyond the official generator and the approved tech stack may be installed without explicit approval.

### Step 2: Project Slug Synchronization
Immediately update `site/package.json` so that `"name": "<project-slug>"` matches the confirmed technical project slug from `client-context/answers/batch-01-core-identity/answers.md` (Batch 01 Q1b).

### Step 3: Root `.gitignore` Configuration
Verify or create `.gitignore` at the project root to ensure crawled mirrors, vendor dependencies, and environment files remain untracked:

```gitignore
# Legacy site offline mirror & harvested assets (Stage 0 migration)
previous-site/

# Dependencies & framework builds
node_modules/
.next/
site/node_modules/
site/.next/

# Environment secrets
.env*
!.env.example
site/.env*
!site/.env.example
```

### Step 4: Site Environment Template
Create `site/.env.example` documenting all required variables with placeholder values:

```env
SITE_NAME="Your Brand Name"
SERVER_URL="https://prod-server.nextwebworks.com"
CMS_TOKEN="your-cms-token"
REVALIDATE_SECRET="your-revalidate-secret"
NEXT_PUBLIC_SITE_URL="https://example.com"
NEXT_PUBLIC_PREVIEW_GUARD="true"
```

---

## 4. Deliverables Checklist

- [ ] `site/` initialized with Next.js App Router (zero nested `.git` directory).
- [ ] `site/package.json` `"name"` matches the confirmed technical project slug.
- [ ] Root `.gitignore` updated with `previous-site/`, `node_modules/`, `site/.next/`, and `.env*` rules.
- [ ] `site/.env.example` created with required environment contract variables.
- [ ] Pre-Launch Guard enabled by default (`NEXT_PUBLIC_PREVIEW_GUARD="true"`).

---

## 5. Next Batch Handover

Upon verifying all checklist items above, proceed immediately to **[Batch 02: Foundation Shell](../batch-02-foundation-shell/rulebook.md)** to wire design tokens, motion tier, and the global layout shell.

