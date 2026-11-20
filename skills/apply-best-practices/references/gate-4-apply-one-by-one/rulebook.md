# Gate 4: Apply One-by-One Rulebook

## 1. Goal
Execute incremental, isolated best-practice applications—strictly ONE approved skill per gate cycle ($Gate\ 4.1, 4.2, \dots, 4.K$). For each skill, install the pinned release, audit target files, produce a line-cited findings report, await human sign-off on planned edits, apply non-destructive modifications, execute verification commands (lint, typecheck, build), and record an atomic, independently revertable git commit (`best-practices: apply <skill>@<pin>`).

---

## 2. Entry Criteria
1. Gate 3 is approved with a finalized `approvedShortlist` in `best-practices/state.json`.
2. Git working tree is clean.
3. Current skill pointer $i \in [1, K]$ is identified.

---

## 3. Steps

For the active skill $S_i$ from `approvedShortlist`:

1. **Project-Scoped Pinned Installation:**
   - Install $S_i$ into the target project, pinned to its approved tag/commit:
     ```bash
     DISABLE_TELEMETRY=1 npx skills add <package>@<pinnedRef> --skill <skill-name> -y
     ```
   - Verify installation in `.agents/skills/<skill-name>/SKILL.md` and check `skills-lock.json`.
   - Update `state.json` recording installation status.

2. **Codebase Audit & Findings Generation:**
   - Read the skill's instructions in `SKILL.md`.
   - Audit relevant codebase files in `targetWorkspace` against the skill's recommendations.
   - Produce a structured Findings Report:
     - **File & Line Citation:** Exact path and line number range (`path/to/file.ts#L24-L38`).
     - **Recommendation:** What pattern should be modernized or guarded.
     - **Impact & Effort:** Severity rating (High / Medium / Low) and estimated complexity.
     - **Convention Conflict Check:** Cross-reference findings against repository `AGENTS.md` and rules.
       > [!IMPORTANT]
       > **Repo Convention Supremacy:** If the skill advises a pattern that contradicts repo conventions (e.g. suggesting an external library when the repo forbids new dependencies), the repo convention ALWAYS wins. The conflict must be flagged and the change omitted.
     - **No-Op Check:** If the codebase already follows the skill's patterns and zero actionable improvements exist, declare the skill a **no-op**, log it in `state.json`, and advance without modifying files.

3. **Plan File Changes & Pause for Human Sign-Off:**
   - Sequence planned file modifications: smallest, highest-impact changes first.
   - Author `best-practices/gate-4-apply/skill-[i]-[skill-name]/findings.md`.
   - Present the findings, proposed diff plan, and approval question in chat.
   - **STOP CALLING TOOLS AND WAIT FOR EXPLICIT HUMAN APPROVAL.**

4. **Apply Approved Changes:**
   - Upon receiving human approval:
     - Use ONLY native editor tools (`write_file`, `edit_file`).
     - NEVER use shell redirection (`>`, `>>`), heredocs, sed, awk, or codemods.
     - Mirror existing architectural patterns and variable naming conventions.
     - Reuse existing utilities before introducing new abstractions.
     - **STRICT PROHIBITION:** Do NOT install new dependencies, generate database migrations, alter `.env` secrets, or run destructive commands without explicit separate authorization.

5. **Build, Typecheck, and Lint Verification:**
   - Run the repository's native verification commands (if defined in `package.json`):
     - Lint: `npm run lint` / `pnpm lint`
     - Typecheck: `npm run typecheck` / `pnpm typecheck` / `npx tsc --noEmit`
     - Build: `npm run build` / `pnpm build`
   - If any verification check fails due to the applied changes:
     - Fix the regression immediately in place.
     - Re-run verification until 0 errors are reported.
   - Do NOT add new tests or modify existing test files unless explicitly requested.

6. **Author Per-Skill Delivery Report:**
   - Author `best-practices/gate-4-apply/skill-[i]-[skill-name]/report.md` detailing:
     - List of modified files.
     - Verifiable improvements applied.
     - Items verified (lint, typecheck, build outputs).
     - Items NOT verified (runtime/browser behavior, user testing).

7. **Atomic Local Git Commit:**
   - Stage modified application files and gate reports:
     ```bash
     git add <modified-files> best-practices/
     ```
   - Commit with the standardized atomic message:
     ```bash
     git commit -m "best-practices: apply <skill-name>@<pinnedRef>"
     ```
   - Record the commit hash in `best-practices/state.json`.
   - **NEVER push to remote branches without explicit user approval.**

8. **Transition to Next Skill:**
   - Mark skill $S_i$ as `"applied"` in `approvedShortlist`.
   - Update `state.json`.
   - Present commit hash, per-skill report, and `/compact` tip in chat.
   - If more skills remain in `approvedShortlist`, ask approval to begin skill $S_{i+1}$.
   - If all skills are applied, advance `currentGate` to 5 (Report & Close).

---

## 4. Output Files
- `<target-repo>/best-practices/gate-4-apply/skill-[i]-[name]/findings.md`: Line-cited findings and proposed changes.
- `<target-repo>/best-practices/gate-4-apply/skill-[i]-[name]/report.md`: Verification results and touched files list.
- `<target-repo>/best-practices/state.json`: Audit log with commit hash and applied timestamps.

---

## 5. Evidence to Present & Approval Question
Present `findings.md` before editing, and `report.md` after committing:

> "Do you approve the planned changes for `<skill-name>`? (Reply with **`APPROVE CHANGES`** to apply edits, or provide specific adjustments)."
>
> *(After application, verification, and commit)*:
> "Skill `<skill-name>@<pin>` successfully applied in commit `<commit-hash>`. (Reply with **`NEXT SKILL`** to proceed to skill [i+1], or request a rollback via `git revert <commit-hash>`)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for the next skill.

---

## 6. Manual Checklist for Me
- [ ] Verify changes match approved findings exactly.
- [ ] Confirm no new dependencies or secrets were added.
- [ ] Confirm lint, typecheck, and build pass with 0 errors.
- [ ] Confirm atomic commit was created with message `best-practices: apply <skill>@<pin>`.
- [ ] Confirm commit was NOT pushed to remote.

---

## 7. Reject Handling
1. If the user rejects planned findings, mark skill as `"skipped"` or revise findings in place.
2. If verification fails and cannot be cleanly resolved, revert touched files using `git checkout -- <files>` and report failure to the user.

---

## 8. Exit Criteria
- All approved skills in `approvedShortlist` are either `applied`, `no-op`, or `skipped`.
- Each applied skill has an atomic commit recorded in `best-practices/state.json`.
- Advance `currentGate` to 5.
