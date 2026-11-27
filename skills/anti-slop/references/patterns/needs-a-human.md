# Human Review Boundary Reference (NEEDS A HUMAN)

Catalog of AI website slop patterns that CANNOT be resolved by pure deletion alone and must be logged under "Needs a Human" in the report.

---

## Operating Rule
This skill enforces a **strict remove-only rule**:
- Never rewrite or regenerate text.
- Never author new layout components.
- Never add replacement styles or icons.

When a flagged pattern cannot be resolved by cleanly deleting an element or removing a utility class without breaking grammar, leaving an empty button, or distorting parent grid alignment, **leave the code untouched** and log the exact `file:line` under "Needs a Human" with an objective reason.

---

## Patterns & Flagging Rules

### 1. Stock-Phrase Headline (`human-stock-phrase-headline`)
* **Name**: Stock-Phrase Headline
* **What it looks like**: Primary `<h1>` or `<h2>` headings containing operational clichés (e.g. `"Software engineered for operations, built to scale."`).
* **How to find it**: Main headline tags containing idioms like "built to scale", "ready to deploy", "designed for the future".
* **Action**: DO NOT DELETE. Flag under Needs a Human. Deleting words breaks headline grammar; rewriting or replacing words is forbidden.
* **Keep when**: Requires human copywriter to provide authentic company positioning.
* **Added YYYY-MM**: 2026-11

### 2. Identical Card-Grid Architecture (`human-identical-grid-architecture`)
* **Name**: Identical Card-Grid Architecture
* **What it looks like**: Symmetrical 2x2 or 4x1/4x2 card grid layouts repeated mechanically across consecutive page sections (e.g. identical grid in Services, Products, and Industries).
* **How to find it**: Multiple sections using the exact same grid column counts, gap utilities, and card wrapper aspect ratios.
* **Action**: DO NOT DELETE. Flag under Needs a Human. Structural redesign requires authoring new layout components, which violates the remove-only constraint.
* **Keep when**: Requires human designer to introduce intentional layout variation (e.g. list, table, or alternating showcase).
* **Added YYYY-MM**: 2026-11

### 3. Repeated Section-Header Layout Template (`human-repeated-section-header-layout`)
* **Name**: Repeated Section-Header Layout Template
* **What it looks like**: Uniform section header formula repeated on every block: micro-eyebrow + large left heading + right-aligned muted description paragraph.
* **How to find it**: Consecutive sections implementing identical two-column header flex/grid splits.
* **Action**: DO NOT DELETE. Flag under Needs a Human. Modifying section header architecture requires custom layout design.
* **Keep when**: Requires human designer to vary section header rhythms.
* **Added YYYY-MM**: 2026-11

### 4. Missing Icon Replacement on Functional Button (`human-missing-icon-replacement`)
* **Name**: Missing Icon Replacement on Functional Button
* **What it looks like**: Interactive button or control where a raw emoji glyph was used as the sole visual affordance (e.g. `<button>🔍</button>`).
* **How to find it**: Buttons where stripping the emoji leaves an empty element without text.
* **Action**: DO NOT DELETE. Flag under Needs a Human. Replacing the emoji with a purposeful SVG icon requires adding new assets, which violates the remove-only constraint.
* **Keep when**: Requires developer to select, import, and style a legitimate SVG icon from the project's icon library.
* **Added YYYY-MM**: 2026-11

### 5. Broken Layout Dependency (`human-broken-layout-dependency`)
* **Name**: Broken Layout Dependency
* **What it looks like**: A candidate slop element whose deletion would leave an empty parent flex/grid cell, causing adjacent items to collapse or misalign.
* **How to find it**: Structural deletions that cause CSS grid child counts to become unbalanced.
* **Action**: DO NOT DELETE. Flag under Needs a Human. Re-aligning parent container dimensions requires manual CSS adjustments.
* **Keep when**: Requires developer to adjust grid track definitions or flex basis values.
* **Added YYYY-MM**: 2026-11
