# Copy Slop Reference

Catalog of generic AI copywriting tropes, rhythmic crutches, and filler padding with their exact removal actions.

---

## Core Invariant: Pure Deletion
Never rewrite or paraphrase a flagged sentence. Never substitute a buzzword for an alternate adjective. Either delete the specific buzzword/adverb, delete the filler clause, or delete the entire hollow sentence. If removing a phrase leaves a grammatically broken statement requiring new domain copy, leave it untouched and log it under "Needs a Human".

**Approved Punctuation Swap Exception**:
For em-dashes (`—`) inside body prose, replacing the dash with clean punctuation (a comma `,`, period `.`, or plain space) is explicitly approved. Zero replacement words may be introduced.

---

## Patterns & Removal Rules

### 1. Solitary Em Dash in Body Prose (`copy-solitary-em-dash`)
* **Name**: Solitary Em Dash in Body Prose
* **What it looks like**: A single em-dash (`—`) used inside a sentence to create synthetic literary cadence (e.g. `and Education—alongside our four dedicated software products`).
* **How to find it**: Search for `[^\s]—[^\s]` or `\s*—\s*` within body paragraphs and description text.
* **Action**: Replace the em-dash with a comma `,`, period `.`, or plain space. Do not add or rewrite any words.
* **Keep when**: The em-dash appears inside an authentic direct quote or an officially registered book/product title.
* **Added YYYY-MM**: 2026-11

### 2. Em-Dash Cluster (`copy-em-dash-cluster`)
* **Name**: Em-Dash Cluster
* **What it looks like**: Two or more em-dashes (`—`) or spaced hyphens within a single paragraph or sentence cluster, used as a rhythmic crutch.
* **How to find it**: Blocks containing multiple `—` characters or alternating hyphens.
* **Action**: Convert parenthetical dashes to commas or periods; delete decorative dashes.
* **Keep when**: Text is a direct attributed legal citation.
* **Added YYYY-MM**: 2026-11

### 3. Engineering & Operational Stock Phrases (`copy-engineering-stock-phrases`)
* **Name**: Engineering & Operational Stock Phrases
* **What it looks like**: Clichéd operational and engineering filler phrases substituting for verifiable technical specifications (e.g. `built to scale`, `ready to deploy`, `real operational domains`, `clean architecture`, `transparent milestones`, `full source ownership`, `disciplined cadence`).
* **How to find it**: Prose blocks containing the exact stock phrase strings.
* **Action**: Delete the stock phrase or filler sentence. If the phrase is embedded inside a headline where deletion breaks grammar, list under Needs a Human.
* **Keep when**: Text explains a specific verifiable technical implementation detail (e.g. quoting an explicit architecture contract).
* **Added YYYY-MM**: 2026-11

### 4. Mono-Caps Manifesto Tagline (`copy-mono-caps-manifesto-tagline`)
* **Name**: Mono-Caps Manifesto Tagline
* **What it looks like**: Uppercase, wide-letter-spaced engineering slogans placed in hero banners or footers (e.g. `EVERY SYSTEM FOLLOWS CLEAN ARCHITECTURE, NOTHING GETS MISSED`, `DEDICATED SOLUTIONS ACROSS INDUSTRIES, ENGINEERING SERVICES, AND PROPRIETARY PRODUCTS`).
* **How to find it**: Monospace uppercase text strings longer than 20 characters matching `font-mono.*uppercase.*tracking`.
* **Action**: Delete the tagline element entirely.
* **Keep when**: Tagline is a legally registered corporate trademark or company motto.
* **Added YYYY-MM**: 2026-11

### 5. Throat-Clearing Opener (`copy-throat-clearing`)
* **Name**: Throat-Clearing Opener
* **What it looks like**: Formulaic introductory phrases before stating the actual point (e.g. "In today's fast-paced digital world...", "It's worth noting that...", "When it comes to...", "In the realm of...", "At the end of the day...", "Needless to say...").
* **How to find it**: Sentences starting with `\b(?:In today's|It's worth noting that|When it comes to|At the end of the day|In the realm of|Needless to say)\b`.
* **Action**: Delete opening filler clause; lead directly with the core claim.
* **Keep when**: Text is a historical essay or narrative transcript.
* **Added YYYY-MM**: 2026-11

