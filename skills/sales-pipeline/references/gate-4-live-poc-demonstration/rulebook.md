# Gate 4: Live PoC Demonstration Rulebook

## 1. Goal
Demonstrate an operational, high-performance Proof-of-Concept (PoC) to the prospect, proving incontrovertible resolution of the specific baseline pain identified in Gate 3. Delegate technical construction and staging to the repository's existing `poc-to-proposal` skill, craft a problem-centric demonstration narrative (strictly forbidding generic feature tours), and secure human sign-off before showcasing to the client.

---

## 2. Entry Criteria
1. Gate 3 (Discovery) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 4` with status `"in_progress"`.
3. Validated baseline metric and problem statement documented in `discovery-brief.md`.

---

## 3. Steps
1. **Bridge Discovery Pain into PoC Scope:**
   Extract the measurable baseline metric and core obstacle from Gate 3 `discovery-brief.md`.
   Author `pipeline/<prospect>/gate-4/poc-bridge.md` defining the exact technical bridge:
   - *Target Pain to Solve:* E.g., slow mobile page load, clunky client onboarding form, brittle API integration.
   - *Measurable Benchmark Target:* E.g., reducing mobile LCP from 4.8s to < 1.2s, automating dynamic form submissions directly to NextWebWorks CMS.
   - *PoC Project Slug:* Derived as `<prospect>` or `<prospect>-poc`.
2. **Author Pre-Demo Checklist:**
   Author `pipeline/<prospect>/gate-4/pre-demo-checklist.md` providing an exhaustive operational checklist:
   - [ ] Confirm staging cloud deployment resolves over HTTPS with valid SSL.
   - [ ] Seed authentic mock data reflecting the prospect's real industry terms (zero "Lorem Ipsum").
   - [ ] Verify fallback video walkthrough is queued and ready if live internet drops.
   - [ ] Test mobile viewport responsive layout on secondary device or DevTools.
   - [ ] Verify meeting link, screen sharing permissions, and browser tab isolation.
3. **Author Problem-Centric Demo Script:**
   Author a 10–15 minute demonstration script in `pipeline/<prospect>/gate-4/demo-script.md`:
   > [!CAUTION]
   > **Solve The Pain Rule (Zero Feature Tours):**
   > Strictly prohibit generic feature tours ("here is our navigation bar, here is our dashboard"). The demo MUST open immediately with their specific pain point, demonstrate the resolution on screen within the first 3 minutes, show the measurable improvement against their baseline number, and close with the transition to a pilot trial.
4. **Delegate Build & Hosting to `poc-to-proposal`:**
   > [!IMPORTANT]
   > Do NOT duplicate or re-implement PoC technical runbooks. Delegate the full technical build, manual testing, cloud staging, demo subdomain (`<prospect>-demo.nextwebworks.in`), and video walkthrough to the repository's existing `poc-to-proposal` skill.
   - Activate `poc-to-proposal` in the designated PoC workspace (`poc/<prospect>/`).
   - Track progress via `poc/<prospect>/state.json`.
   - Record the resulting live demo URL (`urls.demo`) and walkthrough video URL (`urls.video`) in `pipeline/<prospect>/gate-4/poc-bridge.md`.
5. **Mandatory Human Pre-Approval:**
   Present the PoC scope and the demo script to the user in chat. The human MUST review and approve both the technical scope and the demonstration script BEFORE scheduling or running the live session with the prospect.
6. **Live Demonstration Execution (Human-Led):**
   The user presents the live PoC to the prospect following `demo-script.md`.
7. **Update State & Present:**
   - Register artifacts under `artifacts.gate4` in `state.json`.
   - Record demonstration feedback and prospect reaction in `poc-bridge.md`.
   - Present the Approval Question and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-4/`:
- `poc-bridge.md`: Mapping of Gate 3 discovery pain to PoC technical scope, containing links to `poc/<prospect>/state.json`, live demo subdomain, and meeting feedback.
- `pre-demo-checklist.md`: Operational sanity check covering environment readiness, seed data, and fallbacks.
- `demo-script.md`: 15-minute problem-solving presentation script tied directly to the prospect's baseline pain.

---

## 5. Approval Question
> "Do you approve the Gate 4 PoC Scope, Pre-Demo Checklist, and Demo Script for `<prospect>`? (Reply with exact text **`APPROVED`** to confirm the demonstration materials and unlock Gate 5 Pilot-Trial, or provide feedback to revise in place)."

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- The PoC technical build fails to prove tangible resolution of their baseline metric.
- Prospect expresses fundamental dissatisfaction with the architecture or technology stack.
- Prospect cancels the demonstration meeting and refuses rescheduling.
- Prospect declines advancing toward a paid engagement post-demonstration.
