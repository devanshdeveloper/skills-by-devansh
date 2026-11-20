# Gate 6: Walkthrough Video Rulebook (HyperFrames)

## 1. Purpose
Produce a concise, professional 60–120 second user-facing product walkthrough video demonstrating the frozen demo flow with restrained motion graphics using **HyperFrames** (`heygen-com/hyperframes`), HeyGen's agent-native HTML-to-video rendering framework. The walkthrough must be a client-facing product demonstration for a non-technical viewer, not a technical explanation or engineering spec review.

> [!IMPORTANT]
> **Stack Departure from Remotion Default:**
> This gate departs from Remotion. All video compositions are authored in plain, standard HTML with `data-*` timeline attributes and seekable GSAP animation timelines. The agent must NEVER ask for, generate, or write React or Vue components.

---

## 2. Entry Conditions
1. Gate 5 is approved or skipped; `poc/<project>/state.json` reflects `currentGate: 6` with status `in_progress`.
2. Gate 1 demo flow from `scope.md` is readily accessible.
3. System environment satisfies HyperFrames prerequisites: Node.js $\ge 22$ and system FFmpeg available in PATH.

---

## 3. Steps

### Step 1: Environment Check (Windows / PowerShell)
Run environment diagnostic checks before scaffolding:
1. `node -v` (verify Node.js $\ge 22$; if $< 22$, report gap to user and stop).
2. `ffmpeg -version` (verify FFmpeg binary is installed and present in PATH; report gap and stop if missing).
3. `npx hyperframes doctor` *(verify before use)* (diagnose local browser, rendering engine, and dependency health).
Report any detected gap to the user and halt until resolved.

