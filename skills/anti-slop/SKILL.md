---
name: anti-slop
description: Scans website source files, compiles a human-approved plan, and strips AI-generated visual, copy, structural, and code leftovers via pure deletion without adding replacement content or styles. Use when explicitly invoked via /anti-slop or when asked to remove AI slop from an existing site.
disable_model_invocation: true
user_invocable: true
---

# Anti-Slop (`anti-slop`)

> [!IMPORTANT]
> **Manual-Only Invocation & Human Approval Barrier:**
> This skill executes strictly upon explicit invocation via `/anti-slop [target-path]`.
> The agent **NEVER removes, modifies, or deletes anything without explicit human approval**.
> It executes **Plan Mode** first, outputs candidate removals, and halts until you sign off.
>
> **The Pure Removal Invariant:**
> This skill only deletes. It never adds replacement copy, colors, fonts, icons, animations, sections, or rewritten sentences. Elements fall back to clean base/inherited styling. If an item cannot be cleanly deleted without creating an empty broken layout, leave it untouched and log it under "Needs a Human".

---

## Operating Protocol

```
Stage 1: Plan Mode (Read-Only)  -->  Human Approval  -->  Stage 2: Removal Execution (Pure Deletion)
```

### Stage 1: Plan Mode (Default)
When `/anti-slop` is triggered:
1. **Target Selection**: Determine scan root from the command argument (e.g. `/anti-slop site/src`), defaulting to the project's user-facing source (`app/`, `pages/`, `components/`, `styles/`, `content/`). Skip `node_modules`, build output, lockfiles, backend APIs, config, and tests.
2. **Read Project Rules**: Check for local project overrides in `.agents/rules/anti-slop.md` or `anti-slop.rules.json` to load custom whitelists or local patterns. See [Rule Maintainer Guide](references/rules-maintenance.md).
3. **Execute Scanner**: Run the modular scanner script to gather candidate slop:
   ```bash
   node skills/anti-slop/scripts/slop-scan/index.mjs --target=<target-path> --json
   ```
4. **Compile Removal Plan**: Present candidate removals grouped by category:
   - **Visual**: Gradient text, purple/indigo background blobs, glassmorphism, emoji icons, stacked shadows. See [Visual Patterns](references/patterns/visual.md).
   - **Copy**: Em-dash clusters, throat-clearing openers, buzzwords, metaphor inflation, boilerplate. See [Copy Patterns](references/patterns/copy.md).
   - **Structure**: Invented stats, fake testimonials/personas, placeholder logos, filler steps. See [Structural Patterns](references/patterns/structure.md).
   - **Code**: Obvious narrating comments, dead JSX blocks, duplicate inline styles. See [Code Patterns](references/patterns/code.md).
5. **Halt for Approval**: Print the Removal Plan table and **stop execution**. Await explicit human confirmation (e.g., "approved", "proceed") before touching any file.

---

### Stage 2: Removal Execution Mode (Post-Approval)
Once explicit human approval is received:
1. **Apply Pure Deletions**: Use IDE editor tools (`edit_file`) to remove approved items file by file:
   - Visual: Strip gradient, blur, and heavy shadow utility classes. Fall back to base surface styles.
   - Copy: Delete buzzwords, throat-clearing clauses, or filler sentences. Never rewrite copy.
   - Structure: Delete unrequested filler sections, fake testimonial blocks, and dummy stat rows.
   - Code: Delete obvious narrating comments, commented-out JSX, and redundant wrappers.
2. **Sweep Orphaned Artifacts**: Remove unused imports or variables left orphaned by deleted components.
3. **Run Project Build / Lint**: Run the target project's existing build or test command once (e.g., `npm run build` or `npm test`). Fix only syntax errors directly introduced by removals.
4. **Emit Final Summary**: Deliver a concise chat report:
   - `Removed`: `[file] -> [what was deleted]`
   - `Needs a Human`: `[file] -> [reason item was deferred]`
   - `Build Result`: Passed / Clean / Not present.
