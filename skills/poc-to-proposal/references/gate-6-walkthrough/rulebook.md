# Gate 6: Walkthrough Video Rulebook (HyperFrames)

## 1. Purpose
Produce a concise, polished 60–120 second user-facing product walkthrough video demonstrating the frozen demo flow with high-quality generated voiceover and restrained brand motion graphics using **HyperFrames** (`heygen-com/hyperframes`), HeyGen's agent-native HTML-to-video rendering framework. The walkthrough must be a client-facing product demonstration for a non-technical viewer, featuring zero human-recorded voice, zero technical jargon, and authentic `nextwebworks.in` brand polish.

> [!IMPORTANT]
> **Stack Departure from Remotion Default:**
> This gate departs from Remotion. All video compositions are authored in plain, standard HTML with `data-*` timeline attributes and seekable GSAP animation timelines. The agent must NEVER ask for, generate, or write React or Vue components.

---

## 2. Entry Conditions
1. Gate 5 is approved or skipped; `poc/<project>/state.json` reflects `currentGate: 6` with status `in_progress`.
2. Gate 1 demo flow from `scope.md` is readily accessible.
3. System environment satisfies HyperFrames prerequisites: Node.js $\ge 22$, system FFmpeg, and `ffprobe` available in PATH.

---

## 3. Steps

### Step 1: Environment Check (Windows / PowerShell)
Run environment diagnostic checks before scaffolding:
1. `node -v` (verify Node.js $\ge 22$; if $< 22$, report gap to user and stop).
2. `ffmpeg -version` and `ffprobe -version` (verify FFmpeg and ffprobe binaries are installed and present in PATH; report gap and stop if missing).
3. `npx hyperframes doctor` *(verify before use)* (diagnose local browser, rendering engine, and dependency health).
Report any detected gap to the user and halt until resolved.

