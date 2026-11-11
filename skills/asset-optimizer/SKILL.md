---
name: asset-optimizer
description: Optimizes images, videos, PDFs, and brand logos into lightweight, responsive WebP/MP4 assets with byte budget enforcement and manifest indexing. Use when optimizing media files or running /asset-optimizer.
---

# Asset Optimizer

Optimizes images, videos, PDFs, and brand logos into lightweight, responsive WebP/MP4 assets, enforces performance byte budgets, and produces structured asset manifests.

---

## Quick Start

### 1. Install & Update

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill asset-optimizer -y
```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@asset-optimizer
```

### 2. Starter Prompt

```text
/asset-optimizer --input assets-source --output public/assets --responsive
```

---

## When to Use

- When optimizing raw images, videos, and media files for Next.js or modern web projects.
- When running `/asset-optimizer` or `/optimize-assets`.
- When converting high-resolution brand logos into standard web favicons and app icons.
- When generating responsive breakpoint variants (`-sm`, `-md`, `-lg`, `-xl`) and producing an asset manifest (`manifest.json`).

---

## Execution Procedure

### Step 0: Resolve Config & Flags
Identify input and output directories and configuration options:
- **Input Directory**: Default `assets-source` (or user-specified `--input <dir>`).
- **Output Directory**: Default `public/assets` (or user-specified `--output <dir>`).
- **Image Format**: `--image-format webp` (or `avif`, `jpeg`, `png`). Default `webp`.
- **Quality**: `--quality 75` (default 75).
- **Responsive Variants**: `--responsive` (generates 480, 768, 1200, 1600 width variants).
- **Byte Budgets**: `--max-size 61440` (60 KB warning), `--strict-max-size 102400` (100 KB ceiling).
- **Logo Processing**: `--logo <path>` (optional: generates `favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`).

### Step 1: Inventory Source Media
Inspect the input directory to verify files exist and estimate processing scope:
```bash
ls assets-source
```

### Step 2: Dry Run (Optional)
Test the command safely to verify directory resolution:
```bash
node scripts/assets-optimizer/index.js --input assets-source --output public/assets --dry-run
```

### Step 3: Run Asset Optimization
Execute the optimization script:
```bash
node scripts/assets-optimizer/index.js \
  --input assets-source \
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

### Step 4: Validate Deliverables
1. Confirm the output directory contains the optimized `.webp` variants.
2. Verify `manifest.json` was generated and maps each original relative path to its responsive variants.
3. Check for any assets exceeding the 60 KB / 100 KB budget thresholds in the CLI output.

### Step 5: Favicon Integration (If Logo Provided)
If `--logo` was supplied:
- Locate generated `favicon.ico` in the output root and icons in `icons/`.
- If working in a Next.js App Router project, copy/move `favicon.ico`, `icon.svg`, and `apple-icon.png` into `app/`.

