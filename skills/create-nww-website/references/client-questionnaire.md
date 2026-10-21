# Client Discovery Questionnaire & Site Brief Specification

**Read this reference when:** The skill is activated and needs to execute the intake interview, resume an existing brief, prefill from user notes, or format `project-docs/client-answers.md` for Gate 0 approval.

---

## 1. Start-Up Activation Protocol

Upon skill activation, the agent must immediately execute this sequence:

1. **Pre-Flight Brief Check (Single Read-Only Action):**
   - Inspect the workspace for `project-docs/client-answers.md`.
   - **Case A — Existing Brief Found & Complete:** Output an executive intake recap, flag any non-standard choices, and prompt the user: *"Existing site brief found in `project-docs/client-answers.md`. Please review and confirm to clear Gate 0, or specify any updates."* Halt for confirmation.
   - **Case B — Existing Brief Found but Partial:** Load answered fields, acknowledge them to the user, and present ONLY the first batch containing unfulfilled questions.
   - **Case C — User Provided a Pasted Brief or Notes in Prompt:** Extract known answers into memory, report what was successfully parsed, and present ONLY the remaining gap questions.
   - **Case D — Fresh Project:** **Immediately present Batch 1 (Questions 1 to 7)** in plain language.
2. **Absolute Restrictions Before Presenting Batch 1:**
   - **NO** file searches, tree walks, or repository inspections beyond the single brief check.
   - **NO** shell commands, dependency installations, or Next.js scaffolding.
   - **NO** planning documents or router state initialization before answers are captured.
3. **Pacing & Interactive Dialogue:**
   - Present exactly one batch (5 to 7 questions) per conversation turn.
   - Wait for user response before presenting the subsequent batch.
   - For vague or contradictory replies, ask a concise follow-up question. Never fabricate or guess required answers.
   - If an optional question receives "I don't know" or "decide later", assign the documented project default.
4. **Secret Hygiene Guardrail:**
   - Never request, accept, or record secret credentials, API keys, or passwords in chat or files.
   - If the user provides a secret, immediately reject it, remind them to keep credentials in `.env.local`, and record only the environment variable name (`CMS_SITE_KEY`, `SERVER_URL`, `REVALIDATE_SECRET`, `PIXABAY_API_KEY`).

---

## 2. Structured Questionnaire Batches

### Batch 1: Project Identity, Scope & CMS Architecture (7 Questions)
- **Q1 [Identity & Offering]:** What is your business or organization name, and what does it do in 1–2 sentences?  
  *(Answer: Free text | Required: Yes | Consumer: Stage 2, 3, 6)*
- **Q2 [Target Audience]:** Who is your ideal customer or visitor (age range, profession, intent)?  
  *(Answer: Free text | Required: Yes | Consumer: Stage 2, 5, 6)*
- **Q3 [Primary Conversion Action]:** What is the single #1 action you want a visitor to take on the site (e.g., Book a Call, Submit Inquiry, Buy Product, Read & Subscribe)?  
  *(Answer: Choice / Free text | Allowed: `Book a Call`, `Submit Inquiry`, `Buy Product`, `Subscribe`, Custom | Required: Yes | Consumer: Stage 0 Gate 0, Stage 3, 5)*
- **Q4 [Website Type]:** What type of website are we building?  
  *(Answer: Choice | Allowed: `1: Business/Corporate`, `2: E-commerce`, `3: Blog/Publication`, `4: Portfolio`, `5: Booking/Service`, `6: Web App/SaaS`, `7: Redesign/Migration` | Default: `1: Business/Corporate` | Required: Yes | Consumer: Stage 3, Batch 7 branching)*
- **Q5 [CMS Operational Mode]:** Will this website use the NWW CMS for a dynamic blog and form endpoints (`cms`), or is it a 100% static site (`none`)?  
  *(Answer: Choice | Allowed: `none`, `cms` | Default: `none` | Required: Yes | Consumer: Stage 0 Gate 0, Stage 1, Stage 7)*
- **Q6 [Build Origin]:** Are we building this from scratch, or redesigning/migrating an existing site?  
  *(Answer: Choice | Allowed: `scratch`, `migration` | Default: `scratch` | Required: Yes | Consumer: Stage 3, Batch 7 branching)*
