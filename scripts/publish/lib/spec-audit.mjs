import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './git-utils.mjs';

// Simple YAML frontmatter parser for SKILL.md
export function parseFrontmatter(content) {
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

// Reusable skill specification audit (Gate 3)
export function auditSkillSpecs(repoRoot = REPO_ROOT) {
  const skillsDir = path.join(repoRoot, 'skills');
  if (!fs.existsSync(skillsDir)) {
    return { passed: false, errors: ['skills/ directory missing'], totalSkills: 0 };
  }
  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  const specErrors = [];

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

    // Check references structure (allow flat files and non-empty modular domain subdirectories)
    const refDir = path.join(skillPath, 'references');
    if (fs.existsSync(refDir)) {
      const refEntries = fs.readdirSync(refDir, { withFileTypes: true });
      for (const re of refEntries) {
        if (re.isFile() && re.name.endsWith('.md')) {
          if (skillName === 'create-nww-website') {
            specErrors.push(`${skillName}: Forbidden loose markdown file '${re.name}' directly in references/ (all markdown must reside inside gate directories)`);
          }
        }
        if (re.isDirectory()) {
          const subDir = path.join(refDir, re.name);
          const subEntries = fs.readdirSync(subDir);
          if (subEntries.length === 0) {
            specErrors.push(`${skillName}: Empty directory '${re.name}' in references/`);
          }
        }
      }
    }
  }

  return {
    passed: specErrors.length === 0,
    errors: specErrors,
    totalSkills: skillFolders.length
  };
}

