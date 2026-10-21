#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../scripts/publish/preflight.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('  RUNNING FIXTURE-BASED TESTS (ZERO DEPENDENCY)');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

function invokeHook(scriptRelativePath, payload) {
  const scriptPath = path.join(REPO_ROOT, scriptRelativePath);
  const jsonPayload = JSON.stringify(payload);
  const result = execSync(`node "${scriptPath}"`, {
    input: jsonPayload,
    encoding: 'utf-8',
    cwd: REPO_ROOT,
    stdio: ['pipe', 'pipe', 'ignore']
  });
  return JSON.parse(result.trim());
}

// -----------------------------------------------------------------------------
// 1. edit-guard.mjs tests
// -----------------------------------------------------------------------------
console.log('--- Testing edit-guard.mjs ---');

runTest('edit-guard: allows standard non-destructive command', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'npm test' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('edit-guard: blocks sed -i scripted edit', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'sed -i "s/foo/bar/g" file.txt' } }
  });
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /scripted file modification/i);
});

runTest('edit-guard: blocks shell file redirection (>)', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'echo "bad" > test.txt' } }
  });
  assert.equal(res.decision, 'deny');
});

runTest('edit-guard: blocks local npx skills without DISABLE_TELEMETRY=1', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'npx skills add . --list' } }
  });
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /DISABLE_TELEMETRY=1/);
});

runTest('edit-guard: allows local npx skills with DISABLE_TELEMETRY=1', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'DISABLE_TELEMETRY=1 npx skills add . --list' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('edit-guard: prompts confirmation for destructive git reset --hard', () => {
  const res = invokeHook('.agents/hooks/edit-guard.mjs', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git reset --hard HEAD~1' } }
  });
  assert.equal(res.decision, 'force_ask');
});

// -----------------------------------------------------------------------------
// 2. secret-guard.mjs tests
// -----------------------------------------------------------------------------
console.log('\n--- Testing secret-guard.mjs ---');

runTest('secret-guard: allows ordinary source file writes', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: 'src/app/page.tsx', CodeContent: 'export default () => <div>Hello</div>' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('secret-guard: allows reading and writing .env.example', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: '.env.example', CodeContent: 'PORT=3000' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('secret-guard: allows modifying secret-guard.mjs itself', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'replace_file_content', args: { TargetFile: '.agents/hooks/secret-guard.mjs' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('secret-guard: denies viewing .env', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'view_file', args: { AbsolutePath: 'c:/repo/.env' } }
  });
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /\.env/);
});

runTest('secret-guard: denies modifying .env.local', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: '.env.local', CodeContent: 'SECRET=123' } }
  });
  assert.equal(res.decision, 'deny');
});

runTest('secret-guard: denies modifying private key files', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: 'id_rsa', CodeContent: 'private' } }
  });
  assert.equal(res.decision, 'deny');
});

runTest('secret-guard: allows SKILL.md under 500 lines', () => {
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: 'skills/test/SKILL.md', CodeContent: '---\nname: test\n---\nShort file' } }
  });
  assert.equal(res.decision, 'allow');
});

runTest('secret-guard: blocks SKILL.md exceeding 500 lines', () => {
  const oversizedLines = new Array(510).fill('content line').join('\n');
  const res = invokeHook('.agents/hooks/secret-guard.mjs', {
    toolCall: { name: 'write_to_file', args: { TargetFile: 'skills/test/SKILL.md', CodeContent: oversizedLines } }
  });
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /500-line limit/);
});

// -----------------------------------------------------------------------------
// 3. Frontmatter & Fixture Tests
// -----------------------------------------------------------------------------
console.log('\n--- Testing Frontmatter Parser & Specification Fixtures ---');

runTest('frontmatter: parses valid sample skill fixture', () => {
  const fixturePath = path.join(__dirname, 'fixtures/sample-valid-skill/SKILL.md');
  const content = fs.readFileSync(fixturePath, 'utf-8');
  const parsed = parseFrontmatter(content);
  assert.ok(parsed, 'Frontmatter should parse');
  assert.equal(parsed.name, 'sample-valid-skill');
  assert.match(parsed.description, /valid sample skill fixture/);
});

runTest('frontmatter: detects oversized fixture (>500 lines)', () => {
  const fixturePath = path.join(__dirname, 'fixtures/sample-oversized-skill/oversized.fixture.md');
  const content = fs.readFileSync(fixturePath, 'utf-8');
  const lineCount = content.split('\n').length;
  assert.ok(lineCount > 500, `Fixture should have >500 lines, found: ${lineCount}`);
});

console.log('\n====================================================');
console.log(`  TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
