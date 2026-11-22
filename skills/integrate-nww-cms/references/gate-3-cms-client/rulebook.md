# Gate 3: Typed CMS Client Layer

> **Gate ID:** `3`  
> **Gate Name:** `cms-client`  
> **Execution Mode:** Code Scaffolding & Configuration  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Architectural Constraints

Gate 3 scaffolds a robust, typed data-access layer inside the target Next.js repository to communicate securely with the NWW CMS backend.

> [!IMPORTANT]
> **Zero External Dependencies Constraint:**
> The CMS client layer is implemented in pure modern ESM JavaScript or TypeScript using native Web APIs (`fetch`, `AbortController`, `URLSearchParams`). Do not add external HTTP clients (`axios`, `got`) or CMS SDKs without explicit approval.

> [!IMPORTANT]
> **Single Data-Access Folder Invariant:**
> All CMS communication logic, models, error handling, and helpers must reside inside a single dedicated data-access folder:
> - `src/lib/cms/` (if target project has a `src/` directory)
> - `lib/cms/` (if target project uses root-level directories)

> [!IMPORTANT]
> **Credential & Secret Hygiene:**
> - Never hardcode, commit, or print real secrets or tokens.
> - Only write variable **names** into `.env.example`.
> - All CMS errors must sanitize stack traces, masking tokens before logging.

> [!IMPORTANT]
> **Human Approval Barrier:**
> Advancing to Gate 4 requires the exact verbatim phrase:
> `APPROVE GATE 3`

> [!TIP]
> **Context Compaction:**
> At the conclusion of Gate 3 evidence presentation, run `/compact` to compact conversation history and preserve context window headroom for Gate 4.

---

## 2. Router-Matched Caching & Revalidation Strategy

The scaffolded client adjusts its caching headers to match the target site's router architecture (detected during Gate 1):

### App Router (`app/`)
Uses Next.js fetch cache extensions with tagged on-demand revalidation:
```typescript
const fetchInit: RequestInit = {
  headers,
  signal: controller.signal,
  next: {
    tags: [`cms:${resource}`],
    revalidate: 60, // 60s default background revalidation window
  },
};
```
When content changes in the CMS, incoming webhooks revalidate all cached data tagged with `cms:<resource>`.

### Pages Router (`pages/`)
In Pages Router, `cmsFetch` runs inside `getStaticProps`:
```typescript
export async function getStaticProps() {
  const pageConfig = await PageConfig.readOne('home');
  return {
    props: { pageConfig },
    revalidate: 60, // Incremental Static Regeneration (ISR)
  };
}
```
On-demand revalidation is handled via `res.revalidate('/path')`.

---

## 3. Step-by-Step Procedure

### Step 1: Execute Automated Client Scaffolding
Run `client-scaffolder.mjs` against the target repository:

```bash
node <path-to-skill>/scripts/cms-state.mjs set-status 3 in_progress
node <path-to-skill>/scripts/client-scaffolder.mjs
```

The script automatically generates:
1. `client.ts` / `client.js`: HTTP client handling authorization, tags, timeout, and response normalization.
2. `error.ts` / `error.js`: `CMSError` class with automatic token redaction.
3. `revalidation.ts` / `revalidation.js`: Tag helpers (`tagFor`) and constant `REVALIDATE_SECONDS`.
4. `site-config.ts` / `site-config.js`: Site identity (`SITE_NAME`) and origin (`NEXT_PUBLIC_SITE_URL`).
5. `page-config.ts` / `page-config.js`: Model helper for `WebsitePageConfig`.
6. `blog.ts` / `blog.js`: Model helper for `Blog`.
7. `seo-helper.ts` / `seo-helper.js`: Universal metadata and safe JSON-LD generator.
8. `index.ts` / `index.js`: Clean barrel export.
9. Updates `.env.example` with variable names:
   ```env
   # NWW CMS Backend Configuration
   SERVER_URL=https://prod-server.nextwebworks.com
   CMS_TOKEN=
   REVALIDATE_SECRET=
   SITE_NAME=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
10. Writes `.nww-cms/client-spec.md`.

### Step 2: Code Verification & Type Checking
Verify that the scaffolded client compiles cleanly without type errors:
1. If TypeScript: run the project's typecheck command (e.g. `pnpm tsc --noEmit` or `npm run typecheck`).
2. Verify imports resolve cleanly via `@/lib/cms` or relative paths.
3. Assert that zero new dependencies were added to `package.json`.

### Step 3: Present Evidence & Request Approval
1. Set Gate 3 status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 3 awaiting_approval
   ```
2. Present `.nww-cms/client-spec.md` and the list of scaffolded files in chat.
3. Prompt user for Gate 3 approval:
   ```markdown
   > [!IMPORTANT]
   > Please review `.nww-cms/client-spec.md` and the scaffolded client files. To proceed to Gate 4 (Page-by-Page Migration), respond with:
   > `APPROVE GATE 3`
   >
   > [!TIP]
   > **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 4.
   ```
4. Upon receiving `APPROVE GATE 3`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 3 "APPROVE GATE 3"
   ```
