# Batch 06: Legacy Website Migration & Content Carry-Forward

**Batch Code:** `batch-06-legacy-site-migration`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-06-legacy-site-migration/answers.md` and referenced in Stage 4 `seo-strategy.md`  

---

## 1. Input Sources & Pre-Gate 1 Crawl Protocol

This batch is activated **ONLY** when `build_origin == migration` or the user provides an existing website URL. If building a new site from scratch, skip this batch.

Before presenting questions, the agent executes the Pre-Gate 1 Legacy Site Crawl:
```bash
node skills/create-nww-website/scripts/site-fetch/index.js --url <legacy-url> --out previous-site --mode migration
```

This crawler creates:
- `previous-site/manifest.json`: Complete inventory of all legacy URLs, status codes, and meta descriptions.
- `previous-site/sitemap-legacy.xml`: Legacy route index.
- `previous-site/<slug>/index.html`, `content.md`, and `screenshot.png`.

The agent reads `previous-site/manifest.json` and begins the turn with an executive audit:
*"Crawled legacy website at [URL]. Discovered [N] total routes and [X] media assets. Let's decide which content to carry forward, which pages to retire, and how to preserve your SEO rankings."*

---

## 2. Questions

### Q26a [Legacy Page Disposition & Route Action]
- **Question:** Reviewing the discovered pages from your legacy website, what is the disposition for each major section?
  - `carry-verbatim`: Keep the route and port existing text directly to the new site.
  - `rewrite-modernize`: Keep the route but completely rewrite copy and upgrade layout.
  - `merge-consolidate`: Merge multiple thin pages into one comprehensive authority page.
  - `retire-delete`: Delete the route permanently and create a 301 redirect to the closest new page.
- **Answer Type:** Route-by-route disposition list
- **Default:** `Core pages: rewrite-modernize; Thin/obsolete pages: retire-delete with 301 redirect`
- **Downstream Consumers:** Stage 3 `page-list.md`, Stage 4 301 Redirect Map

### Q26b [Content Carry-Forward Deep Dive]
- **Question:** Looking across specific content categories on your old website:
  1. **Company Story / Mission:** Keep existing copy verbatim, or refresh tone?
  2. **Service / Product Copy:** Carry forward existing feature bullet points, or rewrite from scratch?
  3. **Historical Blog Posts / News:** Do you want to migrate all historical posts, only top-ranking articles (e.g. top 5–10), or start fresh?
  4. **Client Testimonials & Quotes:** Should we export all existing customer quotes and case studies to the new site?
  5. **Legal Policies (Privacy Policy & Terms):** Port legacy legal copy verbatim, or generate modern standard policies?
- **Answer Type:** Categorical decisions
- **Default:** `1. Refresh tone; 2. Modernize copy; 3. Migrate top 10 articles; 4. Export all testimonials; 5. Port legacy legal policies verbatim`

### Q26c [High-Equity SEO URLs & 301 Redirect Rules]
- **Question:** Are there specific URLs that receive significant organic traffic, backlinks, or paid campaign clicks that MUST be preserved with 1-to-1 301 redirects?
- **Answer Type:** List of URLs / paths
- **Default:** `Map all indexed legacy URLs to closest new route in Stage 4`
- **Downstream Consumers:** Stage 4 `seo-strategy.md` 301 Redirect Map, `site/next.config.mjs` `redirects()`

### Q26d [Legacy Media & Downloadable PDFs]
- **Question:** Are there downloadable whitepapers, PDF forms, case studies, or catalog files on the old site that must remain accessible at their current URLs or be relocated to the new site?
- **Answer Type:** List of files / URLs
- **Default:** `Download and relocate to site/public/downloads/`

### Q26e [Content Freeze & Cutover Timeline]
- **Question:** When will content updates on the old website be frozen to prevent content drift during development?
- **Answer Type:** Date / Free text
- **Default:** `Immediate content freeze on legacy site`

---

## 3. Deliverable Disposition Matrix

The confirmed migration choices are formatted into `client-context/answers/batch-06-legacy-site-migration/answers.md`:

```markdown
## Legacy Migration & Content Carry-Forward Plan
- **Legacy Site URL:** https://example.com
- **Discovered Routes:** [Count]
- **Content Freeze Date:** [Date]

### Route Disposition Table
| Legacy Route | New Route | Disposition | Copy Strategy | 301 Redirect Required? |
|---|---|---|---|:---:|
| `/about-us` | `/about` | Retain | Modernize & rewrite | Yes (301) |
| `/services/old-tool` | `/solutions` | Merge | Consolidate into solutions | Yes (301) |
| `/blog/article-1` | `/blog/article-1` | Retain | Carry verbatim | No (same URL) |
| `/deprecated-page` | `/` | Retire | None | Yes (301 to home) |

### Content Category Carry-Forward Decisions
- **Company Story:** [Verbatim / Refresh]
- **Services Copy:** [Rewrite / Port]
- **Blog Archive:** [Migrate top N / Fresh]
- **Testimonials:** [Port all X quotes]
- **Legal Policies:** [Port verbatim]
```

---

## 4. Confirmation Stage 0.6

After receiving responses to Batch 06:

1. **Acknowledge and Echo:**
   Output the Migration & Content Carry-Forward Summary.
2. **Explicit User Approval Prompt:**
   > *"Please confirm the legacy content disposition and 301 redirect strategy above. Once approved, we will advance to Batch 07 (SEO, Analytics & Governance)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-06-legacy-site-migration/answers.md`.
