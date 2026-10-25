# Batch 05: Type-Specific Architectural Routing

**Batch Code:** `batch-05-type-specific-routing`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-05-type-specific-routing/answers.md`  

---

## 1. Dynamic Routing Protocol

The agent checks the confirmed `website_type` (Q5 from Batch 01) and presents **ONLY the single relevant section** below. Do NOT present questions for irrelevant website types.

- If `website_type == 2: E-commerce` -> Present **Section A**
- If `website_type == 4: Portfolio` -> Present **Section B**
- If `website_type == 6: Web App/SaaS` -> Present **Section C**
- If `website_type == 5: Booking/Service` -> Present **Section D**
- If `website_type == 3: Blog/Publication` -> Present **Section E**
- If `website_type == 1: Business/Corporate` -> Present **Section F**

---

## 2. Section A: E-Commerce Websites

### Q25-EC1 [Catalog Depth & SKU Count]
- **Question:** How many distinct products and SKUs will be available at launch?
  - `single-product`: 1 flagship product landing page with direct checkout.
  - `boutique`: 2 to 15 curated products.
  - `medium-catalog`: 15 to 100 products with category filtering.
  - `large-catalog`: 100+ products requiring advanced search, faceted filtering, and database pagination.
- **Answer Type:** Choice / Number
- **Default:** `boutique` (5–10 products)

### Q25-EC2 [Product Variants & Bundles]
- **Question:** Do your products have configurable variants (e.g. sizes, colors, material finishes) or subscription / bundle options?
- **Answer Type:** Free text / Structure
- **Default:** `Simple products with size/color variants`

### Q25-EC3 [Payment Gateway & Checkout Flow]
- **Question:** Which payment processing system will be integrated?
  - `stripe-checkout`: Hosted Stripe Checkout redirect (fastest, PCI-compliant, zero backend card storage).
  - `stripe-elements`: Custom embedded credit card and Apple Pay / Google Pay fields directly on page.
  - `shopify-buy-button`: Headless Shopify Buy Button / Storefront API integration.
  - `paypal-link`: PayPal / external payment buttons.
- **Answer Type:** Choice
- **Default:** `stripe-checkout`
- **Security Rule:** Never ask for or record secret Stripe API keys in the brief. Specify env var names only (`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`).

### Q25-EC4 [Shipping, Currency & Tax Collection]
- **Question:** What is the primary selling currency, and what geographic regions do you ship to? Do you require automated tax calculation (Stripe Tax)?
- **Answer Type:** Free text
- **Default:** `USD ($), United States nationwide, Stripe Tax enabled`

---

## 3. Section B: Portfolio Websites

### Q25-PF1 [Case Study Count & Showcase Priority]
- **Question:** How many projects or case studies will be featured at launch, and what are the titles/clients of your top 3 flagship works?
- **Answer Type:** List of projects
- **Default:** `4–6 featured case studies`

### Q25-PF2 [Case Study Structure & Presentation Depth]
- **Question:** How in-depth should each project page be?
  - `visual-gallery`: Primarily full-width imagery, clean captions, and short summary.
  - `in-depth-case-study`: Comprehensive narrative (Client Brief, Problem / Challenge, Design Process, Solution, Metrics / ROI, Deliverables list, Tech Stack used).
- **Answer Type:** Choice
- **Default:** `in-depth-case-study`

### Q25-PF3 [Visual Deliverables & Media Formats]
- **Question:** What visual media formats are available for each project (e.g., static mockups, animated video embeds / Vimeo / Loom, interactive before/after image sliders, clickable prototypes)?
- **Answer Type:** List of media types
- **Default:** `High-res mockup imagery + interactive before/after sliders`

### Q25-PF4 [Bio, Credentials & Inquiries]
- **Question:** What should be featured on the About / Creator page (e.g., design philosophy, client brand logos worked with, design awards/press, downloadable PDF capabilities deck/resume)?
- **Answer Type:** Free text
- **Default:** `Creator bio, client logo grid, award badges, and direct project inquiry form`

---

## 4. Section C: SaaS / Web App Marketing Websites

### Q25-SAAS1 [Core Feature Pillars & Product Tour]
- **Question:** What are the 3–4 core feature pillars or modules of the software that need dedicated breakdown sections?
- **Answer Type:** List of 3–4 features with benefits
- **Default:** `Core Automation, Real-Time Analytics, Seamless Integrations, Enterprise Security`

### Q25-SAAS2 [Interactive Pricing Architecture]
- **Question:** What is your pricing model, and what tiers should be displayed?
  - Tiers (e.g., Starter, Professional, Enterprise / Custom).
  - Features: Interactive Monthly ↔ Annual billing toggle (with e.g. "Save 20%" badge).
  - Feature comparison matrix table across tiers.
- **Answer Type:** Free text / Table outline
- **Default:** `3 tiers (Starter, Pro, Enterprise) with monthly/annual toggle and feature checkmark table`

### Q25-SAAS3 [App Login & Onboarding Flow]
- **Question:** What is the user routing for the main calls to action?
  - "Start Free Trial" or "Sign Up" button target (e.g. `https://app.example.com/signup`).
  - "Sign In" button target (e.g. `https://app.example.com/login`).
  - "Book a Live Demo" (Calendly modal or custom lead capture form).
