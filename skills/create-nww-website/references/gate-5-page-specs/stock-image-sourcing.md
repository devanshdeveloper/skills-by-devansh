# Stock Image Sourcing

**Read this reference when:** Stage 0 reveals that stock images are needed, OR during Stage 5 when a `page.md` asset slot has no client-provided asset and the project is approved for stock use.

---

## 1. Two-Source Rule

Every image on a generated website must come from exactly one of these two sources:

1. **Client-provided assets** -- files the client delivers directly, with confirmed commercial rights. These always take priority over stock for every slot.
2. **Licensed stock images** -- fetched from one of the three approved providers below using the agency's own API key, downloaded and processed through the assets-optimizer, and served from the client's own host (Unsplash stays hotlinked -- see provider details).

No other source is permitted. Do not hotlink images from arbitrary URLs, Google Images, social media, Dribbble, or any unapproved provider.

---

## 2. Approved Providers

Three providers are approved. Use **provider priority order**: check whether a valid key exists for each in order; use the first available.

| Priority | Provider | Env var | Attribution on site | Re-hosting |
|---|---|---|---|---|
| 1 | **Pixabay** | `PIXABAY_API_KEY` | Recommended (show source on credits page) | Required -- must download |
| 2 | **Pexels** | `PEXELS_API_KEY` | Recommended (credit photographer) | Permitted -- download |
| 3 | **Unsplash** | `UNSPLASH_ACCESS_KEY` | Required -- photographer + Unsplash with UTM | Prohibited -- must hotlink |

Before fetching, verify the matching env var exists. If a provider key is missing, skip it and try the next. If none are set, stop and ask.

### 2a. Pixabay (Priority 1)

- **License:** Pixabay Content License. Verify commercial use is permitted before use in client deliverables (license summary page may require manual review).
- **API endpoint:** `https://pixabay.com/api/`
- **Rate limit:** 100 requests per 60 seconds. Cache results for 24 hours within a session.
- **Hotlinking:** Permanently prohibited. You **must** download images to `assets-source/` before use.
- **Default key size:** Up to `largeImageURL` (~1280 px wide). `fullHDURL`/`imageURL` require Pixabay full-access approval.
- **Safe search:** Always pass `safesearch=true`.
- **Attribution:** Show source when displaying search results during authoring. On the generated site, list photographer name and Pixabay page URL on the credits page.
- **Mass downloads:** Prohibited. Each image must be individually selected before download.

### 2b. Pexels (Priority 2)

- **License:** Pexels License -- free for commercial and personal use; attribution not required by the license, though crediting is encouraged.
- **API endpoint:** `https://api.pexels.com/v1/`
- **Rate limit:** 200 requests/hour; 20,000/month (standard free tier). Respect `X-Ratelimit-Remaining` header.
- **Re-hosting:** Permitted. Download to `assets-source/` and process through the optimizer.
- **Attribution:** Not required; recommended. Format: "Photo by [Name] on Pexels".
- **Mass downloads:** Not permitted for bulk archiving; fetch only images needed per project.

### 2c. Unsplash (Priority 3)

- **License:** Unsplash License -- free for commercial use; attribution not required by the license but required by API guidelines.
- **API endpoint:** `https://api.unsplash.com/`
- **Rate limit:** Demo mode: 50 requests/hour. Production (after approval at unsplash.com/oauth/applications): 1,000 requests/hour.
- **Hotlinking:** **Required.** Render images using `photo.urls.*` URLs from the API. Do not download and self-host without a special arrangement with the Unsplash API team.
- **Download trigger:** When an image is selected for use, send a GET request to `photo.links.download_location` to register the photographer download count. The fetch script handles this automatically.
- **Attribution (API requirement):** Must appear on the generated site:
  `Photo by [Name](https://unsplash.com/@username?utm_source=APP&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=APP&utm_medium=referral)`
- **Content filter:** Use `content_filter=low` (default). Use `content_filter=high` for family-safe projects.
- **Keys:** Access Key and Secret Key must remain confidential; never embed in client-side code.

**Unsplash pipeline exception:** Unsplash images skip the assets-optimizer. `ResponsiveImage.js` renders them as external `<img>` tags with `referrerPolicy="no-referrer-when-downgrade"`. Record in `stock-provenance.json` with `"rehosted": false`.

---

## 3. Intake Branch (Stage 0 Addition)

At Gate 0, in Batch 04 (Asset Harvesting, Inventory & Generation), ask these stock authorization questions. Record answers in `client-context/answers/batch-04-asset-harvesting-generation/answers.md` and `client-context/asset-manifest.md`:

