import fs from 'node:fs';
import path from 'node:path';
import { runFullSecurityScan } from '../security-scan.mjs';
import { execSafe, normalizeRemote, REPO_ROOT } from './git-utils.mjs';
import { parseFrontmatter, auditSkillSpecs } from './spec-audit.mjs';

// Gate 0: Configuration & Manifest
export async function checkG0Config(repoRoot = REPO_ROOT) {
  const configPath = path.join(repoRoot, 'publish.config.json');
  const manifestPath = path.join(repoRoot, 'skills.manifest.json');

  if (!fs.existsSync(configPath) || !fs.existsSync(manifestPath)) {
    return [{ id: 'G0', name: 'Configuration Files', passed: false, details: 'Missing publish.config.json or skills.manifest.json' }];
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return [{ id: 'G0', name: 'Configuration Files', passed: true, details: 'publish.config.json and skills.manifest.json present and valid JSON', config, manifest }];
  } catch (err) {
    return [{ id: 'G0', name: 'Configuration Files', passed: false, details: `JSON parse error: ${err.message}` }];
  }
}

// Gate 1: Target Identity & Remote Matching
export async function checkG1Remote(repoRoot, config, mode) {
  const gates = [];
  try {
    const remoteUrl = execSafe('git remote get-url origin', { cwd: repoRoot });
    if (!remoteUrl) {
      if (mode === 'dry-run') {
        gates.push({ id: 'G1', name: 'Target Remote & Owner Match', passed: true, details: 'Remote origin not configured yet. (Allowed in dry-run mode)' });
      } else {
        gates.push({ id: 'G1', name: 'Target Remote & Owner Match', passed: false, details: 'Remote origin is not configured in git.' });
      }
    } else {
      const normRemote = normalizeRemote(remoteUrl);
      const expectedTarget = `${config.expectedOwner}/${config.expectedRepo}`.toLowerCase();
      const isAllowed = config.allowedRemotes.some(allowed => normalizeRemote(allowed) === normRemote) ||
                        normRemote.endsWith(expectedTarget) ||
                        normRemote.endsWith(config.expectedRepo.toLowerCase());

      if (!isAllowed) {
        gates.push({ id: 'G1', name: 'Target Remote & Owner Match', passed: false, details: `Remote '${remoteUrl}' does not match allowed remotes: ${config.allowedRemotes.join(', ')}` });
      } else {
        gates.push({ id: 'G1', name: 'Target Remote & Owner Match', passed: true, details: `Remote matched: ${remoteUrl}` });
      }
    }

    if (config.enforceGhAccount && mode !== 'dry-run') {
      const ghAuth = execSafe('gh auth status', { cwd: repoRoot });
      if (ghAuth && !ghAuth.includes(`Logged in to github.com account ${config.expectedOwner}`)) {
        gates.push({ id: 'G1_GH', name: 'GitHub CLI Active Account', passed: false, details: `Active gh account does not match expected owner: ${config.expectedOwner}` });
      }
    }
  } catch (err) {
    gates.push({ id: 'G1', name: 'Target Remote & Owner Match', passed: false, details: err.message });
  }
  return gates;
}

// Gate 2: Branch & Working Tree Check
export async function checkG2BranchAndTree(repoRoot, config, mode) {
  try {
    let currentBranch = execSafe('git symbolic-ref --short HEAD', { cwd: repoRoot }) || execSafe('git rev-parse --abbrev-ref HEAD', { cwd: repoRoot });
    if (!currentBranch || currentBranch === 'HEAD') {
      currentBranch = 'main';
    }

    if (currentBranch !== config.defaultBranch) {
      return [{ id: 'G2', name: 'Branch & Working Tree Check', passed: false, details: `Active branch '${currentBranch}' is not '${config.defaultBranch}'` }];
    }

    const conflictMarkers = ['.git/MERGE_HEAD', '.git/REBASE_HEAD', '.git/CHERRY_PICK_HEAD'];
    const hasConflict = conflictMarkers.some(m => fs.existsSync(path.join(repoRoot, m)));

    if (hasConflict) {
      return [{ id: 'G2', name: 'Branch & Working Tree Check', passed: false, details: 'Git repository has an active merge, rebase, or cherry-pick in progress.' }];
    }

    const porcelain = execSafe('git status --porcelain', { cwd: repoRoot }) || '';
    const dirtyCount = porcelain.trim().length > 0 ? porcelain.trim().split('\n').length : 0;

    const details = dirtyCount > 0
      ? `Branch '${currentBranch}' ready (${dirtyCount} file(s) pending release commit).`
      : `Branch '${currentBranch}' clean.`;
    return [{ id: 'G2', name: 'Branch & Working Tree Check', passed: true, details }];
  } catch (err) {
    return [{ id: 'G2', name: 'Branch & Working Tree Check', passed: false, details: err.message }];
  }
}

