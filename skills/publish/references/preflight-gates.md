# Preflight Gates Specification & Diagnostics

This reference details the 10 automated preflight gates evaluated by `scripts/publish/preflight.mjs`. Every gate must pass before any release operation is permitted.

---

## Gate Directory & Diagnostics

### Gate 1: Target Identity & Remote Matching
- **Objective:** Prevent pushing code to an unauthorized personal fork or incorrect organization.
- **Rules:**
  - Git remote `origin` must match an entry in `allowedRemotes` inside `publish.config.json`.
  - In confirm mode, if `enforceGhAccount: true`, the active account in `gh auth status` must equal `expectedOwner`.
- **Failure Code:** `FAIL_G1_REMOTE_MISMATCH`
- **Remediation:** Verify `git remote -v` points to `https://github.com/devanshdeveloper/skills-by-devansh.git`. Run `gh auth switch` if the wrong account is active.

### Gate 2: Branch & Working Tree Check
- **Objective:** Ensure releases originate exclusively from the stable default branch with clean working tree state.
- **Rules:**
  - Branch must be `main`.
  - No active merge (`.git/MERGE_HEAD`), rebase (`.git/REBASE_HEAD`), or cherry-pick (`.git/CHERRY_PICK_HEAD`).
  - In confirm mode, `git status --porcelain` must be clean.
- **Failure Code:** `FAIL_G2_DIRTY_TREE` or `FAIL_G2_WRONG_BRANCH`
- **Remediation:** Commit or stash uncommitted changes before initiating a release. Switch to branch `main`.

### Gate 3: Skill Specification Audit
- **Objective:** Ensure 100% compliance with the [agentskills.io](https://agentskills.io/specification) standard.
- **Rules:**
  - `name`: Must match folder name, lowercase alphanumeric + hyphens, <= 64 characters.
  - `description`: Non-empty, third-person, <= 1024 characters.
  - `SKILL.md`: Total line count <= 500 lines.
  - `references/`: Flat directory structure (no nested subdirectories); all internal markdown links resolve.
  - No `README.md` files inside skill folders.
- **Failure Code:** `FAIL_G3_SPEC_VIOLATION`
- **Remediation:** Edit the violating `SKILL.md` to shorten descriptions, reduce line counts, or flatten references.

### Gate 4: Catalog & Manifest Verification
- **Objective:** Prevent accidental leakage of unpublished skills or omission of public skills.
- **Rules:**
  - Public skills discovered in `skills/` must exactly match `publishableSkills` in `skills.manifest.json`.
  - Skills tagged with `metadata.internal: true` must match `internalSkills` in `skills.manifest.json`.
- **Failure Code:** `FAIL_G4_MANIFEST_MISMATCH`
- **Remediation:** Synchronize `skills.manifest.json` with the intended catalog changes.

### Gate 5: Secret & Credential Scanning
- **Objective:** Guarantee zero credentials, private keys, or high-entropy tokens are published to public git history.
- **Rules:**
  - Evaluates working tree and git commit diffs using `scripts/publish/security-scan.mjs`.
  - Checks for private keys, GitHub tokens, AWS keys, API keys (`PIXABAY_API_KEY`, `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`, `CMS_SITE_KEY`, `REVALIDATE_SECRET`), and generic token assignments.
- **Failure Code:** `FAIL_G5_SECRET_DETECTED`
- **Remediation:** Remove the sensitive token from the source code. If committed, consult [incident-response.md](incident-response.md) for credential rotation immediately.

### Gate 6: Privacy & Isolation Checks
- **Objective:** Ensure private authoring context and local scratch notes are completely isolated.
- **Rules:**
  - Private authoring context folder must be untracked in git (`git ls-files context` returns empty).
  - `.gitignore` must contain rules for private authoring scratch directory and `.agents/`.
  - Zero files under `skills/` may reference the private authoring scratch directory.
  - Zero absolute local file system paths (e.g. `C:\`, `/Users/`, `/home/`) in published markdown or code.
- **Failure Code:** `FAIL_G6_PRIVACY_LEAK`
- **Remediation:** Remove local paths or private scratch references. Ensure `.gitignore` rules are active.

### Gate 7: Placeholder Hygiene
- **Objective:** Prevent publishing incomplete templates with placeholder markers.
- **Rules:**
  - Scans for unresolved tokens: `<owner>`, `<repo>`, `<your-token>`, `<api-key>`, `TODO:`, `FIXME:`.
- **Failure Code:** `FAIL_G7_PLACEHOLDER_FOUND`
- **Remediation:** Replace placeholder tokens with actual values or appropriate documentation.

### Gate 8: Documentation & Listing Synchronization
- **Objective:** Ensure user-facing documentation accurately describes the catalog.
- **Rules:**
  - Root `README.md` Available Skills table must list every skill in `skills.manifest.json`.
  - `LICENSE` must exist and match copyright holder.
  - `AGENTS.md` and `docs/ARCHITECTURE.md` must be synchronized.
- **Failure Code:** `FAIL_G8_DOC_MISMATCH`
- **Remediation:** Update `README.md`, `AGENTS.md`, or `ARCHITECTURE.md` to reflect all skills.

### Gate 9: Version, Tag & Changelog Synchronization
- **Objective:** Guarantee clear version history and prevent overwriting existing tags.
- **Rules:**
  - Tag format must match semver: `vX.Y.Z`.
  - `CHANGELOG.md` must contain an entry for `## [X.Y.Z]`.
  - Git tag must not already exist locally or on remote.
- **Failure Code:** `FAIL_G9_VERSION_CONFLICT`
- **Remediation:** Increment the patch/minor version and add the corresponding section in `CHANGELOG.md`.

### Gate 10: Remote Visibility & Pre-Flight Probe
- **Objective:** Confirm the destination repository is public and ready for fast-forward push.
- **Rules:**
  - Repository must be `public` on GitHub.
  - Push must be fast-forward (remote is ancestor of local, or remote is fresh).
- **Failure Code:** `FAIL_G10_REMOTE_PROBE_FAILED`
- **Remediation:** Ensure GitHub repository visibility is set to Public in repository settings.
