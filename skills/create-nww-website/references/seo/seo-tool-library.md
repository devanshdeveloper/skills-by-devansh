# SEO Tool Library & Audit Selection Guide

This guide establishes the structured tool registry and operational selection logic for technical SEO audits across client websites. It is designed specifically for agencies building modern Next.js App Router websites where recommendations must be accurate, reproducible, and grounded in real data.

The machine-readable tool registry is maintained in [seo-tool-registry.json](seo-tool-registry.json).

---

## 1. Operating Principles & Ethical Guardrails

1. **Real Data Beats Estimates:**
   - Always prioritize first-party search engine and analytics data (Google Search Console, GA4, CrUX field metrics) over modeled third-party estimates.
   - If third-party volume or backlink tools are unavailable, explicitly label metrics as `needs-tool-validation` or `unverified`. Never invent or extrapolate search volume, ranking positions, or backlink counts.
2. **Strict Operational Tiers:**
   - **Connected (`connected`):** Tools communicating directly through authenticated APIs or MCP connectors.
   - **Export-Based (`export`):** Tools where the user supplies structured export files (`.csv`, `.xlsx`, `.json`). The skill parses user-provided files without claiming live connection.
   - **Manual (`manual`):** Diagnostic tasks the user or developer executes in a browser/desktop application (e.g., Schema Validator, Incognito SERP verification).
   - **API Helper (`api`):** Zero-dependency companion utilities (e.g. PageSpeed Insights API, robots/sitemap parsers).
   - **Truth in Auditing:** The skill must **never** claim to have run a tool it cannot run. If a tool is not connected and no export is provided, state this clearly and fall back to manual instructions.
3. **Single-Page Fetch vs Full Crawl:**
   - Single-page fetches (`web-fetch` or `curl`) inspect individual URLs only. They are **not** crawlers.
   - Full-site audits (orphan pages, redirect loops, site-wide duplicate titles, canonical coverage) require full-site crawl exports (e.g., Screaming Frog `Internal_All.csv`).
4. **Next.js Stack Alignment:**
   - Technical recommendations must map directly to Next.js App Router idioms:
     - Global and per-route metadata via the **Next.js Metadata API** (`export const metadata = {...}` or `generateMetadata()`).
     - Structured data embedded via dedicated Server Component (`JsonLd.js`).
     - XML Sitemaps dynamic routes via `app/sitemap.js` (using `tagFor('cms:blog')`).
     - Robots directives via `app/robots.js`.
     - Core Web Vitals optimization via Next.js `next/image`, `next/font`, and React Server Components.
5. **Ethical SEO & Safety Boundaries:**
   - Never recommend or automate black-hat or spam tactics (private blog networks, automated link schemes, mass-spun doorway pages, sneaky redirects, cloaking).
   - Live modifications to production sites, DNS records, Google Search Console settings, or robots.txt must always be human-approved actions.

---

## 2. Upfront Tool-Availability Check Protocol

**Mandatory Action:** At the beginning of Stage 4 (SEO Strategy) and Stage 8 (Pre-Launch SEO Audit), the agent must run this tool-availability check and record the operational tier in `project-docs/seo-strategy.md` or the audit log before making any recommendations.

### Availability Check Matrix

