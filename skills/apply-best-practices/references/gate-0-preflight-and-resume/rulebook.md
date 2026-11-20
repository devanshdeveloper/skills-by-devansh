# Gate 0: Preflight and Resume Rulebook

## 1. Goal
Establish an environment baseline, verify prerequisite discovery tooling (`find-skills`), handle state recovery if resuming a previous run, verify clean git working tree hygiene, and isolate execution inside a dedicated feature branch (`best-practices/<date>`).

---

## 2. Entry Criteria
1. The user invokes `/apply-best-practices` (with optional arguments: `--dry-run`, focus filter).
2. The agent is executing in the target repository workspace.

---

## 3. Steps

1. **State Inspection & Resume Detection:**
   - Check if `<target-repo>/best-practices/state.json` exists.
   - If present:
     - Read `currentGate`, `status`, `approvedShortlist`, and `appliedSkills`.
     - Present current status summary to the user.
     - Ask the user: *"Previous run detected at Gate [N]. Do you wish to [RESUME] from current gate, or [RESTART] from scratch?"*
     - If user selects **RESTART**: archive existing state to `best-practices/state.backup-<timestamp>.json` and initialize a fresh state.
     - If user selects **RESUME**: fast-forward directly to `currentGate`.
   - If not present:
     - Initialize `best-practices/state.json` with `currentGate: 0`, `status: "in_progress"`, and mode (`"dry-run"` if `--dry-run` passed, else `"full"`).

2. **Verify `find-skills` Tooling:**
   - Verify whether `find-skills` is accessible to the agent (check `.agents/skills/find-skills/SKILL.md` or global skills).
   - If missing:
     - Inform the user: *"Prerequisite discovery skill `find-skills` is required. Requesting approval to install official `vercel-labs/skills`."*
     - Upon confirmation, execute:
       ```bash
       DISABLE_TELEMETRY=1 npx skills add vercel-labs/skills --skill find-skills -y
       ```
     - Verify installation succeeded.

3. **Git Working Tree Hygiene:**
   - Execute `git status --porcelain`.
   - If uncommitted changes exist:
     - Stop immediately and report dirty status to the user.
     - Request user to commit or stash existing changes before proceeding. Do not stash automatically.

4. **Branch Creation / Isolation:**
   - Check current git branch name:
     - If already on `best-practices/<date>`, reuse it.
     - Otherwise, format branch name as `best-practices/YYYY-MM-DD`.
     - Create or checkout the branch:
       ```bash
       git checkout -B best-practices/<YYYY-MM-DD>
       ```
     - Record the active branch in `best-practices/state.json`.

5. **Update State & Present:**
   - Set Gate 0 status to `awaiting_approval` in `best-practices/state.json`.
   - Present Gate 0 evidence and approval question in chat, then pause.

---

## 4. Output Files
- `<target-repo>/best-practices/state.json`: State machine descriptor with environment metadata and mode.
- `<target-repo>/best-practices/gate-0-preflight/evidence.md`: Preflight verification summary.

---

## 5. Evidence to Present & Approval Question
Present `best-practices/gate-0-preflight/evidence.md` containing:
- State file status (fresh initialized or resumed from gate N).
- `find-skills` availability check result.
- Clean git working tree verification.
- Active isolated branch (`best-practices/<date>`).
- Mode confirmation (`full` vs `dry-run`, focus filter).

> "Do you approve Gate 0 Preflight to proceed to Gate 1 (Detect Stack)? (Reply with **`APPROVE GATE 0`** to advance, or provide feedback)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 1.

---

## 6. Manual Checklist for Me
- [ ] Confirm working tree was clean before branch creation.
- [ ] Verify `find-skills` is installed without errors.
- [ ] Verify branch name adheres to `best-practices/<date>`.
- [ ] If resuming, verify previous gate state is preserved accurately.

---

## 7. Reject Handling
1. If the user requests a different branch name, switch to the requested branch and update `state.json`.
2. If the user wants to adjust mode (e.g. switch to `--dry-run`), update `mode` in `state.json`.
3. If the user points to unstashed work, pause until the user confirms git status is clean.

---

## 8. Exit Criteria
- `best-practices/state.json` is persisted.
- Git branch is isolated and clean.
- `find-skills` is verified.
- User explicitly replies `APPROVE GATE 0`.
- Advance `currentGate` to 1.
