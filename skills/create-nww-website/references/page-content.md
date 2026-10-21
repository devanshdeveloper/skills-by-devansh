# Page Content & Asset Catalog Specification

Stage 6 authors the complete, verbatim copywriting for every page and shared unit, and catalogs all required media assets in structured tables.

---

## File Deliverable Locations

Deliverables are saved into the `page-specs/` directory:
1. **Shared Units:**
   - Text units: `page-specs/_shared/<component-slug>.md` (e.g., `shared-nav.md`, `shared-footer.md`, `site-settings.md`).
   - Shared brand assets: `page-specs/_shared/brand-assets.md`.
2. **Per-Page Units:**
   - Page copy: `page-specs/<slug>/content.md`.
   - Page assets: `page-specs/<slug>/assets.md`.
3. **Client Asset Requests:**
   - Regenerated client-facing tracker: `project-docs/asset-requests.md`.

*Content File Size Limit:* Keep all content files **<= 500 lines**. During Stage 9 Foundation Build, static page content is transcribed verbatim into `site/content/<slug>.js` and `site/content/shared/<slug>.js`.

---

## Verbatim Copywriting Standards

1. **No Unmarked Placeholders:** Never use "Lorem ipsum", "Headline text goes here", or bracketed filler. All copy must be drafted as realistic, production-ready prose matching the brand voice established in `design-theory.md`.
2. **Dev Visual Outline Attribute (`data-placeholder="true"`):**
   - Every `drafted-placeholder` or `needs-client-input` **TEXT block** must render in component markup with the attribute `data-placeholder="true"`.
   - In non-production builds, a global dev-only CSS rule outlines elements with this attribute so human reviewers can instantly identify unconfirmed copy during preview:
     ```css
     [data-placeholder="true"] {
       outline: 2px dashed #f59e0b;
     }
     ```
3. **Legal Text Discipline:**
   - Final legal agreements (Privacy Policy, Terms of Service) must be provided by the client.
   - The agent drafts only a clearly labeled skeleton marked `needs-client-input`, never invented legal prose.
4. **Copy Must Fit Layout:**
   - Headlines and body text must respect the character caps and item counts defined in the section's `Content capacity` from `layout.md`.

---

## Content File Schema (`page-specs/<slug>/content.md`)

Each `content.md` file contains two primary sections:

### 1. SEO & Metadata Block (Maps to Next.js Metadata API)
```yaml
seo:
  title: "Modern Web Development & Digital Engineering"
  description: "Scale your digital footprint with high-performance Next.js web applications."
  canonical: "/services"
  robots: "index, follow"
  primaryKeyword: "web development agency"
  h1: "High-Performance Web Engineering for Modern Brands"
  openGraph:
    title: "Modern Web Development & Digital Engineering"
    description: "Scale your digital footprint with high-performance Next.js web applications."
    image: "/assets/services-og.webp"
    imageAlt: "Digital engineering showcase"
  jsonLd:
    type: "Service"
    name: "Web Engineering"
    provider: "Brand Name"
  internalLinks:
    - anchor: "explore our design philosophy"
      target: "/about"
    - anchor: "schedule a consultation"
      target: "/contact"
```

### 2. Per-Section Content Blocks
One block per section ID from `layout.md`, in order:
```markdown
## Section: `services-s1-hero`
- Status: `agency-created`
- Headline: "High-Performance Web Engineering for Modern Brands"
- Subhead: "We design, build, and deploy high-converting Next.js websites tailored to enterprise speed and aesthetic excellence."
- Primary CTA: "Schedule a Discovery Call" -> destination: `/contact`
- Secondary CTA: "Explore Case Studies" -> destination: `/case-studies`
- Media Slot: `services-s1-hero-01`
  - Alt text: "Developer analyzing responsive application metrics on a modern monitor"

## Section: `services-s2-capabilities`
- Status: `client-provided`
- Eyebrow: "What We Build"
- Title: "Engineered for Speed, Scalability, and Search Dominance"
- Capabilities List:
  - Item 1:
    - Title: "Next.js App Router Architecture"
    - Body: "Leveraging React Server Components for near-instant first contentful paint."
  - Item 2:
    - Title: "Headless CMS Integration"
    - Body: "Seamless publishing workflows powered by NWW CMS with on-demand ISR revalidation."
```

---

## Asset Catalog Schema (`page-specs/<slug>/assets.md`)

Every media item is cataloged in a structured table:

| Asset ID | Section ID | Role | Description | Aspect Ratio | Display Sizes | Min Pixels | Format | Weight Budget | Alt Reference | Status Tag | Rights | Source Path | Final Path | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `srv-s1-hero` | `services-s1-hero` | `LCP candidate` | Modern workspace with code editor | `--ratio-hero` | `100vw / 60vw` | 1920x1080 | WebP | <= 100 KB | Hero media slot | `placeholder` | `n/a` | `assets-source/hero.png` | `site/public/assets/srv-hero.webp` | `true` |
| `srv-s2-icon-1` | `services-s2-capabilities` | `icon` | Code branch vector icon | `--ratio-square` | `24x24` | 24x24 | Lucide | <= 2 KB | Capability 1 | `agency-created` | `confirmed` | `n/a` | `Lucide:GitBranch` | `false` |

### The 8-Tag Status Taxonomy
1. `client-provided`: Asset supplied directly by the client with confirmed commercial usage rights.
2. `agency-created`: Asset created in-house (graphics, charts, icons, layouts).
3. `stock-licensed`: Commercial stock photography/illustration with source and licence verified. Follow [stock-image-sourcing.md](stock-image-sourcing.md) for approved providers (Pixabay, Pexels, Unsplash), query rules, and provenance manifest requirements.
4. `ai-generated`: Synthesized imagery requiring recorded written client sign-off.
5. `placeholder`: Neutral generated placeholder image with visible dimensions and ratio label.
6. `drafted-placeholder`: Realistic copy drafted for review; requires `data-placeholder="true"`.
7. `needs-client-input`: Real facts, pricing, legal text, or proprietary assets that cannot be fabricated.
8. `cms-hosted`: Image hosted dynamically on NWW CMS media storage (needs no local source file).

---

## Gate 6 Review Checklist

- [ ] Shared content units (`page-specs/_shared/*.md`) approved at **Gate 6 (Shared)**.
- [ ] Per-page content and asset catalog approved at **Gate 6 (Page)**.
- [ ] Every draft text block carries `data-placeholder="true"`.
- [ ] Legal pages contain only labeled skeletons marked `needs-client-input`.
- [ ] Assets cataloged in `assets.md` tables with weight budgets and rights tracking.
- [ ] Stock photography (if approved) follows [stock-image-sourcing.md](stock-image-sourcing.md) with complete `project-docs/stock-provenance.json` and hard exclusions honored.
- [ ] Client-facing tracker `project-docs/asset-requests.md` regenerated.

