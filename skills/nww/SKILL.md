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

3. **Mandatory Reference Site Crawl Rule (Pre-Gate 2):**
   - If reference website URLs are provided in the intake brief or Batch 02, executing `site-fetch` on each reference URL into `project-docs/design-references/<domain>` and compiling `project-docs/design-references/sources.md` as part of Gate 0 context before moving to Gate 2 is **MANDATORY**. This step is skipped ONLY if zero reference websites were provided.

4. **Universal Gate Compaction Rule (`/compact` on Each Gate Transaction):**
   - At every gate transaction or stage transition across the 10-stage pipeline (Gates 0 through 9), the agent MUST remind the user to run the `/compact` command to summarize and compact conversation context, freeing working memory for the upcoming gate.

5. **Section Uniqueness, Minimum 5 Substantive Sections & High FAQ Density Invariants:**
   - Enforce strictly that only section types may repeat across pages; zero duplicated sections or repeating content/headings anywhere on the website.
   - Enforce minimum 5 distinct, substantive semantic sections *other than* Hero, CTA banner, FAQ, Contact Us form, and Footer on every page.
   - Enforce High FAQ Density (minimum 10 to 15 substantive, multi-sentence FAQs with zero cross-page duplication) on any page featuring FAQs.

6. **Rolling Open Questions Pool & Zero Confirmed Decisions Invariant:**
   - Enforce strictly that `client-context/open-questions.md` maintains a minimum rolling queue of at least 20 targeted open questions across every stage of the pipeline (Stages 0 through 9).
   - Confirmed decisions, resolved answers, agreed parameters, or project summaries in `client-context/open-questions.md` are strictly prohibited. The moment a question is answered, move it immediately to batch answers and replenish the pool with a new open question to keep the total at >= 20 at all times.
