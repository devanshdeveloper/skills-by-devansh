#!/usr/bin/env node

/**
 * jsonld-validator.mjs
 *
 * Deterministic JSON-LD schema syntax and structure validator for integrate-nww-cms.
 * Validates that structured data strings or files comply with Schema.org JSON-LD requirements:
 *   - Must be valid JSON
 *   - Must contain '@context': 'https://schema.org'
 *   - Must contain a valid '@type'
 *   - Checks that '<' is safely escaped as '\\u003c' for XSS protection in script tags
 *
 * Usage:
 *   node scripts/jsonld-validator.mjs --string '<raw-json-ld>'
 *   node scripts/jsonld-validator.mjs --file <json-file>
 *   node scripts/jsonld-validator.mjs --audit [--target <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function printHelp() {
  console.log(`
jsonld-validator CLI - Schema.org JSON-LD Structured Data Validator

Usage:
  node scripts/jsonld-validator.mjs [options]

Options:
  --string '<json>'    Validate inline JSON-LD string
  --file <path>        Validate JSON-LD file on disk
  --audit              Audit all discovered JSON-LD across target site pages
  --target <dir>       Target repository directory (default: current working directory)
  --help, -h           Display this help message
`);
}

function parseCliArgs(rawArgs) {
  const options = {
    string: null,
    file: null,
    audit: false,
    target: process.cwd(),
    help: false
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--string') {
      options.string = rawArgs[++i];
    } else if (arg.startsWith('--string=')) {
      options.string = arg.split('=')[1];
    } else if (arg === '--file') {
      options.file = rawArgs[++i];
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg === '--audit') {
      options.audit = true;
    } else if (arg === '--target') {
      options.target = rawArgs[++i];
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1];
    }
  }

  return options;
}

export function validateJsonLd(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { isValid: false, error: 'JSON-LD content is empty or null' };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { isValid: false, error: `Invalid JSON syntax: ${err.message}` };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { isValid: false, error: 'JSON-LD root must be a JSON object or array' };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (typeof item !== 'object' || item === null) {
      return { isValid: false, error: `Item at index ${idx} is not an object` };
    }

    // Check @context
    const context = item['@context'];
    if (!context) {
      return { isValid: false, error: `Item at index ${idx} is missing '@context'` };
    }
    const contextStr = String(context).toLowerCase();
    if (!contextStr.includes('schema.org')) {
      return { isValid: false, error: `Item at index ${idx} '@context' must be 'https://schema.org' (found: ${context})` };
    }

    // Check @type
    const type = item['@type'];
    if (!type || typeof type !== 'string' || !type.trim()) {
      return { isValid: false, error: `Item at index ${idx} is missing or has invalid '@type'` };
    }
  }

  // Safe serialized representation with \u003c escaping
  const safeSerialized = JSON.stringify(parsed).replace(/</g, '\\u003c');

  return {
    isValid: true,
    type: items.map(it => it['@type']).join(', '),
    itemCount: items.length,
    safeJson: safeSerialized
  };
}

// Main execution
const options = parseCliArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.string) {
  const result = validateJsonLd(options.string);
  if (!result.isValid) {
    console.error(`✗ JSON-LD Validation FAILED: ${result.error}`);
    process.exit(1);
  }
  console.log(`✓ JSON-LD Validated: Type '${result.type}' (${result.itemCount} entity)`);
  console.log(`Safe XSS-escaped string: ${result.safeJson.slice(0, 100)}...`);
  process.exit(0);
}

if (options.file) {
  const filePath = path.resolve(options.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, 'utf-8');
  const result = validateJsonLd(text);
  if (!result.isValid) {
    console.error(`✗ File '${path.basename(filePath)}' JSON-LD FAILED: ${result.error}`);
    process.exit(1);
  }
  console.log(`✓ File '${path.basename(filePath)}' Validated: Type '${result.type}'`);
  process.exit(0);
}

if (options.audit) {
  const baseDir = path.resolve(options.target);
  const auditPath = path.join(baseDir, '.nww-cms', 'audit.json');
  console.log(`Auditing JSON-LD implementation in ${baseDir}...`);
  if (!fs.existsSync(auditPath)) {
    console.log('Notice: .nww-cms/audit.json not found. Run site-audit first.');
  } else {
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
    console.log(`Existing site JSON-LD detected: ${auditData.seo?.hasJsonLd ? 'Yes' : 'No'}`);
  }
  process.exit(0);
}

printHelp();
