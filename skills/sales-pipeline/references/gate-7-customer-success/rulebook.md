# Gate 7: Customer Success Rulebook

## 1. Goal
Onboard the newly converted client seamlessly into Next Web Works delivery operations, establish a 30/60/90-day health monitoring cadence, capture authoritative client testimonials and peer referrals at the first quantifiable milestone, and secure recurring agency revenue through a structured maintenance retainer and architecture handover.

---

## 2. Entry Criteria
1. Gate 6 (Paid Conversion) is approved with verbatim text `"APPROVED"`.
2. `pipeline/<prospect>/state.json` reflects `currentGate: 7` with status `"in_progress"`.
3. Commercial agreement executed and initial deposit/invoice verified.

---

## 3. Steps
1. **Author Client Onboarding Plan:**
   Author `pipeline/<prospect>/gate-7/onboarding-plan.md`:
   - Technical repository provisioning, environment secret configuration, and CI/CD pipelines.
   - Dedicated communication channel setup (Slack Connect, Teams, or private Discord).
   - Core stakeholder kickoff call agenda and developer access checklists.
   - CMS tenant provisioning and content authoring walkthroughs.
2. **Establish 30/60/90-Day Health Check Schedule:**
   - Where installed, consult `customer-health` or `renewal-radar` skills to track client vitals.
   - Author `pipeline/<prospect>/gate-7/health-check-schedule.md`:
     - *Day 30 (Launch & Vitals Review):* Post-deployment performance audit, Core Web Vitals verification, bug triage review.
     - *Day 60 (Operational Cadence):* Feature velocity check, CMS adoption review, team feedback survey.
     - *Day 90 (Executive Business Review):* ROI measurement against Gate 3 baseline metric, renewal confirmation, and scope expansion roadmap.
   - **Scheduling Rule:** The agent suggests `/schedule` recurring timers for health check milestones, but executes `/schedule` **ONLY IF** the user gives explicit written approval.
3. **Capture Testimonials & Referral Strategy:**
   Author `pipeline/<prospect>/gate-7/success-milestones.md`:
   - Enforce the **First Milestone Trigger**: Testimonial and referral asks must NEVER be made prematurely during contract signing. They are scheduled strictly when the client hits their first quantifiable success milestone (e.g. first live production deploy, Core Web Vitals score green across all pages, first 1,000 inbound leads processed).
   - Draft a friction-free 2-question testimonial template and an executive peer introduction script for human review.
4. **Author Maintenance Retainer Offer & Written Handover:**
   - Author `pipeline/<prospect>/gate-7/retainer-offer.md`: Ongoing agency retainer tiers (e.g. Next.js major version upgrades, monthly Core Web Vitals maintenance, security patching, 10–20 hours/month of dedicated frontend sprint capacity).
   - Author `pipeline/<prospect>/gate-7/handover-doc.md`: Architectural documentation, hosting credentials guide, DNS registry map, and operational runbooks ensuring total technical transparency.
5. **Account Expansion Whitespace Mapping:**
   - Where installed, consult `expansion-whitespace` to identify additional agency service opportunities (e.g. secondary brand websites, internal dashboard tools, SEO content pipelines).
6. **Zero-Send Invariant for Customer Communications:**
   All client emails, health check invites, and check-in agendas are drafted in markdown files. Every outbound customer communication requires explicit human review and execution.
7. **Pipeline Completion & Conversion Transition:**
   Upon receiving `APPROVED` for Gate 7:
   - Log approval into `state.json`.
   - Set Gate 7 `status: "approved"`.
   - Set top-level `status: "converted"`.
   - The prospect has officially graduated through the full sales pipeline!

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-7/`:
- `onboarding-plan.md`: Detailed client kickoff plan, repository access checklists, and communication cadences.
- `health-check-schedule.md`: 30/60/90-day milestone calendar, health audit rubrics, and renewal tracking.
- `success-milestones.md`: Milestone definition, post-success testimonial template, and peer referral strategy.
- `retainer-offer.md`: Ongoing technical maintenance retainer tiers, SLAs, and scope definitions.
- `handover-doc.md`: Comprehensive technical handover documentation, architecture diagrams, and credential runbooks.

---

## 5. Approval Question
> "Do you approve the Gate 7 Client Onboarding Plan, 30/60/90-Day Health Schedule, and Retainer Handover for `<prospect>`? (Reply with exact text **`APPROVED`** to complete Gate 7 and mark this account as fully **CONVERTED**, or provide feedback to revise in place)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and finalize the account transition into your active client roster.

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- Client experiences critical leadership turnover during onboarding and abruptly cancels contract.
- Client defaults on payment terms and refuses remediation.
- Client declines the technical handover and maintenance retainer, opting for total disengagement.
