# Gate 4: Landing Page and Leads Rulebook

## 1. Purpose
Build a high-conversion showcase landing page for the PoC inside `nextwebworks-website` and wire its inquiry form into the production inbound lead capture pipeline with explicit source attribution. Deploy a Vercel preview branch for human testing before merging.

---

## 2. Entry Conditions
1. Gate 3 is approved with the live hosted PoC URL confirmed.
2. `poc/<project>/state.json` reflects `currentGate: 4` with status `in_progress`.
3. Target external repository `nextwebworks-website` is available locally.

---

## 3. Steps
1. **Locate and Store NWW Website Repository:**
   If `state.json` does not contain `nwwWebsiteRepo`, prompt the user once in chat for the absolute local directory path to `nextwebworks-website`. Save the path:
   `node <path>/poc-state.mjs set-field nwwWebsiteRepo "/path/to/nextwebworks-website"`
2. **Audit Existing NextWebWorks Codebase:**
   Inside `nextwebworks-website/site`:
   - Inspect existing lead and contact-us flows (`app/actions/lead.js`, `app/contact/page.js`, or CMS lead models).
   - Inspect design tokens, typography, and section patterns.
   - Hard Rule: Tailwind CSS only. Do not add raw CSS files or inline styling hacks.
3. **Branch Creation in `nextwebworks-website`:**
   Check out a dedicated feature branch:
   `git checkout -b poc/<project>-landing`
4. **Author Landing Page Specification:**
   Write `poc/<project>/gate-4-landing-page-leads/landing-page-spec.md` defining the page layout, value proposition, and component structure.
5. **Implement Landing Page Component:**
   In `nextwebworks-website/site/app/poc/<project>/page.js`:
   - Construct the page following existing server component conventions.
   - Include standard chrome (`Nav`, `Footer`) and responsive hero/feature sections.
   - Wire the inquiry/contact form to the existing leads Server Action, passing a hidden field:
     `source: "poc:<project>"`
   - **Demo CTA Guard:** The primary "Launch Demo" button must be implemented but rendered **DISABLED** (e.g. grayed out with a "Live Demo Launching Soon" badge/tooltip) pending Gate 5 subdomain and SSL verification.
6. **Changelog & Version Bump in `nextwebworks-website`:**
   Add a single concise changelog entry in `nextwebworks-website/CHANGELOG.md` and bump the patch version.
7. **Commit & Push Preview Branch (No Merge to Main):**
   Commit changes to branch `poc/<project>-landing` and push to GitHub origin to trigger a Vercel preview deployment.
   > [!IMPORTANT]
   > Do NOT merge to `main`. Merging to `main` without Gate 4 approval is strictly prohibited.
8. **Record Preview URL & Lead Submission:**
   Retrieve the Vercel preview deployment URL and store it:
   `node <path>/poc-state.mjs set-field urls.landing "<vercel-preview-url>"`
   Write `poc/<project>/gate-4-landing-page-leads/lead-wiring-record.md`.
9. **Human Test Lead Verification:**
   Instruct the user to visit the preview URL, submit a real test lead through the form, and verify receipt in their lead management channel or CMS inbox.
10. **Compile Evidence & Pause:**
    Write `poc/<project>/gate-4-landing-page-leads/evidence.md`.
    Run `node <path>/poc-state.mjs set-status 4 awaiting_approval`. Present evidence and pause.
11. **Merge on Approval:**
    Upon receiving `APPROVE GATE 4`, merge `poc/<project>-landing` into `main` and advance state.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-4-landing-page-leads/`:
- `landing-page-spec.md`: Blueprint of the landing page sections, copy hierarchy, and form schema.
- `lead-wiring-record.md`: Changed files list, git commit SHA, Vercel preview URL, and lead schema mapping (`source=poc:<project>`).
- `evidence.md`: Summary of changes, preview URL, lead delivery confirmation, and merge instructions.

---

## 5. Evidence to Present
Present `poc/<project>/gate-4-landing-page-leads/evidence.md` containing:
- Path to `nextwebworks-website` and active branch (`poc/<project>-landing`).
- List of modified and created files in `site/`.
- Git commit hash on preview branch.
- Vercel preview URL (`urls.landing`).
- Confirmation that Demo CTA is in disabled state.
- Test lead submission confirmation (payload and inbox receipt).
- Active state confirmation (`Gate 4 awaiting_approval`).

---

## 6. Manual Checklist for Me
- [ ] Open the Vercel preview URL in a browser.
- [ ] Verify visual alignment with `nextwebworks.in` design and Tailwind standards.
- [ ] Confirm the "Launch Demo" button is disabled with an explanatory tooltip.
- [ ] Fill out the inquiry form and submit a real test lead.
- [ ] Check the CMS lead inbox or notification webhook to confirm receipt with `source=poc:<project>`.

---

## 7. Reject Handling
1. If styling is off, lead submission fails, or form fields are incorrect, user provides feedback.
2. Run `node <path>/poc-state.mjs reject 4 "<landing/lead defect>"`.
3. Agent applies fixes directly on branch `poc/<project>-landing` in `nextwebworks-website`.
4. Commit and push branch updates to refresh Vercel preview.
5. Update `lead-wiring-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- Real test lead submission verified with `source: "poc:<project>"`.
- Vercel preview verified by user.
- The user explicitly types `APPROVE GATE 4` in chat.
- Agent merges branch `poc/<project>-landing` into `main` in `nextwebworks-website`.
- `node <path>/poc-state.mjs approve 4 "APPROVE GATE 4"` executes successfully, advancing `currentGate` to 5.
