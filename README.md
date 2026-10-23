# skills-by-devansh

[![skills.sh](https://skills.sh/b/devanshdeveloper/skills-by-devansh)](https://skills.sh/devanshdeveloper/skills-by-devansh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A collection of agent skills compatible with the [skills.sh](https://skills.sh/) ecosystem and the `npx skills` CLI.

## Available Skills

| Skill | Description | Location |
| :--- | :--- | :--- |
| **create-nextjs-website** | Scaffold modern Next.js web applications with App Router, TypeScript, and production-ready structure. Use when the user asks to create, scaffold, or initialize a new Next.js website or web application with App Router, TypeScript, and clean component architecture. | `skills/create-nextjs-website/SKILL.md` |
| **create-nww-website** | Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 9-stage human-gated workflow. Enforces single-mode markdown page specifications, Next.js project scaffolding, and manifest-driven incremental builds. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project. | `skills/create-nww-website/SKILL.md` |
| **nww** | Fast shortcut alias to start the NWW website pipeline. Use when the user types 'nww', 'start nww', or '/nww'. | `skills/nww/SKILL.md` |

## Installation

Install all skills from this repository to your active project or configured agent:

```bash
npx skills add devanshdeveloper/skills-by-devansh
```

### Install a Specific Skill

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill create-nextjs-website
```

### Preview Skills Without Installing

To list all skills available in this repository without modifying your workspace:

```bash
npx skills add devanshdeveloper/skills-by-devansh --list
```

### Run a Skill Interactively Without Installing

```bash
npx skills use devanshdeveloper/skills-by-devansh@create-nextjs-website
```

## How It Works with skills.sh

- **Decentralized Distribution**: There is no central submission form. Skills are published directly from public GitHub repositories.
- **Listing & Telemetry**: When users install skills from `devanshdeveloper/skills-by-devansh`, the skills CLI sends anonymous telemetry. The repository page at `https://skills.sh/devanshdeveloper/skills-by-devansh` activates and is ranked on the skills.sh leaderboard.
- **Badge**: The badge at the top displays the live install count once active.

## Authoring & Testing Skills

### Authoring a New Skill

1. Navigate to the `skills/` directory:
   ```bash
   cd skills
   ```
2. Initialize a new skill template:
   ```bash
   npx skills init <skill-name>
   ```
   *Note: `<skill-name>` must use lowercase letters, numbers, and hyphens.*
3. Open `skills/<skill-name>/SKILL.md` and complete the YAML frontmatter and markdown instructions:
   ```markdown
   ---
   name: <skill-name>
   description: <Clear, concise description of what the skill does>
   ---

   # <Skill Title>

   ## When to Use
   - When ...

   ## Steps
   1. Step 1 ...
   2. Step 2 ...
   ```

### Local Testing & Verification

From the repository root, test skill discovery without installing into the authoring repository:

```bash
# Test skill discovery locally
DISABLE_TELEMETRY=1 npx skills add . --list

# Test skill prompt output
DISABLE_TELEMETRY=1 npx skills use . --skill <skill-name>
```

> **Note**: Always set `DISABLE_TELEMETRY=1` during development and testing to prevent test runs from affecting public install counts.

## Release & Publishing

The repository enforces a strict 10-gate preflight validation suite to ensure clean specs, zero credential leaks, and synchronized documentation:

```bash
# Run 10-gate preflight validation (dry-run)
node scripts/publish/preflight.mjs --dry-run

# Run interactive release flow (maintainer only)
node scripts/publish/release.mjs --mode confirm --tag=v1.0.0
```

See [CHANGELOG.md](CHANGELOG.md) for version release notes.

## License

This repository is distributed under the [MIT License](LICENSE).
