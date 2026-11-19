# Gate 1: Prospecting Rulebook

## 1. Goal
Identify, research, and qualify high-probability agency prospect accounts aligned with Next Web Works service offerings (custom web applications, Next.js rebuilds, paid pilot sprints, and technical retainers). Establish clear Ideal Customer Profile (ICP) criteria and produce a scored shortlist anchored on verifiable "why now" timing triggers.

---

## 2. Entry Criteria
1. The user initializes the sales pipeline for a target agency campaign or individual prospect.
2. `pipeline/<prospect>/state.json` exists with `currentGate: 1` and status `"in_progress"`.
3. Target agency service focus is defined (`web-project`, `paid-pilot`, or `retainer`).

---

## 3. Steps
1. **Define Ideal Customer Profile (ICP):**
   Formulate ICP dimensions in `pipeline/<prospect>/gate-1/icp-definition.md`:
   - **Target Tech Stack:** Legacy architectures ripe for modernization (e.g. monolithic WordPress, slow Shopify themes, outdated CRA/Webpack setups, Drupal) or modern teams needing high-performance Next.js App Router engineering.
   - **Company Scale:** 10–250 employees or venture-backed growth stage with active engineering/product budgets.
   - **Primary Pain Archetype:** Sub-par Core Web Vitals (LCP > 3.5s, high CLS), poor mobile conversion, sluggish dashboard interactions, or lack of internal senior frontend bandwidth.
   - **Budget Signal:** Active fundraising (Seed/Series A/B), engineering job requisitions (e.g. searching for Senior Frontend Engineer), or premium SaaS tiering.
2. **Account Research & Signal Discovery:**
   - Where installed, utilize `account-research` or `lead-triage` skills to enrich firmographics.
   - Conduct public technical reconnaissance (inspecting HTTP headers, frontend bundles, PageSpeed Insights scores, job boards, and recent company announcements).
   - Document raw findings and source links in `pipeline/<prospect>/gate-1/prospect-research.md`.
   - **Strict Anti-Fabrication Rule:** Every claim or metric must link to an accessible public URL or tool report (e.g., Google PageSpeed Insights, public careers page, tech stack crawler). If an attribute is estimated, label it explicitly as `[UNVERIFIED]`.
3. **Score & Compile Shortlist:**
   - Author `pipeline/<prospect>/gate-1/prospect-shortlist.md`.
   - Prefer **behavioral signals over generic firmographics**: every shortlisted prospect MUST feature at least one verifiable "why now" trigger:
     - *Rebranding / Redesign Trigger:* Brand updated its logo or announced marketing shift, but website remains on legacy foundation.
     - *Hiring Bottleneck Trigger:* Open frontend/full-stack engineering roles unfilled for 60+ days.
     - *Performance Degradation Trigger:* Mobile Lighthouse performance score $< 45$, poor mobile ergonomics, or broken responsiveness.
     - *Product Expansion Trigger:* Launching a new enterprise tier or client portal requiring bespoke web app capabilities.
4. **Zero-Contact Invariant:**
   Do NOT reach out, connect on LinkedIn, email, or contact the prospect during Gate 1. All work at this stage is non-invasive research and evaluation.
5. **Update State & Present:**
   - Update `state.json` registering created artifact paths under `artifacts.gate1`.
   - Present the scored shortlist and "why now" triggers to the user in chat.
   - Present the Approval Question and stop.

---

## 4. Output Files
All deliverables are written strictly to `pipeline/<prospect>/gate-1/`:
- `icp-definition.md`: Explicit stack, size, pain points, and budget qualification filters.
- `prospect-research.md`: Detailed technical findings, performance metrics, and cited source links.
- `prospect-shortlist.md`: Scored prospect table ranking accounts by signal strength, key decision-maker titles, and primary "why now" triggers.

---

## 5. Approval Question
> "Do you approve the Gate 1 Prospect Shortlist and ICP qualification for `<prospect>` to proceed to Outreach? (Reply with exact text **`APPROVED`** to advance to Gate 2, or provide feedback to revise the shortlist in place)."

---

## 6. Kill / Stop Criterion
Move prospect to `status: "stopped"` and record `stopReason` if:
- Thorough research reveals zero verifiable "why now" triggers or pain signals.
- In-house frontend engineering team was recently hired to build the project internally.
- Severe negative budget signal (e.g. public layoffs, operational downsizing, bankruptcy).
- The human user disqualifies the account during review.
