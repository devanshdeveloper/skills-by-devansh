// Copy slop rules: em-dash crutches, stock phrases, manifesto taglines, buzzwords, throat clearing
export const copyRules = [
  {
    id: 'copy-solitary-em-dash',
    category: 'copy',
    name: 'Solitary Em Dash in Body Prose',
    description: 'A single em-dash inside a sentence used to inject synthetic dramatic rhythm',
    match: (line) => {
      const emDashes = (line.match(/—/g) || []).length;
      return emDashes === 1 && !line.includes('FIG.') && !line.includes('16 : 7');
    },
    action: 'Replace em-dash with a comma, period, or plain space (punctuation swap only; zero words added)'
  },
  {
    id: 'copy-em-dash-cluster',
    category: 'copy',
    name: 'Em-Dash Cluster',
    description: 'Clustered em-dashes (>= 2 in a paragraph or line) used as rhythmic crutches',
    match: (line) => {
      const emDashes = (line.match(/—/g) || []).length;
      const spacedHyphens = (line.match(/\s+-\s+/g) || []).length;
      return emDashes >= 2 || (emDashes >= 1 && spacedHyphens >= 1);
    },
    action: 'Delete parenthetical em-dash clause or convert to clean single period'
  },
  {
    id: 'copy-engineering-stock-phrases',
    category: 'copy',
    name: 'Engineering & Operational Stock Phrases',
    description: 'Clichéd operational and engineering filler phrases substituting for verifiable technical specifications',
    pattern: /\b(?:built to scale|ready to deploy|real operational domains|clean architecture|transparent milestones|full source ownership|long-term scale|disciplined(?: four-stage)? cadence)\b/gi,
    action: 'Delete stock phrase or filler sentence (if in headline, list under Needs a Human)'
  },
  {
    id: 'copy-mono-caps-manifesto-tagline',
    category: 'copy',
    name: 'Mono-Caps Manifesto Tagline',
    description: 'Uppercase wide-letter-spaced manifesto slogans in headers or footers',
    pattern: /\b(?:EVERY SYSTEM FOLLOWS CLEAN ARCHITECTURE(?:, NOTHING GETS MISSED)?|DEDICATED SOLUTIONS ACROSS INDUSTRIES|BUILT FOR MODERN OPERATIONS)\b/gi,
    action: 'Delete the decorative manifesto tagline element'
  },
  {
    id: 'copy-throat-clearing',
    category: 'copy',
    name: 'Throat-Clearing Opener',
    description: 'Formulaic warm-up phrases before stating the actual point',
    pattern: /\b(?:In today's (?:fast-paced|digital|modern|rapidly evolving) (?:world|landscape|environment)|It's worth noting that|When it comes to|At the end of the day|In the realm of|In order to|Needless to say|It is important to (?:remember|understand|note)|As we all know)\b/gi,
    action: 'Delete opening filler clause; lead directly with the core claim'
  },
  {
    id: 'copy-hype-verbs',
    category: 'copy',
    name: 'Inflated Marketing Hype Verbs & Buzzwords',
    description: 'Overused AI buzzwords substituting for concrete product capabilities',
    pattern: /\b(?:unleash(?:ing)?|supercharge(?:d)?|elevate(?:d)?|harness(?:ing)?|empower(?:ing)?|revolutionize(?:d)?|seamlessly|game-changer|cutting-edge|transformative|unlock(?:ing)? the power of)\b/gi,
    action: 'Delete hype adjective/adverb, or delete the filler sentence'
  },
  {
    id: 'copy-metaphor-inflation',
    category: 'copy',
    name: 'Metaphor Inflation',
    description: 'Pretentious conceptual nouns used to manufacture artificial depth',
    pattern: /\b(?:tapestry|beacon|testament to|symphony of|realm of|delve(?:s|d)?|dive deep(?: into)?)\b/gi,
    action: 'Delete inflated metaphor clause or delete sentence'
  },
  {
    id: 'copy-assistant-boilerplate',
    category: 'copy',
    name: 'Assistant Boilerplate Leftover',
    description: 'Conversational artifacts from AI chat prompts left in source files',
    pattern: /\b(?:Certainly!|Here is the (?:code|component|implementation)|In conclusion,|I hope this helps|Feel free to reach out|As an AI language model)\b/gi,
    action: 'Delete the entire conversational artifact line'
  },
  {
    id: 'copy-telegraphed-reversal',
    category: 'copy',
    name: 'Telegraphed Binary Reversal',
    description: 'Formulaic "Not just X, it\'s Y" or "Not only X, but Y" synthetic depth patterns',
    pattern: /\b(?:It'?s not just [^.,;\n]+,?\s+it'?s\b|Not only [^.,;\n]+,?\s+but (?:also )?)\b/gi,
    action: 'Delete negative framing setup clause; state the direct claim once'
  },
  {
    id: 'copy-hollow-subhead',
    category: 'copy',
    name: 'Hollow Generic Subhead',
    description: 'Vague, low-specificity subheadings repeated on boilerplate landing pages',
    pattern: /<(?:p|h[2-6]|span)[^>]*>\s*(?:Built for the future|Designed for scale|Next-generation solution|Empowering teams worldwide|Everything you need to succeed)\.?\s*<\/(?:p|h[2-6]|span)>/gi,
    action: 'Delete the hollow subhead tag entirely'
  },
  {
    id: 'copy-lorem-ipsum',
    category: 'copy',
    name: 'Lorem Ipsum & Placeholder Text',
    description: 'Template dummy text left behind in components or content files',
    pattern: /\b(?:Lorem ipsum dolor sit amet|consectetur adipiscing elit|sed do eiusmod tempor)\b/gi,
    action: 'Delete placeholder text block; log under Needs a Human if content is required'
  }
];