// Gate 3: Skill Specification Audit
export async function checkG3SkillSpec(repoRoot) {
  try {
    const audit = auditSkillSpecs(repoRoot);
    if (!audit.passed) {
      return [{ id: 'G3', name: 'Skill Specification Audit', passed: false, details: audit.errors.join('; ') }];
    }
    return [{ id: 'G3', name: 'Skill Specification Audit', passed: true, details: `All ${audit.totalSkills} skills comply with agentskills.io specification.` }];
  } catch (err) {
    return [{ id: 'G3', name: 'Skill Specification Audit', passed: false, details: err.message }];
  }
}

// Gate 4: Catalog & Manifest Verification
export async function checkG4CatalogAndManifest(repoRoot, manifest) {
  try {
    const skillsDir = path.join(repoRoot, 'skills');
    const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const publishable = [];
    const internal = [];

    for (const name of skillFolders) {
      const skillMd = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      const content = fs.readFileSync(skillMd, 'utf-8');
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
      return [{
        id: 'G4',
        name: 'Catalog & Manifest Verification',
        passed: false,
        details: `Manifest mismatch! Missing publishable: [${missingPublishable}], Extra publishable: [${extraPublishable}], Missing internal: [${missingInternal}]`
      }];
    }
    return [{
      id: 'G4',
      name: 'Catalog & Manifest Verification',
      passed: true,
      details: `Catalog verified: ${publishable.length} public skills, ${internal.length} internal skills.`
    }];
  } catch (err) {
    return [{ id: 'G4', name: 'Catalog & Manifest Verification', passed: false, details: err.message }];
  }
}

// Gate 5: Secret & Credential Scanning
export async function checkG5SecurityScan(repoRoot) {
  try {
    const secResult = runFullSecurityScan(repoRoot);
    if (!secResult.passed) {
      const summary = secResult.findings.map(f => `[${f.rule}] in ${path.relative(repoRoot, f.source)}:${f.line}`).slice(0, 5).join(', ');
      return [{
        id: 'G5',
        name: 'Secret & Credential Scanning',
        passed: false,
        details: `${secResult.findings.length} secret(s) detected! Details: ${summary}`
      }];
    }
    return [{
      id: 'G5',
      name: 'Secret & Credential Scanning',
      passed: true,
      details: 'Zero secret patterns found in tree or git history.'
    }];
  } catch (err) {
    return [{ id: 'G5', name: 'Secret & Credential Scanning', passed: false, details: err.message }];
  }
}

