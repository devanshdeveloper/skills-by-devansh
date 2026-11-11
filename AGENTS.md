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
- `skills/<name>/scripts/`: Companion CLI helper utilities (`assets-optimizer`, `stock-fetch`, `client-review`, `reference-capture`, `site-fetch`, `client-notify`, `structure-audit`, `seo`, `content-pipeline`)
- `scripts/publish/`: Repository preflight validation, security scan, and release automation
- `docs/`: Repository architecture and documentation
- `.agents/`: Antigravity configuration layer (rules, skills, hooks)
- `context/`: [Git-ignored] Local scratch notes, task logs, and testing fixtures (off-limits)

## Exact Commands
Execute only verbatim commands matching what exists in this repository:
- **List / Discover Skills locally**: `DISABLE_TELEMETRY=1 npx skills add . --list`
- **Hard Pull / Update Skills from Remote**: `DISABLE_TELEMETRY=1 npx skills update -y` (or `DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh -y`)
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
- **Run PageSpeed Check**: `node skills/create-nww-website/scripts/seo/pagespeed-check.js --help`
- **Run Robots & Sitemap Parser**: `node skills/create-nww-website/scripts/seo/sitemap-robots-parser.js --help`
- **Run Content Pipeline CLI**: `node skills/create-nww-website/scripts/content-pipeline/index.js --help`
- **Validate MDX against Zod Schema**: `node skills/create-nww-website/scripts/content-pipeline/index.js validate --help`
- **Audit SEO Rules on Content**: `node skills/create-nww-website/scripts/content-pipeline/index.js seo-check --help`
- **Compile MDX to JSON Seeds**: `node skills/create-nww-website/scripts/content-pipeline/index.js to-seed --help`
- **Push Seeds to CMS (Dry-Run)**: `node skills/create-nww-website/scripts/content-pipeline/index.js push --help`
- **Upload Local Media/Images to CMS**: `node skills/create-nww-website/scripts/content-pipeline/index.js upload --help`
- **Update Document in CMS**: `node skills/create-nww-website/scripts/content-pipeline/index.js update --help`
- **Delete Document from CMS**: `node skills/create-nww-website/scripts/content-pipeline/index.js delete --help`
- **Run Security Scan**: `node scripts/publish/security-scan.mjs`
- **Run Preflight Checks**: `node scripts/publish/preflight.mjs --dry-run`
- **Run Release (Dry Run)**: `node scripts/publish/release.mjs --dry-run`

