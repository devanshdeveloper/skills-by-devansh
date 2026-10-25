# Batch 08: Rolling Discovery & Refinement Open Questions (20 Unanswered Questions Batch)

## Focus & Scope

This questionnaire batch organizes the **20 rolling open questions** into a single, comprehensive batch for the client. It is initialized at Gate 0 takeoff and serves as a continuous, asynchronous discovery queue throughout the entire project lifecycle.

```mermaid
graph TD
    A[Inspect Existing Answers: batch-01..07 & asset-manifest.md] --> B[Filter Out Already-Answered Topics]
    B --> C[Generate Single Batch of 20 Unanswered Questions]
    C --> D[Save to client-context/open-questions.md]
    D --> E{User Requests Email?}
    E -- Yes --> F[Run node scripts/client-notify/index.js --questions]
    E -- No --> G[Continue Pipeline Progression]
    G --> H[Client Provides Answers at Any Stage]
    H --> I[1. Remove Answered Questions]
    H --> J[2. Save Answers to batch-*/answers.md]
    H --> K[3. Add New Unanswered Questions (Keep 20)]
    H --> L[4. If site/ generated: Immediately Update Live Code]
```

---

## Strict Guardrail: Zero Already-Answered Questions

Before compiling or presenting this batch, the agent **MUST** perform a strict check against all recorded project context:
1. **Inspect All Prior Answers:**
   - `client-context/answers/batch-01-core-identity/answers.md`
   - `client-context/answers/batch-02-branding-motion/answers.md`
   - `client-context/answers/batch-03-sitemap-copy/answers.md`
   - `client-context/answers/batch-04-asset-harvesting-generation/answers.md` & `client-context/asset-manifest.md`
   - `client-context/answers/batch-05-type-specific-routing/answers.md`
   - `client-context/answers/batch-06-legacy-site-migration/answers.md` (if migration)
   - `client-context/answers/batch-07-seo-analytics-governance/answers.md`
2. **Eliminate Duplicates:** If the client has already answered a question (e.g. they already confirmed dark theme, provided their Calendly link, or supplied their logo), that question **CANNOT** be included in the open questions batch.
3. **Target Genuine Unresolved Gaps:** Every question in this batch must probe for high-value specifics that refine copy, visual assets, conversion mechanics, or integrations.

---

## The 20 Questions Single-Batch Inventory

The 20 open questions are grouped into domain categories within this single batch. If any topic below was already answered during Batches 01–07, substitute it with an unanswered project-specific nuance question:

### Category A: Core Identity & Narrative Hooks (3 Questions)
- **Q01 (Founder / Company Narrative Hook):** What is the exact authentic founder quote, story, or "aha moment" to feature prominently in the Hero or About narrative?
- **Q02 (Primary Competitive Moat):** What is the single biggest reason clients choose you over your closest direct competitor (e.g. proprietary methodology, turnaround speed, pricing transparency)?
- **Q03 (Primary Conversion Event):** What exact user action defines a successful visit (e.g. booked discovery call, self-serve checkout, newsletter opt-in, enterprise request for proposal)?

### Category B: Brand Personality & Micro-Interactions (3 Questions)
- **Q04 (Primary CTA Hover Behavior):** What micro-interaction behavior do you prefer for primary buttons (magnetic cursor attraction, subtle color inversion, glowing border gradient, or scale lift)?
- **Q05 (Theme Toggle Policy):** Should the website feature an interactive dark/light mode toggle, or remain permanently styled in your primary brand theme?
- **Q06 (Custom Typography & Font Licenses):** Do you have licensed proprietary web font files (`.woff2`) to include, or should we use optimized Google Fonts pairings?

### Category C: Route Sitemap & Verbatim Copywriting (4 Questions)
- **Q07 (Verified Client Testimonials):** Can you provide 2–3 authentic customer quotes with full names, professional titles, and company names?
- **Q08 (Quantifiable Case Study Metrics):** What specific quantifiable outcomes or stats can we highlight (e.g. "+140% organic traffic", "Saved 25 hrs/week", "$2.4M ARR generated")?
- **Q09 (Main Navigation Ordering):** Exactly which 4–6 links should appear in the desktop navbar, and should the header remain sticky with blur backdrop?
- **Q10 (Global Footer Legal Details):** What exact legal company name, registration number, physical address, and copyright disclaimer belong in the global footer?

### Category D: Visual Asset Manifest & Media (4 Questions)
- **Q11 (High-Resolution Vector Logo):** Can you provide SVG or transparent PNG logos for both light and dark backgrounds?
- **Q12 (Team Headshots & Photography):** Are authentic team photos available, or should neutral minimalist vector illustrations be generated?
- **Q13 (Social Proof Partner / Client Logos):** Can you provide 4–8 monochrome or color SVG logos of clients, partners, or press mentions for the trust banner?
- **Q14 (Product / Deliverable UI Screenshots):** Do you have high-res UI screenshots, photography, or mockups ready for your featured deliverables?

### Category E: Type-Specific Features & Integrations (3 Questions)
- **Q15 (Third-Party Embed & Scheduling Links):** What is your exact scheduling link (e.g. Calendly, Cal.com) or external form endpoint URL?
- **Q16 (Pricing Tiers & Billing Nuances):** What are the exact tier names, pricing amounts, feature bullet points, and monthly/annual discount percentages?
- **Q17 (Contact / Lead Capture Fields):** Exactly which fields are mandatory on inquiry forms (e.g. Name, Business Email, Company, Phone, Project Budget Range)?

### Category F: Legacy Migration & Technical Governance (3 Questions)
- **Q18 (High-Traffic Legacy Content to Retain):** Are there specific historical blog posts, articles, or resources that receive organic search traffic and must be migrated verbatim?
- **Q19 (Deprecated Routes & 301 Redirect Target):** Are there legacy pages or retired service offerings that should 301 redirect directly to the home page or a specific new service page?
- **Q20 (Production Domain & DNS Control):** What is your verified production domain (`https://...`), and do you have access to DNS management (Cloudflare, GoDaddy, Namecheap) for Vercel SSL verification?

---

## On-Demand Email Dispatching

The user or team can request to send an email with these 20 open questions at **ANY** time.

### CLI Command:
```bash
node skills/create-nww-website/scripts/client-notify/index.js --questions
```
*(or alias `node skills/create-nww-website/scripts/client-notify/index.js --batch=8`)*

### Interactive Chat Trigger:
Whenever the user in chat types:
- *"send a mail with those questions"*
- *"email the client the open questions"*
- *"dispatch open questions to client"*

The agent MUST:
1. Verify `client-context/open-questions.md` is current and contains only unanswered questions.
2. Run the email command or generate the formatted email draft.
3. Display the formatted email preview in chat with a clickable `mailto:` link for immediate dispatch.

---

## Rolling Refinement & Codebase Action Loop

This batch is dynamic and never ends:
1. **When Answers Arrive:**
   - **Delete** the answered question from `client-context/open-questions.md`.
   - **Persist** the answer into the matching batch answers file:
     `client-context/answers/batch-[number]-[batch-name]/answers.md`
     (or `client-context/asset-manifest.md` if asset-related).
   - **Replenish** by adding a new unanswered targeted question to keep the count at **at least 20 open questions**.
2. **Immediate Action on Live Code:**
   - **If `site/` has already been generated:** The agent **immediately implements the answer in the live site code** (updating React components, page copy, layout system, theme tokens, metadata, or CMS seed data).
   - **If before site generation:** The agent updates the respective planning specification (`layout-system.md`, `page-specs/`, `seo-strategy.md`).
