import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '../../..');

// Helper to safely execute a shell command and return stdout
export function execSafe(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts
    }).trim();
  } catch {
    return null;
  }
}

// Helper to normalize Git remote URLs for consistent comparison
export function normalizeRemote(url) {
  if (!url) return '';
  return url.trim().replace(/\.git\/?$/, '').replace(/\/$/, '').toLowerCase();
}

// Automatically infer the latest semver tag from CHANGELOG.md
export function inferLatestTag(repoRoot = REPO_ROOT) {
  try {
    const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
    if (fs.existsSync(changelogPath)) {
      const text = fs.readFileSync(changelogPath, 'utf-8');
      const match = text.match(/##\s*\[(\d+\.\d+\.\d+)\]/);
      if (match) {
        return `v${match[1]}`;
      }
    }
  } catch {
    // fallback below
  }
  return 'v1.0.0';
}

