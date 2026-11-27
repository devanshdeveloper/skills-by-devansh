# Visual Slop Reference

Catalog of generic visual decorations, gradient leftovers, and modern blueprint artifacts with their exact non-destructive removal rules.

---

## Patterns & Removal Rules

### 1. Mono-Caps Eyebrow Badge (`visual-mono-caps-eyebrow`)
* **Name**: Mono-Caps Eyebrow Badge
* **What it looks like**: Uppercase, wide-letter-spaced monospace pill badge or micro-label floating directly above a section headline, frequently paired with a status indicator dot (e.g. `SOFTWARE ENGINEERING & INDUSTRY PRODUCTS`).
* **How to find it**: Elements with `font-mono`, `uppercase`, `tracking-widest` or `tracking-wide`, `text-xs` or `text-[11px]`, `rounded-full`, and leading indicator dot spans.
* **Action**: Delete the eyebrow element entirely; the headline stands cleanly on its own.
* **Keep when**: Text is an active interactive filter, tab trigger, or form indicator.
* **Added YYYY-MM**: 2026-11

### 2. Numbered Section Eyebrow (`visual-numbered-eyebrow`)
* **Name**: Numbered Section Eyebrow
* **What it looks like**: Monospace numerical sequence kickers placed above section titles (e.g. `01 / INDUSTRIES WE SERVE`, `02 / SERVICES WE OFFER`, `03 / OUR PRODUCTS`).
* **How to find it**: Monospace text patterns matching `\b\d{2}\s*\/\s*[A-Z\s]+` in section header blocks.
* **Action**: Delete the sequence prefix string or delete the entire eyebrow element if it contains only the kicker.
* **Keep when**: Numbering represents a legal clause or strict ordered legal workflow.
* **Added YYYY-MM**: 2026-11

### 3. Card Index Number & Sequence Code (`visual-card-index-code`)
* **Name**: Card Index Number & Sequence Code
* **What it looks like**: Standalone two-digit numbers (`01`, `02`, `06`) or alphanumeric hardware-style codes (`P-01`, `P-04`) placed on card corners.
* **How to find it**: Monospace sequence strings or props (`indexCode`, `productCode`, `01..09`, `P-01..P-09`) positioned in card corners.
* **Action**: Delete the index element, span, or component prop.
* **Keep when**: The card is part of an explicitly ordered leaderboard or strictly chronological timeline.
* **Added YYYY-MM**: 2026-11

### 4. Metadata Category Tag Chip (`visual-metadata-tag-chip`)
* **Name**: Metadata Category Tag Chip
* **What it looks like**: Rectangular uppercase monospace badges or category chips anchored in top-right card corners (e.g. `CAMPAIGNS & ATTRIBUTION`, `ENGAGEMENT MODEL`).
* **How to find it**: Corner tags styled with `font-mono`, `text-[10px]` or `text-[11px]`, `uppercase`, `border`, `px-2 py-0.5`.
* **Action**: Delete the tag element or component prop.
* **Keep when**: Tag represents a live dynamic system status or interactive filter trigger.
* **Added YYYY-MM**: 2026-11

### 5. Meaningless Decorative Dot Meter (`visual-dot-meter`)
* **Name**: Meaningless Decorative Dot Meter
* **What it looks like**: Horizontal rows of small circular dots (e.g. three filled dots, three empty dots) placed under capability labels or footer column headers as faux hardware gauges.
* **How to find it**: Flex containers with `gap-1` or `gap-1.5` containing repeated small `w-1.5 h-1.5 rounded-full` spans with contrasting background opacities.
* **Action**: Delete the meter container element entirely.
* **Keep when**: Dots represent real interactive carousel pagination or step indicators.
* **Added YYYY-MM**: 2026-11

### 6. Two-Tone Caps Heading (`visual-two-tone-heading`)
* **Name**: Two-Tone Caps Heading
* **What it looks like**: Uppercase section headlines where the first word is styled in muted grey and subsequent words are in stark white (e.g. grey `ENGINEERING` + white `CAPABILITIES`, grey `BUILT FOR` + white `MODERN OPERATIONS`).
* **How to find it**: Headings containing nested `<span className="text-muted/gray/...">` followed by `<span className="text-white/foreground/...">`.
* **Action**: Remove the color modifier span wrappers; merge text into a single uniform heading inheriting parent color.
* **Keep when**: The heading represents a registered brand trademark with official dual-color styling.
* **Added YYYY-MM**: 2026-11

### 7. Ubiquitous Trailing Link Arrow (`visual-trailing-arrow-glyph`)
* **Name**: Ubiquitous Trailing Link Arrow
* **What it looks like**: Decorative arrow glyphs (`→`, `↗`, `arrow-up-right`) appended indiscriminately to every card link and navigation item.
* **How to find it**: Inline SVG icon components or Unicode arrow characters (`→`, `↗`) inside standard text links or card anchors.
* **Action**: Delete the arrow icon component or glyph; preserve the clean text link.
* **Keep when**: The arrow is an accessibility indicator explicitly indicating an external off-site link.
* **Added YYYY-MM**: 2026-11

### 8. Circled Arrow Button Pill (`visual-circled-arrow-pill`)
* **Name**: Circled Arrow Button Pill
* **What it looks like**: Nested white or high-contrast circular pill containing an arrow icon embedded inside a main action button.
* **How to find it**: Buttons containing a child `<span className="rounded-full bg-white ...">` wrapping an arrow icon.
* **Action**: Delete the nested circular arrow span; retain clean, readable button text.
* **Keep when**: The button is an icon-only circular control without accompanying text.
* **Added YYYY-MM**: 2026-11

