# Gate 2: Outreach Rulebook

## 1. Goal
Prepare an authentic, highly targeted 3-touch cold outreach sequence for the approved prospect. Verify technical sender domain health (SPF, DKIM, DMARC), enforce strict contact suppression/opt-out hygiene, flag regulatory considerations for human review, and deliver drafts for human execution without sending any outbound communications.

---

## 2. Entry Criteria
1. Gate 1 (Prospecting) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 2` with status `"in_progress"`.
3. Verified "why now" trigger and decision-maker contact title from Gate 1.

---

## 3. Steps
1. **Sender Domain Hygiene & Technical Verification:**
   Audit outbound sender domain infrastructure before drafting copy:
   - Check SPF record validity (`v=spf1 ...`).
   - Check DKIM alignment and signature presence.
   - Check DMARC policy deployment (`p=none`, `quarantine`, or `reject`).
   - Check list hygiene (scrubbing dead inboxes, syntax typos, role addresses like `info@` or `admin@`).
   - Maintain a centralized suppression and opt-out registry in `pipeline/<prospect>/gate-2/suppression-list.md`. Cross-reference the prospect against existing unsubscribes or customer lists.
   - Record findings in `pipeline/<prospect>/gate-2/domain-hygiene-check.md`.
2. **Author High-Relevance 3-Touch Outreach Sequence:**
   - Where installed, consult `draft-outreach`, `email-sequence`, or `brand-review` skills for cadence tailoring.
   - Draft a 3-touch sequence in `pipeline/<prospect>/gate-2/outreach-sequence.md`:
     - **Touch 1 (The Specific Observation):** $\sim 80$ words. State one concrete observation about their public web architecture, Core Web Vitals, or UX hurdle identified in Gate 1. Include one single low-friction ask (e.g. "Open to seeing a 2-minute Loom teardown?").
     - **Touch 2 (Value-Add / Proof Asset):** $\sim 80$ words, sent 3–4 business days later. Share a relevant micro-case study or technical benchmark directly resolving the observed friction.
     - **Touch 3 (Clean Breakaway):** $\sim 60$ words, sent 4–5 business days later. Professional check-out acknowledging competing priorities, leaving door open without guilt or pressure.
3. **Flag Regional Privacy & Compliance for Human Review:**
   Author `pipeline/<prospect>/gate-2/compliance-flags.md` flagging regulatory frameworks for the prospect's operating jurisdiction:
   - *India:* Digital Personal Data Protection Act (DPDP Act) consent and notice rules.
   - *United States:* CAN-SPAM requirements (valid physical postal address, clear opt-out mechanism).
   - *European Union / UK:* GDPR / ePrivacy Directive legitimate interest documentation and right-to-object handling.
   > [!IMPORTANT]
   > Flag regulatory considerations purely for human counsel and operational review. The agent does NOT assert formal legal conclusions.
4. **Deliverability & Performance Tracking Benchmarks:**
   - Define baseline KPIs: overall reply rate and positive-reply rate.
   - **Diagnostic Rule:** If the overall reply rate on a campaign falls below 2%, do NOT hastily rewrite copywriting. First diagnose deliverability (spam placement, domain reputation, blacklist presence) and targeting tightness (ICP qualification).
5. **Zero-Send Invariant (Drafts Only):**
   The agent authors markdown copy files only. The agent **NEVER** opens SMTP sockets, calls email APIs (Resend, SendGrid, Mailgun), or transmits messages. The human user reviews, approves, and sends all communications.
6. **Update State & Present:**
   - Register artifacts under `artifacts.gate2` in `state.json`.
   - Present the 3-touch drafts, hygiene check, and compliance notes to the user in chat.
   - Present the Approval Question and Context Compaction tip (`> [!TIP]\n> **Context Compaction:** You can run \`/compact\` to compact conversation history and maintain context window headroom for Gate 3.`) and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-2/`:
- `domain-hygiene-check.md`: Verification audit of SPF, DKIM, DMARC, and list hygiene.
- `outreach-sequence.md`: 3-touch cold email sequence (~80 words each) with subject line variants and timing schedules.
- `compliance-flags.md`: Regional compliance check (DPDP, CAN-SPAM, GDPR) for human operational review.
- `suppression-list.md`: Registry of suppressed domains and opted-out contacts.

---

## 5. Approval Question
> "Do you approve the Gate 2 Domain Hygiene verification and 3-touch Outreach Sequence for `<prospect>`? (Reply with exact text **`APPROVED`** to confirm drafts for human sending and unlock Gate 3, or provide feedback to revise copy in place)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 3.

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- Contact responds with an explicit opt-out or unsubscribe request (immediately add to `suppression-list.md`).
- Email address generates a permanent hard bounce (550 user not found).
- All 3 touches conclude with zero response after 14 business days (move to cold archive / nurture).
- Sender domain health fails critical security audits and cannot be safely remediated.
