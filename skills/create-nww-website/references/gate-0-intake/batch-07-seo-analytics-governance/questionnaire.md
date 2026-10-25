# Batch 07: Technical SEO, Domain, Analytics & Governance

**Batch Code:** `batch-07-seo-analytics-governance`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-07-seo-analytics-governance/answers.md`  

---

## 1. Input Sources & Ingestion Protocol

Before presenting this batch, inspect existing inputs:
1. **Repository Settings & Configs:** Check if package manager lockfiles (`pnpm-lock.yaml`, `package-lock.json`) or domain configs exist.
2. **Turn Pacing:** Present Questions Q27 through Q36 in plain language. Wait for client response before advancing.

---

## 2. Questions

### Q27 [Search Queries & Target Keywords]
- **Question:** What 5–10 searches, queries, or topics do you most want this website to rank for on Google?
- **Answer Type:** Comma-separated list of keywords
- **Required:** Yes
- **Default:** None (Derived from core offering and target audience)
- **Downstream Consumers:** Stage 4 `seo-strategy.md` keyword target matrix, metadata titles/descriptions

### Q28 [Geographic Market Focus]
- **Question:** What is your primary geographic market?
  - `local-regional`: Specific city, state, or physical service radius.
  - `national`: Entire country (e.g., nationwide USA).
  - `global-online`: Worldwide international audience.
- **Answer Type:** Choice / Free text
- **Required:** Yes
- **Default:** `global-online`
- **Downstream Consumers:** Stage 4 LocalBusiness vs WebSite schema, Stage 5 contact address

### Q29 [Top Competitors in Search]
- **Question:** Who are your top 2–3 competitors in organic search results? (Provide names or URLs).
- **Answer Type:** List of URLs / names
- **Required:** Optional
- **Default:** `None specified`
- **Downstream Consumers:** Stage 4 SEO competitive audit

### Q30 [Production Domain & Canonical URL]
- **Question:** What is the official production domain or primary URL for the site (e.g., `https://example.com`)?
- **Answer Type:** URL string
- **Required:** Yes
- **Default:** `https://example.com`
- **Downstream Consumers:** Stage 0 `site/.env.example` `NEXT_PUBLIC_SITE_URL`, Stage 4 `sitemap.xml`, OpenGraph canonical URLs

### Q31 [Analytics & Measurement ID]
- **Question:** Will you provide a Google Analytics 4 (GA4) Measurement ID under the environment variable name `NEXT_PUBLIC_GA_ID`? *(Never paste secret keys).*
- **Answer Type:** Choice
- **Allowed Options:** `ga4`, `none`, `other`
- **Required:** Yes
- **Default:** `ga4`
- **Downstream Consumers:** Stage 0 `.env.example`, Stage 6 `site/app/layout.jsx` Google Analytics script

### Q32 [Legal Entity Details]
- **Question:** What is your official registered legal entity name, jurisdiction/country, and contact email/address for Privacy Policy and Terms of Service pages?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** `[Business Name], Registered Entity, contact@example.com`
- **Downstream Consumers:** Stage 5 Legal page specs, Stage 6 legal footer

### Q33 [Primary Language & Regional Locales]
- **Question:** What is the primary language and locale for the site?
- **Answer Type:** Locale code
- **Required:** Yes
- **Default:** `en-US`
- **Downstream Consumers:** Stage 1 Tech Stack, Stage 4 HTML `<html lang="en">` tag, hreflang tags

### Q34a [Client Review Deployment Format & Vercel Project Linkage]
- **Question:** Confirm the public deployment pipeline for client review milestones:
  - **Gate 2 Visual Variations:** Published via public GitHub Pages deployment (HTML + Tailwind CSS + jQuery).
  - **Stage 6 / 7 / 8 Next.js Codebase:** Published via Vercel project deployment linked to the confirmed technical project slug from Batch 01 (`vercel link --project <project-slug>`).
  - *(Note: Localhost URLs are strictly forbidden for client forwarding; all client reviews require live public deployments).*
- **Answer Type:** Confirmation
- **Allowed Options:** `confirmed`
- **Required:** Yes
- **Default:** `confirmed`
- **Downstream Consumers:** Gate 2 review portal delivery, Gate 6 scaffolding deployment, Gate 8 final client review

### Q34b [Codebase Destination Folder]
- **Question:** Confirm the directory at the project root for the real Next.js application codebase.
- **Answer Type:** Directory path
- **Required:** Yes
- **Default:** `site/`
- **Downstream Consumers:** Stage 1 Tech Stack, Stage 6 Scaffolding, Stage 7 Sub-Page builds

### Q34c [Project Technical Defaults if Unset]
- **Question:** If no existing repository configs or lockfiles are found, confirm the default language and package manager.
- **Answer Type:** Choice
- **Allowed Options:** Language: `javascript` [default] or `typescript`; Package Manager: `pnpm` [default], `npm`, `yarn`, `bun`
- **Required:** Yes
- **Default:** `javascript` + `pnpm`
- **Downstream Consumers:** Stage 1 Tech Stack, Stage 6 Scaffolding

### Q35 [Sole Sign-Off Approver]
- **Question:** Who is the sole point of contact and final approver for pipeline gates?
- **Answer Type:** Name
- **Required:** Yes
- **Default:** `Devansh`
- **Downstream Consumers:** `project-docs/router-state.md` approval metadata

### Q36 [Out-of-Scope Confirmation]
- **Question:** Confirm out-of-scope boundaries (e.g., custom PHP/WordPress platforms, bespoke microservices backend, direct relational database admin).
- **Answer Type:** Confirmation
- **Required:** Yes
- **Default:** `confirmed`

---

## 3. Confirmation Stage 0.7

After receiving responses to Batch 07:

1. **Acknowledge and Echo:**
   Output the Technical Governance & SEO Recap:
   ```markdown
   ### Batch 07 Governance & SEO Confirmation
   - Primary Search Keywords: [Q27 List]
   - Market Focus: [Q28 Choice]
   - Production Domain: [Q30 URL]
   - Analytics Variable: NEXT_PUBLIC_GA_ID ([Q31 Choice])
   - Legal Entity: [Q32 Name & Address]
   - Review Deployment: GitHub Pages (Variations) & Vercel (`<project-slug>`)
   - Codebase Directory: [Q34b Path]
   - Framework & PM Defaults: [Q34c `javascript` + `pnpm`]
   - Final Approver: [Q35 Name]
   ```
2. **Explicit User Approval Prompt:**
   > *"All 7 questionnaire batches are now documented. Would you like to review the consolidated Gate 0 Master Brief and Asset Manifest to grant Gate 0 Sign-Off?"*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-07-seo-analytics-governance/answers.md`.