## Workflow Discipline
- **Zero external context rule**: DO NOT add any context from other projects. It misleads the AI Agent. Only use and add instructions. Never embed domain-specific project examples, fictional brand names, or external business copy into runbooks or skills. All context must come strictly from the current project workspace, brief, or user input.
- **Read before modifying**: Read existing `SKILL.md` or scripts before proposing changes.
- **Mirror existing patterns**: Match established structure (YAML frontmatter, section headers, modular references).
- **Report before implementing**: Present findings, risks, and proposed file lists; wait for confirmation before altering files.
- **Keep changes scoped**: Modify only files directly requested. Never modify files in `context/`.
- **Do not edit skill files during project tasks**: Skill files are immutable runbooks. Never edit skill files during project tasks or workflow runs; instead, request changes with a prompt.
- **Gate containment invariant**: Zero loose markdown files outside gates. Every reference file in `skills/<skill>/references/` and every deliverable under `project-docs/client-review/` must reside strictly inside its designated gate directory (`gate-0-intake/` through `gate-9-final-verification/`). Loose markdown files outside gates are strictly prohibited.
- **Rolling open questions pool & zero confirmed decisions rule**: The agent MUST maintain a minimum rolling queue of at least 20 targeted, substantive open questions in `client-context/open-questions.md` across EVERY stage of the website pipeline (Stages 0 through 9). Confirmed decisions, resolved answers, agreed parameters, or project summaries in `client-context/open-questions.md` (or Open Questions deliverable sections) are strictly prohibited. The moment a question is answered or confirmed, it must be removed immediately from `client-context/open-questions.md`, recorded in `client-context/answers/batch-*/answers.md` (or design specifications), and replenished with a new open question to keep the count at >= 20. The open questions document must strictly contain ONLY active, pending, unresolved discovery questions.
- **MDX to JSON to Seeding rule**: When CMS mode is active (`cms: cms`) and a route/model is requested to be controlled via the CMS (`CMS-Controlled: true` in `page-list.md`), the agent ALWAYS writes an MDX file (`content.mdx`) in `client-context/<model>/<slug>/content.mdx` during Stage 4. Immediately validate it with `content-pipeline validate` against the model's `schema.js` (and `seo-check`). In Stage 5 Batch 02, compile validated MDX into Mongoose strict-mode JSON seeds using `content-pipeline to-seed`. In Stage 5 Batch 03, push validated seeds to the live CMS using `content-pipeline push` (dry-run default; `--apply` required for live writes). Non-CMS pages are generated by AI only: no MDX, no schema, no scripts.
- **Mandatory reference site crawl rule**: When reference website URLs are provided in the intake brief or Batch 02 (Q13a), the agent MUST run the universal site-fetch tool (`node skills/create-nww-website/scripts/site-fetch/index.js --url <reference-url> --out project-docs/design-references/<domain> --limit-mode max-sampled`) on each reference URL into `project-docs/design-references/<domain>` and compile `project-docs/design-references/sources.md` as part of Gate 0 context before moving to Gate 2. This crawl is mandatory and skippable ONLY if zero reference websites were provided.
- **Gate 6 homepage scope rule**: In Stage 6 Scaffolding, only the Homepage (Landing Page) is constructed as a complete page. Sub-pages are strictly prohibited from being built in Stage 6 (they are constructed incrementally in Stage 7). However, the foundation shell (root layout, navigation, footer, theme tokens, motion tokens, responsive media, scoped rules) is built with global scope to all pages.
- **Zero repeated content or exact sections rule**: Only section types (e.g. Hero, Features, Social Proof/Testimonials, FAQ, CTA Banner, Process, Bento Grid, Stats) may be repeated across pages. No exact section, identical card layout, or duplicate content/copy may be repeated anywhere on the website or within the same page. Every section must feature unique copywriting, bespoke cards/items, and page-specific value propositions. Shared components are strictly limited to global chrome (`Nav`, `Footer`, `PreviewBanner`, `ResponsiveImage`, `Schema`); body section components must never duplicate copy or card sets across pages.
- **Minimum 5 substantive sections and high FAQ density rule**: Every page scaffolded or implemented in `site/` (starting with Homepage in Stage 6 and every sub-page in Stage 7) must contain a **minimum of 5 distinct, substantive semantic sections OTHER THAN Hero, CTA banner, FAQ, Contact Us form, and Footer**. Boilerplate/bookends (Hero, CTA, FAQ, Contact Us form, Footer) do NOT count toward this 5-section minimum. Every page must feature at least 5 rich substantive body sections (e.g. Features/Value, Social Proof/Testimonials, Process/How-It-Works, Bento Grid/Capabilities, Stats/Metrics, Case Studies, Comparison Table). Any page featuring an FAQ section or route must enforce **High FAQ Density** with a minimum of 10 to 15 comprehensive, substantive, multi-sentence FAQs answering real customer objections, technical specifics, pricing, and onboarding nuances. Duplicating FAQs across different pages is strictly prohibited; all FAQs must be 100% unique to that specific page's topic.
- **CMS token confirmation & image upload rule**: When connecting to the CMS, the agent MUST confirm the token details—specifically verifying the Website Name, Website ID, and backend URL inside the CMS—before pushing content. The content-pipeline push engine and upload command automatically detect and upload local images via multipart/form-data to CMS media storage and replace paths with live CDN URLs.
- **Context compaction on gate transactions rule**: In the `create-nww-website` (and `nww`) pipeline, at every gate transaction or stage transition (Gates 0 through 9), the agent MUST remind the user to trigger the `/compact` slash command to compact conversation history and maintain context window availability for the next gate.

## Editing Rules (Non-Negotiable)
- Use ONLY IDE editor tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`).
- NEVER use shell redirection (`>`, `>>`), heredocs (`<<EOF`), `sed -i`, `perl -pi`, `awk`, `tee`, or codemods to modify files.

## Forbidden Without Explicit Approval
- Injecting or adding context, branding, or domain examples from external projects into skill files or runbooks.
- Including confirmed decisions, answered items, or agreed specifications in `client-context/open-questions.md`, or allowing the rolling open questions count to drop below 20 at any stage.
- Installing new dependencies or adding root `package.json` without approval.
- Modifying environment files or exposing credentials (`PIXABAY_API_KEY`, `PEXELS_API_KEY`, etc.).
- Running destructive commands: `rm -rf`, `git reset --hard`, `git clean`, `git push --force`.
- Touching git-ignored authoring scratch notes in `context/`.
- Editing skill files directly instead of requesting changes with a prompt.
- Creating loose markdown files directly under `references/` or outside designated gate directories.
- Repeating exact sections, identical card sets, or duplicate content/copy across pages (only section types may repeat).
- Outputting thin, shallow, or cross-page duplicated FAQs (fewer than 10–15 substantive items, 1-line answers, or reused questions).
- Counting Hero, CTA banner, FAQ, Contact Us form, or Footer toward the 5-section minimum, or building pages with fewer than 5 substantive body sections.

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
