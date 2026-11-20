# Gate 6: Rollback and Resume Protocol Rulebook

## 1. Goal
Provide standard operating procedures and deterministic commands for (1) resuming an interrupted best-practices workflow session at any point, and (2) reverting changes introduced by any individual applied skill via its isolated atomic git commit without disrupting other improvements.

---

## 2. Entry Criteria
- The user requests to resume an incomplete run, or
- The user requests to undo or revert one or more skills applied during Gate 4.

---

## 3. Resume Protocol

When a session is restarted or resumed after context compaction, interruption, or crash:

1. **Locate State File:**
   - Verify existence of `<target-repo>/best-practices/state.json`.
   - If missing, the pipeline must be initialized from Gate 0.

2. **Inspect Current Gate & Roster:**
   - Read `state.json`:
     - `currentGate`: Active gate number ($0, 1, 2, 3, 4, 5$).
     - `status`: Status of current gate (`in_progress`, `awaiting_approval`, etc.).
     - `approvedShortlist`: Array of shortlisted skills and their statuses (`pending`, `applied`, `skipped`, `no-op`).
     - `branch`: Target git branch name.

3. **Verify Git Branch Alignment:**
   - Check current branch:
     ```bash
     git rev-parse --abbrev-ref HEAD
     ```
   - If not on the recorded `branch`, switch to it:
     ```bash
     git checkout <branch-from-state>
     ```

4. **Fast-Forward to Active Gate:**
   - If resuming at **Gate 0, 1, 2, or 3**: re-open the respective gate rulebook and present the current state summary.
   - If resuming at **Gate 4 (Apply Loop)**:
     - Find the first skill in `approvedShortlist` whose status is still `"pending"`.
     - Resume execution starting with that skill's step (install, audit findings, or edit approval).
   - If resuming at **Gate 5 (Report & Close)**:
     - Proceed directly to final walkthrough compilation.

---

## 4. Rollback & Revert Protocol

Because every applied skill receives an isolated local git commit (`best-practices: apply <skill>@<pin>`), any skill can be rolled back individually:

1. **Identify Commit Hash:**
   - Read `state.json` to inspect `commits`:
     ```json
     {
       "skill": "vercel-react-best-practices",
       "commit": "a1b2c3d",
       "message": "best-practices: apply vercel-react-best-practices@v1.2.0"
     }
     ```
   - Or inspect git log:
     ```bash
     git log --grep="best-practices: apply" --oneline
     ```

2. **Execute Clean Git Revert:**
   - Revert the specific commit without rewriting git history:
     ```bash
     git revert --no-edit <commit-hash>
     ```
   - This cleanly inverts the file modifications introduced by that skill while leaving earlier and later commits intact.

3. **Re-Run Verification:**
   - Immediately verify that reverting the skill did not break the project build:
     ```bash
     npm run lint
     npm run typecheck
     npm run build
     ```

4. **Update `best-practices/state.json`:**
   - Update the skill's entry in `approvedShortlist` and `appliedSkills`:
     - Mark status as `"reverted"`.
     - Log revert commit hash and timestamp.
     - Decrement applied skill count.

5. **Clean Orphaned Skill Package (Optional):**
   - If the reverted skill is no longer needed in the workspace:
     ```bash
     DISABLE_TELEMETRY=1 npx skills remove <skill-name> -y
     ```

---

## 5. Emergency Full Rollback

If the user directs a complete abort of the entire best-practices run:

1. **Return to Origin Branch:**
   ```bash
   git checkout main
   ```
2. **Delete Feature Branch:**
   ```bash
   git branch -D best-practices/<date>
   ```
3. **Remove State Directory:**
   - Delete `best-practices/` directory if clean reset is requested.
4. **Clean Project Skills:**
   - Execute `git checkout -- skills-lock.json .agents/skills/`.

---

## 6. Manual Checklist for Me
- [ ] Confirm revert targeted the exact commit hash intended.
- [ ] Verify `npm run build` succeeds after revert.
- [ ] Confirm `state.json` reflects reverted status accurately.
- [ ] Confirm no unstaged artifacts remain in working tree.
