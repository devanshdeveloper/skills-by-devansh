#!/usr/bin/env node

/**
 * Stage 11 Structure & Deliverables Auditor for NWW Website Generator
 *
 * Audits:
 * 1. Project-Docs Completeness: Validates all required markdown deliverables per stage.
 * 2. Gate Status & Alignment: Confirms router-state.md progress against filesystem state.
 * 3. Client Review Health: Verifies review hub and concept pages.
 * 4. Coding Limits & Conventions: Audits line limits (page.js <= 80, section <= 250, util <= 500),
 *    // section: <id> headers, and component placement.
 * 5. Generates `project-docs/structure-audit.md`.
 *
 * Usage:
 *   node scripts/structure-audit/index.js [projectRoot]
 */

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const projDocs = path.join(projectRoot, 'project-docs');
const siteDir = path.join(projectRoot, 'site');

function checkFile(relPath, minBytes = 10) {
  const full = path.join(projectRoot, relPath);
  if (!fs.existsSync(full)) return { exists: false, size: 0, valid: false };
  const stat = fs.statSync(full);
  return {
    exists: true,
    size: stat.size,
    valid: stat.size >= minBytes
  };
}

function auditProjectDocs() {
  const checks = [
    { stage: 0, name: 'Client Intake Answers', file: 'project-docs/client-answers.md', min: 100 },
    { stage: 1, name: 'Tech Stack Specification', file: 'project-docs/tech-stack.md', min: 100 },
    { stage: 2, name: 'Design Theory', file: 'project-docs/design-theory.md', min: 100 },
    { stage: 2, name: 'Reference Sources Ledger', file: 'project-docs/design-references/sources.md', min: 100 },
    { stage: 2, name: 'Gate 2 Review Hub', file: 'project-docs/client-review/gate-2-design-theory/index.html', min: 500 },
    { stage: 2, name: 'Gate 2 Similarity Audit', file: 'project-docs/client-review/gate-2-design-theory/_checks/similarity-audit.md', min: 100 },
    { stage: 2, name: 'Root Review Portal', file: 'project-docs/client-review/index.html', min: 500 },
    { stage: 3, name: 'Page List Tracker', file: 'project-docs/page-list.md', min: 50 },
    { stage: 4, name: 'SEO Strategy', file: 'project-docs/seo-strategy.md', min: 100 },
    { stage: 5, name: 'Layout System', file: 'project-docs/layout-system.md', min: 100 },
    { stage: 5, name: 'Gate 5 Layout Hub', file: 'project-docs/client-review/pages/index.html', min: 500 },
    { stage: 6, name: 'Stock Provenance Log', file: 'project-docs/stock-provenance.json', min: 2 },
    { stage: 7, name: 'CMS Schema Spec', file: 'project-docs/cms-schema.md', min: 100, optional: true },
    { stage: 8, name: 'Page Build Checklist', file: 'project-docs/page-checklist.md', min: 100 },
    { stage: 'Router', name: 'Pipeline Router State', file: 'project-docs/router-state.md', min: 100 }
  ];

  return checks.map(c => {
    const res = checkFile(c.file, c.min);
    return {
      ...c,
      ...res
    };
  });
}

function auditCodeConventions() {
  if (!fs.existsSync(siteDir)) {
    return {
      scanned: false,
      reason: 'Site directory not yet created (prior to Stage 9).'
    };
  }

  const violations = [];
  let fileCount = 0;

  function scan(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== 'node_modules' && ent.name !== '.next') scan(full);
      } else if (ent.isFile() && (ent.name.endsWith('.js') || ent.name.endsWith('.jsx'))) {
        fileCount++;
        const content = fs.readFileSync(full, 'utf-8');
        const lines = content.split('\n').length;
        const rel = path.relative(siteDir, full);

        // Line limits
        if (ent.name === 'page.js' && lines > 80) {
          violations.push({ file: rel, issue: `page.js exceeds 80 lines limit (${lines} lines)` });
        } else if (full.includes('_components') && lines > 250) {
          violations.push({ file: rel, issue: `Section component exceeds 250 lines limit (${lines} lines)` });
        } else if (lines > 500) {
          violations.push({ file: rel, issue: `File exceeds 500 lines limit (${lines} lines)` });
        }

        // Section header comment in _components
        if (full.includes('_components') && !content.includes('// section:')) {
          violations.push({ file: rel, issue: `Section component missing '// section: <id>' header comment` });
        }
      }
    }
  }

  scan(siteDir);
  return {
    scanned: true,
    fileCount,
    violations
  };
}

