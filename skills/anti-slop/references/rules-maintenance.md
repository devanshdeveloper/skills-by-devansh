# Rule Maintainer Guide (`anti-slop`)

This runbook documents how developers and repository maintainers can configure, extend, and maintain project-specific anti-slop rules when this skill is installed into a codebase.

---

## 1. Overview

While `anti-slop` provides battle-tested defaults across visual, copy, structural, and code patterns, real-world repositories frequently have unique design systems, legitimate technical vocabulary, or company-specific terms that must be preserved. 

The Rule Maintainer system enables two capabilities:
1. **Whitelisting**: Protecting authentic brand terms, genuine statistics, or intentional aesthetic choices from being flagged as slop.
2. **Custom Patterns**: Registering project-specific forbidden buzzwords, obsolete component tags, or legacy utility classes to purge.

---

## 2. Configuration Options

Project-level rules can be maintained in either markdown or JSON format at the repository root:

### Option A: Markdown Rule (`.agents/rules/anti-slop.md`)

Create or update `.agents/rules/anti-slop.md`:

```markdown
# Local Anti-Slop Rules

## Whitelist
The following terms are authentic brand properties or verified domain terminology and must never be removed:
- `unleash` (part of brand slogan)
- `99.9%` (verified SLA uptime guarantee)
- `sarah jenkins` (actual company founder)
- `gradient-brand` (official design token)
```

### Option B: JSON Configuration (`anti-slop.rules.json`)

Create `anti-slop.rules.json` in the root of the target project:

```json
{
  "whitelist": [
    "unleash",
    "99.9%",
    "sarah jenkins",
    "gradient-brand"
  ],
  "disabledRules": [
    "copy-em-dash-cluster"
  ],
  "customPatterns": [
    {
      "id": "custom-legacy-btn",
      "category": "visual",
      "name": "Deprecated Legacy Button Class",
      "description": "Purge obsolete legacy button utility wrappers",
      "pattern": "\\bbtn-legacy-glow\\b",
      "action": "Delete btn-legacy-glow class"
    }
  ]
}
```

---

## 3. Configuration Fields

| Field | Type | Description |
|---|---|---|
| `whitelist` | `string[]` | Substrings or keywords that suppress slop detection when matched. Case-insensitive. |
| `disabledRules` | `string[]` | Array of default rule IDs to turn off (e.g. `visual-glassmorphism`, `copy-em-dash-cluster`). |
| `customPatterns` | `object[]` | Custom regex patterns to add to the registry during scanning. |
| `customPatterns[].id` | `string` | Unique identifier for the custom rule. |
| `customPatterns[].category` | `string` | `visual`, `copy`, `structure`, or `code`. |
| `customPatterns[].name` | `string` | Human-readable title displayed in the plan. |
| `customPatterns[].pattern` | `string` | Regular expression string. |
| `customPatterns[].action` | `string` | Prescribed deletion action. |

---

## 4. Maintenance Workflow

When auditing or refining rules in a repository:
1. **Audit Current Scan**:
   ```bash
   node skills/anti-slop/scripts/slop-scan/index.mjs --target=.
   ```
2. **Review False Positives**:
   If legitimate copy or intentional design elements appear in the candidate list, add the specific terms to `whitelist`.
3. **Verify Suppression**:
   Re-run the scan and confirm false positives no longer appear in the generated plan.
