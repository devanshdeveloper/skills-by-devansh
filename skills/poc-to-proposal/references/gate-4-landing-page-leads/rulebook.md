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
2. **Audit Existing NextWebWorks Codebase & Pattern Extraction:**
   Inside `nextwebworks-website/site`:
   - Inspect existing flagship pages (`app/page.js`, `app/work/page.js`) and reusable components (`app/_components/FAQSection.js`, `app/_components/FinalCTABanner.js`, `app/_components/ContactFormSection.js`, `components/motion/*`).
   - Extract exact layout grids, responsive paddings (`py-16 md:py-24`), container widths (`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`), dual-theme background classes (`bg-white dark:bg-[#0B0F19]`), borders (`border-slate-200 dark:border-[#1E293B]/60`), and button tokens (`#2563EB`).
   - Inspect existing lead and contact-us flows (`app/actions/lead.js`, `app/contact/page.js`).
   - Hard Rule: Tailwind CSS only. Do not add raw CSS files, isolated dark-mode lockouts, or inline styling hacks.
3. **Branch Creation in `nextwebworks-website`:**
   Check out a dedicated feature branch:
   `git checkout -b poc/<project>-landing`
4. **Author Landing Page Specification (Client-Facing Value First):**
   Write `poc/<project>/gate-4-landing-page-leads/landing-page-spec.md` defining the page layout, value proposition, and component structure.
   - **Executive Outcome Framing:** The page must be written for client decision-makers (directors, VPs, agency owners). It must pitch business value, speed, reduced friction, and ROI.
   - **Strictly No "Spec Sheet" Copy in Heroes:** Never treat internal technical implementation details (e.g. "streams token deltas", "AST parsing", "50-row bounds") as headline benefits.
   - **Technical Credentials Placement:** Security guardrails, AST validation, and query protocols must be placed in dedicated "Security & Governance" or "How It Works" sections to build institutional trust.
5. **Implement Landing Page Component & Reuse Established Patterns:**
   In `nextwebworks-website/site/app/poc/<project>/page.js`:
   - Mirror `WorkHeroSection` two-column deliberate anatomy: `lg:col-span-7` left column (mono eyebrow, solid heading, client-facing value description, CTAs, proof pillar badges) and `lg:col-span-5` right column (realistic product UI mockup in its host environment).
   - Enforce dual-theme support matching the site chrome (`bg-white dark:bg-[#0B0F19]`). Never render forced pitch-black backgrounds (`bg-slate-950`).
   - Strictly prohibit neon text gradients (`bg-gradient-to-r text-transparent bg-clip-text`), numbered card cliches (`[1] [2] [3]`), generic buzzword titles ("Enterprise Architectural Pillars"), floating pulsing green dots, and blurred background radial glow orbs.
   - Reuse existing site components: `FAQSection` (with high-density substantive FAQs), `FinalCTABanner`, and motion wrappers (`MotionFadeIn`, `MotionTilt`).
   - Wire the inquiry/contact form to the existing leads Server Action (`submitLead`), matching `ContactFormSection` design tokens, passing:
     `source: "poc:<project>"`
   - **Demo CTA Guard:** The primary "Launch Demo" button must be implemented but rendered **DISABLED** (e.g. grayed out with a "Live Demo Launching Soon — Pending Gate 5 Verification" badge/tooltip) pending Gate 5 subdomain and SSL verification.
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

### Strict Anti-AI-Slop and Copywriting Invariants
1. **Never generate spec sheet copy for human buyers:** The hero and core value sections must speak to client pain points and commercial outcomes. Technical mechanics belong in dedicated architecture or security sections.
2. **Never break site theme consistency:** The page must seamlessly match the site header and footer. If the header is light, the page body must be light with full dark-mode support via `dark:` classes.
3. **No generic gradient text or floating orbs:** Text must use clean solid typography (`text-slate-900 dark:text-white` or brand accent). No cyan-purple-emerald neon text gradients.
4. **No numbered card grids with 1-sentence fluff:** Group capabilities by concrete functional domains with rich, authentic technical depth.
5. **Always render a concrete product UI mockup:** The hero right column must depict a realistic representation of the tool inside its host environment (e.g. Power BI visual inside a report canvas), not abstract vectors or stock graphics.

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
