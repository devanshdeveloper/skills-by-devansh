# Gate 6: Paid Conversion Rulebook

## 1. Goal
Convert the validated pilot trial into a binding commercial client engagement. Conduct an executive decision meeting evaluated strictly against the signed pilot criteria, author a Mutual Action Plan (MAP), formulate contract term options (full project, phased pilot-to-scale, or monthly retainer), generate an executive proposal data model, and prepare an invoice draft for human sign-off.

---

## 2. Entry Criteria
1. Gate 5 (Pilot-Trial) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 6` with status `"in_progress"`.
3. Pilot results report confirmed passing all agreed business and usage criteria.

---

## 3. Steps
1. **Decision Meeting Preparation:**
   Prepare the commercial closing session agenda comparing the signed Gate 5 success criteria directly against the empirical results. Ensure the pre-agreed conversion price is anchored as the default path.
2. **Author Mutual Action Plan (MAP):**
   - Where installed, utilize the `close-plan` skill to structure closing milestones.
   - Author `pipeline/<prospect>/gate-6/mutual-action-plan.md` outlining shared buyer-seller timelines: contract execution, security review, billing setup, and project kickoff date.
3. **Draft Contract Term Options:**
   Author `pipeline/<prospect>/gate-6/contract-options.md` presenting structured commercial options tailored to Next Web Works services:
   - *Option A (Full Project SOW):* Complete fixed-scope Next.js website/web application buildout.
   - *Option B (Phased Sprint Pack):* 3-month iterative development sprints with bi-weekly milestone deliverables.
   - *Option C (Ongoing Technical Retainer):* Monthly continuous engineering retainer covering performance optimization, CMS management, and feature enhancements.
   > [!IMPORTANT]
   > **Human Pricing Decision Invariant:**
   > Final pricing figures, commercial discounts, payment schedules, and legal liability terms are the **exclusive decision of the human user**. The agent only drafts structured options based on human inputs.
4. **Compile Proposal Data & Executive Proposal Artifact:**
   - Author `pipeline/<prospect>/gate-6/proposal-data.json` mirroring the proven commercial schema from `poc-to-proposal` (Gate 8).
   - Reuse the proposal rendering runbook to produce the finalized client presentation.
5. **Author Invoice Draft:**
   Author `pipeline/<prospect>/gate-6/invoice-draft.md` outlining the initial invoice: line items, billing entity details, bank wire / ACH / Stripe instructions, tax identifiers, and payment due date.
   *Zero-Send Invariant: The agent drafts the invoice; the human user issues it.*
6. **Update State & Present:**
   - Register artifacts under `artifacts.gate6` in `state.json`.
   - Present contract options, MAP, proposal data, and invoice draft in chat.
   - Present the Approval Question and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-6/`:
- `mutual-action-plan.md`: Aligned closing calendar with buyer responsibilities and signing deadlines.
- `contract-options.md`: SOW and retainer options with deliverables, scope bounds, and payment schedules.
- `proposal-data.json`: Validated machine-readable commercial data structure with zero hallucinated figures.
- `invoice-draft.md`: Itemized initial invoice draft for human billing execution.

---

## 5. Approval Question
> "Do you approve the Gate 6 Contract Terms, Mutual Action Plan, and Invoice Draft for `<prospect>`? (Reply with exact text **`APPROVED`** to confirm agreement documents and unlock Gate 7 Customer Success, or provide feedback to revise commercial terms in place)."

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- Prospect attempts to re-trade the pre-agreed conversion price below profitable thresholds.
- Legal or procurement negotiations reach an unresolvable impasse (e.g. unreasonable indemnification).
- Corporate budget is frozen or revoked by executive leadership.
- Prospect abruptly stops responding during final contract execution.