### Step 2: Walkthrough Creative Brief & Audience Definition (A1 Rule)
Formulate the walkthrough brief in `poc/<project>/gate-6-walkthrough/brief.md` (or present directly in chat) and obtain user approval:
- **Target Audience:** Explicitly state who watches—a non-technical business client, department head, or end-user manager (e.g. VP of Sales, Operations Director). Define their core business goal and what outcome they care about in plain language. If the product itself is specifically for developers, the agent must ask the user before relaxing any plain-language rules below.
- **Target Duration:** Strictly bounded between 60 and 120 seconds.
- **Narrative Beats:** Map user tasks from `scope.md` rewritten as customer problems and benefits (never engineering sequence diagrams or API calls).
- **Source Clip Manifest:** List of required per-scene screen captures of the real product UI.
- **Brand Tokens:** Read design tokens directly from `nextwebworks-website` ([site/app/globals.css](file:///c:/code/personal/nextwebworks-website/site/app/globals.css)). Never invent colors, fonts, or motion tiers.

### Step 3: Script & Shot List (Plain-Language & Screen-First Rules A2, A3)
Author planning documents adhering to HyperFrames core specifications:
- `poc/<project>/gate-6-walkthrough/script.md`: Author voiceover narrative adhering to HyperFrames `SCRIPT.md` format (150–300 words, ~130–150 wpm pacing).
  - **Narrative Structure:** Viewer's problem in their own words (one beat) $\rightarrow$ the product doing real tasks in real UI (most of the runtime) $\rightarrow$ the outcome for the viewer $\rightarrow$ one call to action.
  - **Perspective:** Narrate with "you" and active outcome verbs ("explore", "filter", "spot trends", "review").
  - **Strictly Forbidden Terms:** Stack and tool names, "built with / powered by", architecture, APIs, endpoints, database, backend/frontend, framework, hosting, deployment, code, JSON, SDK, model names, latency or performance numbers, repo/GitHub, plus the PoC's own stack names from `package.json`.
  - **Manager Filter:** Every line must pass: *"Would a non-developer client's manager understand this and care?"* Scope items from `scope.md` must be converted into user tasks and benefits; anything that cannot be expressed this way is omitted.
  - **Authentic Metrics Only:** No numbers unless explicitly supplied by the user and meaningful to the viewer. No invented claims.
- `poc/<project>/gate-6-walkthrough/shot-list.md`: Author second-by-second scene cue sheet adhering to HyperFrames `STORYBOARD.md` format.
  - **Screen-First Rule (A3):** At least **70% of runtime** MUST show the real product UI unobstructed.
  - **Overlay Limits:** At most one short plain-language caption per scene (**8 words or fewer**), a simple highlight ring or arrow on the real UI where narration points at something, and at most one zoom for the whole video.
  - **No Metric Cards or Lower-Thirds:** Metric cards and lower-thirds are removed from the default flow (use only if explicitly requested by the user).
  - **Default Cards (Only 2):** Opening Title Card (product name + one benefit line, $\le 3$s) and Closing CTA Card with demo URL (held $\ge 3$s).
- **Mandatory Human Script Pre-Approval:** Stop and present `script.md` and `shot-list.md` in chat. The human MUST explicitly approve the script text BEFORE touching the composition or recording.

### Step 4: Human Per-Scene Screen Recording (Zero Agent Recording Invariant)
> [!IMPORTANT]
> The agent NEVER records screen video, triggers capture tools, or takes screenshots. The human user records screen clips externally using their preferred desktop tool.
- User records screen clips following the approved shot list.
- **Recording Hygiene:** Notifications off, steady cursor, and 1-second pause on key UI states before taking action.
- User supplies raw video clip file paths to the agent.

### Step 5: External Workspace Scaffolding & Composition Build (Anti-Slop Visual Rules A4)
1. **External Sibling Workspace:**
   Create sibling workspace outside the PoC repo (e.g. `../<project>-walkthrough/`) so `node_modules` and video binaries never enter the PoC git tree. Save path in PoC state:
   `node <path>/poc-state.mjs set-field metadata.walkthroughWorkspace "../<project>-walkthrough"`
2. **Skills Reference & Explicit Approval Barrier:**
   Reference HyperFrames skills by name (`hyperframes`, `hyperframes-core`, `hyperframes-cli`, `hyperframes-registry`, `gsap`, `motion-graphics`). `hyperframes-media` only if captions/TTS are opted in. Skills are never copied into the repo. Every install command (`npx skills add heygen-com/hyperframes --skill <name>`) requires explicit user approval.
3. **Workspace Bootstrap & Version Pinning:**
   Initialize with `npx hyperframes init --non-interactive --skip-transcribe --skip-skills --resolution=1080p .`. Pin version in `package.json`.
4. **Anti-Slop Visual Rules (A4):**
   - **Banned:** Gradient or mesh backgrounds, glassmorphism (`backdrop-filter: blur`), glows or neon, emoji, icon-in-rounded-square tiles, three-up feature-card grids, generic stat cards, abstract decorative shapes, sparkle ornaments, shadows on everything, everything centered, bouncy or overshoot easing, headlines over 2 lines, more than one accent color.
   - **Required:** Build strictly from real `nextwebworks.in` tokens (Canvas `#0B0F19`, Surface `#0F172A`, Cobalt `#2563EB`, Plus Jakarta Sans / Inter). Flat solid backgrounds, clear type hierarchy, consistent grid, generous whitespace, one accent color, one easing family. Cards must look like they belong to `nextwebworks.in`. Prefer real product UI crops over designed cards. Registry blocks (`hyperframes add` *(verify before use)*) are used only if restyled to brand tokens; otherwise skipped.
   - **Title Card:** Headline $\le 6$ words, subline $\le 12$ words.
   - **CTA Card:** One action line plus the demo URL (held $\ge 3$s).

### Step 6: Single-Scene Validation & Pre-Presentation Scan (A5 Rule)
1. Run `npx hyperframes check` and `npx hyperframes inspect` *(verify before use)*.
2. **Pre-Presentation Scan (A5):** Search `script.md`, `shot-list.md`, and all text in the composition against the Forbidden Terms List. Count captions per scene ($\le 1$, $\le 8$ words), verify real UI share $\ge 70\%$, and audit card styling against brand tokens.
3. User reviews in local preview (`npx hyperframes preview`). The agent never drives a browser. Iterate in place; fix single scenes rather than regenerating the project.

### Step 7: Final Master Render
1. Render high-quality master MP4 locally after preview approval:
   `npx hyperframes render --quality high --output <project>-walkthrough.mp4`
2. Specifications: 16:9 MP4, 1920x1080 @ 30fps. Duration strictly 60–120 seconds.

### Step 8: Cloud Video Hosting & Evidence Compilation
1. Do NOT commit MP4 binaries to git. No player-component embed.
2. If Cloudflare R2 credentials exist, upload; otherwise provide upload commands for user. Never write secrets to files.
3. Write `poc/<project>/gate-6-walkthrough/video-record.md`.
4. Update `urls.video` in `state.json`: `node <path>/poc-state.mjs set-field urls.video "<r2-video-url>"`.
5. Compile `poc/<project>/gate-6-walkthrough/evidence.md` with A5 scan results.
6. Set status: `node <path>/poc-state.mjs set-status 6 awaiting_approval`.

---

## 4. Output Files
All files reside in `poc/<project>/gate-6-walkthrough/`:
- `script.md`: Plain-language narrative formatted in HyperFrames `SCRIPT.md` structure.
- `shot-list.md`: Screen-first cue sheet formatted in HyperFrames `STORYBOARD.md` structure.
- `video-record.md`: Cloudflare R2 streaming URL, exact duration, 1920x1080 resolution, pinned HyperFrames version, workspace path.
- `evidence.md`: Summary of audience brief, script approval, A5 scan results, and hosted link.
*(The gate directory holds zero `node_modules` and zero video binaries).*

---

## 5. Evidence to Present
Present `poc/<project>/gate-6-walkthrough/evidence.md` containing:
- Target audience profile and business outcome statement.
- Human script pre-approval confirmation.
- **A5 Pre-Presentation Scan Report:** Forbidden terms scan (0 hits), captions per scene ($\le 1$, $\le 8$ words), real UI runtime percentage ($\ge 70\%$), and brand tokens verified.
- Confirmed video runtime in seconds (verified $\ge 60\text{s}$ and $\le 120\text{s}$).
- Pinned HyperFrames framework version and external sibling workspace path.
- Hosted Cloudflare R2 playback URL (`urls.video`).
- Confirmation that no video binary files or `node_modules` are committed to git.
- Active state confirmation (`Gate 6 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 7.`

---

## 6. Manual Checklist for Me (A6 Rule)
- [ ] A non-technical client could follow this with no explanation.
- [ ] No tech words anywhere in narration or on-screen overlays.
- [ ] Cards look like our site (`nextwebworks.in`), not generic AI.
- [ ] Most of the runtime ($\ge 70\%$) shows the real product UI.
- [ ] Confirm video duration is within 60 to 120 seconds.
- [ ] Confirm the outro holds the demo/landing URL clearly for at least 3 seconds.

---

## 7. Reject Handling
1. If the script requires revisions or contains technical jargon, edit `script.md` in place before recording.
2. If styling or layout breaks anti-slop rules, edit HTML/GSAP files in place in the external workspace.
3. Run `node <path>/poc-state.mjs reject 6 "<issue summary>"`.
4. Re-run `check` / `inspect` *(verify before use)* and draft render to verify fixes.
5. Update `video-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present. Never duplicate files.

---

## 8. Exit Condition
- Script is approved by user prior to recording.
- Video duration confirmed strictly between 60 and 120 seconds.
- Hosted Cloudflare R2 video URL is accessible and streaming properly.
- The user explicitly types `APPROVE GATE 6` in chat.
- `node <path>/poc-state.mjs approve 6 "APPROVE GATE 6"` executes successfully, advancing `currentGate` to 7.
- Remind the user to trigger `/compact` before proceeding to Gate 7.