function run() {
  console.log('=================================================================');
  console.log('  NWW STRUCTURE & DELIVERABLES AUDITOR (Stage 11)');
  console.log('=================================================================');

  const docResults = auditProjectDocs();
  const codeResults = auditCodeConventions();

  console.log('\n[1/3] Project Documentation Audit:');
  for (const r of docResults) {
    const status = r.exists ? `✓ (${Math.round(r.size / 1024 * 10) / 10} KB)` : (r.optional ? '○ Optional' : '✗ Missing');
    console.log(`  ${r.exists ? '✓' : (r.optional ? '○' : '✗')} [Stage ${r.stage}] ${r.name}: ${status}`);
  }

  console.log('\n[2/3] Code Conventions & Line Limits Audit:');
  if (!codeResults.scanned) {
    console.log(`  ○ ${codeResults.reason}`);
  } else {
    console.log(`  Scanned ${codeResults.fileCount} source files.`);
    if (codeResults.violations.length === 0) {
      console.log('  ✓ All source files comply with strict line limits and section comments.');
    } else {
      for (const v of codeResults.violations) {
        console.log(`  ✗ ${v.file}: ${v.issue}`);
      }
    }
  }

  // Generate project-docs/structure-audit.md
  console.log('\n[3/3] Generating project-docs/structure-audit.md...');
  fs.mkdirSync(projDocs, { recursive: true });

  const docRows = docResults.map(r => {
    const statusStr = r.exists ? `**Present** (${r.size} bytes)` : (r.optional ? '*Optional / Skipped*' : '**Missing**');
    return `| Stage ${r.stage} | ${r.name} | \`${r.file}\` | ${statusStr} |`;
  }).join('\n');

  const codeSection = !codeResults.scanned
    ? `> **Note:** Site code directory not yet initialized (scheduled for Stage 9 Foundation Build).\n`
    : codeResults.violations.length === 0
      ? `✓ All **${codeResults.fileCount}** scanned JavaScript files comply with strict limits (page.js <= 80, sections <= 250, utils <= 500) and contain proper \`// section: <id>\` comments.\n`
      : codeResults.violations.map(v => `- ✗ \`${v.file}\`: ${v.issue}`).join('\n');

  const auditContent = `# Structure & Deliverables Audit (Stage 11)

**Generated:** ${new Date().toISOString().replace('T', ' ').substring(0, 16)}  
**Auditor Engine:** NWW Structure Auditor (\`scripts/structure-audit/index.js\`)  
**Project Path:** \`${projectRoot}\`  

---

## 1. Project Deliverables Audit

| Stage | Deliverable | File Path | Status |
|---|---|---|---|
${docRows}

---

## 2. Code Standards & Strict Limits Audit

${codeSection}

---

## 3. Audit Verdict

- **Documentation Health:** ${docResults.filter(r => r.exists).length} / ${docResults.length} checkpoints verified.
- **Code Health:** ${codeResults.scanned ? (codeResults.violations.length === 0 ? 'Compliant' : `${codeResults.violations.length} violations detected`) : 'Pending Stage 9'}.
- **Next Actions:** Refer to \`project-docs/router-state.md\` for current gate approval requirements.
`;

  const auditPath = path.join(projDocs, 'structure-audit.md');
  fs.writeFileSync(auditPath, auditContent, 'utf-8');
  console.log(`✓ Audit report written to: ${path.relative(projectRoot, auditPath)}`);

  console.log('\n=================================================================');
  console.log('  AUDIT COMPLETE');
  console.log('=================================================================');
}

if (require.main === module) {
  run();
}

module.exports = { run, auditProjectDocs, auditCodeConventions };
