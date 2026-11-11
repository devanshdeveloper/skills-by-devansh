# Batch 03: Asset Pipeline, Scoped AGENTS.md & Verification Scripts

**Batch Code:** `batch-03-asset-pipeline-agents`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 03 executes the media optimization pipeline from raw source assets to production WebP variants, extracts brand favicons into `site/app/`, establishes the directory-scoped `AGENTS.md` rules hierarchy, and creates automated verification scripts.

---

## 2. Preconditions & Input Sources

1. **Source Media:** Raw images and videos present in `assets-source/` (or `client-context/uploads/`).
2. **Brand Logo:** Vector or high-resolution logo from `client-context/branding/` (Batch 02 Q9).
3. **Batch 02 Completed:** Production foundation shell and `ResponsiveImage.js` ready.

---

## 3. Execution Protocol

### Step 1: Run Asset Optimization Engine
Execute the companion `asset-optimizer` CLI to process raw media:

```bash
node skills/asset-optimizer/scripts/assets-optimizer/index.js \
  --input ../assets-source \
  --output public/assets \
  --image-format webp \
  --video-format mp4 \
  --quality 75 \
  --max-size 61440 \
  --strict-max-size 102400 \
  --concurrency 4 \
  --responsive \
  --manifest-dir public/assets
```

- **Byte Budget Enforcement:** 
  - Non-LCP images exceeding **60 KB** trigger a warning.
  - Hard ceiling of **100 KB** strictly enforced per [asset-optimization.md](asset-optimization.md).
- **Manifest Generation:** Produces `site/public/assets/manifest.json` mapping original paths to responsive variant sets.
- **Config Persistence:** Persists resolved flags and rationale to `site/assets-optimize.config.md`.

### Step 2: Favicon & App Icon Integration
If `--logo` was supplied or a brand logo is present:
- Process the logo into standard icons (`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`).
- Copy/move generated `favicon.ico`, `icon.svg`, and `apple-icon.png` directly into `site/app/` following Next.js App Router metadata icon conventions.

### Step 3: Scaffold Scoped AGENTS.md Hierarchy
Scaffold `site/AGENTS.md` (<= 150 lines) and 4 directory-scoped AGENTS.md files per [../batch-01-codebase-scaffolding/code-conventions.md](../batch-01-codebase-scaffolding/code-conventions.md#scoped-agentsmd-hierarchy):

1. **`site/AGENTS.md`:** Root codebase rules, stack definitions, verbatim package commands, and forbidden operations.
2. **`site/app/AGENTS.md`:** Server component rules, route-level metadata, line limits (`page.js` <= 80 lines).
3. **`site/components/AGENTS.md`:** Component isolation rules, Section ID tagging (`data-section="<id>"`), <= 250 lines.
4. **`site/lib/AGENTS.md`:** Utility boundaries, CMS client functions, motion token imports, zero-JSX constraint.
5. **`site/content/AGENTS.md`:** Decoupled text copy rules, placeholder format (`data-placeholder="true"`), zero-JSX constraint.

### Step 4: Install Automated Verification Scripts
Create automated scripts in `site/scripts/` per [../batch-01-codebase-scaffolding/code-conventions.md](../batch-01-codebase-scaffolding/code-conventions.md#automated-verification-scripts--package-commands):
- `site/scripts/check-structure.mjs`: Validates line limits and forbidden patterns.
- `site/scripts/check-assets.mjs`: Audits `site/public/assets/` against the 60 KB/100 KB byte budgets.
- `site/scripts/make-placeholders.mjs`: Generates missing SVG asset placeholders.

Wire verification scripts into `site/package.json`:
```json
{
  "scripts": {
    "check:structure": "node scripts/check-structure.mjs",
    "check:assets": "node scripts/check-assets.mjs",
    "check:all": "pnpm check:structure && pnpm check:assets"
  }
}
```

---

## 4. Deliverables Checklist

- [ ] `site/public/assets/` populated with optimized WebP/MP4 media and responsive variants.
- [ ] `site/public/assets/manifest.json` generated and valid.
- [ ] `site/assets-optimize.config.md` persisted with execution flags and rationale.
- [ ] `favicon.ico`, `icon.svg`, and `apple-icon.png` in `site/app/`.
- [ ] `site/AGENTS.md` and 4 scoped `AGENTS.md` files operational.
- [ ] `site/scripts/` verification scripts installed and `pnpm check:all` passes.

---

## 5. Next Batch Handover

Upon verifying all checklist items above, proceed to **[Batch 04: CMS Kit Integration](../batch-04-cms-kit-integration/rulebook.md)** (or Batch 05 if static-only mode) to wire the CMS data client layer.