### 9. Page-Framing Vertical Hairline Rail (`visual-hairline-framing-rail`)
* **Name**: Page-Framing Vertical Hairline Rail
* **What it looks like**: Full-height vertical borders (`border-x border-[#...]`) framing the main page container to simulate an architectural blueprint.
* **How to find it**: Outer page or layout container divs styled with `border-x border-neutral-*` or `border-x border-white/*`.
* **Action**: Remove the `border-x` utility classes from the layout container.
* **Keep when**: The border separates a distinct permanent sidebar navigation from the main content viewport.
* **Added YYYY-MM**: 2026-11

### 10. Gradient Text Clipping (`visual-gradient-text`)
* **Name**: Gradient Text Clipping
* **What it looks like**: Utility classes clipping background gradients into headline text (`bg-clip-text text-transparent bg-gradient-to-...`).
* **How to find it**: Elements with `bg-clip-text text-transparent` paired with `bg-gradient-to-*`.
* **Action**: Delete `bg-clip-text`, `text-transparent`, and gradient generator classes (`bg-gradient-to-[a-z]+`, `from-*`, `to-*`, `via-*`).
* **Keep when**: Text is a verified brand logo mark.
* **Added YYYY-MM**: 2026-11

### 11. Default Indigo/Purple Gradient Background (`visual-purple-gradient`)
* **Name**: Default Indigo/Purple Gradient Background
* **What it looks like**: Cookie-cutter purple-to-indigo or violet decorative backdrop gradients (`from-purple-* to-indigo-*`, `from-violet-*`).
* **How to find it**: Section wrappers matching `bg-gradient-to-[a-z]+` with purple, indigo, or violet stops.
* **Action**: Strip the gradient utility classes from the section or wrapper element.
* **Keep when**: Gradient is the official registered brand background theme.
* **Added YYYY-MM**: 2026-11

### 12. Decorative Glow Blob & Ambient Orb (`visual-glow-blob`)
* **Name**: Decorative Glow Blob & Ambient Orb
* **What it looks like**: Floating, absolutely positioned circular divs with extreme blur (`blur-3xl`, `blur-2xl`), low opacity, and `pointer-events-none`.
* **How to find it**: Elements matching `<(div|span) ... blur-(2xl|3xl) pointer-events-none absolute ...>`.
* **Action**: Delete the decorative glow container element entirely.
* **Keep when**: Element is a functional modal backdrop overlay.
* **Added YYYY-MM**: 2026-11

### 13. Blanket Glassmorphism Surface (`visual-glassmorphism`)
* **Name**: Blanket Glassmorphism Surface
* **What it looks like**: Indiscriminate layering of `backdrop-blur-*`, translucent white or dark backgrounds (`bg-white/10`, `bg-black/20`), and hairline translucent borders.
* **How to find it**: Containers combining `backdrop-blur-*` with translucent background and border classes.
* **Action**: Delete `backdrop-blur-*` and translucent background/border classes; fall back to standard solid card surface.
* **Keep when**: Element is a sticky navigation bar requiring background blur on scroll.
* **Added YYYY-MM**: 2026-11

### 14. Raw Emoji Used as Icon Stand-in (`visual-emoji-icon`)
* **Name**: Raw Emoji Used as Icon Stand-in
* **What it looks like**: Raw Unicode emoji glyphs (`🚀`, `✨`, `💡`, `🔥`, `⚡`) placed inside feature headers, buttons, or list bullets.
* **How to find it**: Buttons, headings, or list items starting with emoji Unicode ranges.
* **Action**: Delete emoji glyph; keep text intact (or list under Needs a Human if an icon is required).
* **Keep when**: Emoji is part of user-generated content or interactive chat messages.
* **Added YYYY-MM**: 2026-11

### 15. Stacked Heavy Shadow & Extreme Radius (`visual-stacked-radius-shadow`)
* **Name**: Stacked Heavy Shadow & Extreme Radius
* **What it looks like**: Simultaneous application of heavy drop shadows (`shadow-2xl`, `shadow-xl`) and extreme rounding (`rounded-2xl`, `rounded-3xl`) across every card or button.
* **How to find it**: Cards matching `rounded-(2xl|3xl)` paired with `shadow-(2xl|xl)`.
* **Action**: Strip the heavy shadow class (`shadow-2xl`, `shadow-xl`). Retain standard border radius.
* **Keep when**: Card is an active floating modal dialog or popover.
* **Added YYYY-MM**: 2026-11

### 16. Gratuitous Hover Lift/Scale on Static Cards (`visual-hover-lift`)
* **Name**: Gratuitous Hover Lift/Scale on Static Cards
* **What it looks like**: `hover:-translate-y-1`, `hover:scale-105`, and `transition-all` placed on informational, non-clickable card containers.
* **How to find it**: Non-interactive container divs combining hover transforms with transition utilities.
* **Action**: Remove hover transformation and transition classes.
* **Keep when**: Element is an interactive clickable link, button, or draggable card.
* **Added YYYY-MM**: 2026-11

### 17. Purposeless Infinite Marquee (`visual-marquee`)
* **Name**: Purposeless Infinite Marquee
* **What it looks like**: Infinite scrolling text or logo marquees that endlessly loop duplicate items with zero user control.
* **How to find it**: Elements matching `animate-marquee` or `<marquee>` without pause controls.
* **Action**: Delete the marquee container element.
* **Keep when**: Marquee is an accessible carousel with explicit pause and navigation controls.
* **Added YYYY-MM**: 2026-11
