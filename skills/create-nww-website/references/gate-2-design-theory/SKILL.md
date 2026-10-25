# Design Theory & Visual System Specification

Stage 2 establishes the aesthetic foundation of the website. Before any layouts or code are written, the design theory codifies the color palette, typography system, spatial tokens, dual motion tokens, voice & tone, and visual hierarchy.

The deliverable is saved to `project-docs/client-review/gate-2-design-theory/design-theory.md`.

---

## Prerequisites & Taste Skill Activation

When entering Stage 2:
1. **Live-Fetch & Capture Reference Sites (Landing Pages Only):**
   - For every liked reference URL in `client-context/client-answers.md`, capture the landing page directly into `project-docs/design-references/<domain>/` (where `<domain>` is lowercase hostname without `www.`, landing page only, query strings stripped) using `node skills/create-nww-website/scripts/reference-capture/index.js`.
   - Produce four standard artifacts per landing page:
     - `page.html`: Rendered DOM post-hydration saved verbatim (external assets not mirrored).
     - `content.md`: Verbatim stripped text preserving headings, paragraphs, and links (zero paraphrasing or summarizing).
     - `screenshot-full-1440.png`: Full-page 1440px desktop screenshot after lazy content loads.
     - `capture.json`: Structured metadata record (URL, final URL, title, viewport, sizes, status).
   - Compile `project-docs/design-references/sources.md` starting with the mandatory third-party usage notice (captures are strictly for internal design analysis and never reused in client code), followed by the complete audit table.
   - *Fallback rule:* If capture fails or the URL is unreachable/blocked, record the failure in `capture.json` and `sources.md`, ask the user to provide screenshots, and **never fabricate placeholders or mock images**.
2. **Taste Skill Verification:** Verify whether the `frontend-design` skill is available in your agent environment.
   - If not installed, run:
     ```bash
     DISABLE_TELEMETRY=1 npx skills add anthropics/skills --skill frontend-design
     ```
   - If installation fails or is restricted, adhere strictly to the visual taste rules specified below.
3. **Analyze Across Core Dimensions:**
   - Layout & structure (hero pattern, grid system, section rhythm, whitespace).
   - Color palette (exact tones/mood, contrast ratios, dark/light balance).
   - Typography (typeface category, weight hierarchy, pairings).
   - Imagery & graphics (photography art direction, illustration, Lucide icons).
   - Content & storyline (information sequence, narrative arc, CTA placement).
   - Micro-interactions & motion (scroll triggers, hover states, transitions).
   - Voice & tone (writing style, active voice, brand vocabulary).

---

## Deliverable Structure (`project-docs/design-theory.md`)

The agent synthesizes observations into `project-docs/design-theory.md` structured into these 7 mandatory sections:

### 1. Pattern Recognition
Across all liked references, identify the 3–5 design principles or patterns that repeat or align most strongly with the client's stated preferences (e.g., "High-contrast, mostly monochrome palette with a single warm accent color reserved exclusively for primary conversion CTAs").

### 2. Design Direction by Dimension
Provide specific, binding design decisions for THIS project across:
- **Layout & Structure:** Grid systems, section rhythm, container widths.
- **Color Direction:** Tonal balance, dark vs light canvas, surface elevation.
- **Typography Direction:** Display and body pairing rationale.
- **Imagery & Graphics:** Photography mood, treatment, and icon styling.
- **Content & Storyline:** Progression of arguments from header to footer.
- **Motion Direction:** Interaction feel and animation pacing.
- **Voice & Tone:** 3–5 binding rules for copywriting style, vocabulary to embrace, and forbidden clichés. Serves as authority for Stage 6 content authoring.

### 3. Design Tokens (Mandatory Specifications)
All tokens must use names compatible with Tailwind CSS theme keys:
- **Color Tokens:** Exact named hex values, intended semantic role, and WCAG contrast ratio (minimum 4.5:1 for body text, 3:1 for large headlines).
- **Typography Tokens:** Font families available via `next/font/google` or `next/font/local`.
  - Body text must remain at least 16px on mobile.
  - Interactive tap targets must measure at least 44x44px.
  - Responsive scale for `display`, `h1`, `h2`, `h3`, `body-large`, `body`, `caption`.
