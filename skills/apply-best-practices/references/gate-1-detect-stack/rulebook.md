# Gate 1: Detect Stack Rulebook

## 1. Goal
Inspect the target codebase in read-only mode to discover all active technologies, runtime versions, package managers, framework architectures, and existing agent configurations (rules, skills, conventions). In monorepos, identify workspaces and prompt the user to bind execution to a specific package.

---

## 2. Entry Criteria
1. Gate 0 is approved (`currentGate: 1`).
2. Git branch is on `best-practices/<date>`.
3. Working tree is clean.

---

## 3. Steps

1. **Monorepo & Workspace Audit:**
   - Check for monorepo configuration files:
     - `pnpm-workspace.yaml`
     - `lerna.json`
     - `turbo.json` or `nx.json`
     - `package.json` with `"workspaces"` field
   - If a monorepo is detected:
     - List all discoverable workspaces/packages with their paths.
     - Prompt the user: *"Monorepo detected with multiple workspaces. Please select the target package/app to audit (e.g. `apps/web`, `packages/ui`, or `.` for root):"*
     - Wait for user response.
     - Record `targetWorkspace: "<selected-path>"` in `best-practices/state.json`.
     - Scope all subsequent stack detection, linting, building, and skill applications to `targetWorkspace`.

2. **Technology Stack Inspection:**
   - Scan manifest and lockfiles in `targetWorkspace`:
     - Package manifests: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, etc.
     - Lockfiles: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`, `poetry.lock`.
   - Identify core technology dimensions:
     - **Primary Framework / Language:** (e.g., Next.js 15 App Router, React 19, Vue 3, Svelte 5, FastAPI, Go, Rust).
     - **Styling Architecture:** (e.g., Tailwind CSS v4, CSS Modules, Styled Components, Emotion).
     - **Data Layer / ORM / Database:** (e.g., Prisma, Drizzle, Supabase, Mongoose, PostgreSQL, SQLite).
     - **AI / Agentic SDKs:** (e.g., Vercel AI SDK, LangChain, Google Gen AI SDK, OpenAI SDK).
     - **Testing Framework:** (e.g., Vitest, Jest, Playwright, Cypress).
     - **Build / Bundler Tooling:** (e.g., Vite, Turbopack, Webpack, esbuild, tsup).

3. **Existing Customizations & Rules Audit:**
   - Audit target repo agent customization files:
     - `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.cursorrules`
     - `.agents/rules/*.md`, `.agents/rules.json`
     - `.agents/skills/*/SKILL.md`, `.agents/skills.json`
   - Catalog existing rules and covered domains (to prevent recommending redundant skills for domains already covered by strong repository rules).

4. **Zero-Edit Invariant:**
   - Do NOT edit, create, or modify any project code or configuration files during Gate 1. All inspections are strictly read-only.

5. **Update State & Present:**
   - Save detected technologies, versions, and existing rule coverage in `best-practices/state.json` under `detectedStack`.
   - Compile findings into `best-practices/gate-1-detect-stack/stack-report.md`.
   - Present stack report and approval question in chat, then pause.

---

## 4. Output Files
- `<target-repo>/best-practices/gate-1-detect-stack/stack-report.md`: Structured breakdown of runtime, frameworks, data layers, existing rules, and target workspace boundaries.
- `<target-repo>/best-practices/state.json`: Updated `detectedStack` and `targetWorkspace`.

---

## 5. Evidence to Present & Approval Question
Present `best-practices/gate-1-detect-stack/stack-report.md` containing:
- Target workspace path (root or selected monorepo package).
- Detected runtime & package manager.
- Identified technology stack dimensions with detected versions.
- Existing repository rules and skills summary.
- Identified optimization concerns (security, performance, code quality, styling, SEO, accessibility).

> "Do you approve the Gate 1 Stack Detection findings for `<targetWorkspace>`? (Reply with **`APPROVE GATE 1`** to advance to Gate 2 (Find Candidates), or provide corrections to the detected stack)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 2.

---

## 6. Manual Checklist for Me
- [ ] Verify detected framework versions match actual dependencies in `package.json`.
- [ ] If in a monorepo, confirm target workspace scope is accurate.
- [ ] Verify existing `.agents/rules/` or `AGENTS.md` are documented.
- [ ] Confirm no files in the codebase were modified.

---

## 7. Reject Handling
1. If the user corrects any detected technology (e.g. "We are migrating to Drizzle, ignore Prisma"), update `detectedStack` in `state.json` accordingly.
2. If the user wants to switch the target monorepo workspace, re-run detection scoped to the new path and re-present.

---

## 8. Exit Criteria
- `detectedStack` accurately reflects the codebase.
- User explicitly replies `APPROVE GATE 1`.
- Advance `currentGate` to 2 in `best-practices/state.json`.
