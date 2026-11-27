// Copy slop rules: em-dash clusters, buzzwords, throat clearing, assistant boilerplate
export const copyRules = [
  {
    id: 'copy-em-dash-cluster',
    category: 'copy',
    name: 'Em-Dash Cluster',
    description: 'Clustered em-dashes (>= 2 in a paragraph or line) used as rhythmic crutches',
    // Custom scanner match function evaluating em-dash density
    match: (line) => {
      const emDashes = (line.match(/—/g) || []).length;
      const spacedHyphens = (line.match(/\s+-\s+/g) || []).length;
      return (emDashes >= 2 || (emDashes >= 1 && spacedHyphens >= 1));
    },
    action: 'Delete parenthetical em-dash clause or convert to clean single period'
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