- **Q7 [Timeline & Launch Date]:** What is your target launch date, and are there any hard deadlines (e.g., product launch, campaign, event)?  
  *(Answer: Free text | Default: `Flexible / 4 weeks` | Required: Yes | Consumer: Stage 0, Stage 11)*

### Batch 2: Branding, Design Direction & Inspiration (7 Questions)
- **Q8 [Brand Assets Available]:** Do you have vector logo files (SVG, AI, EPS) in full-color, monochrome, and reversed light-on-dark variants?  
  *(Answer: Choice / Free text | Allowed: `yes-all`, `partial`, `none-create` | Default: `yes-all` | Required: Yes | Consumer: Stage 2, Stage 6)*
- **Q9 [Brand Palette & Tokens]:** Do you have established brand colors (provide hex codes), or should the agency curate a cohesive modern palette?  
  *(Answer: Choice / Free text | Allowed: Hex list or `curate-for-me` | Default: `curate-for-me` | Required: Yes | Consumer: Stage 2)*
- **Q10 [Typography]:** Do you have licensed brand fonts, or should we select high-quality Google Fonts (e.g. Inter, Outfit, Plus Jakarta Sans)?  
  *(Answer: Choice / Free text | Allowed: `google-fonts` or licensed font names | Default: `google-fonts` | Required: Yes | Consumer: Stage 2, Stage 9)*
- **Q11 [Brand Personality Scale]:** Where does your brand sit across these 4 spectrums:  
  1. Minimal ↔ Maximal | 2. Corporate ↔ Playful | 3. Luxury ↔ Accessible | 4. Modern ↔ Classic  
  *(Answer: List of ratings | Default: `Balanced / Modern-Accessible` | Required: Yes | Consumer: Stage 2)*
- **Q12 [Liked Design References]:** Share 2–3 live website URLs you admire. For each, what specifically do you like (Layout, Color, Typography, Imagery, or Animations)?  
  *(Answer: List of URLs + commentary | Required: Yes | Consumer: Stage 2 live-fetch & visual screenshot capture)*
- **Q13 [Disliked Websites]:** Share 1–2 website URLs whose design or vibe you dislike, and why?  
  *(Answer: List of URLs + commentary | Default: `None` | Required: Optional | Consumer: Stage 2)*
- **Q14 [Motion & Animation]:** What is your animation preference: subtle & static by design (micro-interactions on hover, max 1 bold section), or completely static?  
  *(Answer: Choice | Allowed: `subtle-gsap` (default), `static-only` | Default: `subtle-gsap` | Required: Yes | Consumer: Stage 2, Stage 9)*

### Batch 3: Pages, Sitemap & Verbatim Copywriting (6 Questions)
- **Q15 [Core Page List]:** Which pages do you need at launch (e.g. Home, About, Services, Contact, Blog, Pricing, FAQ)?  
  *(Answer: List | Default: `Home, About, Services, Contact` | Required: Yes | Consumer: Stage 3)*
- **Q16 [Specific Sections]:** Are there specific sections or features needed on key pages (e.g. interactive pricing table, case study grid, leadership team bios, FAQ accordion)?  
  *(Answer: Free text | Default: `Standard modern section hierarchy` | Required: Optional | Consumer: Stage 5)*
- **Q17 [Copywriting Ownership]:** Is all text/copy already written and ready to provide, or should the agency draft complete, verbatim production-ready copy?  
  *(Answer: Choice | Allowed: `client-ready`, `agency-draft`, `hybrid` | Default: `agency-draft` | Required: Yes | Consumer: Stage 6)*
- **Q18 [Voice & Tone]:** Describe your brand's voice and tone (e.g. authoritative & technical, friendly & approachable, direct & punchy) and any words to avoid.  
  *(Answer: Free text | Default: `Clear, confident, professional` | Required: Yes | Consumer: Stage 2, Stage 6)*
- **Q19 [Header & Footer Navigation]:** Any specific links, social profile links, or secondary utilities required in the header or footer?  
  *(Answer: Free text | Default: `Standard top-level routes + legal footer` | Required: Optional | Consumer: Stage 5, Stage 9)*
