# Structural Slop Reference

Catalog of unrequested, fabricated, or template-driven page sections and structural artifacts with their exact removal actions.

---

## Patterns & Removal Rules

### 1. Horizontal Middle-Dot Stat Strip (`structure-horizontal-dot-stat-strip`)
* **Name**: Horizontal Middle-Dot Stat Strip
* **What it looks like**: Inline monospace ribbon stringing category counts together with middle dots (e.g. `4 CORE INDUSTRIES · 6 ENGINEERING SERVICES · 4 PROPRIETARY PRODUCTS`).
* **How to find it**: Monospace text matching `\d+\s+[A-Z\s]+\s+·\s+\d+\s+[A-Z\s]+` in hero or section dividers.
* **Action**: Delete the stat strip element entirely.
* **Keep when**: Text is a functional breadcrumb navigation strip or metadata timestamp row.
* **Added YYYY-MM**: 2026-11

### 2. In-Grid CTA Accent Tile (`structure-in-grid-cta-tile`)
* **Name**: In-Grid CTA Accent Tile
* **What it looks like**: A high-contrast colored tile (e.g. vibrant blue or dark accent) injected inside a product or service card grid to repeat an inquiry or sales CTA.
* **How to find it**: Grid children with high-contrast accent backgrounds containing repeated action buttons (e.g. "Ready to Scope a Build", "Start a Project").
* **Action**: Delete the accent CTA tile component from the grid.
* **Keep when**: The grid contains fewer than 3 items total and serves as the primary contact section.
* **Added YYYY-MM**: 2026-11

### 3. Footer Promo CTA Cell (`structure-footer-promo-cta-cell`)
* **Name**: Footer Promo CTA Cell
* **What it looks like**: A prominent inquiry banner or high-contrast promo card embedded directly inside the footer columns repeating the main conversion prompt.
* **How to find it**: Card containers inside `<footer>` elements styled with accent backgrounds and duplicate inquiry buttons ("READY TO BUILD", "Start a Project").
* **Action**: Delete the footer promo CTA cell; retain clean directory links and legal columns.
* **Keep when**: The page has no other contact link or inquiry form anywhere.
* **Added YYYY-MM**: 2026-11

### 4. Nav Dropdown Offering Counter (`structure-dropdown-offering-counter`)
* **Name**: Nav Dropdown Offering Counter
* **What it looks like**: Monospace offering counts placed in dropdown taxonomy headers (e.g. `01 / INDUSTRIES` with `4 offerings`).
* **How to find it**: Spans inside navigation dropdown headers matching `\d+\s+offerings` or `\d+\s+items`.
* **Action**: Delete the offering counter span.
* **Keep when**: Count represents dynamic live search or filtered catalog results.
* **Added YYYY-MM**: 2026-11

### 5. Duplicate Taxonomy Summaries in Secondary Chrome (`structure-duplicate-taxonomy-summary`)
* **Name**: Duplicate Taxonomy Summaries in Secondary Chrome
* **What it looks like**: Identical descriptive paragraphs from primary product/industry cards copied verbatim into navigation dropdown menus and footer directory columns.
* **How to find it**: Shared data objects or components passing `description` or `summary` props into secondary nav panels and footer columns.
* **Action**: Remove descriptive summary calls in secondary nav panels and footers; preserve all links, names, and structural hierarchy intact.
* **Keep when**: The dropdown or footer column contains no title text and relies exclusively on the description for context.
* **Added YYYY-MM**: 2026-11

### 6. Redundant Stacked CTA Buttons (`structure-duplicate-cta`)
* **Name**: Redundant Stacked CTA Buttons
* **What it looks like**: Identical primary CTA buttons ("Get Started", "Start a Project") repeated consecutively back-to-back within the same viewport.
* **How to find it**: Containers rendering consecutive matching CTA anchors or buttons.
* **Action**: Delete the duplicate secondary CTA element, preserving the single clean button.
* **Keep when**: Buttons have distinct actions (e.g. primary action "Start a Project" vs. secondary link "Explore Capabilities").
* **Added YYYY-MM**: 2026-11

### 7. Invented Stat & Metric Bar (`structure-invented-stats`)
* **Name**: Invented Stat & Metric Bar
* **What it looks like**: Fabricated metric counters and statistical claims generated without customer backing (e.g. "99.9% Satisfaction", "10M+ Users", "500k+ Downloads").
* **How to find it**: Sections matching `<(div|section) ... stats?|metrics? ...>` with fabricated percentage or metric strings.
* **Action**: Delete the entire statistics section or component block. Never invent or estimate real numbers.
* **Keep when**: Metrics represent verified, documented analytics or real SLA commitments.
* **Added YYYY-MM**: 2026-11

### 8. Fake Testimonials & Stock Personas (`structure-fake-testimonials`)
* **Name**: Fake Testimonials & Stock Personas
* **What it looks like**: Generic testimonial grids featuring stock names ("Sarah Jenkins", "John Doe"), placeholder executive titles ("Founder & CEO at TechCorp"), and generic praise quotes.
* **How to find it**: Testimonial card components populated with stock executive titles and generic praise.
* **Action**: Delete the fake testimonial section or quote cards.
* **Keep when**: Testimonials contain verified customer quotes with authorized client attribution.
* **Added YYYY-MM**: 2026-11

### 9. Fake Client Logo Marquees & Bars (`structure-fake-logos`)
* **Name**: Fake Client Logo Marquees & Bars
* **What it looks like**: Logo bars labeled "Trusted by industry leaders" or "Featured in Fortune 500" populated by dummy SVG shapes or fictional company names.
* **How to find it**: Containers labeled "Trusted by" or "Featured in" with generic filler SVGs.
* **Action**: Delete the fake logo bar component.
* **Keep when**: Logos represent real clients with verified permission.
* **Added YYYY-MM**: 2026-11

### 10. Cookie-Cutter How-It-Works Sections (`structure-filler-how-it-works`)
* **Name**: Cookie-Cutter How-It-Works Sections
* **What it looks like**: Unrequested formulaic 3-step cards ("Step 1: Sign Up", "Step 2: Connect / Configure", "Step 3: Grow / Launch").
* **How to find it**: Sections containing 3 cards matching Step 1/2/3 onboarding clichés.
* **Action**: Delete the 3-step filler section.
* **Keep when**: Product is an actual SaaS onboarding flow with strict sequential setup requirements.
* **Added YYYY-MM**: 2026-11
