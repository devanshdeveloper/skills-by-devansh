# Stage 9: Final Verification & Handover Runbook

## Table of Contents
- [Overview & Role in Pipeline](#overview--role-in-pipeline)
- [Step 1: Automated Structure & Deliverables Compliance Audit](#step-1-automated-structure--deliverables-compliance-audit)
- [Step 2: Production Build & Asset Verification](#step-2-production-build--asset-verification)
- [Step 3: Technical SEO & Performance Audit](#step-3-technical-seo--performance-audit)
- [Step 4: Security, CMS & Secret Hygiene Audit](#step-4-security-cms--secret-hygiene-audit)
- [Step 5: Gate 9a Approval (Cross-Page Fixes)](#step-5-gate-9a-approval-cross-page-fixes)
- [Step 6: Pre-Launch Guard Deactivation](#step-6-pre-launch-guard-deactivation)
- [Step 7: Live Vercel Deployment & Handover (Gate 9b)](#step-7-live-vercel-deployment--handover-gate-9b)
- [Gate 9 Checklist](#gate-9-checklist)

## Overview & Role in Pipeline

Stage 9 is the final stage of the website creation lifecycle. In this stage, the agent performs comprehensive automated compliance audits, verifies the production build, runs SEO and performance checks, conducts security and secret hygiene audits, presents audit findings for Gate 9a approval, deactivates the pre-launch preview guard, deploys the site live to Vercel, dispatches the client completion email, and delivers the handover package for Gate 9b sign-off.

```mermaid
graph TD
    A[Stage 8 Additional Features Approved] --> B[Structure & Deliverables Audit]
    B --> C[Production Build & Performance/SEO Checks]
    C --> D[Security & Secret Hygiene Audit]
    D --> E[Gate 9a: Cross-Page Audit Fixes Approval]
    E --> F[Apply Fixes & Deactivate Pre-Launch Guard]
    F --> G[Deploy to Vercel: deploy-to-vercel]
    G --> H[Milestone Notification: client-notify]
    H --> I[Gate 9b: Final Client Handover Sign-Off]
```

---

## Step 1: Automated Structure & Deliverables Compliance Audit

Run the repository structure auditor utility to verify all deliverables, file naming rules, and strict line count constraints across `site/` and `project-docs/`:

```bash
node skills/create-nww-website/scripts/structure-audit/index.js --strict
```

The script verifies:
1. All routes from `project-docs/client-review/gate-3-page-list/page-list.md` exist and are marked completed (`- [x]`).
2. Thin page server components (`page.js`) do not exceed **80 lines**.
3. Section components do not exceed **250 lines** and have `// section: <id>` and `data-section="<id>"` markers.
4. No unstated markdown files were generated (zero `theory-revisions.md`, `page-design-notes.md`, `migration-inventory.md`).
5. Zero duplicate content or exact sections across routes (only section types repeat; all body copy and cards are unique).
6. Minimum 5 substantive sections verified on every page (excluding Hero, CTA banner, FAQ, Contact Us form, and Footer).
7. High FAQ Density verified across all FAQ sections (minimum 10–15 substantive, unique FAQs with zero cross-page duplication).
8. Generates the compliance audit report at `project-docs/client-review/gate-9-final-verification/structure-audit.md`.

---

## Step 2: Production Build & Asset Verification

Execute the production build within `site/` to guarantee zero compilation, route, or hydration errors:

```bash
cd site
pnpm build
pnpm check:all
```

Verify:
- Clean build with zero warnings or hydration errors.
- Image byte budgets: LCP candidate <= 100 KB, other images <= 60 KB, SVG <= 5 KB.
- Local fonts render cleanly without external network calls.

---

## Step 3: Technical SEO & Performance Audit

Test the production build using companion SEO utilities:

```bash
# 1. Sitemap and Robots Parser Check
node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --url http://localhost:3000

# 2. Performance & Core Web Vitals (CWV) Check
node skills/create-nww-website/scripts/seo/pagespeed-check.js --url http://localhost:3000
```

Verify:
- `robots.txt` syntax is valid and permits search crawlers once launched.
- `sitemap.xml` contains all public static and dynamic CMS routes with valid timestamps.
- Exactly one `<h1>` per page.
- Structured data JSON-LD validates against schema definitions.

---

## Step 4: Security, CMS & Secret Hygiene Audit

Conduct final security checks:
1. **Zero Secret Leaks:** Verify that `CMS_TOKEN`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`, `PEXELS_API_KEY`, and `UNSPLASH_ACCESS_KEY` do not appear anywhere in client bundles, HTML outputs, or public git-tracked files.
2. **CMS Webhook Verification (if `cms: cms`):** Test `POST /api/revalidate` with bearer token to ensure instant tag purging within 5 seconds.
3. **Stock Provenance & Credits:** Verify that `project-docs/stock-provenance.json` is complete, `/credits` page renders, and Unsplash images include proper photographer attribution.

---

## Step 5: Gate 9a Approval (Cross-Page Fixes)

If the audits in Steps 1–4 reveal any issues:
1. Document the proposed fixes in `project-docs/client-review/gate-9-final-verification/structure-audit.md`.
2. Present the audit findings to the user and request approval before applying modifications to approved pages.
3. Halt execution until Gate 9a sign-off is granted.
4. Apply the approved fixes and re-run `pnpm check:all`.

---

## Step 6: Pre-Launch Guard Deactivation

Once audit fixes are approved and verified:
1. Open `site/.env.local` (and production deployment environment).
2. Set:
   ```env
   NEXT_PUBLIC_PREVIEW_GUARD="false"
   ```
3. Verify that the `<PreviewBanner />` disappears and search engine robots directives update to `index, follow`.

---

## Step 7: Live Vercel Deployment & Handover (Gate 9b)

1. **Deploy to Vercel:** Deploy the production Next.js website using the official Vercel deployment agent skill:
   ```bash
   DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill deploy-to-vercel
   ```
2. **Client Milestone Email:** Send the client completion notification containing the live production URL:
   ```bash
   node skills/create-nww-website/scripts/client-notify/index.js
   ```
3. **Deliver Client Handover Package:**
   - Deliver project maintenance notes in `site/AGENTS.md`.
   - Provide NWW CMS admin instructions (if CMS active).
   - Confirm backup of original assets in `assets-source/`.
4. Update `project-docs/router-state.md` to `Gate 9b: Final Project Handover Complete`.

---

## Gate 9 Checklist

Before declaring project completion:
- [ ] Structure and deliverable audit passed (`structure-audit.md` generated).
- [ ] Minimum 5 substantive sections verified per page (excluding Hero, CTA, FAQ, Contact Us form, and Footer).
- [ ] Cross-page content uniqueness verified (zero duplicate copy/sections; only section types repeat).
- [ ] High FAQ Density verified across all FAQ sections (minimum 10–15 substantive, unique FAQs).
- [ ] **Gate 9a Halt:** Present cross-page QA fix summary; await approval.
- [ ] `pnpm build` compiles cleanly with zero errors.
- [ ] Zero API keys or secrets leaked in code or client bundles.
- [ ] Pre-launch guard deactivated (`NEXT_PUBLIC_PREVIEW_GUARD="false"`).
- [ ] Next.js application deployed live to Vercel via `deploy-to-vercel`.
- [ ] Milestone notification email dispatched via `client-notify`.
- [ ] **Gate 9b Halt:** Run production structure audit; await final client handover sign-off.
- [ ] Final handover sign-off confirmed by human approver (Gate 9b).