**Q35a.** For image slots not supplied by the client -- is the project authorized to use licensed stock photography?
- **No** -> all open image slots receive `placeholder` + `needs-client-input`. Skip remaining questions. No stock fetch will occur.
- **Yes** -> continue.

**Q35b.** Has the client been informed that stock images will be used and that photographer credit will appear on the site?
- Must be **yes** to proceed.

**Q35c.** Stock images will be fetched from a licensed provider at authoring time, then downloaded and hosted on the client server (Unsplash images stay hotlinked). Does the client approve?
- Must be **yes** to proceed.

**Q35d.** Confirm the stock image count ceiling for this project. Default: **20 images**. More than 20 requires explicit approval here.

Also add to the Gate 0 Checklist:
- [ ] Stock photography decision recorded: approved / not approved / placeholder-only.
- [ ] If approved: provider priority and available keys confirmed.

---

## 4. Client-Asset Priority Rule

For every slot in `page.md`:
1. Client has supplied an asset for it -> use it. Do not fetch stock.
2. Slot is a hard-excluded section type -> mark `placeholder` + `[STOCK-EXCLUDED]`. Do not fetch stock.
3. No client asset, not hard-excluded, and stock is approved -> proceed to section 5.

---

## 5. Hard Exclusions

The following section types must **never** receive stock images. Mark them `placeholder` with note `[STOCK-EXCLUDED: requires real photos from client]` in `page.md` and list them in `project-docs/asset-requests.md`:

- **Team / staff / leadership bios** -- must use real photos of the actual people.
- **Testimonials / reviews** -- must use real headshots, or no photo at all.
- **Case studies / portfolio / Our Work** -- must use real project photos or work samples.
- **Client premises / physical locations** -- must use real location photos.
- **Before-and-after comparisons** -- must use real project documentation.

Logos and brand marks are always `client-provided` or `agency-created`. Never stock.

---

## 6. Query Construction

- 3-5 keywords from the slot's `Description` in `page.md` and brand voice from `design-theory.md`.
- Append orientation filter matching slot aspect ratio (`horizontal` for `--ratio-hero`, `vertical` for portrait, `squarish` for square).
- Minimum width: 1920 for LCP/hero slots, 1200 for standard content slots, 800 for thumbnails.
- Use `order=popular` for Pixabay, `size=large` for Pexels, default sort for Unsplash.
- Avoid queries containing brand names, competitor names, or recognizable real people by name.

---

## 7. Selection Criteria

Apply all seven before saving any image:

1. Orientation matches the slot aspect ratio.
2. Source pixels meet the slot minimum.
3. No embedded text, watermarks, or visible logos.
4. No recognizable brand marks or competitor products.
5. No real people in sections that do not describe people.
6. Image plausibly represents the described subject without misrepresenting it.
7. Not already used in another slot on this project (no duplicates).

If no image on the current result page passes all criteria, stop and ask for revised search terms.

---

## 8. Provenance Manifest

Create `project-docs/stock-provenance.json` at Stage 5 start if stock images are used. Append one entry per image.

Common fields (all providers):

    {
      "assetId": "srv-s1-hero",
      "provider": "pixabay",
      "photoId": "1234567",
      "photographerName": "username",
      "photographerProfileUrl": "https://pixabay.com/users/username-1234567/",
      "pageUrl": "https://pixabay.com/photos/example-1234567/",
      "licenseLink": "https://pixabay.com/service/license/",
      "retrievalDate": "2026-10-13T06:00:00Z",
      "searchQuery": "modern workspace technology",
      "pageSlot": "srv-s1-hero on /services",
      "altText": "Developer analyzing metrics on a modern monitor"
    }

Pixabay and Pexels add: `"localFile": "assets-source/srv-s1-hero.jpg"`, `"finalFile": "site/public/assets/srv-s1-hero.webp"`, `"rehosted": true`.

Unsplash adds: `"hotlinkedUrl": "https://images.unsplash.com/..."`, `"downloadLocationUrl": "https://api.unsplash.com/photos/.../download?ixid=..."`, `"downloadTriggerFired": true`, `"rehosted": false`.

---

## 9. Attribution Output

### Credits page (all providers -- required if any stock image used)

Stage 6 generates `site/app/credits/page.js` from `stock-provenance.json`. Lists every stock image with photographer name linked to their profile, provider name linked to provider homepage, and the page URL on the provider site. Link from footer as "Image Credits".

### Per-provider attribution format

