# Protected Items Reference (NOT SLOP)

Comprehensive catalog of legitimate development artifacts, placeholder fixtures, and brand structures that MUST NEVER be deleted or altered by `anti-slop`.

---

## Protected Patterns & Preservation Rules

### 1. Image Placeholder Slot (`not-slop-image-placeholder-slot`)
* **Name**: Image Placeholder Slot
* **What it looks like**: Wireframe placeholder frames, visual containers, and mock showcase frames designed to display media assets once photography is available.
* **How to find it**: Elements with labels matching `IMAGE PLACEHOLDER`, `HERO VISUAL`, or media frame container classes.
* **Action**: DO NOT DELETE. Retain all placeholder slots and framing wrappers intact.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 2. Placeholder Inner Dimension & Figure Caption (`not-slop-placeholder-inner-caption`)
* **Name**: Placeholder Inner Dimension & Figure Caption
* **What it looks like**: Technical aspect ratio labels (`16 : 7`), figure indicators (`FIG. 01`), and corner metadata printed inside placeholder image frames.
* **How to find it**: Monospace text matching `\d+\s*:\s*\d+`, `FIG\.\s*\d+`, or `HERO VISUAL` situated inside placeholder containers.
* **Action**: DO NOT DELETE. Retain inner dimension markers and wireframe figure captions.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 3. Client & Partner Placeholder Box (`not-slop-client-placeholder-box`)
* **Name**: Client & Partner Placeholder Box
* **What it looks like**: Wireframe boxes labeled `CLIENT PLACEHOLDER 01..05` and associated introductory partner labels.
* **How to find it**: Grid items matching `CLIENT PLACEHOLDER \d+`.
* **Action**: DO NOT DELETE. Retain partner placeholder boxes for client asset population.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 4. Reserved Domain Placeholder Email (`not-slop-reserved-example-contact`)
* **Name**: Reserved Domain Placeholder Email
* **What it looks like**: Contact email addresses ending in IETF RFC 2606 reserved domains (e.g. `hello@*.example`, `contact@*.example.com`).
* **How to find it**: Email strings matching `[a-z0-9._%+-]+@[a-z0-9.-]+\.example\b`.
* **Action**: DO NOT DELETE. Reserved domain emails are intentional placeholders.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 5. Authentic Product Identity & Primary Description (`not-slop-real-product-identity`)
* **Name**: Authentic Product Identity & Primary Description
* **What it looks like**: Authentic product names, proprietary suite labels, and primary feature descriptions on cards and pages.
* **How to find it**: Product title elements, feature descriptions, and primary card copy.
* **Action**: DO NOT DELETE. Preserve core product naming and primary service explanations.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 6. Navigation Links & Interactive Behavior (`not-slop-navigation-links-behavior`)
* **Name**: Navigation Links & Interactive Behavior
* **What it looks like**: Primary navbar links, dropdown toggles, mobile drawer triggers, and routing paths.
* **How to find it**: `<nav>` and header links, toggle buttons, and dropdown route anchors.
* **Action**: DO NOT DELETE. Retain all navigation links, anchor destinations, and toggle controls.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 7. Next.js Dev-Mode Overlay Badge (`not-slop-dev-mode-badge`)
* **Name**: Next.js Dev-Mode Overlay Badge
* **What it looks like**: Small dark circular "N" badge appearing in the bottom corner of rendered development pages.
* **How to find it**: Injected by Next.js development server runtime (`next-route-announcer`, dev overlay); NOT present in repository source code.
* **Action**: DO NOT ATTEMPT TO DELETE FROM SOURCE. It does not exist in source code and disappears in production builds.
* **Keep when**: Always ignored.
* **Added YYYY-MM**: 2026-11

### 8. Accessibility Structure & Semantic Attributes (`not-slop-accessibility-structure`)
* **Name**: Accessibility Structure & Semantic Attributes
* **What it looks like**: Skip navigation links, `aria-*` attributes, focus visible outlines, and screen reader text.
* **How to find it**: Elements with `sr-only`, `aria-label`, `aria-expanded`, `skip-to-content`, `focus-visible:*`.
* **Action**: DO NOT DELETE. Maintain all accessible labels and keyboard focus affordances.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 9. Primary Header & Initial Viewport Hero CTA (`not-slop-primary-header-hero-cta`)
* **Name**: Primary Header & Initial Viewport Hero CTA
* **What it looks like**: The primary action button in the global navbar (e.g. "Start a Project") and the initial conversion button in the hero viewport.
* **How to find it**: Main header action button and initial hero button group.
* **Action**: DO NOT DELETE. Preserve the primary header CTA and hero CTA.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 10. Closing Inquiry Section (`not-slop-closing-inquiry-section`)
* **Name**: Closing Inquiry Section
* **What it looks like**: Dedicated pre-footer consultation banner or project inquiry form section.
* **How to find it**: The final content section preceding the footer containing contact/inquiry actions.
* **Action**: DO NOT DELETE. Retain the dedicated closing conversion section.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11

### 11. Legal Notices & Copyright Disclaimers (`not-slop-legal-and-copyright`)
* **Name**: Legal Notices & Copyright Disclaimers
* **What it looks like**: Copyright notices, privacy policy links, terms of service, and registered trademark notices.
* **How to find it**: Footer copyright lines (`© YYYY ...`) and legal anchor links.
* **Action**: DO NOT DELETE. Maintain all legal and regulatory content.
* **Keep when**: Always preserved.
* **Added YYYY-MM**: 2026-11
