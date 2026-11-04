#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  execSafe,
  normalizeRemote,
  inferLatestTag,
  REPO_ROOT
} from './lib/git-utils.mjs';

import {
  parseFrontmatter,
  auditSkillSpecs
} from './lib/spec-audit.mjs';

import {
  checkG0Config,
  checkG1Remote,
  checkG2BranchAndTree,
  checkG3SkillSpec,
  checkG4CatalogAndManifest,
  checkG5SecurityScan,
  checkG6PrivacyAndIsolation,
  checkG7PlaceholderHygiene,
  checkG8DocSync,
  checkG9VersionAndChangelog,
  checkG10RemoteProbe
} from './lib/gates.mjs';

const __filename = fileURLToPath(import.meta.url);

// Main preflight checks orchestrator
export async function runPreflightChecks(options = {}) {
  const repoRoot = options.repoRoot || REPO_ROOT;
  const mode = options.mode || 'dry-run';
  const targetTag = options.targetTag || inferLatestTag(repoRoot);
  const parallel = options.parallel !== false;

  const results = {
    mode,
    targetTag,
    timestamp: new Date().toISOString(),
    passed: true,
    gates: {},
    elapsedMs: 0
  };

  const t0 = Date.now();

  // Prerequisite: Gate 0 configuration
  const g0Results = await checkG0Config(repoRoot);
  for (const g of g0Results) {
    results.gates[g.id] = { name: g.name, passed: g.passed, details: g.details };
    if (!g.passed) {
      results.passed = false;
      results.elapsedMs = Date.now() - t0;
      return results;
    }
  }

  const { config, manifest } = g0Results[0];

  // Factory functions to avoid starting all checks eagerly in sequential mode
  const gateFactories = [
    () => checkG1Remote(repoRoot, config, mode),
    () => checkG2BranchAndTree(repoRoot, config, mode),
    () => checkG3SkillSpec(repoRoot),
    () => checkG4CatalogAndManifest(repoRoot, manifest),
    () => checkG5SecurityScan(repoRoot),
    () => checkG6PrivacyAndIsolation(repoRoot),
    () => checkG7PlaceholderHygiene(repoRoot),
    () => checkG8DocSync(repoRoot, manifest),
    () => checkG9VersionAndChangelog(repoRoot, targetTag, mode),
    () => checkG10RemoteProbe(repoRoot, config, mode)
  ];

  let gateResults;
  if (parallel) {
    gateResults = (await Promise.all(gateFactories.map(fn => fn()))).flat();
  } else {
    gateResults = [];
    for (const fn of gateFactories) {
      gateResults.push(...(await fn()));
    }
  }

  for (const g of gateResults) {
    results.gates[g.id] = { name: g.name, passed: g.passed, details: g.details };
    if (!g.passed) {
      results.passed = false;
    }
  }

  results.elapsedMs = Date.now() - t0;
  return results;
}

// Re-exports for backwards compatibility with external scripts, CLI, and test fixtures
export {
  execSafe,
  normalizeRemote,
  inferLatestTag,
  parseFrontmatter,
  auditSkillSpecs,
  checkG0Config,
  checkG1Remote,
  checkG2BranchAndTree,
  checkG3SkillSpec,
  checkG4CatalogAndManifest,
  checkG5SecurityScan,
  checkG6PrivacyAndIsolation,
  checkG7PlaceholderHygiene,
  checkG8DocSync,
  checkG9VersionAndChangelog,
  checkG10RemoteProbe
};

// CLI runner if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const mode = process.argv.includes('--confirm') ? 'confirm' : 'dry-run';
  const isThorough = process.argv.includes('--thorough');
  const tagArg = process.argv.find(a => a.startsWith('--tag='));
  const targetTag = tagArg ? tagArg.split('=')[1] : null;

  const t0 = Date.now();
  runPreflightChecks({ mode, targetTag, parallel: !isThorough }).then(results => {
    console.log(`=================================================================`);
    console.log(`  SKILLS-BY-DEVANSH PREFLIGHT VALIDATION (Mode: ${results.mode}, Tag: ${results.targetTag})`);
    console.log(`=================================================================`);

    for (const [id, gate] of Object.entries(results.gates)) {
      const icon = gate.passed ? '✓' : '✗';
      console.log(`  ${icon} [${id}] ${gate.name}: ${gate.details}`);
    }

    console.log(`-----------------------------------------------------------------`);
    if (results.passed) {
      console.log(`✓ ALL GATES PASSED. Ready for release flow. (${((Date.now() - t0) / 1000).toFixed(2)}s)`);
      process.exit(0);
    } else {
      console.error(`✗ PREFLIGHT FAILED. Blocking release.`);
      process.exit(1);
    }
  }).catch(err => {
    console.error(`Fatal preflight error: ${err.message}`);
    process.exit(1);
  });
}