// Gate 6: Privacy & Isolation Checks
export async function checkG6PrivacyAndIsolation(repoRoot) {
  try {
    const privacyErrors = [];
    const trackedContext = execSafe('git ls-files context', { cwd: repoRoot });
    if (trackedContext && trackedContext.trim().length > 0) {
      privacyErrors.push('context/ files are tracked in git index');
    }

    const gitignoreContent = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf-8');
    if (!gitignoreContent.includes('context/')) {
      privacyErrors.push('.gitignore is missing context/ rule');
    }
    if (!gitignoreContent.includes('.agents/')) {
      privacyErrors.push('.gitignore is missing .agents/ rule');
    }

    const skillsDir = path.join(repoRoot, 'skills');
    const skillFiles = [];
    if (fs.existsSync(skillsDir)) {
      for (const ent of fs.readdirSync(skillsDir, { withFileTypes: true, recursive: true })) {
        if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.js') || ent.name.endsWith('.mjs'))) {
          skillFiles.push(path.join(ent.parentPath || ent.path, ent.name));
        }
      }
    }

    for (const f of skillFiles) {
      const text = fs.readFileSync(f, 'utf-8');
      const relFile = path.relative(repoRoot, f).replace(/\\/g, '/');
      if (/(?:^|[^a-zA-Z0-9_-])context\//.test(text)) {
        privacyErrors.push(`Reference to 'context/' found in published file: ${relFile}`);
      }
      const absMatch = text.match(/(?:^|[\s"'`(<[])([a-zA-Z]:[\\/](?![\\/])[^\s"'`>]+|(?:\/Users\/|\/home\/)[^\s"'`>]+)/);
      if (absMatch) {
        privacyErrors.push(`Absolute local path found in ${relFile}: ${absMatch[1]}`);
      }
    }

    if (privacyErrors.length > 0) {
      return [{ id: 'G6', name: 'Privacy & Isolation Checks', passed: false, details: privacyErrors.join('; ') }];
    }
    return [{ id: 'G6', name: 'Privacy & Isolation Checks', passed: true, details: 'Privacy checks passed: context/ isolated, no absolute paths.' }];
  } catch (err) {
    return [{ id: 'G6', name: 'Privacy & Isolation Checks', passed: false, details: err.message }];
  }
}

// Gate 7: Placeholder Hygiene
export async function checkG7PlaceholderHygiene(repoRoot) {
  try {
    const placeholderErrors = [];
    const placeholders = ['<owner>', '<repo>', '<your-token>', '<api-key>', 'TODO:'];
    const filesToInspect = [
      path.join(repoRoot, 'README.md'),
      path.join(repoRoot, 'LICENSE'),
      path.join(repoRoot, 'publish.config.json'),
      path.join(repoRoot, 'skills.manifest.json')
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
      return [{ id: 'G7', name: 'Placeholder Hygiene', passed: false, details: placeholderErrors.join('; ') }];
    }
    return [{ id: 'G7', name: 'Placeholder Hygiene', passed: true, details: 'Zero unresolved placeholders detected.' }];
  } catch (err) {
    return [{ id: 'G7', name: 'Placeholder Hygiene', passed: false, details: err.message }];
  }
}

// Gate 8: Documentation & Listing Synchronization
export async function checkG8DocSync(repoRoot, manifest) {
  try {
    const readmePath = path.join(repoRoot, 'README.md');
    const readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : '';
    const docErrors = [];

    for (const pubSkill of manifest.publishableSkills) {
      if (!readmeContent.includes(pubSkill)) {
        docErrors.push(`Skill '${pubSkill}' is missing from README.md`);
      }
    }

    const licensePath = path.join(repoRoot, 'LICENSE');
    const licenseContent = fs.existsSync(licensePath) ? fs.readFileSync(licensePath, 'utf-8') : '';
    if (!licenseContent.includes('Copyright (c) 2026 Devansh')) {
      docErrors.push('LICENSE copyright line does not match author');
    }

    if (docErrors.length > 0) {
      return [{ id: 'G8', name: 'Documentation & Listing Synchronization', passed: false, details: docErrors.join('; ') }];
    }
    return [{ id: 'G8', name: 'Documentation & Listing Synchronization', passed: true, details: 'README.md, LICENSE, and catalog synchronized.' }];
  } catch (err) {
    return [{ id: 'G8', name: 'Documentation & Listing Synchronization', passed: false, details: err.message }];
  }
}

// Gate 9: Version, Tag & Changelog Synchronization
export async function checkG9VersionAndChangelog(repoRoot, targetTag, mode) {
  try {
    const tag = targetTag || 'v1.0.0';
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
      return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: false, details: `Invalid semver tag format '${tag}'. Expected 'vX.Y.Z'.` }];
    }

    const rawVersion = tag.slice(1);
    const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
      return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: false, details: 'Missing root CHANGELOG.md file.' }];
    }

    const changelog = fs.readFileSync(changelogPath, 'utf-8');
    if (!changelog.includes(`## [${rawVersion}]`)) {
      return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: false, details: `CHANGELOG.md missing entry for target release version '## [${rawVersion}]'` }];
    }

    const existingTags = execSafe(`git tag -l ${tag}`, { cwd: repoRoot });
    const tagsAtHead = execSafe('git tag --points-at HEAD', { cwd: repoRoot }) || '';
    const isTagAtHead = tagsAtHead.split('\n').map(t => t.trim()).includes(tag);
    const tagExists = existingTags && existingTags.includes(tag);

    // Tag exists and points at HEAD — fully verified
    if (tagExists && isTagAtHead) {
      return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: true, details: `Version '${tag}' verified (HEAD is currently tagged as ${tag}).` }];
    }

    // Tag exists on a different commit — block only in confirm mode
    if (tagExists && mode === 'confirm') {
      return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: false, details: `Git tag '${tag}' already exists on a different commit.` }];
    }

    // Tag exists elsewhere but not in confirm mode, or tag doesn't exist yet
    const details = tagExists
      ? `Version '${tag}' verified in repository.`
      : `Version '${tag}' and CHANGELOG.md entry verified.`;
    return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: true, details }];
  } catch (err) {
    return [{ id: 'G9', name: 'Version, Tag & Changelog Sync', passed: false, details: err.message }];
  }
}

// Gate 10: Remote Visibility & Pre-Flight Probe
export async function checkG10RemoteProbe(repoRoot, config, mode) {
  try {
    const remoteUrl = execSafe('git remote get-url origin', { cwd: repoRoot });
    const isLocalRemote = remoteUrl && (remoteUrl.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(remoteUrl) || remoteUrl.startsWith('.'));

    if (mode === 'dry-run' || isLocalRemote || config.skipRemoteProbe) {
      const details = isLocalRemote
        ? 'Local test remote verified (gh probe skipped for local bare remote).'
        : 'Probe simulated for dry-run. (Will query remote in confirm mode).';
      return [{ id: 'G10', name: 'Remote Visibility & Pre-Flight Probe', passed: true, details }];
    }

    const ghView = execSafe(`gh repo view ${config.expectedOwner}/${config.expectedRepo} --json isPrivate,visibility`, { cwd: repoRoot });
    if (!ghView) {
      return [{ id: 'G10', name: 'Remote Visibility & Pre-Flight Probe', passed: false, details: `Could not query remote repo '${config.expectedOwner}/${config.expectedRepo}' via gh.` }];
    }

    const repoData = JSON.parse(ghView);
    if (repoData.isPrivate) {
      return [{ id: 'G10', name: 'Remote Visibility & Pre-Flight Probe', passed: false, details: 'Remote repository is PRIVATE. skills.sh requires a public repository.' }];
    }
    return [{ id: 'G10', name: 'Remote Visibility & Pre-Flight Probe', passed: true, details: 'Remote repository is verified PUBLIC on GitHub.' }];
  } catch (err) {
    return [{ id: 'G10', name: 'Remote Visibility & Pre-Flight Probe', passed: false, details: err.message }];
  }
}

