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

## The 10 Preflight Gates

Before any commit, tag, or push can occur, the repository must pass all 10 gates implemented in `scripts/publish/preflight.mjs`:

1. **G1 (Target Remote & Owner Match):** Validates git remote matches `publish.config.json` (`devanshdeveloper/skills-by-devansh`).
2. **G2 (Branch & Working Tree Check):** Enforces branch is `main` and working tree is clean with zero active conflicts.
3. **G3 (Skill Specification Audit):** Verifies all skills in `skills/` comply with the agentskills.io standard (name, description <= 1024 chars, SKILL.md <= 500 lines, flat references, no README.md).
4. **G4 (Catalog & Manifest Verification):** Ensures discovered skills exactly match `skills.manifest.json` and internal skills are properly excluded from public discovery.
5. **G5 (Secret & Credential Scanning):** Scans the working tree and git commit history for sensitive tokens using `scripts/publish/security-scan.mjs`.
6. **G6 (Privacy & Isolation Checks):** Guarantees authoring scratch directory and `.agents/` are untracked and gitignored, with zero references in published skills.
7. **G7 (Placeholder Hygiene):** Ensures zero unresolved template placeholders (`<owner>`, `<repo>`, `TODO:`, `FIXME:`).
8. **G8 (Documentation & Listing Sync):** Validates root `README.md`, `LICENSE`, `AGENTS.md`, and `docs/ARCHITECTURE.md` are synchronized with the actual catalog.
9. **G9 (Version, Tag & Changelog Sync):** Verifies semver tag format (`vX.Y.Z`) and confirms matching entry in `CHANGELOG.md`.
10. **G10 (Remote Visibility & Probe):** Confirms remote repository is public and fast-forward push is guaranteed.

For complete gate details and failure troubleshooting, consult [references/preflight-gates.md](references/preflight-gates.md).

---

## Execution Workflow

### Stage 1: Run Preflight Audit (Dry Run)
Always run preflight in dry-run mode first to verify all 10 gates pass without modifying git state:
```bash
node scripts/publish/release.mjs --dry-run
```

### Stage 2: Review Preflight Report
- If any gate fails, inspect the diagnostic output, remediate the defect in the source files, and re-run Stage 1.
- Never bypass a failed gate.

### Stage 3: Interactive Release (Confirm Mode)
Once all gates pass in dry-run, initiate the interactive release:
```bash
node scripts/publish/release.mjs --mode confirm --tag=vX.Y.Z
```
1. The script will re-evaluate all 10 gates.
2. It displays the release summary (target tag, commit files, remote URL).
3. It halts and prompts the maintainer: `Type 'yes' to proceed with release and push: `.
4. Upon explicit `yes`, it stages files, creates an annotated tag (`git tag -a vX.Y.Z`), and executes a fast-forward push (`git push origin main --tags`).

### Stage 4: Post-Publish Remote Verification
1. Verify remote tag exists:
   ```bash
   git ls-remote --tags origin
   ```
2. Test installation discovery in a fresh temporary directory:
   ```bash
   DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --list
   ```
3. Check skills.sh leaderboard status (activation occurs via install telemetry; initial 404 is normal).

---

## Incident Response & Credential Hygiene

If an unapproved change or credential is ever exposed, consult [references/incident-response.md](references/incident-response.md) immediately. **Rotate compromised credentials first; deleting commits or repositories does not revoke active API keys.**