- **Q20 [Forms & Lead Capture]:** What forms do you require (e.g. general contact inquiry, quote request, newsletter subscription)?  
  *(Answer: List / Choice | Allowed: `contact`, `lead`, `newsletter`, `none` | Default: `contact` | Required: Yes | Consumer: Stage 3, Stage 7)*

### Batch 4: Imagery, Stock Intake & Media Pipeline (7 Questions)
- **Q21 [Primary Imagery Source]:** What is the primary source of photos for the site: client-provided real photos, licensed stock imagery, or photoshoot planned?  
  *(Answer: Choice | Allowed: `client-photos`, `stock-licensed`, `photoshoot`, `hybrid` | Default: `stock-licensed` | Required: Yes | Consumer: Stage 0 Gate 0, Stage 6)*
- **Q22 [Rights & Releases]:** If client-provided photos are used, do you confirm that you own full commercial rights and have signed model releases?  
  *(Answer: Yes/No | Allowed: `yes`, `no`, `n/a` | Default: `yes` | Required: Conditional on client photos | Consumer: Stage 0, Stage 6)*
- **Q23 [Stock Authorization - Q35a]:** For image slots not supplied by you, is the project authorized to use licensed stock photography?  
  *(Branching: If No -> all open slots receive placeholder status; skip Q24–Q26. If Yes -> continue).*  
  *(Answer: Yes/No | Allowed: `yes`, `no` | Default: `yes` | Required: Conditional on stock considered | Consumer: Stage 0 Gate 0, Stage 6)*
- **Q24 [Stock Credit - Q35b]:** Has it been confirmed that photographer credit will appear on the site (on a dedicated `/credits` page)?  
  *(Answer: Yes/No | Allowed: `yes`, `no` | Default: `yes` | Required: Conditional on Q23 = Yes | Consumer: Stage 0, Stage 9)*
- **Q25 [Stock Provider & Hosting - Q35c]:** Do you approve sourcing stock from approved providers (Pixabay, Pexels, Unsplash), downloaded and optimized on your server (Unsplash hotlinked)?  
  *(Answer: Yes/No | Allowed: `yes`, `no` | Default: `yes` | Required: Conditional on Q23 = Yes | Consumer: Stage 0, Stage 6, Stage 9)*
- **Q26 [Stock Image Ceiling - Q35d]:** What is the maximum stock image count ceiling for this project? (Default: 20 images; more than 20 requires explicit approval).  
  *(Answer: Number | Default: `20` | Required: Conditional on Q23 = Yes | Consumer: Stage 0, Stage 6)*
- **Q27 [Downloadable Media]:** Do you have downloadable assets (PDF brochures, case study docs, product catalogs)?  
  *(Answer: Free text / List | Default: `None` | Required: Optional | Consumer: Stage 6)*

### Batch 5: Technical SEO, Domain, Analytics & Compliance (7 Questions)
- **Q28 [SEO Keywords & Searches]:** What 5–10 searches, queries, or topics do you most want this website to rank for on Google?  
  *(Answer: List | Required: Yes | Consumer: Stage 4)*
- **Q29 [Geographic Focus]:** Do you serve a specific local/regional area (physical address), or are you online-only / global?  
  *(Answer: Choice / Free text | Allowed: `local-regional`, `national`, `global-online` | Default: `global-online` | Required: Yes | Consumer: Stage 4)*
- **Q30 [Competitors in Search]:** Who are your top 2–3 competitors in search results?  
  *(Answer: List of names/URLs | Default: `None specified` | Required: Optional | Consumer: Stage 4)*
- **Q31 [Production Domain]:** What is the primary production domain or URL for the site (e.g. `https://example.com`)?  
  *(Answer: URL | Default: `https://example.com` | Required: Yes | Consumer: Stage 4)*
- **Q32 [Analytics & Tracking]:** Do you have a Google Analytics 4 (GA4) account, and will you supply the Measurement ID env var name (`NEXT_PUBLIC_GA_ID`)?  
  *(Answer: Choice | Allowed: `ga4`, `none`, `other` | Default: `ga4` | Required: Yes | Consumer: Stage 1, Stage 9)*
