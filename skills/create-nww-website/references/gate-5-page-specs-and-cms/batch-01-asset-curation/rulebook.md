# Stage 5 Batch 01: Asset Curation & Licensed Media Sourcing

This rulebook governs **Batch 1 of Stage 5**. In this batch, the agent curates and sources authentic media assets for all image and video slots defined across `client-context/<model>/.../content.md` and `project-docs/client-review/gate-3-page-list/page-list.md`.

## Table of Contents
- [1. The Two-Source Rule](#1-the-two-source-rule)
- [2. Approved Stock Providers & Priority Order](#2-approved-stock-providers--priority-order)
- [3. The 8-Tag Asset Slot Taxonomy](#3-the-8-tag-asset-slot-taxonomy)
- [4. Sourcing CLI Runner (`stock-fetch`)](#4-sourcing-cli-runner-stock-fetch)
- [5. Stock Provenance Manifest (`stock-provenance.json`)](#5-stock-provenance-manifest-stock-provenancejson)
- [6. Batch 1 Completion Checklist](#6-batch-1-completion-checklist)

---

## 1. The Two-Source Rule

Every media asset utilized on the website must come strictly from one of two sources:
1. **Client-Provided Assets:** Direct files provided in `client-context/assets/`, co-located in `client-context/<model>/.../`, or documented in `client-context/asset-manifest.md`. Client assets take absolute precedence over stock for every slot.
2. **Licensed Stock Imagery:** Sourced from approved providers using valid agency API keys, downloaded locally to `assets-source/`, processed via the asset optimizer, and logged with provenance records.

*Hard Exclusion:* Never hotlink images from arbitrary URLs, Google Search, Pinterest, or unapproved third-party sources.

---

## 2. Approved Stock Providers & Priority Order

When stock imagery is authorized, check environment variables and query providers in strict priority order:

| Priority | Provider | Env Var | Re-hosting Requirement | Attribution |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Pixabay** | `PIXABAY_API_KEY` | **Required** (Download to `assets-source/`) | Show on `/credits` page |
| **2** | **Pexels** | `PEXELS_API_KEY` | **Permitted** (Download to `assets-source/`) | Recommended photographer credit |
| **3** | **Unsplash** | `UNSPLASH_ACCESS_KEY` | **Hotlink required** per API terms | Photographer + Unsplash with UTM |

If a provider key is absent, fall back to the next provider. If no keys are set, halt and request credentials or client-supplied imagery.

---

## 3. The 8-Tag Asset Slot Taxonomy

Every media slot across pages and content models must declare its structural role using this taxonomy:
1. `hero-banner`: Full-width or split hero imagery (16:9 or 21:9).
2. `feature-card`: Supporting visual for cards or feature grids (4:3 or 1:1).
3. `editorial-inline`: In-article or narrative photo.
4. `portrait-headshot`: Team member or testimonial avatar (1:1).
5. `logo-partner`: Client, technology, or partner logo mark.
6. `icon-custom`: Specialized bespoke illustration or icon.
7. `background-texture`: Subtle abstract visual or gradient layer.
8. `mockup-product`: Device or product interface showcase.

---

## 4. Sourcing CLI Runner (`stock-fetch`)

Execute the companion stock-fetching utility to retrieve licensed assets:

```bash
# Sourcing image for a specific slot
node skills/create-nww-website/scripts/stock-fetch/index.js \
  --query "modern office architecture" \
  --slot "hero-banner" \
  --out assets-source/hero.jpg
```

---

## 5. Stock Provenance Manifest (`stock-provenance.json`)

Whenever stock imagery is fetched, write or append provenance records to `project-docs/stock-provenance.json`:

```json
{
  "slot": "srv-hero",
  "provider": "pixabay",
  "assetId": "1234567",
  "sourceUrl": "https://pixabay.com/photos/office-1234567/",
  "photographer": "Jane Doe",
  "license": "Pixabay Content License",
  "localPath": "assets-source/srv-hero.jpg",
  "altText": "Modern open-concept office space with team collaborating"
}
```

*Credits Page Notice:* If stock imagery is used, Stage 6 will generate `site/app/credits/page.js` displaying photographer and provider credits automatically from this manifest.

---

## 6. Batch 1 Completion Checklist

Before proceeding to Batch 2 (Building Seeds), verify:
- [ ] Client-provided assets from `client-context/asset-manifest.md` are prioritized for all matching slots.
- [ ] Missing slots are populated via licensed stock from approved providers.
- [ ] Downloaded assets are placed in `assets-source/` with high resolution.
- [ ] Every sourced asset is recorded in `project-docs/stock-provenance.json`.
- [ ] Zero API keys or secret tokens are committed to repository files.

