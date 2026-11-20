# Gate 6: Walkthrough Video Rulebook (HyperFrames)

## 1. Purpose
Produce a concise, professional 60–120 second executive product walkthrough video demonstrating the frozen demo flow with motion graphics using **HyperFrames** (`heygen-com/hyperframes`), HeyGen's agent-native HTML-to-video rendering framework.

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

### Step 2: Walkthrough Creative Brief
Formulate the walkthrough brief in `poc/<project>/gate-6-walkthrough/brief.md` (or present directly in chat):
- **Core Message:** Problem hook, primary solution, and executive value outcome.
- **Target Duration:** Strictly bounded between 60 and 120 seconds.
- **Narrative Beats:** Scene count and milestones mapped directly from `scope.md` Section 6 demo journey.
- **Source Clip Manifest:** List of required per-scene screen captures.
- **Brand Tokens:** Discover and read design tokens directly from `nextwebworks-website` (e.g. `site/app/globals.css` or Tailwind theme). Never invent colors, fonts, or motion tiers.
Present brief to user and obtain approval before writing the voiceover script.

### Step 3: Script & Shot List (SCRIPT.md & STORYBOARD.md Formats)
Author planning documents adhering to HyperFrames core specifications:
- `poc/<project>/gate-6-walkthrough/script.md`: Author voiceover narration adhering to the HyperFrames `SCRIPT.md` format (150–300 words, ~150 words per minute pacing for 60–120s runtime, hook in first 5s, deliberate pacing pauses, clear enterprise CTA).
- `poc/<project>/gate-6-walkthrough/shot-list.md`: Author second-by-second scene cue sheet adhering to the HyperFrames `STORYBOARD.md` format (timestamped scenes, on-screen text overlays, spatial layout, visual mood, color/font tokens, transition notes). Total duration strictly 60–120s.
- **Mandatory Human Script Pre-Approval:** Stop and present `script.md` and `shot-list.md` in chat. The human MUST explicitly approve the script text BEFORE recording begins.

### Step 4: Human Per-Scene Screen Recording (Zero Agent Recording Invariant)
> [!IMPORTANT]
> The agent NEVER records screen video, triggers capture tools, or takes screenshots. The human user records short screen clips externally using their preferred desktop tool (OBS, CleanShot X, Loom, QuickTime).
- User records short per-scene screen clips following the approved shot list (e.g. `scene-01-welcome.mp4`, `scene-02-prompt.mp4`).
- **Recording Hygiene:** Disable system notifications, maintain steady cursor movement, and pause for 1 second on each key UI state before taking action.
- User supplies raw video clip file paths to the agent.

### Step 5: External Workspace Scaffolding & Composition Build
1. **External Sibling Workspace:**
   Create a sibling workspace completely outside the PoC repository (e.g. `../<project>-walkthrough/`) so `node_modules` and video binaries never enter the PoC git tree. Save its path in PoC state:
   `node <path>/poc-state.mjs set-field metadata.walkthroughWorkspace "../<project>-walkthrough"`
2. **Skills Reference & Explicit Approval Barrier:**
   The workflow references specialized HyperFrames skills by name (`hyperframes`, `hyperframes-core`, `hyperframes-cli`, `hyperframes-registry`, `gsap`, `motion-graphics`). `hyperframes-media` is referenced only if the user opts into captions or voiceover.
   - Skills are never copied into the repository.
   - Every skill install command (`npx skills add heygen-com/hyperframes --skill <name>`) MUST be shown to the user and run ONLY after explicit approval.
   - The agent reviews each `SKILL.md` before use; read `hyperframes-core` before writing composition HTML.
3. **Workspace Bootstrap & Version Pinning:**
   In the external sibling workspace, initialize the project:
   `npx hyperframes init .`
   Pin the installed HyperFrames version in the workspace's `package.json` and record it.
