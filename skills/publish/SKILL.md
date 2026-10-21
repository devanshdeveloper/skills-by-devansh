---
name: publish
description: MAINTAINER ONLY. Automates preflight validation, secret scanning, changelog verification, git tagging, and release publishing for skills-by-devansh. Use ONLY when the repository maintainer explicitly requests to publish, release, or run preflight checks on this repository. Never invoke autonomously or for general website tasks.
metadata:
  internal: true
---

# Repository Release & Publish Runbook

This skill automates the safe, maintainer-controlled release process for the `skills-by-devansh` catalog. It enforces a strict 10-gate validation pipeline ensuring zero accidental secret leaks, accurate catalog manifests, consistent documentation, and fast-forward-only git releases.

---

## When to Use

- When the repository maintainer explicitly requests to run preflight checks, validate skills, or publish a new release.
- **NEVER** invoke autonomously, on behalf of general website development tasks, or in consumer workspaces.

---

## Operating Modes

1. **Fast Mode (DEFAULT)**:
   - Evaluates all 10 preflight gates (G1 through G10) plus the full security scan concurrently in a single process.
   - Automatically infers the target release version from `CHANGELOG.md` when `--tag` is omitted.
   - Completes in < 1 second and prints ONE compact, machine-readable summary table.
   - Caches nothing across runs to guarantee zero stale results.
2. **Thorough Mode (`--thorough`)**:
   - Evaluates all gates sequentially with verbose output. Use only when explicitly requested for deep manual debugging.

---

## Agent Execution Protocol (Strict Rules)

To keep releases fast (~1 minute) and prevent token waste:
1. **Run Single Orchestrator Command**: Execute the orchestrator in dry-run mode. Do not execute individual scripts piece-by-piece:
   ```bash
   node scripts/publish/release.mjs --dry-run
   ```
   *(Optional explicit tag: `node scripts/publish/release.mjs --dry-run --tag=vX.Y.Z`)*
2. **Read ONLY the Summary Table**: Consume the printed summary table directly from the terminal output.
3. **NEVER Read Script Source Files**: Do **NOT** open `scripts/publish/*.mjs` or `references/*.md` unless the orchestrator script itself throws an unhandled Node crash or the user explicitly asks.
4. **NO Redundant Auxiliary Commands**: Do **NOT** execute separate Git/CLI commands (`git remote -v`, `git branch -vv`, `gh auth status`, `gh repo view`, `git tag -l`, `git status`)—the orchestrator validates and reports these automatically.
5. **Fix Failing Gates Directly**: If any gate fails (`FAIL`), inspect the details and `file:line` in the table, remediate the defect in the source file using native editor tools, and re-run dry-run.
6. **Confirmation Barrier**: Once all gates pass in dry-run, present the summary to the maintainer and await explicit confirmation. Never commit, tag, or push without human approval.

---

## Release Execution Workflow

### Stage 1: Run Fast Preflight Audit (Dry Run)
```bash
node scripts/publish/release.mjs --dry-run
```
- Inferred target tag, active branch, and all 10 gates are verified concurrently.
- If any gate fails, fix the reported item and re-run Stage 1.

### Stage 2: Interactive Release (Confirm Mode)
Once all gates pass in dry-run and the maintainer gives explicit approval:
```bash
node scripts/publish/release.mjs --mode confirm --tag=vX.Y.Z
```
1. Re-evaluates all 10 gates live (zero caching).
2. Displays the release plan (target tag, remote URL, commit status).
3. Halts with an interactive confirmation prompt: `Type "yes" to proceed with committing, tagging, and pushing: `.
4. Upon explicit `yes`, stages files, creates an annotated tag (`git tag -a vX.Y.Z`), and executes a fast-forward push (`git push origin main --tags`).

### Stage 3: Remote Verification
Verify remote publication status:
```bash
git ls-remote --tags origin
```
Test installation discovery (local and remote):
```bash
DISABLE_TELEMETRY=1 npx skills add . --list
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --list
```

---

## The 10 Preflight Gates Reference

All 10 gates run on every preflight check; fast mode accelerates evaluation without skipping or weakening any rule:

| Gate | Name | Validation Scope |
| :--- | :--- | :--- |
| **G1** | Remote & Owner Match | Remote matches `publish.config.json` allowlist; active `gh` account matches expected owner. |
| **G2** | Branch & Working Tree Check | Branch is `main`; zero active merge/rebase/cherry-pick; clean tree in confirm mode. |
| **G3** | Skill Specification Audit | All skills comply with agentskills.io (valid frontmatter, SKILL.md <= 500 lines, flat references, no README.md). |
| **G4** | Catalog & Manifest Sync | Public skills match `publishableSkills`; internal skills match `internalSkills` in `skills.manifest.json`. |
| **G5** | Secret & Credential Scanning | Zero private keys, GitHub tokens, AWS keys, or API credentials in tree or git history. |
| **G6** | Privacy & Isolation Checks | Private authoring scratch directory and `.agents/` untracked and gitignored; zero absolute local paths in published files. |
| **G7** | Placeholder Hygiene | Zero unresolved `<owner>`, `<repo>`, `TODO:`, or placeholder tokens in templates. |
| **G8** | Documentation & Listing Sync | `README.md` lists all publishable skills; `LICENSE` copyright line matches author. |
| **G9** | Version, Tag & Changelog Sync | Semver tag format (`vX.Y.Z`) verified with matching entry in `CHANGELOG.md`. |
| **G10** | Remote Visibility & Probe | GitHub repository is verified public; fast-forward push guaranteed. |

For detailed failure diagnostics and remediation, refer to [references/preflight-gates.md](references/preflight-gates.md).
For secret exposure emergencies, refer to [references/incident-response.md](references/incident-response.md).
