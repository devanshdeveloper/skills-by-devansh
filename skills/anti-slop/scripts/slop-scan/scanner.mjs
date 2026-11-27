import fs from 'node:fs';
import path from 'node:path';

// Directories eagerly excluded before scanning
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  'context',
  'project-docs',
  'references',
  'scripts',
  'tests',
  '.github',
  '.agents'
]);

// Source file extensions inspected (includes content data files: .json, .mdx, .md, .ts/.js content arrays)
const SCANNED_EXTENSIONS = new Set([
  '.tsx',
  '.jsx',
  '.ts',
  '.js',
  '.mjs',
  '.json',
  '.html',
  '.css',
  '.md',
  '.mdx',
  '.vue',
  '.svelte'
]);

// Non-content JSON files to ignore
const IGNORED_JSON_FILES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'jsconfig.json',
  'anti-slop.rules.json',
  '.anti-slop.json',
  'components.json'
]);

export class FileScanner {
  constructor(registry, options = {}) {
    this.registry = registry;
    this.options = options;
  }

  // Fast recursive directory walker with eager pruning
  walkDirectory(dirPath, fileList = []) {
    if (!fs.existsSync(dirPath)) return fileList;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          this.walkDirectory(fullPath, fileList);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SCANNED_EXTENSIONS.has(ext)) {
          if (ext === '.json' && IGNORED_JSON_FILES.has(entry.name.toLowerCase())) {
            continue;
          }
          fileList.push(fullPath);
        }
      }
    }
    return fileList;
  }

  // Scans all target source files and aggregates findings
  scan(targetRoot) {
    const files = fs.statSync(targetRoot).isDirectory()
      ? this.walkDirectory(targetRoot)
      : [targetRoot];

    const results = {
      targetRoot,
      filesScanned: files.length,
      totalFindings: 0,
      summaryByCategory: {
        visual: 0,
        copy: 0,
        structure: 0,
        code: 0,
        custom: 0
      },
      findings: []
    };

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileFindings = this.registry.evaluateFile(file, content);

        for (const f of fileFindings) {
          results.findings.push(f);
          results.totalFindings++;
          if (results.summaryByCategory[f.category] !== undefined) {
            results.summaryByCategory[f.category]++;
          } else {
            results.summaryByCategory.custom++;
          }
        }
      } catch (err) {
        // Skip unreadable files gracefully
      }
    }

    return results;
  }
}
