import fs from 'node:fs';
import path from 'node:path';

import { visualRules } from './rules/visual.mjs';
import { copyRules } from './rules/copy.mjs';
import { structureRules } from './rules/structure.mjs';
import { codeRules } from './rules/code.mjs';

export class RuleRegistry {
  constructor() {
    this.rules = [
      ...visualRules,
      ...copyRules,
      ...structureRules,
      ...codeRules
    ];
    this.whitelist = [];
    this.disabledRuleIds = new Set();
    this.customRules = [];
  }

  // Load project-level custom rules and whitelists maintained by repository owners
  loadProjectConfig(targetRoot) {
    const candidateFiles = [
      path.join(targetRoot, '.agents', 'rules', 'anti-slop.md'),
      path.join(targetRoot, 'anti-slop.rules.json'),
      path.join(targetRoot, '.anti-slop.json')
    ];

    for (const confPath of candidateFiles) {
      if (!fs.existsSync(confPath)) continue;
      try {
        if (confPath.endsWith('.json')) {
          const parsed = JSON.parse(fs.readFileSync(confPath, 'utf-8'));
          if (Array.isArray(parsed.whitelist)) {
            this.whitelist.push(...parsed.whitelist.map(w => w.toLowerCase()));
          }
          if (Array.isArray(parsed.disabledRules)) {
            parsed.disabledRules.forEach(id => this.disabledRuleIds.add(id));
          }
          if (Array.isArray(parsed.customPatterns)) {
            for (const c of parsed.customPatterns) {
              if (c.id && c.pattern) {
                this.customRules.push({
                  id: c.id,
                  category: c.category || 'custom',
                  name: c.name || c.id,
                  description: c.description || 'Custom project rule',
                  pattern: new RegExp(c.pattern, c.flags || 'gi'),
                  action: c.action || 'Delete matched pattern'
                });
              }
            }
          }
        } else if (confPath.endsWith('.md')) {
          // Extract whitelist terms from markdown bullet list under a ## Whitelist header
          const text = fs.readFileSync(confPath, 'utf-8');
          const wlMatch = text.match(/##\s*Whitelist[\s\S]*?(?=##|$)/i);
          if (wlMatch) {
            const items = wlMatch[0].match(/`([^`]+)`/g);
            if (items) {
              this.whitelist.push(...items.map(s => s.replace(/`/g, '').toLowerCase()));
            }
          }
        }
      } catch (err) {
        // Silently skip corrupted local configs
      }
    }
  }

  isWhitelisted(text) {
    if (!text || this.whitelist.length === 0) return false;
    const lower = text.toLowerCase();
    return this.whitelist.some(w => lower.includes(w));
  }

  // Evaluates a single file and returns structured findings
  evaluateFile(filePath, content) {
    const findings = [];
    const activeRules = [...this.rules, ...this.customRules].filter(
      r => !this.disabledRuleIds.has(r.id)
    );

    const lines = content.split('\n');

    // 1. Line-by-line single-pass inspection for line-oriented rules
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (!trimmed) return;

      for (const rule of activeRules) {
        // If rule has a custom match function
        if (typeof rule.match === 'function') {
          if (rule.match(line)) {
            if (!this.isWhitelisted(line)) {
              findings.push({
                file: filePath,
                line: lineNum,
                ruleId: rule.id,
                category: rule.category,
                name: rule.name,
                matchText: trimmed.slice(0, 100),
                action: rule.action
              });
            }
          }
          continue;
        }

        // Standard regex pattern matching per line
        if (rule.pattern) {
          rule.pattern.lastIndex = 0;
          let match;
          while ((match = rule.pattern.exec(line)) !== null) {
            const matchedText = match[0].trim();
            if (!this.isWhitelisted(matchedText)) {
              findings.push({
                file: filePath,
                line: lineNum,
                ruleId: rule.id,
                category: rule.category,
                name: rule.name,
                matchText: matchedText.slice(0, 100),
                action: rule.action
              });
            }
            if (!rule.pattern.global) break;
          }
        }
      }
    });

    // 2. Block/multiline inspection for structural and JSX block rules
    const multilineRules = activeRules.filter(
      r => r.category === 'structure' || r.id === 'code-dead-jsx-block' || r.id === 'visual-glow-blob'
    );

    for (const rule of multilineRules) {
      if (!rule.pattern) continue;
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        const matchedText = match[0].trim();
        if (this.isWhitelisted(matchedText)) continue;

        // Approximate line number from character offset
        const lineNum = content.slice(0, match.index).split('\n').length;
        // Avoid duplicate findings if already captured by line scanner
        const alreadyFlagged = findings.some(
          f => f.file === filePath && f.line === lineNum && f.ruleId === rule.id
        );

        if (!alreadyFlagged) {
          findings.push({
            file: filePath,
            line: lineNum,
            ruleId: rule.id,
            category: rule.category,
            name: rule.name,
            matchText: matchedText.slice(0, 120),
            action: rule.action
          });
        }
        if (!rule.pattern.global) break;
      }
    }

    return findings;
  }
}
