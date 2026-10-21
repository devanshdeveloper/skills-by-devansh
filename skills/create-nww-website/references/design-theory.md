# Design Theory & Visual System Specification

Stage 2 establishes the aesthetic foundation of the website. Before any layouts or code are written, the design theory codifies the color palette, typography system, spatial tokens, dual motion tokens, voice & tone, and visual hierarchy.

The deliverable is saved to `project-docs/design-theory.md`.

---

## Prerequisites & Taste Skill Activation

When entering Stage 2:
1. **Live-Fetch Reference Sites:** For every URL the client shares (liked or disliked), retrieve and read the live page using web-fetch. Never rely on memory or generic assumptions.
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
  *These tokens are exported directly into `site/lib/motion.js` during Stage 9.*
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
| Website URL | What Client Liked | Key Observed Elements | Carried Into Direction? |
|---|---|---|---|
| `https://example.com` | "Clean typography" | Editorial serif, 80ch reading column | Yes (Adopted serif heading scale) |

---

## Gate 2 Review Checklist

Before presenting to the user for Gate 2 sign-off:
- [ ] Reference URLs fetched live before drawing conclusions.
- [ ] Taste skill verified or built-in taste rules applied.
- [ ] Voice & tone section establishes clear, binding copywriting rules.
- [ ] Design tokens include exact hex values, modular type scale, and tap targets >= 44px.
- [ ] Motion tokens specified in dual format (CSS variable + GSAP easing/duration).
- [ ] Explicit "What to Avoid" list defined.
- [ ] User approves `project-docs/design-theory.md` before initiating Stage 3.
