# Gate 3: Discovery Rulebook

## 1. Goal
Prepare for, document, and analyze a high-conviction discovery consultation with the prospect. Uncover the underlying business obstacle, establish a quantifiable technical baseline metric, identify the ultimate economic buyer, and synthesize findings into an authoritative one-page discovery brief.

---

## 2. Entry Criteria
1. Gate 2 (Outreach) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 3` with status `"in_progress"`.
3. Prospect accepted an invitation for a discovery consultation or exploratory meeting.

---

## 3. Steps
1. **Pre-Call Strategy & Battlecard Preparation:**
   - Where installed, consult `call-prep` or `handle-objection` skills for account intelligence.
   - Author `pipeline/<prospect>/gate-3/call-prep.md` outlining participant roles, LinkedIn background, observed tech stack hurdles, and meeting agenda.
2. **Fixed Diagnostic Question Set:**
   Author `pipeline/<prospect>/gate-3/discovery-questions.md` containing a structured 6-category interview questionnaire:
   - *Technical Obstacle:* "Where does your current web infrastructure fail under peak load or feature releases?"
   - *Commercial Impact:* "What is this performance bottleneck or technical debt costing in conversion, churn, or engineering hours?"
   - *Measurable Baseline Metric:* "What is the exact current metric today (e.g. 4.8s mobile LCP, 1.2% checkout conversion, $18k/month server bill, 3 weeks per landing page deploy)?"
   - *Decision-Making Authority:* "Who ultimately signs off on web architecture initiatives and vendor contracts?"
   - *Budget Signal & Allocation:* "Is there existing budget approved for this quarter, or does an ROI case need to be presented to the board/CFO?"
   - *Target Milestone Timeline:* "What event, product release, or board milestone forces this to be live?"
3. **Capture & Synthesize Call Summary:**
   - Post-call, ingest raw human notes or transcript summaries into `pipeline/<prospect>/gate-3/call-summary.md`.
   - Where installed, use `call-summary` to extract key verbatim quotes and objections.
   - Enforce anti-fabrication: record only statements made directly by the prospect.
4. **Author One-Page Discovery Brief:**
   Author `pipeline/<prospect>/gate-3/discovery-brief.md` strictly summarizing 5 non-negotiable pillars:
   1. **Core Problem:** Concise description of the operational or technical pain point.
   2. **Measurable Baseline Number:** Exact quantifiable metric established during the call.
   3. **Named Economic Buyer:** Name, title, and confirmation of purchasing authority.
   4. **Budget Signal:** Verified budget allocation or pricing tolerance band.
   5. **Target Timeline:** Target delivery milestone or external deadline.
5. **Enforce Go / No-Go Qualification Filter:**
   Evaluate the 5 pillars. If any of the following 3 elements are missing:
   - Zero measurable baseline number (vague "we want it faster" without quantifiable numbers),
   - No named economic buyer (talking only to non-decision-makers with zero access to leadership),
   - Negative or non-existent budget signal (unwilling to invest or seeking free consulting),
   THEN Gate 3 fails immediately and the prospect is routed to nurture or stopped.
6. **Update State & Present:**
   - Register artifacts under `artifacts.gate3` in `state.json`.
   - Present the one-page discovery brief and go/no-go qualification assessment in chat.
   - Present the Approval Question and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-3/`:
- `call-prep.md`: Pre-meeting intelligence, stakeholder profiles, and strategic agenda.
- `discovery-questions.md`: Standardized diagnostic questionnaire covering architecture, metrics, and authority.
- `call-summary.md`: Structured call minutes, prospect quotes, and unvarnished meeting notes.
- `discovery-brief.md`: One-page executive brief documenting pain, baseline metric, decision-maker, budget signal, and timeline.

---

## 5. Approval Question
> "Do you approve the Gate 3 Discovery Brief and go/no-go qualification for `<prospect>` to proceed to Live PoC Demonstration? (Reply with exact text **`APPROVED`** to advance to Gate 4, or provide feedback to revise findings in place)."

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- **Go/No-Go Failure:** Discovery fails to uncover a quantifiable baseline metric, fails to secure access to the economic buyer, or reveals zero budget.
- The prospect's technical requirements fall completely outside agency capabilities.
- The prospect requests free work or refuses to consider paid engagements.
- The prospect disengages or cancels follow-up communications post-discovery.