- **Q33 [Legal Entity Details]:** What is your registered legal entity name, jurisdiction, and contact address for Privacy Policy and Terms of Service pages?  
  *(Answer: Free text | Default: `Draft skeleton with needs-client-input` | Required: Yes | Consumer: Stage 6, Stage 10)*
- **Q34 [Languages]:** What languages are needed? (Default is single language `en-US`).  
  *(Answer: Choice / List | Default: `en-US` | Required: Yes | Consumer: Stage 1, Stage 4)*

### Batch 6: CMS Backend Configuration & Seeding (Conditional: Only if Q5 is `cms`) (6 Questions)
- **Q35 [CMS Instance Target]:** What is your non-production/staging CMS base URL (env var `SERVER_URL`, e.g. `https://api.nextwebworks.in`)? *Never provide secret credentials.*  
  *(Answer: URL | Default: `https://api.nextwebworks.in` | Required: Conditional on `cms: cms` | Consumer: Stage 1, Stage 7)*
- **Q36 [CMS Site Key Env Var]:** Confirm that you will provide the read-only Bearer token under the environment variable name `CMS_SITE_KEY`. *(Do NOT paste the key here).*  
  *(Answer: Confirmation | Allowed: `confirmed` | Default: `confirmed` | Required: Conditional on `cms: cms` | Consumer: Stage 1, Stage 7)*
- **Q37 [Revalidate Secret Env Var]:** Confirm that you will configure the webhook secret under `REVALIDATE_SECRET`. *(Do NOT paste the secret here).*  
  *(Answer: Confirmation | Allowed: `confirmed` | Default: `confirmed` | Required: Conditional on `cms: cms` | Consumer: Stage 1, Stage 7)*
- **Q38 [Initial Blog Seeding Volume]:** How many initial blog posts should be generated and seeded into the CMS (e.g., 3–5 sample posts)?  
  *(Answer: Number | Default: `3` | Required: Conditional on `cms: cms` | Consumer: Stage 7)*
- **Q39 [Seed Post Publication State]:** Should initial seed posts be created in `published` or `draft` status?  
  *(Answer: Choice | Allowed: `draft`, `published` | Default: `published` | Required: Conditional on `cms: cms` | Consumer: Stage 7)*
- **Q40 [Form Notifications]:** Confirm you understand form submission notifications are configured directly inside your NWW CMS dashboard settings.  
  *(Answer: Confirmation | Allowed: `acknowledged` | Default: `acknowledged` | Required: Conditional on `cms: cms` | Consumer: Stage 7)*

### Batch 7: Type-Specific Scoping & Governance (Conditional on Q4 & Q6) (5 Questions)
- **Q41 [Type Deep Dive]:**
  - *If Migration (Q6 = `migration`):* What is the current platform, do we have full URL inventory, and what is the content freeze date?
  - *If E-commerce (Q4 = `2`):* What third-party payment gateway (Stripe/PayPal) will be linked, and roughly how many products?
  - *If Booking (Q4 = `5`):* Which scheduling tool (Calendly embed) will be integrated?
  - *If Standard Corporate (Q4 = `1`):* Confirm standard company profile structure.  
  *(Answer: Free text | Required: Conditional | Consumer: Stage 3, Stage 4)*
- **Q42 [Migration Redirects]:** If migrating, are there existing SEO rankings or URLs that must have 301 redirects preserved?  
  *(Answer: Yes/No + List | Default: `None` | Required: Conditional on Migration | Consumer: Stage 4)*
- **Q43 [Approval Stakeholder]:** Confirm the sole point of contact for gate sign-offs (Default: Devansh).  
  *(Answer: Free text | Default: `Devansh` | Required: Yes | Consumer: State Machine)*
- **Q44 [Post-Launch Maintenance]:** Who will maintain the codebase and content post-launch (client team vs agency)?  
  *(Answer: Choice | Allowed: `client-team`, `agency`, `hybrid` | Default: `agency` | Required: Yes | Consumer: Stage 11 Handover)*
- **Q45 [Out-of-Scope Confirmation]:** Confirm out-of-scope items (e.g. custom PHP/WordPress platforms, backend custom microservices, direct database access).  
  *(Answer: Confirmation | Default: `confirmed` | Required: Yes | Consumer: Stage 1)*

---