### 6. Inflated Marketing Hype Verbs & Buzzwords (`copy-hype-verbs`)
* **Name**: Inflated Marketing Hype Verbs & Buzzwords
* **What it looks like**: Overused AI buzzwords substituting for concrete product capabilities (e.g. "unleash", "supercharge", "elevate", "harness", "empower", "revolutionize", "seamlessly", "game-changer", "cutting-edge", "transformative", "unlock the power of").
* **How to find it**: Prose matching `\b(?:unleash|supercharge|elevate|harness|empower|revolutionize|seamlessly|game-changer|cutting-edge|transformative)\b`.
* **Action**: Delete hype adjective/adverb, or delete the filler sentence.
* **Keep when**: Term is a literal technical command (e.g. test harness).
* **Added YYYY-MM**: 2026-11

### 7. Metaphor Inflation (`copy-metaphor-inflation`)
* **Name**: Metaphor Inflation
* **What it looks like**: Pretentious conceptual nouns used to manufacture artificial depth (e.g. "tapestry", "beacon", "testament to", "symphony of", "realm of", "delve into").
* **How to find it**: Prose matching `\b(?:tapestry|beacon|testament to|symphony of|realm of|delve)\b`.
* **Action**: Delete inflated metaphor clause or delete sentence.
* **Keep when**: Metaphor is part of an official creative book or project title.
* **Added YYYY-MM**: 2026-11

### 8. Assistant Boilerplate Leftovers (`copy-assistant-boilerplate`)
* **Name**: Assistant Boilerplate Leftovers
* **What it looks like**: Conversational artifacts from AI chat prompts left in source files (e.g. "Certainly!", "Here is the component...", "In conclusion,", "I hope this helps", "Feel free to reach out").
* **How to find it**: Text matching `\b(?:Certainly!|Here is the component|In conclusion,|I hope this helps|Feel free to reach out)\b`.
* **Action**: Delete the entire conversational artifact line.
* **Keep when**: Text is part of an explicit interactive AI chat simulator demo.
* **Added YYYY-MM**: 2026-11

### 9. Telegraphed Binary Reversal (`copy-telegraphed-reversal`)
* **Name**: Telegraphed Binary Reversal
* **What it looks like**: Formulaic "It's not just X, it's Y" or "Not only X, but also Y" synthetic depth patterns.
* **How to find it**: Text matching `\b(?:It'?s not just [^.,;\n]+,?\s+it'?s\b|Not only [^.,;\n]+,?\s+but (?:also )?)\b`.
* **Action**: Delete negative framing setup clause; state the direct claim once.
* **Keep when**: Comparison contrasts two literal competing technical specifications.
* **Added YYYY-MM**: 2026-11

### 10. Hollow Generic Subhead (`copy-hollow-subhead`)
* **Name**: Hollow Generic Subhead
* **What it looks like**: Vague, low-specificity subheadings repeated on boilerplate landing pages (e.g. "Built for the future", "Designed for scale", "Next-generation solution", "Empowering teams worldwide").
* **How to find it**: Paragraphs or heading elements matching canned filler phrases.
* **Action**: Delete the hollow subhead tag entirely.
* **Keep when**: Subhead contains verified quantitative performance metrics.
* **Added YYYY-MM**: 2026-11

### 11. Lorem Ipsum & Dummy Text (`copy-lorem-ipsum`)
* **Name**: Lorem Ipsum & Dummy Text
* **What it looks like**: Template dummy text left behind in components or content files (`Lorem ipsum dolor sit amet...`).
* **How to find it**: Text matching `\b(?:Lorem ipsum dolor sit amet|consectetur adipiscing elit)\b`.
* **Action**: Delete placeholder text block; log under Needs a Human if content is required.
* **Keep when**: File is an explicit test fixture or storybook template.
* **Added YYYY-MM**: 2026-11