- **Spacing, Radii & Shadows:** 8pt spatial rhythm, container max-widths (`max-w-7xl`, `max-w-3xl`), border radii, and layered shadow tokens.
- **Dual Motion Tokens:** Every motion token must be specified in **TWO forms**:
  1. The CSS/Tailwind theme variable (e.g., `--ease-hero: cubic-bezier(...)`).
  2. The GSAP value (e.g., `"power3.out"` or CustomEase curve) with duration in seconds.  
  *These tokens are exported directly into `site/lib/motion.js` during Stage 6.*
- **Imagery & Icon Specs:** Named aspect ratios (e.g. `--ratio-hero`, `--ratio-card`), corner treatments, photo art direction, and Lucide icon stroke weight.

### 4. What to Avoid
Consolidate disliked-site signals and generic AI-generated tells into an explicit "avoid" list:
- Banned color defaults (e.g., warm-cream-and-terracotta default).
- Uniform entrance animations applied across all sections.
- Low-contrast light gray text on white backgrounds.
- Generic decorative shapes without semantic meaning.

### 5. Brand Positioning Summary
Restate client brand scale answers (Minimal↔Maximal, Corporate↔Playful, Luxury↔Accessible, Modern↔Classic) and confirm alignment with derived tokens.

### 6. Open Questions
Document any ambiguities, unverified reference fetches, or design tensions requiring client clarification.

### 7. Reference Summary Table
A compact audit table:
| Website URL | What Client Liked | Key Observed Principles | Derived Principle Adopted |
|---|---|---|---|
| `https://example.com` | "Clean typography" | Editorial serif, 80ch reading column | Adopted abstract principle: serif display scale with generous column width; zero copied markup or assets |

---

## Gate 2 Review Checklist & Client Delivery

### Principles extraction and anti-copy guardrail

Captured reference files (`page.html`, `content.md`, `screenshot-full-1440.png`) are **strictly analysis inputs**. Never reproduce, clone, or mimic a reference website. Instead, extract abstract design principles (e.g., spatial rhythm, typographic contrast, tonal mood) and use them to synthesize original landing page variations from the client's authentic content.

Before building variations, consult [design-variations.md](design-variations.md) for mandatory rules governing:
- **The 9-Dimension Variation Framework:** Layout & grid, section order & composition, type pairing & hierarchy, palette & contrast, shape & component language, motion character, imagery treatment, density & spacing, and navigation pattern.
- **Quantitative Distance Rules:** Each variation must differ on at least 4 of 9 dimensions from nearest references; no two variations share > 3 dimensions; zero shared classes, IDs, inline styles, or assets; max 5-word consecutive text overlap.
- **Mandatory Similarity Audit:** Pre-presentation automated audit compiling `_checks/similarity-audit.md`.
- **Failure Recovery:** Revise variations upon audit failure; never loosen thresholds; 2-strike human escalation.

The reference-capture helper scrolls slowly and retains mid-page and bottom viewport screenshots. Capture success means files were saved; inspect them before claiming visual completeness. Animated or virtualized pages may still produce incomplete full-page images. Disclose remaining limitations in capture records.

### Bundled review helpers

Run from the project root (replace the skill path if installed elsewhere):

```powershell
pnpm.cmd install --dir .agents/skills/create-nww-website/scripts/client-review
node .agents/skills/create-nww-website/scripts/client-review/index.js . --preserve-hubs
node .agents/skills/create-nww-website/scripts/client-review/preview.mjs . 4173
node .agents/skills/create-nww-website/scripts/client-review/verify.mjs .
```

The compiler's `--preserve-hubs` flag retains an authored comparison hub and root portal while scanning variations; omit it only when intentionally regenerating the default hubs. The preview server binds only to `127.0.0.1`. The verifier discovers variation directories containing `index.html`, excluding working directories such as `_checks`. It checks horizontal overflow, themes, disclosures, local navigation, offline loading, and automated accessibility; it saves screenshots with each variation and a report in `_checks/qa.json`.

