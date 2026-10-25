# Batch 01: Core Identity, Project Slug & Website Scope

**Batch Code:** `batch-01-core-identity`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-01-core-identity/answers.md`  

---

## 1. Input Sources & Ingestion Protocol

Before presenting this batch, the agent must check all incoming client input sources:

1. **Source A: User Prompt Notes / Pasted Brief:**
   - If the user provides a brief or notes in their opening prompt, extract all matching answers in memory.
   - Present an ingestion recap: *"Parsed the following core details: Business Name: [Name], Website Type: [Type]..."*
   - Prompt ONLY for unfulfilled or ambiguous questions in this batch.
2. **Source B: Existing Workspace Brief:**
   - Check if `client-context/answers/batch-01-core-identity/answers.md` already exists.
   - If complete, display an executive summary and ask for confirmation to proceed.
   - If partial, load answered fields and ask only the missing questions.
3. **Source C: Interactive Interview Turn:**
   - If starting fresh, present Questions Q1 through Q8 in clean, concise, plain English.
   - Wait for the client's reply before moving to Batch 02.

---

## 2. Questions

### Q1a [Business & Brand Name]
- **Question:** What is the official name of your business or organization as it should appear across the website?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** None (Must be provided)
- **Downstream Consumers:** 
  - Stage 1: Tech stack documentation title
  - Stage 2: Brand identity tokens, typography showcase, and variation headings
  - Stage 3: Page titles and meta tags
  - Stage 5: Structured JSON-LD Organization schema

### Q1b [Project Name & Vercel Deployment Slug]
- **Question:** What is the technical project name / slug for this build? (Lowercase alphanumeric and hyphens only, e.g. `minit-charger`, `lumina-portfolio`, `apex-saas`).
- **Answer Type:** Identifier string (alphanumeric + hyphen)
- **Required:** Yes
- **Default:** Automatically slugified from Q1a (e.g. `"Acme Corp LLC"` -> `acme-corp`)
- **Strict Propagation Rules:**
  - **Gate 2 Variations:** Every design variation directory, HTML title, and public review portal must use this project name (e.g. `<project-slug>-v1`, `<project-slug>-v2`, `<project-slug>-v3`).
  - **Stage 6 Scaffolding:** Used as the `name` field in `site/package.json` (`"name": "<project-slug>"`).
  - **Vercel Project Setup:** Used as the explicit project name when creating or linking the Vercel project for preview and production deployments (`vercel link --project <project-slug>` or `vercel --prod`). Localhost forwarding is forbidden; review milestones use the public Vercel project deployment for Next.js.
  - **Git & CI/CD:** Used as the base name for the repository review deployment and artifact outputs.

### Q2 [Core Offering & Value Proposition]
- **Question:** What does your business do, and what is your primary product or service offering in 1–2 sentences?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** None
- **Downstream Consumers:** 
  - Stage 0: `client-brief.md`
  - Stage 2: Hero headline and subhead copy in Gate 2 design variations
  - Stage 6: Hero section verbatim copy in Next.js scaffolding

### Q3 [Target Audience & Visitor Intent]
- **Question:** Who is your ideal customer or visitor (demographics, profession, problem they want to solve when landing on the site)?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** `General B2B / Commercial decision-makers`
- **Downstream Consumers:** Stage 2 Design Theory visual hierarchy, Stage 5 page specs tone

### Q4 [Primary Conversion Action]
- **Question:** What is the single #1 action you want a visitor to take on the site (e.g., Book a Discovery Call, Buy a Product, Submit an RFQ Inquiry, Subscribe to Newsletter)?
- **Answer Type:** Choice / Free text
- **Allowed Options:** `Book a Call`, `Submit Inquiry`, `Buy Product`, `Subscribe`, `Request Quote`, `Custom`
- **Required:** Yes
- **Default:** `Submit Inquiry`
- **Downstream Consumers:** Primary CTA button across all pages, Header sticky button, Hero CTA, Footer conversion anchor

### Q5 [Website Type & Architectural Routing]
- **Question:** What type of website are we building?
- **Answer Type:** Choice
- **Allowed Options:**
  - `1: Business/Corporate` (Standard services, about, team, contact)
  - `2: E-commerce` (Product catalog, checkout, cart, payment gateways)
  - `3: Blog/Publication` (Editorial taxonomy, author bios, newsletter, articles)
  - `4: Portfolio` (Projects, visual galleries, case studies, creator bio)
  - `5: Booking/Service` (Service packages, scheduling calendar embed, intake)
  - `6: Web App/SaaS` (Feature tours, pricing matrices, demo requests, app login)
  - `7: Redesign/Migration` (Replacing existing site; preserving equity)
- **Required:** Yes
- **Default:** `1: Business/Corporate`
- **Dynamic Routing Impact:**
  - If `2: E-commerce` -> Triggers deep dive in [batch-05-type-specific-routing/questionnaire.md](../batch-05-type-specific-routing/questionnaire.md#section-a-e-commerce).
  - If `4: Portfolio` -> Triggers deep dive in [batch-05-type-specific-routing/questionnaire.md](../batch-05-type-specific-routing/questionnaire.md#section-b-portfolio).
  - If `6: Web App/SaaS` -> Triggers deep dive in [batch-05-type-specific-routing/questionnaire.md](../batch-05-type-specific-routing/questionnaire.md#section-c-saas--web-app).
  - If `5: Booking/Service` -> Triggers deep dive in [batch-05-type-specific-routing/questionnaire.md](../batch-05-type-specific-routing/questionnaire.md#section-d-booking--service).
  - If `3: Blog/Publication` -> Triggers deep dive in [batch-05-type-specific-routing/questionnaire.md](../batch-05-type-specific-routing/questionnaire.md#section-e-blog--publication).
  - If `7: Redesign/Migration` or Q6 is `migration` -> Triggers [batch-06-legacy-site-migration/questionnaire.md](../batch-06-legacy-site-migration/questionnaire.md).

### Q6 [Build Origin]
- **Question:** Are we building this website from scratch, or redesigning/migrating an existing website?
- **Answer Type:** Choice
- **Allowed Options:** `scratch`, `migration`
- **Required:** Yes
- **Default:** `scratch`
- **Routing Impact:** If `migration`, agent immediately notes legacy URL, queues Stage 0 `site-fetch` crawl, and activates [batch-06-legacy-site-migration/questionnaire.md](../batch-06-legacy-site-migration/questionnaire.md).

### Q7 [CMS Operational Mode]
- **Question:** Will this website use the NWW CMS for dynamic blog publishing and lead form handling (`cms`), or is it a 100% static Markdown site (`none`)?
- **Answer Type:** Choice
- **Allowed Options:** `none`, `cms`
- **Required:** Yes
- **Default:** `none`
- **Downstream Consumers:** Stage 0 `.env.example`, Stage 1 Tech Stack, Stage 5 CMS schemas and `cms-requirements/list.md`

### Q8 [Timeline & Target Launch Date]
- **Question:** What is your target launch date, and are there any hard deadlines (e.g., product release, conference, trade show)?
- **Answer Type:** Free text
- **Required:** Yes
- **Default:** `Flexible / 4 weeks`
- **Downstream Consumers:** Project brief scheduling, Stage 8 handover checklist

---

## 3. Confirmation Stage 0.1

After receiving the user's responses to Batch 01:

1. **Acknowledge and Echo:**
   Output an intake confirmation block:
   ```markdown
   ### Batch 01 Intake Confirmation
   - Business Name: [Q1a Value]
   - Technical Project Name / Vercel Slug: [Q1b Value]
   - Offering Summary: [Q2 Value]
   - Target Audience: [Q3 Value]
   - Primary CTA: [Q4 Value]
   - Website Type: [Q5 Value] (Routing locked)
   - Build Origin: [Q6 Value]
   - CMS Mode: [Q7 Value]
   - Launch Timeline: [Q8 Value]
   ```
2. **Explicit User Approval Prompt:**
   > *"Please confirm the project identity and Vercel project slug above. Once confirmed, we will advance to Batch 02 (Branding, Motion & Design Direction)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-01-core-identity/answers.md`.
