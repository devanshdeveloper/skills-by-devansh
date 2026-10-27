# Batch 04: Asset Harvesting, Inventory & Generation System

**Batch Code:** `batch-04-asset-harvesting-generation`  
**Stage:** Stage 0 Intake Check (Gate 0)  
**Deliverable:** Recorded into `client-context/answers/batch-04-asset-harvesting-generation/answers.md` and `client-context/asset-manifest.md`  

---

## 1. Overview & Multi-Source Asset Audit Protocol

Visual assets are the foundation of modern, award-winning web design. Websites fail aesthetic standards when assets are low-resolution, mismatched, or treated as an afterthought.

Before presenting this batch, the agent executes an **Asset Resource Audit**:
1. **Old Website Scan (`previous-site/`):**
   - If a legacy site crawl was executed, inspect all harvested assets preserved in their source paths across `previous-site/` (or read `previous-site/manifest.json`).
   - Catalog total image count, file types (`.png`, `.jpg`, `.svg`, `.webp`), dimensions, and source locations. The previous site is a complete offline mirror with assets located in their original source paths.
2. **Local Repository & Context Files:**
   - Check `client-context/assets/`, `client-context/raw/`, and `public/` for client-uploaded files.
3. **Present Discovered Resources to Client:**
   - Begin this turn by reporting exact discovered resources:
     *"We completed the asset audit. Discovered: [N] legacy site images, [X] client logos across `previous-site/` and `client-context/`. Let's establish which assets we reuse, which we request for each product/project, and which we source or generate."*

---

## 2. Part A: Previous Website Asset Harvesting

*(If `build_origin: migration` or legacy website URL is provided; otherwise skip to Part B)*

### Q22a [Legacy Asset Harvesting & Reuse Permission]
- **Question:** We extracted assets from your previous website (logos, product photos, case study visuals, team headshots, PDF brochures). Which specific assets are approved to be carried forward into the new website?
- **Answer Type:** Choice / Asset list
- **Allowed Options:**
  - `reuse-all-high-res`: Reuse all legacy assets that meet high-resolution quality standards.
  - `selective-reuse`: Reuse only specifically approved categories (e.g., product photos only; replace team headshots and branding).
  - `fresh-assets-only`: Do not reuse legacy imagery; source/generate 100% fresh assets.
- **Required:** Conditional on Migration
- **Default:** `selective-reuse`

### Q22b [Asset Quality & Retina Resolution Audit]
- **Question:** Legacy websites often contain compressed or low-resolution images (under 1200px width). Do you have original high-resolution master files (uncompressed RAW/JPEG/PNG or vectors), or should the agency audit and upscale/replace sub-par legacy images?
- **Answer Type:** Choice
- **Allowed Options:** `client-will-provide-masters`, `agency-audit-and-replace`
- **Required:** Conditional on Migration
- **Default:** `agency-audit-and-replace`
- **Rule:** Any image below 1200px width intended for desktop layout must be flagged as `needs-replacement` in `client-context/asset-manifest.md`.

### Q22c [Obsolete Assets & Do-Not-Carry List]
- **Question:** Are there specific assets from the old site that are obsolete, discontinued, or strictly forbidden from appearing on the new site (e.g., former employees, discontinued products, retired partner logos)?
- **Answer Type:** Free text / List
- **Required:** Conditional on Migration
- **Default:** `None specified`

---

## 3. Part B: Per-Entity Asset Collection (Each Product, Project & Team Member)

Every entity showcased on the website requires dedicated, high-resolution visual assets. The agent systematically queries the client based on website scope:

### Q23a [Per-Product Asset Inventory (E-Commerce / Catalog Builds)]
- **Question:** For **each product** to be featured on the site, do you have:
  1. High-resolution hero cutout with transparent background (PNG/WebP, minimum 1500x1500px)?
  2. Multi-angle gallery photos (front, back, in-use / lifestyle)?
  3. Packaging shots or dimension / CAD diagrams?
  4. Downloadable user manuals, spec sheets, or safety data sheets (PDF)?
- **Answer Type:** Asset checklist / Links / Confirmation
- **Required:** Conditional on E-commerce or Product site
- **Default:** `Client to upload to client-context/assets/products/`

### Q23b [Per-Project / Case Study Asset Inventory (Portfolio / Agency Builds)]
- **Question:** For **each portfolio project or case study** to be showcased, do you have:
  1. Flagship hero mockup or high-res project photo (minimum 1920x1080px)?
  2. 3–5 gallery screenshots or deliverable visuals showcasing the work in detail?
  3. Client company logo (vector SVG or high-res monochrome PNG)?
  4. Before-and-after visual comparisons (if redesign or transformation project)?
- **Answer Type:** Asset checklist / Links / Confirmation
- **Required:** Conditional on Portfolio or Agency site
- **Default:** `Client to upload to client-context/assets/projects/`

### Q23c [Per-Service Asset Inventory (Corporate & Service Builds)]
- **Question:** For **each service or solution vertical**, do you have:
  1. Contextual photography depicting the service in action or facility photos?
  2. Custom architectural diagram or process flow infographic?
  3. Downloadable capability statements or one-sheeter brochures (PDF)?
- **Answer Type:** Asset checklist / Links / Confirmation
- **Required:** Conditional on Service / Corporate site
- **Default:** `Agency to source high-tier licensed stock and construct custom vector diagrams`

