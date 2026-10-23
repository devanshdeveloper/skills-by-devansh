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
│   │   ├── SKILL.md                    # Master 9-stage pipeline runbook
│   │   ├── assets/                     # Standalone templates & client review assets
│   │   │   └── client-review-template.html
│   │   ├── references/                 # Modular reference specifications
│   │   │   ├── pipeline-stages.md      # State machine and approval gates
│   │   │   ├── code-conventions.md     # Code style and limits
│   │   │   ├── seo/                    # SEO Strategy, structured data & tool library
│   │   │   ├── design-theory.md        # Tokens, type, and motion
│   │   │   └── ... (10 more docs)      # Specific stage guidance
│   │   └── scripts/                    # Embedded CLI helper tools
│   │       ├── assets-optimizer/       # Sharp/ffmpeg image/video pipeline
│   │       ├── stock-fetch/            # Stock image provenance & fetch
│   │       ├── client-review/          # Gate 2 visual review hub and portal generator
│   │       ├── reference-capture/      # Automated reference landing page DOM & screenshot capture
│   │       ├── client-notify/          # Multi-stage client email review & approval notification engine
│   │       ├── structure-audit/        # Stage 8 deliverables and coding conventions validator
│   │       ├── cms-seed/               # Blog seeding CLI engine and schema validator
│   │       └── seo/                    # PageSpeed Insights & sitemap/robots CLI helpers
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
- **`client-review`**: A Node.js utility that automatically scans modular concept review directories and generates/updates client review hubs and portals.
- **`reference-capture`**: A Node.js utility capturing full rendered DOM (`page.html`), stripped Markdown (`content.md`), full-page screenshots (`screenshot-full-1440.png`), and audit metadata (`capture.json`) into `project-docs/design-references/<domain>/`.
- **`client-notify`**: A Node.js utility providing stage-by-stage client email drafting, Resend/SendGrid/SMTP dispatch upon explicit user approval, clickable `mailto:` links, and automated logging in `router-state.md`.
- **`structure-audit`**: A Node.js utility auditing project documentation across all 12 stages, enforcing strict line limits and section comments, and compiling `project-docs/structure-audit.md`.

These utilities are self-contained and invoked via Node directly (`node index.js`).

---

## Release & Publishing Orchestration

The maintainer release workflow (`scripts/publish/`) enforces a 10-gate validation pipeline ensuring zero accidental secret leaks, accurate catalog manifests, consistent documentation, and fast-forward-only git releases:
- **Fast Mode Orchestrator (`release.mjs`)**: Evaluates all 10 preflight gates (G1 through G10) plus the full security scan concurrently in a single process via `Promise.all`. Automatically infers the latest semver tag from `CHANGELOG.md` and outputs a consolidated machine-readable summary table in < 1 second.
- **Thorough Mode (`--thorough`)**: Sequential execution mode for deep manual debugging with verbose diagnostics.
- **Preflight Core (`preflight.mjs`)**: Modular async gate implementations (`checkG1Remote` ... `checkG10RemoteProbe`) reusable across CLI and CI runners.
- **Security Scanner (`security-scan.mjs`)**: High-entropy and pattern-based token detector scanning active tree files and `git log -p --all` history.
- **Human Confirmation Gate**: Git commit, tag creation, and fast-forward push remain strictly gated behind interactive human approval (`Type "yes"`), preventing automated or unattended push mutations.

---

## Antigravity Customization Architecture

To ensure AI agents operate with maximum precision and zero unwanted side-effects:
- **`AGENTS.md`**: Provides immediate, always-on grounding: repo map, exact commands, and non-negotiable editing rules.
- **Rules (`.agents/rules/`)**: Scoped rules applied conditionally via globs (`skills/**`, `skills/**/scripts/**`) or manual triggers.
- **Skills (`.agents/skills/`)**: Multi-step workflows (`plan-first`, `verify`, `add-feature-in-repo-style`) progressively disclosed when triggered.
- **Hooks (`.agents/hooks.json`)**: PreToolUse and Stop safety guards blocking unauthorized file mutations and enforcing verification gates.

---

## Security & Guardrail Heuristic Limits

Automated scanners (`security-scan.mjs`) and lifecycle hooks (`edit-guard.mjs`, `secret-guard.mjs`) provide layer-of-defense heuristic guardrails, not absolute mathematical guarantees:
- **Regex Heuristics**: Pattern matching intercepts known token syntax (GitHub tokens, AWS keys, stock API keys) and standard shell redirection syntax (`>`, `tee`, `sed -i`).
- **Non-Exhaustive Scope**: Obfuscated scripts, base64 payloads, dynamic command evaluation, or unknown third-party token structures can evade regex heuristics.
- **Maintainer Responsibility**: Automated checks augment but never supersede manual code review, secret hygiene, and prompt credential rotation if an exposure occurs.
