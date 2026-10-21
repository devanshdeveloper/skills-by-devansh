# Asset Optimization & Responsive Media Workflow

Image and media optimization is executed during Stage 9 Foundation Build. Source assets collected in `assets-source/` are transformed into lightweight, responsive WebP variants, indexed in a manifest, and rendered using a zero-CLS Server Component.

---

## Directory & File Conventions

- **Source Media:** `assets-source/` (placed outside `site/`, strictly git-ignored).
- **Optimized Output:** `site/public/assets/` (committed to repository).
- **Asset Manifest:** `site/public/assets/manifest.json`.
- **Config Persistence:** `site/assets-optimize.config.md` (persists exact flags and execution rationale).

---

## Running the Asset Optimizer

The skill bundles a high-performance image optimization script under `scripts/assets-optimizer/` powered by Sharp.

### Execution Command
Run the bundled script (or fallback to global CLI `assets-optimize` if present in PATH):
```bash
node scripts/assets-optimizer/index.js \
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

*CLI Flags Explained:*
- `--input ../assets-source`: Points to raw source files.
- `--output public/assets`: Directs output into Next.js static asset folder.
- `--image-format webp`: Standardizes on WebP.
- `--quality 75`: Balanced compression standard per project defaults.
- `--max-size 61440`: Triggers warning for non-LCP images exceeding 60 KB.
- `--strict-max-size 102400`: Enforces hard ceiling at 100 KB (maximum LCP budget).
- `--responsive`: Generates responsive breakpoint variants (`-sm`, `-md`, `-lg`, `-xl`).
- `--manifest-dir public/assets`: Writes `manifest.json` into output folder.

### Step-by-Step Procedure
1. **Step 0 - Existing Config:** Check for `site/assets-optimize.config.md`. If present and inputs are unchanged, reuse settings.
2. **Step 1 - Explore:** Confirm source files in `assets-source/` and target path in `site/public/assets/`.
3. **Step 2 - Resolve Flags:** Verify image quality 75, format WebP, and size thresholds.
4. **Step 3 - Persist:** Write resolved command, flags, and rationale to `site/assets-optimize.config.md`.
5. **Step 4 - Dry Run:** Execute with `--dry-run` to confirm paths.
6. **Step 5 - Execute:** Run real optimization; report processed files, total size reduction, and any threshold warnings in `site/build-log.md`.
7. **Step 6 - Favicons:** If `--logo` was used, move generated favicon files into `site/app/` using Next.js conventions (`favicon.ico`, `icon.svg`, `apple-icon.png`).

---

## Manifest Schema (`site/public/assets/manifest.json`)

```json
{
  "generatedAt": "2026-10-12T10:00:00Z",
  "assets": {
    "srv-hero": {
      "src": "/assets/srv-hero-xl.webp",
      "width": 1920,
      "height": 1080,
      "aspectRatio": "16:9",
      "blurDataURL": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4...",
      "srcset": "/assets/srv-hero-sm.webp 640w, /assets/srv-hero-md.webp 1024w, /assets/srv-hero-lg.webp 1440w, /assets/srv-hero-xl.webp 1920w",
      "variants": {
        "sm": "/assets/srv-hero-sm.webp",
        "md": "/assets/srv-hero-md.webp",
        "lg": "/assets/srv-hero-lg.webp",
        "xl": "/assets/srv-hero-xl.webp"
      }
    }
  }
}
```

---

## Native Component: `site/components/ResponsiveImage.js`

To prevent double-compression overhead and guarantee zero Cumulative Layout Shift (CLS = 0), `site/components/ResponsiveImage.js` is implemented as a **native Server Component** reading the manifest and rendering an optimized `<img>` or `<picture>` element:

```javascript
// site/components/ResponsiveImage.js
import manifest from '@/public/assets/manifest.json';

export default function ResponsiveImage({
  assetId,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading,
  ...props
}) {
  const asset = manifest?.assets?.[assetId];

  if (!asset) {
    console.warn(`[ResponsiveImage] Asset ID "${assetId}" not found in manifest.`);
    return null;
  }

  return (
    <img
      src={asset.src}
      srcSet={asset.srcset}
      sizes={sizes}
      alt={alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : loading || 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={asset.blurDataURL ? {
        backgroundImage: `url("${asset.blurDataURL}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
      className={`w-full h-auto object-cover ${className}`}
      {...props}
    />
  );
}
```

*Component Guarantees:*
- **Zero CLS:** Pre-calculates exact aspect ratio, width, and height.
- **Server Component Compatible:** Runs purely on the server without client bundle hydration.
- **No Double-Optimization:** Bypasses Next.js on-demand image resizing service since images are already pre-optimized.
- **LQIP Placeholder:** Uses CSS background blur data URL until full image paints.

---

## Byte Budgets & Verification

The automated script `site/scripts/check-assets.mjs` (executed via `pnpm check:assets`) verifies every asset against project budgets:
- **LCP Hero Image:** <= 100 KB
- **General Content Images:** <= 60 KB
- **Vector SVGs / Icons:** <= 5 KB
- **Downloadable Documents (PDFs):** <= 2 MB