- **Answer Type:** URLs / Routing
- **Default:** `App signup link + Book a Demo modal form`

### Q25-SAAS4 [Trust Badges & Social Proof]
- **Question:** What security badges or social proof can we showcase (e.g., SOC-2 Type II, GDPR compliant, HIPAA, G2 / Capterra rating badges, customer quote cards)?
- **Answer Type:** Free text
- **Default:** `SOC-2 & GDPR compliance badges + 3 customer testimonial cards`

---

## 5. Section D: Booking & Service Businesses

### Q25-BK1 [Service Packages & Tiered Offerings]
- **Question:** What are the distinct service packages offered, and do you display fixed transparent pricing or "Custom Quote"?
- **Answer Type:** Free text
- **Default:** `3 tiered service packages with starting-at pricing`

### Q25-BK2 [Scheduling Mechanism & Calendar Embed]
- **Question:** How should clients book an appointment or consultation?
  - `calendly-embed`: Embedded inline Calendly / Cal.com booking widget.
  - `multi-step-form`: Multi-step intake form with qualification questions before booking.
  - `phone-email`: Direct phone click-to-call and email inquiry.
- **Answer Type:** Choice
- **Default:** `calendly-embed`

### Q25-BK3 [Service Area & Credentials]
- **Question:** Do you serve a specific geographic physical radius (local service with map) or nationwide/virtual? Are there specific licenses, certifications, or bonded insurance notices required?
- **Answer Type:** Free text
- **Default:** `Regional service radius + licensed and insured badges`

---

## 6. Section E: Blog & Publication Websites

### Q25-PB1 [Editorial Taxonomy & Categories]
- **Question:** What are the primary editorial categories/topics for articles (e.g., Technology, Design, Industry Insights, Tutorials)?
- **Answer Type:** List of categories
- **Default:** `4 core editorial categories`

### Q25-PB2 [Author Profiles & Bio Displays]
- **Question:** Will articles have individual author bylines, avatars, and dedicated `/authors/<slug>` profile pages?
- **Answer Type:** Yes / No
- **Default:** `yes`

### Q25-PB3 [Newsletter & Subscription Engine]
- **Question:** Which newsletter platform should be integrated for reader capture (e.g., Substack, Beehiiv, Mailchimp, ConvertKit, NWW CMS subscribers)?
- **Answer Type:** Choice / Platform name
- **Default:** `NWW CMS subscriber endpoint / Mailchimp embed`

---

## 7. Section F: Corporate / Business Websites

### Q25-CP1 [Company Profile & Leadership]
- **Question:** What corporate identity elements are needed (e.g., Mission & Values, Executive Leadership bios, Board of Directors, History / Milestones timeline)?
- **Answer Type:** Free text
- **Default:** `Mission, Leadership Team bios with headshots, and Company Milestones timeline`

### Q25-CP2 [Industry Verticals & Enterprise Solutions]
- **Question:** Do you market to distinct industry verticals (e.g., Healthcare, Finance, Manufacturing, Government)? Should there be dedicated vertical landing pages?
- **Answer Type:** List of verticals
- **Default:** `3 dedicated industry vertical solution pages`

### Q25-CP3 [Corporate Lead Capture & RFQ Routing]
- **Question:** What departments or inquiry types should form submissions route to (e.g., Sales / RFQ, Partnerships, Media Relations, Careers)?
- **Answer Type:** List of inquiry types
- **Default:** `Sales RFQ, General Inquiries, and Media / Press`

---

## 8. Confirmation Stage 0.5

After receiving the client's responses to the type-specific section:

1. **Acknowledge and Echo:**
   Output a Type-Specific Architecture Confirmation block summarizing all answers for that specific archetype.
2. **Explicit User Approval Prompt:**
   > *"Please confirm the type-specific parameters above. Once confirmed, we will advance to Batch 06 (Legacy Site Migration) if applicable, or Batch 07 (SEO, Analytics & Governance)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-05-type-specific-routing/answers.md`.
