# Structural Slop Reference

Catalog of unrequested, fabricated, or template-driven page sections and structural artifacts with their exact removal actions.

---

## Patterns & Removal Rules

### 1. Invented Stat & Metric Bars (`structure-invented-stats`)
* **Detection**: Fabricated metric counters and statistical claims generated without customer backing (e.g., "99.9% Satisfaction Rate", "10M+ Global Users", "500k+ Active Downloads", "50M+ Operations").
* **Rule**: Delete the entire statistics section or component block. Never invent or estimate real numbers.

### 2. Fake Testimonials & Stock Personas (`structure-fake-testimonials`)
* **Detection**: Generic testimonial grids featuring stock names ("Sarah Jenkins", "John Doe", "Jane Smith"), placeholder executive titles ("Founder & CEO at TechCorp", "VP of Operations"), and generic praise quotes.
* **Rule**: Delete the testimonial section or individual fake quote cards.

### 3. Fake Client Logo Marquees & Bars (`structure-fake-logos`)
* **Detection**: Logo bars labeled "Trusted by industry leaders" or "Featured in Fortune 500" populated by dummy SVG shapes or fictional company names.
* **Rule**: Delete the fake logo bar component.

### 4. Cookie-Cutter How-It-Works Sections (`structure-filler-how-it-works`)
* **Detection**: Unrequested formulaic 3-step cards stating obvious onboarding clichés:
  * "Step 1: Sign Up"
  * "Step 2: Connect / Configure"
  * "Step 3: Grow / Launch"
* **Rule**: Delete the 3-step filler section.

### 5. Redundant Stacked CTA Buttons (`structure-duplicate-cta`)
* **Detection**: Identical primary CTA buttons ("Get Started", "Start Free Trial") repeated consecutively within the same viewport or banner.
* **Rule**: Delete the duplicate secondary CTA element, preserving the single clean button.
