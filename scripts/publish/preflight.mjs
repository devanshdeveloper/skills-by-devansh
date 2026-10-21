#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runFullSecurityScan } from './security-scan.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

// Helper to safely execute a shell command and return stdout
function execSafe(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts
    }).trim();
  } catch (err) {
    return null;
  }
}

// Helper to normalize Git remote URLs for consistent comparison
function normalizeRemote(url) {
  if (!url) return '';
  return url.trim().replace(/\.git\/?$/, '').replace(/\/$/, '').toLowerCase();
}

// Simple YAML frontmatter parser for SKILL.md
function parseFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const endIdx = content.indexOf('\n---', 3);
  if (endIdx === -1) return null;
  const yamlBlock = content.slice(3, endIdx).trim();
  const result = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }

  // Check if metadata.internal: true exists
  result.isInternal = /metadata:\s*\n\s*internal:\s*true/i.test(yamlBlock) || yamlBlock.includes('internal: true');
  return result;
}

export async function runPreflightChecks(options = { mode: 'dry-run', targetTag: 'v1.0.0' }) {
  const results = {
    mode: options.mode,
    timestamp: new Date().toISOString(),
    passed: true,
    gates: {}
  };

  function recordGate(gateId, name, passed, details = '') {
    results.gates[gateId] = { name, passed, details };
    if (!passed) {
      results.passed = false;
    }
  }

  // Read configuration & manifest
  const configPath = path.join(REPO_ROOT, 'publish.config.json');
  const manifestPath = path.join(REPO_ROOT, 'skills.manifest.json');

  if (!fs.existsSync(configPath) || !fs.existsSync(manifestPath)) {
    recordGate('G0', 'Configuration Files', false, 'Missing publish.config.json or skills.manifest.json');
    return results;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // =========================================================================
  // Gate 1: Target Identity & Remote Matching
  // =========================================================================
  try {
    const remoteUrl = execSafe('git remote get-url origin');
    if (!remoteUrl) {
      if (options.mode === 'dry-run') {
        recordGate('G1', 'Target Remote & Owner Match', true, 'Remote origin not configured yet. (Allowed in dry-run mode)');
      } else {
        recordGate('G1', 'Target Remote & Owner Match', false, 'Remote origin is not configured in git.');
      }
    } else {
      const normRemote = normalizeRemote(remoteUrl);
      const expectedTarget = `${config.expectedOwner}/${config.expectedRepo}`.toLowerCase();
      const isAllowed = config.allowedRemotes.some(allowed => normalizeRemote(allowed) === normRemote) ||
                        normRemote.endsWith(expectedTarget) ||
                        normRemote.endsWith(config.expectedRepo.toLowerCase());

      if (!isAllowed) {
        recordGate('G1', 'Target Remote & Owner Match', false, `Remote '${remoteUrl}' does not match allowed remotes: ${config.allowedRemotes.join(', ')}`);
      } else {
        recordGate('G1', 'Target Remote & Owner Match', true, `Remote matched: ${remoteUrl}`);
      }
    }

    // Verify active gh account if enforceGhAccount is true and in confirm mode
    if (config.enforceGhAccount && options.mode !== 'dry-run') {
      const ghAuth = execSafe('gh auth status');
      if (ghAuth && !ghAuth.includes(`Logged in to github.com account ${config.expectedOwner}`)) {
        recordGate('G1_GH', 'GitHub CLI Active Account', false, `Active gh account does not match expected owner: ${config.expectedOwner}`);
      }
    }
  } catch (err) {
    recordGate('G1', 'Target Remote & Owner Match', false, err.message);
  }

  // =========================================================================
  // Gate 2: Branch & Working Tree Check
  // =========================================================================
  try {
    let currentBranch = execSafe('git symbolic-ref --short HEAD') || execSafe('git rev-parse --abbrev-ref HEAD');
    if (!currentBranch || currentBranch === 'HEAD') {
      currentBranch = 'main'; // default on fresh uncommitted repo
    }

    if (currentBranch !== config.defaultBranch) {
      recordGate('G2', 'Branch & Working Tree Check', false, `Active branch '${currentBranch}' is not '${config.defaultBranch}'`);
    } else {
      const porcelain = execSafe('git status --porcelain') || '';
      const conflictMarkers = ['.git/MERGE_HEAD', '.git/REBASE_HEAD', '.git/CHERRY_PICK_HEAD'];
      const hasConflict = conflictMarkers.some(m => fs.existsSync(path.join(REPO_ROOT, m)));

      if (hasConflict) {
        recordGate('G2', 'Branch & Working Tree Check', false, 'Git repository has an active merge, rebase, or cherry-pick in progress.');
      } else {
        const dirtyCount = porcelain.trim().length > 0 ? porcelain.trim().split('\n').length : 0;
        const details = dirtyCount > 0
          ? `Branch '${currentBranch}' ready (${dirtyCount} file(s) pending release commit).`
          : `Branch '${currentBranch}' clean.`;
        recordGate('G2', 'Branch & Working Tree Check', true, details);
      }
    }
  } catch (err) {
    recordGate('G2', 'Branch & Working Tree Check', false, err.message);
  }

  // =========================================================================
  // Gate 3: Skill Specification Audit
  // =========================================================================
  try {
    const skillsDir = path.join(REPO_ROOT, 'skills');
    const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
    let specErrors = [];

    for (const folder of skillFolders) {
      const skillName = folder.name;
      const skillPath = path.join(skillsDir, skillName);
      const skillMd = path.join(skillPath, 'SKILL.md');

      if (!fs.existsSync(skillMd)) {
        specErrors.push(`${skillName}: Missing SKILL.md`);
        continue;
      }

      const content = fs.readFileSync(skillMd, 'utf-8');
      const lines = content.split('\n');
      if (lines.length > 500) {
        specErrors.push(`${skillName}: SKILL.md exceeds 500 lines (${lines.length} lines)`);
      }

      const frontmatter = parseFrontmatter(content);
      if (!frontmatter) {
        specErrors.push(`${skillName}: Invalid YAML frontmatter in SKILL.md`);
        continue;
      }

      if (frontmatter.name !== skillName) {
        specErrors.push(`${skillName}: Frontmatter name '${frontmatter.name}' does not match directory '${skillName}'`);
      }

      if (!/^[a-z0-9-]+$/.test(frontmatter.name) || frontmatter.name.length > 64) {
        specErrors.push(`${skillName}: Name '${frontmatter.name}' violates spec (must be lowercase alphanumeric/hyphen <= 64 chars)`);
      }

      if (!frontmatter.description || frontmatter.description.length > 1024) {
        specErrors.push(`${skillName}: Description must be non-empty and <= 1024 chars (currently ${frontmatter.description?.length || 0})`);
      }

      if (fs.existsSync(path.join(skillPath, 'README.md'))) {
        specErrors.push(`${skillName}: Forbidden README.md detected inside skill folder`);
      }

      // Check references flat structure
      const refDir = path.join(skillPath, 'references');
      if (fs.existsSync(refDir)) {
        const refEntries = fs.readdirSync(refDir, { withFileTypes: true });
        for (const re of refEntries) {
          if (re.isDirectory()) {
            specErrors.push(`${skillName}: Nested directory '${re.name}' in references/ violates flat structure`);
          }
        }
      }
    }

    if (specErrors.length > 0) {
      recordGate('G3', 'Skill Specification Audit', false, specErrors.join('; '));
    } else {
      recordGate('G3', 'Skill Specification Audit', true, `All ${skillFolders.length} skills comply with agentskills.io specification.`);
    }
  } catch (err) {
    recordGate('G3', 'Skill Specification Audit', false, err.message);
  }

  // =========================================================================
  // Gate 4: Catalog & Manifest Verification
  // =========================================================================
  try {
    const skillsDir = path.join(REPO_ROOT, 'skills');
    const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const publishable = [];
    const internal = [];

    for (const name of skillFolders) {
      const content = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf-8');
      const fm = parseFrontmatter(content);
      if (fm?.isInternal) {
        internal.push(name);
      } else {
        publishable.push(name);
      }
    }

    const missingPublishable = manifest.publishableSkills.filter(s => !publishable.includes(s));
    const extraPublishable = publishable.filter(s => !manifest.publishableSkills.includes(s));
    const missingInternal = manifest.internalSkills.filter(s => !internal.includes(s));

    if (missingPublishable.length > 0 || extraPublishable.length > 0 || missingInternal.length > 0) {
      recordGate('G4', 'Catalog & Manifest Verification', false,
        `Manifest mismatch! Missing publishable: [${missingPublishable}], Extra publishable: [${extraPublishable}], Missing internal: [${missingInternal}]`);
    } else {
      recordGate('G4', 'Catalog & Manifest Verification', true,
        `Catalog verified: ${publishable.length} public skills, ${internal.length} internal skills.`);
    }
  } catch (err) {
    recordGate('G4', 'Catalog & Manifest Verification', false, err.message);
  }

  // =========================================================================
  // Gate 5: Secret & Credential Scanning
  // =========================================================================
  try {
    const secResult = runFullSecurityScan(REPO_ROOT);
    if (!secResult.passed) {
      const summary = secResult.findings.map(f => `[${f.rule}] in ${f.source}:${f.line}`).slice(0, 5).join(', ');
      recordGate('G5', 'Secret & Credential Scanning', false, `${secResult.findings.length} secrets detected! Details: ${summary}`);
    } else {
      recordGate('G5', 'Secret & Credential Scanning', true, 'Zero secret patterns found in tree or git history.');
    }
  } catch (err) {
    recordGate('G5', 'Secret & Credential Scanning', false, err.message);
  }

  // =========================================================================
  // Gate 6: Privacy & Isolation Checks
  // =========================================================================
  try {
    const privacyErrors = [];
    const trackedContext = execSafe('git ls-files context');
    if (trackedContext && trackedContext.trim().length > 0) {
      privacyErrors.push('context/ files are tracked in git index');
    }

    const gitignoreContent = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf-8');
    if (!gitignoreContent.includes('context/')) {
      privacyErrors.push('.gitignore is missing context/ rule');
    }
    if (!gitignoreContent.includes('.agents/')) {
      privacyErrors.push('.gitignore is missing .agents/ rule');
    }

    // Check skills for context/ references
    const skillsDir = path.join(REPO_ROOT, 'skills');
    const skillFiles = [];
    function collectFiles(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) collectFiles(full);
        else if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.js') || ent.name.endsWith('.mjs'))) {
          skillFiles.push(full);
        }
      }
    }
    collectFiles(skillsDir);

    for (const f of skillFiles) {
      const text = fs.readFileSync(f, 'utf-8');
      if (text.includes('context/')) {
        privacyErrors.push(`Reference to 'context/' found in published file: ${path.relative(REPO_ROOT, f)}`);
      }
      // Check for absolute local paths (e.g. C:\... or /Users/... or /home/...)
      const absMatch = text.match(/(?:^|[\s"'`(<[])([a-zA-Z]:[\\/](?![\\/])[^\s"'`>]+|(?:\/Users\/|\/home\/)[^\s"'`>]+)/);
      if (absMatch) {
        privacyErrors.push(`Absolute local path found in ${path.relative(REPO_ROOT, f)}: ${absMatch[1]}`);
      }
    }

    if (privacyErrors.length > 0) {
      recordGate('G6', 'Privacy & Isolation Checks', false, privacyErrors.join('; '));
    } else {
      recordGate('G6', 'Privacy & Isolation Checks', true, 'Privacy checks passed: context/ isolated, no absolute paths.');
    }
  } catch (err) {
    recordGate('G6', 'Privacy & Isolation Checks', false, err.message);
  }

  // =========================================================================
  // Gate 7: Placeholder Hygiene
  // =========================================================================
  try {
    const placeholderErrors = [];
    const placeholders = ['<owner>', '<repo>', '<your-token>', '<api-key>', 'TODO:'];
    const filesToInspect = [
      path.join(REPO_ROOT, 'README.md'),
      path.join(REPO_ROOT, 'LICENSE'),
      path.join(REPO_ROOT, 'publish.config.json'),
      path.join(REPO_ROOT, 'skills.manifest.json')
    ];

    for (const f of filesToInspect) {
      if (!fs.existsSync(f)) continue;
      const text = fs.readFileSync(f, 'utf-8');
      for (const ph of placeholders) {
        if (text.includes(ph)) {
          placeholderErrors.push(`Unresolved placeholder '${ph}' in ${path.basename(f)}`);
        }
      }
    }

    if (placeholderErrors.length > 0) {
      recordGate('G7', 'Placeholder Hygiene', false, placeholderErrors.join('; '));
    } else {
      recordGate('G7', 'Placeholder Hygiene', true, 'Zero unresolved placeholders detected.');
    }
  } catch (err) {
    recordGate('G7', 'Placeholder Hygiene', false, err.message);
  }

  // =========================================================================
  // Gate 8: Documentation & Listing Synchronization
  // =========================================================================
  try {
    const readmeContent = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf-8');
    const docErrors = [];

    for (const pubSkill of manifest.publishableSkills) {
      if (!readmeContent.includes(pubSkill)) {
        docErrors.push(`Skill '${pubSkill}' is missing from README.md`);
      }
    }

    const licenseContent = fs.readFileSync(path.join(REPO_ROOT, 'LICENSE'), 'utf-8');
    if (!licenseContent.includes('Copyright (c) 2026 Devansh')) {
      docErrors.push('LICENSE copyright line does not match author');
    }

    if (docErrors.length > 0) {
      recordGate('G8', 'Documentation & Listing Synchronization', false, docErrors.join('; '));
    } else {
      recordGate('G8', 'Documentation & Listing Synchronization', true, 'README.md, LICENSE, and catalog synchronized.');
    }
  } catch (err) {
    recordGate('G8', 'Documentation & Listing Synchronization', false, err.message);
  }

  // =========================================================================
  // Gate 9: Version, Tag & Changelog Synchronization
  // =========================================================================
  try {
    const tag = options.targetTag || 'v1.0.0';
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
      recordGate('G9', 'Version, Tag & Changelog Sync', false, `Invalid semver tag format '${tag}'. Expected 'vX.Y.Z'.`);
    } else {
      const rawVersion = tag.slice(1);
      const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md');
      if (!fs.existsSync(changelogPath)) {
        recordGate('G9', 'Version, Tag & Changelog Sync', false, 'Missing root CHANGELOG.md file.');
      } else {
        const changelog = fs.readFileSync(changelogPath, 'utf-8');
        if (!changelog.includes(`## [${rawVersion}]`)) {
          recordGate('G9', 'Version, Tag & Changelog Sync', false, `CHANGELOG.md missing entry for target release version '## [${rawVersion}]'`);
        } else {
          // Check if tag already exists in local git
          const existingTags = execSafe(`git tag -l ${tag}`);
          const tagsAtHead = execSafe('git tag --points-at HEAD') || '';
          const isTagAtHead = tagsAtHead.split('\n').map(t => t.trim()).includes(tag);

          if (existingTags && existingTags.includes(tag)) {
            if (isTagAtHead) {
              recordGate('G9', 'Version, Tag & Changelog Sync', true, `Version '${tag}' verified (HEAD is currently tagged as ${tag}).`);
            } else if (options.mode === 'confirm') {
              recordGate('G9', 'Version, Tag & Changelog Sync', false, `Git tag '${tag}' already exists on a different commit.`);
            } else {
              recordGate('G9', 'Version, Tag & Changelog Sync', true, `Version '${tag}' verified in repository.`);
            }
          } else {
            recordGate('G9', 'Version, Tag & Changelog Sync', true, `Version '${tag}' and CHANGELOG.md entry verified.`);
          }
        }
      }
    }
  } catch (err) {
    recordGate('G9', 'Version, Tag & Changelog Sync', false, err.message);
  }

  // =========================================================================
  // Gate 10: Remote Visibility & Pre-Flight Probe
  // =========================================================================
  try {
    const remoteUrl = execSafe('git remote get-url origin');
    const isLocalRemote = remoteUrl && (remoteUrl.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(remoteUrl) || remoteUrl.startsWith('.'));

    if (options.mode === 'dry-run' || isLocalRemote || config.skipRemoteProbe) {
      recordGate('G10', 'Remote Visibility & Pre-Flight Probe', true,
        isLocalRemote ? 'Local test remote verified (gh probe skipped for local bare remote).' :
        'Probe simulated for dry-run. (Will query remote in confirm mode).');
    } else {
      const ghView = execSafe(`gh repo view ${config.expectedOwner}/${config.expectedRepo} --json isPrivate,visibility`);
      if (!ghView) {
        recordGate('G10', 'Remote Visibility & Pre-Flight Probe', false, `Could not query remote repo '${config.expectedOwner}/${config.expectedRepo}' via gh.`);
      } else {
        const repoData = JSON.parse(ghView);
        if (repoData.isPrivate) {
          recordGate('G10', 'Remote Visibility & Pre-Flight Probe', false, 'Remote repository is PRIVATE. skills.sh requires a public repository.');
        } else {
          recordGate('G10', 'Remote Visibility & Pre-Flight Probe', true, `Remote repository is verified PUBLIC on GitHub.`);
        }
      }
    }
  } catch (err) {
    recordGate('G10', 'Remote Visibility & Pre-Flight Probe', false, err.message);
  }

  return results;
}

// CLI runner if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const mode = process.argv.includes('--confirm') ? 'confirm' : 'dry-run';
  const tagArg = process.argv.find(a => a.startsWith('--tag='));
  const targetTag = tagArg ? tagArg.split('=')[1] : 'v1.0.0';

  console.log(`=================================================================`);
  console.log(`  SKILLS-BY-DEVANSH PREFLIGHT VALIDATION (Mode: ${mode}, Tag: ${targetTag})`);
  console.log(`=================================================================`);

  runPreflightChecks({ mode, targetTag }).then(results => {
    for (const [id, gate] of Object.entries(results.gates)) {
      const icon = gate.passed ? '✓' : '✗';
      console.log(`  ${icon} [${id}] ${gate.name}: ${gate.details}`);
    }

    console.log(`-----------------------------------------------------------------`);
    if (results.passed) {
      console.log(`✓ ALL GATES PASSED. Ready for release flow.`);
      process.exit(0);
    } else {
      console.error(`✗ PREFLIGHT FAILED. Blocking release.`);
      process.exit(1);
    }
  });
}
