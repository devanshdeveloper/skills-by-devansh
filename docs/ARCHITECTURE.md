# Architecture: skills-by-devansh

## Overview

`skills-by-devansh` is a specialized skill repository designed for the [skills.sh](https://skills.sh/) ecosystem and the `npx skills` CLI. It authors, packages, and distributes specialized agent capabilities that can be installed into any AI development agent (such as Antigravity, Claude, or Cursor).

Unlike traditional web or service codebases, this repository is **documentation- and instruction-first**: its primary artifacts are structured markdown runbooks (`SKILL.md`), modular technical references (`references/`), and embedded Node.js CLI utilities (`scripts/`).

---

## Directory Architecture

```
skills-by-devansh/
├── skills/                             # The published skills catalog
│   ├── create-nextjs-website/          # App Router scaffolding skill
│   │   └── SKILL.md                    # Single-file runbook & frontmatter
│   ├── create-nww-website/             # Multi-stage website builder
│   │   ├── SKILL.md                    # Master 12-stage pipeline runbook
│   │   ├── references/                 # Modular reference specifications
│   │   │   ├── pipeline-stages.md      # State machine and approval gates
│   │   │   ├── code-conventions.md     # Code style and limits
│   │   │   ├── design-theory.md        # Tokens, type, and motion
│   │   │   └── ... (10 more docs)      # Specific stage guidance
│   │   └── scripts/                    # Embedded CLI helper tools
│   │       ├── assets-optimizer/       # Sharp/ffmpeg image/video pipeline
│   │       └── stock-fetch/            # Stock image provenance & fetch
│   ├── nww/                            # Shortcut alias skill for create-nww-website
│   │   └── SKILL.md                    # Fast shortcut delegation runbook
│   └── publish/                        # Maintainer-only release skill (metadata.internal)
│       ├── SKILL.md                    # 10-gate release runbook
│       └── references/                 # Preflight gates & incident response
├── scripts/                            # Repository maintenance utilities
│   └── publish/                        # Preflight validator, security scan & release CLI
├── docs/                               # Architecture and repo documentation
│   └── ARCHITECTURE.md                 # This system architecture guide
├── AGENTS.md                           # Core agent guidance and discipline
└── .agents/                            # Antigravity customization layer
    ├── rules/                          # Scoped declarative constraints
    ├── skills/                         # On-demand agent runbooks
    └── hooks/                          # Lifecycle safety guards
```

---

## Skills.sh & Discovery Model

Skills in this repository conform to the skills.sh decentralized distribution standard:
1. **Repository Layout**: Each skill is a named directory under `skills/<skill-name>/` containing a `SKILL.md` file.
2. **YAML Frontmatter**: The `SKILL.md` must start with YAML frontmatter containing:
   - `name`: Lowercase, hyphen-separated identifier matching the directory.
   - `description`: Third-person synopsis describing *what* the skill does and *when* the agent should invoke it.
3. **Decentralized Distribution**: Anyone installs skills via `npx skills add devanshdeveloper/skills-by-devansh --skill <skill-name>`.
4. **Local Discovery & Testing**: Tested via `DISABLE_TELEMETRY=1 npx skills add . --list` and `DISABLE_TELEMETRY=1 npx skills use . --skill <name>`.

---

## Embedded Utility Scripts

Skills may contain companion CLI utilities inside `scripts/`:
- **`assets-optimizer`**: A Node.js utility utilizing `sharp` and `ffmpeg` to process, optimize, resize, and produce WebP assets and manifests.
- **`stock-fetch`**: A Node.js utility connecting to Pixabay, Pexels, and Unsplash APIs to search, download, and log provenance for images.

These utilities are self-contained and invoked via Node directly (`node index.js`).

---

## Antigravity Customization Architecture

To ensure AI agents operate with maximum precision and zero unwanted side-effects:
- **`AGENTS.md`**: Provides immediate, always-on grounding: repo map, exact commands, and non-negotiable editing rules.
- **Rules (`.agents/rules/`)**: Scoped rules applied conditionally via globs (`skills/**`, `skills/**/scripts/**`) or manual triggers.
- **Skills (`.agents/skills/`)**: Multi-step workflows (`plan-first`, `verify`, `add-feature-in-repo-style`) progressively disclosed when triggered.
- **Hooks (`.agents/hooks.json`)**: PreToolUse and Stop safety guards blocking unauthorized file mutations and enforcing verification gates.
