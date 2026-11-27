# skills-by-devansh

[![skills.sh](https://skills.sh/b/devanshdeveloper/skills-by-devansh)](https://skills.sh/devanshdeveloper/skills-by-devansh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A collection of agent skills compatible with the [skills.sh](https://skills.sh/) ecosystem and the `npx skills` CLI.

## Available Skills

| Skill | Description | Location |
| :--- | :--- | :--- |
| **anti-slop** | Scans website source files, compiles a human-approved plan, and strips AI-generated visual, copy, structural, and code leftovers via pure deletion without adding replacement content or styles. Use when running /anti-slop. | `skills/anti-slop/SKILL.md` |
| **apply-best-practices** | Detects repository technology stack and architectural concerns, discovers and security-vets official best-practice skills via find-skills and skills.sh, and applies vetted recommendations incrementally behind explicit per-skill human approval gates. Use when running /apply-best-practices. | `skills/apply-best-practices/SKILL.md` |
| **asset-optimizer** | Optimizes images, videos, PDFs, and brand logos into lightweight, responsive WebP/MP4 assets with byte budget enforcement and manifest indexing. Use when optimizing media files or running /asset-optimizer. | `skills/asset-optimizer/SKILL.md` |
| **create-nextjs-website** | Scaffold modern Next.js web applications with App Router, TypeScript, and production-ready structure. Use when the user asks to create, scaffold, or initialize a new Next.js website or web application with App Router, TypeScript, and clean component architecture. | `skills/create-nextjs-website/SKILL.md` |
| **create-nww-website** | Orchestrates end-to-end creation of Next.js websites with optional NWW CMS integration using a 9-stage human-gated workflow. Enforces single-mode markdown page specifications, Next.js project scaffolding, and manifest-driven incremental builds. Use when asked to create, scaffold, or develop an NWW website, run the website build pipeline, or start a new Next.js client project. | `skills/create-nww-website/SKILL.md` |
| **integrate-nww-cms** | Audits an existing Next.js website, maps content to NWW CMS models, scaffolds a typed data-access client, migrates pages one by one with fallback resilience, unifies SEO and structured data, and configures on-demand revalidation. Use when integrating NWW CMS into an existing Next.js site or running /integrate-nww-cms. | `skills/integrate-nww-cms/SKILL.md` |
| **nww** | Fast shortcut alias to start the NWW website pipeline. Use when the user types 'nww', 'start nww', or '/nww'. | `skills/nww/SKILL.md` |
| **poc-to-proposal** | Takes a completed proof-of-concept (PoC) from scope freeze to an executive proposal PDF through an eight-stage human-approved checklist. Use when a PoC is built and needs structured testing, staging deployment, landing page lead integration, custom demo subdomain, video walkthrough, NWW case study, and client proposal generation. | `skills/poc-to-proposal/SKILL.md` |
| **sales-pipeline** | Executes an end-to-end, seven-stage human-gated sales pipeline for web agency services including custom web projects, paid pilot sprints, and ongoing technical retainers. Use when identifying target accounts, drafting cold outreach sequences, conducting discovery consultations, demonstrating live PoCs, running paid pilot trials, negotiating commercial conversions, or managing customer onboarding and success. | `skills/sales-pipeline/SKILL.md` |

## Installation

Install all public skills from this repository as an Antigravity plugin:

```bash
agy plugin install https://github.com/devanshdeveloper/skills-by-devansh
```

Or install all skills via the `skills` CLI:

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh
```

Preview skills without installing:

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --list
```

### Updating & New Chat Sessions (Hard Pull Latest Skills)

Whenever you open a **new chat session** with your AI assistant or want to refresh installed skills to the latest releases and runbooks:

```bash
# Update/hard pull all skills to latest versions:
DISABLE_TELEMETRY=1 npx skills update -y

# Or re-fetch directly from GitHub:
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh -y
```

### Skill Immutability: Do Not Edit Skill Files

Skill files (`SKILL.md`, stage runbooks, companion scripts) are immutable runbooks designed for AI agents and developers. **Do not edit installed skill files directly.** If you need enhancements, custom workflows, or bugfixes, **request changes with a prompt** instead.

---

## Skill: `anti-slop`

Scans website source files, compiles a human-approved plan, and strips AI-generated visual, copy, structural, and code leftovers via pure deletion without adding replacement content or styles. Operates under an explicit human approval barrier: runs Plan Mode first, presents candidate removals, and requires sign-off before modifying any files.

### Install

Install as an Antigravity plugin:

```bash
agy plugin install https://github.com/devanshdeveloper/skills-by-devansh
```

Or install via the `skills` CLI:

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill anti-slop
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@anti-slop
```

### Usage & Slash Command

In your chat with Antigravity (App, IDE, or CLI), trigger the skill manually:

```text
/anti-slop
```

Or target a specific directory:

```text
/anti-slop site/src
```

### Two-Stage Workflow

1. **Stage 1: Plan Mode (Read-Only):**
   - Scans user-facing source files using the modular AST scanner (`skills/anti-slop/scripts/slop-scan/index.mjs`).
   - Checks for custom project rules and whitelists in `.agents/rules/anti-slop.md` or `anti-slop.rules.json`.
   - Compiles a structured Removal Plan grouping candidate slop into Visual, Copy, Structure, and Code categories.
   - **Halts execution.** Zero files are modified until you explicitly approve the plan.
2. **Stage 2: Removal Execution Mode (Post-Approval):**
   - Applies pure deletions using IDE editor tools (`edit_file`).
   - Removes visual gradients, glow blobs, glassmorphism, emoji icons, em-dash clusters, buzzwords, fake stats, and obvious comments.
   - Falls back to clean base/inherited styling; never adds replacement copy or decorations.
   - Sweeps orphaned imports and runs the project's build/lint once to confirm zero syntax breakage.

---

## Skill: `apply-best-practices`

Detects repository technology stack and architectural concerns, discovers and security-vets official best-practice skills via `find-skills` and skills.sh, and applies vetted recommendations incrementally behind explicit per-skill human approval gates.

### Install

Install as an Antigravity plugin:

```bash
agy plugin install https://github.com/devanshdeveloper/skills-by-devansh
```

Or install via the `skills` CLI:

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill apply-best-practices
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@apply-best-practices
```

### Usage & Slash Command

In your chat with Antigravity (App, IDE, or CLI), trigger the skill manually:

```text
/apply-best-practices
```

#### Optional Arguments

- `/apply-best-practices --dry-run`: Runs Gates 0 through 3 only, writing the candidate findings and security shortlist report without installing packages or modifying repository files.
- `/apply-best-practices security`: Focuses candidate discovery and vetting on security, authentication, and secret hygiene.
- `/apply-best-practices performance`: Focuses on runtime performance, bundle optimization, and database query efficiency.
- `/apply-best-practices accessibility`: Focuses on a11y standards and semantic UI patterns.
- `/apply-best-practices seo`: Focuses on SEO metadata, robots, and sitemap standards.

### Gate Workflow

Every stage requires explicit human approval before advancing:

1. **Gate 0 (Preflight & Resume):** State detection, `find-skills` verification, clean tree confirmation, and dedicated branch `best-practices/<date>`.
2. **Gate 1 (Detect Stack):** Identifies runtime, frameworks, styling, database, and monorepo workspaces (prompting for target package).
3. **Gate 2 (Find Candidates):** Searches the `skills.sh` leaderboard and executes `npx skills find <query>`. Never invents packages.
4. **Gate 3 (Vet & Shortlist):** Inspects instructions and scripts before installing; executes 6-point security scan (network, shell, secrets, out-of-tree writes, obfuscation, rule overrides); deduplicates; caps at 8 skills; outputs ranked shortlist with pinned refs.
5. **Gate 4 to N (Apply One-by-One):** Pinned project-scoped installation; line-cited findings report citing file and line; human sign-off; safe non-destructive edits; lint/typecheck/build verification; atomic commit (`best-practices: apply <skill>@<pin>`).
6. **Final Gate (Report & Close):** Executive Walkthrough, developer manual test checklist, optional rules distillation to `.agents/rules/best-practices.md`, target changelog entry, and version bump.

### Rollback & Resume Instructions

- **Resume an interrupted run:** Re-invoke `/apply-best-practices`. Gate 0 detects `best-practices/state.json` and resumes from the active gate and pending shortlist.
- **Rollback a single skill:** Because each applied skill has an atomic commit, revert any individual skill cleanly without touching other changes:
  ```bash
  git revert <commit-hash>
  ```
- **Abort entire run:**
  ```bash
  git checkout main
  git branch -D best-practices/<date>
  ```

---

## Skill: `create-nww-website`

End-to-end 9-stage pipeline for building Next.js websites with optional NWW CMS integration.

### Install

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nww-website
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@create-nww-website
```

### Starter Prompt

Copy and paste into your AI assistant (Antigravity, Cursor, Claude Code, or Codex CLI):

````markdown
Activate the create-nww-website skill. Here is our project brief to initialize Stage 0 Intake:

## 1. Project Identity & Purpose
- Business / Brand Name: [Client / Business Brand Name, or leave blank to derive from directory name]
- Technical Project Slug: [Defaults to current working directory name, e.g. <current-directory-name>]
- Core Offering: [Primary product or service offering in 1-2 sentences]
- Target Audience: [Target customer persona / visitor demographics]
- Primary Conversion Action: [Primary conversion goal, e.g. Book Consultation, Request Quote, Buy Now]
- Website Type: [e.g. Business/Corporate, E-commerce, Portfolio, SaaS, Service]
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

Please parse this into `client-context/answers/batch-[number]-[batch-name]/answers.md` and present the Gate 0 Intake Recap for confirmation.
````

---

## Skill: `integrate-nww-cms`

Integrates the NWW headless CMS into an existing Next.js website (App Router, Pages Router, or hybrid) through a 6-gate, human-supervised, approval-driven migration workflow.

### Install

Install as an Antigravity plugin:

```bash
agy plugin install https://github.com/devanshdeveloper/skills-by-devansh
```

Or install via the `skills` CLI:

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill integrate-nww-cms
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@integrate-nww-cms
```

### Usage & Slash Command

In your chat with Antigravity inside an existing Next.js repository, trigger the skill:

```text
/integrate-nww-cms
```

### 6-Gate Architecture

Every stage requires explicit human approval via `APPROVE GATE N` before advancing:

1. **Gate 1 (Site Audit):** Read-only static analysis of Next.js version, router, styling, content sources, routes, and existing SEO. Outputs `.nww-cms/audit.json` and human audit report.
2. **Gate 2 (Content-to-Model Mapping):** Maps pages, sections, and routes to NWW CMS models (`WebsitePageConfig`, `Blog`, `WebsitePortfolio`, `WebsiteService`, `Testimonial`, `WebsiteFAQ`, `WebsiteTool`, `WebsiteContactUs`, `WebsiteTag`). Enforces standing NWW decisions (no `path`, no `structuredDataType`, validated `jsonLd`). Outputs `.nww-cms/content-mapping.md`.
3. **Gate 3 (Typed CMS Client Layer):** Scaffolds a typed data-access client (`lib/cms/` or `src/lib/cms/`) with zero external dependencies, tagged ISR caching, error redaction, and `.env.example` update with variable names only.
4. **Gate 4 (Page-by-Page Migration):** Migrates content sources page-by-page under iterative approval. Preserves existing layout and Tailwind styles verbatim; enforces CMS fallbacks; strictly maintains image slots as placeholders until approved one file per page in `.nww-cms/images/<page-slug>.json`.
5. **Gate 5 (SEO & Structured Data):** Dynamic metadata, OpenGraph, canonical URLs, validated Schema.org JSON-LD with safe `<` escaping, and CMS-driven sitemap generation.
6. **Gate 6 (Revalidation & Handoff):** Configures on-demand ISR revalidation webhook (`/api/revalidate`), rollback runbook, and delivers an exhaustive manual test checklist.

---

## Skill: `create-nextjs-website`

Scaffold a modern Next.js project with App Router, TypeScript, and clean component architecture.

### Install

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nextjs-website
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@create-nextjs-website
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
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill nww
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@nww
```

### Starter Prompt

```text
nww
```

> The agent activates `create-nww-website` immediately. Type `nww` to begin the intake interview, or `nww` followed by your brief to fast-track Gate 0.

---

## Skill: `poc-to-proposal`

Eight-stage human-approved checklist taking a PoC from scope freeze to proposal PDF.

### Install

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill poc-to-proposal
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@poc-to-proposal
```

### Starter Prompt

````markdown
Activate the poc-to-proposal skill for this project.

Project Name: [e.g. ai-contract-auditor]
PoC Location: [Current working directory]

Initialize Gate 1 (Freeze Scope) and begin the intake interview.
````

---

## Skill: `sales-pipeline`

Seven-stage human-gated sales pipeline for web agency services (custom web apps, paid pilot sprints, technical retainers).

### Install

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill sales-pipeline
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@sales-pipeline
```

### Starter Prompt

````markdown
Activate the sales-pipeline skill for a target prospect.

Prospect / Company: [e.g. Acme Health]
Service Offering: ["web-project" | "paid-pilot" | "retainer"]
Target Website: [https://acmehealth.example.com]

Initialize Gate 1 (Prospecting) and begin ICP qualification and signal research.
````

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
