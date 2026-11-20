# Gate 8: Proposal PDF Rulebook

## 1. Purpose
Synthesize the entire technical and functional delivery of the PoC into an executive commercial proposal data model, validate commercial terms with the human stakeholder, and compile an official `proposal.pdf` using a designated PDF generation engine.

---

## 2. Entry Conditions
1. Gate 7 is approved; case study is merged to `main` on `nextwebworks-website`.
2. `poc/<project>/state.json` reflects `currentGate: 8` with status `in_progress`.
3. All previous gate deliverables (scope, screen inventory, live URLs, video, case study) are finalized.

---

## 3. Steps
1. **Interactive Commercial Terms Intake:**
   Prompt the user in chat to collect explicit commercial terms:
   - **Scope & Executive Summary:** Synthesis of the problem and solution validated in PoC.
   - **Deliverables List:** Itemized deliverables for full production rollout.
   - **Explicit Exclusions:** What is intentionally omitted from the proposed contract.
   - **Assumptions & Client Dependencies:** Technical prerequisites, access requirements.
   - **Pricing & Currency:** Exact numerical cost and currency (e.g. USD, INR, EUR, GBP).
   - **Timeline & Milestones:** Delivery schedule in weeks or milestone phases.
   - **Payment Terms:** Billing schedule (e.g. 50% upfront deposit, 50% on final delivery).
   - **Proposal Validity:** Expiration date (e.g. 30 days from issuance).
   > [!CAUTION]
   > **Zero Hallucinated Numbers Rule:** The agent must NEVER invent, assume, or extrapolate any price, rate, milestone date, or commercial condition. Every commercial datum must originate directly from human input.
2. **Step A — Author & Pre-Approve Proposal Data (`proposal-data.json`):**
   Structure all terms into `poc/<project>/gate-8-proposal-pdf/proposal-data.json`:
   ```json
   {
     "project": "<project-name>",
     "preparedFor": "<client-name>",
     "preparedBy": "NextWebWorks",
     "date": "YYYY-MM-DD",
     "validUntil": "YYYY-MM-DD",
     "commercials": {
       "currency": "USD",
       "totalPrice": 0,
       "paymentSchedule": []
     },
     "scope": [],
     "deliverables": [],
     "exclusions": [],
     "timeline": []
   }
   ```
   Present the structured data table to the user in chat and obtain explicit confirmation before proceeding to PDF compilation.
3. **Step B — Render Proposal PDF (`proposal.pdf`):**
   - Check if the repository or workspace provides an active PDF generation skill.
   - If not found, ask the user for the local path to their existing JSON-to-PDF generator project (e.g. Typst, Puppeteer, WeasyPrint, or React-PDF generator).
   - If the user provides a generator path, execute its CLI command passing `proposal-data.json` as input and outputting `poc/<project>/gate-8-proposal-pdf/proposal.pdf`.
   - If neither a workspace skill nor a user generator path is available, report the missing dependency clearly to the user in chat and stop until a generator tool is provided.
4. **Record Proposal Artifact:**
   Verify `poc/<project>/gate-8-proposal-pdf/proposal.pdf` was generated on disk and is non-empty.
   Update `urls.proposal` in `state.json` (pointing to the local PDF file or uploaded asset URL):
   `node <path>/poc-state.mjs set-field urls.proposal "poc/<project>/gate-8-proposal-pdf/proposal.pdf"`
5. **Compile Evidence & Final Pause:**
   Draft `poc/<project>/gate-8-proposal-pdf/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 8 awaiting_approval`.
   Instruct the user to inspect the generated PDF document, then stop and await final sign-off.
6. **Final Approval:**
   Upon receiving `APPROVE GATE 8`, execute `node <path>/poc-state.mjs approve 8 "APPROVE GATE 8"`. The full 8-gate PoC-to-Proposal pipeline is officially complete!

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-8-proposal-pdf/`:
- `proposal-data.json`: Validated machine-readable commercial data structure with zero hallucinated figures.
- `proposal.pdf`: Rendered professional executive proposal document ready for client presentation.
- `evidence.md`: Summary of commercial terms confirmation, PDF rendering logs, file size, and completion statement.

---

## 5. Evidence to Present
Present `poc/<project>/gate-8-proposal-pdf/evidence.md` containing:
- Commercial terms confirmation table (Price, Currency, Payment Terms, Validity).
- Itemized deliverables count and timeline summary.
- PDF generation engine used and compilation status.
- Local path and file size of `proposal.pdf`.
- Final state confirmation (`Gate 8 awaiting_approval`).
- Context Compaction Tip: Present `> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and finalize the PoC archive.`

---

## 6. Manual Checklist for Me
- [ ] Review all numbers in `proposal-data.json` (price, currency, payment breakdown, validity date).
- [ ] Confirm deliverables list accurately reflects full production implementation.
- [ ] Open `proposal.pdf` and check visual formatting, pagination, header/footer branding, and legibility.
- [ ] Confirm no placeholder text (e.g. `Lorem Ipsum`, `TODO`, `TBD`) remains in the document.

---

## 7. Reject Handling
1. If commercial figures need updating or PDF formatting requires correction, user provides feedback.
2. Run `node <path>/poc-state.mjs reject 8 "<proposal defect>"`.
3. Agent updates `proposal-data.json` in place and re-runs the PDF generator.
4. Re-verify `proposal.pdf`, update `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- `proposal-data.json` is confirmed and verified.
- `proposal.pdf` exists on disk, renders without layout errors, and is approved by user.
- The user explicitly types `APPROVE GATE 8` in chat.
- `node <path>/poc-state.mjs approve 8 "APPROVE GATE 8"` executes successfully, marking the pipeline 100% complete.
- Remind the user to trigger `/compact` to summarize completed milestones and preserve context window headroom.
