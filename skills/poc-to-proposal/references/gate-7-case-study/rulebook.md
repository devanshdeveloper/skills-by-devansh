# Gate 7: Case Study Rulebook

## 1. Purpose
Publish a deep-dive, enterprise-grade case study for the PoC in `nextwebworks-website` utilizing the NWW CMS portfolio/case-study architecture. Enforce strict content authenticity, structured section requirements, Tailwind styling, and reusable SEO metadata integration, deploying a preview branch for human review before merging to `main`.

---

## 2. Entry Conditions
1. Gate 6 is approved; walkthrough video URL is verified and hosted.
2. `poc/<project>/state.json` reflects `currentGate: 7` with status `in_progress`.
3. `nextwebworks-website` repository path is verified in `state.json`.

---

## 3. Steps
1. **Audit Existing Case Study Patterns:**
   In `nextwebworks-website/site`:
   - Read the existing portfolio and case study models (`skills/create-nww-website/references/cms/portfolio.md` and `case-study.md`).
   - Read at least one published case study (`site/app/case-studies/[slug]/page.js` or `site/app/portfolio/[slug]/page.js`) to mirror layout patterns, typography scale, and layout composition.
2. **Strict Architectural & Content Rules:**
   - **Minimum 5 Substantive Sections:** The case study must contain at least 5 rich semantic body sections (e.g. Executive Summary & Challenge, Solution Architecture, Key Capabilities & Bento Showcase, Verified Results & Impact Metrics, Tech Stack & Deliverables Breakdown), excluding standard header/footer bookends.
   - **Zero Repeated Content Invariant:** Only section types may repeat across pages. No exact section, card layout, or duplicate copywriting from other pages or PoCs may be reused. All copy must be 100% bespoke to this PoC.
   - **Tailwind CSS Only:** No custom raw CSS files or unstyled elements.
   - **Authentic Metrics Rule:** Use ONLY real performance, latency, or business metrics explicitly supplied by the user. **NEVER INVENT OR HALLUCINATE RESULTS, PERCENTAGES, OR ROI CLAIMS.**
   - **Permissions & Sources:** Record explicit client/stakeholder publication permission and cite data sources.
   - **SEO Component Integration:** Integrate existing site SEO components (`SEOHelper.generateMetadata`, JSON-LD schema, OpenGraph tags) with target keywords, summary description, and canonical URL.
3. **Draft & Pre-Approve Content:**
   Draft `poc/<project>/gate-7-case-study/case-study-content.md` detailing the 5+ sections, copy, metrics, and media links.
   Present to the user for explicit approval BEFORE writing Next.js code.
4. **Implement Case Study in `nextwebworks-website`:**
   - Check out branch: `git checkout -b poc/<project>-case-study`
   - Implement the page component under `site/app/case-studies/<project>/page.js` (or CMS seeder entry if CMS mode is enabled).
   - Embed the Gate 6 video player and link back to the Gate 5 demo subdomain and Gate 4 landing page.
   - Add changelog entry in `CHANGELOG.md` and bump patch version.
5. **Vercel Preview Deployment (No Merge to Main):**
   Commit changes to branch `poc/<project>-case-study` and push to origin to trigger a Vercel preview deployment.
   > [!IMPORTANT]
   > Do NOT merge to `main`. Merging to `main` without Gate 7 approval is strictly prohibited.
6. **Record Page Metadata:**
   Write `poc/<project>/gate-7-case-study/page-record.md`.
   Update `urls.caseStudy` in `state.json`:
   `node <path>/poc-state.mjs set-field urls.caseStudy "<vercel-preview-url>"`
7. **Compile Evidence & Pause:**
   Draft `poc/<project>/gate-7-case-study/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 7 awaiting_approval`. Present evidence and pause for approval.
8. **Merge on Approval:**
   Upon receiving `APPROVE GATE 7`, merge `poc/<project>-case-study` to `main` in `nextwebworks-website` and advance state.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-7-case-study/`:
- `case-study-content.md`: Approved narrative copy covering 5+ substantive sections, verified metrics, client authorization, and media asset paths.
- `page-record.md`: Implementation record including file paths, component structure, SEO tags, git commit SHA, and Vercel preview URL.
- `evidence.md`: Summary of content compliance, section audit (>= 5 sections), zero duplicate content verification, and preview link.

---

## 5. Evidence to Present
Present `poc/<project>/gate-7-case-study/evidence.md` containing:
- Section count audit confirming $\ge 5$ substantive semantic sections.
- Verification that all metrics were provided by the user with zero invented figures.
- Reusable SEO metadata verification (`title`, `description`, `canonical`, JSON-LD schema).
- Git commit hash on branch `poc/<project>-case-study`.
- Vercel preview URL (`urls.caseStudy`).
- Active state confirmation (`Gate 7 awaiting_approval`).

---

## 6. Manual Checklist for Me
- [ ] Review `case-study-content.md` before code authoring.
- [ ] Confirm all numbers, benchmarks, and ROI claims reflect authentic PoC results.
- [ ] Open the Vercel preview URL and inspect visual aesthetics and typography.
- [ ] Verify embedded walkthrough video plays cleanly.
- [ ] Confirm links to the demo subdomain and landing page are functional.

---

## 7. Reject Handling
1. If content tone requires adjustment, metrics need correction, or preview layout breaks, user provides feedback.
2. Run `node <path>/poc-state.mjs reject 7 "<case study defect>"`.
3. Agent revises content or page code directly on branch `poc/<project>-case-study`.
4. Push updates to refresh Vercel preview.
5. Update `page-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- Case study content pre-approved and verified with $\ge 5$ substantive sections.
- Vercel preview verified by user.
- The user explicitly types `APPROVE GATE 7` in chat.
- Branch `poc/<project>-case-study` is merged to `main` in `nextwebworks-website`.
- `node <path>/poc-state.mjs approve 7 "APPROVE GATE 7"` executes successfully, advancing `currentGate` to 8.
