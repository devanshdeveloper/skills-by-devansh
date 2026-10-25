# Batch 03: Sitemap, Navigation & Verbatim Copywriting

**Batch Code:** `batch-03-sitemap-copy`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-03-sitemap-copy/answers.md`  

---

## 1. Input Sources & Ingestion Protocol

Before presenting this batch, inspect existing inputs:
1. **Existing Site Crawl / Sitemap:** If migration, inspect crawled routes from `previous-site/manifest.json`.
2. **Pasted Brief Notes:** Check if the user specified a list of pages or copy files in `client-context/`.
3. **Turn Pacing:** Present Questions Q16 through Q21 in plain language. Wait for client response before advancing.

---

## 2. Questions

### Q16 [Core Page Inventory & Initial Sitemap]
- **Question:** Which pages do you need at launch? (e.g., Home, About, Services, Solutions, Portfolio/Case Studies, Blog, Pricing, FAQ, Contact, Careers, Privacy Policy, Terms).
- **Answer Type:** Comma-separated list of routes
- **Required:** Yes
- **Default:** `Home, About, Services, Contact, Privacy Policy, Terms`
- **Downstream Consumers:** 
  - Stage 3: `project-docs/client-review/gate-3-page-list/page-list.md` (Zero unstated markdown routes rule)
  - Stage 6 Scaffolding: Next.js App Router route hierarchy (`site/app/(marketing)/...`)

### Q17 [Key Page Section Needs]
- **Question:** Are there specific sections or interactive modules required on key pages (e.g., interactive pricing table with billing toggle, case study filter grid, leadership team bios, tabbed feature comparison, FAQ accordion, multi-step quote wizard)?
- **Answer Type:** Free text / Bullet points
- **Required:** Optional
- **Default:** `Standard high-conversion section hierarchy (Hero, Social Proof / Logos, Value Propositions, Feature Cards, Testimonial Slider, FAQ, Final Conversion Anchor)`
- **Downstream Consumers:** Stage 5 `page-specs/<slug>/page.md` section blueprints

### Q18 [Copywriting Ownership Strategy]
- **Question:** What is the copywriting ownership strategy for this website?
  - `agency-draft` *(Default)*: Agency drafts complete, verbatim production-ready copy based on intake notes and industry research. Zero lorem ipsum.
  - `client-ready`: Client will supply final, approved copy files for every page prior to Stage 5.
  - `hybrid`: Agency drafts marketing copy (Home, About, Services); client provides technical case studies and legal policies.
- **Answer Type:** Choice
- **Allowed Options:** `agency-draft`, `client-ready`, `hybrid`
- **Required:** Yes
- **Default:** `agency-draft`
- **Downstream Consumers:** Stage 5 page specs verbatim copy, Stage 6 implementation

### Q19 [Brand Voice, Tone & Prohibited Vocabulary]
- **Question:** How should your brand speak (e.g., authoritative & technical, friendly & approachable, direct & punchy)? Are there specific buzzwords or clichés you strictly want to avoid (e.g. "game-changer", "synergy", "cutting-edge")?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** `Clear, confident, professional, jargon-free`
- **Downstream Consumers:** Stage 2 Design Theory voice tokens, Stage 5 verbatim copy drafting

### Q20 [Header & Footer Navigation Hierarchy]
- **Question:** What specific navigation links, action buttons, social profile icons, or legal links must appear in the header and footer?
- **Answer Type:** Free text / Structure
- **Required:** Optional
- **Default:** `Header: Top 4 routes + Primary CTA button; Footer: 4-column layout (Company, Solutions, Resources, Legal) + Social links + Copyright`
- **Downstream Consumers:** Stage 5 `layout-system.md` Shared Components section, Stage 6 Header/Footer components

### Q21 [Lead Capture & Form Endpoints]
- **Question:** What forms do you require on the website (e.g., General Contact inquiry, Request a Quote / RFQ, Book a Demo, Newsletter Subscription)?
- **Answer Type:** List of forms
- **Required:** Yes
- **Default:** `General Contact Inquiry (Name, Email, Phone, Company, Message)`
- **Downstream Consumers:** Stage 1 form endpoint specs, Stage 5 form validation schemas, Stage 6 React Hook Form / Zod implementations

---

## 3. Confirmation Stage 0.3

After receiving responses to Batch 03:

1. **Acknowledge and Echo:**
   ```markdown
   ### Batch 03 Sitemap & Copywriting Confirmation
   - Launch Page Inventory: [Q16 Routes]
   - Key Interactive Sections: [Q17 List]
   - Copywriting Strategy: [Q18 Choice]
   - Voice & Tone Guardrails: [Q19 Attributes & Avoids]
   - Header & Footer Structure: [Q20 Structure]
   - Lead Capture Forms: [Q21 Forms]
   ```
2. **Explicit User Approval Prompt:**
   > *"Please review the confirmed sitemap and copywriting ownership above. Once approved, we will advance to Batch 04 (Asset Harvesting, Inventory & Generation System)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-03-sitemap-copy/answers.md`.
