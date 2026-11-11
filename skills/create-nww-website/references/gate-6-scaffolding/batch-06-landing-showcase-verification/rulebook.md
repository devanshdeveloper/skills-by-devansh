# Batch 06: Landing Page Showcase Construction & Gate 6 Sign-Off

**Batch Code:** `batch-06-landing-showcase-verification`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 06 fully constructs the **Landing Page (Home route: `site/app/page.js` + `_components/`) as the flagship interactive showcase**, executes automated consistency and production build audits, presents the live preview for client review, and obtains formal Gate 6 sign-off.

> **Sole Showcase Page Rule:** In Gate 6, the Homepage is the **only page constructed and styled**. It serves as the live interactive proof of the foundation shell, proving design tokens, typography, motion tiers, responsive media, and navigation that scope globally to all pages. Sub-pages are strictly prohibited from being built in Gate 6 and must be deferred to Stage 7.

---

## 2. Preconditions & Input Sources

1. **Batches 01–05 Complete:** Next.js application, foundation shell, assets, CMS kit, and route stubs fully scaffolded.
2. **Approved Design Theory & Tokens:** From Gate 2 (`design-theory.md` and motion tier).
3. **Approved Page List (Home Blueprint):** Section order and anchors from `page-list.md`.
4. **Verbatim Home Content:** From `client-context/` content specifications.

---

## 3. Execution Protocol

### Step 1: Fully Construct Landing Page Showcase
1. **Thin Home Page Server Component (`site/app/page.js`):**
   - Maximum **80 lines**.
   - Must orchestrate **at least 5 distinct substantive sections OTHER THAN Hero, CTA banner, FAQ, Contact Us form, and Footer** (e.g. Value/Features, Social Proof/Case Studies, Capabilities/Bento Grid, How It Works, Stats/Metrics) with zero duplicated sections or repeating content.
   - If an FAQ section is included on Home, it must enforce **High FAQ Density** with a **minimum of 10 to 15 substantive, multi-sentence FAQs**.
   - Exports complete SEO `metadata` (title, description, canonical, openGraph).
   - Injects WebSite & Organization structured data via `<Schema />`.
   - Renders Home section components in blueprint order.
2. **Polished Section Components (`site/app/_components/<SectionName>.js`):**
   - Maximum **250 lines per file**.
   - Opens with `// section: <id>` and attaches `data-section="<id>"`.
   - **Tailwind-Only Styling:** Uses pure Tailwind utility classes directly in JSX; zero custom CSS classes or `@apply`.
   - Wired to authentic copy from `site/content/home.js`.
   - Renders optimized media via `ResponsiveImage.js`.
3. **Motion & Taste Implementation:**
   - Adheres strictly to confirmed motion tier per [../batch-02-foundation-shell/gsap-animation-tiers.md](../batch-02-foundation-shell/gsap-animation-tiers.md).
   - If motion is enabled: wrap in `useGSAP` with container scopes, honor `prefers-reduced-motion` via `gsap.matchMedia()`, and limit to at most **ONE bold moment** on the entire page.

### Step 2: Automated Consistency Audit
Run companion consistency auditor:

```bash
node skills/create-nww-website/scripts/client-review/verify-nextjs.mjs .
```

Asserts that:
1. `site/site.manifest.json` exists and matches directory structure.
2. Every page in `page-list.md` has an active App Router route.
3. Every section ID has a matching component with `data-section="<id>"`.
4. Pre-launch guard is active.

Run structural verification scripts:
```bash
pnpm --dir site check:all
```

### Step 3: Production Build Verification
Execute production compile from within `site/`:

```bash
pnpm --dir site build
```

> **Zero Tolerance:** The build must succeed with zero compilation errors, zero ESLint failures, and zero unresolved import paths.

### Step 4: Gate 6 Review Presentation & Sign-Off
1. Launch local dev server or deploy to public review deployment (e.g. GitHub Pages preview via workflow):
   ```bash
   pnpm --dir site dev
   ```
2. Present the live interactive Landing Page showcase along with clean build diagnostics to the human client/user.
3. Halt execution and explicitly prompt:
   > *"Stage 6 Scaffolding and Landing Page Showcase is complete. All 6 batches have been executed, `pnpm build` passed cleanly, and the Landing Page is live for showcase review. Please review the live showcase. Reply with 'approved' to proceed to Stage 7 (Sub-Page Build Loop)."*
4. Upon explicit approval, update `project-docs/router-state.md` (`Gate 6: Scaffolding, Foundation & Landing Page Approved`).

---

## 4. Deliverables Checklist

- [ ] Landing Page (`site/app/page.js` + `_components/`) fully constructed, styled, and animated with at least 5 substantive sections other than Hero/CTA/FAQ/Contact/Footer, distinct sections, and high FAQ density (min 10–15 substantive FAQs if FAQs present).
- [ ] Section components compliant with line limits (<= 250 lines) and `data-section="<id>"`.
- [ ] Verbatim home copy wired from `site/content/home.js`.
- [ ] Automated consistency check `verify-nextjs.mjs` passes.
- [ ] `pnpm check:all` passes.
- [ ] Production build (`pnpm build`) succeeds with zero errors.
- [ ] Live Landing Page showcase presented to client.
- [ ] **Gate 6 Sign-Off:** Recorded in `project-docs/router-state.md`.

---

## 5. Downstream Handover

Upon Gate 6 sign-off, advance to **Stage 7: Sub-Page Build Loop** ([../../gate-7-sub-pages/runbook.md](../../gate-7-sub-pages/runbook.md)) to incrementally construct and verify remaining sub-pages (`about`, `services`, `contact`, etc.) strictly one-by-one.

