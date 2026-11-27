// Structural slop rules: invented stats, fake testimonials, fake client logos, filler sections,
// and modern structural redundancies (in-grid CTA tiles, footer promo cells, middle-dot stat strips, offering counts)
export const structureRules = [
  {
    id: 'structure-horizontal-dot-stat-strip',
    category: 'structure',
    name: 'Horizontal Middle-Dot Stat Strip',
    description: 'Inline monospace ribbon stringing category counts together with middle dots (e.g. 4 CORE X · 6 Y · 4 Z)',
    pattern: /\b\d+\s+[A-Z\s]{3,}\s+·\s+\d+\s+[A-Z\s]{3,}\b/g,
    action: 'Delete the stat strip element entirely'
  },
  {
    id: 'structure-in-grid-cta-tile',
    category: 'structure',
    name: 'In-Grid CTA Accent Tile',
    description: 'High-contrast sales/inquiry promo card injected inside a product or service grid',
    pattern: /<(?:div|article)[^>]*\b(?:bg-blue-[0-9]+|bg-primary|bg-accent)[^>]*>[\s\S]*?(?:Ready to scope|Start a Project|Ready to build)[\s\S]*?<\/(?:div|article)>/gi,
    action: 'Delete the in-grid accent CTA tile component'
  },
  {
    id: 'structure-footer-promo-cta-cell',
    category: 'structure',
    name: 'Footer Promo CTA Cell',
    description: 'Prominent inquiry banner or high-contrast promo card embedded inside footer columns',
    pattern: /<(?:div|section)[^>]*\b(?:bg-blue-[0-9]+|bg-primary)[^>]*>[\s\S]*?(?:READY TO BUILD|Start a Project)[\s\S]*?<\/(?:div|section)>/gi,
    action: 'Delete the footer promo CTA cell; retain clean directory and legal columns'
  },
  {
    id: 'structure-dropdown-offering-counter',
    category: 'structure',
    name: 'Nav Dropdown Offering Counter',
    description: 'Monospace offering counts placed in dropdown taxonomy headers (e.g. 4 offerings)',
    pattern: /\b\d+\s+(?:offerings|items|services)\b/gi,
    action: 'Delete the offering counter span'
  },
  {
    id: 'structure-duplicate-taxonomy-summary',
    category: 'structure',
    name: 'Duplicate Taxonomy Summaries in Secondary Chrome',
    description: 'Primary card description paragraphs repeated inside nav dropdowns or footer directory columns',
    pattern: /(?:showSummary|showDescription)\s*=\s*\{true\}/gi,
    action: 'Disable summary prop or delete repeated summary paragraph from secondary chrome; keep link & title'
  },
  {
    id: 'structure-duplicate-cta',
    category: 'structure',
    name: 'Redundant Stacked CTA Buttons',
    description: 'Identical primary CTA buttons ("Get Started", "Start a Project") repeated consecutively back-to-back',
    pattern: /(<(?:button|a)[^>]*>[^<]*(?:Get Started|Start a Project|Start Free Trial)[^<]*<\/(?:button|a)>\s*){2,}/gi,
    action: 'Delete the redundant secondary CTA duplicate'
  },
  {
    id: 'structure-invented-stats',
    category: 'structure',
    name: 'Invented Stat / Metric Bar',
    description: 'Fabricated placeholder statistics on generic landing pages (e.g. 99.9%, 10M+, 500k+)',
    pattern: /<(?:div|section)[^>]*\b(?:stats?|metrics?)[^>]*>[\s\S]*?(?:99\.9%|10M\+|500k\+|100%|50M\+)[\s\S]*?<\/(?:div|section)>/gi,
    action: 'Delete the entire fabricated stats section or card component'
  },
  {
    id: 'structure-fake-testimonials',
    category: 'structure',
    name: 'Fake Testimonial Grid / Persona Card',
    description: 'Stock avatar testimonial cards with generic placeholder roles and fabricated praise',
    pattern: /<(?:div|section|article)[^>]*\b(?:testimonial|review-card)[^>]*>[\s\S]*?(?:Sarah Jenkins|John Doe|Jane Smith|Alex Morgan|Founder & CEO|VP of Operations)[\s\S]*?<\/(?:div|section|article)>/gi,
    action: 'Delete the fake testimonial block'
  },
  {
    id: 'structure-fake-logos',
    category: 'structure',
    name: 'Fake Client Logo Bar',
    description: 'Placeholder client marquee or logo row using blank shapes or generic tech names',
    pattern: /<(?:div|section)[^>]*>[\s\S]*?(?:Trusted by industry leaders|Featured in Fortune 500|Partnered with top brands)[\s\S]*?<\/(?:div|section)>/gi,
    action: 'Delete the fake logo bar component'
  },
  {
    id: 'structure-filler-how-it-works',
    category: 'structure',
    name: 'Cookie-Cutter How-It-Works 3-Step',
    description: 'Unrequested formulaic 3-step cards ("Step 1: Sign Up", "Step 2: Connect", "Step 3: Grow")',
    pattern: /<(?:div|section)[^>]*>[\s\S]*?Step 1:?\s*Sign Up[\s\S]*?Step 2:?\s*(?:Connect|Configure)[\s\S]*?Step 3:?\s*(?:Grow|Launch)[\s\S]*?<\/(?:div|section)>/gi,
    action: 'Delete the formulaic filler step section'
  }
];
