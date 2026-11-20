# Gate 6: Walkthrough Video Rulebook

## 1. Purpose
Produce a concise, professional 60–120 second executive product walkthrough video demonstrating the frozen demo flow. Prepare a synchronized voiceover script and shot list, enforce human pre-approval of the script before recording, coordinate external screen recording, and secure cloud video hosting.

---

## 2. Entry Conditions
1. Gate 5 is approved; live demo subdomain `https://<project>-demo.nextwebworks.in` is operational.
2. `poc/<project>/state.json` reflects `currentGate: 6` with status `in_progress`.
3. Gate 1 demo flow from `scope.md` is readily accessible.

---

## 3. Steps
1. **Draft Voiceover Script:**
   - Author a targeted script of 150–300 words (matching standard professional voiceover pacing of ~150 words per minute for a 60–120s runtime).
   - Hook the viewer in the first 5 seconds with the core business problem.
   - Walk sequentially through the Gate 1 demo flow steps.
   - Conclude with a clear enterprise call-to-action.
   - Save to `poc/<project>/gate-6-walkthrough/script.md`.
2. **Draft Timestamped Shot List:**
   - Author a second-by-second visual shot list mapped directly to script segments in `poc/<project>/gate-6-walkthrough/shot-list.md`.
   - Specify viewport focus, mouse cursor actions, transitions, and key UI callouts.
3. **Mandatory Human Script Pre-Approval:**
   Present the script and shot list to the user in chat. The user MUST approve the script text before screen recording begins.
4. **Human Screen Recording (Zero Agent Recording Invariant):**
   > [!IMPORTANT]
   > The agent NEVER records video, triggers screen capture tools, or takes screenshots. The human user records the video externally using their preferred desktop recording tool (OBS, CleanShot X, Loom, QuickTime).
5. **Video Duration & Pacing Verification:**
   The user provides the raw video file path or hosted URL.
   The user explicitly confirms that total runtime falls strictly between **60 and 120 seconds**.
6. **Remotion Constraint:**
   Remotion is used ONLY if the user explicitly requests programmatic branded intro/outro title cards, animated motion overlays, or automated burn-in captions. Never introduce Remotion for standard uncut recordings.
7. **Cloud Video Hosting:**
   - Do NOT commit video binaries to git.
   - If Cloudflare R2 credentials exist in the environment (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`), the agent may execute an upload script to upload the asset.
   - Otherwise, the agent generates explicit upload instructions for the user (Cloudflare Stream, Vimeo, YouTube unlisted, or AWS S3/R2).
8. **Record Video Metadata:**
   Write `poc/<project>/gate-6-walkthrough/video-record.md` documenting the hosted video URL, exact duration in seconds, file size, and hosting provider.
   Update `state.json` field `urls.video`:
   `node <path>/poc-state.mjs set-field urls.video "<hosted-video-url>"`
9. **Compile Evidence & Pause:**
   Draft `poc/<project>/gate-6-walkthrough/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 6 awaiting_approval`. Present evidence and pause for approval.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-6-walkthrough/`:
- `script.md`: Complete voiceover narrative with word count metrics.
- `shot-list.md`: Timestamped visual cue sheet matching script lines to UI interactions.
- `video-record.md`: Hosted streaming URL, video duration (60–120s), hosting host, and resolution specs.
- `evidence.md`: Summary of script approval, recording verification, duration check, and hosted video playback link.

---

## 5. Evidence to Present
Present `poc/<project>/gate-6-walkthrough/evidence.md` containing:
- Voiceover word count and target speaking rate (~150 wpm).
- Human script pre-approval confirmation.
- Confirmed video runtime in seconds (verified $\ge 60\text{s}$ and $\le 120\text{s}$).
- Hosted video playback URL (`urls.video`).
- Confirmation that no video binary files are committed to git.
- Active state confirmation (`Gate 6 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 7.`

---

## 6. Manual Checklist for Me
- [ ] Review and approve the voiceover script before recording.
- [ ] Record the desktop screen following the timestamped shot list on the live demo subdomain.
- [ ] Verify that total video runtime is strictly within 60 to 120 seconds.
- [ ] Upload video to cloud storage or confirm agent R2 upload.
- [ ] Open the hosted playback URL in a browser and verify audio clarity and video resolution.

---

## 7. Reject Handling
1. If the script requires revisions, edit `poc/<project>/gate-6-walkthrough/script.md` in place before recording.
2. If the recorded video is outside the 60–120s boundary or features pacing defects, user re-records the clip.
3. Run `node <path>/poc-state.mjs reject 6 "<video/script issue>"`.
4. Update `video-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- Script is approved by user prior to recording.
- Video duration confirmed between 60 and 120 seconds.
- Hosted video URL is accessible and streaming properly.
- The user explicitly types `APPROVE GATE 6` in chat.
- `node <path>/poc-state.mjs approve 6 "APPROVE GATE 6"` executes successfully, advancing `currentGate` to 7.
- Remind the user to trigger `/compact` before proceeding to Gate 7.