### Step 2: Walkthrough Creative Brief & Audience Definition (A1 Rule)
Formulate the walkthrough brief in `poc/<project>/gate-6-walkthrough/brief.md` (or present directly in chat) and obtain user approval:
- **Target Audience:** Explicitly state who watches—a non-technical business client, department head, or end-user manager (e.g. VP of Sales, Operations Director). Define their core business goal and what outcome they care about in plain language. If the product itself is specifically for developers, the agent must ask the user before relaxing any plain-language rules below.
- **Target Duration:** Strictly bounded between 60 and 120 seconds.
- **Narrative Beats:** Map user tasks from `scope.md` rewritten as customer problems and benefits (never engineering sequence diagrams or API calls).
- **Source Clip Manifest:** List of required per-scene screen captures of the real product UI. Screen recordings must be captured silent (microphone and system audio turned completely off).
- **Brand Tokens:** Read design tokens directly from `nextwebworks-website` ([site/app/globals.css](file:///c:/code/personal/nextwebworks-website/site/app/globals.css) and [site/lib/motion.js](file:///c:/code/personal/nextwebworks-website/site/lib/motion.js)). Never invent colors, fonts, or motion tiers.

### Step 3: Script & Shot List (Plain-Language & Voice Pipeline Preparation)
Author planning documents adhering to HyperFrames core specifications:
- `poc/<project>/gate-6-walkthrough/script.md`: Author voiceover narrative adhering to HyperFrames `SCRIPT.md` format (150–300 words, ~130–150 wpm pacing).
  - **Narrative Structure:** Viewer's problem in their own words (one beat) $\rightarrow$ the product doing real tasks in real UI (most of the runtime) $\rightarrow$ the outcome for the viewer $\rightarrow$ one call to action.
  - **Perspective:** Narrate with "you" and active outcome verbs ("explore", "filter", "spot trends", "review").
  - **Strictly Forbidden Terms:** Stack and tool names, "built with / powered by", architecture, APIs, endpoints, database, backend/frontend, framework, hosting, deployment, code, JSON, SDK, model names, latency or performance numbers, repo/GitHub, plus the PoC's own stack names from `package.json`.
  - **Manager Filter:** Every line must pass: *"Would a non-developer client's manager understand this and care?"* Scope items from `scope.md` must be converted into user tasks and benefits; anything that cannot be expressed this way is omitted.
  - **Authentic Metrics Only:** No numbers unless explicitly supplied by the user and meaningful to the viewer. No invented claims.
- `poc/<project>/gate-6-walkthrough/shot-list.md`: Author second-by-second scene cue sheet adhering to HyperFrames `STORYBOARD.md` format.
  - **Screen-First Standard:** At least **70% of runtime** MUST show the real product UI.
- **Mandatory Human Script Pre-Approval:** Stop and present `script.md` and `shot-list.md` in chat. The human MUST explicitly approve the script text BEFORE touching the composition or recording.

### Step 4: Silent Screen Recording (Zero Agent Recording Invariant)
> [!IMPORTANT]
> The agent NEVER records screen video, triggers capture tools, or takes screenshots. The human user records screen clips externally using their preferred desktop tool.
- **Mandatory Silent Capture:** User records screen clips with microphone and system audio turned OFF.
- **Recording Hygiene:** Notifications off, steady cursor, and 1-second pause on key UI states before taking action.
- User supplies raw video clip file paths to the agent.

### Step 5: External Workspace Scaffolding, Voice Pipeline & Polish Layer (A1–A3)
1. **External Sibling Workspace:**
   Create sibling workspace outside the PoC repo (e.g. `../<project>-walkthrough/`) so `node_modules` and video binaries never enter the PoC git tree. Save path in PoC state:
   `node <path>/poc-state.mjs set-field metadata.walkthroughWorkspace "../<project>-walkthrough"`
2. **Skills Reference & Explicit Approval Barrier:**
   Reference HyperFrames skills by name (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, `gsap`). Skills are never copied into the repo. Every install command requires explicit user approval.
3. **Workspace Bootstrap & Source Audio Muting (A1 Audio Rule):**
   - Initialize with `npx hyperframes init --non-interactive --skip-transcribe --skip-skills --resolution=1080p .`. Pin version in `package.json`.
   - **Clip Audio Muting at Source:** In `index.html`, every video clip MUST include the `muted` attribute and `data-volume="0"`, and omit `data-has-audio="true"`. A user recording can never leak sound into the render.
4. **Voice Pipeline (A2 Rule):**
   Execute in strict order:
   1. *Pronunciation map:* Present product names, URLs, and acronyms in spoken phonetic form (e.g. "Power B I", "next web works dot in") to the user for approval.
   2. *Voice samples:* Present a 25–30 word sample in three candidate voices (e.g. `af_heart`, `am_michael`, `am_adam` from Kokoro-82M). User selects one. If no suitable voice exists, stop; never select a paid API autonomously.
   3. *Generate narration:* Generate scene audio files in the chosen voice at natural speed (multiplier 1.0) via `npx hyperframes tts [OPTIONS] [INPUT]`.
   4. *Measure durations:* Measure each scene's audio length via `ffprobe`. Total runtime must land strictly between 60 and 120 seconds.
   5. *Fit video to audio:* Trim dead time, speed-ramp waiting/loading states at 1.5–2x, and hold the last frame if needed. The voice is never stretched outside its natural speed.
   6. *Loudness normalization:* Normalize narration audio to approximately **-16 LUFS** with maximum true peak **-1 dBTP** using FFmpeg `loudnorm` filter:
      `ffmpeg -i input.wav -af "loudnorm=I=-16:TP=-1:LRA=11" normalized.wav`
      Measure and report final LUFS and dBTP values in `evidence.md`.
   7. *Background Music:* Music is included ONLY if the user supplies a licensed track. Play at low constant volume (`data-volume="0.1"`) under narration. If no music is supplied, use zero music.
   8. *Human Audio Sign-Off:* User listens to generated audio before final render. Audio files live strictly in the workspace, never in the PoC repo.
5. **Brand Polish Layer (A3 Rule):**
   Replaces raw plainness with disciplined Next Web Works brand polish while strictly retaining anti-slop visual bans:
   - **Recording Frame:** Flat brand background (`--color-canvas: #0B0F19`); the screen recording is inset with brand corner radius (`16px`) and a single soft elevation shadow (`box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.5)`).
   - **Narration Captions:** Burned-in, timed to generated narration; brand typography (`Inter`), positioned in the bottom safe area, maximum 2 lines. The active phrase is emphasized via bold weight (`font-weight: 700`) or accent color (`#2563EB`) only. No bounce or cartoon pop animations.
   - **Smart Zoom:** Subtle ease-in to the active interaction region, returning to full frame between actions. Maximum 1 zoom per scene; one easing family (`power2.inOut`).
   - **Click Emphasis:** Clean ring pulse at click points (`transform: scale()`, opacity fade) without neon glow.
   - **Transitions:** One transition family across the whole video (simple crossfade of 0.3–0.5s duration); zero shader wipes.
   - **Pacing:** Zero dead air; speed-ramp loading waits.
   - **Opening Title & Closing CTA:** Text reveal with smooth fade and subtle 16px rise using `power2.out`, flat `#0F172A` surface, held $\ge 3$s.
   - **Anti-Slop Bans Retained:** Banned: gradient mesh, glassmorphism blur, neon glows, emoji tiles, generic 3-up card grids, bouncy easing.

### Step 6: Single-Scene Validation & Pre-Presentation Scan (A4 Rule)
1. Run `npx hyperframes check` and inspect diagnostic outputs.
2. **Extended Pre-Presentation Scan (A4):**
   - Confirm **0 scenes** carry audio from human recordings (`muted data-volume="0"` on all `<video>`).
   - Audit audio streams via `ffprobe` (confirm exactly 1 voice stream, plus music only if supplied).
   - Report measured loudness numbers (-16 LUFS target, -1 dBTP true peak).
   - Confirm burned-in captions cover full narration with **0 forbidden terms**.
   - Verify exactly one transition family (crossfade) is used.
   - Verify real UI runtime share is $\ge 70\%$.
3. User inspects interactive preview in local studio (`npm run dev` / `npx hyperframes preview`). The agent never drives a browser.

### Step 7: Draft Quality Render & Preview Review
1. A draft-quality render is permitted for human review to inspect the local audio mix.
2. The agent MUST NOT render the final high-quality master MP4 or push to Cloudflare R2 until the user explicitly approves the preview and audio in chat.

### Step 8: Final Master Render & Hosting
1. Render final high-quality master MP4 after preview and audio approval:
   `npx hyperframes render --quality high --output <project>-walkthrough.mp4`
2. If Cloudflare R2 credentials exist, upload; otherwise provide upload commands for user.
3. Write `poc/<project>/gate-6-walkthrough/video-record.md` recording voice ID, TTS engine, speed, and streaming URL.
4. Update `urls.video` in `state.json`.
5. Compile `poc/<project>/gate-6-walkthrough/evidence.md` with complete A4 scan results.
6. Set status: `node <path>/poc-state.mjs set-status 6 awaiting_approval`.

---

## 4. Output Files
All files reside in `poc/<project>/gate-6-walkthrough/`:
- `script.md`: Plain-language narrative with spoken phonetic pronunciation mappings.
- `shot-list.md`: Screen-first cue sheet formatted in HyperFrames `STORYBOARD.md` structure.
- `video-record.md`: Cloudflare R2 streaming URL, exact duration, resolution, voice name, TTS engine, speed multiplier, loudness numbers, and workspace path.
- `evidence.md`: Summary of audience brief, script approval, voice selection, A4 scan report, and hosted link.
*(The gate directory holds zero `node_modules` and zero video binaries).*

---

## 5. Evidence to Present
Present `poc/<project>/gate-6-walkthrough/evidence.md` containing:
- Target audience profile and business outcome statement.
- Human script pre-approval and chosen voice model confirmation.
- **A4 Pre-Presentation Scan Report:** Zero recorded audio leakage verified, audio streams audit, measured loudness numbers (-16 LUFS / -1 dBTP), caption coverage and 0 forbidden terms, transition consistency, and real UI share $\ge 70\%$.
- Confirmed video runtime in seconds (verified $\ge 60\text{s}$ and $\le 120\text{s}$).
- Pinned HyperFrames framework version and external sibling workspace path.
- Active state confirmation (`Gate 6 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 7.`

---

## 6. Manual Checklist for Me (A5 Rule)
- [ ] Voice sounds natural, articulate, and clear.
- [ ] Product name and URL are pronounced correctly in spoken form.
- [ ] No trace of human microphone audio, breath sounds, or room noise.
- [ ] Narration pace is comfortable and conversational (~130–150 wpm).
- [ ] Captions are readable, synced to voice, and within the bottom safe area.
- [ ] The video feels polished with smooth frame insets and zooms, not plain.
- [ ] The aesthetic is authentic to `nextwebworks.in`, not generic AI slop.
- [ ] A non-technical client could follow this without assistance.
- [ ] Most of the runtime ($\ge 70\%$) shows the real product UI.
- [ ] Confirm video duration is within 60 to 120 seconds.
- [ ] Confirm the outro holds the demo/landing URL clearly for at least 3 seconds.

---

## 7. Reject Handling
1. If the voice pace or pronunciation requires adjustment, edit phonetic mapping or speed multiplier in place.
2. If styling or layout breaks anti-slop rules, edit HTML/GSAP files in place in the external workspace.
3. Run `node <path>/poc-state.mjs reject 6 "<issue summary>"`.
4. Re-run `check` and preview to verify fixes.
5. Update `video-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present. Never duplicate files.

---

## 8. Exit Condition
- Script and pronunciation map approved by user prior to generation.
- Generated voiceover is normalized, synced, and approved by the user.
- Video duration confirmed strictly between 60 and 120 seconds.
- Hosted Cloudflare R2 video URL is accessible and streaming properly.
- The user explicitly types `APPROVE GATE 6` in chat.
- `node <path>/poc-state.mjs approve 6 "APPROVE GATE 6"` executes successfully, advancing `currentGate` to 7.
- Remind the user to trigger `/compact` before proceeding to Gate 7.