4. **Track Composition & Layout Rules:**
   - Base video track: User's per-scene screen recordings.
   - Overlays (timed tracks above base): Title card, lower-thirds, narration callouts, at most one zoom on a key UI region, one metric card, and an outro holding the demo/landing URL for $\ge 3$ seconds.
   - Plain HTML with `data-composition-id` and `data-*` timeline attributes. Strictly zero React/Vue components.
   - Consult pre-built registry blocks (`npx hyperframes add <block>` - *verify before use*) before authoring custom GSAP; supply `hyperframes-registry` with canvas dimensions (1920x1080), timeline length, and `data-composition-id`.
   - Enforce one easing family and one motion tier across the entire composition; restrained, professional motion.
   - Total composition duration must match the approved script and remain strictly between 60 and 120 seconds.

### Step 6: Single-Scene Validation & Iteration
1. Run `npx hyperframes check` (audits layout, contrast, and motion rules) and `npx hyperframes inspect` *(verify before use)*.
2. The agent never drives a browser; the user reviews the live preview server in `npx hyperframes preview`.
3. Iterate with draft renders: `npx hyperframes render --quality draft --output draft.mp4`.
4. Fix single scenes in HTML/CSS/GSAP rather than regenerating the entire project.

### Step 7: Final Master Render
1. Execute production master render:
   `npx hyperframes render --quality high --output <project>-walkthrough.mp4`
2. Specifications: 16:9 MP4, 1920x1080 unless explicitly instructed otherwise. No 9:16 vertical crop. Captions and voiceover are OFF by default (if user opts in, verify transcription/TTS requirements and model downloads first, requesting approval before installing `hyperframes-media`).
3. User confirms final video runtime is strictly within 60 to 120 seconds.

### Step 8: Cloud Video Hosting & Evidence Compilation
1. Do NOT commit MP4 binaries to git. No player-component embed.
2. If Cloudflare R2 credentials exist in the environment (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`), execute the upload script. Otherwise, provide explicit step-by-step upload instructions for the user.
3. Never write secrets, passwords, or tokens to any file.
4. Write `poc/<project>/gate-6-walkthrough/video-record.md` documenting R2 URL, runtime duration in seconds, 1920x1080 resolution, HyperFrames version, and workspace path.
5. Update `urls.video` in `state.json`:
   `node <path>/poc-state.mjs set-field urls.video "<r2-video-url>"`
6. Compile `poc/<project>/gate-6-walkthrough/evidence.md`.
7. Set gate status: `node <path>/poc-state.mjs set-status 6 awaiting_approval`.
8. Present evidence and stop.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-6-walkthrough/`:
- `script.md`: Complete voiceover narrative formatted in HyperFrames `SCRIPT.md` structure.
- `shot-list.md`: Timestamped visual cue sheet formatted in HyperFrames `STORYBOARD.md` structure.
- `video-record.md`: Cloudflare R2 streaming URL, exact duration in seconds, 1920x1080 resolution, pinned HyperFrames version, and external workspace path.
- `evidence.md`: Summary of script approval, recording verification, duration check, and hosted video playback link.
*(The gate directory must hold zero `node_modules` and zero MP4/video binaries).*

---

## 5. Evidence to Present
Present `poc/<project>/gate-6-walkthrough/evidence.md` containing:
- Voiceover word count and target speaking rate (~150 wpm).
- Human script pre-approval confirmation.
- Confirmed video runtime in seconds (verified $\ge 60\text{s}$ and $\le 120\text{s}$).
- Pinned HyperFrames framework version and external sibling workspace path.
- Hosted Cloudflare R2 playback URL (`urls.video`).
- Confirmation that no video binary files or `node_modules` are committed to git.
- Active state confirmation (`Gate 6 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 7.`

---

## 6. Manual Checklist for Me
- [ ] Confirm video duration is within 60 to 120 seconds and matches the approved script.
- [ ] Verify text and callouts are sharp and legible at 1080p and on mobile viewports.
- [ ] Confirm no layout overflow, off-frame elements, or occluded text.
- [ ] Verify Next Web Works brand tokens (colors, typography, motion tier) are authentic.
- [ ] Confirm the outro holds the demo/landing URL clearly for at least 3 seconds.
- [ ] Verify audio narration is crisp with clean pauses and zero clipping.
- [ ] Confirm every on-screen callout and metric accurately matches what the narration says.

---

## 7. Reject Handling
1. If the script requires revisions, edit `poc/<project>/gate-6-walkthrough/script.md` in place before recording.
2. If styling, layout, or animations require adjustment, edit HTML/GSAP files in place in the external workspace.
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
