#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export const TOKEN_PATTERNS = [
  {
    name: 'Private Key Block',
    regex: /-----BEGIN\s+(?:[A-Z0-9 ]+)?PRIVATE\s+KEY-----/i
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/
  },
  {
    name: 'Fine-grained GitHub Token',
    regex: /github_pat_[A-Za-z0-9_]{82,}/
  },
  {
    name: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/
  },
  {
    name: 'Pixabay API Key Literal',
    regex: /PIXABAY_API_KEY\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i
  },
  {
    name: 'Pexels API Key Literal',
    regex: /PEXELS_API_KEY\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i
  },
  {
    name: 'Unsplash Key Literal',
    regex: /(?:UNSPLASH_ACCESS_KEY|UNSPLASH_SECRET_KEY)\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i
  },
  {
    name: 'CMS Site Key Literal',
    regex: /CMS_SITE_KEY\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i
  },
  {
    name: 'Revalidate Key Literal',
    regex: /REVALIDATE_SECRET\s*=\s*["'][A-Za-z0-9_\-]{16,}["']/i
  },
  {
    name: 'Generic API Key / Token Assignment',
    regex: /(?:api[_-]?key|auth[_-]?token|bearer[_-]?token|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_\-.~+/=]{24,}["']/i
  }
];

// Helper to mask sensitive token value for safe logging
function maskToken(matchStr) {
  if (matchStr.length <= 8) return '****';
  return matchStr.slice(0, 4) + '****' + matchStr.slice(-2);
}

function isPlaceholder(str) {
  const lower = str.toLowerCase();
  return lower.includes('your-') ||
         lower.includes('example-') ||
         lower.includes('placeholder') ||
         lower.includes('changeme') ||
         lower.includes('dummy') ||
         /<[a-z0-9_-]+>/i.test(str);
}

// Ignore list for directories/files not part of published source
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.stock-cache',
  'context' // context is local-only scratch covered by Gate 6 privacy check
];

export function scanString(content, sourceLabel = 'input') {
  const findings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of TOKEN_PATTERNS) {
      const match = pattern.regex.exec(line);
      if (match) {
        if (isPlaceholder(match[0])) {
          continue;
        }
        findings.push({
          source: sourceLabel,
          line: i + 1,
          rule: pattern.name,
          preview: maskToken(match[0])
        });
      }
    }
  }

  return findings;
}

export function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return scanString(content, filePath);
  } catch (err) {
    return [{
      source: filePath,
      line: 0,
      rule: 'File Read Error',
      preview: err.message
    }];
  }
}

export function scanDirectory(dirPath, rootDir = dirPath) {
  let findings = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (IGNORED_PATHS.some(ignored => relPath === ignored || relPath.startsWith(ignored + path.sep))) {
      continue;
    }

    if (entry.isDirectory()) {
      findings = findings.concat(scanDirectory(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.pdf', '.zip'].includes(ext)) {
        continue;
      }
      findings = findings.concat(scanFile(fullPath));
    }
  }

  return findings;
}

export function scanGitHistory(repoPath = REPO_ROOT) {
  const findings = [];
  try {
    execSync('git rev-parse --verify HEAD', { cwd: repoPath, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    // No commits in repository yet; history scan passes vacuously
    return findings;
  }

  try {
    const logOutput = execSync('git log -p --all', {
      cwd: repoPath,
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024
    });

    const lines = logOutput.split('\n');
    let currentCommit = 'unknown';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('commit ')) {
        currentCommit = line.slice(7, 14);
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        const addedLine = line.slice(1);
        for (const pattern of TOKEN_PATTERNS) {
          const match = pattern.regex.exec(addedLine);
          if (match) {
            if (isPlaceholder(match[0])) {
              continue;
            }
            findings.push({
              source: `Commit ${currentCommit}`,
              line: i + 1,
              rule: pattern.name,
              preview: maskToken(match[0])
            });
          }
        }
      }
    }
  } catch (err) {
    findings.push({
      source: 'git log scan',
      line: 0,
      rule: 'Git Log Execution Error',
      preview: err.message
    });
  }

  return findings;
}

export function runFullSecurityScan(repoPath = REPO_ROOT) {
  const treeFindings = scanDirectory(repoPath, repoPath);
  const historyFindings = scanGitHistory(repoPath);
  const allFindings = [...treeFindings, ...historyFindings];

  return {
    passed: allFindings.length === 0,
    treeCount: treeFindings.length,
    historyCount: historyFindings.length,
    findings: allFindings
  };
}

// CLI runner if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : REPO_ROOT;
  console.log(`Running security token scanner on: ${targetDir}`);
  const result = runFullSecurityScan(targetDir);

  if (result.passed) {
    console.log('✓ Security scan passed: 0 sensitive credentials or tokens detected.');
    process.exit(0);
  } else {
    console.error(`✗ Security scan FAILED: ${result.findings.length} findings detected!`);
    for (const f of result.findings) {
      console.error(`  - [${f.rule}] in ${f.source} (line ${f.line}): ${f.preview}`);
    }
    process.exit(1);
  }
}
