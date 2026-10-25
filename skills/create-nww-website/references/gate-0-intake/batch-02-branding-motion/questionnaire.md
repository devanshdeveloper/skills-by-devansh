# Batch 02: Branding, Design Direction & Motion Tier

**Batch Code:** `batch-02-branding-motion`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-02-branding-motion/answers.md`  

---

## 1. Input Sources & Ingestion Protocol

Before presenting this batch, inspect existing inputs:
1. **Logo & Asset Files:** Check if client uploaded logo files in `client-context/` or `public/`. Note formats (`.svg`, `.png`, `.eps`).
2. **Design References in Brief:** Check if URLs were supplied in the initial brief prompt.
3. **Turn Pacing:** Present Questions Q9 through Q15 in plain language. Wait for client response before advancing.

---

## 2. Questions

### Q9 [Brand Vectors & Logo Assets]
- **Question:** Do you have vector logo files (SVG, AI, EPS) in full-color, monochrome dark, and reversed light-on-dark variants?
- **Answer Type:** Choice / Free text
- **Allowed Options:** `yes-all`, `partial`, `none-create`
- **Required:** Yes
- **Default:** `yes-all`
- **Downstream Consumers:** Stage 2 Header/Footer, Stage 6 Scaffolding (`public/brand/`)

### Q10 [Brand Palette & Color Tokens]
- **Question:** Do you have established brand colors (please provide hex codes for Primary, Secondary, Accent, Background), or should the agency curate a cohesive modern palette?
- **Answer Type:** Hex code list or `curate-for-me`
- **Required:** Yes
- **Default:** `curate-for-me`
- **Downstream Consumers:** Stage 2 `design-theory.md`, Stage 6 `site/app/globals.css` Tailwind `@layer base` CSS variables

### Q11 [Typography Selection]
- **Question:** Do you have licensed brand fonts, or should we select high-quality Google Fonts (e.g., Plus Jakarta Sans + Inter, Outfit + Source Sans, Syne + Space Grotesk)?
- **Answer Type:** Choice / Font names
- **Allowed Options:** `google-fonts` or licensed font names
- **Required:** Yes
- **Default:** `google-fonts` (`Heading: Plus Jakarta Sans`, `Body: Inter`)
- **Downstream Consumers:** Stage 2 variations `<head>` Google Fonts link, Stage 6 `next/font/google` in `layout.jsx`

### Q12 [Brand Personality Scale]
- **Question:** Where does your brand sit across these four 1-to-5 spectrums?
  1. Minimal ↔ Maximal
  2. Corporate ↔ Playful
  3. Luxury ↔ Accessible
  4. Modern ↔ Classic
- **Answer Type:** List of ratings (1 to 5)
- **Required:** Yes
- **Default:** `Minimal: 2/5`, `Corporate: 3/5`, `Luxury: 3/5`, `Modern: 5/5` (Modern, clean, accessible authority)
- **Downstream Consumers:** Stage 2 Design Theory visual weight and layout density rules

### Q13a [Liked Design References & Principles]
- **Question:** Please share 2–3 live website URLs you admire. For each URL, what specific design principles do you like (e.g., spatial grid, typography hierarchy, color mood, visual density, or navigation pattern)?
- **Answer Type:** List of URLs + commentary
- **Required:** Yes
- **Default:** None (Must be provided; e.g. `https://stripe.com`, `https://linear.app`)
- **Downstream Consumers:** 
  - Automated crawl via `node skills/create-nww-website/scripts/site-fetch/index.js --brief client-context/answers/batch-02-branding-motion/answers.md --out project-docs/design-references --mode references`
  - Stage 2 `design-theory.md` Principles Extraction
  - Stage 5 Page Specs IA benchmarks

### Q13b [Reference Anti-Patterns to Avoid]
- **Question:** Looking at your reference websites, is there anything specific you dislike, find confusing, or want to strictly avoid on your website?
- **Answer Type:** Free text
- **Required:** Optional
- **Default:** `None specified`
- **Downstream Consumers:** Stage 2 `design-theory.md` Avoid List