| Provider | Format | Placement |
|---|---|---|
| **Pixabay** | "Photo from Pixabay by [Name]" | Credits page only |
| **Pexels** | "Photo by [Name] on Pexels" | Credits page only |
| **Unsplash** | "Photo by [Name](url?utm_source=APP&utm_medium=referral) on Unsplash(url?utm_source=APP&utm_medium=referral)" | Credits page AND adjacent to each Unsplash image on page |

Alt text on all images must be descriptive and visual -- not a repeat of the search query.

---

## 10. Credentials

- Keys read only from env vars: `PIXABAY_API_KEY`, `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`.
- Keys must never appear in: SKILL.md, references/, project-docs/, page.md, stock-provenance.json, any file under site/, Next.js output bundles, .env.local, or any committed file.
- The fetch script reads keys from `process.env` only and never logs raw API response bodies.
- `UNSPLASH_SECRET_KEY` is for OAuth only; never expose client-side.

---

## 11. Failure Handling

| Failure | Required behavior |
|---|---|
| No provider key set | Stop. Report missing env vars. Ask whether to use placeholder images instead. |
| Key returns 401 or 403 | Stop. Report provider and status. Try next provider in priority order. |
| Rate limit HTTP 429 | Stop. Report provider and reset time. Ask to wait-and-retry or use placeholder for this slot. |
| Provider outage 5xx | Stop. Try next provider in priority order. If all fail, use placeholder and ask. |
| Zero results for query | Stop. Report query and zero-result response. Ask for revised search terms. Never pull from an unapproved source. |
| Image fails selection criteria | Skip; try next result. If page exhausted, stop and ask for revised terms. |
| Unsplash download trigger fails | Record `downloadTriggerFired: false` in provenance. Do not abort the fetch. |

---

## 12. Using the Fetch Script

`scripts/stock-fetch/index.js` runs at authoring time during Stage 5. Execute from the project root:

    # Auto-select provider by priority
    node ../skills/create-nww-website/scripts/stock-fetch/index.js \
      --query "modern workspace technology" \
      --slot "srv-s1-hero" \
      --page "/services" \
      --orientation horizontal \
      --min-width 1920 \
      --output assets-source \
      --provenance project-docs/stock-provenance.json

    # Specify provider explicitly
    node ../skills/create-nww-website/scripts/stock-fetch/index.js \
      --provider pexels \
      --query "team collaboration office" \
      --slot "about-s2-team-bg" \
      --page "/about" \
      --orientation horizontal \
      --min-width 1200 \
      --output assets-source \
      --provenance project-docs/stock-provenance.json

The script: checks env vars in priority order -> builds and fires the API search -> caches results 24 hours (in `.stock-cache/` at project root, git-ignored) -> prints numbered candidate list -> downloads selected image (skips for Unsplash; records hotlink URL) -> fires Unsplash download trigger -> appends to provenance JSON -> prints summary. Never prints API key or raw response body.

---

## 13. Gate 5 Stock Checklist

Append to the standard Gate 5 Review Checklist:

- [ ] Stock photography approved in `client-context/answers/batch-04-asset-harvesting-generation/answers.md`? If no, skip remaining items.
- [ ] All stock slots fetched using an approved provider key.
- [ ] All stock images pass all seven selection criteria.
- [ ] `project-docs/stock-provenance.json` complete -- one entry per image, all required fields populated.
- [ ] Hard-excluded sections carry `placeholder` + `[STOCK-EXCLUDED]` -- no stock in team, testimonial, portfolio, or premises sections.
- [ ] No provider API key present in any project file.
- [ ] Stock image count is within the ceiling approved in `client-context/answers/batch-04-asset-harvesting-generation/answers.md`.

## 14. Stage 6 Stock Checklist

Append to the Gate 6 checklist:

- [ ] `site/app/credits/page.js` generated from `stock-provenance.json` (if any stock used).
- [ ] Footer links to `/credits` as "Image Credits".
- [ ] Unsplash images rendered as hotlinked external `<img>` tags (not local asset paths).
- [ ] Unsplash per-image attribution rendered adjacent to each Unsplash image on the page.
- [ ] Pixabay and Pexels images processed through assets-optimizer and served from `site/public/assets/`.

## 15. Stage 8 Stock Checklist

Append to the Stage 8 Final Verification audit:

- [ ] No stock API key present anywhere in `site/` build output.
- [ ] `/credits` page renders correctly in production build.
- [ ] All Unsplash `<img>` tags carry `referrerPolicy="no-referrer-when-downgrade"` and `crossOrigin="anonymous"`.
- [ ] `stock-provenance.json` backed up alongside `assets-source/` files.
