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

Install all public skills from this repository in one command:

```bash
npx skills add devanshdeveloper/skills-by-devansh
```

Preview skills without installing:

```bash
npx skills add devanshdeveloper/skills-by-devansh --list
```

---

## Skill: `create-nww-website`

End-to-end 9-stage pipeline for building Next.js websites with optional NWW CMS integration.

### Install

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website
```

Or run without installing (one-shot):

```bash
npx skills use devanshdeveloper/skills-by-devansh@create-nww-website
```

### Starter Prompt

Copy and paste into your AI assistant (Antigravity, Cursor, Claude Code, or Codex CLI):

````markdown
Activate the create-nww-website skill. Here is our project brief to initialize Stage 0 Intake:

## 1. Project Identity & Purpose
- Business / Brand Name: [e.g. Minit Charger]
- Core Offering: [e.g. Turnkey Level 3 DC fast charging infrastructure for commercial transit and electric bus fleets.]
- Target Audience: [e.g. Municipal transit directors, commercial depot operators, fleet logistics managers]
- Primary Conversion Action: [e.g. Schedule Feasibility Study / Book a Consultation]
- Website Type: [e.g. Business/Corporate]
- CMS Mode: [Choose: "cms" (dynamic blog, lead capture, page configs) or "none" (100% static)]
- Build Origin: [Choose: "scratch" or "migration"]
- Target Launch Timeline: [e.g. 4 weeks]

## 2. Branding & Design Direction
- Brand Colors: [e.g. Primary: #0A192F, Accent: #00E5FF, Neutral: #F8FAFC]
- Typography: [e.g. Headings: Plus Jakarta Sans, Body: Inter]
- Design Personality: [e.g. Modern, technical authority, clean spatial grids, high trust]
- Motion Preference: [Choose: "subtle-gsap" or "static-only"]
- Design References:
  - https://stripe.com (spatial grid, typography hierarchy)
  - https://linear.app (sleek dark accents, micro-interactions)

## 3. Scope & Pages
- Core Pages: [e.g. Home, Solutions, About, Blog, Contact]
- Forms Needed: [e.g. Lead capture & consultation request]
- Imagery: [e.g. Licensed stock (Pixabay / Unsplash) + client diagrams]

Please parse this into `project-docs/client-answers.md` and present the Gate 0 Intake Recap for confirmation.
````

---

## Skill: `create-nextjs-website`

Scaffold a modern Next.js project with App Router, TypeScript, and clean component architecture.

### Install

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill create-nextjs-website
```

Or run without installing (one-shot):

```bash
npx skills use devanshdeveloper/skills-by-devansh@create-nextjs-website
```

### Starter Prompt

````markdown
Activate the create-nextjs-website skill and scaffold a new project in the current directory.

Project details:
- Project Name: [e.g. my-portfolio]
- Language: [TypeScript or JavaScript]
- Styling: [e.g. Tailwind CSS / Vanilla CSS / CSS Modules]
- Package Manager: [npm / pnpm / bun]
- Pages / Routes needed: [e.g. Home, About, Projects, Contact]
- Special requirements: [e.g. dark mode toggle, blog via MDX, i18n, auth]

Please scaffold the Next.js App Router project, configure layout and metadata, and verify the dev server starts cleanly.
````

---

## Skill: `nww`

Fast shortcut alias — activates the `create-nww-website` pipeline in one word.

### Install

```bash
npx skills add devanshdeveloper/skills-by-devansh --skill nww
```

### Starter Prompt

```text
nww
```

> The agent activates `create-nww-website` immediately. Type `nww` to begin the intake interview, or `nww` followed by your brief to fast-track Gate 0.

---

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
