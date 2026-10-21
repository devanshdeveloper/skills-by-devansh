# Incident Response & Rollback Runbook

This runbook defines emergency procedures for handling accidental credential exposure, defective releases, or publishing failures in the `skills-by-devansh` catalog.

---

## 1. Golden Rules of Secret Exposure

If an API key, private key, or credential was accidentally committed or pushed to a public remote:

> [!CAUTION]
> **RULE 1: ROTATE CREDENTIALS FIRST AT THE PROVIDER.**
> Deleting the git tag, running `git push --force`, or deleting the GitHub repository does **NOT** revoke a leaked secret. GitHub event feeds, public commit scrapers, and archive mirrors capture commits in seconds. The credential must be treated as immediately compromised.

1. **Step 1: Invalidate and Revoke**
   - **GitHub Tokens:** Visit GitHub Settings -> Developer Settings -> Personal Access Tokens -> Revoke immediately.
   - **Provider Keys:** Log into Pixabay, Pexels, Unsplash, or NWW CMS admin consoles and generate new API keys, immediately deleting the old ones.
   - **Cloud Keys:** Deactivate and delete exposed AWS/GCP access keys immediately.

2. **Step 2: Scrub Repository History**
   - Once the credential is dead at the provider, remove the key from the source file.
   - If the key was pushed to the public remote, notify the repository owner (Devansh) before any history rewrite (`git filter-repo` or BFG) is attempted.
   - History rewrites break all consumer clones and requires explicit owner approval.

---

## 2. Handling Defective Skill Releases

If a published skill runbook contains a bug, incorrect instruction, or missing reference:

1. **Do NOT delete the tag on the remote.** Deleting public tags breaks client dependency caches and package lockfiles.
2. **Author a Hotfix Patch Release:**
   - Fix the issue in the target skill runbook or reference.
   - Update `CHANGELOG.md` with a new patch entry:
     ```markdown
     ## [1.0.1] - YYYY-MM-DD
     ### Fixed
     - Fixed broken reference link in create-nww-website/references/...
     ```
   - Run preflight and publish the new patch tag (`v1.0.1`):
     ```bash
     node scripts/publish/release.mjs --mode confirm --tag=v1.0.1
     ```

---

## 3. Forbidden Operations Without Explicit Owner Approval

The following operations are strictly forbidden in any automated script or routine maintenance:

- `git push --force` or `--force-with-lease`
- `git reset --hard` to rewrite published commit history
- Deleting tags on remote (`git push origin --delete <tag>`)
- Deleting branches on remote (`git push origin --delete <branch>`)
- Changing repository visibility from public to private without prior notice
