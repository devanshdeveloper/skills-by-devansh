---
name: nww
description: Fast shortcut alias to start the NWW website pipeline. Use when the user types 'nww', 'start nww', or '/nww'.
---

# NWW Shortcut Alias

This skill is a lightweight alias for `create-nww-website`.

---

## Quick Start

### 1. Install

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill nww
```

### 2. Starter Prompt

```text
nww
```

> The agent immediately activates the `create-nww-website` pipeline. You can also fast-track Gate 0 by typing `nww` followed by your project brief — the skill will extract all known answers in one pass.
>
> For a complete brief template, see the [`create-nww-website` Quick Start](../create-nww-website/SKILL.md#quick-start).

---

## When to Use


- When the user runs `/nww` or enters shortcut trigger phrases such as `"nww"` or `"start nww"`.
- When quick activation of the Next Web Website (NWW) site creation pipeline is requested.

## Execution Procedure

1. **Activate Entry Skill:**
   - Immediately activate and delegate execution to the [create-nww-website](../create-nww-website/SKILL.md) skill.

2. **Mandatory Start-Up Rule:**
   - Adhere strictly to the activation protocol defined in `create-nww-website`: always begin with the read-only brief check (`project-docs/client-answers.md`) and immediately present Batch 1 of the intake questionnaire.
   - Do not perform any preliminary file reading, repository scanning, planning, command execution, or code generation before the intake questionnaire is presented.