## 3. Site Brief Deliverable Template (`project-docs/client-answers.md`)

After all questionnaire batches are completed, write the compiled answers to `project-docs/client-answers.md`:

```markdown
# Client Discovery Answers & Site Brief

**Project Name:** [Business Name]  
**Recorded Date:** YYYY-MM-DD  
**Status:** Approved at Gate 0  
**CMS Mode:** [none | cms]  

## 1. Project Identity & Scope
- **Business Offering:** [Summary of business and offering]
- **Target Audience:** [Audience demographics and intent]
- **Primary Conversion Action:** [e.g. Book a Discovery Call -> /contact]
- **Website Type:** [e.g. Business/Corporate]
- **Build Origin:** [scratch | migration]
- **Target Launch Date:** [Target launch date]

## 2. Branding & Design Direction
- **Brand Assets:** [Vector logos: yes/no]
- **Color Palette:** [Hex codes or "Agency Curated"]
- **Typography:** [Google Fonts: e.g. Outfit + Inter, or Licensed]
- **Brand Scale:** [Minimal/Maximal, Corporate/Playful, Luxury/Accessible, Modern/Classic]
- **Liked References:**
  1. [URL 1] - [Notes on layout, color, typography]
  2. [URL 2] - [Notes]
- **Disliked References:** [URLs and anti-patterns to avoid]
- **Motion Preference:** [subtle-gsap | static-only]

## 3. Sitemap & Content Architecture
- **Core Pages:** [Home, About, Services, Contact, Blog]
- **Key Page Sections:** [Hero, Social Proof, Services Grid, FAQ, Contact CTA]
- **Copywriting Strategy:** [agency-draft | client-ready]
- **Voice & Tone:** [e.g. Confident, direct, conversational]
- **Navigation Structure:** [Header & Footer specifics]
- **Form Endpoints:** [Contact Us -> /api/website-contact-us/:id/submit, Lead -> /api/lead/submit]

## 4. Imagery & Stock Photography Decisions
- **Primary Source:** [client-photos | stock-licensed | photoshoot]
- **Rights & Releases Confirmed:** [yes | n/a]
- **Stock Photography Authorized:** [yes | no]
- **Stock Attribution Acknowledged:** [yes - /credits page required]
- **Stock Provider & Hosting Approved:** [yes - Pixabay/Pexels rehosted, Unsplash hotlinked]
- **Stock Image Count Ceiling:** [20]
- **Downloadable Assets:** [None or list]

## 5. SEO, Analytics & Compliance
- **Primary Keywords:** [5-10 keyword phrases]
- **Geographic Focus:** [local | national | global]
- **Competitors in Search:** [Competitor URLs]
- **Production Domain:** [https://example.com]
- **Analytics:** [GA4 - env var NEXT_PUBLIC_GA_ID]
- **Legal Entity Details:** [Company Name, Address, Jurisdiction]
- **Languages:** [en-US]

## 6. CMS Architecture & Credentials (if cms mode)
- **CMS Target Instance:** [SERVER_URL e.g. https://api.nextwebworks.in]
- **CMS Site Key Env Var:** [CMS_SITE_KEY]
- **Revalidate Secret Env Var:** [REVALIDATE_SECRET]
- **Initial Blog Seeding:** [3 posts, published]
- **Form Alerts:** [Configured in CMS dashboard settings]

## 7. Governance & Launch Constraints
- **Sole Approver:** [Devansh]
- **Post-Launch Maintenance:** [Agency / Client]
- **Out-of-Scope:** [Recorded boundaries]
```

---

## 4. Gate 0 Discovery Sign-Off Checklist

Before clearing Gate 0 and advancing to Stage 1 Tech Stack:
- [ ] Questionnaire answers captured in `project-docs/client-answers.md`.
- [ ] Primary conversion action and target audience confirmed.
- [ ] Reference URLs fetched and inspected.
- [ ] CMS mode confirmed (`none` vs `cms`).
- [ ] Asset inventory compiled (assets supplied, rights confirmed, missing items).
- [ ] Stock photography decision recorded (approved / not approved / placeholder-only); if approved, provider priority and count ceiling confirmed.
- [ ] Explicit human sign-off obtained for Gate 0.
