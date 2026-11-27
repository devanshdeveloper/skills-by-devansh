// Visual slop rules: generic gradients, decorative glows, blanket glass, emoji icons, stacked decorations
export const visualRules = [
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
