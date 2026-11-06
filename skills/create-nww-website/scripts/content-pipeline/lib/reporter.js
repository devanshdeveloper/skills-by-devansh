/**
 * Diagnostic Reporter for Content Pipeline CLI
 *
 * Formats table summaries, error diagnostics, and machine-readable JSON outputs.
 */

import process from 'node:process';

/**
 * Prints a section divider.
 *
 * @param {string} title
 */
export function printHeader(title) {
  process.stdout.write(`\n=================================================================\n`);
  process.stdout.write(`  ${title}\n`);
  process.stdout.write(`=================================================================\n`);
}

/**
 * Prints an issue entry.
 *
 * @param {'ERROR' | 'WARN' | 'INFO' | 'PASS'} severity
 * @param {string} code
 * @param {string} message
 * @param {string} [source]
 */
export function printIssue(severity, code, message, source = '') {
  const icon = severity === 'PASS' ? '✓' : severity === 'ERROR' ? '✗' : '⚠';
  const tag = `[${severity}]`.padEnd(8);
  const src = source ? ` (${source})` : '';
  process.stdout.write(`  ${icon} ${tag} ${code}: ${message}${src}\n`);
}

/**
 * Handles CLI exit with status code and optional summary.
 *
 * @param {boolean} passed
 * @param {object} [jsonPayload]
 * @param {boolean} [asJson]
 */
export function finishCli(passed, jsonPayload = null, asJson = false) {
  if (asJson && jsonPayload) {
    process.stdout.write(JSON.stringify(jsonPayload, null, 2) + '\n');
  } else {
    process.stdout.write(`-----------------------------------------------------------------\n`);
    if (passed) {
      process.stdout.write(`✓ SUCCESS: All checks passed with zero errors.\n\n`);
    } else {
      process.stderr.write(`✗ FAILED: One or more validation errors detected.\n\n`);
    }
  }
  process.exitCode = passed ? 0 : 1;
}