### Q13c [Gate 2 Variation Count & Naming]
- **Question:** How many distinct landing page variations would you like to review at Gate 2?
- **Answer Type:** Choice
- **Allowed Options:** `2`, `3`, `4`
- **Required:** Yes
- **Default:** `3`
- **Naming Rule:** Every variation directory and file MUST use the confirmed project slug from Batch 01 (e.g., `project-docs/client-review/gate-2-design-theory/<project-slug>-v1/index.html`, `<project-slug>-v2/`, `<project-slug>-v3/`).
- **Tech Stack Rule:** Variations are built with **HTML + Tailwind CSS + jQuery** to save tokens, using CSS classes in `<style>` blocks for repeated cards.

### Q13d [Reference Adherence Mode]
- **Question:** How closely should the design variations follow your reference websites?
- **Answer Type:** Choice
- **Allowed Options:**
  - `principles-only` (Default: Extract abstract spatial and typography principles; 100% original layout, markup, and copy)
  - `loose-inspiration` (Broad creative departure with subtle stylistic nods)
- **Required:** Yes
- **Default:** `principles-only`
- **Downstream Consumers:** Stage 2 Similarity Distance Audit (`_checks/similarity-audit.md`)

### Q14 [Disliked Websites & Aesthetic Pitfalls]
- **Question:** Share 1–2 website URLs whose overall design or aesthetic vibe you dislike, and explain why.
- **Answer Type:** List of URLs + commentary
- **Required:** Optional
- **Default:** `None specified`
- **Downstream Consumers:** Stage 2 Avoid List

### Q15 [GSAP Animation Tier]
- **Question:** What level of motion and interaction should be implemented on the site?
  - `disabled`: Static layout only. Do NOT load GSAP skills; do NOT install `gsap` library in Next.js site. Pure CSS/Tailwind transitions.
  - `low`: Subtle micro-interactions, gentle hover scale (1.02), smooth scroll fades (15–20px translateY), standard stagger (0.05s). Zero pinning, zero continuous scrubbing.
  - `medium` *(Default)*: Standard modern agency motion. Coordinated section entrances, `ScrollTrigger.batch()`, sticky navbar backdrop blur, animated counter numbers (max 1 bold section).
  - `high`: Award-winning marketing site tier. Pinned horizontal scroll track, scrubbed timelines, SplitText masked word reveals, magnetic buttons, Lenis smooth scroll ticker sync.
  - `max`: Immersive narrative experience. Multi-stage pinned card stacking in 3D perspective (`rotationX`, `scale`), 60fps 3D card tilt via `quickTo`, velocity-aware inertia skewing (`self.getVelocity()`).
  - `ultra`: Experiential Awwwards SOTD / WebGL tier. Decoupled Three.js canvas architecture, camera flight through 3D space driven by master ScrollTrigger scrub, custom GLSL shader displacement, 120fps GPU budget.
- **Answer Type:** Choice
- **Allowed Options:** `disabled`, `low`, `medium`, `high`, `max`, `ultra`
- **Required:** Yes
- **Default:** `medium`
- **Downstream Consumers:** Stage 1 Tech Stack dependencies, Stage 2 Gate 2 variation scripts, Stage 6 `lib/motion.js`, [gsap-animation-tiers.md](../gate-6-scaffolding/gsap-animation-tiers.md)

---

## 3. Confirmation Stage 0.2

After receiving responses to Batch 02:

1. **Acknowledge and Echo:**
   ```markdown
   ### Batch 02 Branding & Motion Confirmation
   - Brand Vectors: [Q9 Value]
   - Color Palette Strategy: [Q10 Value]
   - Typography Choices: [Q11 Value]
   - Personality Spectrum: [Q12 Summary]
   - Design References to Crawl: [Q13a URLs]
   - Anti-Patterns to Avoid: [Q13b Value]
   - Gate 2 Variation Plan: [Q13c Count] variations named `<project-slug>-v[1..N]` (HTML + Tailwind + jQuery)
   - Reference Adherence Mode: [Q13d Value]
   - Motion Tier: [Q15 Value] (GSAP library loading rule configured)
   ```
2. **Explicit User Approval Prompt:**
   > *"Please confirm the branding direction, reference URLs, and motion tier above. Once confirmed, we will advance to Batch 03 (Sitemap, Navigation & Copywriting)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-02-branding-motion/answers.md`.
