---
name: anti-slop
description: Scans website source files, compiles candidate removals, and strips AI-generated visual, copy, structural, and code leftovers via pure deletion without adding replacement content or styles. Use when explicitly invoked via /anti-slop or when asked to remove AI slop from an existing site.
disable_model_invocation: true
user_invocable: true
---

# Anti-Slop (`anti-slop`)

Strips AI-generated visual decoration, copy tropes, structural redundancy, and code bloat from websites via pure deletion.

> [!IMPORTANT]
> **Remove-Only Invariant**: Delete elements or utility classes so they fall back to base styles. Narrow exception: em dashes (`—`) may be replaced with a comma `,`, period `.`, or plain space (punctuation only; no words added). Never add replacement files, components, copy, colors, fonts, icons, or animations. Never rewrite sentences.

---

## Execution Protocol

### Step 1: Detect Mode & Target
- **Script Mode (Default)**: Triggered by `/anti-slop [path]`. Target = argument path, or user-facing app root (`site/`, `src/`, `app/`, `pages/`).
- **Browser Inspection Mode**: Triggered only when explicitly asked (e.g. `/anti-slop browser [path]`). Runs Script Mode first, then a read-only browser pass.
- Skip `node_modules`, build output, lockfiles, backend APIs, config, and tests.

### Step 2: Read Rules & Whitelists
- Read catalogs in [references/patterns/](references/patterns/): `visual.md`, `copy.md`, `structure.md`, `code.md`, `not-slop.md`, `needs-a-human.md`.
- If the target repo has `.agents/rules/anti-slop.md` or `.agents/anti-slop-keep.md`, every pattern or line there is protected.

### Step 3: Run Detection Script
Execute the read-only AST and pattern scanner:
```bash
node <path-to-skill>/scripts/slop-scan/index.mjs --target=<target-path> --mode=<script|browser> --json
```
The script scans pages, shared layout components (`Nav`, `Footer`), and content data files (`.json`, `.mdx`, `.md`, `.ts/.js` arrays). It reports candidate detections per slop class with exact `file:line` locations without altering any file.

### Step 4: Remove at Source (Script Pass)
Apply pure deletions directly in source using IDE editor tools (`edit_file`):
- **Shared Components & Props**: When slop originates from a shared component (e.g. card badge, dot meter) or data prop (`indexCode`, `showSummary`), delete the element at definition and remove unused props at call sites.
- **Visual**: Delete mono-caps eyebrows, numbered kickers, card sequence codes, category tags, dot meters, and trailing arrows. Remove two-tone heading color spans, hairline framing rails (`border-x`), and gradient classes.
- **Copy**: Replace solitary em dashes with comma, period, or space. Delete engineering stock phrases in prose, manifesto taglines, and buzzwords. If a buzzword is in a headline where deletion breaks grammar, list under Needs a Human.
- **Structure**: Keep header CTA, first-view hero CTA, and closing inquiry section. Delete extra in-grid CTA tiles, footer promo cells, and nav offering counters. Remove duplicate summary paragraphs in nav dropdowns and footers.
- **Protected Items**: Bypassed automatically. Never delete image placeholder slots, `FIG. 01` captions, `CLIENT PLACEHOLDER` boxes, `.example` emails, authentic product identity, or nav links. Dev overlay "N" badge is runtime-only; do not touch source.
- **Code**: Delete obvious comments, dead JSX, and orphaned imports created by removals.

### Step 5: Browser Inspection Pass (Mode 2 Only)
When Browser Inspection Mode is active:
1. **Connection Verification**:
   - *Antigravity*: Run a trivial `/browser` task opening the target URL to return `document.title`. If Chrome is closed or remote-debugging is not accepted, stop and report immediately (no silent fallback).
   - *Other Agents (Codex)*: Check `agent-browser` CLI connection with target URL title check. If uninstalled, ask permission first; if connection fails, stop and report.
2. **Read-Only Inspection**: Inspect rendered DOM text and dynamic CMS content to spot runtime slop missed in static source. No edits through browser; no screenshots saved into the repo.
3. **Source Removals**: Map rendered slop back to source code/data files and remove using IDE editor tools.

### Step 6: Verify Build & Emit Strict Output
1. Run project build/lint once if present (`npm run build` or `npm test`); fix only syntax breakage caused by removals.
2. Emit ONLY the strict output contract (no conversational filler, no advice, never write "100% clean"):

```text
Scan: mode=[script|browser], version=1.14.0, roots=[<path>], files=<N>, hits=[visual: <V>, copy: <C>, structure: <S>, code: <K>] (browser: connected=[yes|no], pages=<P>)

Removed:
- file:line -> what (mark browser-found items "(browser)")

Needs a human:
1. file:line -> why (objective grammar, layout component authoring, or structural redesign requirement)

Build: Passed / Clean / Not present.
```
