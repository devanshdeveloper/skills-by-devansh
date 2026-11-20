# Gate 2: Manual Test Rulebook

## 1. Purpose
Execute comprehensive manual human testing across all views, routes, and interactions of the PoC. Enforce strict defect elimination through code remediation until every screen achieves 100% human verification with zero open defects.

---

## 2. Entry Conditions
1. Gate 1 is approved with tag `poc-scope-frozen` recorded in git.
2. `poc/<project>/state.json` reflects `currentGate: 2` with status `in_progress`.
3. Local development server is operable or builds cleanly.

---

## 3. Steps
1. **Zero Automated Testing Invariant:**
   Automated test runners (Jest, Vitest, Playwright, Cypress), test scripts, test code fixtures, and new test dependencies are strictly forbidden. The agent must NOT invoke browser automation tools or capture screenshots. Testing is 100% human-operated.
2. **Static Codebase Audit for Screen Inventory:**
   Read project route definitions (e.g. Next.js `app/` routes, React Router trees, Express paths, or page components) and nested UI states (drawers, dialogs, modals).
   Compile `poc/<project>/gate-2-manual-test/screen-inventory.md`.
3. **Generate Per-Screen Manual Checklist:**
   For every identified screen and modal, author explicit manual verification items in `poc/<project>/gate-2-manual-test/manual-checklist.md`:
   - **Happy Path:** Primary expected user journey and core workflow.
   - **Empty States:** Viewport behavior with zero data, initial load, or empty search.
   - **Error Handling:** Client-side validation triggers, API failure handling, error boundaries.
   - **Loading States:** Skeleton screens, spinners, and pending action UI.
   - **Mobile Viewport:** Responsive layout ergonomics, viewport scaling, touch targets.
   - **Keyboard & Accessibility:** Tab navigation, escape key modal dismiss, focus visibility.
4. **Initialize Defect Registry:**
   Create `poc/<project>/gate-2-manual-test/defects.md` with structured columns (Defect ID, Screen, Description, Status, Resolution Commit).
5. **Human Testing Loop & Defect Remediation:**
   - The user opens the local PoC in their browser and reviews each item in `manual-checklist.md`.
   - The user logs failures or defects in `defects.md`.
   - The agent fixes reported defects directly in the codebase using IDE editor tools (`write_file`, `edit_file`).
   - The agent re-generates checklist items for only the affected screens.
   - Repeat until all screens are marked `PASS` and all defects are resolved (`CLOSED`).
6. **Compile Evidence & Pause:**
   Draft `poc/<project>/gate-2-manual-test/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 2 awaiting_approval`. Present evidence and pause for approval.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-2-manual-test/`:
- `screen-inventory.md`: Complete catalog of application routes, screens, and modals.
- `manual-checklist.md`: Itemized testing criteria for each screen across 6 ergonomic dimensions.
- `defects.md`: Registry of logged defects, triage status, and code fixes.
- `evidence.md`: Summary of testing outcomes, defect counts (zero open), and verification statement.

---

## 5. Evidence to Present
Present `poc/<project>/gate-2-manual-test/evidence.md` containing:
- Total number of screens and routes audited.
- Status breakdown of manual checklist items (100% PASS required).
- Defect summary table showing all reported defects marked `CLOSED` with fix references.
- Confirmation that no automated test frameworks or dependencies were introduced.
- Active state confirmation (`Gate 2 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 3.`

---

## 6. Manual Checklist for Me
- [ ] Test the happy path on every screen in a local browser.
- [ ] Verify empty states render gracefully without layout breaks.
- [ ] Trigger error states (e.g. invalid forms, offline simulation) to inspect error UI.
- [ ] Verify responsive behavior on mobile and tablet viewport widths.
- [ ] Test keyboard navigation (Tab, Enter, Esc) across forms and dialogs.
- [ ] Confirm all defects logged in `defects.md` have been resolved.

---

## 7. Reject Handling
1. If any screen fails testing or a new defect is uncovered, log the defect in `defects.md`.
2. Run `node <path>/poc-state.mjs reject 2 "<defect summary>"`.
3. Agent analyzes source code and applies remediation using native editor tools.
4. Agent re-presents only the affected screen checklist in `manual-checklist.md`.
5. Once fixed and validated by the human, update `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- 100% of screens in `manual-checklist.md` are marked `PASS` by the user.
- `defects.md` contains zero open (`OPEN` or `IN_PROGRESS`) defects.
- The user explicitly types `APPROVE GATE 2` in chat.
- `node <path>/poc-state.mjs approve 2 "APPROVE GATE 2"` executes successfully, advancing `currentGate` to 3.
- Remind the user to trigger `/compact` before proceeding to Gate 3.
