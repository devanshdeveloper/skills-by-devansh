// Code hygiene rules: narrating comments, dead code, inline duplicate styles, empty wrappers, orphaned imports
export const codeRules = [
  {
    id: 'code-narrating-comments',
    category: 'code',
    name: 'Narrating Obvious Comment',
    description: 'Trivial AI comments stating obvious code syntax or component rendering',
    pattern: /^\s*\/\/\s*(?:Render (?:the )?[A-Za-z0-9_-]+ component|Handle (?:the )?[A-Za-z0-9_-]+ click|Return (?:the )?JSX|Main (?:page|container) component|Import (?:react|dependencies|styles)|Initialize state|Effect for [A-Za-z0-9_-]+)\s*$/gim,
    action: 'Delete the obvious narrating comment line'
  },
  {
    id: 'code-dead-jsx-block',
    category: 'code',
    name: 'Dead / Commented-Out JSX Block',
    description: 'Commented-out JSX markup left in templates or pages',
    pattern: /\{\/\*\s*<[A-Za-z0-9_-]+[\s\S]*?<\/[A-Za-z0-9_-]+>\s*\*\/\}/gi,
    action: 'Delete the commented-out dead JSX block'
  },
  {
    id: 'code-duplicate-inline-style',
    category: 'code',
    name: 'Inline Style Duplicating Utility Classes',
    description: 'Inline style attributes duplicating properties already declared in className',
    pattern: /className="[^"]*\b(flex|grid|hidden|block|relative|absolute)\b[^"]*"\s+style=\{\{\s*(?:display:\s*['"](?:flex|grid|none|block)['"]|position:\s*['"](?:relative|absolute)['"])\s*\}\}/gi,
    action: 'Delete redundant inline style attribute; keep utility class'
  },
  {
    id: 'code-redundant-fragment',
    category: 'code',
    name: 'Redundant Single-Child React Fragment',
    description: 'Unnecessary React fragment (<> ... </>) wrapping a single child element',
    pattern: /<>\s*(<[A-Za-z0-9_-]+[^>]*>[\s\S]*?<\/[A-Za-z0-9_-]+>)\s*<\/>/gi,
    action: 'Unwrap redundant fragment; retain child element directly'
  },
  {
    id: 'code-orphaned-import',
    category: 'code',
    name: 'Orphaned Import Declaration',
    description: 'Unused component or icon imports left orphaned after slop elements were deleted',
    pattern: /^import\s+\{[^}]*\b(?:ArrowUpRight|MoveRight|Sparkles|Rocket|Zap)\b[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    action: 'Delete the unused orphaned import declaration'
  }
];
