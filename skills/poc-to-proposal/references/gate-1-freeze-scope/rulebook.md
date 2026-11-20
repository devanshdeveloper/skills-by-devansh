# Gate 1: Freeze Scope Rulebook

## 1. Purpose
Establish an immutable, validated scope baseline for the Proof-of-Concept (PoC). Freeze core requirements, bound feature breadth, define explicit non-goals, and lock in the end-to-end demo flow before any public or external collateral is generated.

---

## 2. Entry Conditions
1. The skill is initialized in the PoC repository.
2. `poc/<project>/state.json` exists with `currentGate: 1` and Gate 1 status set to `in_progress`.
3. Working git branch is clean with all current PoC code committed.

---

## 3. Steps
1. **Interactive Scope Discovery (/grill-me Pattern):**
   Conduct a structured intake interview in chat querying:
   - **Executive Problem Statement:** The core business pain point, operational friction, and commercial value of solving it (used downstream to write client-facing value propositions in Gates 4, 7, and 8).
   - **Target Persona:** Primary decision-makers and end users interacting with the PoC.
   - **In-Scope Capabilities:** Verifiable features already implemented and functional in the PoC.
   - **Explicit Out-of-Scope:** Capabilities intentionally omitted or deferred to production.
   - **Success Criteria:** Measurable technical and functional validation criteria.
   - **Demo Flow:** Step-by-step user journey showcased in live demos.
2. **Draft Scope Document:**
   Compile the findings into `poc/<project>/gate-1-freeze-scope/scope.md`.
3. **Initialize Change Requests Registry:**
   Create an empty baseline change requests log at `poc/<project>/gate-1-freeze-scope/change-requests.md`. Post-freeze feature requests or scope modifications must be recorded here rather than expanding the frozen scope.
4. **Compile Evidence File:**
   Synthesize all discovery decisions and verification benchmarks into `poc/<project>/gate-1-freeze-scope/evidence.md`.
5. **Update State & Pause:**
   Run `node <path>/poc-state.mjs set-status 1 awaiting_approval`. Present `evidence.md` and the manual checklist in chat, then stop and await human input.
6. **Git Tagging on Approval:**
   Upon receiving `APPROVE GATE 1`, execute `git tag -a poc-scope-frozen -m "PoC Scope Frozen at Gate 1"` and run `node <path>/poc-state.mjs approve 1 "APPROVE GATE 1"`.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-1-freeze-scope/`:
- `scope.md`: Detailed problem, user persona, in-scope features, out-of-scope bounds, success metrics, and demo flow.
- `change-requests.md`: Standardized empty log for capturing deferred ideas and post-freeze requests.
- `evidence.md`: Summary of discovery findings, frozen feature list, and tag preparation.

---

## 5. Evidence to Present
Present `poc/<project>/gate-1-freeze-scope/evidence.md` containing:
- Executive summary of the frozen scope.
- In-scope feature table vs explicit out-of-scope boundaries.
- Sequential demo flow summary (steps 1 through N).
- Git status and confirmed tag command (`git tag -a poc-scope-frozen`).
- Active state confirmation (`Gate 1 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 2.`

---

## 6. Manual Checklist for Me
- [ ] Confirm the problem statement captures the real PoC objective.
- [ ] Confirm target user personas align with intended stakeholders.
- [ ] Verify that all listed in-scope features are actually present in the codebase.
- [ ] Verify that out-of-scope boundaries protect against scope creep.
- [ ] Review demo flow steps for visual clarity and narrative logic.

---

## 7. Reject Handling
1. If the user provides corrections or modifications, update `poc/<project>/gate-1-freeze-scope/scope.md` in place.
2. If new feature ideas are introduced that exceed the baseline, log them in `poc/<project>/gate-1-freeze-scope/change-requests.md`.
3. Update `poc/<project>/gate-1-freeze-scope/evidence.md` with revised scope points.
4. Re-run `node <path>/poc-state.mjs set-status 1 awaiting_approval` and re-present for review. Never duplicate files.

---

## 8. Exit Condition
- `scope.md` and `change-requests.md` are persisted and verified.
- The user explicitly types `APPROVE GATE 1` in chat.
- The commit is tagged with annotated git tag `poc-scope-frozen`.
- `node <path>/poc-state.mjs approve 1 "APPROVE GATE 1"` executes successfully, advancing `currentGate` to 2.
- Remind the user to trigger `/compact` before proceeding to Gate 2.