### Q23d [Per-Team Member Leadership Assets]
- **Question:** For **each executive or team member** to appear on the site, do you have:
  1. Professional high-resolution headshot (minimum 800x800px, consistent lighting and aspect ratio)?
  2. Official title, bio, and LinkedIn profile URL?
- **Answer Type:** Asset checklist / Links / Confirmation
- **Required:** Optional (if Team section is included)
- **Default:** `client-ready headshots` or `omit team photos until shoot completed`

---

## 4. Part C: Sourcing, Stock Authorization & Generation Strategy

### Q24a [Primary Imagery Strategy]
- **Question:** What is the overarching imagery sourcing strategy for slots not supplied by you?
  - `client-photos`: 100% real client-supplied photography only.
  - `stock-licensed` *(Default)*: High-tier licensed stock photography from Pixabay, Pexels, and Unsplash.
  - `hybrid`: Client provides core products/projects; agency sources atmospheric background and industry stock.
  - `photoshoot-planned`: Placeholder imagery now, client will replace with scheduled photoshoot.
- **Answer Type:** Choice
- **Required:** Yes
- **Default:** `hybrid`

### Q24b [Stock Photography Authorization & Attribution]
- **Question:** If licensed stock photography is used:
  1. Do you authorize sourcing from approved providers (Pixabay, Pexels, Unsplash), with images downloaded and optimized locally on your server?
  2. Do you acknowledge that photographer attribution will appear on the site (on a dedicated `/credits` page)?
- **Answer Type:** Yes / No confirmation
- **Allowed Options:** `yes`, `no`
- **Required:** Yes
- **Default:** `yes`

### Q24c [Stock Image Ceiling Count]
- **Question:** What is the maximum stock image count ceiling for this project?
- **Answer Type:** Number
- **Required:** Yes
- **Default:** `20` (More than 20 images requires explicit justification and client sign-off)
- **Downstream Consumers:** Enforced by companion utility `skills/create-nww-website/scripts/stock-fetch/index.js`

### Q24d [Custom Graphics, Icons & AI Image Generation]
- **Question:** How should technical graphics, feature icons, and abstract backgrounds be generated?
  - `lucide-icons`: Clean, lightweight vector icons from Lucide React.
  - `bespoke-vectors`: Custom SVG illustrations and process diagrams created for the brand.
  - `ai-generation`: Prompt-engineered high-resolution marketing visuals and abstract 3D textures.
- **Answer Type:** Choice / List
- **Required:** Yes
- **Default:** `lucide-icons + bespoke-vectors`

---

## 5. Deliverable Schema: `client-context/asset-manifest.md`

All asset decisions and inventories must be compiled into `client-context/asset-manifest.md`:

```markdown
# Asset Manifest & Visual Resource Inventory

**Project:** [Project Name / Slug]  
**Last Audited:** YYYY-MM-DD  
**Stock Image Ceiling:** [e.g. 20]  
**Stock Images Allocated:** [Count]  

## 1. Discovered & Harvested Legacy Assets (from previous-site/)
| Asset ID | File Name / Path | Original Dimensions | Approved for Reuse? | Quality Status | Notes / Target Route |
|---|---|---|:---:|---|---|
| `leg-01` | `logo-legacy.png` | 400x120 | No | Outdated resolution; replaced by vector SVG | Header / Footer |
| `leg-02` | `product-hero.jpg` | 2400x1600 | Yes | High-res; run through assets-optimizer | `/products/flagship` |

## 2. Per-Entity Asset Inventory
### Products / Projects / Services
| Entity Name | Asset Slot | Required Resolution | Provided by Client? | Current Source | Status |
|---|---|---|:---:|---|---|
| [Product 1] | Hero Cutout | 1500x1500px transparent | Yes | `client-context/assets/p1.png` | Ready |
| [Product 1] | Lifestyle Context | 1920x1080px | No | Sourced Stock (Unsplash) | Pending Download |
| [Project A] | Case Study Hero | 1920x1080px | Yes | `client-context/assets/proj-a.jpg` | Ready |
| [Leadership] | CEO Headshot | 800x800px | Yes | `client-context/assets/ceo.jpg` | Ready |

## 3. Pipeline Triage Summary
- **Client-Provided Assets:** [Count]
- **Legacy Harvested Assets (Approved):** [Count]
- **Licensed Stock Images Allocated:** [Count / Ceiling]
- **Custom Generated Graphics / Icons:** [Count]
- **Open / Missing Asset Action Items:** [List of pending files]
```

---

## 6. Confirmation Stage 0.4

After receiving responses to Batch 04:

1. **Acknowledge and Echo:**
   Output an Asset Readiness Recap:
   ```markdown
   ### Batch 04 Asset Generation & Harvesting Confirmation
   - Legacy Assets Harvested: [X] approved for reuse, [Y] retired
   - Per-Entity Assets Cataloged: [Products / Projects count documented]
   - Primary Imagery Strategy: [Strategy]
   - Stock Photography Authorized: [Yes/No] (Ceiling: [N] images, /credits page approved)
   - Asset Manifest Generated: `client-context/asset-manifest.md`
   - Pending Asset Action Items: [List any missing items client must provide]
   ```
2. **Explicit User Approval Prompt:**
   > *"Please review the asset manifest and sourcing strategy above. Once confirmed, we will advance to Batch 05 (Type-Specific Architectural Deep Dive)."*
3. **Persist State:**
   Write confirmed answers into `client-context/answers/batch-04-asset-harvesting-generation/answers.md` and output `client-context/asset-manifest.md`.
