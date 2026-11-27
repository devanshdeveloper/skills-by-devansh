// Visual slop rules: generic gradients, decorative glows, blanket glass, emoji icons, stacked decorations,
// and 2025/2026 blueprint artifacts (mono-caps eyebrows, sequence kickers, dot meters, two-tone headings, rails)
export const visualRules = [
  // --- Modern Blueprint & Technical Tells ---
  {
    id: 'visual-mono-caps-eyebrow',
    category: 'visual',
    name: 'Mono-Caps Eyebrow Badge',
    description: 'Uppercase wide-tracked monospace pill or micro-label floating directly above a headline with status dot',
    pattern: /<(?:div|span|p)[^>]*\b(?:font-mono[^"'>\n]*(?:tracking-wide|tracking-widest)|uppercase[^"'>\n]*font-mono|tracking-widest[^"'>\n]*uppercase)[^>]*>\s*(?:<(?:span|div)[^>]*\brounded-full\b[^>]*><\/(?:span|div)>\s*)?[A-Z0-9\s&/·-]{4,}<\/(?:div|span|p)>/gi,
    action: 'Delete the decorative eyebrow container element; headline stands cleanly on its own'
  },
  {
    id: 'visual-numbered-eyebrow',
    category: 'visual',
    name: 'Numbered Section Eyebrow',
    description: 'Monospace sequence kicker prefix (e.g. 01 / INDUSTRIES WE SERVE) placed above section titles',
    pattern: /\b\d{2}\s*\/\s*[A-Z\s]{3,}\b/g,
    action: 'Delete the sequence prefix string or eyebrow element'
  },
  {
    id: 'visual-card-index-code',
    category: 'visual',
    name: 'Card Index Number & Sequence Code',
    description: 'Standalone two-digit numbers (01-09) or hardware-style codes (P-01..P-09) on card corners',
    pattern: /(?:(?:indexCode|productCode|stepCode)\s*:\s*['"](?:0[1-9]|P-0[1-9])['"]|<(?:span|div)[^>]*\bfont-mono\b[^>]*>\s*(?:0[1-9]|P-0[1-9])\s*<\/(?:span|div)>)/gi,
    action: 'Delete the index element, span, or code property'
  },
  {
    id: 'visual-metadata-tag-chip',
    category: 'visual',
    name: 'Metadata Category Tag Chip',
    description: 'Uppercase monospace category chip or badge anchored in card corners',
    pattern: /<(?:span|div)[^>]*\b(?:font-mono[^"'>\n]*text-\[1[01]px\]|text-\[1[01]px\][^"'>\n]*uppercase|font-mono[^"'>\n]*uppercase)[^>]*>\s*(?:CAMPAIGNS|INVENTORY|PRODUCTION|CAMPUS|OPERATIONS|INSTITUTION|AGENCY|CONTENT|ENGAGEMENT MODEL)[A-Z\s&/-]*<\/(?:span|div)>/gi,
    action: 'Delete the category tag chip element'
  },
  {
    id: 'visual-dot-meter',
    category: 'visual',
    name: 'Decorative Dot Meter',
    description: 'Horizontal rows of circular indicator dots under capability labels or footer column headers',
    pattern: /<(?:div|span)[^>]*\b(?:gap-1\.5|gap-1)\b[^>]*>\s*(?:<(?:span|div)[^>]*\brounded-full\b[^>]*><\/(?:span|div)>\s*){2,}<\/(?:div|span)>/gi,
    action: 'Delete the decorative meter container element entirely'
  },
  {
    id: 'visual-two-tone-heading',
    category: 'visual',
    name: 'Two-Tone Caps Heading',
    description: 'Headings where the first word is styled in muted grey and subsequent words in white/foreground',
    pattern: /<h[1-6][^>]*>[\s\S]*?<span[^>]*\btext-(?:muted|gray-[0-9]+|neutral-[0-9]+|\[#[0-9a-fA-F]+\])[^>]*>[\s\S]*?<\/span>[\s\S]*?<span[^>]*\btext-(?:white|foreground|neutral-[0-9]+|\[#[0-9a-fA-F]+\])[^>]*>[\s\S]*?<\/span>[\s\S]*?<\/h[1-6]>/gi,
    action: 'Remove the color modifier spans; merge into a single heading inheriting base text color'
  },
  {
    id: 'visual-trailing-arrow-glyph',
    category: 'visual',
    name: 'Ubiquitous Trailing Link Arrow',
    description: 'Trailing arrow glyphs (→, ↗, arrow-up-right) appended indiscriminately to standard text links',
    pattern: /<(?:a|Link)[^>]*>[^<]*(?:→|↗|&rarr;|&nearr;|<\s*(?:ArrowUpRight|MoveRight|ArrowRight)[^>]*\/?>)[^<]*<\/(?:a|Link)>/gi,
    action: 'Delete trailing arrow icon or glyph; retain clean link text'
  },
  {
    id: 'visual-circled-arrow-pill',
    category: 'visual',
    name: 'Circled Arrow Button Pill',
    description: 'Nested circular white pill containing an arrow icon embedded inside a main action button',
    pattern: /<(?:button|a)[^>]*>[\s\S]*?<span[^>]*\brounded-full\s+bg-white\b[^>]*>[\s\S]*?<\/(?:button|a)>/gi,
    action: 'Delete nested circular icon span; preserve clean button text'
  },
  {
    id: 'visual-hairline-framing-rail',
    category: 'visual',
    name: 'Page-Framing Vertical Hairline Rail',
    description: 'Full-height border-x styling framing the layout container to simulate a blueprint grid',
    pattern: /\bborder-x\s+(?:border-(?:neutral|gray|zinc|white|\[#[0-9a-fA-F]+\])[^\s"'>]*)/gi,
    action: 'Remove border-x utility classes from outer layout container'
  },

  // --- Foundational Visual Tells ---
  {
    id: 'visual-gradient-text',
    category: 'visual',
    name: 'Gradient Text Clipping',
    description: 'Text gradient clipping classes creating generic rainbow or purple-blue text',
    pattern: /\b(?:bg-clip-text|text-transparent)\s+[^"'>\n]*(?:bg-gradient-to-[a-z]+|from-[a-z]+-[0-9]+)[^"'>\n]*/gi,
    action: 'Delete gradient and clipping utility classes; inherit parent text color'
  },
  {
    id: 'visual-purple-gradient',
    category: 'visual',
    name: 'Default Indigo/Purple Gradient Background',
    description: 'Overused purple-to-indigo or violet decorative background gradients',
    pattern: /\bbg-gradient-to-[a-z]+\s+(?:from-(?:purple|indigo|violet)-[0-9]+\s+to-(?:indigo|purple|blue|violet)-[0-9]+)/gi,
    action: 'Delete decorative gradient classes; revert to clean surface background'
  },
  {
    id: 'visual-glow-blob',
    category: 'visual',
    name: 'Decorative Glow Blob / Ambient Orb',
    description: 'Abstract blurred ambient color blob divs layered purely for background decoration',
    pattern: /<(?:div|span)[^>]*\b(?:blur-(?:2xl|3xl)|rounded-full\s+opacity-(?:10|20|30)|pointer-events-none\s+absolute\s+[^"'>\n]*blur)[^>]*>[\s\S]*?<\/(?:div|span)>/gi,
    action: 'Delete the decorative glow container element entirely'
  },
  {
    id: 'visual-glassmorphism',
    category: 'visual',
    name: 'Blanket Glassmorphism Surface',
    description: 'Translucent background paired with backdrop blur and semi-transparent white borders',
    pattern: /\b(?:backdrop-blur-(?:sm|md|lg|xl|2xl|3xl))\s+[^"'>\n]*(?:bg-(?:white|black)\/(?:5|10|20|30)|border-(?:white|black)\/(?:10|20|30))/gi,
    action: 'Remove backdrop blur and translucent overlay classes; fall back to standard solid card surface'
  },
  {
    id: 'visual-emoji-icon',
    category: 'visual',
    name: 'Raw Emoji Used as Icon Stand-in',
    description: 'Raw emoji glyphs substituted for intentional UI icons inside buttons, badges, or feature cards',
    pattern: /(?:<(?:button|span|h[1-6]|p|div)[^>]*>)\s*([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])\s*(?:[A-Za-z0-9])/gu,
    action: 'Delete emoji glyph; keep text intact (or list under Needs a Human if an icon is required)'
  },
  {
    id: 'visual-stacked-radius-shadow',
    category: 'visual',
    name: 'Stacked Heavy Shadow and Extreme Radius',
    description: 'Simultaneous heavy elevation shadow and extreme border radius stacked on standard cards',
    pattern: /\b(?:rounded-(?:2xl|3xl))\s+[^"'>\n]*\b(?:shadow-(?:2xl|xl))\b|\b(?:shadow-(?:2xl|xl))\s+[^"'>\n]*\b(?:rounded-(?:2xl|3xl))\b/gi,
    action: 'Remove heavy shadow utility classes; retain subtle base border/radius'
  },
  {
    id: 'visual-announcement-pill',
    category: 'visual',
    name: 'Generic Floating Announcement Pill',
    description: 'Decorative floating pill badge displaying generic "AI-Powered", "New", or "Beta" labels',
    pattern: /<(?:div|span|a)[^>]*\b(?:rounded-full\s+border\s+[^"'>\n]*(?:px-3|px-4)\s+(?:py-1|py-1\.5))[^>]*>\s*(?:✨|🚀|⚡)?\s*(?:AI-Powered|Next-Gen|Announcing|Introducing|Beta|New)[^<]*<\/(?:div|span|a)>/gi,
    action: 'Delete the decorative announcement badge container element'
  },
  {
    id: 'visual-hover-lift',
    category: 'visual',
    name: 'Gratuitous Hover Lift/Scale on Static Cards',
    description: 'Unwarranted translate-y lift and scale-up animations on non-interactive feature cards',
    pattern: /\b(?:hover:-translate-y-[0-9.]+|hover:scale-(?:102|105|110))\s+[^"'>\n]*\b(?:transition(?:-all)?)\b/gi,
    action: 'Delete hover lift and scale transform classes'
  },
  {
    id: 'visual-marquee',
    category: 'visual',
    name: 'Purposeless Infinite Marquee',
    description: 'Infinite automated scrolling text or logo marquees duplicating items',
    pattern: /<(?:div|section)[^>]*\b(?:animate-marquee|marquee)\b[^>]*>[\s\S]*?<\/(?:div|section)>/gi,
    action: 'Delete the marquee container element'
  }
];