Verifier-compatible review pages use `.theme-toggle` with labels “Use dark theme” / “Use light theme”, `html[data-theme]`, `#main`, `.copy-decision`, `#decision-text`, and `.copy-status`. Core content uses native HTML, and optional project disclosures use `details`/`summary`. These hooks are review UI conventions, not production architecture requirements.

For local fonts, add project-specific entries `{ family, stem, folder, weights }` to `project-docs/client-review/font-sources.json`, where `folder` is the Google Fonts OFL directory and `weights` is a CSS API axis specification. Run `node .agents/skills/create-nww-website/scripts/client-review/fetch-fonts.mjs .`. The helper downloads Latin WOFF2 files, OFL notices, and provenance into the review package. Normal preview and verification need no network. Reference these stylesheets through explicit `link` elements rather than nested relative `@import` rules, which can resolve incorrectly when accessibility tooling clones styles.

Keep reusable scripts and dependencies in the skill. Keep only site-specific review deliverables under `project-docs/client-review/`, and place supplementary Gate 2 reports and working notes in `gate-2-design-theory/_checks/`. The canonical design theory and router state remain at the paths required by the pipeline.

### Public Deployment & Deliverable Standards

- **Public Deployment Required**: The Gate 2 landing page variations and comparison hub will be sent directly to the client. A live public deployment (such as GitHub Pages via `.github/workflows/deploy-pages.yml` from `assets/client-review-pages.yml`) MUST always be used. **Forwarding localhost deployment links to the client is strictly forbidden.**
- **No Prompt Copying Section**: The review package is client-facing; do NOT include "copy the prompt" or "Copy My Decision" buttons designed for pasting into an AI assistant.
- **Technology Stack for Variations**: All Gate 2 landing page variation previews (`<variation-slug>/index.html`) MUST be built using **HTML + Tailwind CSS + jQuery** to save future tokens, minimize complexity, and ensure lightweight interactivity.
- **Repeating Cards Normal CSS Rule (Token Optimization)**: When generating variation HTML, if components such as cards, grid items, or list tiles repeat (e.g. 3–6 feature cards, service boxes), use **normal CSS** in a `<style>` block rather than repeating long inline Tailwind utility strings on every card. When ported downstream to Next.js `site/`, use Tailwind's **`@apply`** rule in `globals.css`.

Before presenting to the user for Gate 2 sign-off:
- [ ] Reference landing pages captured into `project-docs/design-references/<domain>/` (`page.html`, `content.md`, `screenshot-full-1440.png`, `capture.json`) as analysis inputs only.
- [ ] Reference capture ledger compiled in `project-docs/design-references/sources.md` starting with mandatory third-party usage notice (zero fabricated images, zero copied assets).
- [ ] Technical design theory authored to `project-docs/client-review/gate-2-design-theory/design-theory.md` (abstract principles, tokens, typography, motion, avoid list).
- [ ] $N$ full-page landing page variation previews (default 3) compiled to `project-docs/client-review/gate-2-design-theory/<variation-slug>/index.html` built using **HTML + Tailwind CSS + jQuery** featuring distinct architectural personalities, normal CSS for repeating cards, and real client content per [design-variations.md](design-variations.md).
- [ ] Pre-presentation similarity audit executed and report compiled to `project-docs/client-review/gate-2-design-theory/_checks/similarity-audit.md` confirming compliance with distance rules (zero shared classes/IDs, zero hotlinks, word overlap <= 5 words).
- [ ] Static review generator script executed (`node skills/create-nww-website/scripts/client-review/index.js`) to generate Gate 2 comparison hub (`gate-2-design-theory/index.html`) without prompt copy boxes.
- [ ] Public deployment live on GitHub Pages and verified accessible via HTTPS (no localhost links provided).
- [ ] `project-docs/router-state.md` updated to `Gate 2: Awaiting Client Decision Among Variations (via project-docs/client-review/gate-2-design-theory/index.html)`.
- [ ] Client decision confirmed before Gate 2 approval and Stage 3 initiation. (If revisions requested, update files directly in-place; do not create separate revision files. Record requirement notes in `client-requirements/`).
