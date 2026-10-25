# AGENTS.md

## Project Purpose
Authoring and distribution repository for `skills-by-devansh`, a collection of AI agent skills compatible with the [skills.sh](https://skills.sh/) ecosystem and `npx skills` CLI. Provides structured workflows and runbooks for agentic software development. See @docs/ARCHITECTURE.md for architecture details.

## Stack & Environment
- **Runtime**: Node.js (>=20.9.0, active: v24.16.0)
- **Package Managers**: npm, pnpm, npx
- **Skill Engine**: skills.sh / `npx skills` CLI
- **Formats**: Markdown runbooks with YAML frontmatter, Node.js CLI scripts (CommonJS/ESM)

## Repo Map
- `skills/`: Published skills catalog (`create-nextjs-website`, `create-nww-website`, `nww`, `publish`)
- `skills/<name>/SKILL.md`: Core runbook with YAML frontmatter (`name`, `description`)
- `skills/<name>/references/`: Modular stage guides and technical documentation
- `skills/<name>/scripts/`: Companion CLI helper utilities (`assets-optimizer`, `stock-fetch`, `client-review`, `reference-capture`, `site-fetch`, `client-notify`, `structure-audit`, `seo`)
- `scripts/publish/`: Repository preflight validation, security scan, and release automation
- `docs/`: Repository architecture and documentation
- `.agents/`: Antigravity configuration layer (rules, skills, hooks)
- `context/`: [Git-ignored] Local scratch notes, task logs, and testing fixtures (off-limits)

## Exact Commands
Execute only verbatim commands matching what exists in this repository:
- **List / Discover Skills locally**: `DISABLE_TELEMETRY=1 npx skills add . --list`
- **Test Skill Prompt output**: `DISABLE_TELEMETRY=1 npx skills use . --skill <skill-name>`
- **Scaffold New Skill Template**: `npx skills init <skill-name>` (inside `skills/`)
- **Syntax Check Node Scripts**: `node --check <path-to-script.js>`
- **Run Asset Optimizer**: `node skills/create-nww-website/scripts/assets-optimizer/index.js`
- **Run Stock Fetch**: `node skills/create-nww-website/scripts/stock-fetch/index.js`
- **Run Client Review Generator**: `node skills/create-nww-website/scripts/client-review/index.js`
- **Run Reference Capture**: `node skills/create-nww-website/scripts/reference-capture/index.js`
- **Run Universal Site Fetcher (Previous Site & References)**: `node skills/create-nww-website/scripts/site-fetch/index.js --help`
- **Run Client Milestone Notifier**: `node skills/create-nww-website/scripts/client-notify/index.js`
- **Run Structure & Deliverables Auditor**: `node skills/create-nww-website/scripts/structure-audit/index.js`
- **Run CMS Seeder**: `node skills/create-nww-website/scripts/cms-seed/index.js --help`
- **Run PageSpeed Check**: `node skills/create-nww-website/scripts/seo/pagespeed-check.js --help`
- **Run Robots & Sitemap Parser**: `node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --help`
- **Run Security Scan**: `node scripts/publish/security-scan.mjs`
- **Run Preflight Checks**: `node scripts/publish/preflight.mjs --dry-run`
- **Run Release (Dry Run)**: `node scripts/publish/release.mjs --dry-run`

## Workflow Discipline
- **Read before modifying**: Read existing `SKILL.md` or scripts before proposing changes.
- **Mirror existing patterns**: Match established structure (YAML frontmatter, section headers, modular references).
- **Report before implementing**: Present findings, risks, and proposed file lists; wait for confirmation before altering files.
- **Keep changes scoped**: Modify only files directly requested. Never modify files in `context/`.

## Editing Rules (Non-Negotiable)
- Use ONLY IDE editor tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`).
- NEVER use shell redirection (`>`, `>>`), heredocs (`<<EOF`), `sed -i`, `perl -pi`, `awk`, `tee`, or codemods to modify files.

## Forbidden Without Explicit Approval
- Installing new dependencies or adding root `package.json` without approval.
- Modifying environment files or exposing credentials (`PIXABAY_API_KEY`, `PEXELS_API_KEY`, etc.).
- Running destructive commands: `rm -rf`, `git reset --hard`, `git clean`, `git push --force`.
- Touching git-ignored authoring scratch notes in `context/`.

## Verification Definition
Never declare success without concrete evidence:
1. Run `DISABLE_TELEMETRY=1 npx skills add . --list` to ensure all skills are discovered without errors.
2. Verify YAML frontmatter syntax and fields (`name` matches folder, `description` is third-person).
3. Run `node --check` on any touched `.js` or `.mjs` scripts to verify syntax.
4. Verify all internal markdown links and relative file paths exist.

## Definition of Done
A task is done only when:
1. Changes strictly match requested scope with zero regressions to existing skills.
2. Verification commands have been executed and output inspected.
3. A concise Walkthrough is produced listing all touched files, what was verified, and what was not verified.