```markdown
### SEO Tool Availability Matrix

| Category | Registered Tool | Mode Detected | Status | Operational Route |
|---|---|---|---|---|
| Search Performance | Google Search Console | None / Export / Connected | [Active | Export Fallback | Manual] | Read GSC API or request Performance CSV |
| Search Performance | Bing Webmaster Tools | None / Export / Connected | [Active | Export Fallback | Manual] | Use IndexNow or review Bing manual report |
| Analytics | Google Analytics 4 | Env var `NEXT_PUBLIC_GA_ID` | [Configured | Missing] | Verify tag firing in layout.js |
| Crawlers | Screaming Frog SEO Spider | CSV / Export | [Export Provided | Not Provided] | Ingest `Internal_All.csv` or guide manual run |
| Speed & CWV | PageSpeed Insights | Script / API key | [API Ready | Unauthenticated | Manual] | Run `node scripts/seo/pagespeed-check.js` |
| Speed & CWV | Lighthouse / CrUX | DevTools / API | [Local Lab | Manual Review] | Audit in Chrome DevTools Incognito |
| Structured Data | Rich Results & Schema.org | Web Validator | [Manual | Script Test] | Validate via validator.schema.org & GSC API |
| Keywords | Semrush / Ahrefs / GKP | CSV Export | [Export Provided | Unverified Fallback] | Ingest CSV or mark `needs-tool-validation` |
| Indexation | Robots & Sitemap Parser | Companion Script | [Built-in CLI Available] | Run `node scripts/seo/sitemap-robots-parser.js` |
| AI / GEO Search | ChatGPT / Perplexity / AIO | Manual SERP Audit | [Manual Incognito Queries] | Execute brand & intent query verification |
```

If a required tool is not connected, immediately ask the user for the corresponding export file or present the manual verification step using the exact prompts below.

---

## 3. Stage-by-Stage Tool Selection Guide

### Stage A: Indexation Audit
- **Focus:** Canonical URLs, index status, robots.txt directives, sitemap coverage, orphan pages.
- **Preferred Tool:** **Google Search Console (URL Inspection API / Coverage Report)** + **Screaming Frog SEO Spider**.
- **Free Fallback:** `scripts/seo/sitemap-robots-parser.js` (validates `robots.txt` and `sitemap.xml`) + manual Google Search query `site:domain.com`.
- **User Export Prompt (if no API connector):**
  > *"To audit site indexation and crawlability, please export and provide your Screaming Frog crawl: Run a crawl of your site, go to **Export > Internal > All**, and save as `Internal_All.csv`. If available, also export your **Google Search Console > Pages > Not indexed** table as `gsc-indexing-issues.csv`."*

### Stage B: Technical Architecture & Rendering Audit
- **Focus:** Server-Side Rendering (SSR) vs Client-Side Hydration, status codes (301/404), redirect chains, heading hierarchies, Next.js Metadata API.
- **Preferred Tool:** **Screaming Frog** (with JavaScript rendering enabled) + **View-Source vs Rendered DOM diffing**.
- **Free Fallback:** Browser DevTools: disable JavaScript in Settings > Debugger to verify server-rendered HTML; verify HTTP headers via `curl -IL <url>`.
- **User Export Prompt (if no crawler available):**
  > *"Please export the HTTP status and redirect report from your crawling tool, or export your legacy URL redirection spreadsheet (`redirects.csv`) containing columns: `Old URL`, `Target URL`, and `Status Code (301)`."*

### Stage C: On-Page & Metadata Audit
- **Focus:** Single `<h1>` per page, title tags (<=60 chars), meta descriptions (<=155 chars), OpenGraph tags, canonical tags, alt attributes.
- **Preferred Tool:** **Screaming Frog (Page Overview / Meta HTML Export)** or **Next.js Preflight Checks**.
- **Free Fallback:** `node skills/create-nww-website/scripts/structure-audit/index.js` (verifies mandatory SEO sections) + local inspection of `page.js` and `page.md`.
- **User Export Prompt:**
  > *"Please provide the page metadata export: in your crawler, export the **Page Titles** and **Meta Description** tabs as `meta-audit.csv`."*

### Stage D: Content Quality & Intent Audit
- **Focus:** Search intent alignment (commercial, informational, navigational, transactional), keyword density, thin content, duplicate content across routes.
- **Preferred Tool:** **Google Search Console (Search Performance by Page & Query)** + **Semrush / Ahrefs Content Gap Export**.
- **Free Fallback:** Manual keyword-intent mapping matrix in `project-docs/seo-strategy.md` referencing verified client answers.
- **User Export Prompt:**
  > *"In Google Search Console, navigate to **Performance > Search results**, select the last 6 months, and click **Export > CSV**. Provide `Queries.csv` and `Pages.csv`."*

