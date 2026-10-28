---
name: nww
description: Fast shortcut alias to start the NWW website pipeline. Use when the user types 'nww', 'start nww', or '/nww'.
---

# NWW Shortcut Alias

> [!IMPORTANT]
> **Do Not Edit Skill Files:** Skill files are immutable runbooks. Never edit skill files directly; instead, request changes with a prompt.

This skill is a lightweight alias for `create-nww-website`.

---

## Quick Start

### 1. Install & Update (Hard Pull Latest Skills)

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill nww -y
```

> **New Chat / Session Rule:** If starting in a **new chat** or continuing a project in a fresh session, always **hard pull / update** the latest skills to ensure you have the newest gate runbooks, crawler limit options, and bugfixes:
> ```bash
> DISABLE_TELEMETRY=1 npx skills update nww create-nww-website -y
> # Or hard re-fetch directly from GitHub:
> DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill nww -y
> ```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@nww
```

> **Tip (Windows PowerShell):** Use `$env:DISABLE_TELEMETRY="1"; npx skills update nww create-nww-website -y`

### 2. Starter Prompt

```text
nww
```

> **Note for New Chats:** If this is a new chat, ensure your assistant has hard-pulled the latest skills before typing `nww`.
> The agent immediately activates the `create-nww-website` pipeline. You can also fast-track Gate 0 by typing `nww` followed by your project brief — the skill will extract all known answers in one pass.
>
> For a complete brief template, see the [`create-nww-website` Quick Start](../create-nww-website/SKILL.md#quick-start).

---

## When to Use


- When the user runs `/nww` or enters shortcut trigger phrases such as `"nww"` or `"start nww"`.
- When quick activation of the Next Web Website (NWW) site creation pipeline is requested.

## Execution Procedure

0. **New Chat / Fresh Session Rule (Hard Pull Latest Skills):**
   - If this is a **new chat**, new session, or starting a new project, verify or hard pull the latest version of `nww` and `create-nww-website` from GitHub before proceeding:
     ```bash
     DISABLE_TELEMETRY=1 npx skills update nww create-nww-website -y
     ```

1. **Activate Entry Skill:**
   - Immediately activate and delegate execution to the [create-nww-website](../create-nww-website/SKILL.md) skill.

2. **Mandatory Start-Up Rule & Skill Immutability:**
   - Skill files are immutable runbooks: never edit skill files directly; instead, request changes with a prompt.
   - Adhere strictly to the activation protocol defined in `create-nww-website`: always begin with the read-only brief check (`client-context/answers/`) and immediately present Batch 01 of the intake questionnaire.
   - Do not perform any preliminary file reading, repository scanning, planning, command execution, or code generation before the intake questionnaire is presented.
