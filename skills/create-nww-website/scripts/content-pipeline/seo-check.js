#!/usr/bin/env node

/**
 * SEO & Content Standards Static Checker CLI
 *
 * Enforces verified Google Search Central requirements (ERROR) and
 * industry heuristics (WARN) on authored MDX content.
 *
 * Usage:
 *   node seo-check.js --file <path-to-mdx>
 *   node seo-check.js --dir <path-to-mdx-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readAndParseMDX } from './lib/mdx-parser.js';
import { printHeader, printIssue, finishCli } from './lib/reporter.js';

export const SEO_RULES = [
  {
    id: 'TITLE_REQUIRED',
    severity: 'ERROR',
    source: 'Google Search Central: Title Links (Required for SERP snippet title)',
  },
  {
    id: 'TITLE_LENGTH_HEURISTIC',
    severity: 'WARN',
    source: 'Heuristic: ~60 chars / ~600px desktop SERP truncation boundary',
  },
  {
    id: 'DESCRIPTION_REQUIRED',
    severity: 'ERROR',
    source: 'Google Search Central: Snippets (Required meta tag for search summary)',
  },
  {
    id: 'DESCRIPTION_LENGTH_HEURISTIC',
    severity: 'WARN',
    source: 'Heuristic: ~160 chars / ~960px SERP truncation boundary',
  },
  {
    id: 'CANONICAL_REQUIRED',
    severity: 'ERROR',
    source: 'Google Search Central: Consolidate Duplicate URLs',
  },
  {
    id: 'CANONICAL_ABSOLUTE',
    severity: 'WARN',
    source: 'Google Search Central: Strongly discourages relative paths for rel="canonical"',
  },
  {
    id: 'SINGLE_H1_REQUIRED',
    severity: 'ERROR',
    source: 'HTML5 Semantic Spec & Search Quality (Single primary topic heading)',
  },
  {
    id: 'IMAGE_ALT_REQUIRED',
    severity: 'ERROR',
    source: 'Google Search Central: Image SEO & WCAG Accessibility',
  },
  {
    id: 'SLUG_FORMAT_REQUIRED',
    severity: 'ERROR',
    source: 'Google Search Central: URL Structure (Lowercase kebab-case alphanumeric)',
  },
  {
    id: 'AI_GIMMICK_GUARD',
    severity: 'WARN',
    source: 'Google Search Guidance: Synthetic chunking and artificial AI tags are unneeded',
  },
];

export function parseArgs(argv) {
  const options = {
    file: null,
    dir: null,
    json: false,
    strict: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--strict') options.strict = true;
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
    else if (arg === '--file' && i + 1 < argv.length) options.file = argv[++i];
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg === '--dir' && i + 1 < argv.length) options.dir = argv[++i];
  }

  return options;
}

export function auditSeoForMdx(filePath) {
  const issues = [];
  let parsed;
  try {
    parsed = readAndParseMDX(filePath);
  } catch (err) {
    return {
      filePath,
      passed: false,
      issues: [{ severity: 'ERROR', code: 'PARSE_FAILED', message: err.message, source: 'file' }],
    };
  }

  const { frontmatter, headings, images, raw } = parsed;

  // 1. Title Presence (ERROR) & Length Heuristic (WARN)
  const title = frontmatter.metaTitle || frontmatter.title;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'TITLE_REQUIRED',
      message: 'Page is missing a metaTitle or title element',
      source: 'Google Search Central: Title Links',
    });
  } else if (title.trim().length > 60) {
    issues.push({
      severity: 'WARN',
      code: 'TITLE_LENGTH_HEURISTIC',
      message: `Title is ${title.trim().length} chars (exceeds 60 char heuristic; may be truncated in SERP)`,
      source: 'Google Search Central: Title Links (Heuristic)',
    });
  }

  // 2. Meta Description Presence (ERROR) & Length Heuristic (WARN)
  const description = frontmatter.metaDescription || frontmatter.description || frontmatter.summary;
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'DESCRIPTION_REQUIRED',
      message: 'Page is missing a metaDescription or summary element',
      source: 'Google Search Central: Snippets',
    });
  } else if (description.trim().length > 160) {
    issues.push({
      severity: 'WARN',
      code: 'DESCRIPTION_LENGTH_HEURISTIC',
      message: `Meta description is ${description.trim().length} chars (exceeds 160 char heuristic; may truncate)`,
      source: 'Google Search Central: Snippets (Heuristic)',
    });
  }

  // 3. Canonical URL (ERROR) & Absolute URL Check (WARN)
  const canonical = frontmatter.canonicalUrl;
  if (!canonical || typeof canonical !== 'string') {
    issues.push({
      severity: 'ERROR',
      code: 'CANONICAL_REQUIRED',
      message: 'Frontmatter is missing "canonicalUrl"',
      source: 'Google Search Central: Consolidate Duplicate URLs',
    });
  } else if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
    issues.push({
      severity: 'WARN',
      code: 'CANONICAL_ABSOLUTE',
      message: `Canonical URL '${canonical}' is a relative path. Google strongly recommends fully qualified absolute URLs`,
      source: 'Google Search Central: Canonicalization',
    });
  }

  // 4. Single H1 Heading (ERROR)
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length === 0) {
    issues.push({
      severity: 'ERROR',
      code: 'SINGLE_H1_REQUIRED',
      message: 'Content contains 0 H1 headings; exactly 1 primary H1 heading is required',
      source: 'HTML5 Semantic Spec',
    });
  } else if (h1s.length > 1) {
    issues.push({
      severity: 'ERROR',
      code: 'SINGLE_H1_REQUIRED',
      message: `Content contains ${h1s.length} H1 headings; multiple H1s dilute topic authority`,
      source: 'HTML5 Semantic Spec',
    });
  }

  // 5. Image Alt Text (ERROR)
  for (const img of images) {
    if (!img.hasAlt) {
      issues.push({
        severity: 'ERROR',
        code: 'IMAGE_ALT_REQUIRED',
        message: `Image '${img.src}' is missing alt text`,
        source: 'Google Search Central: Image SEO',
      });
    }
  }

  // 6. Slug Format (ERROR)
  const slug = frontmatter.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({
      severity: 'ERROR',
      code: 'SLUG_FORMAT_REQUIRED',
      message: `Slug '${slug}' violates URL best practices. Must be lowercase alphanumeric kebab-case`,
      source: 'Google Search Central: URL Structure',
    });
  }

  // 7. AI Search Gimmick Guard (WARN)
  if (raw.includes('llms.txt') || raw.includes('<!-- chunk:') || /<ai-chunk\b/i.test(raw)) {
    issues.push({
      severity: 'WARN',
      code: 'AI_GIMMICK_GUARD',
      message: 'Detected artificial chunking or llms.txt reference. Google Search relies on standard HTML content',
      source: 'Google May 2026 AI Search Guidance',
    });
  }

  const passed = issues.every(i => i.severity !== 'ERROR');
  return { filePath, passed, issues };
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.file && !opts.dir)) {
    process.stdout.write(`SEO & Content Standards Static Checker (skills-by-devansh)
Usage:
  node seo-check.js --file <path-to-mdx> [options]
  node seo-check.js --dir <path-to-dir> [options]

Options:
  --file <path>       Target MDX file to audit
  --dir <path>        Directory containing MDX files to audit
  --strict            Fail (exit code 1) on any warning as well as errors
  --json              Output structured JSON report
  -h, --help          Show this help message

Rules Audited:
${SEO_RULES.map(r => `  - [${r.severity}] ${r.id}: ${r.source}`).join('\n')}
`);
    process.exit(opts.help ? 0 : 1);
  }

  const targetFiles = [];
  if (opts.file) {
    targetFiles.push(path.resolve(opts.file));
  } else if (opts.dir) {
    const dir = path.resolve(opts.dir);
    if (!fs.existsSync(dir)) {
      process.stderr.write(`Directory not found: ${dir}\n`);
      process.exit(1);
    }
    for (const ent of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (ent.isFile() && (ent.name.endsWith('.mdx') || ent.name === 'content.md')) {
        targetFiles.push(path.join(ent.parentPath || ent.path, ent.name));
      }
    }
  }

  if (!opts.json) {
    printHeader(`AUDITING SEO STANDARDS ACROSS ${targetFiles.length} MDX FILE(S)`);
  }

  const results = [];
  let allPassed = true;

  for (const f of targetFiles) {
    const res = auditSeoForMdx(f);
    results.push(res);

    const hasFailure = opts.strict
      ? res.issues.length > 0
      : res.issues.some(i => i.severity === 'ERROR');

    if (hasFailure) allPassed = false;

    if (!opts.json) {
      const icon = !hasFailure ? '✓' : '✗';
      process.stdout.write(`\n${icon} File: ${path.relative(process.cwd(), f)}\n`);
      for (const issue of res.issues) {
        printIssue(issue.severity, issue.code, issue.message, issue.source);
      }
    }
  }

  finishCli(allPassed, { passed: allPassed, total: targetFiles.length, results }, opts.json);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