### Stage E: Backlinks & External Signals Audit
- **Focus:** Referring domain authority, broken inbound links (recovering 404 link equity through 301 redirects), anchor text distribution.
- **Preferred Tool:** **Ahrefs Site Explorer** or **Semrush Backlink Analytics**.
- **Free Fallback:** **Bing Webmaster Tools (Backlinks report)** or **Google Search Console (Links report > Top linked pages)**.
- **User Export Prompt:**
  > *"In Ahrefs or Semrush, navigate to **Backlinks > Best by Links** (or **Broken Backlinks**), export as CSV, and provide `backlinks-broken.csv`. Alternatively, in GSC export **Links > Top linked pages - external** as `external-links.csv`."*

### Stage F: Local SEO & Entity Verification
- **Focus:** Google Business Profile alignment, NAP consistency (Name, Address, Phone), LocalBusiness schema markup, local service pages.
- **Preferred Tool:** **Google Rich Results Test** + **Google Maps / Search Console local insights**.
- **Free Fallback:** Test structured data snippet at `https://validator.schema.org/` using raw JSON-LD from `JsonLd.js`.
- **User Export Prompt:**
  > *"Please provide your exact Google Business Profile NAP details (Name, Address, Phone, Operating Hours, Primary Category) and any local citations or store locator URLs."*

### Stage G: Performance & Core Web Vitals (CWV) Audit
- **Focus:** Largest Contentful Paint (LCP <= 2.5s), Interaction to Next Paint (INP <= 200ms), Cumulative Layout Shift (CLS <= 0.1), First Contentful Paint (FCP).
- **Preferred Tool:** **PageSpeed Insights API** (`scripts/seo/pagespeed-check.js`) for field CrUX metrics + **Lighthouse CLI**.
- **Free Fallback:** Run `node skills/create-nww-website/scripts/seo/pagespeed-check.js --url https://yourdomain.com` (free, no API key required for low volume).
- **User Export Prompt:**
  > *"If the site is currently live, navigate to [PageSpeed Insights](https://pagespeed.web.dev/), enter your production URL, and save the report or share the Origin CrUX values for LCP, INP, and CLS."*

### Stage H: GEO / AI-Search Visibility Audit
- **Focus:** Visibility and citation presence across LLM-powered answer engines (ChatGPT Search, Perplexity AI, Google AI Overviews).
- **Preferred Tool:** **Manual Query Verification in Incognito** + robots.txt crawler verification (`OAI-SearchBot`, `PerplexityBot`, `Google-Extended`).
- **Free Fallback:** Verify that `app/robots.js` does not inadvertently disallow ethical AI search bots required for web search attribution.
- **User Export Prompt:**
  > *"Please perform a test search for your 3 primary service queries in ChatGPT with web search enabled and in Perplexity.ai. Record which competitor domains or brand URLs are cited in the source footnotes."*

---

## 4. Complete Tool Registry Summary

All tools are recorded in [seo-tool-registry.json](seo-tool-registry.json). The catalog includes:

