// Structural slop rules: invented stats, fake testimonials, fake client logos, filler sections
export const structureRules = [
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
  },
  {
    id: 'structure-duplicate-cta',
    category: 'structure',
    name: 'Redundant Stacked CTA Buttons',
    description: 'Identical primary CTA buttons ("Get Started", "Start Free Trial") repeated back-to-back',
    pattern: /(<(?:button|a)[^>]*>[^<]*(?:Get Started|Start Free Trial)[^<]*<\/(?:button|a)>\s*){2,}/gi,
    action: 'Delete the redundant secondary CTA duplicate'
  }
];
