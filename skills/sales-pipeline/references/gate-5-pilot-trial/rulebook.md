# Gate 5: Pilot-Trial Rulebook

## 1. Goal
Execute a strictly bounded, paid pilot trial establishing real-world technical and business validity inside the prospect's operating environment. Require an agreed upfront conversion price and definitive success criteria, track progress in a weekly operational log, and evaluate performance in an empirical results report.

---

## 2. Entry Criteria
1. Gate 4 (Live PoC Demonstration) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 5` with status `"in_progress"`.
3. Prospect confirmed intent to validate the architecture in a live pilot trial.

---

## 3. Steps
1. **Draft One-Page Pilot Agreement:**
   Author `pipeline/<prospect>/gate-5/pilot-agreement.md` strictly containing 5 core pillars:
   - **Business Outcome:** Quantifiable performance or operational target (e.g. mobile conversion lift $\ge 15\%$, page load speed $< 1.5\text{s}$, zero downtime during flash traffic).
   - **Usage Milestone:** Tangible utilization metric (e.g. 500 real user sessions routed through new App Router flow, 5 team members trained on NWW CMS).
   - **Stakeholder Review Committee:** Named evaluators (e.g. CTO, VP of Marketing, Lead Architect).
   - **Hard End Date:** Fixed duration of **2 to 6 weeks** (strictly rejecting open-ended or indefinite trials).
   - **Explicit Failure Criteria:** Conditions under which the pilot terminates without moving to full rollout.
   - **Commercial Terms Agreed Up Front:**
     - Paid Pilot Fee (paid upfront deposit).
     - **Pre-Agreed Full Conversion Price:** The permanent project price or monthly retainer fee locked in before starting the pilot, eliminating re-negotiation upon success.
2. **First Approval (Agreement Sign-Off):**
   Present the draft agreement in chat.
   > [!IMPORTANT]
   > The pilot trial MUST NOT start until the human user explicitly approves the written agreement and executes it with the prospect.
3. **Execute Pilot & Maintain Weekly Check-In Log:**
   Maintain `pipeline/<prospect>/gate-5/weekly-log.md` logging:
   - Week 1: Environment setup, analytics instrumentation, and kickoff alignment.
   - Week 2–4: Weekly performance tracking, blocker triage, and stakeholder sync notes.
   - Final Week: Data aggregation and milestone assessment against the agreed criteria.
4. **Author Empirical Results Report:**
   Author `pipeline/<prospect>/gate-5/pilot-results.md` compiling:
   - Baseline metrics (Gate 3) vs Final Pilot Metrics (Gate 5).
   - Goal-by-goal scorecard (Pass / Fail / Exceeded).
   - Stakeholder feedback and written user testimonials.
   - Formal recommendation for full enterprise rollout based on pre-agreed conversion pricing.
5. **Second Approval (Results Sign-Off):**
   Present the results report to the user in chat. Secure human approval of the findings before scheduling the Gate 6 paid conversion decision meeting.
6. **Update State & Present:**
   - Register artifacts under `artifacts.gate5` in `state.json`.
   - Present the Approval Question and Context Compaction tip (`> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 6.`) and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-5/`:
- `pilot-agreement.md`: One-page contractual framework with success criteria, hard end date, paid pilot fee, and pre-agreed conversion price.
- `weekly-log.md`: Chronological log of weekly check-ins, milestone statuses, and blocker resolutions.
- `pilot-results.md`: Empirical performance evaluation measured directly against agreed success criteria.

---

## 5. Approval Question
> "Do you approve the Gate 5 Pilot Results and performance scorecard for `<prospect>` to advance to Gate 6 Paid Conversion? (Reply with exact text **`APPROVED`** to advance, or provide feedback to revise in place)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 6.

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- Prospect refuses to sign a bounded, paid agreement or insists on free indefinite pilots.
- The trial triggers an explicit failure criterion defined in the agreement.
- Stakeholder committee formally decides not to proceed with the technology.
- Key sponsor or champion departs the organization during the trial.