| Tool ID | Name | Category | Access Method | Cost Model | Key Audit Stages | Confidence |
|---|---|---|---|---|---|---|
| `google-search-console` | Google Search Console | Search Performance | `connected` / `export` | Free | Indexation, Technical, On-Page, Content | Verified |
| `bing-webmaster-tools` | Bing Webmaster Tools | Search Performance | `connected` / `export` | Free | Indexation, Technical, Links | Verified |
| `google-analytics-4` | Google Analytics 4 (GA4) | Analytics | `connected` / `export` | Free | Content, On-Page, Local | Verified |
| `screaming-frog-seo-spider` | Screaming Frog SEO Spider | Crawlers | `export` | Freemium | Indexation, Technical, On-Page | Verified |
| `google-pagespeed-insights` | PageSpeed Insights | Speed & CWV | `api` | Free | Performance, Technical | Verified |
| `lighthouse` | Google Lighthouse | Speed & CWV | `manual` | Free | Performance, Technical, On-Page | Verified |
| `crux` | Chrome UX Report (CrUX) | Speed & CWV | `api` | Free | Performance | Verified |
| `google-rich-results-test` | Google Rich Results Test | Structured Data | `api` / `manual` | Free | Technical, On-Page | Verified |
| `schema-markup-validator` | Schema Markup Validator | Structured Data | `manual` | Free | Technical, On-Page | Verified |
| `semrush` | Semrush | Keywords & Backlinks | `export` | Paid | Content, On-Page, Links, Local | Verified |
| `ahrefs` | Ahrefs | Keywords & Backlinks | `export` | Paid | Links, Content, Technical | Verified |
| `ubersuggest` | Ubersuggest | Keywords & Backlinks | `export` | Freemium | Content, On-Page, Links | Verified |
| `google-keyword-planner` | Google Keyword Planner | Keywords & Backlinks | `export` | Freemium | Content, On-Page, Local | Verified |
| `gsc-url-inspection` | GSC URL Inspection | Indexation & Rendering | `api` / `manual` | Free | Indexation, Technical | Verified |
| `robots-sitemap-validator` | Robots.txt & Sitemap Checker | Indexation & Rendering | `api` (script) | Free | Indexation, Technical | Verified |
| `dom-diff-renderer` | View-Source vs Rendered DOM | Indexation & Rendering | `manual` | Free | Technical, On-Page | Verified |
| `chatgpt-search` | ChatGPT Search Visibility Check | AI / GEO Search | `manual` | Freemium | GEO/AI Search, Content | Verified |
| `perplexity-search` | Perplexity AI Visibility Check | AI / GEO Search | `manual` | Freemium | GEO/AI Search, Content | Verified |
| `google-ai-overviews` | Google AI Overviews Visibility | AI / GEO Search | `manual` | Free | GEO/AI Search, Content | Verified |

---

## 5. How to Add a New Tool to the Registry

To register a new tool, maintainers must add a strictly formatted JSON object to [seo-tool-registry.json](seo-tool-registry.json) adhering to this schema:

```json
{
  "id": "kebab-case-unique-identifier",
  "name": "Full Tool Name",
  "category": "search-performance | analytics | crawlers | speed-cwv | structured-data | keywords-backlinks | indexation-rendering | ai-search-visibility",
  "purpose": "Precise one-sentence description of what this tool audits.",
  "access_method": "connected | export | manual | api",
  "cost_model": "free | freemium | paid",
  "inputs_required": ["Array of required prerequisites, credentials, or file inputs"],
  "outputs": ["Array of specific metrics, tables, or artifacts produced"],
  "audit_stages": ["Array of served stages from: indexation, technical, on-page, content, links, local, performance, geo-ai-search"],
  "known_limits": "Explicit technical limitations, rate limits, latency, or sampling rules.",
  "how_to_verify_output": "Exact procedure to confirm that tool output is authentic and accurate.",
  "official_doc_url": "https://official-documentation-url-verified-via-web-search",
  "last_verified": "YYYY-MM-DD",
  "confidence": "verified | unverified"
}
```

### Verification Criteria Before Adding:
1. **Search Verification:** The `official_doc_url` must be verified via web search before committing. If documentation cannot be verified, set `"confidence": "unverified"`.
2. **Pricing Accuracy:** Do not guess pricing. Categorize strictly as `free`, `freemium` (free tier with limits), or `paid` (subscription required).
3. **No Redundancy:** Confirm the tool provides distinct capabilities not already covered by default free tools before adding.
