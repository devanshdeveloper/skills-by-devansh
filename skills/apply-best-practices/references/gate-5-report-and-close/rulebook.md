# Gate 5: Report and Close Rulebook

## 1. Goal
Synthesize the end-to-end results of the best-practices application run into an executive Walkthrough deliverable, provide a comprehensive manual verification checklist for the human developer, optionally distill the successfully applied practices into an Antigravity rule (`.agents/rules/best-practices.md`), record a CHANGELOG entry, bump the version in the target repository, and conclude without pushing unless explicitly directed.

---

## 2. Entry Criteria
1. All skills in `approvedShortlist` have completed their Gate 4 cycles (`applied`, `no-op`, or `skipped`).
2. Current working tree is clean.
3. `currentGate: 5` in `best-practices/state.json`.

---

## 3. Steps

1. **Synthesize Execution Walkthrough:**
   - Collate all per-skill reports from `best-practices/gate-4-apply/`:
     - Total skills vetted vs applied vs skipped vs declared no-ops.
     - Exhaustive list of all modified files across the pipeline.
     - Chronological list of atomic commits created (`best-practices: apply <skill>@<pin>`).
     - Verification benchmarks executed (lint, typecheck, build logs).
     - Deferred or out-of-scope opportunities identified for future sprints.
   - Author `<target-repo>/best-practices/gate-5-close/walkthrough.md`.

2. **Assemble Human Manual Test Checklist:**
   - Author a targeted, human-actionable checklist covering:
     - End-to-end application verification.
     - Critical user flows affected by modernized code.
     - Rollback readiness test (confirming `git revert <commit>` functions as expected).

3. **Distill Applied Practices into a Repo Rule (Optional, Behind Human Approval):**
   - Offer the user:
     *"Would you like to distill the best practices applied during this run into a persistent repository rule at `.agents/rules/best-practices.md` so that future agents follow these guidelines automatically?"*
   - If approved by the user:
     - Author `.agents/rules/best-practices.md` formatted strictly with valid YAML frontmatter:
       ```markdown
       ---
       trigger: model_decision
       description: Core repository best practices, architectural guardrails, and coding conventions established by apply-best-practices.
       ---

       # Repository Best Practices

       ## Applied Patterns & Guardrails
       ...
       ```
     - Enforce strict size limit: ensure `.agents/rules/best-practices.md` is strictly under 24 KB (under 24,000 bytes) and under 500 lines.
     - Stage and commit the rule:
       ```bash
       git add .agents/rules/best-practices.md
       git commit -m "docs(rules): codify repository best practices"
       ```

4. **Target Repository CHANGELOG & Version Bump:**
   - If the target repository maintains a `CHANGELOG.md` or version field in `package.json`:
     - Add a structured entry under the active version documenting applied best-practice improvements.
     - Bump target repo patch version where appropriate.
     - Stage and commit:
       ```bash
       git commit -am "chore(release): bump version and update changelog for best-practices audit"
       ```

5. **Push Restriction:**
   - **DO NOT push to remote repositories (`git push`) without explicit user command.**

6. **Final State Transition:**
   - Update `best-practices/state.json` setting `status: "completed"` and recording timestamp.
   - Present final Walkthrough, manual checklist, and close summary in chat.

---

## 4. Output Files
- `<target-repo>/best-practices/gate-5-close/walkthrough.md`: Comprehensive executive report of all applied skills and code changes.
- `<target-repo>/best-practices/gate-5-close/manual-checklist.md`: Interactive developer test verification checklist.
- `<target-repo>/.agents/rules/best-practices.md` *(optional upon approval)*: Codified persistent rules file.
- `<target-repo>/best-practices/state.json`: Finalized state marked `completed`.

---

## 5. Evidence to Present & Approval Question
Present `walkthrough.md` and `manual-checklist.md`:

> "The Best Practices pipeline run has completed all gates.
> - Applied skills: [N]
> - Commits created: [List]
> - Rule distillation offered: `.agents/rules/best-practices.md`
>
> Do you approve closing the run? (Reply with **`CLOSE RUN`** to finalize state, or specify any remaining adjustments)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom.

---

## 6. Manual Checklist for Me
- [ ] Review all commits created during the run using `git log -n <count> --oneline`.
- [ ] Verify `walkthrough.md` lists every touched file accurately.
- [ ] Verify `.agents/rules/best-practices.md` has valid frontmatter and is under 24 KB.
- [ ] Verify `best-practices/state.json` status is `completed`.
- [ ] Confirm no unauthorized remote push occurred.

---

## 7. Reject Handling
1. If the user wants to revert any specific skill, execute rollback instructions per [gate-6-rollback-and-resume/rulebook.md](../gate-6-rollback-and-resume/rulebook.md).
2. If the user declines rules distillation, omit `.agents/rules/best-practices.md`.

---

## 8. Exit Criteria
- `walkthrough.md` and `manual-checklist.md` delivered.
- `best-practices/state.json` status is `completed`.
- Working tree is clean.
